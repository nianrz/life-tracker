"use client";

import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/db/supabase";
import { Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  async function signInWithGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface-0)]">
      <div className="w-full max-w-sm">
        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl p-8 flex flex-col items-center gap-6">
          <div className="text-center">
            <h1 className="text-[22px] font-medium mb-1">Life tracker</h1>
            <p className="text-[14px] text-[var(--text-secondary)]">
              Sign in to access your dashboard
            </p>
          </div>

          {error && (
            <p className="text-[13px] text-[var(--text-danger)] bg-[var(--bg-danger)] px-3 py-2 rounded-lg w-full text-center">
              Something went wrong. Please try again.
            </p>
          )}

          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 h-11 px-4 rounded-[var(--radius)] border border-[var(--border-strong)] bg-[var(--surface-2)] text-[14px] font-medium hover:bg-[var(--surface-1)] transition-colors"
          >
            {/* Google "G" logo SVG */}
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
              />
              <path
                fill="#FBBC05"
                d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 6.294C4.672 4.167 6.656 3.58 9 3.58z"
              />
            </svg>
            Continue with Google
          </button>

          <p className="text-[12px] text-[var(--text-muted)] text-center">
            Personal use only. Your data is private and never shared.
          </p>
        </div>
      </div>
    </div>
  );
}

// useSearchParams requires Suspense in Next.js app router
export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
