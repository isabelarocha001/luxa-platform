"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ background: "#0a0a0b", color: "#f4f4f5", fontFamily: "system-ui", padding: 24 }}>
        <h1>Application error</h1>
        <p style={{ color: "#f87171" }}>{error.message}</p>
        {error.digest && <p style={{ fontSize: 12, opacity: 0.6 }}>Digest: {error.digest}</p>}
        <button type="button" onClick={reset} style={{ marginTop: 16, padding: "8px 16px" }}>
          Try again
        </button>
      </body>
    </html>
  );
}
