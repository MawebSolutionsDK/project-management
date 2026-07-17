import AppNav from "@/components/app-nav";
import { Field } from "@/components/form-field";
import { createExpense } from "../actions";

export default function NyUdgiftPage() {
  return (
    <>
      <AppNav current="/udgifter" />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-6 text-2xl font-semibold text-ink">Ny udgift</h1>
        <form action={createExpense} className="card space-y-4 p-6">
          <Field label="Navn" name="name" placeholder="fx Elementor Pro, WP Rocket" required />
          <Field label="Kategori" name="category" placeholder="fx plugin, hosting, software" />
          <Field label="Årlig pris (DKK)" name="annual_cost" type="number" required />
          <div>
            <label className="label">Fornyelsesmåned</label>
            <select name="renewal_month" defaultValue="" className="input">
              <option value="">Ukendt</option>
              <option value="1">Januar</option>
              <option value="2">Februar</option>
              <option value="3">Marts</option>
              <option value="4">April</option>
              <option value="5">Maj</option>
              <option value="6">Juni</option>
              <option value="7">Juli</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>
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
