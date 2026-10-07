import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const BLOCKED_BOTS =
  /ahrefsbot|semrushbot|mj12bot|dotbot|petalbot|seranking|dataforseo|blexbot|bytespider|zoominfobot|sogou|megaindex|majestic/i;

export function proxy(request: NextRequest) {
  const ua = request.headers.get('user-agent');

  if (!ua) {
    return NextResponse.next();
  }

  if (BLOCKED_BOTS.test(ua)) {
    return new NextResponse('Blocked', {
      status: 403,
      headers: {
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|_next/data|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|css|js|woff2?|xml|txt)$).*)',
  ],
};
