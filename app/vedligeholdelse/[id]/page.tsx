import { notFound } from "next/navigation";
import AppNav from "@/components/app-nav";
import { Field } from "@/components/form-field";
import { createClient } from "@/lib/supabase/server";
import { updateAgreement, deleteAgreement } from "../actions";

export default async function AftaleDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: agreement } = await supabase
    .from("maintenance_agreements")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!agreement) notFound();

  const { data: customers } = await supabase.from("customers").select("id, name").order("name");

  const updateWithId = updateAgreement.bind(null, params.id);
  const deleteWithId = deleteAgreement.bind(null, params.id);

  return (
    <>
      <AppNav current="/vedligeholdelse" />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-1 text-2xl font-semibold text-ink">{agreement.plan_name}</h1>
        <p className="mb-6 text-sm text-ink/55">Fornyes: {agreement.renewal_date} (beregnes automatisk ud fra startdato + periode)</p>
        <form action={updateWithId} className="card space-y-4 p-6">
          <div>
            <label className="label">Kunde</label>
            <select name="customer_id" required defaultValue={agreement.customer_id} className="input">
              {(customers ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <Field label="Plan" name="plan_name" defaultValue={agreement.plan_name} required />
          <Field
            label="Pris pr. måned (DKK)"
            name="monthly_price"
            type="number"
            defaultValue={agreement.monthly_price?.toString() ?? ""}
            required
          />
          <div>
            <label className="label">Aftaleperiode</label>
            <select name="period_years" defaultValue={agreement.period_years?.toString()} className="input">
              <option value="1">1 år</option>
              <option value="2">2 år</option>
              <option value="3">3 år</option>
            </select>
          </div>
          <Field label="Startdato" name="start_date" type="date" defaultValue={agreement.start_date} required />
          <div>
            <label className="label">Status</label>
            <select name="status" defaultValue={agreement.status} className="input">
              <option value="aktiv">Aktiv</option>
              <option value="opsagt">Opsagt</option>
              <option value="udloebet">Udløbet</option>
            </select>
          </div>
          <div>
            <label className="label">Noter</label>
            <textarea name="notes" rows={3} defaultValue={agreement.notes ?? ""} className="input" />
          </div>
          <button type="submit" className="btn-primary">
            Gem ændringer
          </button>
        </form>

        <form action={deleteWithId} className="mt-3">
          <button type="submit" className="link-danger">
            Slet aftale
          </button>
        </form>
      </main>
    </>
  );
}
