import { getNeo4jSession } from "@/lib/neo4j";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { sendResetEmail } from "@/lib/mail"; // Assurez-vous d'avoir cette fonction pour envoyer l'email

export async function POST(req: Request) {
  const { email } = await req.json();
  const session = getNeo4jSession("WRITE");

  try {
    const check = await session.run(
      `MATCH (u:User {email: $email}) RETURN u LIMIT 1`,
      { email }
    );
    if (check.records.length === 0) return NextResponse.json({ ok: true }); // silencieux

    const token = randomUUID();
    const now = Date.now();

    await session.run(
      `
      MATCH (u:User {email: $email})
      CREATE (t:RESET_TOKEN {value: $token, createdAt: $now})
      MERGE (u)-[:HAS_TOKEN]->(t)
      `,
      { email, token, now }
    );

    await sendResetEmail(email, token);
        console.log(`Simulated email: http://localhost:3000/reset-password?token=${token}`);

    return NextResponse.json({ ok: true });
    }
    catch (e) {

    console.error("Erreur lors de la demande de réinitialisation", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  } finally {
    await session.close();
  }     
}