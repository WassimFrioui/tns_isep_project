import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getNeo4jSession } from "@/lib/neo4j";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { targetName } = await req.json(); // Nom de la personne à qui on veut envoyer la demande

  const userEmail = session.user?.email;
  const sessionNeo = getNeo4jSession("WRITE");

  try {
    const result = await sessionNeo.run(
      `
      MATCH (me:User {email: $email}), (target:User {name: $targetName})
      WHERE NOT (me)-[:FRIEND]-(target)
        AND NOT (me)-[:REQUESTED]->(target)
        AND me <> target
      CREATE (me)-[:REQUESTED]->(target)
      RETURN me, target
      `,
      { email: userEmail, targetName }
    );

    if (result.records.length === 0) {
      return NextResponse.json({ error: "Déjà ami ou demande existante" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Erreur demande d'ami", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  } finally {
    await sessionNeo.close();
  }
}
