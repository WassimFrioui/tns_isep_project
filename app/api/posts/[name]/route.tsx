import { getNeo4jSession } from "@/lib/neo4j";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { name: string } }) {
  const session = getNeo4jSession("READ");

  try {
    const result = await session.run(
      `
      MATCH (u:User {name: $name})-[:POSTED]->(p:Post)
      RETURN p ORDER BY p.createdAt DESC
      `,
      { name: params.name }
    );

    const posts = result.records.map((r) => r.get("p").properties);
    return NextResponse.json(posts);
  } catch (e) {
    console.error("Erreur get posts", e);
    return NextResponse.json([], { status: 500 });
  } finally {
    await session.close();
  }
}
