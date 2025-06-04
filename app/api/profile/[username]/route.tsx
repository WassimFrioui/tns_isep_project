import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/neo4j';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  const { username } = params;
  const session = getSession();

  try {
    const result = await session.run(
      `MATCH (u:User {username: $username}) 
       OPTIONAL MATCH (u)-[:FRIEND]-(f:User)
       RETURN u, count(f) as friendCount`,
      { username }
    );

    if (result.records.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = result.records[0].get('u').properties;
    const friendCount = result.records[0].get('friendCount').toInt();

    delete user.password;

    return NextResponse.json({ user, friendCount });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    session.close();
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  const { username } = params;
  const session = getSession();

  // Récupération et vérification du token
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
  } catch {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  }

  // Vérifier que l'utilisateur modifie bien son propre profil
  if (decoded.userId !== username) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const { name, bio } = await req.json();

  if (!name || !bio) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
  }

  try {
    await session.run(
      `MATCH (u:User {username: $username})
       SET u.name = $name, u.bio = $bio
       RETURN u`,
      { username, name, bio }
    );

    return NextResponse.json({ message: 'Profil mis à jour' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  } finally {
    session.close();
  }
}
    