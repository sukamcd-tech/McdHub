import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_ACCESS_KEY || process.env.AUTH_SECRET || 'mcdhub-super-secret-key-32chars-minimum-prod'
);

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('mcdhub_session')?.value;
  let user: { id: string; email: string; role: string } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      user = {
        id: payload.sub as string,
        email: payload.email as string,
        role: (payload.role as string) || 'client',
      };
    } catch {
      user = null;
    }
  }

  // Proteksi semua rute /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/gateway';
      return NextResponse.redirect(url);
    }

    if (user.role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  // Redirect jika sudah login dan akses /gateway
  if (request.nextUrl.pathname === '/gateway' && user) {
    const url = request.nextUrl.clone();
    if (user.role === 'admin') {
      url.pathname = '/admin/dashboard';
    } else {
      url.pathname = '/';
    }
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/gateway'],
};
