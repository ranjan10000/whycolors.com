// app/api/og/palette/route.tsx
import { ImageResponse } from 'next/og';
import {
  getColorName,
  isValidHex,
  sanitizeHex,
  getContrastColor,
} from '@/lib/color-utils';
import chroma from 'chroma-js';

export const runtime = 'edge';

const FALLBACK_HEX = '8b5cf6';

type PaletteSwatch = {
  hex: string;
  label: string;
  textColor: string;
};

/**
 * Safe wrapper — returns fallback if operation fails or returns null.
 */
function safeHex(
  fn: () => string | null | undefined,
  fallback: string
): string {
  try {
    const result = fn();
    if (!result || typeof result !== 'string') return fallback;
    if (!/^#[0-9a-fA-F]{6}$/.test(result)) return fallback;
    return result.toLowerCase();
  } catch {
    return fallback;
  }
}

function getSafeTextColor(color: string): string {
  try {
    return (
      getContrastColor(color) ||
      (chroma(color).luminance() > 0.5 ? '#111827' : '#ffffff')
    );
  } catch {
    return '#ffffff';
  }
}

function createPalette(hex: string): PaletteSwatch[] {
  let baseColor: chroma.Color;
  try {
    baseColor = chroma(hex);
    baseColor.hex(); // validate
  } catch {
    baseColor = chroma(FALLBACK_HEX);
  }

  const baseHex = baseColor.hex();

  const rawColors = [
    { hex: baseHex, label: 'BASE' },
    {
      hex: safeHex(() => baseColor.darken(1.25).hex(), baseHex),
      label: 'DARK',
    },
    {
      hex: safeHex(() => baseColor.brighten(1.25).hex(), baseHex),
      label: 'LIGHT',
    },
    {
      hex: safeHex(
        () => baseColor.set('hsl.h', '+60').saturate(0.35).hex(),
        baseHex
      ),
      label: 'ANALOGOUS',
    },
    {
      hex: safeHex(
        () => baseColor.set('hsl.h', '-60').saturate(0.35).hex(),
        baseHex
      ),
      label: 'COMPLEMENT',
    },
  ];

  // ✅ Filter out any falsy values — CRITICAL
  return rawColors
    .filter((c) => c && c.hex && c.label)
    .map(({ hex: color, label }) => ({
      hex: color,
      label,
      textColor: getSafeTextColor(color),
    }));
}

function getCleanHex(rawHex: string | null) {
  const sanitized = sanitizeHex(rawHex || FALLBACK_HEX);
  return sanitized && isValidHex(sanitized)
    ? sanitized.toLowerCase()
    : FALLBACK_HEX;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cleanHex = getCleanHex(searchParams.get('hex'));
    const fullHex = `#${cleanHex.toUpperCase()}`;
    const colorName = getColorName(fullHex) || 'Color';
    const palette = createPalette(cleanHex);

    // ✅ Guard: empty palette → fallback
    if (!palette || palette.length === 0) {
      return new Response('Empty palette', { status: 500 });
    }

    const darkHex = safeHex(
      () => chroma(cleanHex).darken(1.25).hex(),
      fullHex
    );

    const softTint = `${fullHex}16`;
    const softTintStrong = `${fullHex}30`;

    // ✅ Build swatches with EXPLICIT array (no undefined)
    const swatches = palette.map((swatch, idx) => {
      if (!swatch || !swatch.hex) return null;  // double-guard
      return (
        <div
          key={`${swatch.label}-${idx}`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '126px',
            height: '178px',
            padding: '16px',
            borderRadius: '18px',
            backgroundColor: swatch.hex,
            color: swatch.textColor,
            // ✅ Removed boxShadow with null-able value
            border: '1px solid rgba(255,255,255,0.32)',
            // ✅ Use marginRight instead of parent gap
            marginRight: idx < palette.length - 1 ? '12px' : '0px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              opacity: 0.82,
            }}
          >
            <span>{swatch.label}</span>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '999px',
                backgroundColor: swatch.textColor,
                opacity: 0.72,
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.03em',
              }}
            >
              {swatch.hex.toUpperCase()}
            </span>
            <span
              style={{
                fontSize: '10px',
                opacity: 0.75,
                letterSpacing: '0.04em',
              }}
            >
              HARMONY
            </span>
          </div>
        </div>
      );
    }).filter(Boolean);  // ✅ Remove any nulls

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            color: '#111827',
            backgroundColor: '#f8fafc',
            fontFamily: 'Arial, Helvetica, sans-serif',
          }}
        >
          {/* Atmosphere */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              background: `radial-gradient(circle at 14% 18%, ${softTintStrong}, transparent 32%), radial-gradient(circle at 88% 92%, ${softTint}, transparent 36%)`,
            }}
          />

          {/* Orb */}
          <div
            style={{
              position: 'absolute',
              top: '-170px',
              right: '-110px',
              width: '440px',
              height: '440px',
              borderRadius: '999px',
              border: `1px solid ${fullHex}24`,
            }}
          />

          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '42px 54px 0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  display: 'flex',
                  width: '28px',
                  height: '28px',
                  borderRadius: '9px',
                  backgroundColor: fullHex,
                  marginRight: '12px',
                }}
              />
              <span
                style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  color: '#0f172a',
                }}
              >
                whycolors.com
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '9px 14px',
                borderRadius: '999px',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                color: '#64748b',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.12em',
              }}
            >
              COLOR INTELLIGENCE
            </div>
          </div>

          {/* Main content */}
          <div
            style={{
              display: 'flex',
              flex: 1,
              flexDirection: 'column',
              padding: '38px 54px 40px',
            }}
          >
            {/* Hero */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '28px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  maxWidth: '560px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '14px',
                    color: darkHex,
                    fontSize: '12px',
                    fontWeight: 800,
                    letterSpacing: '0.16em',
                  }}
                >
                  <span
                    style={{
                      display: 'flex',
                      width: '30px',
                      height: '2px',
                      backgroundColor: fullHex,
                      marginRight: '9px',
                    }}
                  />
                  COLOR STUDY
                </div>

                <h1
                  style={{
                    margin: 0,
                    color: '#0f172a',
                    fontSize: colorName.length > 12 ? '44px' : '58px',
                    lineHeight: 1,
                    fontWeight: 800,
                    letterSpacing: '-0.065em',
                  }}
                >
                  {colorName} Palette
                </h1>

                <p
                  style={{
                    margin: '14px 0 0 0',
                    color: '#64748b',
                    fontSize: '20px',
                    lineHeight: 1.25,
                  }}
                >
                  A considered palette built around one defining color.
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '14px 18px 14px 14px',
                  borderRadius: '22px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    width: '82px',
                    height: '82px',
                    borderRadius: '20px',
                    backgroundColor: fullHex,
                    marginRight: '16px',
                  }}
                />

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      color: '#0b0d0f',
                      fontSize: '10px',
                      fontWeight: 800,
                      letterSpacing: '0.14em',
                      marginBottom: '5px',
                    }}
                  >
                    PRIMARY COLOR
                  </span>
                  <span
                    style={{
                      color: '#0f172a',
                      fontSize: '22px',
                      fontWeight: 800,
                      fontFamily: 'monospace',
                    }}
                  >
                    {fullHex}
                  </span>
                </div>
              </div>
            </div>

            {/* Palette card */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '18px',
                borderRadius: '26px',
                backgroundColor: '#ffffff',
                border: '1px solid rgba(148,163,184,0.24)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                  padding: '0 3px',
                }}
              >
                <span
                  style={{
                    color: '#334155',
                    fontSize: '12px',
                    fontWeight: 800,
                    letterSpacing: '0.14em',
                  }}
                >
                  HARMONIOUS PALETTE
                </span>
                <span
                  style={{
                    color: '#94a3b8',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  {palette.length} curated tones
                </span>
              </div>

              {/* ✅ No `gap` — use marginRight on children */}
              <div style={{ display: 'flex' }}>
                {swatches}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 54px 32px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                color: '#94a3b8',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  display: 'flex',
                  width: '7px',
                  height: '7px',
                  borderRadius: '999px',
                  backgroundColor: fullHex,
                  marginRight: '8px',
                }}
              />
              Generated palette
            </div>

            <span
              style={{
                color: '#0d1013',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              whycolors.com
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to generate palette OG image: ${message}`);

    return new Response(`Failed: ${message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}