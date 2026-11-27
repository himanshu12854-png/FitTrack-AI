import { ImageResponse } from 'next/og';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 16,
          background: 'linear-gradient(135deg, #059669 0%, #16a34a 100%)',
          color: '#ffffff',
          fontSize: 30,
          fontWeight: 800,
          letterSpacing: '-1px',
        }}
      >
        FT
      </div>
    ),
    size
  );
}
