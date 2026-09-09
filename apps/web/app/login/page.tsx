"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "../signin-out/function";

const UTA_EMAIL_REGEX = /^[a-zA-Z]+[0-9]{4}@mavs\.uta\.edu$/i;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";

  const { setIsLoggedIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resending, setResending] = useState(false);

  const handleResendConfirmation = async () => {
    setResending(true);
    await supabase.auth.resend({ type: "signup", email });
    setResending(false);
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      if (error.message.toLowerCase().includes("email not confirmed")) {
        setShowResend(true);
      }
      setLoading(false);
      return;
    }

    router.push(redirect);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white pt-24">
      <div className="w-full max-w-md rounded-xl bg-[url('/UTA_image2.jpg')] bg-cover bg-center p-8 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold text-blue-800">Login</h1>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-blue-800">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="lastname1234@mavs.uta.edu"
              pattern="[a-zA-Z]+[0-9]{4}@mavs\.uta\.edu"
              title="Format: lastname1234@mavs.uta.edu"
              className="mt-1 w-full rounded-lg border px-4 py-2"
              required
            />
            <p className="mt-1 text-xs text-black">
              Use your UTA email: lastname1234@mavs.uta.edu
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="mt-1 w-full rounded-lg border px-4 py-2"
              required
            />
          </div>

          <button 
            onClick={() => setIsLoggedIn(true)}
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-2 text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <Link href="/signup" className="block text-center text-sm text-blue-800 hover:underline">
            Don't have an account? Sign Up!
          </Link>
        </form>

        {showResend && (
          <button
            type="button"
            onClick={handleResendConfirmation}
            disabled={resending}
            className="mt-4 w-full rounded-lg border border-blue-600 py-2 text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-blue-300 disabled:text-blue-300"
          >
            {resending ? "Sending..." : "Resend Confirmation Email"}
          </button>
        )}

        <p className="mt-6 text-center text-sm text-slate-600">
          Don’t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-blue-700 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
