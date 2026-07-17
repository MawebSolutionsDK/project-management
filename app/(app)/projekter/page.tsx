import Link from "next/link";
import { Plus, Briefcase, Download } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { ViewToggle } from "@/components/view-toggle";
import {
  KanbanBoard,
  type KanbanCard,
  type KanbanColumnDef,
} from "@/components/kanban-board";
import { createClient } from "@/lib/supabase/server";
import { projectStatusLabels, projectStatusTones } from "@/lib/types";
import { daysUntil, relativeDayLabel } from "@/lib/dates";
import { updateProjectStatus } from "./actions";

const PROJECT_COLUMNS: KanbanColumnDef[] = (
  Object.keys(projectStatusLabels) as (keyof typeof projectStatusLabels)[]
).map((value) => ({ value, label: projectStatusLabels[value] }));

export default async function ProjekterPage({
  searchParams,
}: {
  searchParams: { view?: string };
}) {
  const view = searchParams.view === "board" ? "board" : "list";
  const supabase = createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("*, customer:customers(name)")
    .order("created_at", { ascending: false });

  const isOpenStatus = (status: string) =>
    !["afsluttet", "efter_service"].includes(status);

  const cards: KanbanCard[] = (projects ?? []).map((p: any) => {
    const overdue =
      isOpenStatus(p.status) && p.deadline && daysUntil(p.deadline) < 0;
    let meta: string | null = null;
    let metaTone: "danger" | "warning" | null = null;
    if (p.deadline) {
      const d = daysUntil(p.deadline);
      meta = `Deadline: ${relativeDayLabel(d)}`;
      metaTone = overdue ? "danger" : d <= 14 ? "warning" : null;
    }
    return {
      id: p.id,
      title: p.name,
      subtitle: p.customer?.name ?? null,
      meta,
      metaTone,
      status: p.status,
    };
  });

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-ink">
            <Briefcase className="h-6 w-6 text-accent" />
            Projekter
          </h1>
          <p className="mt-1 text-sm text-ink/55">
            Alle projekter, fra forespørgsel til afslutning.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle base="/projekter" view={view} />
          <a href="/projekter/export" className="btn-secondary gap-1.5">
            <Download className="h-4 w-4" />
            Eksportér CSV
          </a>
          <Link href="/projekter/ny" className="btn-primary gap-1.5">
            <Plus className="h-4 w-4" />
            Nyt projekt
          </Link>
        </div>
      </div>

      {view === "board" ? (
        <KanbanBoard
          cards={cards}
          columns={PROJECT_COLUMNS}
          hrefPrefix="/projekter"
          onStatusChange={updateProjectStatus}
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink/[0.03] text-xs uppercase tracking-wide text-ink/45">
              <tr>
                <th className="px-5 py-3">Projekt</th>
                <th className="px-5 py-3">Kunde</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Deadline</th>
              </tr>
            </thead>
            <tbody>
              {(projects ?? []).map((p: any) => (
                <tr
                  key={p.id}
                  className="border-t border-line/70 hover:bg-ink/[0.02]"
                >
                  <td className="px-5 py-3">
                    <Link
                      href={`/projekter/${p.id}`}
                      className="font-medium text-ink hover:underline"
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-ink/65">
                    {p.customer?.name ?? "–"}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge
                      tone={
                        projectStatusTones[
                          p.status as keyof typeof projectStatusTones
                        ]
                      }
                    >
                      {projectStatusLabels[
                        p.status as keyof typeof projectStatusLabels
                      ] ?? p.status}
                    </StatusBadge>
                  </td>
                  <td className="px-5 py-3 text-ink/65">{p.deadline ?? "–"}</td>
                </tr>
              ))}
              {(projects ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-ink/40">
                    Ingen projekter endnu.
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
