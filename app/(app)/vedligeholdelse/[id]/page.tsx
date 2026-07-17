import { notFound } from "next/navigation";
import { Save, Trash2 } from "lucide-react";
import { BackLink } from "@/components/back-link";
import { Field } from "@/components/form-field";
import { ProductPriceField } from "@/components/product-price-field";
import { createClient } from "@/lib/supabase/server";
import { updateAgreement, deleteAgreement } from "../actions";

export default async function AftaleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: agreement } = await supabase
    .from("maintenance_agreements")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!agreement) notFound();

  const { data: customers } = await supabase
    .from("customers")
    .select("id, name")
    .order("name");
  const { data: products } = await supabase
    .from("products")
    .select("id, name, default_price")
    .eq("is_active", true)
    .order("name");

  const updateWithId = updateAgreement.bind(null, params.id);
  const deleteWithId = deleteAgreement.bind(null, params.id);

  return (
    <>
      <div className="mx-auto max-w-2xl">
        <BackLink href="/vedligeholdelse" label="Tilbage til aftaler" />
        <h1 className="mb-1 text-2xl font-semibold text-ink">
          {agreement.plan_name}
        </h1>
        <p className="mb-6 text-sm text-ink/55">
          Fornyes: {agreement.renewal_date} (beregnes automatisk ud fra
          startdato + periode)
        </p>
        <form action={updateWithId} className="card space-y-4 p-6">
          <div>
            <label className="label">Kunde</label>
            <select
              name="customer_id"
              required
              defaultValue={agreement.customer_id}
              className="input"
            >
              {(customers ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <Field
            label="Plan"
            name="plan_name"
            defaultValue={agreement.plan_name}
            required
          />
          <ProductPriceField
            products={products ?? []}
            productFieldName="product_id"
            priceFieldName="monthly_price"
            priceLabel="Pris pr. måned (DKK)"
            defaultProductId={agreement.product_id}
            defaultPrice={agreement.monthly_price?.toString() ?? ""}
          />
          <div>
            <label className="label">Aftaleperiode</label>
            <select
              name="period_years"
              defaultValue={agreement.period_years?.toString()}
              className="input"
            >
              <option value="1">1 år</option>
              <option value="2">2 år</option>
              <option value="3">3 år</option>
            </select>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Startdato"
              name="start_date"
              type="date"
              defaultValue={agreement.start_date}
              required
            />
            <div>
              <label className="label">Status</label>
              <select
                name="status"
                defaultValue={agreement.status}
                className="input"
              >
                <option value="aktiv">Aktiv</option>
                <option value="opsagt">Opsagt</option>
                <option value="udloebet">Udløbet</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Noter</label>
            <textarea
              name="notes"
              rows={3}
              defaultValue={agreement.notes ?? ""}
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
            Slet aftale
          </button>
        </form>
      </div>
    </>
  );
}
