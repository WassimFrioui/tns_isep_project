import Link from "next/link";
import { getNeo4jSession } from "@/lib/neo4j";
import { getServerSession } from "next-auth"; // 🆕
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // 🆕
import { notFound } from "next/navigation";
import FreindButton from "@/components/FriendsButton";
import Navbar from "@/components/Navbar";
import SendMessageForm from "@/components/SendMessageForm";

type Props = {
  params: {
    name: string;
  };
};

type Post = {
  id: string;
  content?: string;
  image?: string;
  createdAt: string;
};

export default async function PublicProfilePage({ params }: Props) {
  const session = getNeo4jSession("READ");
  const auth = await getServerSession(authOptions); // 🆕
  const isOwner = auth?.user?.name === params.name; // 🆕

  try {
    const userResult = await session.run(
      `MATCH (u:User {name: $name}) RETURN u LIMIT 1`,
      { name: params.name }
    );

    const user = userResult.records[0]?.get("u")?.properties;
    if (!user) return notFound();

    const postsResult = await session.run(
      `
      MATCH (u:User {name: $name})-[:POSTED]->(p:Post)
      RETURN p ORDER BY p.createdAt DESC
      `,
      { name: params.name }
    );

    const posts: Post[] = postsResult.records.map((r) => {
      const p = r.get("p").properties;
      return {
        id: p.id,
        content: p.content,
        image: p.image,
        createdAt: p.createdAt,
      };
    });

    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex flex-col items-center">
          <img
            src={user.image || "/defaut_user.png"}
            alt="photo de profil"
            className="w-28 h-28 rounded-full object-cover border-4 border-gray-200"
          />
          <h1 className="mt-3 text-2xl font-bold">@{user.name}</h1>

          {isOwner ? (
            <Link
              href="/profile/edit"
              className="mt-2 text-sm px-3 py-1 bg-blue-600 text-white rounded"
            >
              Modifier mon profil
            </Link>
          ) : (
            <div className="mt-2 text-sm text-gray-500">
              <FreindButton targetName={user.name} />
              <SendMessageForm name={user.name} />
            </div>
          )}

          <p className="mt-2 text-center text-gray-700">
            {user.bio || "Aucune bio."}
          </p>

          <div className="flex gap-8 mt-4 text-center">
            <div>
              <span className="block font-bold text-lg">{posts.length}</span>
              <span className="text-xs text-gray-500">Posts</span>
            </div>
          </div>

          <div className="mt-2 text-sm text-gray-500">
            <strong>Intérêts :</strong> {user.interests || "Non renseignés"}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Publications</h2>
          {posts.length === 0 && (
            <p className="text-center text-gray-400">Aucune publication</p>
          )}
          <div className="grid grid-cols-3 gap-2">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="relative aspect-square bg-gray-100 rounded overflow-hidden block"
              >
                {post.image ? (
                  <img
                    src={post.image}
                    alt="image post"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full px-2 text-xs text-gray-700">
                    {post.content}
                  </div>
                )}
                <span className="absolute bottom-1 right-1 text-[10px] bg-black bg-opacity-60 text-white px-1 rounded">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        </div>
        <Navbar />
      </div>
    );
  } catch (e) {
    console.error("Erreur profil public", e);
    return notFound();
  } finally {
    await session.close();
  }
}
