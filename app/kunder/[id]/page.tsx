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
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="mb-4 text-xl font-semibold">{customer.name}</h1>
        <form action={updateWithId} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
          <Field label="Navn" name="name" defaultValue={customer.name} required />
          <Field label="CVR" name="cvr" defaultValue={customer.cvr ?? ""} />
          <Field label="Kontaktperson" name="contact_person" defaultValue={customer.contact_person ?? ""} />
          <Field label="Email" name="email" type="email" defaultValue={customer.email ?? ""} />
          <Field label="Telefon" name="phone" defaultValue={customer.phone ?? ""} />
          <Field label="Branche" name="industry" defaultValue={customer.industry ?? ""} />
          <div>
            <label className="mb-1 block text-sm font-medium">Status</label>
            <select name="status" defaultValue={customer.status} className="w-full rounded border border-gray-300 px-3 py-2 text-sm">
              <option value="aktiv">Aktiv</option>
              <option value="tidligere">Tidligere</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Noter</label>
            <textarea name="notes" rows={3} defaultValue={customer.notes ?? ""} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white">
            Gem ændringer
          </button>
        </form>

        <form action={deleteWithId} className="mt-3">
          <button type="submit" className="text-sm text-red-600 underline hover:text-red-800">
            Slet kunde
          </button>
        </form>

        <div className="mt-8">
          <h2 className="mb-2 text-sm font-semibold text-gray-700">Projekter for denne kunde</h2>
          <ul className="space-y-1">
            {(projects ?? []).map((p) => (
              <li key={p.id}>
                <Link href={`/projekter/${p.id}`} className="text-sm text-gray-700 hover:underline">
                  {p.name}
                </Link>
              </li>
            ))}
            {(projects ?? []).length === 0 && <li className="text-sm text-gray-400">Ingen projekter endnu.</li>}
          </ul>
          <Link href={`/projekter/ny?customer_id=${customer.id}`} className="mt-2 inline-block text-sm text-gray-500 underline">
            + Opret projekt til denne kunde
          </Link>
        </div>
      </main>
    </>
  );
}
