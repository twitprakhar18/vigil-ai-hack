"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <div className="max-w-md space-y-2">
        <h1 className="text-lg font-semibold text-[#242424]">Something went wrong</h1>
        <p className="text-sm text-[#717171]">{error.message || "An unexpected error occurred in this view."}</p>
      </div>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-xl bg-[#46096e] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#3a0773]"
      >
        Try again
      </button>
    </div>
  );
}
