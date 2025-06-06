import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getNeo4jSession } from "@/lib/neo4j";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json([], { status: 401 });

  const sessionNeo = getNeo4jSession("READ");
  const email = session.user?.email;

  try {
    const result = await sessionNeo.run(
      `
      MATCH (me:User {email: $email})
      OPTIONAL MATCH (me)-[:FRIEND]-(f:User)
      OPTIONAL MATCH (suggest:User)
        WHERE (me)-[:INTERESTED_IN]->()<-[:INTERESTED_IN]-(suggest)
          AND NOT (me)-[:FRIEND]-(suggest)
          AND NOT (me)-[:REQUESTED]->(suggest)
          AND NOT (suggest)-[:REQUESTED]->(me)
          AND suggest <> me
      OPTIONAL MATCH (other:User)-[:REQUESTED]->(me)
      RETURN collect(DISTINCT f) AS friends,
             collect(DISTINCT suggest) AS suggestions,
             collect(DISTINCT other) AS requests
      `,
      { email }
    );

    const [record] = result.records;
    interface User {
      [key: string]: unknown;
    }
    const friends = record.get("friends").map((f: User) => f.properties);
    const suggestions = record.get("suggestions").map((s: User) => s.properties);
    const requests = record.get("requests").map((r: User) => r.properties);

    return NextResponse.json({ friends, suggestions, requests });
  } catch (err) {
    console.error("Erreur data friends", err);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  } finally {
    await sessionNeo.close();
  }
}
