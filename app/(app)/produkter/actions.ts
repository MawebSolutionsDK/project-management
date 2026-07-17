"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function fields(formData: FormData) {
  return {
    name: formData.get("name") as string,
    category: (formData.get("category") as string) || null,
    pricing_type: (formData.get("pricing_type") as string) || "engangsbeloeb",
    default_price: Number(formData.get("default_price") || 0),
    description: (formData.get("description") as string) || null,
    is_active: formData.get("is_active") === "on",
    notes: (formData.get("notes") as string) || null,
  };
}

export async function createProduct(formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase.from("products").insert(fields(formData));
  if (error) throw new Error(error.message);
  revalidatePath("/produkter");
  redirect("/produkter");
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase
    .from("products")
    .update(fields(formData))
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/produkter");
  revalidatePath(`/produkter/${id}`);
  redirect("/produkter");
}

export async function deleteProduct(id: string, _formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/produkter");
  redirect("/produkter");
}
