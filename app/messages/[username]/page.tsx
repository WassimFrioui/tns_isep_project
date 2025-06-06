'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';

type Message = {
  id: string;
  text: string;
  createdAt: string;
  direction: 'sent' | 'received';
};

export default function ChatPage() {
  const { data: session } = useSession();
  const { username } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    const res = await fetch(`/api/messages/${username}`);
    const data = await res.json();
    setMessages(data.messages || []);
  };

  useEffect(() => {
    if (session) fetchMessages();
  }, [session]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim()) return;

    const res = await fetch('/api/messages/send', {
      method: 'POST',
      body: JSON.stringify({
        toName: username,
        text,
      }),
    });

    if (res.ok) {
      setText('');
      fetchMessages();
    } else {
      alert("Erreur lors de l'envoi");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 flex flex-col h-[90vh]">
      <h1 className="text-xl font-bold mb-4">💬 Chat avec @{username}</h1>

      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-xs px-4 py-2 rounded-lg ${
              msg.direction === 'sent'
                ? 'ml-auto bg-blue-600 text-white text-right'
                : 'mr-auto bg-gray-200 text-black text-left'
            }`}
          >
            <p className="whitespace-pre-wrap">{msg.text}</p>
            <p className="text-xs opacity-70 mt-1">
              {new Date(msg.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2 mt-auto">
        <input
          className="flex-1 border px-3 py-2 rounded"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Écrire un message..."
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}
