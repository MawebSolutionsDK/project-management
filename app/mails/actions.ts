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
