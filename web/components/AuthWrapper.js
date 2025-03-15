"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { isAuthenticated } from "../utils/auth";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "./LoadingSpinner";

// auth context
const AuthContext = createContext(undefined);

// useAuth hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthWrapper");
  }
  return context;
}

export default function AuthWrapper({ children }) {
  const [auth, setAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = isAuthenticated();
      setAuth(isAuth);
      setLoading(false);
      if (!isAuth && window.location.pathname !== "/") {
        router.push("/");
      } else if (isAuth && window.location.pathname === "/") {
        router.push("/contacts");
      }
    };

    checkAuth();
  }, []);

  const value = {
    auth,
    setAuth
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
