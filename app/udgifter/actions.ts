"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function fields(formData: FormData) {
  const monthRaw = formData.get("renewal_month") as string;
  return {
    name: formData.get("name") as string,
    category: (formData.get("category") as string) || null,
    annual_cost: Number(formData.get("annual_cost") || 0),
    renewal_month: monthRaw ? Number(monthRaw) : null,
    notes: (formData.get("notes") as string) || null,
  };
}

export async function createExpense(formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase.from("business_expenses").insert(fields(formData));
  if (error) throw new Error(error.message);
  revalidatePath("/udgifter");
  redirect("/udgifter");
}

export async function updateExpense(id: string, formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase.from("business_expenses").update(fields(formData)).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/udgifter");
  revalidatePath(`/udgifter/${id}`);
  redirect("/udgifter");
}

export async function deleteExpense(id: string, _formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase.from("business_expenses").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/udgifter");
  redirect("/udgifter");
}
