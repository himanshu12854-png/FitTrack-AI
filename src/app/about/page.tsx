import { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { Activity, ShieldCheck, Heart, Sparkles, Target, Zap } from 'lucide-react';
import { constructMetadata, generateBreadcrumbSchema } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'About FitTrack AI — Mission, Team & Engineering Standards',
  description:
    'FitTrack AI was built by senior engineers and certified sports nutritionists to replace disjointed fitness apps with a unified, science-first tracking platform.',
  canonical: '/about',
});

export default function AboutPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'About', url: '/about' },
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Navbar />

      <main className="flex-1 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Our Story & Mission
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Engineering Precision for Human Physical Potential
            </h1>
            <p className="text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Fitness shouldn&apos;t require juggling five different apps for nutrition, workout logging, timers, and coaching. FitTrack AI unifies them into a single, clean, and private platform.
            </p>
          </div>

          <section className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Why We Built FitTrack AI
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Most mainstream calorie trackers are overloaded with intrusive ads, paywalled basic barcode scanners, and outdated user interfaces. Meanwhile, workout logging apps exist in complete silos, oblivious to what you ate for lunch or your current metabolic deficit.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              FitTrack AI bridges this gap. By utilizing a shared MongoDB architecture and Next.js App Router, your nutrition targets, active workout splits, live gym sessions, and AI coach all communicate seamlessly within a single ecosystem.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <Target className="w-6 h-6 text-emerald-600 mb-2" />
                <h3 className="text-sm font-bold text-slate-900">Evidence-Based</h3>
                <p className="text-xs text-slate-500 mt-1">Calculations based on validated Mifflin-St Jeor formulas and peer-reviewed hypertrophy volume thresholds.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <ShieldCheck className="w-6 h-6 text-emerald-600 mb-2" />
                <h3 className="text-sm font-bold text-slate-900">Strict Privacy</h3>
                <p className="text-xs text-slate-500 mt-1">Your health and fitness data is never sold, shared, or indexed by search engine bots.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <Zap className="w-6 h-6 text-emerald-600 mb-2" />
                <h3 className="text-sm font-bold text-slate-900">Lightweight UX</h3>
                <p className="text-xs text-slate-500 mt-1">Instant server-rendered pages and minimalist client hydration for smooth performance on any device.</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
