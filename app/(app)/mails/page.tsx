import Link from "next/link";
import { Mail, CheckCircle2, Circle, Wrench, Trash2 } from "lucide-react";
import { EmailMatchSelect } from "@/components/email-match-select";
import { createClient } from "@/lib/supabase/server";
import type { Email } from "@/lib/types";

type EmailRow = Email & {
  customer: { name: string } | null;
  lead: { name: string } | null;
};
import {
  toggleRead,
  toggleActioned,
  setMatchedCustomer,
  deleteEmailAction,
  rematchUnmatchedEmails,
} from "./actions";

export default async function MailsPage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
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
  const { data: customers } = await supabase
    .from("customers")
    .select("id, name")
    .order("name");

  const tabs = [
    { key: "unread", label: "Ulæste" },
    { key: "unactioned", label: "Ubehandlet mail" },
    { key: "all", label: "Alle" },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-ink">
          <Mail className="h-6 w-6 text-accent" />
          Mails
        </h1>
        <p className="mt-1 text-sm text-ink/55">
          Automatisk overvågning af ma@mawebsolutions.dk, matchet mod kendte
          kunder og leads.
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex gap-1">
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
        <form action={rematchUnmatchedEmails}>
          <button
            type="submit"
            className="link-muted text-xs"
            title="Kør nuværende matching-regler igen på mails uden kunde/lead-match"
          >
            Prøv match igen
          </button>
        </form>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink/[0.03] text-xs uppercase tracking-wide text-ink/60">
            <tr>
              <th className="px-5 py-3">Afsender</th>
              <th className="px-5 py-3">Emne</th>
              <th className="px-5 py-3">Match</th>
              <th className="px-5 py-3">Modtaget</th>
              <th className="px-5 py-3">Læst</th>
              <th className="px-5 py-3">Handlet</th>
              <th className="px-5 py-3">Handling</th>
            </tr>
          </thead>
          <tbody>
            {((emails ?? []) as EmailRow[]).map((e) => {
              const readAction = toggleRead.bind(null, e.id, e.is_read);
              const actionedAction = toggleActioned.bind(
                null,
                e.id,
                e.is_actioned,
              );
              const matchAction = setMatchedCustomer.bind(null, e.id);
              const deleteAction = deleteEmailAction.bind(null, e.id);
              const matchHref = e.matched_customer_id
                ? `/kunder/${e.matched_customer_id}`
                : e.matched_lead_id
                  ? `/leads/${e.matched_lead_id}`
                  : null;
              const matchLabel = e.customer?.name ?? e.lead?.name ?? null;

              const caseParams = new URLSearchParams();
              if (e.matched_customer_id)
                caseParams.set("customer_id", e.matched_customer_id);
              if (e.subject) caseParams.set("title", e.subject);
              const descriptionParts = [
                e.from_name || e.from_address
                  ? `Fra: ${e.from_name || ""} <${e.from_address || ""}>`
                  : null,
                e.preview || null,
              ].filter(Boolean);
              if (descriptionParts.length > 0)
                caseParams.set("description", descriptionParts.join("\n\n"));
              caseParams.set("email_id", e.id);

              return (
                <tr
                  key={e.id}
                  className={`border-t border-line/70 hover:bg-ink/[0.02] ${!e.is_read ? "font-medium" : ""}`}
                >
                  <td className="px-5 py-3 text-ink/80">
                    <div>{e.from_name || "Ukendt afsender"}</div>
                    {e.from_address && (
                      <div className="text-xs font-normal text-ink/60">
                        {e.from_address}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3 text-ink/80">
                    <div>{e.subject || "(intet emne)"}</div>
                    {e.preview && (
                      <div
                        className="mt-0.5 max-w-xs truncate text-xs font-normal text-ink/55"
                        title={e.preview}
                      >
                        {e.preview}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="space-y-1.5">
                      {matchHref && matchLabel && (
                        <Link
                          href={matchHref}
                          className="inline-block rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent hover:underline"
                        >
                          {matchLabel}
                        </Link>
                      )}
                      <EmailMatchSelect
                        customers={customers ?? []}
                        defaultCustomerId={e.matched_customer_id}
                        action={matchAction}
                      />
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink/55">
                    {e.received_at
                      ? new Date(e.received_at).toLocaleString("da-DK")
                      : "–"}
                  </td>
                  <td className="px-5 py-3">
                    <form action={readAction}>
                      <button
                        type="submit"
                        className="text-ink/50 transition hover:text-accent"
                        title={
                          e.is_read ? "Markér som ulæst" : "Markér som læst"
                        }
                      >
                        {e.is_read ? (
                          <CheckCircle2 className="h-4 w-4 text-accent" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                      </button>
                    </form>
                  </td>
                  <td className="px-5 py-3">
                    <form action={actionedAction}>
                      <button
                        type="submit"
                        className="text-ink/50 transition hover:text-accent"
                        title={
                          e.is_actioned
                            ? "Markér som ikke handlet"
                            : "Markér som handlet"
                        }
                      >
                        {e.is_actioned ? (
                          <CheckCircle2 className="h-4 w-4 text-accent" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                      </button>
                    </form>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/support/ny?${caseParams.toString()}`}
                        className="flex items-center gap-1 text-xs font-medium text-ink/55 transition hover:text-accent"
                        title="Opret supportsag ud fra denne mail"
                      >
                        <Wrench className="h-3.5 w-3.5" />
                        Supportsag
                      </Link>
                      <form action={deleteAction}>
                        <button
                          type="submit"
                          className="text-ink/55 transition hover:text-rust"
                          title="Slet mail fra systemet"
                          aria-label="Slet mail fra systemet"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
            {(emails ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-ink/55">
                  Ingen mails at vise endnu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
