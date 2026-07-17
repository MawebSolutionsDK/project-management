import { Save } from "lucide-react";
import AppNav from "@/components/app-nav";
import { BackLink } from "@/components/back-link";
import { Field } from "@/components/form-field";
import { createExpense } from "../actions";

export default function NyUdgiftPage() {
  return (
    <>
      <AppNav current="/udgifter" />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mx-auto max-w-2xl">
        <BackLink href="/udgifter" label="Tilbage til udgifter" />
        <h1 className="mb-6 text-2xl font-semibold text-ink">Ny udgift</h1>
        <form action={createExpense} className="card space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Navn" name="name" placeholder="fx Elementor Pro, WP Rocket" required />
            <Field label="Kategori" name="category" placeholder="fx plugin, hosting, software" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Pris (DKK)" name="cost" type="number" required />
            <div>
              <label className="label">Betalingshyppighed</label>
              <select name="billing_frequency" defaultValue="aarlig" className="input">
                <option value="maanedlig">Månedligt</option>
                <option value="aarlig">Årligt</option>
              </select>
            </div>
          </div>
          <Field label="Næste fornyelsesdato" name="renewal_date" type="date" required />
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
      </main>
    </>
  );
}