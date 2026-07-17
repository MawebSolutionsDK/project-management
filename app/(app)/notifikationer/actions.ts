"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function dismissNotification(key: string, _formData: FormData) {
  const supabase = createClient();
  await supabase.from("dismissed_notifications").upsert({ key });
  revalidatePath("/notifikationer");
  revalidatePath("/dashboard");
}
