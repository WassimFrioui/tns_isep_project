"use client";
import React, { useState } from "react";

type Tab = "foryou" | "amies";

const tabs: { label: string; value: Tab; href: string }[] = [
    { label: "For You", value: "foryou", href: "/" },
    { label: "Amies", value: "amies", href: "/freinds/feed" },
];

const Nav_Top: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>("foryou");

    return (
        <nav className="flex justify-center items-center h-12  sticky top-0 z-50">
            <div className="flex gap-8">
                {tabs.map((tab) => (
                    <a
                        key={tab.value}
                        href={tab.href}
                        onClick={() => setActiveTab(tab.value)}
                        className={`text-lg px-0 py-2 border-b-2 transition-colors duration-200 cursor-pointer
                            ${activeTab === tab.value
                                ? tab.value === "foryou"
                                    ? "font-bold text-red-500 border-red-500"
                                    : "font-bold text-black border-black"
                                : "font-normal text-gray-500 border-transparent"
                            }`}
                    >
                        {tab.label}
                    </a>
                ))}
            </div>
        </nav>
    );
};

export default Nav_Top;
