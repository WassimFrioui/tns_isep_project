import { getNeo4jSession } from "@/lib/neo4j";
import { NextResponse } from "next/server";
import crypto from "crypto";


export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email requis" }, { status: 400 });
  }

  const session = getNeo4jSession("WRITE");

  try {

    const result = await session.run(
      `
      MATCH (u:User {email: $email})
      RETURN u LIMIT 1
      `,
      { email }
    );
    if (result.records.length === 0) {
      return NextResponse.json({ success: true });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const createdAt = Date.now();

    await session.run(
      `
      MATCH (u:User {email: $email})
      CREATE (u)-[:HAS_TOKEN]->(t:RESET_TOKEN {value: $token, createdAt: $createdAt})
      `,
      { email, token, createdAt }
    );

    console.log(`[DEV] Lien de réinitialisation envoyé à ${email}: http://localhost:3000/reset-password?token=${token}`);   

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Erreur reset request", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  } finally {
    await session.close();
  }
}