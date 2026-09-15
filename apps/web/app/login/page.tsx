"use client";

import {
  FormEvent,
  Suspense,
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

// ====================================================
// PAGE
// ====================================================

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  );
}

// ====================================================
// LOGIN CONTENT
// ====================================================

function LoginContent() {
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

  const [googleLoading, setGoogleLoading] =
    useState(false);

  const [showResend, setShowResend] =
    useState(false);

  const [resending, setResending] =
    useState(false);

  const [
    confirmationSent,
    setConfirmationSent,
  ] = useState(false);

  // ==================================================
  // EMAIL / PASSWORD LOGIN
  // ==================================================

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

      const safeRedirect =
        redirect.startsWith("/") &&
        !redirect.startsWith("//")
          ? redirect
          : "/";

      router.replace(safeRedirect);
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

  // ==================================================
  // GOOGLE LOGIN
  // ==================================================

  async function handleGoogleSignIn() {
    setError("");
    setGoogleLoading(true);

    try {
      const safeRedirect =
        redirect.startsWith("/") &&
        !redirect.startsWith("//")
          ? redirect
          : "/";

      const redirectUrl =
        `${window.location.origin}${safeRedirect}`;

      const { error } =
        await supabase.auth.signInWithOAuth({
          provider: "google",

          options: {
            redirectTo: redirectUrl,
          },
        });

      if (error) {
        console.error(
          "Google sign-in error:",
          error
        );

        setError(error.message);
        setGoogleLoading(false);
      }

      // On success Supabase redirects
      // the browser to Google.
    } catch (error) {
      console.error(
        "Google sign-in error:",
        error
      );

      setError(
        "Something went wrong while signing in with Google."
      );

      setGoogleLoading(false);
    }
  }

  // ==================================================
  // RESEND CONFIRMATION EMAIL
  // ==================================================

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
    setError("");

    try {
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
    } catch (error) {
      console.error(
        "Resend confirmation error:",
        error
      );

      setError(
        "Something went wrong while sending the confirmation email."
      );
    } finally {
      setResending(false);
    }
  }

  // ==================================================
  // UI
  // ==================================================

  return (
    <main className="min-h-screen bg-slate-50 pt-24">

      <section className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-7xl overflow-hidden bg-white shadow-sm lg:grid-cols-2">

        {/* ==========================================
            BRANDING
        ========================================== */}

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

        {/* ==========================================
            LOGIN AREA
        ========================================== */}

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
              Use your UTA Mavs account, personal Gmail,
              or continue with Google.
            </p>

            {/* ======================================
                GOOGLE
            ====================================== */}

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={
                googleLoading ||
                loading
              }
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-5 py-3.5 font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {!googleLoading && (
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
              )}

              {googleLoading
                ? "Connecting to Google..."
                : "Continue with Google"}

            </button>

            {/* ======================================
                DIVIDER
            ====================================== */}

            <div className="my-7 flex items-center gap-4">

              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                or continue with email
              </span>

              <div className="h-px flex-1 bg-slate-200" />

            </div>

            {/* ======================================
                EMAIL LOGIN FORM
            ====================================== */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {confirmationSent && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                  Confirmation email sent. Check your inbox.
                </div>
              )}

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
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  placeholder="you@mavs.uta.edu or you@gmail.com"
                  autoComplete="email"
                  required
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />

              </div>

              {/* PASSWORD */}

              <div>

                <div className="flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-800"
                  >
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-sm font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                  >
                    Forgot password?
                  </Link>

                </div>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />

              </div>

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                disabled={
                  loading ||
                  googleLoading
                }
                className="w-full rounded-xl bg-blue-700 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Signing in..."
                  : "Log in"}
              </button>

              {/* RESEND */}

              {showResend && (
                <button
                  type="button"
                  onClick={
                    handleResendConfirmation
                  }
                  disabled={resending}
                  className="w-full rounded-xl border border-blue-700 px-5 py-3 font-semibold text-blue-700 transition hover:bg-blue-50 disabled:opacity-60"
                >
                  {resending
                    ? "Sending..."
                    : "Resend confirmation email"}
                </button>
              )}

              {/* SIGNUP */}

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

// ====================================================
// SUSPENSE FALLBACK
// ====================================================

function LoginLoading() {
  return (
    <main className="min-h-screen bg-slate-50 pt-24">

      <section className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-7xl overflow-hidden bg-white shadow-sm lg:grid-cols-2">

        <div className="hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 lg:block" />

        <div className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">

          <div className="w-full max-w-md">

            <div className="h-5 w-28 animate-pulse rounded bg-slate-200" />

            <div className="mt-8 h-10 w-40 animate-pulse rounded bg-slate-200" />

            <div className="mt-4 h-5 w-72 max-w-full animate-pulse rounded bg-slate-200" />

            <div className="mt-8 h-12 w-full animate-pulse rounded-xl bg-slate-200" />

            <div className="my-7 h-px bg-slate-200" />

            <div className="space-y-5">

              <div className="h-12 w-full animate-pulse rounded-xl bg-slate-200" />

              <div className="h-12 w-full animate-pulse rounded-xl bg-slate-200" />

              <div className="h-12 w-full animate-pulse rounded-xl bg-slate-200" />

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}