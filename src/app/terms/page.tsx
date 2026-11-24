import { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { constructMetadata, generateBreadcrumbSchema } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Terms of Service & Health Disclaimer — FitTrack AI',
  description:
    'Review the FitTrack AI Terms of Service, user commitments, medical guidance disclaimer, and software usage terms.',
  canonical: '/terms',
});

export default function TermsPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Terms of Service', url: '/terms' },
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
              Terms of Service
            </h1>
            <p className="text-xs text-slate-500 mt-2">
              Effective Date: November 2026 • Last updated: Today
            </p>
          </div>

          <section className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
            <p>
              By accessing and using FitTrack AI, you agree to be bound by these Terms of Service. If you do not agree with any portion of these terms, please do not use the application.
            </p>

            <h2 className="text-base font-bold text-slate-900">2. Medical & Health Disclaimer</h2>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs leading-relaxed">
              <strong>IMPORTANT NOTICE:</strong> FitTrack AI, its algorithms, and the AI Fitness Assistant provide informational and educational fitness tools only. FitTrack AI is not a licensed healthcare provider, medical institution, or registered dietitian. Always consult with a qualified medical professional before embarking on any strenuous resistance training program or severe caloric alteration.
            </div>

            <h2 className="text-base font-bold text-slate-900">3. User Responsibilities & Account Security</h2>
            <p>
              You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree to provide accurate and truthful biometric and nutritional information.
            </p>

            <h2 className="text-base font-bold text-slate-900">4. Intellectual Property</h2>
            <p>
              All software, algorithms, user interfaces, branding, and content comprising FitTrack AI are the exclusive intellectual property of FitTrack AI and its licensors.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
