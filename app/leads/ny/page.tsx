import AppNav from "@/components/app-nav";
import { Field } from "@/components/form-field";
import { createLead } from "../actions";

export default function NytLeadPage() {
  return (
    <>
      <AppNav current="/leads" />
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="mb-4 text-xl font-semibold">Nyt lead</h1>
        <form action={createLead} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
          <Field label="Navn/firma" name="name" required />
          <Field label="Kontaktperson" name="contact_person" />
          <Field label="Email" name="email" type="email" />
          <Field label="Telefon" name="phone" />
          <Field label="Kilde" name="source" placeholder="fx Facebook, henvisning, gratis vurdering" />
          <div>
            <label className="mb-1 block text-sm font-medium">Status</label>
            <select name="status" defaultValue="ny" className="w-full rounded border border-gray-300 px-3 py-2 text-sm">
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
