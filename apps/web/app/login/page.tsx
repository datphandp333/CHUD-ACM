"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { supabase } from "@/app/lib/supabase";

import {
  isAllowedEmail,
  normalizeEmail,
} from "@/app/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const redirect =
    searchParams.get("redirect") || "/";

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [showResend, setShowResend] =
    useState(false);

  const [resending, setResending] =
    useState(false);

  const [confirmationSent, setConfirmationSent] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setShowResend(false);
    setConfirmationSent(false);

    const normalizedEmail =
      normalizeEmail(email);

    if (!isAllowedEmail(normalizedEmail)) {
      setError(
        "Please use a @mavs.uta.edu or @gmail.com email address."
      );

      return;
    }

    setLoading(true);

    try {
      const {
        data,
        error,
      } =
        await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

      if (error) {
        setError(error.message);

        if (
          error.message
            .toLowerCase()
            .includes("email not confirmed")
        ) {
          setShowResend(true);
        }

        return;
      }

      if (!data.user) {
        setError(
          "Unable to sign in. Please try again."
        );

        return;
      }

      router.replace(redirect);

      router.refresh();

    } catch (error) {
      console.error(error);

      setError(
        "Something went wrong while signing in."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResendConfirmation() {
    const normalizedEmail =
      normalizeEmail(email);

    if (!normalizedEmail) {
      setError(
        "Enter your email address first."
      );

      return;
    }

    setResending(true);
    setConfirmationSent(false);

    const { error } =
      await supabase.auth.resend({
        type: "signup",
        email: normalizedEmail,
      });

    if (error) {
      setError(error.message);
    } else {
      setConfirmationSent(true);
    }

    setResending(false);
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-24">

      <section className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-7xl overflow-hidden bg-white shadow-sm lg:grid-cols-2">

        {/* Branding area */}
        <div className="hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 px-14 py-16 text-white lg:flex lg:flex-col lg:justify-center">

          <div className="max-w-xl">

            <p className="mb-5 text-sm font-bold uppercase tracking-[0.25em] text-blue-200">
              Welcome back
            </p>

            <h1 className="text-5xl font-bold leading-tight">
              Continue finding the right place to live.
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-blue-100">
              Access housing ratings, reviews,
              comparisons, and your personalized
              CHUD experience.
            </p>

            <div className="mt-10 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">

              <p className="text-sm font-semibold uppercase tracking-wider text-blue-200">
                CHUD Housing
              </p>

              <p className="mt-3 text-lg leading-7">
                Housing information built around the
                student experience near UTA.
              </p>

            </div>

          </div>
        </div>

        {/* Login form */}
        <div className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">

          <div className="w-full max-w-md">

            <Link
              href="/"
              className="mb-8 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-900"
            >
              ← Back to CHUD
            </Link>

            <h2 className="text-4xl font-bold tracking-tight text-slate-950">
              Log in
            </h2>

            <p className="mt-3 text-slate-600">
              Use your UTA Mavs account or personal Gmail.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {confirmationSent && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                  Confirmation email sent.
                  Check your inbox.
                </div>
              )}

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@mavs.uta.edu or you@gmail.com"
                  autoComplete="email"
                  required
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-800"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-sm font-semibold text-blue-700 hover:text-blue-900"
                  >
                    Forgot password?
                  </button>

                </div>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-700 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Signing in..."
                  : "Log in"}
              </button>

              {showResend && (
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={resending}
                  className="w-full rounded-xl border border-blue-700 px-5 py-3 font-semibold text-blue-700 transition hover:bg-blue-50 disabled:opacity-60"
                >
                  {resending
                    ? "Sending..."
                    : "Resend confirmation email"}
                </button>
              )}

              <p className="text-center text-sm text-slate-600">
                Don&apos;t have an account?{" "}

                <Link
                  href="/signup"
                  className="font-semibold text-blue-700 hover:underline"
                >
                  Create account
                </Link>
              </p>

            </form>

          </div>

        </div>

      </section>

    </main>
  );
}