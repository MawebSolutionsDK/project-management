import { Save } from "lucide-react";
import AppNav from "@/components/app-nav";
import { BackLink } from "@/components/back-link";
import { Field } from "@/components/form-field";
import { createProduct } from "../actions";

export default function NytProduktPage() {
  return (
    <>
      <AppNav current="/produkter" />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mx-auto max-w-2xl">
          <BackLink href="/produkter" label="Tilbage til produkter" />
          <h1 className="mb-6 text-2xl font-semibold text-ink">Nyt produkt</h1>
          <form action={createProduct} className="card space-y-4 p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Navn" name="name" placeholder="fx Standard hosting + vedligeholdelse" required />
              <Field label="Kategori" name="category" placeholder="fx website, seo, hosting, support" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Standardpris (DKK)" name="default_price" type="number" required />
              <div>
                <label className="label">Pristype</label>
                <select name="pricing_type" defaultValue="engangsbeloeb" className="input">
                  <option value="engangsbeloeb">Engangsbeløb</option>
                  <option value="maanedlig">Månedligt</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Beskrivelse</label>
              <textarea name="description" rows={3} className="input" />
            </div>
            <label className="flex items-center gap-2 text-sm text-ink/75">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked
                className="h-4 w-4 rounded border-line text-accent focus:ring-accent"
              />
              Aktivt (vises som valgmulighed ved oprettelse af aftaler/projekter)
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
      </main>
    </>
  );
}
