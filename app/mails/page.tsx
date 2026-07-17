import Link from "next/link";
import { Mail, CheckCircle2, Circle } from "lucide-react";
import AppNav from "@/components/app-nav";
import { createClient } from "@/lib/supabase/server";
import { toggleRead, toggleActioned } from "./actions";

export default async function MailsPage({ searchParams }: { searchParams: { filter?: string } }) {
  const filter = searchParams.filter ?? "unread";
  const supabase = createClient();

  let query = supabase
    .from("emails")
    .select("*, customer:customers(name), lead:leads(name)")
    .order("received_at", { ascending: false })
    .limit(100);

  if (filter === "unread") query = query.eq("is_read", false);
  if (filter === "unactioned") query = query.eq("is_actioned", false);

  const { data: emails } = await query;

  const tabs = [
    { key: "unread", label: "Ulæste" },
    { key: "unactioned", label: "Uhandlede" },
    { key: "all", label: "Alle" },
  ];

  return (
    <>
      <AppNav current="/mails" />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6">
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-ink">
            <Mail className="h-6 w-6 text-accent" />
            Mails
          </h1>
          <p className="mt-1 text-sm text-ink/55">
            Automatisk overvågning af ma@mawebsolutions.dk, matchet mod kendte kunder og leads.
          </p>
        </div>

        <div className="mb-4 flex gap-1">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={`/mails?filter=${t.key}`}
              className={
                filter === t.key
                  ? "rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-canvas"
                  : "rounded-full px-3 py-1.5 text-sm font-medium text-ink/55 transition hover:bg-ink/[0.06] hover:text-ink"
              }
            >
              {t.label}
            </Link>
          ))}
        </div>

        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink/[0.03] text-xs uppercase tracking-wide text-ink/45">
              <tr>
                <th className="px-5 py-3">Afsender</th>
                <th className="px-5 py-3">Emne</th>
                <th className="px-5 py-3">Match</th>
                <th className="px-5 py-3">Modtaget</th>
                <th className="px-5 py-3">Læst</th>
                <th className="px-5 py-3">Handlet</th>
              </tr>
            </thead>
            <tbody>
              {(emails ?? []).map((e: any) => {
                const readAction = toggleRead.bind(null, e.id, e.is_read);
                const actionedAction = toggleActioned.bind(null, e.id, e.is_actioned);
                const matchHref = e.matched_customer_id
                  ? `/kunder/${e.matched_customer_id}`
                  : e.matched_lead_id
                    ? `/leads/${e.matched_lead_id}`
                    : null;
                const matchLabel = e.customer?.name ?? e.lead?.name ?? null;
                return (
                  <tr key={e.id} className={`border-t border-line/70 hover:bg-ink/[0.02] ${!e.is_read ? "font-medium" : ""}`}>
                    <td className="px-5 py-3 text-ink/80">{e.from_name || e.from_address || "Ukendt"}</td>
                    <td className="px-5 py-3 text-ink/80">{e.subject || "(intet emne)"}</td>
                    <td className="px-5 py-3">
                      {matchHref ? (
                        <Link
                          href={matchHref}
                          className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent hover:underline"
                        >
                          {matchLabel}
                        </Link>
                      ) : (
                        <span className="text-xs text-ink/35">Ingen match</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-ink/55">
                      {e.received_at ? new Date(e.received_at).toLocaleString("da-DK") : "–"}
                    </td>
                    <td className="px-5 py-3">
                      <form action={readAction}>
                        <button
                          type="submit"
                          className="text-ink/50 transition hover:text-accent"
                          title={e.is_read ? "Markér som ulæst" : "Markér som læst"}
                        >
                          {e.is_read ? <CheckCircle2 className="h-4 w-4 text-accent" /> : <Circle className="h-4 w-4" />}
                        </button>
                      </form>
                    </td>
                    <td className="px-5 py-3">
                      <form action={actionedAction}>
                        <button
                          type="submit"
                          className="text-ink/50 transition hover:text-accent"
                          title={e.is_actioned ? "Markér som ikke handlet" : "Markér som handlet"}
                        >
                          {e.is_actioned ? <CheckCircle2 className="h-4 w-4 text-accent" /> : <Circle className="h-4 w-4" />}
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
              {(emails ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-ink/40">
                    Ingen mails at vise endnu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
