import { Save } from "lucide-react";
import { BackLink } from "@/components/back-link";
import { Field } from "@/components/form-field";
import { ProductPriceField } from "@/components/product-price-field";
import { createClient } from "@/lib/supabase/server";
import { createProject } from "../actions";

export default async function NytProjektPage({
  searchParams,
}: {
  searchParams: { customer_id?: string };
}) {
  const supabase = createClient();
  const { data: customers } = await supabase
    .from("customers")
    .select("id, name")
    .order("name");
  const { data: products } = await supabase
    .from("products")
    .select("id, name, default_price")
    .eq("is_active", true)
    .order("name");

  return (
    <>
      <div className="mx-auto max-w-2xl">
        <BackLink href="/projekter" label="Tilbage til projekter" />
        <h1 className="mb-6 text-2xl font-semibold text-ink">Nyt projekt</h1>
        <form action={createProject} className="card space-y-4 p-6">
          <div>
            <label className="label">Kunde</label>
            <select
              name="customer_id"
              required
              defaultValue={searchParams.customer_id ?? ""}
              className="input"
            >
              <option value="" disabled>
                Vælg kunde
              </option>
              {(customers ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {(customers ?? []).length === 0 && (
              <p className="mt-1 text-xs text-ink/60">
                Ingen kunder endnu — opret en kunde først under Kunder.
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Projektnavn"
              name="name"
              placeholder="fx Nyt website, Redesign, SEO-audit"
              required
            />
            <Field
              label="Type"
              name="type"
              placeholder="nyt_website, redesign, seo_audit, andet"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Status</label>
              <select
                name="status"
                defaultValue="forespoergsel"
                className="input"
              >
                <option value="forespoergsel">Forespørgsel</option>
                <option value="tilbud_sendt">Tilbud sendt</option>
                <option value="aftalt">Aftalt</option>
                <option value="i_gang">I gang</option>
                <option value="afsluttet">Afsluttet</option>
                <option value="efter_service">Efter-service</option>
              </select>
            </div>
            <Field label="Deadline" name="deadline" type="date" />
          </div>
          <div>
            <label className="label">Scope (kort, konkret)</label>
            <textarea name="scope_description" rows={3} className="input" />
          </div>
          <ProductPriceField
            products={products ?? []}
            productFieldName="product_id"
            priceFieldName="price"
            priceLabel="Pris (DKK)"
            required={false}
          />
          <div>
            <label className="label">Fakturastatus</label>
            <select
              name="invoice_status"
              defaultValue="ikke_faktureret"
              className="input"
            >
              <option value="ikke_faktureret">Ikke faktureret</option>
              <option value="faktureret">Faktureret</option>
              <option value="betalt">Betalt</option>
            </select>
          </div>
          <Field
            label="Links"
            name="links"
            placeholder="fx staging-site, filer"
          />
          <div>
            <label className="label">Noter</label>
            <textarea name="notes" rows={3} className="input" />
          </div>
          <button type="submit" className="btn-primary gap-1.5">
            <Save className="h-4 w-4" />
            Gem
          </button>
        </form>
      </div>
    </>
  );
}
