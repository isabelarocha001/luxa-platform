"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-xl font-bold">Something went wrong</h1>
      <p className="mt-3 break-anywhere text-sm text-red-400">
        {error.message || "Unknown error"}
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-luxa-muted">Digest: {error.digest}</p>
      )}
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-full bg-luxa-accent px-5 py-2.5 text-sm font-bold text-white"
      >
        Try again
      </button>
      <p className="mt-4 text-xs text-luxa-muted">
        Check /api/health and Vercel Runtime Logs for details.
      </p>
    </main>
  );
}
