// app/api/og/color/route.tsx
import { ImageResponse } from 'next/og';
import { getColorName, hexToRgb, hexToHsl } from '@/lib/color-utils';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hex = searchParams.get('hex') || '8b5cf6';
    const cleanHex = hex.toLowerCase();
    
    const colorName = getColorName(cleanHex);
    const fullHex = `#${cleanHex.toUpperCase()}`;
    const rgb = hexToRgb(cleanHex);
    
    // Generate the image using JSX + Tailwind
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
            backgroundColor: fullHex,
            padding: '60px',
          }}
        >
          {/* Color preview circle */}
          <div
            style={{
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              backgroundColor: fullHex,
              border: '8px solid rgba(255,255,255,0.6)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              marginBottom: '40px',
            }}
          />
          
          {/* Color name */}
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: 'white',
              textShadow: '0 4px 20px rgba(0,0,0,0.4)',
              margin: '0',
              letterSpacing: '-0.02em',
            }}
          >
            {colorName}
          </h1>
          
          {/* Hex code */}
          <p
            style={{
              fontSize: '36px',
              color: 'rgba(255,255,255,0.9)',
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              margin: '8px 0 0 0',
              fontFamily: 'monospace',
            }}
          >
            {fullHex}
          </p>
          
          {/* Bottom brand */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '60px',
              fontSize: '28px',
              color: 'rgba(255,255,255,0.7)',
              textShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            WhyColors.com
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}