import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "./sign-out-button";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Velkommen, {user?.email}</h1>
        <SignOutButton />
      </div>
      <p className="mt-4 text-sm text-gray-600">
        Dette er fundamentet for Maweb Solutions&apos; interne system. Kunder-, projekt- og
        leads-modulerne kommer i næste fase.
      </p>
    </main>
  );
}
