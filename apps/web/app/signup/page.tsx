"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white pt-24">
      <div className="w-full max-w-md rounded-xl bg-[url('/UTA_image.jpg')] bg-cover bg-center p-8 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold text-blue-800">Sign Up</h1>

        {success ? (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Account created! Check your email to confirm before logging in.
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-blue-600 py-4 px-2">
              <div>
                <label className="block text-sm font-bold text-blue-800">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="lastname1234@mavs.uta.edu"
                  className="mt-1 w-full rounded-lg border px-4 py-2"
                  required
                />
                <p className="mt-1 text-xs text-black">
                  Use your UTA email: lastname1234@mavs.uta.edu
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium">Password</label>
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
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-white py-2 text-blue-600 font-medium transition hover:bg-blue-50 disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Sign Up"}
              </button>

              <Link href="/login" className="block text-center text-sm text-white hover:underline">
                Already have an account? Log in
              </Link>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
