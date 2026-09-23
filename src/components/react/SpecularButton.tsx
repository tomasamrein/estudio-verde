// SpecularButton, portado de React Bits (https://reactbits.dev, "SpecularButton", variante JS+CSS con ogl).
// Adaptaciones para Estudio Verde:
// - Polimórfico: con `href` renderiza <a>, sin `href` un <button>.
// - Presupuesto de contextos WebGL: el renderer ogl solo existe mientras el botón está en o cerca del viewport
//   (IntersectionObserver, rootMargin 200px) y se destruye por completo al salir (RAF cancelado, contexto perdido, canvas removido).
// - Sin WebGL2, con prefers-reduced-motion o en dispositivos solo táctiles (hover: none) no hay loop:
//   el trazo base se dibuja con CSS.
// - Estilo de marca: sin vidrio ni sombra difusa, rellenos sólidos, variantes con la paleta del sitio.
import { useEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { Renderer, Program, Mesh, Triangle, Color } from 'ogl';
import './SpecularButton.css';

const PAD = 20;
const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;
const FRAG = `#version 300 es
precision highp float;
uniform vec2 uCenter;
uniform vec2 uHalfSize;
uniform float uRadius;
uniform float uAngle;
uniform float uPx;
uniform vec3 uLineColor;
uniform vec3 uBaseColor;
uniform float uIntensity;
uniform float uShineSize;
uniform float uShineFade;
uniform float uThickness;
uniform float uBaseWidth;
out vec4 fragColor;
float sdRoundedRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
float shapeSDF(vec2 p) { return sdRoundedRect(p, uHalfSize, uRadius); }
float gaussianLine(float d, float sigma) {
  float x = d / (sigma + 1e-6);
  float k = mix(1.0, 1.6, smoothstep(0.0, 1.5, x));
  return exp(-k * x * x);
}
void main() {
  vec2 p = gl_FragCoord.xy - uCenter;
  float d = shapeSDF(p);
  vec2 L = vec2(cos(uAngle), sin(uAngle));
  float base = (1.0 - smoothstep(0.0, uBaseWidth, abs(d))) * 0.45;
  vec2 nEll = normalize(p / (uHalfSize * uHalfSize) + 1e-6);
  float phi = acos(clamp(abs(dot(nEll, L)), 0.0, 1.0));
  float rim = 1.0 - smoothstep(uShineSize - uShineFade, uShineSize + uShineFade + 1e-4, phi);
  float line = gaussianLine(d, uThickness);
  float edgeClamp = 1.0 - smoothstep(0.5 * uPx, 3.0 * uPx, abs(d));
  float hi = line * rim * edgeClamp * uIntensity;
  vec3 col = uBaseColor * base + uLineColor * hi;
  float a = clamp(base + hi, 0.0, 1.0);
  fragColor = vec4(col, a);
}
`;

// Paleta del sitio (ver global.css). primary usa terra-dark #9A4830: texto papel sobre #B4583A da 4.2:1, no llega a AA.
export const variants = {
  primary: { tint: '#9A4830', tintOpacity: 1, textColor: '#F3F1E8', lineColor: '#F3F1E8', baseColor: '#8A5F3C' },
  secondary: { tint: '#1F2A1C', tintOpacity: 1, textColor: '#F3F1E8', lineColor: '#9AA58A', baseColor: '#4B5A12' },
  ghostDark: { tint: '#000000', tintOpacity: 0, textColor: '#F3F1E8', lineColor: '#F3F1E8', baseColor: '#9AA58A' },
  ghostLight: { tint: '#000000', tintOpacity: 0, textColor: '#1F2A1C', lineColor: '#B4583A', baseColor: '#4B5A12' },
} as const;
export type Variant = keyof typeof variants;

type Props = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
  children?: ReactNode;
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  circle?: boolean;
  radius?: number;
  intensity?: number;
  shineSize?: number;
  shineFade?: number;
  thickness?: number;
  speed?: number;
  followMouse?: boolean;
  proximity?: number;
  autoAnimate?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  href?: string;
  target?: string;
  rel?: string;
};

function canAnimate() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (window.matchMedia('(hover: none)').matches) return false;
  // Se prueba una sola vez por página y se libera el contexto de prueba
  if (gl2Support === undefined) {
    try {
      const ctx = document.createElement('canvas').getContext('webgl2');
      gl2Support = !!ctx;
      ctx?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      gl2Support = false;
    }
  }
  return gl2Support;
}
let gl2Support: boolean | undefined;

export default function SpecularButton({
  children, variant = 'primary', size = 'md', circle = false, radius = 999,
  intensity = 1, shineSize = 10, shineFade = 40, thickness = 1, speed = 0.35,
  followMouse = true, proximity = 200, autoAnimate = false, disabled = false,
  type = 'button', href, target, rel, className = '', style, ...rest
}: Props) {
  const btnRef = useRef<HTMLElement>(null);
  const fxRef = useRef<HTMLSpanElement>(null);
  const [live, setLive] = useState(false); // hay un contexto WebGL activo
  const v = variants[variant];
  const propsRef = useRef({ radius, lineColor: v.lineColor, baseColor: v.baseColor, intensity, shineSize, shineFade, thickness, speed, followMouse, proximity, autoAnimate });
  propsRef.current = { radius, lineColor: v.lineColor, baseColor: v.baseColor, intensity, shineSize, shineFade, thickness, speed, followMouse, proximity, autoAnimate };

  useEffect(() => {
    const btn = btnRef.current;
    const fx = fxRef.current;
    if (!btn || !fx || !canAnimate()) return;
    let dispose: (() => void) | null = null;

    const start = () => {
      const dpr = window.devicePixelRatio || 1;
      const renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: true, dpr, webgl: 2 });
      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      const geometry = new Triangle(gl);
      if (geometry.attributes.uv) delete geometry.attributes.uv;
      const program = new Program(gl, {
        vertex: VERT, fragment: FRAG,
        uniforms: {
          uCenter: { value: [0, 0] }, uHalfSize: { value: [1, 1] }, uRadius: { value: 0 }, uAngle: { value: 2.4 },
          uPx: { value: dpr }, uLineColor: { value: [1, 1, 1] }, uBaseColor: { value: [0.32, 0.32, 0.32] },
          uIntensity: { value: 1 }, uShineSize: { value: 0.17 }, uShineFade: { value: 0.7 }, uThickness: { value: 1 }, uBaseWidth: { value: dpr },
        },
      });
      const mesh = new Mesh(gl, { geometry, program });
      fx.appendChild(gl.canvas);
      const sizeRef = { w: 1, h: 1 };
      const resize = () => {
        const rect = btn.getBoundingClientRect();
        sizeRef.w = rect.width; sizeRef.h = rect.height;
        renderer.setSize(rect.width + PAD * 2, rect.height + PAD * 2);
        program.uniforms.uCenter.value = [(PAD + rect.width / 2) * dpr, (PAD + rect.height / 2) * dpr];
        program.uniforms.uHalfSize.value = [(rect.width / 2) * dpr, (rect.height / 2) * dpr];
      };
      const ro = new ResizeObserver(resize);
      ro.observe(btn);
      resize();

      let pointerAngle: number | null = null;
      let proximityT = 0;
      const onPointerMove = (e: PointerEvent) => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
        const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);
        const dist = Math.hypot(dx, dy);
        if (dist === 0) {
          const nx = (e.clientX - cx) / (rect.width / 2);
          const ny = (cy - e.clientY) / (rect.height / 2);
          pointerAngle = Math.atan2(2 / rect.height, -2 / rect.width) + nx * 0.3 + ny * 0.15;
        } else {
          pointerAngle = Math.atan2(cy - e.clientY, e.clientX - cx);
        }
        const t = Math.max(0, 1 - dist / Math.max(propsRef.current.proximity, 1));
        proximityT = t * t * (3 - 2 * t);
      };
      window.addEventListener('pointermove', onPointerMove);

      let angle = 2.4, idleAngle = 2.4, bright = 0, last = performance.now(), raf = 0;
      const lineC = new Color();
      const baseC = new Color();
      const update = (now: number) => {
        raf = requestAnimationFrame(update);
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        const p = propsRef.current;
        idleAngle += p.speed * dt;
        const steer = p.followMouse && pointerAngle != null && (!p.autoAnimate || proximityT > 0);
        const tgt = steer ? (pointerAngle as number) : idleAngle;
        const diff = ((tgt - angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        angle += diff * (1 - Math.exp(-dt * 7));
        const brightTarget = p.autoAnimate ? 1 : proximityT;
        bright += (brightTarget - bright) * (1 - Math.exp(-dt * 8));
        lineC.set(p.lineColor);
        baseC.set(p.baseColor);
        program.uniforms.uAngle.value = angle;
        program.uniforms.uRadius.value = Math.min(p.radius, Math.min(sizeRef.w, sizeRef.h) / 2) * dpr;
        program.uniforms.uLineColor.value = [lineC.r, lineC.g, lineC.b];
        program.uniforms.uBaseColor.value = [baseC.r, baseC.g, baseC.b];
        program.uniforms.uIntensity.value = p.intensity * bright;
        program.uniforms.uShineSize.value = (p.shineSize * Math.PI) / 180;
        program.uniforms.uShineFade.value = (p.shineFade * Math.PI) / 180;
        program.uniforms.uThickness.value = p.thickness * dpr;
        renderer.render({ scene: mesh });
      };
      raf = requestAnimationFrame(update);
      setLive(true);

      dispose = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        window.removeEventListener('pointermove', onPointerMove);
        if (gl.canvas.parentNode === fx) fx.removeChild(gl.canvas);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        dispose = null;
        setLive(false);
      };
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !dispose) start();
        else if (!e.isIntersecting && dispose) dispose();
      },
      { rootMargin: '200px' },
    );
    io.observe(btn);
    return () => {
      io.disconnect();
      dispose?.();
    };
  }, []);

  const cls = [
    'specular-button', `specular-button--${size}`, circle && 'specular-button--circle',
    !live && 'specular-button--static', className,
  ].filter(Boolean).join(' ');
  const vars = {
    '--sb-radius': `${radius}px`, '--sb-tint': v.tint, '--sb-tint-opacity': v.tintOpacity,
    '--sb-text-color': v.textColor, '--sb-base': v.baseColor, ...style,
  } as CSSProperties;
  const inner = (
    <>
      <span ref={fxRef} className="specular-button__fx" aria-hidden="true" />
      <span className="specular-button__label">{children}</span>
    </>
  );

  if (href) {
    return (
      <a ref={btnRef as React.Ref<HTMLAnchorElement>} href={href} target={target} rel={rel} className={cls} style={vars} {...rest}>
        {inner}
      </a>
    );
  }
  return (
    <button ref={btnRef as React.Ref<HTMLButtonElement>} type={type} disabled={disabled} className={cls} style={vars} {...rest}>
      {inner}
    </button>
  );
}
