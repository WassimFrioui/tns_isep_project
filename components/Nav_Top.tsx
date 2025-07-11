"use client";
import React from "react";
import { usePathname } from "next/navigation";

type Tab = "foryou" | "amies";

const tabs: { label: string; value: Tab; href: string }[] = [
    { label: "For You", value: "foryou", href: "/" },
    { label: "Amies", value: "amies", href: "/friends/feed" },
];

const Nav_Top: React.FC = () => {
    const pathname = usePathname();

    return (
        <nav className="flex justify-center items-center h-12 sticky top-0 z-50">
            <div className="flex gap-8">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    return (
                        <a
                            key={tab.value}
                            href={tab.href}
                            className={`text-lg px-0 py-2 border-b-2 transition-colors duration-200 cursor-pointer
                                ${isActive
                                    ? tab.value === "foryou"
                                        ? "font-bold text-pink-500 border-pink-500"
                                        : "font-bold text-black border-black"
                                    : "font-normal text-gray-500 border-transparent"
                                }`}
                        >
                            {tab.label}
                        </a>
                    );
                })}
            </div>
        </nav>
    );
};

export default Nav_Top;
