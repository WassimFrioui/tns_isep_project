import { getNeo4jSession } from "@/lib/neo4j";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const db = getNeo4jSession("READ");

  try {
    const result = await db.run(
      `
      MATCH (me:User {email: $email})
      MATCH (me)-[:SENT|:RECEIVED]->(m:Message)-[:TO|:FROM]-(other:User)
      WITH other, max(m.createdAt) AS lastDate
      MATCH (other)-[:SENT|:RECEIVED]->(lastMsg:Message)
      WHERE lastMsg.createdAt = lastDate
      RETURN other, lastMsg
      ORDER BY lastMsg.createdAt DESC
      `,
      { email: session.user.email }
    );

    const conversations = result.records.map((r) => {
      const user = r.get("other").properties;
      const msg = r.get("lastMsg").properties;

      return {
        user: {
          name: user.name,
          image: user.image || "/defaut_user.png",
        },
        lastMessage: {
          text: msg.text,
          createdAt: msg.createdAt,
        },
      };
    });

    return NextResponse.json({ conversations });
  } catch (e) {
    console.error("Erreur conversations", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  } finally {
    await db.close();
  }
}
