// app/api/og/shades/route.tsx
import { ImageResponse } from 'next/og';
import { getColorName, isValidHex, sanitizeHex } from '@/lib/color-utils';
import chroma from 'chroma-js';

export const runtime = 'edge';

const FALLBACK_HEX = '8b5cf6';

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

function getCleanHex(rawHex: string | null) {
  const sanitized = sanitizeHex(rawHex || FALLBACK_HEX);
  return sanitized && isValidHex(sanitized)
    ? sanitized.toLowerCase()
    : FALLBACK_HEX;
}

function getTextColor(color: string) {
  try {
    return chroma(color).luminance() > 0.5 ? '#111827' : '#ffffff';
  } catch {
    return '#ffffff';
  }
}

function createShadeScale(hex: string) {
  let baseColor: chroma.Color;
  try {
    baseColor = chroma(hex);
    baseColor.hex(); // validate
  } catch {
    baseColor = chroma(FALLBACK_HEX);
  }

  const baseHex = baseColor.hex();
  const baseLightness = baseColor.get('hsl.l');
  const normalizedLightness = Number.isFinite(baseLightness)
    ? baseLightness
    : 0.5;

  const baseIndex = Math.max(
    0,
    Math.min(
      8,
      Math.round(((normalizedLightness - 0.08) / 0.84) * 8)
    )
  );

  const shades: string[] = [];
  for (let index = 0; index < 9; index += 1) {
    if (index === baseIndex) {
      shades.push(baseHex);
      continue;
    }

    const progress = index / 8;
    const lightness = 0.08 + progress * 0.84;

    shades.push(
      safeHex(
        () => chroma(hex).set('hsl.l', lightness).hex(),
        baseHex
      )
    );
  }

  return { shades, baseIndex, baseLightness: normalizedLightness };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const cleanHex = getCleanHex(searchParams.get('hex'));
    const fullHex = `#${cleanHex.toUpperCase()}`;
    const colorName = getColorName(fullHex) || 'Color';

    const { shades, baseIndex, baseLightness } =
      createShadeScale(cleanHex);

    const darkColor = safeHex(
      () => chroma(cleanHex).darken(1.35).hex(),
      fullHex
    );

    const softTint = `${fullHex}14`;
    const strongerTint = `${fullHex}26`;

    const shadeLabels = [
      '950', '900', '800', '700', '600', '500', '400', '300', '200',
    ];

    const shadeSwatches = shades.map((color, index) => {
      const isBase = index === baseIndex;
      const textColor = getTextColor(color);

      return (
        <div
          key={`${index}-${color}`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '91px',
            height: '177px',
            padding: '14px 12px',
            position: 'relative',
            borderRadius: '17px',
            backgroundColor: color,
            color: textColor,
            border: isBase
              ? `3px solid ${textColor}`
              : '1px solid rgba(255,255,255,0.36)',
            boxShadow: isBase
              ? `0 16px 30px ${color}55`
              : `0 10px 20px ${color}35`,
            marginTop: isBase ? '-7px' : '0px',   // ✅ Instead of transform
            marginRight: index < shades.length - 1 ? '9px' : '0px',   // ✅
          }}
        >
          {/* Scale label */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.1em',
              opacity: 0.78,
            }}
          >
            <span>{shadeLabels[index]}</span>

            {isBase && (
              <span
                style={{
                  display: 'flex',
                  width: '7px',
                  height: '7px',
                  borderRadius: '999px',
                  backgroundColor: textColor,
                  opacity: 0.85,
                }}
              />
            )}
          </div>

          {/* Shade content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {isBase && (
              <span
                style={{
                  alignSelf: 'flex-start',
                  padding: '4px 7px',
                  borderRadius: '999px',
                  backgroundColor: textColor,
                  color: color,
                  fontSize: '8px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  marginBottom: '7px',   // ✅
                }}
              >
                BASE
              </span>
            )}

            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                fontFamily: 'monospace',
                letterSpacing: '-0.03em',
              }}
            >
              {color.toUpperCase()}
            </span>
          </div>
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
          {/* Ambient color background — ✅ No inset */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              background: `radial-gradient(circle at 10% 8%, ${strongerTint}, transparent 35%), radial-gradient(circle at 92% 90%, ${softTint}, transparent 38%)`,
            }}
          />

          {/* Decorative rings */}
          <div
            style={{
              position: 'absolute',
              top: '-180px',
              right: '-95px',
              display: 'flex',
              width: '425px',
              height: '425px',
              borderRadius: '999px',
              border: `1px solid ${fullHex}2e`,
              boxShadow: `0 0 0 28px ${fullHex}09, 0 0 0 58px ${fullHex}05`,
            }}
          />

          <div
            style={{
              position: 'absolute',
              left: '-160px',
              bottom: '-265px',
              display: 'flex',
              width: '430px',
              height: '430px',
              borderRadius: '999px',
              backgroundColor: `${fullHex}0b`,
            }}
          />

          {/* Header — ✅ No zIndex, no gap */}
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
                  display: 'flex',
                  width: '29px',
                  height: '29px',
                  borderRadius: '9px',
                  backgroundColor: fullHex,
                  boxShadow: `0 7px 18px ${fullHex}66`,
                  marginRight: '12px',   // ✅
                }}
              />

              <span
                style={{
                  fontSize: '21px',
                  fontWeight: 800,
                  letterSpacing: '-0.05em',
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
              SHADE SPECTRUM
            </div>
          </div>

          {/* Main content */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flex: 1,
              flexDirection: 'column',
              padding: '34px 54px 28px',
            }}
          >
            {/* Hero */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  maxWidth: '620px',
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
                      display: 'flex',
                      width: '30px',
                      height: '2px',
                      backgroundColor: fullHex,
                      marginRight: '9px',   // ✅
                    }}
                  />
                  TONAL COLOR SYSTEM
                </div>

                <h1
                  style={{
                    margin: 0,
                    color: '#0f172a',
                    fontSize: '58px',
                    lineHeight: 0.98,
                    fontWeight: 800,
                    letterSpacing: '-0.065em',
                  }}
                >
                Shades of {colorName}
                </h1>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginTop: '14px',
                  }}
                >
                  <span
                    style={{
                      color: darkColor,
                      fontSize: '23px',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      letterSpacing: '-0.04em',
                      marginRight: '12px',   // ✅
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
                    9 TONES
                  </span>
                </div>
              </div>

              {/* Base color card */}
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
                    display: 'flex',
                    width: '88px',
                    height: '88px',
                    borderRadius: '22px',
                    backgroundColor: fullHex,
                    border: '1px solid rgba(255,255,255,0.5)',
                    boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.24), 0 12px 26px ${fullHex}66`,
                    marginRight: '15px',   // ✅
                  }}
                />

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <span
                    style={{
                      color: '#000000',
                      fontSize: '10px',
                      fontWeight: 800,
                      letterSpacing: '0.13em',
                      marginBottom: '5px',   // ✅
                    }}
                  >
                    BASE TONE
                  </span>

                  <span
                    style={{
                      color: '#0f172a',
                      fontSize: '16px',
                      fontWeight: 800,
                      marginBottom: '5px',   // ✅
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

            {/* Shade scale card */}
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
                  FROM DEEP SHADE TO LIGHT TINT
                </span>

                <span
                  style={{
                    color: '#94a3b8',
                    fontSize: '10px',
                    fontWeight: 600,
                  }}
                >
                  base highlighted
                </span>
              </div>

              {/* ✅ No gap — marginRight on children */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                }}
              >
                {shadeSwatches}
              </div>
            </div>

            {/* Range information */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '18px',
                padding: '0 4px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#000000',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    display: 'flex',
                    width: '8px',
                    height: '8px',
                    borderRadius: '999px',
                    backgroundColor: fullHex,
                    marginRight: '8px',   // ✅
                  }}
                />
                Base position: {baseIndex + 1} of 9
              </div>

              <span
                style={{
                  color: '#000000',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}
              >
                Lightness {baseLightness.toFixed(3)}
              </span>
            </div>
          </div>

          {/* Footer — ✅ No zIndex */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 54px 28px',
            }}
          >
            <span
              style={{
                color: '#94a3b8',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              Dynamic color scale
            </span>

            <span
              style={{
                color: '#000000',
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
    const message =
      error instanceof Error ? error.message : 'Unknown error';

    console.error(`Failed to generate shades OG image: ${message}`);

    return new Response('Failed to generate the image', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}