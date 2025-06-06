import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getNeo4jSession } from "@/lib/neo4j";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { targetName } = await req.json();
  const email = session.user?.email;

  const sessionNeo = getNeo4jSession("WRITE");

  try {
    await sessionNeo.run(
      `
      MATCH (me:User {email: $email})-[r:FRIEND]-(u:User {name: $targetName})
      DELETE r
      `,
      { email, targetName }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erreur suppression ami", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  } finally {
    await sessionNeo.close();
  }
}
