import { notFound } from "next/navigation";
import { Save, Trash2 } from "lucide-react";
import AppNav from "@/components/app-nav";
import { BackLink } from "@/components/back-link";
import { Field } from "@/components/form-field";
import { ProductPriceField } from "@/components/product-price-field";
import { createClient } from "@/lib/supabase/server";
import { updateProject, deleteProject } from "../actions";

export default async function ProjektDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: project } = await supabase.from("projects").select("*").eq("id", params.id).single();
  if (!project) notFound();

  const { data: customers } = await supabase.from("customers").select("id, name").order("name");
  const { data: products } = await supabase
    .from("products")
    .select("id, name, default_price")
    .eq("is_active", true)
    .order("name");

  const updateWithId = updateProject.bind(null, params.id);
  const deleteWithId = deleteProject.bind(null, params.id);

  return (
    <>
      <AppNav current="/projekter" />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mx-auto max-w-2xl">
        <BackLink href="/projekter" label="Tilbage til projekter" />
        <h1 className="mb-6 text-2xl font-semibold text-ink">{project.name}</h1>
        <form action={updateWithId} className="card space-y-4 p-6">
          <div>
            <label className="label">Kunde</label>
            <select name="customer_id" required defaultValue={project.customer_id} className="input">
              {(customers ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Projektnavn" name="name" defaultValue={project.name} required />
            <Field label="Type" name="type" defaultValue={project.type ?? ""} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Status</label>
              <select name="status" defaultValue={project.status} className="input">
                <option value="forespoergsel">Forespørgsel</option>
                <option value="tilbud_sendt">Tilbud sendt</option>
                <option value="aftalt">Aftalt</option>
                <option value="i_gang">I gang</option>
                <option value="afsluttet">Afsluttet</option>
                <option value="efter_service">Efter-service</option>
              </select>
            </div>
            <Field label="Deadline" name="deadline" type="date" defaultValue={project.deadline ?? ""} />
          </div>
          <div>
            <label className="label">Scope (kort, konkret)</label>
            <textarea
              name="scope_description"
              rows={3}
              defaultValue={project.scope_description ?? ""}
              className="input"
            />
          </div>
          <ProductPriceField
            products={products ?? []}
            productFieldName="product_id"
            priceFieldName="price"
            priceLabel="Pris (DKK)"
            defaultProductId={project.product_id}
            defaultPrice={project.price?.toString() ?? ""}
            required={false}
          />
          <div>
            <label className="label">Fakturastatus</label>
            <select name="invoice_status" defaultValue={project.invoice_status} className="input">
              <option value="ikke_faktureret">Ikke faktureret</option>
              <option value="faktureret">Faktureret</option>
              <option value="betalt">Betalt</option>
            </select>
          </div>
          <Field label="Links" name="links" defaultValue={project.links ?? ""} />
          <div>
            <label className="label">Noter</label>
            <textarea name="notes" rows={3} defaultValue={project.notes ?? ""} className="input" />
          </div>
          <button type="submit" className="btn-primary gap-1.5">
            <Save className="h-4 w-4" />
            Gem ændringer
          </button>
        </form>

        <form action={deleteWithId} className="mt-3">
          <button type="submit" className="link-danger inline-flex items-center gap-1.5">
            <Trash2 className="h-3.5 w-3.5" />
            Slet projekt
          </button>
        </form>
         </div>
      </main>
    </>
  );
}