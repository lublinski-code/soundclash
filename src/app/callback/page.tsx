"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { exchangeCodeForToken } from "@/lib/spotify/auth";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Connecting to Spotify...");

  useEffect(() => {
    async function handleCallback() {
      try {
        const code = searchParams.get("code");
        const errorParam = searchParams.get("error");

        if (errorParam) {
          setError(`Spotify authorization denied: ${errorParam}`);
          return;
        }

        if (!code) {
          setError("No authorization code received from Spotify. Please try connecting again.");
          return;
        }

        setStatus("Exchanging authorization code...");

        await exchangeCodeForToken(code);

        setStatus("Success! Redirecting...");

        // Small delay so user sees success before redirect
        setTimeout(() => {
          router.replace("/");
        }, 300);
      } catch (err) {
        console.error("Callback error:", err);
        const message = err instanceof Error ? err.message : "Unknown error during token exchange";
        setError(message);
      }
    }

    handleCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
        <div className="text-[var(--flash-miss)] text-lg font-bold">
          Connection Failed
        </div>
        <p className="text-[var(--text-secondary)] text-sm max-w-md text-center">
          {error}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => router.replace("/")}
            className="px-6 py-2 rounded-lg border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Back to Home
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 rounded-lg border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
      <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      <p className="text-[var(--text-muted)] text-sm">{status}</p>
    </main>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--text-muted)] text-sm">Loading...</p>
        </main>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
