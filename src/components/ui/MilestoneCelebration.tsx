'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Award, Dumbbell, Flame, Sparkles, Trophy, X } from 'lucide-react';

export type MilestoneIcon = 'flame' | 'dumbbell' | 'trophy' | 'award' | 'sparkles';

export interface MilestonePayload {
  id?: string; // Optional dedup key per day in sessionStorage
  title: string;
  subtitle: string;
  badge?: string;
  progressPercent?: number;
  icon?: MilestoneIcon;
}

interface MilestoneContextValue {
  celebrate: (payload: MilestonePayload) => void;
}

const MilestoneContext = createContext<MilestoneContextValue | undefined>(undefined);

const CONFETTI_PARTICLES = Array.from({ length: 18 }, (_, i) => {
  const angle = (i / 18) * Math.PI * 2;
  const distance = 68 + (i % 3) * 28;
  return {
    id: i,
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance - 12,
    rotate: (i % 2 === 0 ? 1 : -1) * (90 + i * 25),
    color: [
      'bg-emerald-500',
      'bg-lime-400',
      'bg-teal-400',
      'bg-amber-400',
      'bg-sky-400',
    ][i % 5],
    size: i % 3 === 0 ? 'w-2.5 h-2.5 rounded-full' : 'w-2 h-3 rounded-xs',
  };
});

export function MilestoneProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<MilestonePayload | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    setActive(null);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const celebrate = useCallback((payload: MilestonePayload) => {
    if (payload.id && typeof window !== 'undefined') {
      const todayKey = `fittrack_milestone_${new Date().toISOString().split('T')[0]}_${payload.id}`;
      if (sessionStorage.getItem(todayKey)) {
        return;
      }
      sessionStorage.setItem(todayKey, '1');
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setActive(payload);
    timerRef.current = setTimeout(() => {
      setActive(null);
      timerRef.current = null;
    }, 4500);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const renderIcon = (icon?: MilestoneIcon) => {
    switch (icon) {
      case 'flame':
        return <Flame className="w-7 h-7 text-amber-500" />;
      case 'dumbbell':
        return <Dumbbell className="w-7 h-7 text-emerald-600" />;
      case 'award':
        return <Award className="w-7 h-7 text-emerald-600" />;
      case 'sparkles':
        return <Sparkles className="w-7 h-7 text-teal-600" />;
      case 'trophy':
      default:
        return <Trophy className="w-7 h-7 text-emerald-600" />;
    }
  };

  return (
    <MilestoneContext.Provider value={{ celebrate }}>
      {children}

      <AnimatePresence>
        {active && (
          <div className="fixed inset-x-0 top-20 z-[80] flex justify-center px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: -28, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 360, damping: 24 }}
              className="pointer-events-auto relative max-w-md w-full bg-white/95 backdrop-blur-md border border-emerald-200 rounded-2xl p-4 sm:p-5 shadow-xl overflow-visible"
            >
              {/* Confetti Burst */}
              <div className="absolute left-10 top-10 pointer-events-none" aria-hidden="true">
                {CONFETTI_PARTICLES.map((p) => (
                  <motion.span
                    key={p.id}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0.4, rotate: 0 }}
                    animate={{ x: p.x, y: p.y, opacity: 0, scale: 1.1, rotate: p.rotate }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    className={`absolute ${p.size} ${p.color}`}
                  />
                ))}
              </div>

              <div className="flex items-start gap-3.5 relative z-10">
                <motion.div
                  initial={{ rotate: -18, scale: 0.5 }}
                  animate={{ rotate: [0, -8, 8, 0], scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-lime-100 border border-emerald-200 flex items-center justify-center shrink-0 shadow-xs"
                >
                  {renderIcon(active.icon)}
                </motion.div>

                <div className="flex-1 min-w-0">
                  {active.badge && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider mb-1">
                      <Sparkles className="w-3 h-3" />
                      {active.badge}
                    </span>
                  )}
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                    {active.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {active.subtitle}
                  </p>

                  {typeof active.progressPercent === 'number' && (
                    <div className="mt-2.5">
                      <div className="flex justify-between text-[10px] font-bold text-emerald-700 mb-1">
                        <span>Goal Progress</span>
                        <span>{Math.min(100, Math.round(active.progressPercent))}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, active.progressPercent)}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-lime-500 rounded-full"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={dismiss}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  aria-label="Dismiss milestone"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MilestoneContext.Provider>
  );
}

export function useMilestone() {
  const ctx = useContext(MilestoneContext);
  if (!ctx) {
    throw new Error('useMilestone must be used within MilestoneProvider');
  }
  return ctx;
}
