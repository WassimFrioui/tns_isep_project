import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/neo4j';
import bcrypt from 'bcrypt';
import { signToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const session = getSession();

  const result = await session.run(
    `MATCH (u:User {email: $email}) RETURN u LIMIT 1`,
    { email }
  );
  session.close();

  if (result.records.length === 0) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const user = result.records[0].get('u').properties;

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Générer token JWT
  const token = signToken({ userId: user.username, email: user.email });

  const response = NextResponse.json({ message: 'Logged in' });
  // Set cookie HttpOnly sécurisé
  response.cookies.set('token', token, {
    httpOnly: true,
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 jours
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  return response;
}
