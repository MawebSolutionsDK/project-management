import AppNav from "@/components/app-nav";
import { Field } from "@/components/form-field";
import { createClient } from "@/lib/supabase/server";
import { createAgreement } from "../actions";

export default async function NyAftalePage() {
  const supabase = createClient();
  const { data: customers } = await supabase.from("customers").select("id, name").order("name");

  return (
    <>
      <AppNav current="/vedligeholdelse" />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-6 text-2xl font-semibold text-ink">Ny vedligeholdelsesaftale</h1>
        <form action={createAgreement} className="card space-y-4 p-6">
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
          <Field label="Plan" name="plan_name" placeholder="fx Standard hosting + vedligeholdelse" required />
          <Field label="Pris pr. måned (DKK)" name="monthly_price" type="number" required />
          <div>
            <label className="label">Aftaleperiode</label>
            <select name="period_years" defaultValue="1" className="input">
              <option value="1">1 år</option>
              <option value="2">2 år</option>
              <option value="3">3 år</option>
            </select>
          </div>
          <Field label="Startdato" name="start_date" type="date" required />
          <div>
            <label className="label">Status</label>
            <select name="status" defaultValue="aktiv" className="input">
              <option value="aktiv">Aktiv</option>
              <option value="opsagt">Opsagt</option>
              <option value="udloebet">Udløbet</option>
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
