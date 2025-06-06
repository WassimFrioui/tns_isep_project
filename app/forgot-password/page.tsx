"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/auth/reset", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    if (res.ok) setSent(true);
    else alert("Erreur !");
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">🔑 Mot de passe oublié</h1>
      {sent ? (
        <p className="text-green-600">Un lien vous a été envoyé par email (simulé)</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            className="w-full border px-3 py-2 rounded"
            placeholder="Votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Envoyer le lien
          </button>
        </form>
      )}
    </div>
  );
}
