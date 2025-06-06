// components/CreatePostForm.tsx

import { useState } from "react";

export function CreatePostForm() {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [visibility, setVisibility] = useState("public");

  const handlePost = async () => {
    const form = new FormData();
    form.append("content", content);
    form.append("visibility", visibility);
    if (image) form.append("image", image);

    const res = await fetch("/api/posts", {
      method: "POST",
      body: form,
    });

    if (res.ok) {
      alert("Post publié !");
      setContent("");
      setImage(null);
      setVisibility("public");
    }
  };

  return (
    <div className="mt-8 border-t pt-4">
      <h2 className="text-lg font-semibold mb-2">Créer un post</h2>

      <textarea
        className="w-full p-2 border mb-2"
        placeholder="Exprime-toi..."
        value={content}
        maxLength={200}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="text-right text-sm text-gray-500 mb-2">
        {content.length}/200
      </div>

      <input
        type="file"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
        className="mb-2"
      />

      <select
        value={visibility}
        onChange={(e) => setVisibility(e.target.value)}
        className="w-full border p-2 rounded mb-2"
      >
        <option value="public">🌍 Public</option>
        <option value="friends">👥 Amis uniquement</option>
        <option value="private">🔒 Moi uniquement</option>
      </select>

      <button onClick={handlePost} className="bg-green-600 text-white px-4 py-2 rounded">
        Publier
      </button>
    </div>
  );
}
