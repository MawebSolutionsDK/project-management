import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { CommandPalette } from "@/components/command-palette";
import { createClient } from "@/lib/supabase/server";
import { buildActiveNotifications } from "@/lib/notifications";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const notifications = await buildActiveNotifications(supabase);

  return (
    <div className="flex min-h-screen">
      <Sidebar notificationCount={notifications.length} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        {children}
      </main>
      <CommandPalette />
    </div>
  );
}
