'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastItem extends ToastOptions {
  id: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const TOAST_DURATION_MS = 3500;

const variantStyles: Record<
  ToastVariant,
  {
    border: string;
    iconBg: string;
    iconColor: string;
    Icon: React.ComponentType<{ className?: string }>;
  }
> = {
  success: {
    border: 'border-emerald-200',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    Icon: CheckCircle2,
  },
  error: {
    border: 'border-rose-200',
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    Icon: AlertCircle,
  },
  info: {
    border: 'border-slate-200',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-700',
    Icon: Info,
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, variant = 'info' }: ToastOptions) => {
      const id =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      setToasts((prev) => [...prev, { id, title, description, variant }]);

      const timer = setTimeout(() => {
        dismiss(id);
      }, TOAST_DURATION_MS);

      timersRef.current.set(id, timer);
    },
    [dismiss]
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }
      timers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed bottom-24 lg:bottom-6 right-4 z-50 flex flex-col gap-2.5 w-[calc(100vw-2rem)] max-w-sm"
      >
        <AnimatePresence initial={false}>
          {toasts.map((item) => {
            const style = variantStyles[item.variant];
            const Icon = style.Icon;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.96 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className={`pointer-events-auto flex items-start gap-3 rounded-xl border bg-white p-3.5 shadow-lg shadow-slate-900/5 ${style.border}`}
              >
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${style.iconBg} ${style.iconColor}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 leading-snug">
                    {item.title}
                  </p>
                  {item.description ? (
                    <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(item.id)}
                  aria-label="Dismiss notification"
                  className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
