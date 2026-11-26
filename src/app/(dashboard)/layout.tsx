import { Metadata } from 'next';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import SessionProvider from '@/components/providers/SessionProvider';
import DashboardProviders from '@/components/providers/DashboardProviders';
import { constructMetadata } from '@/lib/seo';
import { auth } from '@/lib/auth';

export const metadata: Metadata = constructMetadata({
  title: 'Dashboard',
  noIndex: true, // Never index private dashboard pages
});

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <DashboardProviders>
        <div className="flex min-h-screen bg-[#fafafa]">
        {/* Sidebar on large screens */}
        <div className="hidden lg:block shrink-0">
          <DashboardSidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader />
          <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-28 lg:pb-8">
            {children}
          </main>
        </div>

        {/* Native-feeling Bottom Navigation on Mobile */}
        <MobileBottomNav />
        </div>
      </DashboardProviders>
    </SessionProvider>
  );
}
