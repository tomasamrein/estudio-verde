// Galería de proyectos.
// Escritorio: sección fija (position: sticky) con una pista horizontal que se traslada con useScroll/useTransform
// de motion (sin listeners de scroll). Cada tarjeta tiene su propia velocidad de parallax, así parecen flotar.
// Móvil y reduced motion: carrusel nativo con scroll-snap y botones circulares.
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import SpecularButton from './SpecularButton';

export type GalleryItem = { title: string; kind: string; src: string; srcset: string; alt: string; width: number; height: number };

// Tamaños y desfasajes variados para la pista de escritorio
const shapes = [
  { w: 'w-[34vw]', a: 'aspect-[4/3]', mt: 'mt-0', speed: 30 },
  { w: 'w-[22vw]', a: 'aspect-[3/4]', mt: 'mt-[14vh]', speed: -50 },
  { w: 'w-[28vw]', a: 'aspect-square', mt: 'mt-[4vh]', speed: 60 },
  { w: 'w-[36vw]', a: 'aspect-[16/10]', mt: 'mt-[18vh]', speed: -30 },
  { w: 'w-[24vw]', a: 'aspect-[4/5]', mt: 'mt-0', speed: 45 },
  { w: 'w-[30vw]', a: 'aspect-[4/3]', mt: 'mt-[10vh]', speed: -40 },
];

function Img({ it, sizes }: { it: GalleryItem; sizes: string }) {
  return <img src={it.src} srcSet={it.srcset} sizes={sizes} alt={it.alt} width={it.width} height={it.height} loading="lazy" decoding="async" draggable={false} className="h-full w-full object-cover" />;
}

function Caption({ it }: { it: GalleryItem }) {
  return (
    <figcaption className="mt-3 flex items-baseline justify-between gap-4 border-b border-forest/15 pb-3">
      <span className="font-display text-xl">{it.title}</span>
      <span className="font-mono text-[11px] font-medium tracking-[0.18em] text-olive uppercase">{it.kind}</span>
    </figcaption>
  );
}

function FloatCard({ it, i, progress }: { it: GalleryItem; i: number; progress: MotionValue<number> }) {
  const s = shapes[i % shapes.length];
  const y = useTransform(progress, [0, 1], [s.speed, -s.speed]);
  return (
    <motion.figure style={{ y }} className={`${s.w} ${s.mt} shrink-0`}>
      <div className={`${s.a} overflow-hidden rounded-xs bg-bone`}><Img it={it} sizes="36vw" /></div>
      <Caption it={it} />
    </motion.figure>
  );
}

function Pinned({ items }: { items: GalleryItem[] }) {
  const outer = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  const { scrollYProgress } = useScroll({ target: outer, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist]);

  useLayoutEffect(() => {
    const measure = () => track.current && setDist(Math.max(0, track.current.scrollWidth - window.innerWidth));
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={outer} style={{ height: `calc(100vh + ${dist}px)` }} className="relative">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div ref={track} style={{ x }} className="flex items-start gap-[5vw] pr-[8vw] pl-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))]">
          {items.map((it, i) => <FloatCard key={it.title} it={it} i={i} progress={scrollYProgress} />)}
        </motion.div>
      </div>
    </div>
  );
}

function Swipe({ items }: { items: GalleryItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const nudge = (dir: number) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector('figure');
    el.scrollBy({ left: dir * ((card?.clientWidth ?? 300) + 16), behavior: 'smooth' });
  };
  return (
    <div className="mx-auto max-w-7xl">
      <div ref={ref} className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-4 [scrollbar-width:none] sm:scroll-px-6 sm:px-6 lg:scroll-px-10 lg:px-10">
        {items.map((it) => (
          <figure key={it.title} className="w-[82vw] max-w-md shrink-0 snap-start">
            <div className="aspect-[4/5] overflow-hidden rounded-xs bg-bone"><Img it={it} sizes="82vw" /></div>
            <Caption it={it} />
          </figure>
        ))}
      </div>
      <div className="mt-4 flex justify-end gap-3 px-4 sm:px-6 lg:px-10">
        {[
          { d: -1, l: 'Proyecto anterior', I: CaretLeftIcon },
          { d: 1, l: 'Proyecto siguiente', I: CaretRightIcon },
        ].map(({ d, l, I }) => (
          <SpecularButton key={d} aria-label={l} onClick={() => nudge(d)} variant="ghostLight" size="md" circle>
            <I size={18} className="shrink-0" aria-hidden="true" />
          </SpecularButton>
        ))}
      </div>
    </div>
  );
}

export default function ProjectsGallery({ items }: { items: GalleryItem[] }) {
  const reduce = useReducedMotion();
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const on = () => setDesktop(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return desktop && !reduce ? <Pinned items={items} /> : <Swipe items={items} />;
}
