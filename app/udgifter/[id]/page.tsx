import { notFound } from "next/navigation";
import AppNav from "@/components/app-nav";
import { Field } from "@/components/form-field";
import { createClient } from "@/lib/supabase/server";
import { updateExpense, deleteExpense } from "../actions";

export default async function UdgiftDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: expense } = await supabase.from("business_expenses").select("*").eq("id", params.id).single();
  if (!expense) notFound();

  const updateWithId = updateExpense.bind(null, params.id);
  const deleteWithId = deleteExpense.bind(null, params.id);

  return (
    <>
      <AppNav current="/udgifter" />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-6 text-2xl font-semibold text-ink">{expense.name}</h1>
        <form action={updateWithId} className="card space-y-4 p-6">
          <Field label="Navn" name="name" defaultValue={expense.name} required />
          <Field label="Kategori" name="category" defaultValue={expense.category ?? ""} />
          <Field label="Årlig pris (DKK)" name="annual_cost" type="number" defaultValue={expense.annual_cost?.toString() ?? ""} required />
          <div>
            <label className="label">Fornyelsesmåned</label>
            <select name="renewal_month" defaultValue={expense.renewal_month?.toString() ?? ""} className="input">
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
            <textarea name="notes" rows={3} defaultValue={expense.notes ?? ""} className="input" />
          </div>
          <button type="submit" className="btn-primary">
            Gem ændringer
          </button>
        </form>

        <form action={deleteWithId} className="mt-3">
          <button type="submit" className="link-danger">
            Slet udgift
          </button>
        </form>
      </main>
    </>
  );
}
