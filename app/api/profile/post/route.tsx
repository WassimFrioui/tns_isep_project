import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getNeo4jSession } from "@/lib/neo4j";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const bio = form.get("bio")?.toString();
  const interests = form.get("interests")?.toString();
  const image = form.get("image") as File;

  let imagePath = null;
  if (image && image.size > 0) {
    const buffer = Buffer.from(await image.arrayBuffer());
    const filename = `${Date.now()}_${image.name}`;
    const fullPath = path.join(process.cwd(), "public/uploads", filename);
    await writeFile(fullPath, buffer);
    imagePath = `/uploads/${filename}`;
  }

  const sessionNeo = getNeo4jSession("WRITE");
  try {
    await sessionNeo.run(
      `
      MATCH (u:User {email: $email})
      SET u.bio = $bio,
          u.interests = $interests
      ${imagePath ? ", u.image = $imagePath" : ""}
      RETURN u
      `,
      {
        email: session.user?.email,
        bio,
        interests,
        imagePath,
      }
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  } finally {
    await sessionNeo.close();
  }
}
