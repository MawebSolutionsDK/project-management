import { Save } from "lucide-react";
import { BackLink } from "@/components/back-link";
import { Field } from "@/components/form-field";
import { createCustomer } from "../actions";

export default function NyKundePage() {
  return (
    <>
      <div className="mx-auto max-w-2xl">
        <BackLink href="/kunder" label="Tilbage til kunder" />
        <h1 className="mb-6 text-2xl font-semibold text-ink">Ny kunde</h1>
        <form action={createCustomer} className="card space-y-4 p-6">
          <Field label="Navn" name="name" required />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="CVR" name="cvr" />
            <Field label="Kontaktperson" name="contact_person" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Email" name="email" type="email" />
            <Field label="Telefon" name="phone" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Branche"
              name="industry"
              placeholder="fx rejsebureau, lokal service"
            />
            <div>
              <label className="label">Status</label>
              <select name="status" defaultValue="aktiv" className="input">
                <option value="aktiv">Aktiv</option>
                <option value="tidligere">Tidligere</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink/75">
            <input
              type="checkbox"
              name="is_internal"
              className="h-4 w-4 rounded border-line text-accent focus:ring-accent"
            />
            Dette er min egen virksomhed (interne projekter)
          </label>
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
