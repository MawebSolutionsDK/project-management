import Link from "next/link";
import { Bell, Check } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { createClient } from "@/lib/supabase/server";
import { buildActiveNotifications } from "@/lib/notifications";
import { daysUntil, relativeDayLabel } from "@/lib/dates";
import { dismissNotification } from "./actions";

export default async function NotifikationerPage() {
  const supabase = createClient();
  const notifications = await buildActiveNotifications(supabase);

  return (
    <>
      <h1 className="flex items-center gap-2 text-2xl font-semibold text-ink">
        <Bell className="h-6 w-6 text-accent" />
        Notifikationer
      </h1>
      <p className="mt-1 text-sm text-ink/55">
        Samlet overblik over forsinkede opfølgninger, deadlines og fornyelser.
        Markér som set for at rydde op.
      </p>

      <div className="card mt-6 overflow-hidden">
        {notifications.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-ink/40">
            Intet der kræver din opmærksomhed lige nu.
          </p>
        ) : (
          <ul>
            {notifications.map((n) => {
              const dismissAction = dismissNotification.bind(null, n.key);
              return (
                <li
                  key={n.key}
                  className="flex items-center justify-between gap-4 border-t border-line/70 px-5 py-3.5 first:border-t-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <StatusBadge tone={n.tone}>
                      {relativeDayLabel(daysUntil(n.date))}
                    </StatusBadge>
                    <Link
                      href={n.href}
                      className="truncate text-sm text-ink/80 hover:underline"
                    >
                      {n.message}
                    </Link>
                  </div>
                  <form action={dismissAction}>
                    <button
                      type="submit"
                      className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-ink/45 transition hover:text-accent"
                      title="Markér som set"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Markér som set
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
