export default function Loading() {
  return (
    <div className="flex min-h-[120px] flex-1 flex-col items-center justify-center gap-2 bg-[#f5f8fa] px-4 py-8">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#d2dadf] border-t-[#46096e]" aria-hidden />
      <p className="text-sm text-[#717171]">Loading dashboard…</p>
    </div>
  );
}
