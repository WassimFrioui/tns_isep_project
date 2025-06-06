"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FaHome, FaPlusSquare, FaHeart, FaUser, FaUsers } from "react-icons/fa";
import { useSession } from "next-auth/react";

const Navbar: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();

  // Récupération du nom d'utilisateur pour le profil
  const name = session?.user?.name;

  const navItems = [
    { icon: <FaHome />, label: "Home", href: "/" },
    { icon: <FaUsers />, label: "Friends", href: "/friends" },
    { icon: <FaPlusSquare />, label: "Add", href: "/profile" },
    { icon: <FaHeart />, label: "Likes", href: "/likes" },
    {
      icon: <FaUser />,
      label: "Profil",
      href: name ? `/profile/${name}` : "/profile", // fallback si pas connecté
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-[60px] z-50">
      {navItems.map((item, idx) => {
        const isActive = router && typeof window !== "undefined" && window.location.pathname === item.href;

        return (
          <a
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center transition duration-200
              ${idx === 2
                ? "bg-[#fe2c55] text-white rounded-full w-12 h-12 text-2xl"
                : isActive
                  ? "text-[#fe2c55] w-8 h-8 text-2xl"
                  : "text-gray-900 w-8 h-8 text-2xl"
              }`}
          >
            {item.icon}
          </a>
        );
      })}
    </nav>
  );
};

export default Navbar;
