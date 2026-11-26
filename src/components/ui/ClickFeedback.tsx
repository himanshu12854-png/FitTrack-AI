'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface ClickBurst {
  id: number;
  x: number;
  y: number;
}

export default function ClickFeedback() {
  const [bursts, setBursts] = useState<ClickBurst[]>([]);

  useEffect(() => {
    let counter = 0;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest('button, a, [role="button"], input[type="submit"], select');
      if (!interactive) return;

      const id = ++counter;
      setBursts((prev) => [...prev.slice(-5), { id, x: e.clientX, y: e.clientY }]);

      setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== id));
      }, 500);
    };

    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden" aria-hidden="true">
      <AnimatePresence>
        {bursts.map((burst) => (
          <motion.span
            key={burst.id}
            initial={{ opacity: 0.55, scale: 0.25 }}
            animate={{ opacity: 0, scale: 2.1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.42, ease: 'easeOut' }}
            style={{
              left: burst.x - 18,
              top: burst.y - 18,
              width: 36,
              height: 36,
            }}
            className="absolute rounded-full border-2 border-emerald-500/70 bg-emerald-400/15"
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
