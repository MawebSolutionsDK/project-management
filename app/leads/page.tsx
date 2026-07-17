import Link from "next/link";
import { Plus, Target, AlertTriangle } from "lucide-react";
import AppNav from "@/components/app-nav";
import { StatusBadge } from "@/components/status-badge";
import { createClient } from "@/lib/supabase/server";
import { leadStatusLabels, leadStatusTones } from "@/lib/types";
import { daysUntil } from "@/lib/dates";

export default async function LeadsPage() {
  const supabase = createClient();
  const { data: leads } = await supabase
    .from("leads")
    .select("*, customer:customers(name)")
    .order("created_at", { ascending: false });

  return (
    <>
      <AppNav current="/leads" />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold text-ink">
              <Target className="h-6 w-6 text-accent" />
              Leads
            </h1>
            <p className="mt-1 text-sm text-ink/55">Nye kontakter og salgsmuligheder hos eksisterende kunder.</p>
          </div>
          <Link href="/leads/ny" className="btn-primary gap-1.5">
            <Plus className="h-4 w-4" />
            Nyt lead
          </Link>
        </div>
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink/[0.03] text-xs uppercase tracking-wide text-ink/45">
              <tr>
                <th className="px-5 py-3">Navn</th>
                <th className="px-5 py-3">Kilde</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Næste handling</th>
              </tr>
            </thead>
            <tbody>
              {(leads ?? []).map((l: any) => {
                const isOpen = !["vundet", "tabt"].includes(l.status);
                const overdue = isOpen && l.next_action_date && daysUntil(l.next_action_date) < 0;
                return (
                  <tr key={l.id} className="border-t border-line/70 hover:bg-ink/[0.02]">
                    <td className="px-5 py-3">
                      <Link href={`/leads/${l.id}`} className="font-medium text-ink hover:underline">
                        {l.name}
                      </Link>
                      {l.customer?.name && (
                        <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
                          {l.customer.name}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-ink/65">{l.source ?? "–"}</td>
                    <td className="px-5 py-3">
                      <StatusBadge tone={leadStatusTones[l.status as keyof typeof leadStatusTones]}>
                        {leadStatusLabels[l.status as keyof typeof leadStatusLabels] ?? l.status}
                      </StatusBadge>
                    </td>
                    <td className="px-5 py-3">
                      {l.next_action ? (
                        <span className={`inline-flex items-center gap-1.5 ${overdue ? "font-medium text-rust" : "text-ink/65"}`}>
                          {overdue && <AlertTriangle className="h-3.5 w-3.5" />}
                          {l.next_action}
                          {l.next_action_date ? ` – ${l.next_action_date}` : ""}
                        </span>
                      ) : (
                        <span className="text-ink/65">–</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {(leads ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-ink/40">
                    Ingen leads endnu.
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
