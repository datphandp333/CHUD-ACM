"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import Link from "next/link";

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

// ====================================================
// AUTH PROVIDER
// ====================================================

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isLoggedIn, setIsLoggedIn] =
    useState(false);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ====================================================
// AUTH HOOK
// ====================================================

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
}

// ====================================================
// SIGN IN / SIGN OUT
// ====================================================

export default function SignInOut() {
  const {
    isLoggedIn,
    setIsLoggedIn,
  } = useAuth();

  function handleLogOut() {
    setIsLoggedIn(false);
  }

  return (
    <div className="flex justify-end">

      {isLoggedIn ? (
        <button
          type="button"
          onClick={handleLogOut}
          className="cursor-pointer rounded-full bg-blue-600 px-6 py-2 font-medium text-white transition duration-200 hover:bg-orange-400"
        >
          Sign Out
        </button>
      ) : (
        <Link
          href="/login"
          className="rounded-full bg-blue-600 px-6 py-2 font-medium text-white transition duration-200 hover:bg-orange-400"
        >
          Login
        </Link>
      )}

    </div>
  );
}