import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getNeo4jSession } from "@/lib/neo4j";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { postId } = await req.json();
  const email = session.user?.email;
  const sessionNeo = getNeo4jSession("WRITE");

  try {
    const check = await sessionNeo.run(
      `
      MATCH (u:User {email: $email})-[r:LIKED]->(p:Post {id: $postId})
      RETURN r
      `,
      { email, postId }
    );

    if (check.records.length > 0) {
      await sessionNeo.run(
        `
        MATCH (u:User {email: $email})-[r:LIKED]->(p:Post {id: $postId})
        DELETE r
        `,
        { email, postId }
      );
      return NextResponse.json({ liked: false });
    } else {
      await sessionNeo.run(
        `
        MATCH (u:User {email: $email}), (p:Post {id: $postId})
        MERGE (u)-[:LIKED]->(p)
        `,
        { email, postId }
      );
      return NextResponse.json({ liked: true });
    }
  } catch (err) {
    console.error("Erreur toggle like", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  } finally {
    await sessionNeo.close();
  }
}
