import { NextRequest, NextResponse } from 'next/server';

const LOCALES = new Set(['id', 'ms', 'vi', 'zh', 'zh-tw', 'ja', 'ko', 'hi', 'es', 'pt']);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Never rewrite API routes or Next.js internals
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) {
    return NextResponse.next();
  }

  // Strip optional locale prefix (/es/physics/kinematics/ -> /physics/kinematics/)
  const segments = pathname.split('/').filter(Boolean);
  let hadLocale = false;
  if (segments.length > 0 && LOCALES.has(segments[0])) {
    segments.shift();
    hadLocale = true;
  }

  // Static assets with file extensions (.js, .css, .jpg, .mp4, .woff2, etc.)
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) {
    if (!hadLocale) {
      return NextResponse.next();
    }
    const assetUrl = req.nextUrl.clone();
    assetUrl.pathname = `/${segments.join('/')}`;
    return NextResponse.rewrite(assetUrl);
  }

  const normalizedDir = segments.length === 0 ? '/' : `/${segments.join('/')}/`;
  const targetUrl = req.nextUrl.clone();
  targetUrl.pathname = `${normalizedDir}index.html`;

  return NextResponse.rewrite(targetUrl);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image).*)'],
};
