import { getNeo4jSession } from "@/lib/neo4j";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound } from "next/navigation";
import LikeButton from "@/components/LikeButton";
import Nav_Top from "@/components/Nav_Top";

type Post = {
  id: string;
  content?: string;
  image?: string;
  createdAt: string;
  likeCount: number;
  author: {
    name: string;
    image?: string;
  };
};

export default async function FriendsFeedPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return notFound();

  const email = session.user.email;
  const db = getNeo4jSession("READ");

  try {
    const result = await db.run(
      `
      MATCH (me:User {email: $email})-[:FRIEND]-(friend:User)-[:POSTED]->(p:Post)
      WHERE p.visibility IN ["public", "friends"]
      OPTIONAL MATCH (liker:User)-[:LIKED]->(p)
      RETURN p, friend AS u, count(liker) AS likeCount
      ORDER BY p.createdAt DESC
      `,
      { email }
    );

    const posts: Post[] = result.records.map((record) => {
      const p = record.get("p").properties;
      const u = record.get("u").properties;
      const likeCount = record.get("likeCount")?.toNumber?.() || 0;

      return {
        id: p.id,
        content: p.content,
        image: p.image,
        createdAt: p.createdAt,
        likeCount,
        author: {
          name: u.name,
          image: u.image || "/defaut_user.png",
        },
      };
    });

    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Nav_Top />
        <h1 className="text-2xl font-bold mb-6">🧑‍🤝‍🧑 Fil des amis</h1>

        {posts.length === 0 && (
          <p className="text-gray-600">Aucune publication de vos amis.</p>
        )}

        {posts.map((post) => (
          <div key={post.id} className="mb-6 border p-4 rounded shadow">
            <div className="flex items-center mb-2">
              <img
                src={post.author.image}
                alt={post.author.name}
                className="w-10 h-10 rounded-full mr-3 object-cover"
              />
              <a
                href={`/profile/${post.author.name}`}
                className="font-semibold text-blue-600 hover:underline"
              >
                {post.author.name}
              </a>
            </div>

            {post.content && <p className="mb-2">{post.content}</p>}

                {post.image && post.image.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                  <video
                    src={post.image}
                    controls
                    className="max-w-full object-contain mx-auto my-auto"
                    style={{ display: "block" }}
                  />
                ) : post.image ? (
                  <img
                    src={post.image}
                    alt="image post"
                    className="max-w-full max-h-[85%] object-contain mx-auto my-auto"
                    style={{ display: "block" }}
                  />
                ) : null}

            <p className="text-sm text-gray-500 mt-2">
              Posté le {new Date(post.createdAt).toLocaleString()}
            </p>

            <LikeButton postId={post.id} initialLikes={post.likeCount} />
          </div>
        ))}
      </div>
    );
  } catch (err) {
    console.error("Erreur feed friends", err);
    return <p className="p-6 text-red-500">Erreur lors du chargement du fil.</p>;
  } finally {
    await db.close();
  }
}
