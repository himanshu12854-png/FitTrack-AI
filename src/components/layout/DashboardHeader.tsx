'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, PlusCircle, Activity, Sparkles } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { formatDate } from '@/lib/utils';

export default function DashboardHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const getPageTitle = () => {
    switch (pathname) {
      case '/dashboard':
        return 'Overview Dashboard';
      case '/dashboard/calories':
        return 'Calorie & Diet Log';
      case '/dashboard/workouts':
        return 'Workout Routine Split';
      case '/dashboard/workout-session':
        return 'Live Workout Session';
      case '/dashboard/progress':
        return 'Performance Analytics';
      case '/dashboard/ai-assistant':
        return 'AI Coach & Plan Builder';
      case '/dashboard/profile':
        return 'Fitness Profile & Targets';
      case '/dashboard/settings':
        return 'Account Settings';
      default:
        return 'Dashboard';
    }
  };

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Calories', href: '/dashboard/calories' },
    { name: 'Workouts', href: '/dashboard/workouts' },
    { name: 'Active Session', href: '/dashboard/workout-session' },
    { name: 'Progress', href: '/dashboard/progress' },
    { name: 'AI Coach', href: '/dashboard/ai-assistant' },
    { name: 'Profile', href: '/dashboard/profile' },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
            {getPageTitle()}
          </h1>
          <p className="text-xs text-slate-400 mt-1 hidden sm:block">
            {formatDate(new Date())}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/dashboard/ai-assistant"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition border border-emerald-200"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Ask AI Coach</span>
        </Link>
        <Link
          href="/dashboard/calories"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition shadow-xs"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Log Food</span>
        </Link>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 bg-white border-b border-slate-200 shadow-xl p-4 space-y-1 z-50">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                pathname === link.href
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
