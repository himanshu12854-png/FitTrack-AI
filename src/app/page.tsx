import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollReveal from '@/components/ui/ScrollReveal';
import {
  Activity,
  Flame,
  Dumbbell,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  BrainCircuit,
  Zap,
  BarChart3,
  Calendar,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 border-b border-slate-200/60 bg-gradient-to-b from-white to-slate-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-6 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Next-Gen AI Fitness & Nutrition Architecture</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
              Master Your Nutrition. Build Real Strength.{' '}
              <span className="text-emerald-700 underline decoration-emerald-300 decoration-wavy underline-offset-4">
                Guided by AI.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              FitTrack AI combines precision daily calorie tracking, custom gym workout splits, progressive overload logging, and an intelligent AI coach that knows your real biometric data.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition shadow-sm hover:shadow"
              >
                <span>Start Tracking Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/features"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition border border-slate-200"
              >
                <span>Explore Features</span>
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Daily automatic calorie reset
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Gemini-powered intelligence
              </span>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="py-20 bg-white border-b border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
                Unified Fitness Engine
              </h2>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Everything you need to optimize diet, gym routines & muscle growth
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <ScrollReveal delay={0.05}>
              <div className="h-full p-8 rounded-2xl bg-[#fcfcfc] border border-slate-200/80 hover:border-emerald-300 hover:-translate-y-1 transition-all shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-6">
                    <Flame className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Dynamic Calorie & Macro Log
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Log meals organized into breakfast, lunch, dinner, and snacks. Track protein, carbs, and fats against scientific TDEE targets with automatic timezone-aware daily resets.
                  </p>
                </div>
                <Link
                  href="/calorie-tracker"
                  className="mt-6 inline-flex items-center text-xs font-bold text-emerald-700 hover:text-emerald-800 gap-1"
                >
                  <span>Learn how calorie tracking works</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              </ScrollReveal>

              {/* Feature 2 */}
              <ScrollReveal delay={0.12}>
              <div className="h-full p-8 rounded-2xl bg-[#fcfcfc] border border-slate-200/80 hover:border-emerald-300 hover:-translate-y-1 transition-all shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-6">
                    <Dumbbell className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Gym Splits & Workout Logging
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Build completely custom splits (PPL, Upper/Lower, 5-Day). Record weights, completed reps, track personal records, and monitor progressive overload curves with lightweight charts.
                  </p>
                </div>
                <Link
                  href="/workout-planner"
                  className="mt-6 inline-flex items-center text-xs font-bold text-emerald-700 hover:text-emerald-800 gap-1"
                >
                  <span>Explore workout split architecture</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              </ScrollReveal>

              {/* Feature 3 */}
              <ScrollReveal delay={0.19}>
              <div className="h-full p-8 rounded-2xl bg-[#fcfcfc] border border-slate-200/80 hover:border-emerald-300 hover:-translate-y-1 transition-all shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-6">
                    <BrainCircuit className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Gemini AI Fitness Assistant
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Chat with an AI coach that accesses your live diet and training splits. Generate structured 7-day workout and diet proposals, review them interactively, and apply with one click.
                  </p>
                </div>
                <Link
                  href="/ai-fitness-assistant"
                  className="mt-6 inline-flex items-center text-xs font-bold text-emerald-700 hover:text-emerald-800 gap-1"
                >
                  <span>See how AI plan builder works</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-slate-50 border-b border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
                Scientific Workflow
              </h2>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                How FitTrack AI Accelerates Your Transformation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  step: '01',
                  title: 'Configure Biometrics',
                  desc: 'Input age, height, weight, and fitness goal. We calculate your baseline BMR and TDEE with macro ratios.',
                },
                {
                  step: '02',
                  title: 'Track Daily Intake',
                  desc: 'Log food in seconds. Watch your remaining calories, protein, and energy metrics update dynamically.',
                },
                {
                  step: '03',
                  title: 'Execute Gym Split',
                  desc: 'Follow your scheduled routine. Check off completed sets, record weights, and log rest intervals.',
                },
                {
                  step: '04',
                  title: 'Iterate with AI Coach',
                  desc: 'Analyze your strength plateau or request personalized routine modifications whenever your goals evolve.',
                },
              ].map((item, idx) => (
                <ScrollReveal key={item.step} delay={idx * 0.08}>
                  <div className="h-full bg-white p-6 rounded-2xl border border-slate-200/80 hover:border-emerald-200 hover:-translate-y-0.5 transition-all shadow-xs">
                    <span className="text-2xl font-black text-emerald-600/40 block mb-2 font-mono">
                      {item.step}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Call to action section */}
        <section className="py-20 bg-emerald-800 text-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to take complete control of your fitness?
            </h2>
            <p className="mt-4 text-emerald-100 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              Join thousands of dedicated athletes and fitness enthusiasts who track their calories, routines, and progressive overload with FitTrack AI.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-sm transition shadow-md"
              >
                <span>Create Your Free Account</span>
                <ArrowRight className="w-4 h-4 text-emerald-700" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
