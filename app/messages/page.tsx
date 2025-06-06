"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

type Conversation = {
  user: { name: string; image?: string };
  lastMessage: { text: string; createdAt: string };
};

export default function ConversationListPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/messages/conversations")
      .then((res) => res.json())
      .then((data) => setConversations(data.conversations || []));
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Mes conversations</h1>

      {conversations.length === 0 && <p>Aucune conversation.</p>}

      <ul className="space-y-3">
        {conversations.map((conv) => (
          <li
            key={conv.user.name}
            className="flex items-center p-3 border rounded hover:bg-gray-100 cursor-pointer"
            onClick={() => router.push(`/messages/${conv.user.name}`)}
          >
            <img
              src={conv.user.image}
              alt={conv.user.name}
              className="w-10 h-10 rounded-full mr-3 object-cover"
            />
            <div className="flex-1">
              <p className="font-semibold">@{conv.user.name}</p>
              <p className="text-sm text-gray-600 truncate">{conv.lastMessage.text}</p>
            </div>
            <span className="text-xs text-gray-400 ml-2">
              {new Date(conv.lastMessage.createdAt).toLocaleTimeString()}
            </span>
          </li>
        ))}
      </ul>
      <Navbar />
    </div>
  );
}
