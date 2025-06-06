import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getNeo4jSession } from "@/lib/neo4j";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const targetName = url.searchParams.get("targetName");

  const email = session.user?.email;
  if (!targetName) return NextResponse.json({ error: "Nom manquant" }, { status: 400 });

  const sessionNeo = getNeo4jSession("READ");

  try {
    const result = await sessionNeo.run(
      `
      MATCH (me:User {email: $email})-[:FRIEND]-(u:User {name: $targetName})
      RETURN u
      `,
      { email, targetName }
    );

    return NextResponse.json({ isFriend: result.records.length > 0 });
  } catch (err) {
    console.error("Erreur statut ami", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  } finally {
    await sessionNeo.close();
  }
}
