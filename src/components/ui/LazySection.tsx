'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

interface LazySectionProps {
  children: ReactNode;
  fallback: ReactNode;
  onVisible?: () => void | Promise<void>;
  rootMargin?: string;
  className?: string;
}

/**
 * Renders a skeleton fallback until the section enters the viewport,
 * then triggers `onVisible` exactly once and renders `children`.
 */
export default function LazySection({
  children,
  fallback,
  onVisible,
  rootMargin = '120px',
  className = '',
}: LazySectionProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const triggeredRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || triggeredRef.current) return;

    if (typeof IntersectionObserver === 'undefined') {
      triggeredRef.current = true;
      setHasEntered(true);
      onVisible?.();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !triggeredRef.current) {
          triggeredRef.current = true;
          setHasEntered(true);
          onVisible?.();
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [onVisible, rootMargin]);

  return (
    <div ref={containerRef} className={className}>
      {hasEntered ? children : fallback}
    </div>
  );
}
