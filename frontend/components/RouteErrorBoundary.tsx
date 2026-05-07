"use client";

import React from "react";

/**
 * Catches render errors in the main route slot (sidebar stays from layout).
 * Next `error.tsx` does not cover layout chrome; this avoids a blank `#__next` when the page throws.
 */
export default class RouteErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error): { error: Error } {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("[RouteErrorBoundary]", error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-6 py-12 text-center">
          <p className="text-sm font-medium text-[#242424]">This page hit a client error.</p>
          <p className="max-w-md text-xs text-[#717171]">{this.state.error.message}</p>
          <button
            type="button"
            className="rounded-xl bg-[#46096e] px-4 py-2 text-sm font-medium text-white"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </button>
          <button
            type="button"
            className="text-xs text-[#717171] underline"
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
