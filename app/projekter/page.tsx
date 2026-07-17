import Link from "next/link";
import { Plus, Briefcase } from "lucide-react";
import AppNav from "@/components/app-nav";
import { StatusBadge } from "@/components/status-badge";
import { createClient } from "@/lib/supabase/server";
import { projectStatusLabels, projectStatusTones } from "@/lib/types";

export default async function ProjekterPage() {
  const supabase = createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("*, customer:customers(name)")
    .order("created_at", { ascending: false });

  return (
    <>
      <AppNav current="/projekter" />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold text-ink">
              <Briefcase className="h-6 w-6 text-accent" />
              Projekter
            </h1>
            <p className="mt-1 text-sm text-ink/55">Alle projekter, fra forespørgsel til afslutning.</p>
          </div>
          <Link href="/projekter/ny" className="btn-primary gap-1.5">
            <Plus className="h-4 w-4" />
            Nyt projekt
          </Link>
        </div>
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
                <tr key={p.id} className="border-t border-line/70 hover:bg-ink/[0.02]">
                  <td className="px-5 py-3">
                    <Link href={`/projekter/${p.id}`} className="font-medium text-ink hover:underline">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-ink/65">{p.customer?.name ?? "–"}</td>
                  <td className="px-5 py-3">
                    <StatusBadge tone={projectStatusTones[p.status as keyof typeof projectStatusTones]}>
                      {projectStatusLabels[p.status as keyof typeof projectStatusLabels] ?? p.status}
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
      </main>
    </>
  );
}
