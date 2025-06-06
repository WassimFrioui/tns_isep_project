"use client";

import { useState } from "react";
import {CreatePostForm} from "@/components/PostForm";

export default function PrivateProfilePage() {
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const handleUpdate = async () => {
    const form = new FormData();
    form.append("bio", bio);
    form.append("interests", interests);
    if (image) form.append("image", image);

    const res = await fetch("/api/profile", {
      method: "POST",
      body: form,
    });

    if (res.ok) alert("Profil mis à jour !");
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Mon Profil</h1>

      <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="mb-4" />

      <textarea
        className="w-full p-2 border mb-4"
        placeholder="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />

      <input
        className="w-full p-2 border mb-4"
        placeholder="Intérêts (ex: sport, musique)"
        value={interests}
        onChange={(e) => setInterests(e.target.value)}
      />

      <button onClick={handleUpdate} className="bg-blue-600 text-white px-4 py-2 rounded">
        Enregistrer
      </button>

      <CreatePostForm />
    </div>
  );
}
