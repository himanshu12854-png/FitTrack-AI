import { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import {
  Flame,
  CheckCircle2,
  ArrowRight,
  Utensils,
  Calculator,
  Scale,
  Sparkles,
} from 'lucide-react';
import { constructMetadata, generateBreadcrumbSchema } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Calorie & Macro Tracker — Track Energy & Nutrition Intelligently',
  description:
    'Discover how scientific calorie tracking and macronutrient balance accelerate muscle growth and fat loss. FitTrack AI offers dynamic meal logging and automatic daily resets.',
  canonical: '/calorie-tracker',
  keywords: [
    'calorie tracker',
    'macro counter',
    'protein tracker',
    'TDEE calculator',
    'diet log app',
    'nutrition diary',
    'energy balance CICO',
  ],
});

export default function CalorieTrackerPublicPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Calorie Tracker', url: '/calorie-tracker' },
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
              Nutrition Science
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Intelligent Calorie & Macronutrient Tracking
            </h1>
            <p className="text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Understand your energy balance, hit your daily protein requirements, and reach your aesthetic and strength milestones with data-backed accuracy.
            </p>
            <div className="pt-2">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition shadow-xs"
              >
                <span>Start Logging Your Diet</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Section 1: How Calorie Tracking Works */}
          <section className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              How Calorie Tracking Works: The First Law of Thermodynamics
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              At its core, body composition change is governed by energy balance — the relationship between Calories In and Calories Out (CICO). When you consume fewer calories than your body burns over an extended duration, you are in a <strong>caloric deficit</strong>, prompting the mobilization of stored body fat. Conversely, consuming a controlled <strong>caloric surplus</strong> combined with resistance training provides the essential energetic substrate for myofibrillar muscle hypertrophy.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-emerald-700 uppercase">Caloric Deficit</span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">Fat Loss / Cutting</h3>
                <p className="text-xs text-slate-500 mt-1">Typically 300 to 500 kcal below maintenance for sustainable fat reduction while preserving lean mass.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-sky-700 uppercase">Maintenance</span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">Body Recomposition</h3>
                <p className="text-xs text-slate-500 mt-1">Equal energy balance. Ideal for beginners and intermediate trainees building muscle while losing fat simultaneously.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-amber-700 uppercase">Caloric Surplus</span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">Muscle Growth / Bulking</h3>
                <p className="text-xs text-slate-500 mt-1">A lean surplus of 200 to 350 kcal above maintenance to maximize muscle protein synthesis with minimal fat gain.</p>
              </div>
            </div>
          </section>

          {/* Section 2: Macronutrients Demystified */}
          <section className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Macronutrient Precision: Beyond Just Calories
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              While overall calories determine weight changes, your <strong>macronutrient distribution</strong> dictates whether that weight change is muscle tissue or fat mass. FitTrack AI breaks down every meal into the three essential macronutrients:
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                  P
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Protein (4 kcal/gram) — Muscle Repair & Synthesis</h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Essential for repairing microscopic myofibrillar tears incurred during heavy gym training. Sports science consensus suggests consuming 1.6 to 2.2 grams of protein per kilogram of bodyweight for active resistance trainers.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-100 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                  C
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Carbohydrates (4 kcal/gram) — High-Intensity Glycogen Fuel</h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Stored in muscular tissue as glycogen, carbohydrates represent the primary anaerobic fuel source for explosive lifts, sprinting, and high-volume training sessions.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                  F
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Fats (9 kcal/gram) — Hormonal & Cellular Integrity</h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Dietary lipids are critical for endogenous testosterone and estrogen production, cellular membrane fluidity, and the absorption of fat-soluble vitamins (A, D, E, K).
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Timezone Daily Reset */}
          <section className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Automatic Daily Reset with Preserved Log History
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Unlike primitive tracking sheets, FitTrack AI coordinates with your user-configured timezone. When midnight passes in your region, the dashboard automatically provides a clean daily food diary while safeguarding your past logs in MongoDB. You can navigate through previous dates seamlessly to analyze your compliance over time.
            </p>
          </section>

          {/* Next steps internal linking */}
          <div className="p-8 rounded-2xl bg-emerald-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold">Ready to pair your diet with a gym split?</h3>
              <p className="text-xs text-emerald-200 mt-1">Explore how our Gym Workout Planner integrates with your daily calories.</p>
            </div>
            <Link
              href="/workout-planner"
              className="px-5 py-2.5 rounded-xl bg-white text-emerald-950 font-bold text-xs hover:bg-emerald-50 transition shrink-0"
            >
              Workout Planner →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
