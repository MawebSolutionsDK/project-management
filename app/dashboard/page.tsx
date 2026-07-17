import Link from "next/link";
import { redirect } from "next/navigation";
import AppNav from "@/components/app-nav";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [customersRes, leadsRes, projectsRes] = await Promise.all([
    supabase.from("customers").select("*", { count: "exact", head: true }),
    supabase.from("leads").select("*", { count: "exact", head: true }).not("status", "in", "(vundet,tabt)"),
    supabase.from("projects").select("*", { count: "exact", head: true }).not("status", "in", "(afsluttet,efter_service)"),
  ]);

  return (
    <>
      <AppNav current="/dashboard" />
      <main className="mx-auto max-w-3xl p-8">
        <h1 className="text-xl font-semibold">Velkommen, {user?.email}</h1>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link href="/kunder" className="rounded-lg border border-gray-200 bg-white p-5 transition hover:border-gray-400">
            <p className="text-sm text-gray-500">Kunder</p>
            <p className="text-2xl font-semibold">{customersRes.count ?? 0}</p>
          </Link>
          <Link href="/leads" className="rounded-lg border border-gray-200 bg-white p-5 transition hover:border-gray-400">
            <p className="text-sm text-gray-500">Åbne leads</p>
            <p className="text-2xl font-semibold">{leadsRes.count ?? 0}</p>
          </Link>
          <Link href="/projekter" className="rounded-lg border border-gray-200 bg-white p-5 transition hover:border-gray-400">
            <p className="text-sm text-gray-500">Aktive projekter</p>
            <p className="text-2xl font-semibold">{projectsRes.count ?? 0}</p>
          </Link>
        </div>
      </main>
    </>
  );
}
