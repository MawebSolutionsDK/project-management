import { Save } from "lucide-react";
import { BackLink } from "@/components/back-link";
import { Field } from "@/components/form-field";
import { createClient } from "@/lib/supabase/server";
import { createLead } from "../actions";

export default async function NytLeadPage({
  searchParams,
}: {
  searchParams: { customer_id?: string };
}) {
  const supabase = createClient();
  const { data: customers } = await supabase
    .from("customers")
    .select("id, name")
    .eq("is_internal", false)
    .order("name");

  return (
    <>
      <div className="mx-auto max-w-2xl">
        <BackLink href="/leads" label="Tilbage til leads" />
        <h1 className="mb-6 text-2xl font-semibold text-ink">Nyt lead</h1>
        <form action={createLead} className="card space-y-4 p-6">
          <div>
            <label className="label">Eksisterende kunde (valgfrit)</label>
            <select
              name="customer_id"
              defaultValue={searchParams.customer_id ?? ""}
              className="input"
            >
              <option value="">– Nyt/ukendt kontakt –</option>
              {(customers ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-ink/45">
              Brug denne hvis leadet er en ny mulighed hos en eksisterende kunde
              (fx et nyt produkt).
            </p>
          </div>
          <Field label="Navn/firma" name="name" required />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Kontaktperson" name="contact_person" />
            <Field label="Email" name="email" type="email" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Telefon" name="phone" />
            <Field
              label="Kilde"
              name="source"
              placeholder="fx Facebook, henvisning, gratis vurdering"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            <Field
              label="Dato for næste handling"
              name="next_action_date"
              type="date"
            />
          </div>
          <Field
            label="Næste handling"
            name="next_action"
            placeholder="fx ring op, send tilbud"
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
