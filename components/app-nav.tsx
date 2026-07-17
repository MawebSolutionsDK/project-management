import Link from "next/link";
import { LayoutDashboard, Users, Target, Briefcase, RefreshCw, LifeBuoy, Receipt } from "lucide-react";
import SignOutButton from "./sign-out-button";

const links = [
  { href: "/dashboard", label: "Oversigt", icon: LayoutDashboard },
  { href: "/kunder", label: "Kunder", icon: Users },
  { href: "/leads", label: "Leads", icon: Target },
  { href: "/projekter", label: "Projekter", icon: Briefcase },
  { href: "/vedligeholdelse", label: "Aftaler", icon: RefreshCw },
  { href: "/support", label: "Support", icon: LifeBuoy },
  { href: "/udgifter", label: "Udgifter", icon: Receipt },
];

export default function AppNav({ current }: { current: string }) {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="text-sm font-semibold tracking-tight text-ink">
            Maweb Solutions
            <span className="ml-1.5 font-normal text-ink/40">· system</span>
          </span>
          <nav className="flex flex-wrap gap-1">
            {links.map((l) => {
              const active = l.href === current;
              const Icon = l.icon;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={
                    active
                      ? "inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-canvas"
                      : "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-ink/55 transition hover:bg-ink/[0.06] hover:text-ink"
                  }
                >
                  <Icon className="h-3.5 w-3.5" />
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <SignOutButton />
      </div>
    </header>
  );
}
