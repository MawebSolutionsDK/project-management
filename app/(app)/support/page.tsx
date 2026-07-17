import Link from "next/link";
import { Plus, LifeBuoy } from "lucide-react";
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
import {
  supportStatusLabels,
  supportStatusTones,
  invoiceStatusLabels,
  invoiceStatusTones,
  type SupportCase,
} from "@/lib/types";

type SupportCaseRow = SupportCase & { customer: { name: string } | null };
import { deleteSupportCase, updateSupportStatus } from "./actions";

const SUPPORT_COLUMNS: KanbanColumnDef[] = (
  Object.keys(supportStatusLabels) as (keyof typeof supportStatusLabels)[]
).map((value) => ({ value, label: supportStatusLabels[value] }));

export default async function SupportPage({
  searchParams,
}: {
  searchParams: { view?: string };
}) {
  const view = searchParams.view === "list" ? "list" : "board";
  const supabase = createClient();
  const { data: cases } = await supabase
    .from("support_cases")
    .select("*, customer:customers(name)")
    .order("opened_at", { ascending: false });

  const cards: KanbanCard[] = ((cases ?? []) as SupportCaseRow[]).map((s) => ({
    id: s.id,
    title: s.title,
    subtitle: s.customer?.name ?? null,
    meta: s.hours_spent
      ? `${s.hours_spent} timer brugt`
      : s.opened_at
        ? `Åbnet ${s.opened_at}`
        : null,
    metaTone: null,
    status: s.status,
    tone: supportStatusTones[s.status as keyof typeof supportStatusTones],
  }));

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-ink">
            <LifeBuoy className="h-6 w-6 text-accent" />
            Support
          </h1>
          <p className="mt-1 text-sm text-ink/55">
            Supportsager, solgt separat fra vedligeholdelse.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ViewToggle base="/support" view={view} />
          <Link href="/support/ny" className="btn-primary gap-1.5">
            <Plus className="h-4 w-4" />
            Ny sag
          </Link>
        </div>
      </div>

      {view === "list" && (
        <div className="mb-3">
          <TableSearch placeholder="Søg supportsager..." />
        </div>
      )}

      {view === "board" ? (
        <KanbanBoard
          cards={cards}
          columns={SUPPORT_COLUMNS}
          hrefPrefix="/support"
          onStatusChange={updateSupportStatus}
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink/[0.03] text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th className="px-5 py-3">Sag</th>
                <th className="px-5 py-3">Kunde</th>
                <th className="px-5 py-3">Timer</th>
                <th className="px-5 py-3">Faktura</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {((cases ?? []) as SupportCaseRow[]).map((s) => (
                <tr
                  key={s.id}
                  data-search-row={`${s.title} ${s.customer?.name ?? ""}`}
                  className="group border-t border-line/70 hover:bg-ink/[0.02]"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={s.title} size="sm" />
                      <Link
                        href={`/support/${s.id}`}
                        className="font-medium text-ink hover:underline"
                      >
                        {s.title}
                      </Link>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink/65">
                    {s.customer?.name ?? "–"}
                  </td>
                  <td className="px-5 py-3 text-ink/65">
                    {s.hours_spent ?? "–"}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge
                      tone={
                        invoiceStatusTones[
                          s.invoice_status as keyof typeof invoiceStatusTones
                        ]
                      }
                    >
                      {invoiceStatusLabels[
                        s.invoice_status as keyof typeof invoiceStatusLabels
                      ] ?? s.invoice_status}
                    </StatusBadge>
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge
                      tone={
                        supportStatusTones[
                          s.status as keyof typeof supportStatusTones
                        ]
                      }
                    >
                      {supportStatusLabels[
                        s.status as keyof typeof supportStatusLabels
                      ] ?? s.status}
                    </StatusBadge>
                  </td>
                  <td className="px-5 py-3">
                    <RowActions
                      editHref={`/support/${s.id}`}
                      deleteAction={deleteSupportCase.bind(null, s.id)}
                    />
                  </td>
                </tr>
              ))}
              {(cases ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-ink/55">
                    Ingen supportsager endnu.
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
