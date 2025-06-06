import { getNeo4jSession } from "@/lib/neo4j";
import { notFound } from "next/navigation";
import LikeButton from "@/components/LikeButton";

type Props = {
  params: { id: string };
};

export default async function PostPage({ params }: Props) {
  const session = getNeo4jSession("READ");

  try {
    const result = await session.run(
      `
      MATCH (u:User)-[:POSTED]->(p:Post {id: $id})
      OPTIONAL MATCH (liker:User)-[:LIKED]->(p)
      RETURN p, u, count(liker) AS likeCount
      `,
      { id: params.id }
    );

    if (result.records.length === 0) return notFound();

    const record = result.records[0];
    const post = record.get("p").properties;
    const user = record.get("u").properties;
    const likeCount = record.get("likeCount").toNumber?.() || 0;

    const isVideo = post.image?.match(/\.(mp4|webm|ogg|mov)$/i);

    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <img
              src={user.image || "/defaut_user.png"}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover mr-3"
            />
            <a
              href={`/profile/${user.name}`}
              className="font-semibold text-blue-600 hover:underline"
            >
              {user.name}
            </a>
          </div>

          {post.content && <p className="mb-4">{post.content}</p>}

          {post.image && (
            isVideo ? (
              <video
                src={post.image}
                controls
                className="w-full rounded max-h-[500px] object-cover mb-4"
              />
            ) : (
              <img
                src={post.image}
                alt="post"
                className="w-full rounded object-cover mb-4"
              />
            )
          )}

          <p className="text-sm text-gray-500 mb-2">
            Posté le {new Date(post.createdAt).toLocaleString()}
          </p>

          <LikeButton postId={post.id} initialLikes={likeCount} />
        </div>
      </div>
    );
  } catch (e) {
    console.error("Erreur chargement post", e);
    return notFound();
  } finally {
    await session.close();
  }
}
