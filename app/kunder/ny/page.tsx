import AppNav from "@/components/app-nav";
import { Field } from "@/components/form-field";
import { createCustomer } from "../actions";

export default function NyKundePage() {
  return (
    <>
      <AppNav current="/kunder" />
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="mb-4 text-xl font-semibold">Ny kunde</h1>
        <form action={createCustomer} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
          <Field label="Navn" name="name" required />
          <Field label="CVR" name="cvr" />
          <Field label="Kontaktperson" name="contact_person" />
          <Field label="Email" name="email" type="email" />
          <Field label="Telefon" name="phone" />
          <Field label="Branche" name="industry" placeholder="fx rejsebureau, lokal service" />
          <div>
            <label className="mb-1 block text-sm font-medium">Status</label>
            <select name="status" defaultValue="aktiv" className="w-full rounded border border-gray-300 px-3 py-2 text-sm">
              <option value="aktiv">Aktiv</option>
              <option value="tidligere">Tidligere</option>
            </select>
          </div>
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
