import { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { constructMetadata, generateBreadcrumbSchema } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Privacy Policy — FitTrack AI Data Governance',
  description:
    'FitTrack AI is committed to protecting your biometric, diet, and gym progress data. Read our comprehensive data privacy practices.',
  canonical: '/privacy-policy',
});

export default function PrivacyPolicyPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Privacy Policy', url: '/privacy-policy' },
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Navbar />

      <main className="flex-1 py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="border-b border-slate-100 pb-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs text-slate-500 mt-2">
              Effective Date: November 2026 • Last updated: Today
            </p>
          </div>

          <section className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">1. Information We Collect</h2>
            <p>
              When you register for FitTrack AI, we collect your name, email address, and an encrypted hash of your password. We also store optional biometric information you submit (age, gender, height, weight, activity level, and fitness goals), daily food logs, and gym workout routines.
            </p>

            <h2 className="text-base font-bold text-slate-900">2. How We Use Your Data</h2>
            <p>
              Your data is utilized strictly to provide personalized caloric calculations, macro tracking, workout planning, and contextual AI coaching via Google Gemini. Every database query involving your private data is scoped to your authenticated account ID.
            </p>

            <h2 className="text-base font-bold text-slate-900">3. Artificial Intelligence & Third-Party APIs</h2>
            <p>
              When you interact with the AI Fitness Assistant or Plan Builder, relevant biometric and split information is processed through server-side route handlers. FitTrack AI never sends identifiable personal details (such as your full name or email address) to external model providers.
            </p>

            <h2 className="text-base font-bold text-slate-900">4. Search Engine Indexing & Privacy</h2>
            <p>
              All dashboard routes, user profiles, workout session logs, and diet entries are guarded by authentication middleware and marked with <code>noindex</code> robots directives. Private health metrics are never exposed to search engines or third-party web crawlers.
            </p>

            <h2 className="text-base font-bold text-slate-900">5. Data Deletion & Contact</h2>
            <p>
              You maintain full ownership of your data. You may request account deletion and the purge of all associated logs by contacting our support team at <code>privacy@fittrackai.com</code>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
