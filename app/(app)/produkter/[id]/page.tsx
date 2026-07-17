import { notFound } from "next/navigation";
import { Save, Trash2 } from "lucide-react";
import { BackLink } from "@/components/back-link";
import { Field } from "@/components/form-field";
import { createClient } from "@/lib/supabase/server";
import { updateProduct, deleteProduct } from "../actions";

export default async function ProduktDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!product) notFound();

  const updateWithId = updateProduct.bind(null, params.id);
  const deleteWithId = deleteProduct.bind(null, params.id);

  return (
    <>
      <div className="mx-auto max-w-2xl">
        <BackLink href="/produkter" label="Tilbage til produkter" />
        <h1 className="mb-6 text-2xl font-semibold text-ink">{product.name}</h1>
        <form action={updateWithId} className="card space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Navn"
              name="name"
              defaultValue={product.name}
              required
            />
            <Field
              label="Kategori"
              name="category"
              defaultValue={product.category ?? ""}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Standardpris (DKK)"
              name="default_price"
              type="number"
              defaultValue={product.default_price?.toString() ?? ""}
              required
            />
            <div>
              <label className="label">Pristype</label>
              <select
                name="pricing_type"
                defaultValue={product.pricing_type}
                className="input"
              >
                <option value="engangsbeloeb">Engangsbeløb</option>
                <option value="maanedlig">Månedligt</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Beskrivelse</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={product.description ?? ""}
              className="input"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-ink/75">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={product.is_active}
              className="h-4 w-4 rounded border-line text-accent focus:ring-accent"
            />
            Aktivt (vises som valgmulighed ved oprettelse af aftaler/projekter)
          </label>
          <div>
            <label className="label">Noter</label>
            <textarea
              name="notes"
              rows={3}
              defaultValue={product.notes ?? ""}
              className="input"
            />
          </div>
          <button type="submit" className="btn-primary gap-1.5">
            <Save className="h-4 w-4" />
            Gem ændringer
          </button>
        </form>

        <form action={deleteWithId} className="mt-3">
          <button
            type="submit"
            className="link-danger inline-flex items-center gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Slet produkt
          </button>
        </form>
      </div>
    </>
  );
}
