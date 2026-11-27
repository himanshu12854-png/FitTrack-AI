import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 40,
          background: 'linear-gradient(135deg, #059669 0%, #16a34a 100%)',
          color: '#ffffff',
          fontWeight: 800,
        }}
      >
        <div style={{ fontSize: 68, lineHeight: 1 }}>FT</div>
        <div style={{ fontSize: 18, marginTop: 6, opacity: 0.9 }}>FitTrack AI</div>
      </div>
    ),
    size
  );
}
