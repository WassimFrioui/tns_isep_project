"use client";
import { useState } from "react";

export function CreatePostForm() {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [visibility, setVisibility] = useState("public");
  const [loading, setLoading] = useState(false);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setMedia(file);
    if (file) {
      setMediaUrl(URL.createObjectURL(file));
      setMediaType(file.type.startsWith("video") ? "video" : "image");
    } else {
      setMediaUrl(null);
      setMediaType(null);
    }
  };

  const handlePost = async () => {
    setLoading(true);
    const form = new FormData();
    form.append("content", content);
    form.append("visibility", visibility);
    if (media) form.append("image", media);

    const res = await fetch("/api/posts", {
      method: "POST",
      body: form,
    });

    setLoading(false);
    if (res.ok) {
      alert("Post publié !");
      setContent("");
      setMedia(null);
      setMediaUrl(null);
      setMediaType(null);
      setVisibility("public");
    }
  };

  return (
    <div className="flex flex-col items-center sm:justify-center p-4 sm:p-8 w-full max-w-md mx-auto bg-white rounded-xl shadow-md mt-6 sm:mt-10">
      <h2 className="text-lg font-semibold mb-4 text-center">Créer un post</h2>
      <div className="relative mb-4">
        {mediaUrl ? (
          mediaType === "video" ? (
            <video
              src={mediaUrl}
              controls
              className="w-24 h-24 sm:w-28 sm:h-28 rounded object-cover border-4 border-white shadow bg-gray-50"
            />
          ) : (
            <img
              src={mediaUrl}
              alt="aperçu post"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded object-cover border-4 border-white shadow bg-gray-50"
            />
          )
        ) : (
          <img
            src="/default-post.png"
            alt="aperçu post"
            className="w-24 h-24 sm:w-28 sm:h-28 rounded object-cover border-4 border-white shadow bg-gray-50"
          />
        )}
        <label className="absolute bottom-0 right-0 bg-green-600 text-white rounded-full p-2 cursor-pointer">
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleMediaChange}
            className="hidden"
          />
          <span className="text-xs">Image/Video</span>
        </label>
      </div>
      
      <textarea
        className="w-full p-2 border rounded mb-2 text-center text-sm sm:text-base resize-none"
        placeholder="Exprime-toi..."
        value={content}
        onChange={(e) => {
          if (e.target.value.length <= 200) setContent(e.target.value);
        }}
        rows={3}
        maxLength={200}
      />
      <p className="text-xs text-gray-500 mb-2 text-right w-full">
        {content.length}/200 caractères
      </p>

      <select
        value={visibility}
        onChange={(e) => setVisibility(e.target.value)}
        className="w-full border p-2 rounded mb-4 text-sm"
      >
        <option value="public">🌍 Public</option>
        <option value="friends">👥 Amis uniquement</option>
        <option value="private">🔒 Moi uniquement</option>
      </select>

      <button
        onClick={handlePost}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 sm:px-6 rounded-md font-semibold shadow w-full sm:w-auto"
      >
        {loading ? "Publication..." : "Publier"}
      </button>
    </div>
  );
}