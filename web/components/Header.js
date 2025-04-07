"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./AuthWrapper";
import { logout } from "../utils/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Header() {
  const [theme, setTheme] = useState("dark");
  const { auth, setAuth } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    setAuth(false);
    router.push("/");
  };

  useEffect(() => {
    const stored = localStorage.getItem("theme");

    if (stored) {
      setTheme(stored);
      document.documentElement.classList.add(stored);
    } else {
      document.documentElement.classList.add("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newTheme);
  };

  return (
    <header className="bg-[#1f1f1f] text-white py-4 fixed top-0 w-full shadow-md z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex-1">
          <button
            onClick={toggleTheme}
            className="relative w-16 h-8 rounded-full bg-gray-700 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              {theme === "dark" ? (
                <svg
                  className="w-5 h-5 text-yellow-300 mr-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-yellow-300 ml-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
                  />
                </svg>
              )}
            </div>
            <div
              className={`relative w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                theme === "dark" ? "translate-x-9" : "translate-x-1"
              }`}
            />
          </button>
        </div>
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
              className="bg-blue-500 hover:bg-blue-600 px-2 md:px-10 py-2 rounded text-sm transition-colors"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
