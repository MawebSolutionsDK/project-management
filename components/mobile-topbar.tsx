"use client";

import { Menu, Search } from "lucide-react";

// Vises kun under md-breakpointet. Sender events som Sidebar/CommandPalette lytter efter,
// da alle tre er uafhængigt monterede klient-komponenter i app/(app)/layout.tsx.
export function MobileTopbar() {
  return (
    <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-surface px-4 md:hidden">
      <div className="flex items-center gap-2">
        <button
          onClick={() =>
            window.dispatchEvent(new CustomEvent("toggle-mobile-sidebar"))
          }
          className="rounded-md p-1.5 text-ink/60 transition hover:bg-ink/[0.06] hover:text-ink"
          title="Menu"
          aria-label="Åbn menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-teal text-sm font-bold text-canvas">
          M
        </span>
        <span className="text-sm font-semibold text-ink">Maweb Solutions</span>
      </div>
      <button
        onClick={() =>
          window.dispatchEvent(new CustomEvent("open-command-palette"))
        }
        className="rounded-md p-1.5 text-ink/60 transition hover:bg-ink/[0.06] hover:text-ink"
        title="Søg"
        aria-label="Søg"
      >
        <Search className="h-5 w-5" />
      </button>
    </div>
  );
}
