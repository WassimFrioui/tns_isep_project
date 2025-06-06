import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { getNeo4jSession } from "@/lib/neo4j";
import { writeFile } from "fs/promises";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import path from "path";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const email = session.user?.email;
  const db = getNeo4jSession("READ");

  try {
    const result = await db.run(
      `MATCH (u:User {email: $email}) RETURN u LIMIT 1`,
      { email }
    );

    const user = result.records[0]?.get("u")?.properties;

    return NextResponse.json({
      bio: user?.bio || "",
      image: user?.image || "",
      interests: user?.interests || "",
    });
  } catch (e) {
    console.error("Erreur GET /profile", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  } finally {
    await db.close();
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const form = await req.formData();
  const bio = form.get("bio") as string;
  const interests = form.get("interests") as string;
  const imageFile = form.get("image") as File | null;

  const email = session.user?.email;
  const db = getNeo4jSession("WRITE");

  try {
    let imagePath = null;

    if (imageFile && typeof imageFile === "object") {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const fileName = `${Date.now()}_${imageFile.name}`;
      const filePath = path.join(process.cwd(), "public/uploads", fileName);

      await writeFile(filePath, buffer);
      imagePath = `/uploads/${fileName}`;
    }

    await db.run(
      `
      MATCH (u:User {email: $email})
      SET u.bio = $bio,
          u.interests = $interests
          ${imagePath ? `, u.image = $imagePath` : ""}
      `,
      {
        email,
        bio,
        interests,
        imagePath,
      }
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Erreur POST /profile", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  } finally {
    await db.close();
  }
}
