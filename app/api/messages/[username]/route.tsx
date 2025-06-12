import { getNeo4jSession } from "@/lib/neo4j";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

type Params = { params: { username: string } };

export async function GET(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getNeo4jSession("READ");

  try {
    const result = await db.run(
      `
      MATCH (me:User {email: $email})
      MATCH (friend:User {name: $username})
      MATCH (me)-[:SENT]->(m:Message)-[:TO]->(friend)
      RETURN m, 'sent' AS direction
      UNION
      MATCH (me:User {email: $email})
      MATCH (friend:User {name: $username})
      MATCH (friend)-[:SENT]->(m:Message)-[:TO]->(me)
      RETURN m, 'received' AS direction
      ORDER BY m.createdAt DESC
      `,
      { email: session.user.email, username: decodeURIComponent(params.username) }
    );

    const messages = result.records.map((r) => {
      const msg = r.get("m").properties;
      return {
        id: msg.id,
        text: msg.text,
        createdAt: msg.createdAt,
        direction: r.get("direction"),
      };
    });

    return NextResponse.json({ messages });
  } catch (e) {
    console.error("Erreur GET messages", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  } finally {
    await db.close();
  }
}
