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

  const updateWithId = updateLead.bind(null, params.id);
  const deleteWithId = deleteLead.bind(null, params.id);

  return (
    <>
      <AppNav current="/leads" />
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="mb-4 text-xl font-semibold">{lead.name}</h1>
        <form action={updateWithId} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
          <Field label="Navn/firma" name="name" defaultValue={lead.name} required />
          <Field label="Kontaktperson" name="contact_person" defaultValue={lead.contact_person ?? ""} />
          <Field label="Email" name="email" type="email" defaultValue={lead.email ?? ""} />
          <Field label="Telefon" name="phone" defaultValue={lead.phone ?? ""} />
          <Field label="Kilde" name="source" defaultValue={lead.source ?? ""} />
          <div>
            <label className="mb-1 block text-sm font-medium">Status</label>
            <select name="status" defaultValue={lead.status} className="w-full rounded border border-gray-300 px-3 py-2 text-sm">
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
            <label className="mb-1 block text-sm font-medium">Noter</label>
            <textarea name="notes" rows={3} defaultValue={lead.notes ?? ""} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white">
            Gem ændringer
          </button>
        </form>

        <form action={deleteWithId} className="mt-3">
          <button type="submit" className="text-sm text-red-600 underline hover:text-red-800">
            Slet lead
          </button>
        </form>

        {lead.status === "vundet" && (
          <p className="mt-6 text-sm text-gray-500">
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
