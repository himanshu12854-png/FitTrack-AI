import { Metadata } from 'next';

export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://fittrack-ai.vercel.app';
export const SITE_NAME = 'FitTrack AI';
export const DEFAULT_DESCRIPTION =
  'FitTrack AI is an intelligent calorie, diet, and gym progress tracking platform powered by AI. Track nutrition macros, design custom workout splits, and reach your fitness potential.';

export function constructMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  image = `${SITE_URL}/opengraph-image`,
  canonical,
  noIndex = false,
  keywords = [
    'fitness tracker',
    'calorie counter',
    'AI fitness assistant',
    'macro tracker',
    'gym workout planner',
    'weight progression',
    'diet plan generator',
  ],
}: {
  title?: string;
  description?: string;
  image?: string;
  canonical?: string;
  noIndex?: boolean;
  keywords?: string[];
} = {}): Metadata {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — AI-Powered Calorie, Diet & Gym Progress Tracker`;

  return {
    title: fullTitle,
    description,
    category: 'health and fitness',
    keywords,
    authors: [{ name: 'FitTrack AI Team' }],
    creator: 'FitTrack AI',
    publisher: 'FitTrack AI',
    metadataBase: new URL(SITE_URL),
    icons: {
      icon: [
        { url: '/icon', type: 'image/png', sizes: '64x64' },
        { url: '/logo.svg', type: 'image/svg+xml' },
      ],
      apple: [{ url: '/apple-icon', type: 'image/png', sizes: '180x180' }],
    },
    alternates: {
      canonical: canonical || '/',
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical || SITE_URL,
      siteName: SITE_NAME,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} - Smart Fitness & Nutrition`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export function generateSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'FitTrack AI',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: DEFAULT_DESCRIPTION,
  };
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FitTrack AI',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.svg`,
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}
