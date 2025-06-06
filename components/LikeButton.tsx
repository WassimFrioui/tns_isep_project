"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FaHeart } from "react-icons/fa";

type Props = {
  postId: string;
  initialLikes: number;
};

export default function LikeButton({ postId, initialLikes }: Props) {
  const { data: session } = useSession();

  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialLikes);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikeState = async () => {
      const res = await fetch(`/api/likes/status?postId=${postId}`);
      const data = await res.json();
      setLiked(data.liked);
      setCount(data.count);
      setLoading(false);
    };

    if (session?.user) fetchLikeState();
    else setLoading(false);
  }, [postId, session]);

  const toggleLike = async () => {
    const res = await fetch("/api/likes/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });

    const data = await res.json();
    setLiked(data.liked);
    setCount(data.count);
  };

  if (!session || loading) return null;

  return (
    <button
      onClick={toggleLike}
      className="mt-2 flex items-center gap-2"
      type="button"
    >
      <FaHeart
        className={`text-xl ${liked ? "text-red-500" : "text-gray-400"}`}
      />
    </button>
  );
}
