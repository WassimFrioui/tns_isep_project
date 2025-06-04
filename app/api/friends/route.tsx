import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/neo4j';
import { verifyToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const user = verifyToken(token || '');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { friendUsername } = await req.json();
  if (!friendUsername) return NextResponse.json({ error: 'Missing friend username' }, { status: 400 });

  const session = getSession();

  // Créer relation FRIEND entre user.username et friendUsername
  await session.run(
    `MATCH (a:User {username: $user}), (b:User {username: $friend}) 
     MERGE (a)-[:FRIEND]-(b)`,
    { user: user.userId, friend: friendUsername }
  );

  session.close();

  return NextResponse.json({ message: 'Friend added' });
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const user = verifyToken(token || '');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { friendUsername } = await req.json();
  if (!friendUsername) return NextResponse.json({ error: 'Missing friend username' }, { status: 400 });

  const session = getSession();

  await session.run(
    `MATCH (a:User {username: $user})-[r:FRIEND]-(b:User {username: $friend}) DELETE r`,
    { user: user.userId, friend: friendUsername }
  );

  session.close();

  return NextResponse.json({ message: 'Friend removed' });
}
