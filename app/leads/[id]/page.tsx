import Link from "next/link";
import { notFound } from "next/navigation";
import AppNav from "@/components/app-nav";
import { Field } from "@/components/form-field";
import { createClient } from "@/lib/supabase/server";
import { updateLead, deleteLead } from "../actions";

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: lead } = await supabase.from("leads").select("*").eq("id", params.id).single();
  if (!lead) notFound();

  const { data: customers } = await supabase
    .from("customers")
    .select("id, name")
    .eq("is_internal", false)
    .order("name");

  const updateWithId = updateLead.bind(null, params.id);
  const deleteWithId = deleteLead.bind(null, params.id);

  return (
    <>
      <AppNav current="/leads" />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-6 text-2xl font-semibold text-ink">{lead.name}</h1>
        <form action={updateWithId} className="card space-y-4 p-6">
          <div>
            <label className="label">Eksisterende kunde (valgfrit)</label>
            <select name="customer_id" defaultValue={lead.customer_id ?? ""} className="input">
              <option value="">– Nyt/ukendt kontakt –</option>
              {(customers ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <Field label="Navn/firma" name="name" defaultValue={lead.name} required />
          <Field label="Kontaktperson" name="contact_person" defaultValue={lead.contact_person ?? ""} />
          <Field label="Email" name="email" type="email" defaultValue={lead.email ?? ""} />
          <Field label="Telefon" name="phone" defaultValue={lead.phone ?? ""} />
          <Field label="Kilde" name="source" defaultValue={lead.source ?? ""} />
          <div>
            <label className="label">Status</label>
            <select name="status" defaultValue={lead.status} className="input">
              <option value="ny">Ny</option>
              <option value="kontaktet">Kontaktet</option>
              <option value="vurdering_sendt">Vurdering sendt</option>
              <option value="tilbud">Tilbud</option>
              <option value="vundet">Vundet</option>
              <option value="tabt">Tabt</option>
            </select>
          </div>
          <Field label="Næste handling" name="next_action" defaultValue={lead.next_action ?? ""} />
          <Field label="Dato for næste handling" name="next_action_date" type="date" defaultValue={lead.next_action_date ?? ""} />
          <div>
            <label className="label">Noter</label>
            <textarea name="notes" rows={3} defaultValue={lead.notes ?? ""} className="input" />
          </div>
          <button type="submit" className="btn-primary">
            Gem ændringer
          </button>
        </form>

        <form action={deleteWithId} className="mt-3">
          <button type="submit" className="link-danger">
            Slet lead
          </button>
        </form>

        {lead.status === "vundet" && !lead.customer_id && (
          <p className="mt-6 text-sm text-ink/55">
            Lead er markeret som vundet.{" "}
            <Link href="/kunder/ny" className="underline">
              Opret kunden her
            </Link>
            , hvis det ikke allerede er gjort.
          </p>
        )}
      </main>
    </>
  );
}
