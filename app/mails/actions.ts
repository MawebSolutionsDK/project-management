"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { findMatch } from "@/lib/mail-matching";

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

// Kører nuværende matching-logik (præcis adresse + domæne) igen på alle mails,
// der endnu ikke har en kunde/lead-tilknytning. Bruges når matching-reglerne
// forbedres, så allerede-importerede mails ikke bliver hængende uden match for
// evigt - mail-sync selv rører kun nyt indkommet post, aldrig historik.
export async function rematchUnmatchedEmails(_formData: FormData) {
  const supabase = createClient();
  const { data: emails } = await supabase
    .from("emails")
    .select("id, from_address")
    .is("matched_customer_id", null)
    .is("matched_lead_id", null)
    .not("from_address", "is", null);

  for (const email of emails ?? []) {
    if (!email.from_address) continue;
    const { matchedCustomerId, matchedLeadId } = await findMatch(supabase, email.from_address);
    if (matchedCustomerId || matchedLeadId) {
      await supabase
        .from("emails")
        .update({ matched_customer_id: matchedCustomerId, matched_lead_id: matchedLeadId })
        .eq("id", email.id);
    }
  }

  revalidatePath("/mails");
  revalidatePath("/dashboard");
}
