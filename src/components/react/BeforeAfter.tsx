// Comparador antes/después. Inspirado en el patrón de comparación de reactbits.dev, reescrito sin dependencias.
import { useEffect, useRef, useState } from 'react';

type Img = { src: string; srcset?: string; alt: string; width: number; height: number };
type Props = { before: Img; after: Img };

const EASE = 'cubic-bezier(0.23,1,0.32,1)';

export default function BeforeAfter({ before, after }: Props) {
  const [pos, setPos] = useState(50);
  const [anim, setAnim] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const touched = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timers: number[] = [];
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        if (touched.current) return;
        // Pista la primera vez: el divisor se mueve para mostrar que se puede arrastrar
        setAnim(true);
        [32, 68, 50].forEach((v, i) =>
          timers.push(window.setTimeout(() => !touched.current && setPos(v), 250 + i * 700)),
        );
        timers.push(window.setTimeout(() => setAnim(false), 250 + 3 * 700));
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  const update = (clientX: number) => {
    const r = ref.current!.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };
  const take = () => {
    touched.current = true;
    setAnim(false);
  };
  const t = anim ? `600ms ${EASE}` : undefined;

  return (
    <div
      ref={ref}
      className="relative aspect-[4/5] w-full cursor-ew-resize touch-pan-y overflow-hidden rounded-xs bg-bone select-none sm:aspect-[16/10]"
      onPointerDown={(e) => {
        take();
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        update(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && update(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      <img src={after.src} srcSet={after.srcset} sizes="(min-width: 1024px) 80vw, 100vw" alt={after.alt} width={after.width} height={after.height} loading="lazy" decoding="async" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
      <img
        src={before.src} srcSet={before.srcset} sizes="(min-width: 1024px) 80vw, 100vw" alt={before.alt} width={before.width} height={before.height} loading="lazy" decoding="async" draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)`, transition: t && `clip-path ${t}` }}
      />
      <span className="pointer-events-none absolute top-4 left-4 bg-forest px-2 py-1 text-xs font-semibold tracking-widest text-paper uppercase">Antes</span>
      <span className="pointer-events-none absolute top-4 right-4 bg-paper px-2 py-1 text-xs font-semibold tracking-widest text-forest uppercase">Después</span>
      <div
        role="slider"
        tabIndex={0}
        aria-label="Comparar antes y después"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        aria-valuetext={`${Math.round(pos)}% del antes visible`}
        onKeyDown={(e) => {
          const step = e.shiftKey ? 10 : 2;
          const map: Record<string, (p: number) => number> = {
            ArrowLeft: (p) => p - step, ArrowDown: (p) => p - step,
            ArrowRight: (p) => p + step, ArrowUp: (p) => p + step,
            Home: () => 0, End: () => 100,
          };
          const fn = map[e.key];
          if (!fn) return;
          e.preventDefault();
          take();
          setPos((p) => Math.min(100, Math.max(0, fn(p))));
        }}
        className="absolute inset-y-0 z-10 -ml-6 flex w-12 justify-center"
        style={{ left: `${pos}%`, transition: t && `left ${t}` }}
      >
        <div className="h-full w-0.5 bg-paper" />
        <div className="absolute top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-paper text-forest">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6" /></svg>
        </div>
      </div>
    </div>
  );
}
