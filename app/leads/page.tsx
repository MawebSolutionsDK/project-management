import Link from "next/link";
import AppNav from "@/components/app-nav";
import { createClient } from "@/lib/supabase/server";
import { leadStatusLabels } from "@/lib/types";

export default async function LeadsPage() {
  const supabase = createClient();
  const { data: leads } = await supabase.from("leads").select("*").order("created_at", { ascending: false });

  return (
    <>
      <AppNav current="/leads" />
      <main className="mx-auto max-w-5xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Leads</h1>
          <Link href="/leads/ny" className="rounded bg-gray-900 px-3 py-2 text-sm font-medium text-white">
            + Nyt lead
          </Link>
        </div>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Navn</th>
                <th className="px-4 py-2">Kilde</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Næste handling</th>
              </tr>
            </thead>
            <tbody>
              {(leads ?? []).map((l) => (
                <tr key={l.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <Link href={`/leads/${l.id}`} className="font-medium text-gray-900 hover:underline">
                      {l.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-gray-600">{l.source ?? "–"}</td>
                  <td className="px-4 py-2 text-gray-600">
                    {leadStatusLabels[l.status as keyof typeof leadStatusLabels] ?? l.status}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {l.next_action ? `${l.next_action}${l.next_action_date ? " – " + l.next_action_date : ""}` : "–"}
                  </td>
                </tr>
              ))}
              {(leads ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
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
