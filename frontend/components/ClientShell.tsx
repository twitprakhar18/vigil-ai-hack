"use client";

import Sidebar from "@/components/Sidebar";
import RouteErrorBoundary from "@/components/RouteErrorBoundary";
import ShellErrorBoundary from "@/components/ShellErrorBoundary";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <ShellErrorBoundary>
      <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-row items-stretch overflow-hidden">
        <Sidebar />
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#f5f8fa]">
          <RouteErrorBoundary>{children}</RouteErrorBoundary>
        </main>
      </div>
    </ShellErrorBoundary>
  );
}
