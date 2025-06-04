import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getSession } from '@/lib/neo4j';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const session = getSession();
    const result = await session.run(
      `
      MATCH (u:User {username: $userId})
      RETURN u.username AS username, u.name AS name, u.bio AS bio
      `,
      { userId: decoded.userId }
    );
    session.close();

    const record = result.records[0];
    if (!record) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    return NextResponse.json({
      username: record.get('username'),
      name: record.get('name'),
      bio: record.get('bio'),
    });
  } catch (e) {
    console.error('Token invalide ou erreur :', e);
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  }
}
