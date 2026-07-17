import Link from "next/link";
import { notFound } from "next/navigation";
import AppNav from "@/components/app-nav";
import { Field } from "@/components/form-field";
import { createClient } from "@/lib/supabase/server";
import { updateCustomer, deleteCustomer } from "../actions";

export default async function KundeDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: customer } = await supabase.from("customers").select("*").eq("id", params.id).single();
  if (!customer) notFound();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, status")
    .eq("customer_id", params.id)
    .order("created_at", { ascending: false });

  const updateWithId = updateCustomer.bind(null, params.id);
  const deleteWithId = deleteCustomer.bind(null, params.id);

  return (
    <>
      <AppNav current="/kunder" />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-6 text-2xl font-semibold text-ink">{customer.name}</h1>
        <form action={updateWithId} className="card space-y-4 p-6">
          <Field label="Navn" name="name" defaultValue={customer.name} required />
          <Field label="CVR" name="cvr" defaultValue={customer.cvr ?? ""} />
          <Field label="Kontaktperson" name="contact_person" defaultValue={customer.contact_person ?? ""} />
          <Field label="Email" name="email" type="email" defaultValue={customer.email ?? ""} />
          <Field label="Telefon" name="phone" defaultValue={customer.phone ?? ""} />
          <Field label="Branche" name="industry" defaultValue={customer.industry ?? ""} />
          <div>
            <label className="label">Status</label>
            <select name="status" defaultValue={customer.status} className="input">
              <option value="aktiv">Aktiv</option>
              <option value="tidligere">Tidligere</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink/75">
            <input
              type="checkbox"
              name="is_internal"
              defaultChecked={customer.is_internal}
              className="h-4 w-4 rounded border-line text-accent focus:ring-accent"
            />
            Dette er min egen virksomhed (interne projekter)
          </label>
          <div>
            <label className="label">Noter</label>
            <textarea name="notes" rows={3} defaultValue={customer.notes ?? ""} className="input" />
          </div>
          <button type="submit" className="btn-primary">
            Gem ændringer
          </button>
        </form>

        <form action={deleteWithId} className="mt-3">
          <button type="submit" className="link-danger">
            Slet kunde
          </button>
        </form>

        <div className="mt-8">
          <h2 className="mb-2 text-sm font-semibold text-ink/70">Projekter for denne kunde</h2>
          <ul className="space-y-1">
            {(projects ?? []).map((p) => (
              <li key={p.id}>
                <Link href={`/projekter/${p.id}`} className="text-sm text-ink/75 hover:underline">
                  {p.name}
                </Link>
              </li>
            ))}
            {(projects ?? []).length === 0 && <li className="text-sm text-ink/40">Ingen projekter endnu.</li>}
          </ul>
          <Link href={`/projekter/ny?customer_id=${customer.id}`} className="link-muted mt-2 inline-block">
            + Opret projekt til denne kunde
          </Link>
        </div>
      </main>
    </>
  );
}
