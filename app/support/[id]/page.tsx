import { notFound } from "next/navigation";
import AppNav from "@/components/app-nav";
import { Field } from "@/components/form-field";
import { createClient } from "@/lib/supabase/server";
import { updateSupportCase, deleteSupportCase } from "../actions";

export default async function SupportsagDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: supportCase } = await supabase.from("support_cases").select("*").eq("id", params.id).single();
  if (!supportCase) notFound();

  const { data: customers } = await supabase.from("customers").select("id, name").order("name");

  const updateWithId = updateSupportCase.bind(null, params.id);
  const deleteWithId = deleteSupportCase.bind(null, params.id);

  return (
    <>
      <AppNav current="/support" />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-6 text-2xl font-semibold text-ink">{supportCase.title}</h1>
        <form action={updateWithId} className="card space-y-4 p-6">
          <div>
            <label className="label">Kunde</label>
            <select name="customer_id" required defaultValue={supportCase.customer_id} className="input">
              {(customers ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <Field label="Titel" name="title" defaultValue={supportCase.title} required />
          <div>
            <label className="label">Beskrivelse</label>
            <textarea name="description" rows={3} defaultValue={supportCase.description ?? ""} className="input" />
          </div>
          <Field
            label="Timeforbrug"
            name="hours_spent"
            type="number"
            defaultValue={supportCase.hours_spent?.toString() ?? ""}
          />
          <div>
            <label className="label">Fakturastatus</label>
            <select name="invoice_status" defaultValue={supportCase.invoice_status} className="input">
              <option value="ikke_faktureret">Ikke faktureret</option>
              <option value="faktureret">Faktureret</option>
              <option value="betalt">Betalt</option>
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select name="status" defaultValue={supportCase.status} className="input">
              <option value="aaben">Åben</option>
              <option value="loest">Løst</option>
            </select>
          </div>
          <Field label="Åbnet dato" name="opened_at" type="date" defaultValue={supportCase.opened_at ?? ""} />
          <Field label="Lukket dato" name="closed_at" type="date" defaultValue={supportCase.closed_at ?? ""} />
          <div>
            <label className="label">Noter</label>
            <textarea name="notes" rows={3} defaultValue={supportCase.notes ?? ""} className="input" />
          </div>
          <button type="submit" className="btn-primary">
            Gem ændringer
          </button>
        </form>

        <form action={deleteWithId} className="mt-3">
          <button type="submit" className="link-danger">
            Slet sag
          </button>
        </form>
      </main>
    </>
  );
}
