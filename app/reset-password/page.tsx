"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!token) {
      setError("Lien de réinitialisation invalide.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
    if (res.ok) {
      setSuccess(true);
    } else {
      const data = await res.json();
      setError(data.error || "Erreur serveur.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">🔄 Réinitialiser le mot de passe</h1>
      {success ? (
        <p className="text-green-600">Votre mot de passe a été réinitialisé.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-500">{error}</div>}
          <input
            type="password"
            className="w-full border px-3 py-2 rounded"
            placeholder="Nouveau mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            className="w-full border px-3 py-2 rounded"
            placeholder="Confirmez le mot de passe"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Réinitialiser
          </button>
        </form>
      )}
    </div>
  );
}