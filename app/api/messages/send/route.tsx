import { getNeo4jSession } from "@/lib/neo4j";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { toName, text } = await req.json();
  if (!text || !toName) return NextResponse.json({ error: "Données manquantes" }, { status: 400 });

  const db = getNeo4jSession("WRITE");

  try {
    await db.run(
      `
      MATCH (me:User {email: $email})
      MATCH (target:User {name: $toName})
      CREATE (me)-[:SENT]->(m:Message {
        id: $id,
        text: $text,
        createdAt: datetime()
      })-[:TO]->(target)
      `,
      {
        email: session.user.email,
        toName,
        text,
        id: randomUUID(),
      }
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Erreur POST message", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  } finally {
    await db.close();
  }
}
