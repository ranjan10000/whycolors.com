// app/api/og/color/route.tsx
import { ImageResponse } from 'next/og';
import {
  getColorName,
  hexToHsl,
  hexToRgb,
  isValidHex,
  sanitizeHex,
} from '@/lib/color-utils';
import chroma from 'chroma-js';

export const runtime = 'edge';

const FALLBACK_HEX = '8b5cf6';

type ColorVariant = {
  label: string;
  color: string;
};

function safeHex(
  callback: () => string | null | undefined,
  fallback: string
): string {
  try {
    const result = callback();
    if (!result || typeof result !== 'string') return fallback;
    if (!/^#[0-9a-fA-F]{6}$/.test(result)) return fallback;
    return result.toLowerCase();
  } catch {
    return fallback;
  }
}

function getCleanHex(rawHex: string | null): string {
  const sanitized = sanitizeHex(rawHex || FALLBACK_HEX);
  return sanitized && isValidHex(sanitized)
    ? sanitized.toLowerCase()
    : FALLBACK_HEX;
}

function getTextColor(color: string): string {
  try {
    return chroma(color).luminance() > 0.5 ? '#111827' : '#ffffff';
  } catch {
    return '#ffffff';
  }
}

/**
 * ✅ FIXED — handles null, undefined, array, object, primitives.
 */
function formatColorValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '—';
  }

  if (Array.isArray(value)) {
    const joined = value.join(', ');
    return joined || '—';
  }

  if (typeof value === 'object') {
    try {
      const entries = Object.entries(value as Record<string, unknown>);
      if (entries.length === 0) return '—';
      return entries
        .map(([key, item]) => `${key}: ${item}`)
        .join(' · ');
    } catch {
      return '—';
    }
  }

  const str = String(value);
  return str || '—';
}

function getColorVariants(hex: string): ColorVariant[] {
  const baseColor = (() => {
    try {
      return chroma(hex);
    } catch {
      return chroma(FALLBACK_HEX);
    }
  })();

  const baseHex = baseColor.hex().toLowerCase();

  return [
    {
      label: 'DEEP',
      color: safeHex(() => baseColor.darken(1.25).hex(), baseHex),
    },
    {
      label: 'BASE',
      color: baseHex,
    },
    {
      label: 'SOFT',
      color: safeHex(
        () => chroma.mix(baseColor, '#ffffff', 0.28).hex(),
        baseHex
      ),
    },
    {
      label: 'TINT',
      color: safeHex(
        () => chroma.mix(baseColor, '#ffffff', 0.58).hex(),
        baseHex
      ),
    },
    {
      label: 'GLOW',
      color: safeHex(
        () => chroma.mix(baseColor, '#ffffff', 0.8).hex(),
        baseHex
      ),
    },
  ];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cleanHex = getCleanHex(searchParams.get('hex'));
    const fullHex = `#${cleanHex.toUpperCase()}`;

    // ✅ Safely fetch values
    const colorName = getColorName(fullHex) || 'Color';
    const rgbValue = hexToRgb(cleanHex);
    const hslValue = hexToHsl(cleanHex);

    // ✅ Format with null-safety
    const rgbText = formatColorValue(rgbValue);
    const hslText = formatColorValue(hslValue);

    // ✅ Safe luminance
    let luminance = 0;
    try {
      const lum = chroma(cleanHex).luminance();
      luminance = Number.isFinite(lum) ? lum : 0;
    } catch {
      luminance = 0;
    }
    const isLightColor = luminance > 0.5;

    const baseColor = chroma(cleanHex);
    const variants = getColorVariants(cleanHex);

    const darkColor = safeHex(
      () => baseColor.darken(1.35).hex(),
      fullHex
    );

    const backgroundTint = `${fullHex}12`;
    const backgroundTintStrong = `${fullHex}24`;

    // ✅ Variant cards
    const variantCards = variants.map(({ label, color }, idx) => {
      const textColor = getTextColor(color);
      const isLightSwatch = textColor === '#111827';

      return (
        <div
          key={`${label}-${color}`}
          style={{
            width: '118px',
            height: '132px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '14px',
            borderRadius: '17px',
            backgroundColor: color,
            color: textColor,
            border: isLightSwatch
              ? '1px solid rgba(0,0,0,0.08)'
              : '1px solid rgba(255,255,255,0.38)',
            boxShadow: `0 12px 22px ${color}38`,
            marginRight: idx < variants.length - 1 ? '11px' : '0px',
          }}
        >
          <span
            style={{
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.13em',
              opacity: 0.86,
            }}
          >
            {label}
          </span>

          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              fontFamily: 'monospace',
            }}
          >
            {color.toUpperCase()}
          </span>
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
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#f8fafc',
            color: '#0f172a',
            fontFamily: 'Arial, Helvetica, sans-serif',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              display: 'flex',
              backgroundImage: `
                radial-gradient(circle at 12% 12%, ${backgroundTintStrong}, transparent 34%),
                radial-gradient(circle at 92% 88%, ${backgroundTint}, transparent 38%)
              `,
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: '-185px',
              right: '-100px',
              width: '430px',
              height: '430px',
              display: 'flex',
              borderRadius: '999px',
              border: `1px solid ${fullHex}30`,
              boxShadow: `0 0 0 28px ${fullHex}09, 0 0 0 58px ${fullHex}06`,
            }}
          />

          <div
            style={{
              position: 'absolute',
              left: '-180px',
              bottom: '-260px',
              width: '470px',
              height: '470px',
              display: 'flex',
              borderRadius: '999px',
              backgroundColor: `${fullHex}0d`,
            }}
          />

          {/* Header */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '38px 54px 0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  width: '29px',
                  height: '29px',
                  display: 'flex',
                  borderRadius: '9px',
                  backgroundColor: fullHex,
                  boxShadow: `0 7px 18px ${fullHex}66`,
                  marginRight: '12px',
                }}
              />
              <span
                style={{
                  fontSize: '21px',
                  fontWeight: 800,
                  letterSpacing: '-0.05em',
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
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#64748b',
                fontSize: '10px',
                fontWeight: 800,
                letterSpacing: '0.14em',
              }}
            >
              COLOR PROFILE
            </div>
          </div>

          {/* Main content */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flex: 1,
              flexDirection: 'column',
              padding: '35px 54px 31px',
            }}
          >
            {/* Hero */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '26px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  maxWidth: '610px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '13px',
                    color: darkColor,
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.16em',
                  }}
                >
                  <span
                    style={{
                      width: '30px',
                      height: '2px',
                      display: 'flex',
                      backgroundColor: fullHex,
                      marginRight: '9px',
                    }}
                  />
                  COLOR IDENTITY
                </div>

                <h1
                  style={{
                    margin: 0,
                    color: '#0f172a',
                    fontSize: '61px',
                    lineHeight: 0.98,
                    fontWeight: 800,
                    letterSpacing: '-0.065em',
                  }}
                >
                  {colorName} Color
                </h1>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginTop: '15px',
                  }}
                >
                  <span
                    style={{
                      color: darkColor,
                      fontSize: '25px',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      letterSpacing: '-0.04em',
                      marginRight: '12px',
                    }}
                  >
                    {fullHex}
                  </span>

                  <span
                    style={{
                      padding: '6px 10px',
                      borderRadius: '999px',
                      backgroundColor: `${fullHex}16`,
                      color: darkColor,
                      fontSize: '10px',
                      fontWeight: 800,
                      letterSpacing: '0.1em',
                    }}
                  >
                    {isLightColor ? 'LIGHT VALUE' : 'DARK VALUE'}
                  </span>
                </div>
              </div>

              {/* Primary card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '13px 18px 13px 13px',
                  borderRadius: '23px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 16px 36px rgba(15,23,42,0.09)',
                }}
              >
                <div
                  style={{
                    width: '92px',
                    height: '92px',
                    display: 'flex',
                    borderRadius: '22px',
                    backgroundColor: fullHex,
                    border: '1px solid rgba(255,255,255,0.5)',
                    boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.24), 0 12px 26px ${fullHex}66`,
                    marginRight: '16px',
                  }}
                />

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      color: '#000000',
                      fontSize: '10px',
                      fontWeight: 800,
                      letterSpacing: '0.13em',
                      marginBottom: '5px',
                    }}
                  >
                    PRIMARY
                  </span>
                  <span
                    style={{
                      color: '#0f172a',
                      fontSize: '16px',
                      fontWeight: 800,
                      marginBottom: '5px',
                    }}
                  >
                    {colorName}
                  </span>
                  <span
                    style={{
                      color: '#000000',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                    }}
                  >
                    {fullHex}
                  </span>
                </div>
              </div>
            </div>

            {/* Color info */}
            <div
              style={{
                display: 'flex',
                marginBottom: '17px',
              }}
            >
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '13px 16px',
                  borderRadius: '16px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  marginRight: '12px',
                }}
              >
                <span
                  style={{
                    color: '#000000',
                    fontSize: '9px',
                    fontWeight: 800,
                    letterSpacing: '0.13em',
                    marginBottom: '6px',
                  }}
                >
                  RGB
                </span>
                <span
                  style={{
                    color: '#0f172a',
                    fontSize: '14px',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                  }}
                >
                  {rgbText}
                </span>
              </div>

              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '13px 16px',
                  borderRadius: '16px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  marginRight: '12px',
                }}
              >
                <span
                  style={{
                    color: '#000000',
                    fontSize: '9px',
                    fontWeight: 800,
                    letterSpacing: '0.13em',
                    marginBottom: '6px',
                  }}
                >
                  HSL
                </span>
                <span
                  style={{
                    color: '#0f172a',
                    fontSize: '14px',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                  }}
                >
                  {hslText}
                </span>
              </div>

              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '13px 16px',
                  borderRadius: '16px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                }}
              >
                <span
                  style={{
                    color: '#000000',
                    fontSize: '9px',
                    fontWeight: 800,
                    letterSpacing: '0.13em',
                    marginBottom: '6px',
                  }}
                >
                  LUMINANCE
                </span>
                <span
                  style={{
                    color: '#0f172a',
                    fontSize: '14px',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                  }}
                >
                  {luminance.toFixed(3)}
                </span>
              </div>
            </div>

            {/* Variations */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '17px',
                borderRadius: '25px',
                backgroundColor: '#ffffff',
                border: '1px solid rgba(148,163,184,0.24)',
                boxShadow: '0 18px 42px rgba(15,23,42,0.08)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '13px',
                  padding: '0 3px',
                }}
              >
                <span
                  style={{
                    color: '#334155',
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.14em',
                  }}
                >
                  COLOR VARIATIONS
                </span>
                <span
                  style={{
                    color: '#94a3b8',
                    fontSize: '10px',
                    fontWeight: 600,
                  }}
                >
                  tonal range
                </span>
              </div>

              <div style={{ display: 'flex' }}>
                {variantCards}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 54px 28px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                color: '#94a3b8',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  display: 'flex',
                  borderRadius: '999px',
                  backgroundColor: fullHex,
                  marginRight: '8px',
                }}
              />
              Dynamic color profile
            </div>

            <span
              style={{
                color: '#64748b',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.02em',
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
    console.error(`Failed to generate color OG image: ${message}`);

    return new Response(`Failed: ${message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}