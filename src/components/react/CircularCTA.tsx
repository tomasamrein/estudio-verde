// Botón circular con texto rotando alrededor de un ícono.
// Combina dos patrones de reactbits.dev: "CircularText" (anillo de texto que gira) y "Magnet"
// (el botón sigue al puntero con un resorte). Reescritos con motion.
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { WhatsappLogoIcon } from '@phosphor-icons/react';
import { useEffect, useId, useRef, useState } from 'react';

type Props = {
  href: string;
  label: string;
  text?: string;
  size?: number;
  tone?: 'terra' | 'paper' | 'forest';
  external?: boolean;
  ring?: string;
};

const tones = {
  terra: { bg: '#b4583a', fg: '#f3f1e8', ring: '#f3f1e8' },
  paper: { bg: '#f3f1e8', fg: '#1f2a1c', ring: '#f3f1e8' },
  forest: { bg: '#1f2a1c', fg: '#f3f1e8', ring: '#1f2a1c' },
};

export default function CircularCTA({ href, label, text = 'ESCRIBINOS POR WHATSAPP • ', size = 150, tone = 'terra', external = true, ring }: Props) {
  const reduce = useReducedMotion();
  const id = useId().replace(/:/g, '');
  const ref = useRef<HTMLAnchorElement>(null);
  const [magnet, setMagnet] = useState(false);
  const x = useSpring(useMotionValue(0), { stiffness: 180, damping: 16, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 180, damping: 16, mass: 0.4 });
  const c = tones[tone];
  const r = size / 2 - 10;
  const inner = size * 0.46;

  // Magnet solo en dispositivos con hover real y sin reduced motion
  useEffect(() => {
    setMagnet(window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduce);
  }, [reduce]);

  const move = (e: React.PointerEvent) => {
    if (!magnet || !ref.current) return;
    const b = ref.current.getBoundingClientRect();
    x.set((e.clientX - (b.left + b.width / 2)) * 0.3);
    y.set((e.clientY - (b.top + b.height / 2)) * 0.3);
  };
  const leave = () => { x.set(0); y.set(0); };

  return (
    <motion.a
      ref={ref}
      href={href}
      aria-label={label}
      {...(external ? { target: '_blank', rel: 'noopener' } : {})}
      onPointerMove={move}
      onPointerLeave={leave}
      whileTap={{ scale: 0.97 }}
      style={{ x, y, width: size, height: size }}
      className="relative inline-flex shrink-0 items-center justify-center rounded-full"
    >
      <motion.svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="absolute inset-0"
        aria-hidden="true"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 16, ease: 'linear', repeat: Infinity }}
      >
        <defs>
          <path id={`c${id}`} d={`M ${size / 2},${size / 2} m -${r},0 a ${r},${r} 0 1,1 ${r * 2},0 a ${r},${r} 0 1,1 -${r * 2},0`} />
        </defs>
        <text fill={ring ?? c.ring} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: size * 0.078, letterSpacing: size * 0.012, fontWeight: 600 }}>
          <textPath href={`#c${id}`} textLength={2 * Math.PI * r - 2}>{text}</textPath>
        </text>
      </motion.svg>
      <span
        className="relative flex items-center justify-center rounded-full transition-transform duration-200 [@media(hover:hover)]:hover:scale-105"
        style={{ width: inner, height: inner, background: c.bg, color: c.fg }}
      >
        <WhatsappLogoIcon size={Math.round(inner * 0.5)} weight="fill" className="shrink-0" aria-hidden="true" />
      </span>
    </motion.a>
  );
}
