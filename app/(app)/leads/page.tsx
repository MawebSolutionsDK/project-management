import Link from "next/link";
import { Plus, Target, AlertTriangle } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Avatar } from "@/components/avatar";
import { TableSearch } from "@/components/table-search";
import { RowActions } from "@/components/row-actions";
import { ViewToggle } from "@/components/view-toggle";
import {
  KanbanBoard,
  type KanbanCard,
  type KanbanColumnDef,
} from "@/components/kanban-board";
import { createClient } from "@/lib/supabase/server";
import { leadStatusLabels, leadStatusTones, type Lead } from "@/lib/types";

type LeadRow = Lead & { customer: { name: string } | null };
import { daysUntil, relativeDayLabel } from "@/lib/dates";
import { deleteLead, updateLeadStatus } from "./actions";

const LEAD_COLUMNS: KanbanColumnDef[] = (
  Object.keys(leadStatusLabels) as (keyof typeof leadStatusLabels)[]
).map((value) => ({
  value,
  label: leadStatusLabels[value],
  tone: leadStatusTones[value],
}));

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: { view?: string };
}) {
  const view = searchParams.view === "list" ? "list" : "board";
  const supabase = createClient();
  const { data: leads } = await supabase
    .from("leads")
    .select("*, customer:customers(name)")
    .order("created_at", { ascending: false });

  const cards: KanbanCard[] = ((leads ?? []) as LeadRow[]).map((l) => {
    const isOpen = !["vundet", "tabt"].includes(l.status);
    const overdue =
      isOpen && l.next_action_date && daysUntil(l.next_action_date) < 0;
    let meta: string | null = null;
    let metaTone: "danger" | "warning" | null = null;
    if (l.next_action_date) {
      const d = daysUntil(l.next_action_date);
      meta = `${l.next_action ? `${l.next_action} – ` : ""}${relativeDayLabel(d)}`;
      metaTone = overdue ? "danger" : d <= 7 ? "warning" : null;
    }
    return {
      id: l.id,
      title: l.name,
      subtitle: l.customer?.name ?? l.source ?? null,
      meta,
      metaTone,
      status: l.status,
      tone: leadStatusTones[l.status as keyof typeof leadStatusTones],
    };
  });

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-ink">
            <Target className="h-6 w-6 text-accent" />
            Leads
          </h1>
          <p className="mt-1 text-sm text-ink/55">
            Nye kontakter og salgsmuligheder hos eksisterende kunder.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ViewToggle base="/leads" view={view} />
          <Link href="/leads/ny" className="btn-primary gap-1.5">
            <Plus className="h-4 w-4" />
            Nyt lead
          </Link>
        </div>
      </div>

      {view === "list" && (
        <div className="mb-3">
          <TableSearch placeholder="Søg leads..." />
        </div>
      )}

      {view === "board" ? (
        <KanbanBoard
          cards={cards}
          columns={LEAD_COLUMNS}
          hrefPrefix="/leads"
          onStatusChange={updateLeadStatus}
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink/[0.03] text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th className="px-5 py-3">Navn</th>
                <th className="px-5 py-3">Kilde</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Næste handling</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {((leads ?? []) as LeadRow[]).map((l) => {
                const isOpen = !["vundet", "tabt"].includes(l.status);
                const overdue =
                  isOpen &&
                  l.next_action_date &&
                  daysUntil(l.next_action_date) < 0;
                return (
                  <tr
                    key={l.id}
                    data-search-row={`${l.name} ${l.source ?? ""} ${l.customer?.name ?? ""}`}
                    className="group border-t border-line/70 hover:bg-ink/[0.02]"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={l.name} size="sm" />
                        <div>
                          <Link
                            href={`/leads/${l.id}`}
                            className="font-medium text-ink hover:underline"
                          >
                            {l.name}
                          </Link>
                          {l.customer?.name && (
                            <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
                              {l.customer.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-ink/65">{l.source ?? "–"}</td>
                    <td className="px-5 py-3">
                      <StatusBadge
                        tone={
                          leadStatusTones[
                            l.status as keyof typeof leadStatusTones
                          ]
                        }
                      >
                        {leadStatusLabels[
                          l.status as keyof typeof leadStatusLabels
                        ] ?? l.status}
                      </StatusBadge>
                    </td>
                    <td className="px-5 py-3">
                      {l.next_action ? (
                        <span
                          className={`inline-flex items-center gap-1.5 ${overdue ? "font-medium text-rust" : "text-ink/65"}`}
                        >
                          {overdue && <AlertTriangle className="h-3.5 w-3.5" />}
                          {l.next_action}
                          {l.next_action_date ? ` – ${l.next_action_date}` : ""}
                        </span>
                      ) : (
                        <span className="text-ink/65">–</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <RowActions
                        editHref={`/leads/${l.id}`}
                        deleteAction={deleteLead.bind(null, l.id)}
                      />
                    </td>
                  </tr>
                );
              })}
              {(leads ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-ink/55">
                    Ingen leads endnu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
