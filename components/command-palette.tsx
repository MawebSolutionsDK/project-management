"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

type Result = { id: string; label: string; group: string; href: string };

// Global Cmd/Ctrl+K søgning. Åbnes enten via tastaturgenvej overalt i systemet, eller
// ved at trykke på søgeknappen i sidebaren (som sender et "open-command-palette"-event,
// da Sidebar og CommandPalette monteres som to uafhængige klient-komponenter i layoutet).
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    function onOpenEvent() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("open-command-palette", onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("open-command-palette", onOpenEvent);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setActiveIndex(0);
      const t = setTimeout(() => inputRef.current?.focus(), 10);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setResults(data.results ?? []);
        setActiveIndex(0);
      } catch {
        // aborteret (ny søgning startet) eller netværksfejl - ignorér
      }
    }, 200);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [query, open]);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  function onKeyDownInput(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = results[activeIndex];
      if (r) go(r.href);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-[12vh]"
      onClick={() => setOpen(false)}
    >
      <div
        className="card w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-ink/55" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDownInput}
            placeholder="Søg efter kunde, lead, projekt, sag..."
            className="w-full bg-transparent text-sm text-ink placeholder:text-ink/55 focus:outline-none"
          />
          <kbd className="shrink-0 rounded border border-line px-1.5 py-0.5 text-[10px] text-ink/55">
            Esc
          </kbd>
        </div>

        {results.length > 0 && (
          <ul className="max-h-80 overflow-y-auto py-2">
            {results.map((r, i) => (
              <li key={`${r.group}-${r.id}`}>
                <button
                  onClick={() => go(r.href)}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm ${
                    i === activeIndex
                      ? "bg-accent-soft text-accent"
                      : "text-ink/80 hover:bg-ink/[0.05]"
                  }`}
                >
                  <span className="truncate">{r.label}</span>
                  <span className="shrink-0 text-xs text-ink/55">
                    {r.group}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {query.trim().length >= 2 && results.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-ink/55">
            Ingen resultater.
          </p>
        )}
        {query.trim().length < 2 && (
          <p className="px-4 py-6 text-center text-xs text-ink/55">
            Skriv mindst 2 tegn for at søge.
          </p>
        )}
      </div>
    </div>
  );
}
