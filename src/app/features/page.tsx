import { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import {
  Flame,
  Dumbbell,
  Sparkles,
  Shield,
  Zap,
  BarChart2,
  Calendar,
  Lock,
  ArrowRight,
  Database,
  Smartphone,
  Layers,
} from 'lucide-react';
import { constructMetadata, generateBreadcrumbSchema } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Features & Architecture — Calorie, Gym & AI System',
  description:
    'Explore the full suite of FitTrack AI features: dynamic calorie logging, custom gym workout splits, progressive overload analytics, and secure Gemini AI coaching.',
  canonical: '/features',
});

export default function FeaturesPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Features', url: '/features' },
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Navbar />

      <main className="flex-1 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Platform Overview
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-4">
              Designed for Serious Fitness Progress
            </h1>
            <p className="mt-4 text-base text-slate-600 leading-relaxed">
              Every component in FitTrack AI is engineered for precision, speed, and privacy. From daily macro calculations to intelligent workout splits.
            </p>
          </div>

          {/* Detailed Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Flame,
                title: 'Daily Calorie & Macro Engine',
                desc: 'Organize meals into Breakfast, Lunch, Dinner, and Snacks. Automatically computes remaining calories, protein, carbs, and fats in real-time.',
              },
              {
                icon: Calendar,
                title: 'Timezone-Aware Daily Reset',
                desc: 'When midnight strikes in your local timezone, a fresh daily log is automatically prepared while preserving your complete historical log archive in MongoDB.',
              },
              {
                icon: Dumbbell,
                title: 'Custom Workout Splits',
                desc: 'Build Push-Pull-Legs, Upper-Lower, Full-Body, or custom bro splits with custom exercise selections, target set/rep ranges, and rest intervals.',
              },
              {
                icon: Zap,
                title: 'Live Workout Session Logger',
                desc: 'Check off sets in the gym, input actual weights and completed reps, and utilize our built-in rest interval timer between sets.',
              },
              {
                icon: BarChart2,
                title: 'Progressive Overload Analytics',
                desc: 'Track personal records (PRs), volume progression curves, and exercise history using responsive Recharts visualizations.',
              },
              {
                icon: Sparkles,
                title: 'Gemini AI Fitness Coach',
                desc: 'Discuss plateaus and nutrition questions with our AI assistant, which accesses your active workout splits and logged meals through secure backend routes.',
              },
              {
                icon: Layers,
                title: 'Interactive Plan Approval Workflow',
                desc: 'AI generates proposed plans in structured JSON. Review, customize, and approve them before they replace your active schedule.',
              },
              {
                icon: Lock,
                title: 'Encrypted & Scoped Security',
                desc: 'All queries are strictly scoped to your authenticated session ID. Passwords are hashed with salted bcrypt, and API keys are never leaked to the client.',
              },
              {
                icon: Smartphone,
                title: 'Mobile-First Lightweight SaaS',
                desc: 'Zero unnecessary heavy 3D assets or battery-draining libraries. Optimized for rapid loading, high Core Web Vitals, and smooth mobile usability.',
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>

          {/* CTA Banner */}
          <div className="mt-20 bg-slate-900 rounded-3xl p-8 sm:p-12 text-center text-white">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Ready to experience modern fitness tracking?
            </h2>
            <p className="mt-3 text-slate-400 text-sm max-w-xl mx-auto">
              Create your account in under a minute and start tracking your nutrition and gym progression today.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
