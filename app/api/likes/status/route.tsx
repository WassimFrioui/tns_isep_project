import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getNeo4jSession } from "@/lib/neo4j";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  const url = new URL(req.url);
  const postId = url.searchParams.get("postId");
  const db = getNeo4jSession("READ");

  try {
    const result = await db.run(
      `
      MATCH (p:Post {id: $postId})
      OPTIONAL MATCH (u:User {email: $email})-[l:LIKED]->(p)
      OPTIONAL MATCH (x:User)-[:LIKED]->(p)
      RETURN count(x) AS count, l IS NOT NULL AS liked
      `,
      { postId, email }
    );

    const record = result.records[0];
    return NextResponse.json({
      count: record.get("count").toNumber?.() ?? 0,
      liked: record.get("liked"),
    });
  } catch (e) {
    console.error("Erreur status like", e);
    return NextResponse.json({ count: 0, liked: false });
  } finally {
    await db.close();
  }
}
