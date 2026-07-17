import AppNav from "@/components/app-nav";
import { Field } from "@/components/form-field";
import { createCustomer } from "../actions";

export default function NyKundePage() {
  return (
    <>
      <AppNav current="/kunder" />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-6 text-2xl font-semibold text-ink">Ny kunde</h1>
        <form action={createCustomer} className="card space-y-4 p-6">
          <Field label="Navn" name="name" required />
          <Field label="CVR" name="cvr" />
          <Field label="Kontaktperson" name="contact_person" />
          <Field label="Email" name="email" type="email" />
          <Field label="Telefon" name="phone" />
          <Field label="Branche" name="industry" placeholder="fx rejsebureau, lokal service" />
          <div>
            <label className="label">Status</label>
            <select name="status" defaultValue="aktiv" className="input">
              <option value="aktiv">Aktiv</option>
              <option value="tidligere">Tidligere</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink/75">
            <input type="checkbox" name="is_internal" className="h-4 w-4 rounded border-line text-accent focus:ring-accent" />
            Dette er min egen virksomhed (interne projekter)
          </label>
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
