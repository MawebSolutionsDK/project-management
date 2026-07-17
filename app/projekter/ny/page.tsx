import AppNav from "@/components/app-nav";
import { Field } from "@/components/form-field";
import { createClient } from "@/lib/supabase/server";
import { createProject } from "../actions";

export default async function NytProjektPage({
  searchParams,
}: {
  searchParams: { customer_id?: string };
}) {
  const supabase = createClient();
  const { data: customers } = await supabase.from("customers").select("id, name").order("name");

  return (
    <>
      <AppNav current="/projekter" />
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="mb-4 text-xl font-semibold">Nyt projekt</h1>
        <form action={createProject} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
          <div>
            <label className="mb-1 block text-sm font-medium">Kunde</label>
            <select
              name="customer_id"
              required
              defaultValue={searchParams.customer_id ?? ""}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
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
              <p className="mt-1 text-xs text-gray-500">
                Ingen kunder endnu — opret en kunde først under Kunder.
              </p>
            )}
          </div>
          <Field label="Projektnavn" name="name" placeholder="fx Nyt website, Redesign, SEO-audit" required />
          <Field label="Type" name="type" placeholder="nyt_website, redesign, seo_audit, andet" />
          <div>
            <label className="mb-1 block text-sm font-medium">Status</label>
            <select name="status" defaultValue="forespoergsel" className="w-full rounded border border-gray-300 px-3 py-2 text-sm">
              <option value="forespoergsel">Forespørgsel</option>
              <option value="tilbud_sendt">Tilbud sendt</option>
              <option value="aftalt">Aftalt</option>
              <option value="i_gang">I gang</option>
              <option value="afsluttet">Afsluttet</option>
              <option value="efter_service">Efter-service</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Scope (kort, konkret)</label>
            <textarea name="scope_description" rows={3} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <Field label="Deadline" name="deadline" type="date" />
          <Field label="Pris (DKK)" name="price" type="number" />
          <div>
            <label className="mb-1 block text-sm font-medium">Fakturastatus</label>
            <select name="invoice_status" defaultValue="ikke_faktureret" className="w-full rounded border border-gray-300 px-3 py-2 text-sm">
              <option value="ikke_faktureret">Ikke faktureret</option>
              <option value="faktureret">Faktureret</option>
              <option value="betalt">Betalt</option>
            </select>
          </div>
          <Field label="Links" name="links" placeholder="fx staging-site, filer" />
          <div>
            <label className="mb-1 block text-sm font-medium">Noter</label>
            <textarea name="notes" rows={3} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white">
            Gem
          </button>
        </form>
      </main>
    </>
  );
}
