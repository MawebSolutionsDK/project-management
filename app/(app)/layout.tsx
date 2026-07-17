import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { MobileTopbar } from "@/components/mobile-topbar";
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
      <MobileTopbar />
      <Sidebar notificationCount={notifications.length} />
      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 pb-8 pt-20 sm:px-6 md:pb-10 md:pt-10">
        {children}
      </main>
      <CommandPalette />
    </div>
  );
}
