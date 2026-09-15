"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";

import {
  supabase,
} from "@/app/lib/supabase";

import {
  isAllowedEmail,
  normalizeEmail,
} from "@/app/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess(false);

    const normalizedEmail =
      normalizeEmail(email);

    if (!normalizedEmail) {
      setError(
        "Please enter your email address."
      );

      return;
    }

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

    setLoading(true);

    try {
      const redirectTo =
        `${window.location.origin}/reset-password`;

      const {
        error: resetError,
      } =
        await supabase.auth.resetPasswordForEmail(
          normalizedEmail,
          {
            redirectTo,
          }
        );

      if (resetError) {
        const message =
          resetError.message.toLowerCase();

        if (
          message.includes(
            "rate limit"
          )
        ) {
          setError(
            "Too many reset emails were requested. Please wait a few minutes and try again."
          );

          return;
        }

        setError(
          resetError.message
        );

        return;
      }

      setSuccess(true);

    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message.toLowerCase()
          : "";

      if (
        message.includes(
          "rate limit"
        )
      ) {
        setError(
          "Too many reset emails were requested. Please wait a few minutes and try again."
        );

        return;
      }

      setError(
        "Something went wrong while sending the reset email. Please try again."
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa]">

      {/* ============================================
          SIMPLE CHUD HEADER
      ============================================ */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">

          <Link
            href="/"
            className="flex items-center gap-3"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-lg font-black text-white">
              C
            </div>

            <div>
              <p className="text-lg font-black leading-none text-slate-950">
                CHUD
              </p>

              <p className="mt-1 text-xs font-medium text-slate-500">
                UTA Housing
              </p>
            </div>

          </Link>

          <Link
            href="/login"
            className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
          >
            Log in
          </Link>

        </div>

      </header>

      {/* ============================================
          PAGE
      ============================================ */}

      <section className="px-5 py-12 sm:px-6 sm:py-16">

        <div className="mx-auto max-w-[500px]">

          {/* ========================================
              BACK
          ======================================== */}

          <Link
            href="/login"
            className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-700"
          >
            <span aria-hidden="true">
              ←
            </span>

            Back to login
          </Link>

          {/* ========================================
              CARD
          ======================================== */}

          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.08)]">

            <div className="p-7 sm:p-10">

              {success ? (

                /* ==================================
                    SUCCESS
                ================================== */

                <div>

                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50">

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.3"
                      className="h-7 w-7 text-green-600"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 12.5 9.2 17 19 7"
                      />
                    </svg>

                  </div>

                  <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-950">
                    Check your email
                  </h1>

                  <p className="mt-3 leading-7 text-slate-600">
                    We sent password reset instructions
                    to:
                  </p>

                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">

                    <p className="break-all text-sm font-bold text-slate-900">
                      {normalizeEmail(
                        email
                      )}
                    </p>

                  </div>

                  <p className="mt-5 text-sm leading-6 text-slate-500">
                    Follow the link in the email to
                    create a new password. The message
                    may take a few minutes to arrive.
                  </p>

                  <Link
                    href="/login"
                    className="mt-8 flex w-full items-center justify-center rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-800"
                  >
                    Return to login
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setSuccess(
                        false
                      );

                      setError("");
                    }}
                    className="mt-3 w-full rounded-xl px-5 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
                  >
                    Try another email
                  </button>

                </div>

              ) : (

                /* ==================================
                    FORM
                ================================== */

                <>

                  {/* ICON */}

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      className="h-7 w-7 text-blue-700"
                    >
                      <rect
                        x="3"
                        y="5"
                        width="18"
                        height="14"
                        rx="2"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4 7 8 6 8-6"
                      />
                    </svg>

                  </div>

                  <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                    Forgot your password?
                  </h1>

                  <p className="mt-3 text-base leading-7 text-slate-600">
                    No problem. Enter the email
                    associated with your CHUD account
                    and we&apos;ll send you a link to
                    reset your password.
                  </p>

                  <form
                    onSubmit={
                      handleSubmit
                    }
                    className="mt-8"
                  >

                    {error && (
                      <div
                        role="alert"
                        className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
                      >

                        <span className="font-black">
                          !
                        </span>

                        <span>
                          {error}
                        </span>

                      </div>
                    )}

                    <label
                      htmlFor="email"
                      className="text-sm font-bold text-slate-800"
                    >
                      Email address
                    </label>

                    <input
                      id="email"
                      type="email"
                      value={
                        email
                      }
                      onChange={(
                        event
                      ) => {
                        setEmail(
                          event.target.value
                        );

                        if (error) {
                          setError("");
                        }
                      }}
                      placeholder="you@mavs.uta.edu"
                      autoComplete="email"
                      required
                      disabled={
                        loading
                      }
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                    />

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Use the email address connected
                      to your CHUD account.
                    </p>

                    <button
                      type="submit"
                      disabled={
                        loading
                      }
                      className="mt-6 flex w-full items-center justify-center rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading
                        ? "Sending..."
                        : "Send reset link"}
                    </button>

                  </form>

                  {/* DIVIDER */}

                  <div className="my-7 flex items-center gap-4">

                    <div className="h-px flex-1 bg-slate-200" />

                    <span className="text-xs font-medium text-slate-400">
                      OR
                    </span>

                    <div className="h-px flex-1 bg-slate-200" />

                  </div>

                  <p className="text-center text-sm text-slate-600">
                    Remember your password?{" "}

                    <Link
                      href="/login"
                      className="font-bold text-blue-700 hover:underline"
                    >
                      Log in
                    </Link>
                  </p>

                </>
              )}

            </div>

            {/* ========================================
                SECURITY FOOTER
            ======================================== */}

            <div className="border-t border-slate-200 bg-slate-50 px-7 py-5 sm:px-10">

              <div className="flex gap-3">

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="mt-0.5 h-5 w-5 shrink-0 text-slate-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3 5 6v5c0 4.5 2.8 8.1 7 10 4.2-1.9 7-5.5 7-10V6l-7-3Z"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m9.5 12 1.7 1.7 3.5-3.7"
                  />
                </svg>

                <p className="text-xs leading-5 text-slate-500">
                  For your security, CHUD will never
                  ask you to send your password by
                  email.
                </p>

              </div>

            </div>

          </div>

          {/* ========================================
              BOTTOM HELP
          ======================================== */}

          <p className="mt-7 text-center text-sm text-slate-500">
            Having trouble accessing your account?{" "}

            <Link
              href="/"
              className="font-semibold text-slate-800 hover:text-blue-700"
            >
              Return to CHUD
            </Link>
          </p>

        </div>

      </section>

    </main>
  );
}