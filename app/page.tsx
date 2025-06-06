  import { getNeo4jSession } from "@/lib/neo4j";
  import Navbar from "@/components/Navbar";
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

  export default async function GlobalFeedPage() {
    const session = getNeo4jSession("READ");

    try {
      const result = await session.run(
        `
        MATCH (u:User)-[:POSTED]->(p:Post)
        WHERE p.visibility = "public"
        OPTIONAL MATCH (liker:User)-[:LIKED]->(p)
        RETURN p, u, count(liker) AS likeCount
        ORDER BY p.createdAt DESC
        `
      );

      const posts: Post[] = result.records.map((record) => {
        const p = record.get("p").properties;
        const u = record.get("u").properties;
        const likeCount = record.get("likeCount").toNumber?.() || 0;

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
        <div className="relative py-12 max-w-xl mx-auto px-2">
          <Nav_Top />
          {posts.length === 0 && <p>Aucun post pour l’instant.</p>}

          <div className="flex flex-col gap-8">
            {posts.map((post) => (
              <div
                key={post.id}
                className="relative bg-black rounded-xl overflow-hidden shadow-lg h-auto flex items-center justify-center"
                style={{ minHeight: 400 }}
              >
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

                <div className="absolute bottom-0 left-0 p-4 text-white bg-gradient-to-t from-black/70 via-black/30 to-transparent w-full">
                  <div className="flex items-center mb-2">
                    <img
                      src={post.author.image}
                      alt={post.author.name}
                      className="w-9 h-9 rounded-full mr-2 border-2 border-white object-cover"
                    />
                    <a
                      href={`/profile/${post.author.name}`}
                      className="font-semibold hover:underline"
                    >
                      {post.author.name}
                    </a>
                  </div>
                  {post.content && (
                    <p className="mb-1 text-sm">{post.content}</p>
                  )}
                  <p className="text-xs text-gray-200">
                    Posté le {new Date(post.createdAt).toLocaleString()}
                  </p>
                </div>

                
                <div className="absolute right-4 bottom-16 flex flex-col items-center gap-4">
                  <div className="flex flex-col items-center">
                    <LikeButton postId={post.id} initialLikes={post.likeCount} />
                    <span className="text-white text-xs mt-1">
                      {post.likeCount}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Navbar />
        </div>
      );
    } catch (error) {
      console.error("Erreur récupération du feed", error);
      return (
        <p className="p-6 text-red-500">
          Erreur lors du chargement du fil d&apos;actualité.
        </p>
      );
    } finally {
      await session.close();
    }
  }