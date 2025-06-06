"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    signOut({
      redirect: false,
    }).then(() => {
      router.push("/login");
    });
  }, [router]);

  return (
    <div className="p-6 text-center">
      <h1 className="text-xl">Déconnexion en cours...</h1>
    </div>
  );
}
    