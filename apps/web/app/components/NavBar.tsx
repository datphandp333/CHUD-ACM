"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";


import SignInOut from "../signin-out/function";
import { supabase } from "@/app/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";


const NavBar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loadingSignOut, setLoadingSignOut] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (mounted) {
        setUser(user);
      }
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      setLoadingSignOut(true);

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Sign out error:", error.message);
        return;
      }

      setUser(null);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Unexpected sign out error:", err);
    } finally {
      setLoadingSignOut(false);
    }
  };

  const shortUserLabel = useMemo(() => {
    if (!user?.email) return "";
    return user.email;
  }, [user]);

  const isLoginPage = pathname === "/login";
  const isSignUpPage = pathname === "/signup";

  return (
    <nav
      className={`fixed top-0 z-50 w-full bg-blue-500 transition-all duration-300 ${
        scrolled ? "py-4 shadow-lg" : "py-6"
      }`}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-3 items-center px-10">
        <div className="flex justify-start">
          <Link href="/">
            <Image
              src="/UTA-Logo.png"
              alt="UTA Mavericks"
              width={60}
              height={60}
              className="transition duration-300 hover:scale-110"
            />
          </Link>
        </div>

        <ul className="flex justify-center gap-12 whitespace-nowrap text-base font-semibold text-white">
          <li>
            <Link href="/" className="nav__link">
              Home
            </Link>
          </li>

          <li>
            <Link href="/browse-housing" className="nav__link">
              Browse Housing
            </Link>
          </li>

          <li>
            <Link href="/write-review" className="nav__link">
              Write Review
            </Link>
          </li>

          <li>
            <Link href="/top-rated" className="nav__link">
              Top Rated
            </Link>
          </li>

          <li>
            <Link href="/map" className="nav__link">
              Map
            </Link>
          </li>
        </ul>

        <div className="flex items-center justify-end gap-3">
          {user ? (
            <>
              <span className="hidden max-w-[240px] truncate rounded-full bg-blue-400 px-4 py-2 text-sm font-medium text-white lg:inline-block">
                {shortUserLabel}
              </span>

              <button
                onClick={handleSignOut}
                disabled={loadingSignOut}
                className="rounded-full bg-blue-600 px-6 py-2 font-medium text-white transition duration-200 hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {loadingSignOut ? "Signing Out..." : "Sign Out"}
              </button>
            </>
          ) : (
            <>
              {!isLoginPage && (
                <Link
                  href="/login"
                  className="rounded-full bg-blue-600 px-6 py-2 font-medium text-white transition duration-200 hover:bg-orange-400"
                >
                  Login
                </Link>
              )}

              {!isSignUpPage && (
                <Link
                  href="/signup"
                  className="rounded-full border border-white px-6 py-2 font-medium text-white transition duration-200 hover:bg-white hover:text-blue-700"
                >
                  Sign Up
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;