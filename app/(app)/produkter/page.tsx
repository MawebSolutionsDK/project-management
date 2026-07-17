import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { TableSearch } from "@/components/table-search";
import { RowActions } from "@/components/row-actions";
import { createClient } from "@/lib/supabase/server";
import { pricingTypeLabels } from "@/lib/types";
import { deleteProduct } from "./actions";

export default async function ProdukterPage() {
  const supabase = createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("name");

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-ink">
            <Package className="h-6 w-6 text-accent" />
            Produkter
          </h1>
          <p className="mt-1 text-sm text-ink/55">
            Standardpriser til aftaler og projekter — prisen kan altid tilpasses
            den enkelte kunde.
          </p>
        </div>
        <Link href="/produkter/ny" className="btn-primary gap-1.5">
          <Plus className="h-4 w-4" />
          Nyt produkt
        </Link>
      </div>

      <div className="mb-3">
        <TableSearch placeholder="Søg produkter..." />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink/[0.03] text-xs uppercase tracking-wide text-ink/45">
            <tr>
              <th className="px-5 py-3">Navn</th>
              <th className="px-5 py-3">Kategori</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Standardpris</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {(products ?? []).map((p) => (
              <tr
                key={p.id}
                data-search-row={`${p.name} ${p.category ?? ""}`}
                className="group border-t border-line/70 hover:bg-ink/[0.02]"
              >
                <td className="px-5 py-3">
                  <Link
                    href={`/produkter/${p.id}`}
                    className="font-medium text-ink hover:underline"
                  >
                    {p.name}
                  </Link>
                </td>
                <td className="px-5 py-3 text-ink/65">{p.category ?? "–"}</td>
                <td className="px-5 py-3 text-ink/65">
                  {pricingTypeLabels[
                    p.pricing_type as keyof typeof pricingTypeLabels
                  ] ?? p.pricing_type}
                </td>
                <td className="px-5 py-3 text-ink/65">
                  {Number(p.default_price).toLocaleString("da-DK")} kr.
                </td>
                <td className="px-5 py-3">
                  {p.is_active ? (
                    <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
                      Aktiv
                    </span>
                  ) : (
                    <span className="rounded-full bg-ink/[0.06] px-2 py-0.5 text-xs font-medium text-ink/50">
                      Inaktiv
                    </span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <RowActions
                    editHref={`/produkter/${p.id}`}
                    deleteAction={deleteProduct.bind(null, p.id)}
                  />
                </td>
              </tr>
            ))}
            {(products ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-ink/40">
                  Ingen produkter oprettet endnu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
