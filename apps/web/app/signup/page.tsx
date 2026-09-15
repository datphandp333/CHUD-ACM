"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import { supabase } from "@/app/lib/supabase";
import {
  isAllowedEmail,
  normalizeEmail,
} from "@/app/lib/auth";

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess(false);

    const normalizedEmail = normalizeEmail(email);

    if (!isAllowedEmail(normalizedEmail)) {
      setError(
        "Please use a @mavs.uta.edu or @gmail.com email address."
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters long."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);

      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error(error);

      setError(
        "Something went wrong while creating your account."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-24">
      <section className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-7xl overflow-hidden bg-white shadow-sm lg:grid-cols-2">

        {/* Left side */}
        <div className="hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 px-14 py-16 text-white lg:flex lg:flex-col lg:justify-center">

          <div className="max-w-xl">
            <p className="mb-5 text-sm font-bold uppercase tracking-[0.25em] text-blue-200">
              CHUD
            </p>

            <h1 className="text-5xl font-bold leading-tight">
              Find student housing with confidence.
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-blue-100">
              Compare housing near UTA, explore locations,
              read student reviews, and share your own
              housing experience.
            </p>

            <div className="mt-10 grid gap-4">
              <Feature text="Browse apartments and residence halls" />
              <Feature text="Read real student housing reviews" />
              <Feature text="Compare ratings and amenities" />
              <Feature text="Explore housing on an interactive map" />
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">

          <div className="w-full max-w-md">

            <Link
              href="/"
              className="mb-8 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-900"
            >
              ← Back to CHUD
            </Link>

            <h2 className="text-4xl font-bold tracking-tight text-slate-950">
              Create your account
            </h2>

            <p className="mt-3 text-slate-600">
              Use your UTA Mavs email or personal Gmail.
            </p>

            {success ? (
              <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-5">

                <h3 className="font-semibold text-green-900">
                  Account created
                </h3>

                <p className="mt-2 text-sm leading-6 text-green-800">
                  Check your email for the confirmation
                  message before signing in.
                </p>

                <Link
                  href="/login"
                  className="mt-5 inline-flex rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
                >
                  Go to Login
                </Link>

              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-5"
              >
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {/* Name */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-semibold text-slate-800"
                  >
                    Full name
                  </label>

                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(event) =>
                      setFullName(event.target.value)
                    }
                    placeholder="Dat Phan"
                    autoComplete="name"
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  />

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Optional. If you leave this blank,
                    your email will appear with your reviews.
                  </p>
                </div>

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

                  <p className="mt-2 text-xs text-slate-500">
                    Supported: @mavs.uta.edu and @gmail.com
                  </p>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-800"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    required
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {/* Confirm password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-semibold text-slate-800"
                  >
                    Confirm password
                  </label>

                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    placeholder="Enter your password again"
                    autoComplete="new-password"
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
                    ? "Creating account..."
                    : "Create account"}
                </button>

                <p className="text-center text-sm text-slate-600">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-blue-700 hover:underline"
                  >
                    Log in
                  </Link>
                </p>

              </form>
            )}

          </div>
        </div>

      </section>
    </main>
  );
}

function Feature({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/40">
        ✓
      </div>

      <p className="text-blue-50">
        {text}
      </p>
    </div>
  );
}