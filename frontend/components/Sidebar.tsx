"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PieChart, MessageCircle, Search, Siren, HelpCircle, Settings } from "lucide-react";

const NAV = [
  { href: "/", label: "Command Center", icon: PieChart },
  { href: "/inbox", label: "Listening Post", icon: MessageCircle },
  { href: "/geo", label: "AI Mirror", icon: Search },
  { href: "/crisis", label: "Crisis Room", icon: Siren, badge: true },
];

export default function Sidebar({ crisisCount = 3 }: { crisisCount?: number }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full min-h-0 shrink-0 flex-col self-stretch px-3 pb-0 pt-3">
      <aside className="flex min-h-0 w-[249px] flex-1 flex-col gap-6 rounded-xl bg-[#f5f8fa] p-4">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between pl-1">
            <div className="flex size-[34px] items-center justify-center rounded-[30px]">
              <span className="font-logo text-[32px] font-medium leading-none text-[#242424]">Vi</span>
            </div>
            <span className="text-[#717171]" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="4" width="6" height="16" rx="1" />
                <rect x="11" y="4" width="10" height="16" rx="1" opacity="0.35" />
              </svg>
            </span>
          </div>
          <div className="h-px w-full bg-[#d2dadf]" />
          <nav className="flex flex-col gap-5">
            {NAV.map(({ href, label, icon: Icon, badge }) => {
              const active = pathname === href;
              const labelText = badge ? `${label} (${crisisCount})` : label;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex h-10 items-center gap-3 rounded px-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-[#f7ecfd] text-[#46096e]"
                      : "text-[#242424] hover:bg-white/80"
                  }`}
                >
                  <Icon className="size-6 shrink-0" strokeWidth={1.5} />
                  {labelText}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex flex-col gap-7">
          <div className="h-px w-full bg-[#d2dadf]" />
          <a
            href="#"
            className="flex h-6 items-center gap-3 rounded px-2 text-sm font-medium text-[#242424] hover:bg-white/80"
          >
            <span className="flex size-6 items-center justify-center rounded-[14px] border-[1.5px] border-[#242424]">
              <HelpCircle className="size-3.5" strokeWidth={1.5} />
            </span>
            Help Center
          </a>
          <Link
            href="/settings"
            className={`flex h-6 items-center gap-3 rounded px-2 text-sm font-medium transition-colors ${
              pathname === "/settings"
                ? "bg-[#f7ecfd] text-[#46096e]"
                : "text-[#242424] hover:bg-white/80"
            }`}
          >
            <Settings className="size-6 shrink-0" strokeWidth={1.5} />
            Settings
          </Link>
        </div>
      </aside>
    </div>
  );
}
