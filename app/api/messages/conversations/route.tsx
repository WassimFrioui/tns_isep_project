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
      WHERE me <> other
      WITH other, m
      ORDER BY m.createdAt DESC
      WITH other, collect(m)[0] AS lastMsg
      RETURN other, lastMsg
      ORDER BY lastMsg.createdAt DESC
      `,
      { email: session.user.email }
    );

    const conversations = result.records.map((record) => {
      const other = record.get("other").properties;
      const message = record.get("lastMsg")?.properties;

      return {
        user: {
          name: other.name,
          image: other.image || "/defaut_user.png",
        },
        lastMessage: message
          ? {
              text: message.text,
              createdAt: message.createdAt,
            }
          : null,
      };
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Erreur lors de la récupération des conversations :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  } finally {
    await db.close();
  }
}
