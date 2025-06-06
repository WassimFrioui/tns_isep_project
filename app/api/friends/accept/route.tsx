import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getNeo4jSession } from "@/lib/neo4j";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { requesterName } = await req.json(); // Nom de la personne qui a envoyé la demande

  const userEmail = session.user?.email;
  const sessionNeo = getNeo4jSession("WRITE");

  try {
    const result = await sessionNeo.run(
      `
      MATCH (me:User {email: $email}), (requester:User {name: $requesterName})
      MATCH (requester)-[r:REQUESTED]->(me)
      DELETE r
      CREATE (me)-[:FRIEND]->(requester)
      CREATE (requester)-[:FRIEND]->(me)
      RETURN me, requester
      `,
      { email: userEmail, requesterName }
    );

    if (result.records.length === 0) {
      return NextResponse.json({ error: "Demande non trouvée" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Erreur acceptation", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  } finally {
    await sessionNeo.close();
  }
}
