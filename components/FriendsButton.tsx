"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function AddFriendButton({ targetName }: { targetName: string }) {
  const { data: session } = useSession();
  const [isFriend, setIsFriend] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const myName = session?.user?.name;

  useEffect(() => {
    const checkFriendStatus = async () => {
      if (!myName || !targetName || myName === targetName) return;

      const res = await fetch(`/api/friends/status?targetName=${targetName}`);
      const data = await res.json();
      setIsFriend(data.isFriend); 
    };

    checkFriendStatus();
  }, [myName, targetName]);

  const sendRequest = async () => {
    setLoading(true);
    const res = await fetch("/api/friends/request", {
      method: "POST",
      body: JSON.stringify({ targetName }),
    });
    setLoading(false);
    if (res.ok) {
      alert("Demande envoyée !");
    } else {
      alert("Erreur ou déjà demandé.");
    }
  };

  const removeFriend = async () => {
    setLoading(true);
    const res = await fetch("/api/friends/remove", {
      method: "POST",
      body: JSON.stringify({ targetName }),
    });
    setLoading(false);
    if (res.ok) {
      alert("Amitié supprimée");
      setIsFriend(false);
    } else {
      alert("Erreur lors de la suppression.");
    }
  };

  if (!session || myName === targetName || isFriend === null) return null;

  return isFriend ? (
    <button
      onClick={removeFriend}
      disabled={loading}
      className="bg-red-600 text-white px-4 py-1 rounded mt-2"
    >
      Retirer l’ami
    </button>
  ) : (
    isFriend === false && loading ? (
      <button
      disabled
      className="bg-gray-400 text-white px-4 py-1 rounded mt-2"
      >
      Demande envoyée
      </button>
    ) : (
      <button
      onClick={sendRequest}
      disabled={loading}
      className="bg-blue-600 text-white px-4 py-1 rounded mt-2"
      >
      Ajouter en ami
      </button>
    )
  );
}
