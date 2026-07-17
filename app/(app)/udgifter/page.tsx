import Link from "next/link";
import { Plus, Receipt } from "lucide-react";
import { TableSearch } from "@/components/table-search";
import { RowActions } from "@/components/row-actions";
import { createClient } from "@/lib/supabase/server";
import { billingFrequencyLabels, annualizedCost } from "@/lib/types";
import { deleteExpense } from "./actions";

export default async function UdgifterPage() {
  const supabase = createClient();
  const { data: expenses } = await supabase
    .from("business_expenses")
    .select("*")
    .order("name");

  const rows = expenses ?? [];
  const total = rows.reduce((sum, e) => sum + annualizedCost(e), 0);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-ink">
            <Receipt className="h-6 w-6 text-accent" />
            Software- og plugin-udgifter
          </h1>
          <p className="mt-1 text-sm text-ink/55">
            Samlet: {total.toLocaleString("da-DK")} kr./år (omregnet) — brug
            dette til at prissætte vedligeholdelsesaftaler korrekt.
          </p>
        </div>
        <Link href="/udgifter/ny" className="btn-primary gap-1.5">
          <Plus className="h-4 w-4" />
          Ny udgift
        </Link>
      </div>

      <div className="mb-3">
        <TableSearch placeholder="Søg udgifter..." />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink/[0.03] text-xs uppercase tracking-wide text-ink/45">
            <tr>
              <th className="px-5 py-3">Navn</th>
              <th className="px-5 py-3">Kategori</th>
              <th className="px-5 py-3">Pris</th>
              <th className="px-5 py-3">Omregnet årligt</th>
              <th className="px-5 py-3">Fornyes</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr
                key={e.id}
                data-search-row={`${e.name} ${e.category ?? ""}`}
                className="group border-t border-line/70 hover:bg-ink/[0.02]"
              >
                <td className="px-5 py-3">
                  <Link
                    href={`/udgifter/${e.id}`}
                    className="font-medium text-ink hover:underline"
                  >
                    {e.name}
                  </Link>
                </td>
                <td className="px-5 py-3 text-ink/65">{e.category ?? "–"}</td>
                <td className="px-5 py-3 text-ink/65">
                  {Number(e.cost).toLocaleString("da-DK")} kr. /{" "}
                  {billingFrequencyLabels[
                    e.billing_frequency as keyof typeof billingFrequencyLabels
                  ].toLowerCase()}
                </td>
                <td className="px-5 py-3 text-ink/65">
                  {annualizedCost(e).toLocaleString("da-DK")} kr.
                </td>
                <td className="px-5 py-3 text-ink/65">
                  {e.renewal_date ?? "–"}
                </td>
                <td className="px-5 py-3">
                  <RowActions
                    editHref={`/udgifter/${e.id}`}
                    deleteAction={deleteExpense.bind(null, e.id)}
                  />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-ink/40">
                  Ingen udgifter registreret endnu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
