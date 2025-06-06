'use client'

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";

type User = {
  name: string;
  image?: string;
  bio?: string;
};

export default function FriendListPage() {
  const { data: session } = useSession();

  const [friends, setFriends] = useState<User[]>([]);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [requests, setRequests] = useState<User[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!session?.user) return;

    fetch("/api/friends/data")
      .then((res) => res.json())
      .then(({ friends, suggestions, requests }) => {
        setFriends(friends);
        setSuggestions(suggestions);
        setRequests(requests);
      });
  }, [session]);

  const handleAction = async (requester: string, action: "accept" | "reject") => {
    await fetch(`/api/friends/${action}`, {
      method: "POST",
      body: JSON.stringify({ requesterName: requester }),
    });
    setRequests((prev) => prev.filter((r) => r.name !== requester));
    if (action === "accept") setFriends((prev) => [...prev, { name: requester }]);
  };

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <h2 className="text-xl font-bold mb-2">👥 Mes amis</h2>
        <input
          type="text"
          placeholder="Rechercher un ami..."
          className="w-full border p-2 mb-4"
          onChange={(e) => setSearch(e.target.value)}
        />
        <ul className="space-y-2">
          {friends
            .filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
            .map((friend) => (
              <li key={friend.name} className="p-2 border rounded">
                <a href={`/profile/${friend.name}`} className="text-blue-600 hover:underline">
                  {friend.name}
                </a>
              </li>
            ))}
        </ul>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-2">🎯 Suggestions d’amis</h2>
        <ul className="space-y-2">
          {suggestions.map((user) => (
            <li key={user.name} className="p-2 border rounded">
              <p className="font-semibold">{user.name}</p>
              {user.bio && <p className="text-sm text-gray-500">{user.bio}</p>}
              <a
                href={`/profile/${user.name}`}
                className="text-sm text-blue-600 hover:underline block mt-1"
              >
                Voir profil
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">📨 Demandes reçues</h2>
        <ul className="space-y-2">
          {requests.map((req) => (
            <li key={req.name} className="p-2 border rounded">
              <p className="font-semibold">{req.name}</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleAction(req.name, "accept")}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Accepter
                </button>
                <button
                  onClick={() => handleAction(req.name, "reject")}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Refuser
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Navbar />
    </div>
  );
}
