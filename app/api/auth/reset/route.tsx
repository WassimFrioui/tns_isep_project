import { getNeo4jSession } from "@/lib/neo4j";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { token, password } = await req.json();

  if (!token || !password) {
    return NextResponse.json({ error: "Champs requis" }, { status: 400 });
  }

  const session = getNeo4jSession("WRITE");

  try {
    // Vérifie si le token est encore valide (moins de 15 min)
    const result = await session.run(
      `
      MATCH (u:User)-[:HAS_TOKEN]->(t:RESET_TOKEN {value: $token})
      WHERE t.createdAt > $validSince
      RETURN u LIMIT 1
      `,
      {
        token,
        validSince: Date.now() - 1000 * 60 * 15, // 15 minutes
      }
    );

    if (result.records.length === 0) {
      return NextResponse.json({ error: "Lien expiré ou invalide" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Met à jour le mot de passe et supprime le token
    await session.run(
      `
      MATCH (u:User)-[:HAS_TOKEN]->(t:RESET_TOKEN {value: $token})
      SET u.password = $hashed
      DETACH DELETE t
      `,
      {
        token,
        hashed: hashedPassword,
      }
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Erreur reset confirm", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  } finally {
    await session.close();
  }
}
