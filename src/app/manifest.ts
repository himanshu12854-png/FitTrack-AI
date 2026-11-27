import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FitTrack AI — Fitness, Calorie & Workout Tracker',
    short_name: 'FitTrack AI',
    description: 'AI-powered calorie tracking, workout split planner, and gym progress companion.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#fafafa',
    theme_color: '#16a34a',
    icons: [
      {
        src: '/icon',
        sizes: '64x64',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
