"use client";

import { Bell } from "lucide-react";

const AVATARS = [
  { initials: "A", bg: "bg-[#faadad]", z: "z-50" },
  { initials: "RD", bg: "bg-[#f0d4aa]", z: "z-40" },
  { initials: "MK", bg: "bg-[#cee2b0]", z: "z-30" },
  { initials: "A", bg: "bg-[#abc3eb]", z: "z-20" },
  { initials: "P", bg: "bg-[#d097cd]", z: "z-10" },
];

export default function DashboardHeader() {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-[#ebebeb] bg-white px-4 py-2.5">
      <div className="flex min-w-0 flex-1 items-center justify-between gap-4 lg:max-w-xl">
        <h1 className="font-display text-2xl font-bold leading-none tracking-tight text-[#242424]">
          Command Centre
        </h1>
        <div className="flex items-center gap-1">
          <div className="flex -space-x-2">
            {AVATARS.map((a, i) => (
              <div
                key={`${a.initials}-${i}`}
                className={`relative flex size-[34px] shrink-0 items-center justify-center rounded-[18px] border-[1.5px] border-white ${a.bg} ${a.z} font-medium text-[#242424]`}
              >
                <span className="text-sm">{a.initials}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="flex size-[34px] shrink-0 items-center justify-center rounded-full border border-[#d2dadf] text-sm font-normal text-[#242424]"
            aria-label="Add profile"
          >
            +
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative flex size-[34px] items-center justify-center rounded-full text-[#242424]"
          aria-label="Notifications"
        >
          <Bell className="size-5" strokeWidth={1.5} />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-[#d95353]" />
        </button>
        <div className="flex size-[34px] items-center justify-center rounded-[18px] bg-[#242424] text-base font-normal text-white">
          A
        </div>
      </div>
    </header>
  );
}
