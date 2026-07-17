import Link from "next/link";
import AppNav from "@/components/app-nav";
import { createClient } from "@/lib/supabase/server";
import { customerStatusLabels } from "@/lib/types";

export default async function KunderPage() {
  const supabase = createClient();
  const { data: customers } = await supabase.from("customers").select("*").order("name");

  return (
    <>
      <AppNav current="/kunder" />
      <main className="mx-auto max-w-5xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Kunder</h1>
          <Link href="/kunder/ny" className="rounded bg-gray-900 px-3 py-2 text-sm font-medium text-white">
            + Ny kunde
          </Link>
        </div>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Navn</th>
                <th className="px-4 py-2">Branche</th>
                <th className="px-4 py-2">Kontakt</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {(customers ?? []).map((c) => (
                <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <Link href={`/kunder/${c.id}`} className="font-medium text-gray-900 hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-gray-600">{c.industry ?? "–"}</td>
                  <td className="px-4 py-2 text-gray-600">{c.contact_person ?? c.email ?? "–"}</td>
                  <td className="px-4 py-2 text-gray-600">
                    {customerStatusLabels[c.status as keyof typeof customerStatusLabels] ?? c.status}
                  </td>
                </tr>
              ))}
              {(customers ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                    Ingen kunder endnu.
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
