"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function fields(formData: FormData) {
  return {
    name: formData.get("name") as string,
    cvr: (formData.get("cvr") as string) || null,
    contact_person: (formData.get("contact_person") as string) || null,
    email: (formData.get("email") as string) || null,
    phone: (formData.get("phone") as string) || null,
    industry: (formData.get("industry") as string) || null,
    status: (formData.get("status") as string) || "aktiv",
    is_internal: formData.get("is_internal") === "on",
    notes: (formData.get("notes") as string) || null,
  };
}

export async function createCustomer(formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase.from("customers").insert(fields(formData));
  if (error) throw new Error(error.message);
  revalidatePath("/kunder");
  redirect("/kunder");
}

export async function updateCustomer(id: string, formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase
    .from("customers")
    .update(fields(formData))
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/kunder");
  revalidatePath(`/kunder/${id}`);
  redirect("/kunder");
}

export async function deleteCustomer(id: string, _formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/kunder");
  redirect("/kunder");
}
