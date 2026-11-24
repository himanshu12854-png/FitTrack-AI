import { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import {
  Sparkles,
  Bot,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  BrainCircuit,
  Layers,
  Lock,
} from 'lucide-react';
import { constructMetadata, generateBreadcrumbSchema } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'AI Fitness Assistant & Plan Builder — Powered by Gemini AI',
  description:
    'Chat with an intelligent fitness coach that analyzes your real biometric data, workout splits, and daily nutrition. Generate structured workout and diet plans safely.',
  canonical: '/ai-fitness-assistant',
  keywords: [
    'AI fitness assistant',
    'AI workout generator',
    'AI diet plan builder',
    'Gemini AI fitness',
    'smart workout coach',
    'personalized fitness plan AI',
  ],
});

export default function AIFitnessAssistantPublicPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'AI Fitness Assistant', url: '/ai-fitness-assistant' },
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
              Artificial Intelligence
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              An AI Fitness Coach That Actually Knows Your Data
            </h1>
            <p className="text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Generic chatbots give generic fitness advice. FitTrack AI integrates Google Gemini directly into your database context, delivering safe, personalized guidance based on your real training and diet history.
            </p>
            <div className="pt-2">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition shadow-xs"
              >
                <span>Consult with AI Coach</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Section 1: Contextual Awareness */}
          <section className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Contextual Intelligence: No More Repetitive Prompts
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              When you ask conventional AI for a workout suggestion, you must explain your weight, current calorie goals, training days, and past injuries in every message. With FitTrack AI, our server securely injects your <strong>UserFitnessProfile</strong>, <strong>today&apos;s logged meals</strong>, and <strong>active workout split</strong> into the model prompt.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-emerald-700 uppercase">Profile Aware</span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">Biometrics & Goals</h3>
                <p className="text-xs text-slate-500 mt-1">Knows whether your objective is Hypertrophy, Cutting, Maintenance, or Endurance.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-sky-700 uppercase">Nutrition Aware</span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">Live Calorie Intake</h3>
                <p className="text-xs text-slate-500 mt-1">Understands your remaining protein and energy budgets for the current day.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-amber-700 uppercase">Routine Aware</span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">Active Gym Split</h3>
                <p className="text-xs text-slate-500 mt-1">Suggests exercise substitutions that respect your current muscle recovery rotation.</p>
              </div>
            </div>
          </section>

          {/* Section 2: Structured Plan Approval Workflow */}
          <section className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Human-in-the-Loop Plan Approval Workflow
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              We believe AI should empower athletes, not overwrite their hard work without consent. Our AI Plan Builder utilizes a strict 4-step approval lifecycle:
            </p>

            <div className="space-y-3">
              {[
                {
                  step: '1. Natural Language Goal Prompt',
                  desc: 'Describe your training frequency, available gym equipment, target muscle groups, and dietary preferences.',
                },
                {
                  step: '2. Structured JSON Generation',
                  desc: 'Gemini returns a schema-validated 7-day workout split and daily macronutrient guidelines with sample meal plans.',
                },
                {
                  step: '3. Interactive Visual Preview',
                  desc: 'Inspect each exercise, target rep range, and rest time in a dedicated review card before making any decisions.',
                },
                {
                  step: '4. Granular User Approval',
                  desc: 'Choose to Apply Workout Plan, Apply Diet Plan, or Apply Both. Backend validates the schema and updates your active dashboard.',
                },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <h3 className="font-bold text-slate-900 text-sm mb-1">{item.step}</h3>
                  <p className="text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Safety Guardrails */}
          <section className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Health Safety Principles & Non-Extreme Guidelines
              </h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              FitTrack AI is grounded in sports nutrition guidelines. Our system instructions explicitly forbid prescribing severe starvation deficits (below 1,200 kcal for females or 1,500 kcal for males), dangerous rapid weight cuts, or overtraining volume that endangers joint and tendon longevity.
            </p>
          </section>

          {/* CTA */}
          <div className="p-8 rounded-2xl bg-emerald-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold">Start consulting with your AI Coach today</h3>
              <p className="text-xs text-emerald-300 mt-1">Included free with every FitTrack AI account.</p>
            </div>
            <Link
              href="/register"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shrink-0"
            >
              Get Started Free →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
