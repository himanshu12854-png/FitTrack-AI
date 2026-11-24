import { ImageResponse } from 'next/og';

export const alt = 'FitTrack AI — Calorie, workout, and progress tracking';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          background: 'linear-gradient(135deg, #052e16 0%, #047857 55%, #10b981 100%)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center',
          padding: '72px',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', fontSize: 34, fontWeight: 700, opacity: 0.9 }}>
          FITTRACK AI
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 76,
            fontWeight: 800,
            letterSpacing: '-3px',
            marginTop: 28,
            textAlign: 'center',
          }}
        >
          Train smarter. Track every win.
        </div>
        <div style={{ display: 'flex', fontSize: 32, marginTop: 32, opacity: 0.9 }}>
          Calories · Workouts · Progress · AI coaching
        </div>
      </div>
    ),
    size
  );
}
