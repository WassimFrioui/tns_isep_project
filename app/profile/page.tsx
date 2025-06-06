"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

export default function PrivateProfilePage() {
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    if (file) setImageUrl(URL.createObjectURL(file));
    else setImageUrl(null);
  };

  const handleUpdate = async () => {
    const form = new FormData();
    form.append("bio", bio);
    form.append("interests", interests);
    if (image) form.append("image", image);

    const res = await fetch("/api/profile/post", {
      method: "POST",
      body: form,
    });

    if (res.ok) alert("Profil mis à jour !");
  };

  return (
    <div className="flex flex-col items-center sm:justify-center p-4 sm:p-8 w-full max-w-md mx-auto bg-white rounded-xl shadow-md mt-6 sm:mt-10">
      <div className="relative mb-4">
        <img
          src={imageUrl || "/default-profile.png"}
          alt="profile"
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow"
        />
        <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <span className="text-xs">Modifier</span>
        </label>
      </div>
      <textarea
        className="w-full p-2 border rounded mb-2 text-center text-sm sm:text-base resize-none"
        placeholder="Bio"
        value={bio}
        onChange={(e) => {
          if (e.target.value.length <= 90) setBio(e.target.value);
        }}
        rows={2}
        maxLength={90}
      />
      <p className="text-xs text-gray-500 mb-4">
        {bio.length}/90 caractères
      </p>
      <input
        className="w-full p-2 border rounded mb-4 text-center text-sm sm:text-base"
        placeholder="Intérêts (ex: sport, musique)"
        value={interests}
        onChange={(e) => setInterests(e.target.value)}
      />
      <button
        onClick={handleUpdate}
        className="bg-blue-600 text-white px-4 py-2 sm:px-6 rounded-md font-semibold shadow w-full sm:w-auto"
      >
        Enregistrer
      </button>
      <Navbar />
    </div>
  );
}
