import { NextResponse } from 'next/server';
import { getCurrentUser, formatClientUser, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function GET(req: Request) {
  const current = await getCurrentUser(req);
  if (!current) {
    const res = NextResponse.json({ session: null, user: null });
    res.cookies.delete(SESSION_COOKIE_NAME);
    return res;
  }

  const clientUser = formatClientUser(current.user, false);
  return NextResponse.json({
    user: clientUser,
    session: {
      access_token: current.sessionToken,
      token_type: 'bearer',
      user: clientUser,
    },
  });
}
