"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function fields(formData: FormData) {
  const customerId = (formData.get("customer_id") as string) || "";
  return {
    name: formData.get("name") as string,
    contact_person: (formData.get("contact_person") as string) || null,
    email: (formData.get("email") as string) || null,
    phone: (formData.get("phone") as string) || null,
    source: (formData.get("source") as string) || null,
    status: (formData.get("status") as string) || "ny",
    customer_id: customerId || null,
    next_action: (formData.get("next_action") as string) || null,
    next_action_date: (formData.get("next_action_date") as string) || null,
    notes: (formData.get("notes") as string) || null,
  };
}

export async function createLead(formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase.from("leads").insert(fields(formData));
  if (error) throw new Error(error.message);
  revalidatePath("/leads");
  redirect("/leads");
}

export async function updateLead(id: string, formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase
    .from("leads")
    .update(fields(formData))
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  redirect("/leads");
}

export async function deleteLead(id: string, _formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/leads");
  redirect("/leads");
}

export async function updateLeadStatus(id: string, status: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("leads")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
}
