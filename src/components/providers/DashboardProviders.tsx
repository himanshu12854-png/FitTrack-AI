'use client';

import { ToastProvider } from '@/components/ui/Toast';
import { MilestoneProvider } from '@/components/ui/MilestoneCelebration';

export default function DashboardProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <MilestoneProvider>{children}</MilestoneProvider>
    </ToastProvider>
  );
}
