import AppNav from "@/components/app-nav";
import { Field } from "@/components/form-field";
import { createClient } from "@/lib/supabase/server";
import { createLead } from "../actions";

export default async function NytLeadPage() {
  const supabase = createClient();
  const { data: customers } = await supabase
    .from("customers")
    .select("id, name")
    .eq("is_internal", false)
    .order("name");

  return (
    <>
      <AppNav current="/leads" />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-6 text-2xl font-semibold text-ink">Nyt lead</h1>
        <form action={createLead} className="card space-y-4 p-6">
          <div>
            <label className="label">Eksisterende kunde (valgfrit)</label>
            <select name="customer_id" defaultValue="" className="input">
              <option value="">– Nyt/ukendt kontakt –</option>
              {(customers ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-ink/45">
              Brug denne hvis leadet er en ny mulighed hos en eksisterende kunde (fx et nyt produkt).
            </p>
          </div>
          <Field label="Navn/firma" name="name" required />
          <Field label="Kontaktperson" name="contact_person" />
          <Field label="Email" name="email" type="email" />
          <Field label="Telefon" name="phone" />
          <Field label="Kilde" name="source" placeholder="fx Facebook, henvisning, gratis vurdering" />
          <div>
            <label className="label">Status</label>
            <select name="status" defaultValue="ny" className="input">
              <option value="ny">Ny</option>
              <option value="kontaktet">Kontaktet</option>
              <option value="vurdering_sendt">Vurdering sendt</option>
              <option value="tilbud">Tilbud</option>
              <option value="vundet">Vundet</option>
              <option value="tabt">Tabt</option>
            </select>
          </div>
          <Field label="Næste handling" name="next_action" placeholder="fx ring op, send tilbud" />
          <Field label="Dato for næste handling" name="next_action_date" type="date" />
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
