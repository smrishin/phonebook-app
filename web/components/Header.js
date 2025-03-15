"use client";

import { useAuth } from "./AuthWrapper";
import { logout } from "../utils/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Header() {
  const { auth, setAuth } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    setAuth(false);
    router.push("/");
  };

  return (
    <header className="bg-[#1f1f1f] text-white py-4 fixed top-0 w-full shadow-md z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex-1" />
        <Image
          src="/phonebook_logo.png"
          alt="Phonebook Logo"
          width={200}
          height={100}
          priority
          quality={100}
          className="object-contain h-auto"
        />
        <div className="flex-1 flex justify-end">
          {auth && (
            <button
              onClick={handleLogout}
              className="bg-blue-500 hover:bg-blue-600 px-10 py-2 rounded text-sm transition-colors"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
