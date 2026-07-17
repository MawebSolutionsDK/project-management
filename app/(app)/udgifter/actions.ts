"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function fields(formData: FormData) {
  return {
    name: formData.get("name") as string,
    category: (formData.get("category") as string) || null,
    cost: Number(formData.get("cost") || 0),
    billing_frequency:
      (formData.get("billing_frequency") as string) || "aarlig",
    renewal_date: (formData.get("renewal_date") as string) || null,
    notes: (formData.get("notes") as string) || null,
  };
}

export async function createExpense(formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase
    .from("business_expenses")
    .insert(fields(formData));
  if (error) throw new Error(error.message);
  revalidatePath("/udgifter");
  redirect("/udgifter");
}

export async function updateExpense(id: string, formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase
    .from("business_expenses")
    .update(fields(formData))
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/udgifter");
  revalidatePath(`/udgifter/${id}`);
  redirect("/udgifter");
}

export async function deleteExpense(id: string, _formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase
    .from("business_expenses")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/udgifter");
  redirect("/udgifter");
}
