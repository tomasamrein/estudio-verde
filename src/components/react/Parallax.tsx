// Parallax liviano, adaptado del patrón de scroll de reactbits.dev usando motion (useScroll, sin listeners manuales).
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef, type ReactNode } from 'react';

export default function Parallax({ children, offset = 36 }: { children?: ReactNode; offset?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden">
      <motion.div
        style={{ y: reduce ? 0 : y }}
        className="absolute inset-x-0 -top-[8%] h-[116%] [&_img]:h-full [&_img]:w-full [&_img]:object-cover"
      >
        {children}
      </motion.div>
    </div>
  );
}
