import { getTodayDate } from '@/lib/utils';
import { setCached } from '@/lib/client-cache';

let lastPrefetchAt = 0;

/**
 * Prefetches secondary dashboard routes in the background after the initial
 * dashboard load completes, so switching to Calories, Workouts, Session,
 * Progress, Profile, or AI Assistant feels instantaneous.
 */
export function prefetchAllDashboardData() {
  if (typeof window === 'undefined') return;

  const now = Date.now();
  if (now - lastPrefetchAt < 60_000) return;
  lastPrefetchAt = now;

  const run = async () => {
    const today = getTodayDate();

    const tasks: Array<Promise<void>> = [
      fetch(`/api/diet?date=${today}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => {
          if (j?.success && j.data) setCached(`diet-${today}`, j.data);
        })
        .catch(() => {}),

      fetch('/api/workouts/plan')
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => {
          if (j?.success && j.data) setCached('workout-plan', j.data);
        })
        .catch(() => {}),

      fetch(`/api/workouts/session?date=${today}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => {
          if (j?.success) setCached(`workout-session-${today}`, j.data);
        })
        .catch(() => {}),

      fetch('/api/workouts/history?exercise=Barbell%20Bench%20Press')
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => {
          if (j?.success && j.data) setCached('workout-history-Barbell Bench Press', j.data);
        })
        .catch(() => {}),

      fetch('/api/user/profile')
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => {
          if (j?.success && j.data?.profile) setCached('user-profile', j.data.profile);
        })
        .catch(() => {}),

      fetch('/api/ai/chat')
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => {
          if (j?.success && j.data) setCached('ai-chat-list', j.data);
        })
        .catch(() => {}),
    ];

    await Promise.allSettled(tasks);
  };

  if ('requestIdleCallback' in window) {
    (window as Window & { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback(
      () => {
        void run();
      }
    );
  } else {
    setTimeout(() => {
      void run();
    }, 150);
  }
}
