import { notFound } from "next/navigation";
import { Save, Trash2 } from "lucide-react";
import { BackLink } from "@/components/back-link";
import { Field } from "@/components/form-field";
import { createClient } from "@/lib/supabase/server";
import { updateExpense, deleteExpense } from "../actions";
import { annualizedCost } from "@/lib/types";

export default async function UdgiftDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: expense } = await supabase
    .from("business_expenses")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!expense) notFound();

  const updateWithId = updateExpense.bind(null, params.id);
  const deleteWithId = deleteExpense.bind(null, params.id);

  return (
    <>
      <div className="mx-auto max-w-2xl">
        <BackLink href="/udgifter" label="Tilbage til udgifter" />
        <h1 className="mb-1 text-2xl font-semibold text-ink">{expense.name}</h1>
        <p className="mb-6 text-sm text-ink/55">
          Omregnet: {annualizedCost(expense).toLocaleString("da-DK")} kr./år
        </p>
        <form action={updateWithId} className="card space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Navn"
              name="name"
              defaultValue={expense.name}
              required
            />
            <Field
              label="Kategori"
              name="category"
              defaultValue={expense.category ?? ""}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Pris (DKK)"
              name="cost"
              type="number"
              defaultValue={expense.cost?.toString() ?? ""}
              required
            />
            <div>
              <label className="label">Betalingshyppighed</label>
              <select
                name="billing_frequency"
                defaultValue={expense.billing_frequency}
                className="input"
              >
                <option value="maanedlig">Månedligt</option>
                <option value="aarlig">Årligt</option>
              </select>
            </div>
          </div>
          <Field
            label="Næste fornyelsesdato"
            name="renewal_date"
            type="date"
            defaultValue={expense.renewal_date ?? ""}
            required
          />
          <div>
            <label className="label">Noter</label>
            <textarea
              name="notes"
              rows={3}
              defaultValue={expense.notes ?? ""}
              className="input"
            />
          </div>
          <button type="submit" className="btn-primary gap-1.5">
            <Save className="h-4 w-4" />
            Gem ændringer
          </button>
        </form>

        <form action={deleteWithId} className="mt-3">
          <button
            type="submit"
            className="link-danger inline-flex items-center gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Slet udgift
          </button>
        </form>
      </div>
    </>
  );
}
