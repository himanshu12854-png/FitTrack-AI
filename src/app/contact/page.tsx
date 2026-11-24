import { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Mail, Clock } from 'lucide-react';
import { constructMetadata, generateBreadcrumbSchema } from '@/lib/seo';
import ContactForm from '@/components/forms/ContactForm';

export const metadata: Metadata = constructMetadata({
  title: 'Contact FitTrack AI — Support & Inquiries',
  description:
    'Need support, feature suggestions, or enterprise fitness inquiries? Contact the FitTrack AI technical and customer success team.',
  canonical: '/contact',
});

export default function ContactPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Contact', url: '/contact' },
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Navbar />

      <main className="flex-1 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Get in Touch
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              We&apos;re Here to Help Your Fitness Journey
            </h1>
            <p className="text-base text-slate-600 leading-relaxed max-w-xl mx-auto">
              Have questions about your account, AI workout generation, or feature requests? Send us a message and our team will respond promptly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-4">
              <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                <Mail className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Email Support</h3>
                <p className="text-xs text-slate-500">support@fittrackai.com</p>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Response Window</h3>
                <p className="text-xs text-slate-500">Typically under 24 hours on weekdays</p>
              </div>
            </div>

            <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs">
              <ContactForm />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
