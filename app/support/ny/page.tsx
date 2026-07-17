import AppNav from "@/components/app-nav";
import { Field } from "@/components/form-field";
import { createClient } from "@/lib/supabase/server";
import { createSupportCase } from "../actions";

export default async function NySupportsagPage() {
  const supabase = createClient();
  const { data: customers } = await supabase.from("customers").select("id, name").order("name");

  return (
    <>
      <AppNav current="/support" />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-6 text-2xl font-semibold text-ink">Ny supportsag</h1>
        <form action={createSupportCase} className="card space-y-4 p-6">
          <div>
            <label className="label">Kunde</label>
            <select name="customer_id" required defaultValue="" className="input">
              <option value="" disabled>
                Vælg kunde
              </option>
              {(customers ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <Field label="Titel" name="title" placeholder="fx Fejl på kontaktformular" required />
          <div>
            <label className="label">Beskrivelse</label>
            <textarea name="description" rows={3} className="input" />
          </div>
          <Field label="Timeforbrug" name="hours_spent" type="number" />
          <div>
            <label className="label">Fakturastatus</label>
            <select name="invoice_status" defaultValue="ikke_faktureret" className="input">
              <option value="ikke_faktureret">Ikke faktureret</option>
              <option value="faktureret">Faktureret</option>
              <option value="betalt">Betalt</option>
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select name="status" defaultValue="aaben" className="input">
              <option value="aaben">Åben</option>
              <option value="loest">Løst</option>
            </select>
          </div>
          <Field label="Åbnet dato" name="opened_at" type="date" />
          <Field label="Lukket dato" name="closed_at" type="date" />
          <div>
            <label className="label">Noter</label>
            <textarea name="notes" rows={3} className="input" />
          </div>
          <button type="submit" className="btn-primary">
            Gem
          </button>
        </form>
      </main>
    </>
  );
}
