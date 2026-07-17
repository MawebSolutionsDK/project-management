"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleRead(id: string, current: boolean, _formData: FormData) {
  const supabase = createClient();
  await supabase.from("emails").update({ is_read: !current }).eq("id", id);
  revalidatePath("/mails");
  revalidatePath("/dashboard");
}

export async function toggleActioned(id: string, current: boolean, _formData: FormData) {
  const supabase = createClient();
  await supabase.from("emails").update({ is_actioned: !current }).eq("id", id);
  revalidatePath("/mails");
  revalidatePath("/dashboard");
}

// Manuel kundetilknytning - overskriver evt. automatisk match. Tomt valg fjerner
// tilknytningen helt (både kunde og lead).
export async function setMatchedCustomer(id: string, formData: FormData) {
  const supabase = createClient();
  const customerId = (formData.get("customer_id") as string) || null;
  await supabase
    .from("emails")
    .update({ matched_customer_id: customerId, matched_lead_id: null })
    .eq("id", id);
  revalidatePath("/mails");
  revalidatePath("/dashboard");
}

export async function deleteEmailAction(id: string, _formData: FormData) {
  const supabase = createClient();
  await supabase.from("emails").delete().eq("id", id);
  revalidatePath("/mails");
  revalidatePath("/dashboard");
}
