import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

type AuthState = {
  userId?: string | null;
  isPublicRoute?: boolean;
  isApiRoute?: boolean;
}

function beforeAuth(_auth: AuthState, _req: NextRequest): NextResponse | null {
  return null;
}

async function afterAuth(auth: AuthState, req: NextRequest): Promise<NextResponse> {
  const url = new URL(req.url);
  const searchParams = url.searchParams.toString();
  const hostname = req.headers;
   
  const pathWithSearchParams = `${url.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ''
  }`;

  // Check for all Stripe API endpoints
  if (url.pathname.startsWith('/api/stripe/')) {
    return NextResponse.next();
  }

  // Rest of your existing middleware logic remains the same
  const customSubDomain = hostname
    .get('host')
    ?.split(`${process.env.NEXT_PUBLIC_DOMAIN}`)
    .filter(Boolean)[0];

  if (customSubDomain) {
    return NextResponse.rewrite(
      new URL(`/${customSubDomain}${pathWithSearchParams}`, req.url)
    );
  }

  if (url.pathname === '/sign-in' || url.pathname === '/sign-up') {
    return NextResponse.redirect(new URL(`/agency/sign-in`, req.url));
  }

  if (
    url.pathname === '/' ||
    (url.pathname === '/site' && url.host === process.env.NEXT_PUBLIC_DOMAIN)
  ) {
    return NextResponse.rewrite(new URL('/site', req.url));
  }

  if (
    url.pathname.startsWith('/agency') ||
    url.pathname.startsWith('/subaccount')
  ) {
    return NextResponse.rewrite(new URL(`${pathWithSearchParams}`, req.url));
  }

  // Update public routes to include all necessary paths
  const publicRoutes = [
    '/site', 
    '/api/uploadthing',
    '/api/stripe'  // This will match all Stripe API routes
  ];
   
  if (!publicRoutes.some(route => url.pathname.startsWith(route))) {
    if (!auth.userId) {
      return NextResponse.redirect(new URL('/agency/sign-in', req.url));
    }
  }

  return NextResponse.next();
}

export default clerkMiddleware((auth, req) => {
  const beforeAuthResult = beforeAuth(auth as AuthState, req);
  if (beforeAuthResult) return beforeAuthResult;

  return afterAuth(auth as AuthState, req);
});

export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ]
};