import Link from "next/link";
import { Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { buildActivityLog } from "@/lib/activity";

const TYPE_LABELS: Record<string, string> = {
  all: "Alle",
  customer: "Kunder",
  lead: "Leads",
  project: "Projekter",
  support: "Support",
  agreement: "Aftaler",
  product: "Produkter",
  expense: "Udgifter",
};

export default async function AktivitetPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const supabase = createClient();
  const events = await buildActivityLog(supabase);
  const type =
    searchParams.type && TYPE_LABELS[searchParams.type]
      ? searchParams.type
      : "all";
  const filtered =
    type === "all" ? events : events.filter((e) => e.type === type);

  return (
    <>
      <h1 className="flex items-center gap-2 text-2xl font-semibold text-ink">
        <Clock className="h-6 w-6 text-accent" />
        Aktivitetslog
      </h1>
      <p className="mt-1 text-sm text-ink/55">
        Kronologisk historik over nye og afsluttede poster på tværs af systemet.
      </p>

      <div className="mb-4 mt-4 flex flex-wrap gap-1">
        {Object.entries(TYPE_LABELS).map(([key, label]) => (
          <Link
            key={key}
            href={key === "all" ? "/aktivitet" : `/aktivitet?type=${key}`}
            className={
              type === key
                ? "rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-canvas"
                : "rounded-full px-3 py-1.5 text-sm font-medium text-ink/55 transition hover:bg-ink/[0.06] hover:text-ink"
            }
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-ink/55">
            Ingen aktivitet endnu.
          </p>
        ) : (
          <ul>
            {filtered.slice(0, 150).map((e) => (
              <li
                key={e.key}
                className="flex items-center justify-between gap-4 border-t border-line/70 px-5 py-3 first:border-t-0"
              >
                <Link
                  href={e.href}
                  className="truncate text-sm text-ink/80 hover:underline"
                >
                  {e.label}
                </Link>
                <span className="shrink-0 text-xs text-ink/55">
                  {new Date(e.timestamp).toLocaleString("da-DK")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
