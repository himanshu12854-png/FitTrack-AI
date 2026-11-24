import { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import {
  Dumbbell,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  Clock,
  Zap,
} from 'lucide-react';
import { constructMetadata, generateBreadcrumbSchema } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Gym Workout Planner — Design Custom Splits & Log Progressive Overload',
  description:
    'Plan customized gym routines, log live sets and weights, and track progressive overload with FitTrack AI. Explore Push-Pull-Legs, Upper-Lower, and science-backed hypertrophy splits.',
  canonical: '/workout-planner',
  keywords: [
    'gym workout planner',
    'workout split builder',
    'push pull legs routine',
    'progressive overload tracker',
    'weight progression chart',
    'hypertrophy gym log',
    'personal records tracker',
  ],
});

export default function WorkoutPlannerPublicPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Workout Planner', url: '/workout-planner' },
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
          {/* Header */}
          <div className="text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Exercise Physiology
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Science-Backed Gym Workout Planning & Logging
            </h1>
            <p className="text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Ditch unstructured gym sessions. Build customized training splits, record exact weights and sets, and track your strength progression systematically.
            </p>
            <div className="pt-2">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition shadow-xs"
              >
                <span>Build Your Workout Routine</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Section 1: Progressive Overload */}
          <section className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              The Engine of Muscle Growth: Progressive Overload
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Muscles do not adapt without a compelling biological demand. <strong>Progressive overload</strong> is the gradual increase of stress placed upon the musculoskeletal system over time. Without detailed logging of your previous weights and rep counts, progressive overload is largely guesswork.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-emerald-700 uppercase">Load Progression</span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">Weight Increases</h3>
                <p className="text-xs text-slate-500 mt-1">Increasing resistance on the bar once you comfortably hit the upper ceiling of your target rep bracket.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-sky-700 uppercase">Volume Progression</span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">Reps & Sets</h3>
                <p className="text-xs text-slate-500 mt-1">Performing an additional repetition with the same weight or completing an extra working set per muscle group.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-amber-700 uppercase">Quality Progression</span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">Execution & Tempo</h3>
                <p className="text-xs text-slate-500 mt-1">Controlling the 3-second eccentric (lowering) phase and achieving full muscular stretch under tension.</p>
              </div>
            </div>
          </section>

          {/* Section 2: Workout Splits Compared */}
          <section className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Finding Your Optimal Training Split
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Different training splits fit different schedules, recovery capacities, and training ages. FitTrack AI allows you to construct any split or choose from science-backed templates:
            </p>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-[#fafafa] border border-slate-200">
                <h3 className="text-base font-bold text-slate-900">4-Day Upper / Lower Split</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  <strong>Structure:</strong> Monday (Upper), Tuesday (Lower), Thursday (Upper), Friday (Lower).<br />
                  <strong>Best for:</strong> Intermediate lifters seeking a 2× per week frequency per muscle group with excellent recovery balance.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#fafafa] border border-slate-200">
                <h3 className="text-base font-bold text-slate-900">3-Day Full Body Routine</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  <strong>Structure:</strong> Monday (Full Body), Wednesday (Full Body), Friday (Full Body).<br />
                  <strong>Best for:</strong> Beginners establishing neuromuscular coordination and motor patterns, or busy individuals training 3 days per week.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#fafafa] border border-slate-200">
                <h3 className="text-base font-bold text-slate-900">5-6 Day Push / Pull / Legs (PPL) Split</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  <strong>Structure:</strong> Push (Chest, Shoulders, Triceps), Pull (Back, Rear Delts, Biceps), Legs (Quads, Hamstrings, Calves).<br />
                  <strong>Best for:</strong> Advanced trainees targeting high weekly volume with dedicated synergistic muscle groupings.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Live Session Tracking & Rest Timers */}
          <section className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              In-Gym Live Session Tracking
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              When training in the gym, FitTrack AI gives you a frictionless interface to enter weights and reps per set. As soon as you mark a set as complete, a built-in rest interval timer starts automatically, helping you maintain optimal rest periods (60 to 120 seconds) for hypertrophic energy replenishment.
            </p>
          </section>

          {/* Navigation to AI Assistant */}
          <div className="p-8 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold">Want AI to design your custom routine?</h3>
              <p className="text-xs text-slate-400 mt-1">Our Gemini-powered assistant can formulate a tailored split in seconds.</p>
            </div>
            <Link
              href="/ai-fitness-assistant"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition shrink-0"
            >
              AI Fitness Assistant →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
