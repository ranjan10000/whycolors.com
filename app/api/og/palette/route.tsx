// app/api/og/palette/route.tsx
import { ImageResponse } from 'next/og';
import { getColorName, hexToRgb, getContrastColor } from '@/lib/color-utils';
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

    // Generate palette colors (5 harmonious colors)
    const baseColor = chroma(cleanHex);
    
    // Generate a simple palette
    const paletteColors = [
      baseColor.hex(), // Base
      baseColor.darken(1).hex(), // Darker
      baseColor.brighten(1).hex(), // Lighter
      chroma(cleanHex).set('hsl.h', '+60').hex(), // Shift hue
      chroma(cleanHex).set('hsl.h', '-60').hex(), // Shift hue opposite
    ];

    // Generate a color swatch component
    const colorSwatches = paletteColors.map((color, index) => (
      <div
        key={index}
        style={{
          width: '80px',
          height: '100px',
          backgroundColor: color,
          borderRadius: '8px',
          border: '2px solid rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          paddingBottom: '8px',
          fontSize: '10px',
          color: getContrastColor(color.replace('#', '')),
          fontWeight: 'bold',
          fontFamily: 'monospace',
        }}
      >
        {color.toUpperCase()}
      </div>
    ));

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
            padding: '50px',
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
              background: `linear-gradient(135deg, ${fullHex}33, transparent 60%)`,
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
            }}
          >
            {/* Color Preview Circle */}
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: fullHex,
                border: '4px solid rgba(255,255,255,0.2)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                marginBottom: '24px',
              }}
            />

            {/* Title */}
            <h1
              style={{
                fontSize: '52px',
                fontWeight: 'bold',
                color: '#ffffff',
                margin: '0',
                letterSpacing: '-0.02em',
                textShadow: '0 2px 20px rgba(0,0,0,0.5)',
              }}
            >
              {colorName}
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: '24px',
                color: '#94a3b8',
                margin: '8px 0 30px 0',
              }}
            >
              Color Palettes & Harmonies
            </p>

            {/* Color Swatches */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                padding: '20px 30px',
                backgroundColor: 'rgba(0,0,0,0.4)',
                borderRadius: '16px',
                backdropFilter: 'blur(10px)',
              }}
            >
              {colorSwatches}
            </div>

            {/* Brand */}
            <div
              style={{
                position: 'absolute',
                bottom: '35px',
                right: '50px',
                fontSize: '20px',
                color: '#475569',
                fontWeight: '500',
              }}
            >
              WhyColors.com
            </div>

            {/* Hex Code */}
            <div
              style={{
                position: 'absolute',
                bottom: '35px',
                left: '50px',
                fontSize: '18px',
                color: '#475569',
                fontFamily: 'monospace',
              }}
            >
              {fullHex}
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