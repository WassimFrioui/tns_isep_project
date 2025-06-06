"use client";

import { useRouter } from "next/navigation";

type Props = {
  name: string; 
};

export default function MessageButton({ name }: Props) {
  const router = useRouter();

  const openChat = () => {
    router.push(`/messages/${encodeURIComponent(name)}`);
  };

  return (
    <button
      onClick={openChat}
      className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded mx-2 transition-colors duration-200 flex items-center justify-center">
      💬
    </button>
  );
}
