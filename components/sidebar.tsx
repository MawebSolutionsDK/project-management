"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Target,
  Briefcase,
  RefreshCw,
  LifeBuoy,
  Receipt,
  Mail,
  Package,
  ChevronsLeft,
  ChevronsRight,
  Bell,
  Search,
  Clock,
  X,
} from "lucide-react";
import SignOutButton from "./sign-out-button";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard };
type NavGroup = { title: string | null; items: NavItem[] };

const groups: NavGroup[] = [
  {
    title: null,
    items: [
      { href: "/dashboard", label: "Oversigt", icon: LayoutDashboard },
      { href: "/notifikationer", label: "Notifikationer", icon: Bell },
      { href: "/aktivitet", label: "Aktivitet", icon: Clock },
    ],
  },
  {
    title: "Salg",
    items: [
      { href: "/kunder", label: "Kunder", icon: Users },
      { href: "/leads", label: "Leads", icon: Target },
      { href: "/produkter", label: "Produkter", icon: Package },
    ],
  },
  {
    title: "Drift",
    items: [
      { href: "/projekter", label: "Projekter", icon: Briefcase },
      { href: "/vedligeholdelse", label: "Aftaler", icon: RefreshCw },
      { href: "/support", label: "Support", icon: LifeBuoy },
      { href: "/udgifter", label: "Udgifter", icon: Receipt },
    ],
  },
  {
    title: "Kommunikation",
    items: [{ href: "/mails", label: "Mails", icon: Mail }],
  },
];

export function Sidebar({
  notificationCount = 0,
}: {
  notificationCount?: number;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Mobil-hamburgerknappen (components/mobile-topbar.tsx) og Sidebar monteres uafhængigt
  // af hinanden i layoutet - samme event-mønster som CommandPalette bruger.
  useEffect(() => {
    function onToggle() {
      setMobileOpen((o) => !o);
    }
    window.addEventListener("toggle-mobile-sidebar", onToggle);
    return () => window.removeEventListener("toggle-mobile-sidebar", onToggle);
  }, []);

  // Luk drawer'en automatisk når man navigerer til en ny side på mobil.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-60 shrink-0 flex-col border-r border-line bg-surface transition-transform duration-200 md:sticky md:top-0 md:translate-x-0 md:transition-[width] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "md:w-[68px]" : "md:w-60"}`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-4">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-teal text-sm font-bold text-canvas">
              M
            </span>
            {!collapsed && (
              <span className="truncate text-sm font-semibold tracking-tight text-ink">
                Maweb Solutions
                <span className="ml-1.5 font-normal text-ink/40">· system</span>
              </span>
            )}
          </div>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="hidden shrink-0 rounded-md p-1 text-ink/45 transition hover:bg-ink/[0.06] hover:text-ink md:block"
            title={collapsed ? "Fold sidebar ud" : "Fold sidebar sammen"}
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4" />
            ) : (
              <ChevronsLeft className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="shrink-0 rounded-md p-1 text-ink/45 transition hover:bg-ink/[0.06] hover:text-ink md:hidden"
            title="Luk menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-line px-3 py-3">
          <button
            onClick={() =>
              window.dispatchEvent(new CustomEvent("open-command-palette"))
            }
            className={
              collapsed
                ? "flex w-full items-center justify-center rounded-lg p-2 text-ink/45 transition hover:bg-ink/[0.06] hover:text-ink"
                : "flex w-full items-center gap-2 rounded-lg border border-line bg-canvas px-2.5 py-1.5 text-sm text-ink/45 transition hover:border-ink/25 hover:text-ink"
            }
            title="Søg (Ctrl/Cmd+K)"
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">Søg...</span>
                <kbd className="rounded border border-line px-1 text-[10px] text-ink/35">
                  ⌘K
                </kbd>
              </>
            )}
          </button>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {groups.map((group, i) => (
            <div key={group.title ?? `group-${i}`}>
              {group.title && !collapsed && (
                <p className="mb-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-wide text-ink/35">
                  {group.title}
                </p>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        className={
                          active
                            ? "flex items-center gap-2.5 rounded-lg border-l-2 border-accent bg-accent-soft px-2.5 py-2 text-sm font-medium text-accent"
                            : "flex items-center gap-2.5 rounded-lg border-l-2 border-transparent px-2.5 py-2 text-sm font-medium text-ink/60 transition hover:bg-ink/[0.05] hover:text-ink"
                        }
                      >
                        <span
                          className={
                            active
                              ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent text-canvas"
                              : "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-ink/60"
                          }
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        {!collapsed && (
                          <span className="flex-1 truncate">{item.label}</span>
                        )}
                        {item.href === "/notifikationer" &&
                          notificationCount > 0 && (
                            <span
                              className={
                                collapsed
                                  ? "absolute left-8 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rust px-1 text-[10px] font-semibold text-canvas"
                                  : "flex h-4 min-w-4 items-center justify-center rounded-full bg-rust px-1 text-[10px] font-semibold text-canvas"
                              }
                            >
                              {notificationCount}
                            </span>
                          )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-line px-3 py-4">
          {!collapsed && (
            <p className="mb-2 px-2.5 text-xs text-ink/40">Konto</p>
          )}
          <div className={collapsed ? "flex justify-center" : "px-2.5"}>
            <SignOutButton />
          </div>
        </div>
      </aside>
    </>
  );
}
