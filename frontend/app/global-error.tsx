"use client";

import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f5f8fa] font-sans text-[#242424] antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 py-12 text-center">
          <div className="max-w-md space-y-2">
            <h1 className="text-lg font-semibold">Something went wrong</h1>
            <p className="text-sm text-[#717171]">{error.message || "Please reload the page."}</p>
          </div>
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-xl bg-[#46096e] px-4 py-2 text-sm font-medium text-white"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
