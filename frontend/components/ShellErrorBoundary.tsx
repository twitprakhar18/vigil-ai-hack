/** Shell-wide boundary: Sidebar sat outside the previous boundary, so a crash there still blanked `#__next`. */
"use client";

import React from "react";

export default class ShellErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error): { error: Error } {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("[ShellErrorBoundary]", error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#f5f8fa] px-6 py-12 text-center">
          <p className="text-sm font-medium text-[#242424]">Something failed while loading the shell.</p>
          <p className="max-w-md text-xs text-[#717171]">{this.state.error.message}</p>
          <p className="max-w-md text-[11px] text-[#717171]">
            If this persists: stop dev, run{" "}
            <code className="rounded bg-[#eef2f4] px-1">cd frontend &amp;&amp; rm -rf .next &amp;&amp; npm run dev</code>
            , disable browser extensions on localhost, and use the exact URL Next prints (port may not be 3000).
          </p>
          <button
            type="button"
            className="rounded-xl bg-[#46096e] px-4 py-2 text-sm font-medium text-white"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
