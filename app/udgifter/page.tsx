import Link from "next/link";
import { Plus, Receipt } from "lucide-react";
import AppNav from "@/components/app-nav";
import { createClient } from "@/lib/supabase/server";

const MAANEDER = ["", "Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"];

export default async function UdgifterPage() {
  const supabase = createClient();
  const { data: expenses } = await supabase.from("business_expenses").select("*").order("name");

  const total = (expenses ?? []).reduce((sum, e) => sum + Number(e.annual_cost || 0), 0);

  return (
    <>
      <AppNav current="/udgifter" />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold text-ink">
              <Receipt className="h-6 w-6 text-accent" />
              Software- og plugin-udgifter
            </h1>
            <p className="mt-1 text-sm text-ink/55">
              Samlet: {total.toLocaleString("da-DK")} kr./år — brug dette til at prissætte vedligeholdelsesaftaler korrekt.
            </p>
          </div>
          <Link href="/udgifter/ny" className="btn-primary gap-1.5">
            <Plus className="h-4 w-4" />
            Ny udgift
          </Link>
        </div>
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink/[0.03] text-xs uppercase tracking-wide text-ink/45">
              <tr>
                <th className="px-5 py-3">Navn</th>
                <th className="px-5 py-3">Kategori</th>
                <th className="px-5 py-3">Årlig pris</th>
                <th className="px-5 py-3">Fornyes</th>
              </tr>
            </thead>
            <tbody>
              {(expenses ?? []).map((e) => (
                <tr key={e.id} className="border-t border-line/70 hover:bg-ink/[0.02]">
                  <td className="px-5 py-3">
                    <Link href={`/udgifter/${e.id}`} className="font-medium text-ink hover:underline">
                      {e.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-ink/65">{e.category ?? "–"}</td>
                  <td className="px-5 py-3 text-ink/65">{Number(e.annual_cost).toLocaleString("da-DK")} kr.</td>
                  <td className="px-5 py-3 text-ink/65">{e.renewal_month ? MAANEDER[e.renewal_month] : "–"}</td>
                </tr>
              ))}
              {(expenses ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-ink/40">
                    Ingen udgifter registreret endnu.
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
