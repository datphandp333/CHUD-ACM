"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  supabase,
} from "@/app/lib/supabase";

export default function ResetPasswordPage() {
  const router =
    useRouter();

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    checkingSession,
    setCheckingSession,
  ] = useState(true);

  const [
    validRecoverySession,
    setValidRecoverySession,
  ] = useState(false);

  const [
    success,
    setSuccess,
  ] = useState(false);

  // ==================================================
  // CHECK RECOVERY SESSION
  // ==================================================

  useEffect(() => {
    let mounted =
      true;

    let subscription:
      | {
          unsubscribe: () => void;
        }
      | null =
      null;

    async function checkSession() {
      try {
        const {
          data: {
            session,
          },
        } =
          await supabase.auth.getSession();

        if (
          mounted &&
          session?.user
        ) {
          setValidRecoverySession(
            true
          );
        }

        const {
          data,
        } =
          supabase.auth.onAuthStateChange(
            (
              event,
              session
            ) => {
              if (
                event ===
                  "PASSWORD_RECOVERY" &&
                session?.user
              ) {
                setValidRecoverySession(
                  true
                );
              }

              if (mounted) {
                setCheckingSession(
                  false
                );
              }
            }
          );

        subscription =
          data.subscription;

      } catch {
        if (mounted) {
          setValidRecoverySession(
            false
          );
        }

      } finally {
        if (mounted) {
          setCheckingSession(
            false
          );
        }
      }
    }

    checkSession();

    return () => {
      mounted =
        false;

      subscription?.unsubscribe();
    };
  }, []);

  // ==================================================
  // PASSWORD RULES
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

  function validatePassword() {
    if (!password) {
      return "Please enter a new password.";
    }

    if (!hasLength) {
      return "Password must be at least 8 characters.";
    }

    if (!hasUppercase) {
      return "Password must contain at least one uppercase letter.";
    }

    if (!hasLowercase) {
      return "Password must contain at least one lowercase letter.";
    }

    if (!hasNumber) {
      return "Password must contain at least one number.";
    }

    if (
      password !==
      confirmPassword
    ) {
      return "Passwords do not match.";
    }

    return "";
  }

  // ==================================================
  // UPDATE PASSWORD
  // ==================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const validationError =
      validatePassword();

    if (validationError) {
      setError(
        validationError
      );

      return;
    }

    setLoading(true);

    try {
      const {
        data: {
          session,
        },
      } =
        await supabase.auth.getSession();

      if (!session?.user) {
        setValidRecoverySession(
          false
        );

        setError(
          "Your password reset link has expired or is invalid."
        );

        return;
      }

      const {
        error:
          updateError,
      } =
        await supabase.auth.updateUser({
          password,
        });

      if (updateError) {
        setError(
          updateError.message
        );

        return;
      }

      setSuccess(
        true
      );

      await supabase.auth.signOut();

    } catch {
      setError(
        "Something went wrong while changing your password. Please try again."
      );

    } finally {
      setLoading(
        false
      );
    }
  }

  // ==================================================
  // LOADING
  // ==================================================

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa]">

        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />

          <p className="mt-4 text-sm font-semibold text-slate-600">
            Verifying your reset link...
          </p>

        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa]">

      {/* HEADER */}

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
            className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            Log in
          </Link>

        </div>

      </header>

      {/* PAGE */}

      <section className="px-5 py-12 sm:px-6 sm:py-16">

        <div className="mx-auto max-w-[500px]">

          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.08)]">

            <div className="p-7 sm:p-10">

              {/* ======================================
                  SUCCESS
              ====================================== */}

              {success ? (
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
                    Password updated
                  </h1>

                  <p className="mt-3 leading-7 text-slate-600">
                    Your password has been changed
                    successfully. You can now sign in
                    to CHUD using your new password.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      router.replace(
                        "/login"
                      )
                    }
                    className="mt-8 w-full rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-800"
                  >
                    Continue to login
                  </button>

                </div>

              ) : !validRecoverySession ? (

                /* ====================================
                    INVALID LINK
                ==================================== */

                <div>

                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-7 w-7 text-red-600"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                      />

                      <path
                        strokeLinecap="round"
                        d="M12 8v5"
                      />

                      <circle
                        cx="12"
                        cy="16.5"
                        r=".7"
                        fill="currentColor"
                        stroke="none"
                      />
                    </svg>

                  </div>

                  <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-950">
                    Reset link unavailable
                  </h1>

                  <p className="mt-3 leading-7 text-slate-600">
                    This password reset link may have
                    expired, already been used, or
                    could not be verified.
                  </p>

                  <Link
                    href="/forgot-password"
                    className="mt-8 flex w-full items-center justify-center rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-800"
                  >
                    Request another reset link
                  </Link>

                  <Link
                    href="/login"
                    className="mt-4 block text-center text-sm font-bold text-blue-700 hover:underline"
                  >
                    Return to login
                  </Link>

                </div>

              ) : (

                /* ====================================
                    RESET FORM
                ==================================== */

                <>

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      className="h-7 w-7 text-blue-700"
                    >
                      <rect
                        x="5"
                        y="10"
                        width="14"
                        height="10"
                        rx="2"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 10V7a4 4 0 0 1 8 0v3"
                      />
                    </svg>

                  </div>

                  <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                    Create a new password
                  </h1>

                  <p className="mt-3 leading-7 text-slate-600">
                    Choose a strong password that you
                    haven&apos;t used before.
                  </p>

                  <form
                    onSubmit={
                      handleSubmit
                    }
                    className="mt-8 space-y-5"
                  >

                    {error && (
                      <div
                        role="alert"
                        className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
                      >
                        <span className="font-black">
                          !
                        </span>

                        {error}
                      </div>
                    )}

                    {/* PASSWORD */}

                    <div>

                      <label
                        htmlFor="password"
                        className="text-sm font-bold text-slate-800"
                      >
                        New password
                      </label>

                      <div className="relative mt-2">

                        <input
                          id="password"
                          type={
                            showPassword
                              ? "text"
                              : "password"
                          }
                          value={
                            password
                          }
                          onChange={(
                            event
                          ) => {
                            setPassword(
                              event.target.value
                            );

                            setError("");
                          }}
                          autoComplete="new-password"
                          placeholder="Enter a new password"
                          required
                          disabled={
                            loading
                          }
                          className="w-full rounded-xl border border-slate-300 px-4 py-3.5 pr-20 text-slate-950 outline-none transition focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword(
                              (current) =>
                                !current
                            )
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-blue-700"
                        >
                          {showPassword
                            ? "Hide"
                            : "Show"}
                        </button>

                      </div>

                    </div>

                    {/* CONFIRM */}

                    <div>

                      <label
                        htmlFor="confirmPassword"
                        className="text-sm font-bold text-slate-800"
                      >
                        Confirm new password
                      </label>

                      <input
                        id="confirmPassword"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={
                          confirmPassword
                        }
                        onChange={(
                          event
                        ) => {
                          setConfirmPassword(
                            event.target.value
                          );

                          setError("");
                        }}
                        autoComplete="new-password"
                        placeholder="Enter password again"
                        required
                        disabled={
                          loading
                        }
                        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3.5 text-slate-950 outline-none transition focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
                      />

                    </div>

                    {/* REQUIREMENTS */}

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                      <p className="text-sm font-bold text-slate-800">
                        Password requirements
                      </p>

                      <div className="mt-4 grid gap-2 text-sm">

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

                        <Requirement
                          passed={
                            passwordsMatch
                          }
                          text="Passwords match"
                        />

                      </div>

                    </div>

                    <button
                      type="submit"
                      disabled={
                        loading
                      }
                      className="w-full rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading
                        ? "Updating password..."
                        : "Update password"}
                    </button>

                  </form>

                </>
              )}

            </div>

            {/* SECURITY FOOTER */}

            <div className="border-t border-slate-200 bg-slate-50 px-7 py-5 sm:px-10">

              <p className="text-center text-xs leading-5 text-slate-500">
                🔒 Your password is securely managed
                through CHUD&apos;s authentication
                provider.
              </p>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

// ====================================================
// PASSWORD REQUIREMENT COMPONENT
// ====================================================

function Requirement({
  passed,
  text,
}: {
  passed: boolean;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2.5">

      <div
        className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-black ${
          passed
            ? "bg-green-100 text-green-700"
            : "bg-slate-200 text-slate-500"
        }`}
      >
        {passed
          ? "✓"
          : "·"}
      </div>

      <span
        className={
          passed
            ? "font-medium text-green-700"
            : "text-slate-600"
        }
      >
        {text}
      </span>

    </div>
  );
}