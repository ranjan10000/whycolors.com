// proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 🚫 Block SEO/data-scraping crawlers
const BLOCKED_BOTS =
  /ahrefsbot|semrushbot|mj12bot|dotbot|petalbot|seranking|dataforseo|blexbot|bytespider|zoominfobot|sogou|megaindex|majestic/i;

export function proxy(request: NextRequest) {
  const ua = request.headers.get('user-agent') || '';

  // Block known SEO crawlers
  if (BLOCKED_BOTS.test(ua)) {
    return new NextResponse('Blocked', {
      status: 403,
      headers: {
        'Cache-Control': 'no-store',              // ✅ Don't cache 403
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};