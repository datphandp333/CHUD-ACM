"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import type {
  User,
} from "@supabase/supabase-js";

import {
  supabase,
} from "@/app/lib/supabase";

import {
  getUserDisplayName,
} from "@/app/lib/auth";

export default function NavBar() {
  const pathname =
    usePathname();

  const router =
    useRouter();

  const [
    user,
    setUser,
  ] =
    useState<User | null>(
      null
    );

  const [
    signingOut,
    setSigningOut,
  ] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: {
          user,
        },
      } =
        await supabase.auth.getUser();

      if (mounted) {
        setUser(user);
      }
    }

    loadUser();

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (
          _event,
          session
        ) => {
          setUser(
            session?.user ??
              null
          );
        }
      );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const userLabel =
    useMemo(() => {
      if (!user) {
        return "";
      }

      return getUserDisplayName(
        typeof user.user_metadata
          ?.full_name ===
        "string"
          ? user.user_metadata.full_name
          : null,

        user.email
      );
    }, [user]);

  async function handleSignOut() {
    try {
      setSigningOut(true);

      const {
        error,
      } =
        await supabase.auth.signOut();

      if (error) {
        console.error(
          "Sign out error:",
          error
        );

        return;
      }

      setUser(null);

      router.push("/");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  const links = [
    {
      href: "/",
      label: "Home",
    },
    {
      href:
        "/browse-housing",
      label:
        "Browse Housing",
    },
    {
      href: "/map",
      label: "Map",
    },
    {
      href: "/top-rated",
      label: "Top Rated",
    },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">

        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-3"
        >

          <div className="relative h-11 w-11 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <Image
              src="/UTA-Logo.png"
              alt="CHUD"
              fill
              className="object-contain p-1"
              priority
            />
          </div>

          <div>
            <p className="text-lg font-extrabold tracking-tight text-slate-950">
              CHUD
            </p>

            <p className="text-xs font-medium text-slate-500">
              UTA Housing
            </p>
          </div>

        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 lg:flex">

          {links.map(
            (link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(
                      link.href
                    );

              return (
                <Link
                  key={
                    link.href
                  }
                  href={
                    link.href
                  }
                  className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                >
                  {
                    link.label
                  }
                </Link>
              );
            }
          )}

        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">

          <Link
            href="/browse-housing"
            className="hidden rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700 md:inline-flex"
          >
            🔍 Find housing
          </Link>

          {user ? (
            <>
              <div className="hidden items-center gap-3 rounded-full border border-slate-200 bg-white py-1.5 pl-2 pr-4 shadow-sm sm:flex">

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white">
                  {userLabel
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <span className="max-w-[130px] truncate text-sm font-semibold text-slate-700">
                  {
                    userLabel
                  }
                </span>

              </div>

              <button
                type="button"
                onClick={
                  handleSignOut
                }
                disabled={
                  signingOut
                }
                className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                {signingOut
                  ? "..."
                  : "Sign out"}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden px-3 py-2 text-sm font-semibold text-slate-700 hover:text-blue-700 sm:inline-flex"
              >
                Log in
              </Link>

              <Link
                href="/signup"
                className="rounded-full bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
              >
                Sign up
              </Link>
            </>
          )}

        </div>

      </div>

    </header>
  );
}