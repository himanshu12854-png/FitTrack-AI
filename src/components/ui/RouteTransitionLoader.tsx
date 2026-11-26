'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity } from 'lucide-react';

function RouteTransitionObserver({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentRouteKey = `${pathname}?${searchParams?.toString() || ''}`;

  // Clear loader whenever the route completes changing
  useEffect(() => {
    setIsNavigating(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [currentRouteKey]);

  // Listen for clicks on internal links to trigger fade + loader immediately
  useEffect(() => {
    const startLoader = () => {
      setIsNavigating(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIsNavigating(false);
      }, 6000);
    };

    const handleClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || !href.startsWith('/') || anchor.target === '_blank' || anchor.hasAttribute('download')) {
        return;
      }

      const nextUrl = new URL(href, window.location.origin);
      const currentUrl = new URL(window.location.href);
      if (nextUrl.pathname === currentUrl.pathname && nextUrl.search === currentUrl.search) {
        return;
      }

      startLoader();
    };

    window.addEventListener('click', handleClick, true);
    window.addEventListener('fittrack:route-start', startLoader);

    return () => {
      window.removeEventListener('click', handleClick, true);
      window.removeEventListener('fittrack:route-start', startLoader);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {isNavigating && (
          <>
            {/* Top animated progress bar */}
            <motion.div
              key="route-top-bar"
              initial={{ scaleX: 0.08, opacity: 1 }}
              animate={{ scaleX: 0.85, opacity: 1 }}
              exit={{ scaleX: 1, opacity: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="fixed top-0 left-0 right-0 h-[3px] z-[9998] origin-left bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            />

            {/* Subtle frosted transition overlay + spinner */}
            <motion.div
              key="route-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="fixed inset-0 z-[9990] bg-white/60 backdrop-blur-[2px] flex items-center justify-center pointer-events-none"
            >
              <motion.div
                initial={{ scale: 0.88, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border border-emerald-200/90 shadow-lg"
              >
                <div className="relative w-7 h-7 flex items-center justify-center">
                  <span className="absolute inset-0 rounded-full border-2 border-emerald-200 border-t-emerald-600 animate-spin" />
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <span className="text-xs font-bold text-slate-700 tracking-tight">
                  Loading...
                </span>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.div
        key={pathname}
        initial={{ opacity: 0.55 }}
        animate={{ opacity: isNavigating ? 0.45 : 1 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="min-h-full flex flex-col flex-1"
      >
        {children}
      </motion.div>
    </>
  );
}

export default function RouteTransitionLoader({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-full flex flex-col flex-1">{children}</div>}>
      <RouteTransitionObserver>{children}</RouteTransitionObserver>
    </Suspense>
  );
}
