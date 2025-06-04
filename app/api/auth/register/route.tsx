import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/neo4j';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  const { email, password, username } = await req.json();

  if (!email || !password || !username) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const session = getSession();

  // Vérifier unicité username/email
  const check = await session.run(
    `MATCH (u:User) WHERE u.email = $email OR u.username = $username RETURN u LIMIT 1`,
    { email, username }
  );
  if (check.records.length > 0) {
    session.close();
    return NextResponse.json({ error: 'User/email already exists' }, { status: 409 });
  }

  // Hash password
  const hash = await bcrypt.hash(password, 10);

  // Créer user
  await session.run(
    `CREATE (u:User {email: $email, username: $username, password: $password}) RETURN u`,
    { email, username, password: hash }
  );
  session.close();

  return NextResponse.json({ message: 'User created' }, { status: 201 });
}
