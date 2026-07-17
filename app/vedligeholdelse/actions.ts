"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function fields(formData: FormData) {
  return {
    customer_id: formData.get("customer_id") as string,
    product_id: (formData.get("product_id") as string) || null,
    plan_name: formData.get("plan_name") as string,
    monthly_price: Number(formData.get("monthly_price") || 0),
    period_years: Number(formData.get("period_years") || 1),
    start_date: formData.get("start_date") as string,
    status: (formData.get("status") as string) || "aktiv",
    notes: (formData.get("notes") as string) || null,
  };
}

export async function createAgreement(formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase.from("maintenance_agreements").insert(fields(formData));
  if (error) throw new Error(error.message);
  revalidatePath("/vedligeholdelse");
  redirect("/vedligeholdelse");
}

export async function updateAgreement(id: string, formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase.from("maintenance_agreements").update(fields(formData)).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/vedligeholdelse");
  revalidatePath(`/vedligeholdelse/${id}`);
  redirect("/vedligeholdelse");
}

export async function deleteAgreement(id: string, _formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase.from("maintenance_agreements").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/vedligeholdelse");
  redirect("/vedligeholdelse");
}
