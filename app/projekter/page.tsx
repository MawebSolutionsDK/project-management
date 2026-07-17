import Link from "next/link";
import AppNav from "@/components/app-nav";
import { createClient } from "@/lib/supabase/server";
import { projectStatusLabels } from "@/lib/types";

export default async function ProjekterPage() {
  const supabase = createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("*, customer:customers(name)")
    .order("created_at", { ascending: false });

  return (
    <>
      <AppNav current="/projekter" />
      <main className="mx-auto max-w-5xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Projekter</h1>
          <Link href="/projekter/ny" className="rounded bg-gray-900 px-3 py-2 text-sm font-medium text-white">
            + Nyt projekt
          </Link>
        </div>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Projekt</th>
                <th className="px-4 py-2">Kunde</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Deadline</th>
              </tr>
            </thead>
            <tbody>
              {(projects ?? []).map((p: any) => (
                <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <Link href={`/projekter/${p.id}`} className="font-medium text-gray-900 hover:underline">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-gray-600">{p.customer?.name ?? "–"}</td>
                  <td className="px-4 py-2 text-gray-600">
                    {projectStatusLabels[p.status as keyof typeof projectStatusLabels] ?? p.status}
                  </td>
                  <td className="px-4 py-2 text-gray-600">{p.deadline ?? "–"}</td>
                </tr>
              ))}
              {(projects ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
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
