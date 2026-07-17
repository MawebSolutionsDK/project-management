"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function fields(formData: FormData) {
  const priceRaw = formData.get("price") as string;
  return {
    customer_id: formData.get("customer_id") as string,
    product_id: (formData.get("product_id") as string) || null,
    name: formData.get("name") as string,
    type: (formData.get("type") as string) || null,
    status: (formData.get("status") as string) || "forespoergsel",
    scope_description: (formData.get("scope_description") as string) || null,
    deadline: (formData.get("deadline") as string) || null,
    price: priceRaw ? Number(priceRaw) : null,
    invoice_status:
      (formData.get("invoice_status") as string) || "ikke_faktureret",
    links: (formData.get("links") as string) || null,
    notes: (formData.get("notes") as string) || null,
  };
}

export async function createProject(formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase.from("projects").insert(fields(formData));
  if (error) throw new Error(error.message);
  revalidatePath("/projekter");
  redirect("/projekter");
}

export async function updateProject(id: string, formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase
    .from("projects")
    .update(fields(formData))
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/projekter");
  revalidatePath(`/projekter/${id}`);
  redirect("/projekter");
}

export async function deleteProject(id: string, _formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/projekter");
  redirect("/projekter");
}
