import { NextResponse } from "next/server";
import { getNeo4jSession } from "@/lib/neo4j";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();
  const session = getNeo4jSession("WRITE");

  try {
    const existing = await session.run(
      `MATCH (u:User { email: $email }) RETURN u`,
      { email }
    );

    if (existing.records.length > 0) {
      return NextResponse.json({ error: "Utilisateur déjà existant" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const id = randomUUID();
    await session.run(
      `CREATE (u:User {
        id: $id,
        name: $name,
        email: $email,
        password: $hashedPassword
      })`,
      { id, name, email, hashedPassword }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur Register", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  } finally {
    await session.close();
  }
}
