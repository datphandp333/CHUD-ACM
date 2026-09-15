"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";

import { supabase } from "@/app/lib/supabase";

import {
  isAllowedEmail,
  normalizeEmail,
} from "@/app/lib/auth";

export default function SignUpPage() {
  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [googleLoading, setGoogleLoading] =
    useState(false);

  // ==================================================
  // GOOGLE SIGN UP / SIGN IN
  // ==================================================

  async function handleGoogleSignUp() {
    setError("");
    setGoogleLoading(true);

    try {
      const { error: googleError } =
        await supabase.auth.signInWithOAuth({
          provider: "google",

          options: {
            redirectTo:
              `${window.location.origin}/`,
          },
        });

      if (googleError) {
        setError(
          googleError.message
        );

        setGoogleLoading(false);
      }

      // On success Supabase redirects the browser
      // to Google automatically.
    } catch {
      setError(
        "Something went wrong while connecting to Google."
      );

      setGoogleLoading(false);
    }
  }

  // ==================================================
  // EMAIL/PASSWORD SIGN UP
  // ==================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess(false);

    const normalizedEmail =
      normalizeEmail(email);

    // ================================================
    // EMAIL VALIDATION
    // ================================================

    if (
      !isAllowedEmail(
        normalizedEmail
      )
    ) {
      setError(
        "Please use a @mavs.uta.edu or @gmail.com email address."
      );

      return;
    }

    // ================================================
    // PASSWORD VALIDATION
    // ================================================

    if (
      password.length < 8
    ) {
      setError(
        "Password must be at least 8 characters long."
      );

      return;
    }

    if (
      !/[A-Z]/.test(
        password
      )
    ) {
      setError(
        "Password must contain at least one uppercase letter."
      );

      return;
    }

    if (
      !/[a-z]/.test(
        password
      )
    ) {
      setError(
        "Password must contain at least one lowercase letter."
      );

      return;
    }

    if (
      !/[0-9]/.test(
        password
      )
    ) {
      setError(
        "Password must contain at least one number."
      );

      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );

      return;
    }

    setLoading(true);

    try {
      const {
        error: signUpError,
      } =
        await supabase.auth.signUp({
          email:
            normalizedEmail,

          password,

          options: {
            data: {
              full_name:
                fullName.trim(),
            },

            emailRedirectTo:
              `${window.location.origin}/login`,
          },
        });

      if (signUpError) {
        setError(
          signUpError.message
        );

        return;
      }

      setSuccess(true);

      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

    } catch {
      setError(
        "Something went wrong while creating your account."
      );

    } finally {
      setLoading(false);
    }
  }

  // ==================================================
  // PASSWORD CHECKS FOR UI
  // ==================================================

  const hasLength =
    password.length >= 8;

  const hasUppercase =
    /[A-Z]/.test(
      password
    );

  const hasLowercase =
    /[a-z]/.test(
      password
    );

  const hasNumber =
    /[0-9]/.test(
      password
    );

  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password ===
      confirmPassword;

  return (
    <main className="min-h-screen bg-slate-50 pt-24">

      <section className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-7xl overflow-hidden bg-white shadow-sm lg:grid-cols-2">

        {/* ============================================
            LEFT SIDE
        ============================================ */}

        <div className="hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 px-14 py-16 text-white lg:flex lg:flex-col lg:justify-center">

          <div className="max-w-xl">

            <p className="mb-5 text-sm font-bold uppercase tracking-[0.25em] text-blue-200">
              CHUD
            </p>

            <h1 className="text-5xl font-bold leading-tight">
              Find student housing with confidence.
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-blue-100">
              Compare housing near UTA, explore
              locations, read student reviews,
              and share your own housing experience.
            </p>

            <div className="mt-10 grid gap-4">

              <Feature
                text="Browse apartments and residence halls"
              />

              <Feature
                text="Read real student housing reviews"
              />

              <Feature
                text="Compare ratings and amenities"
              />

              <Feature
                text="Explore housing on an interactive map"
              />

            </div>

          </div>

        </div>

        {/* ============================================
            RIGHT SIDE
        ============================================ */}

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
              Join CHUD to explore housing and
              share your student housing experience.
            </p>

            {/* ========================================
                SUCCESS
            ======================================== */}

            {success ? (

              <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-6">

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-xl font-bold text-green-700">
                  ✓
                </div>

                <h3 className="mt-4 text-lg font-bold text-green-950">
                  Account created
                </h3>

                <p className="mt-2 text-sm leading-6 text-green-800">
                  Check your email for the confirmation
                  message before signing in.
                </p>

                <Link
                  href="/login"
                  className="mt-5 flex w-full items-center justify-center rounded-xl bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-800"
                >
                  Go to login
                </Link>

              </div>

            ) : (

              <>

                {/* ====================================
                    GOOGLE
                ==================================== */}

                <button
                  type="button"
                  onClick={
                    handleGoogleSignUp
                  }
                  disabled={
                    googleLoading ||
                    loading
                  }
                  className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-5 py-3.5 font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {!googleLoading && (
                    <GoogleIcon />
                  )}

                  {googleLoading
                    ? "Connecting to Google..."
                    : "Continue with Google"}

                </button>

                {/* ====================================
                    DIVIDER
                ==================================== */}

                <div className="my-7 flex items-center gap-4">

                  <div className="h-px flex-1 bg-slate-200" />

                  <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-slate-400">
                    or sign up with email
                  </span>

                  <div className="h-px flex-1 bg-slate-200" />

                </div>

                {/* ====================================
                    ERROR
                ==================================== */}

                {error && (
                  <div
                    role="alert"
                    className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                  >
                    {error}
                  </div>
                )}

                {/* ====================================
                    SIGNUP FORM
                ==================================== */}

                <form
                  onSubmit={
                    handleSubmit
                  }
                  className="space-y-5"
                >

                  {/* FULL NAME */}

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
                      value={
                        fullName
                      }
                      onChange={(
                        event
                      ) =>
                        setFullName(
                          event.target.value
                        )
                      }
                      placeholder="Dat Phan"
                      autoComplete="name"
                      disabled={
                        loading ||
                        googleLoading
                      }
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                    />

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Optional. If left blank,
                      your email can be used as
                      your display name.
                    </p>

                  </div>

                  {/* EMAIL */}

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
                      value={
                        email
                      }
                      onChange={(
                        event
                      ) =>
                        setEmail(
                          event.target.value
                        )
                      }
                      placeholder="you@mavs.uta.edu or you@gmail.com"
                      autoComplete="email"
                      required
                      disabled={
                        loading ||
                        googleLoading
                      }
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                    />

                    <p className="mt-2 text-xs text-slate-500">
                      Supported: @mavs.uta.edu and
                      @gmail.com
                    </p>

                  </div>

                  {/* PASSWORD */}

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
                      value={
                        password
                      }
                      onChange={(
                        event
                      ) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      placeholder="Create a password"
                      autoComplete="new-password"
                      required
                      disabled={
                        loading ||
                        googleLoading
                      }
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                    />

                  </div>

                  {/* CONFIRM PASSWORD */}

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
                      value={
                        confirmPassword
                      }
                      onChange={(
                        event
                      ) =>
                        setConfirmPassword(
                          event.target.value
                        )
                      }
                      placeholder="Enter your password again"
                      autoComplete="new-password"
                      required
                      disabled={
                        loading ||
                        googleLoading
                      }
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                    />

                  </div>

                  {/* ==================================
                      PASSWORD REQUIREMENTS
                  ================================== */}

                  {password.length > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                      <p className="text-sm font-semibold text-slate-700">
                        Password requirements
                      </p>

                      <div className="mt-3 space-y-2">

                        <Requirement
                          passed={
                            hasLength
                          }
                          text="At least 8 characters"
                        />

                        <Requirement
                          passed={
                            hasUppercase
                          }
                          text="One uppercase letter"
                        />

                        <Requirement
                          passed={
                            hasLowercase
                          }
                          text="One lowercase letter"
                        />

                        <Requirement
                          passed={
                            hasNumber
                          }
                          text="One number"
                        />

                        {confirmPassword.length > 0 && (
                          <Requirement
                            passed={
                              passwordsMatch
                            }
                            text="Passwords match"
                          />
                        )}

                      </div>

                    </div>
                  )}

                  {/* ==================================
                      CREATE ACCOUNT
                  ================================== */}

                  <button
                    type="submit"
                    disabled={
                      loading ||
                      googleLoading
                    }
                    className="w-full rounded-xl bg-blue-700 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading
                      ? "Creating account..."
                      : "Create account"}
                  </button>

                  <p className="text-center text-xs leading-5 text-slate-500">
                    By creating an account, you agree
                    to use CHUD responsibly when
                    posting housing reviews.
                  </p>

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

              </>
            )}

          </div>

        </div>

      </section>

    </main>
  );
}

// ====================================================
// FEATURE
// ====================================================

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

// ====================================================
// PASSWORD REQUIREMENT
// ====================================================

function Requirement({
  passed,
  text,
}: {
  passed: boolean;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2">

      <span
        className={
          passed
            ? "font-bold text-green-600"
            : "font-bold text-slate-400"
        }
      >
        {passed
          ? "✓"
          : "○"}
      </span>

      <span
        className={
          passed
            ? "text-sm font-medium text-green-700"
            : "text-sm text-slate-500"
        }
      >
        {text}
      </span>

    </div>
  );
}

// ====================================================
// GOOGLE ICON
// ====================================================

function GoogleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.6 12.227c0-.709-.064-1.391-.182-2.045H12v3.868h5.382a4.6 4.6 0 0 1-1.996 3.018v2.509h3.232c1.891-1.741 2.982-4.309 2.982-7.35Z"
      />

      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.041.955-3.386.955-2.605 0-4.809-1.759-5.596-4.123H3.064v2.591A9.997 9.997 0 0 0 12 22Z"
      />

      <path
        fill="#FBBC05"
        d="M6.404 13.9A6.01 6.01 0 0 1 6.09 12c0-.659.114-1.3.314-1.9V7.509h-3.34A9.997 9.997 0 0 0 2 12c0 1.614.386 3.141 1.064 4.491L6.404 13.9Z"
      />

      <path
        fill="#EA4335"
        d="M12 5.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C16.959 2.991 14.695 2 12 2a9.997 9.997 0 0 0-8.936 5.509l3.34 2.591C7.191 7.736 9.395 5.977 12 5.977Z"
      />
    </svg>
  );
}