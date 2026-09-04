// app/api/og/shades/route.tsx
import { ImageResponse } from 'next/og';
import { getColorName, getContrastColor } from '@/lib/color-utils';
import chroma from 'chroma-js';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hex = searchParams.get('hex') || '8b5cf6';
    const cleanHex = hex.toLowerCase();
    const fullHex = `#${cleanHex.toUpperCase()}`;
    const colorName = getColorName(fullHex);
    const contrastColor = getContrastColor(cleanHex);

    // Generate 9 shades (light to dark)
    const baseColor = chroma(cleanHex);
    const shades: string[] = [];
    
    // Generate shades from dark to light
    for (let i = 0; i < 9; i++) {
      const t = i / 8; // 0 to 1
      // Lightness: from 0.08 to 0.92
      const lightness = 0.08 + t * 0.84;
      const shade = chroma(cleanHex).set('hsl.l', lightness).hex();
      shades.push(shade);
    }

    // Get brightness for text color
    const getTextColor = (color: string) => {
      try {
        const luminance = chroma(color).luminance();
        return luminance > 0.5 ? '#1a1a1a' : '#ffffff';
      } catch {
        return '#ffffff';
      }
    };

    // Generate shade swatches
    const shadeSwatches = shades.map((color, index) => {
      const isBase = color.toLowerCase() === fullHex.toLowerCase();
      const textColor = getTextColor(color);
      
      return (
        <div
          key={index}
          style={{
            width: '60px',
            height: '140px',
            backgroundColor: color,
            borderRadius: '6px',
            border: isBase ? '3px solid rgba(255,255,255,0.6)' : '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingBottom: '8px',
            position: 'relative',
            boxShadow: isBase ? '0 0 30px rgba(255,255,255,0.15)' : 'none',
          }}
        >
          {/* Index label */}
          <span
            style={{
              fontSize: '9px',
              color: textColor,
              opacity: 0.5,
              fontFamily: 'monospace',
              position: 'absolute',
              top: '6px',
              right: '8px',
            }}
          >
            {index + 1}
          </span>
          
          {/* Color hex */}
          <span
            style={{
              fontSize: '8px',
              color: textColor,
              opacity: 0.8,
              fontFamily: 'monospace',
              textAlign: 'center',
              padding: '0 2px',
            }}
          >
            {color.toUpperCase()}
          </span>
          
          {/* Base indicator */}
          {isBase && (
            <span
              style={{
                fontSize: '7px',
                color: textColor,
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginTop: '2px',
                background: 'rgba(255,255,255,0.2)',
                padding: '1px 6px',
                borderRadius: '4px',
              }}
            >
              Base
            </span>
          )}
        </div>
      );
    });

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
            backgroundColor: '#0f0f0f',
            padding: '40px 50px',
            position: 'relative',
          }}
        >
          {/* Background gradient with base color */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(135deg, ${fullHex}22, transparent 60%, ${fullHex}11)`,
            }}
          />

          {/* Main content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
              width: '100%',
              height: '100%',
            }}
          >
            {/* Title */}
            <h1
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#ffffff',
                margin: '0 0 4px 0',
                letterSpacing: '-0.02em',
                textShadow: '0 2px 20px rgba(0,0,0,0.5)',
                textAlign: 'center',
              }}
            >
              {colorName}
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: '22px',
                color: '#94a3b8',
                margin: '0 0 30px 0',
              }}
            >
              {fullHex} • 100+ Shades & Tints
            </p>

            {/* Shade Swatches */}
            <div
              style={{
                display: 'flex',
                gap: '6px',
                padding: '16px 24px',
                backgroundColor: 'rgba(0,0,0,0.4)',
                borderRadius: '16px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              {shadeSwatches}
            </div>

            {/* Bottom info */}
            <div
              style={{
                display: 'flex',
                width: '100%',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '28px',
                padding: '0 10px',
              }}
            >
              <span
                style={{
                  fontSize: '16px',
                  color: '#475569',
                  fontFamily: 'monospace',
                }}
              >
                {fullHex}
              </span>
              <span
                style={{
                  fontSize: '18px',
                  color: '#475569',
                  fontWeight: '500',
                }}
              >
                WhyColors.com
              </span>
              <span
                style={{
                  fontSize: '14px',
                  color: '#475569',
                }}
              >
                9 Shades
              </span>
            </div>
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