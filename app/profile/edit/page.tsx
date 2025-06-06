"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EditProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [bio, setBio] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [interests, setInterests] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/profile")
        .then((res) => res.json())
        .then((data) => {
          setBio(data.bio || "");
          setImagePreview(data.image || "");
          setInterests(data.interests || "");
        });
    }
  }, [status]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("bio", bio);
    formData.append("interests", interests);
    if (imageFile) {
      formData.append("image", imageFile); // fichier image
    }

    const res = await fetch("/api/profile/get", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      alert("Profil mis à jour !");
      router.push(`/profile`);
    } else {
      alert("Erreur lors de la mise à jour du profil");
    }
  };

  if (status === "loading") return <p className="p-4">Chargement...</p>;
  if (status === "unauthenticated") return <p className="p-4">Non connecté.</p>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">✏️ Modifier mon profil</h1>

      <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        <div>
          <label className="block text-sm font-medium">Bio</label>
          <textarea
            className="w-full border px-3 py-2 rounded"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={160}
          />
          <p className="text-xs text-gray-500 mt-1">{bio.length}/160 caractères</p>
        </div>

        <div>
          <label className="block text-sm font-medium">Image de profil</label>
          <input
            className="w-full border px-3 py-2 rounded"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Aperçu"
              className="w-24 h-24 rounded-full mt-3 object-cover border"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Intérêts</label>
          <input
            className="w-full border px-3 py-2 rounded"
            type="text"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="Ex: Musique, IA, Sport"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Enregistrer les modifications
        </button>
      </form>
    </div>
  );
}
