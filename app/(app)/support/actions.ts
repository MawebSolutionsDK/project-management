"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function fields(formData: FormData) {
  const hoursRaw = formData.get("hours_spent") as string;
  return {
    customer_id: formData.get("customer_id") as string,
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    hours_spent: hoursRaw ? Number(hoursRaw) : null,
    invoice_status:
      (formData.get("invoice_status") as string) || "ikke_faktureret",
    status: (formData.get("status") as string) || "aaben",
    opened_at: (formData.get("opened_at") as string) || null,
    closed_at: (formData.get("closed_at") as string) || null,
    notes: (formData.get("notes") as string) || null,
  };
}

export async function createSupportCase(formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase
    .from("support_cases")
    .insert(fields(formData));
  if (error) throw new Error(error.message);

  // Hvis sagen er oprettet ud fra en mail (se app/mails/page.tsx "Supportsag"-linket),
  // markér kilde-mailen som læst og handlet, så den forsvinder fra "Ubehandlet mail".
  const emailId = formData.get("email_id") as string | null;
  if (emailId) {
    await supabase
      .from("emails")
      .update({ is_read: true, is_actioned: true })
      .eq("id", emailId);
    revalidatePath("/mails");
    revalidatePath("/dashboard");
  }

  revalidatePath("/support");
  redirect("/support");
}

export async function updateSupportCase(id: string, formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase
    .from("support_cases")
    .update(fields(formData))
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/support");
  revalidatePath(`/support/${id}`);
  redirect("/support");
}

export async function deleteSupportCase(id: string, _formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase.from("support_cases").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/support");
  redirect("/support");
}

export async function updateSupportStatus(id: string, status: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("support_cases")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/support");
  revalidatePath(`/support/${id}`);
}
