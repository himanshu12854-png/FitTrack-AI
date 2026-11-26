'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[3px] z-[60] origin-left bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-500 shadow-[0_0_8px_rgba(16,185,129,0.45)]"
      aria-hidden="true"
    />
  );
}
