import Link from "next/link";
import SignOutButton from "./sign-out-button";

const links = [
  { href: "/dashboard", label: "Oversigt" },
  { href: "/kunder", label: "Kunder" },
  { href: "/leads", label: "Leads" },
  { href: "/projekter", label: "Projekter" },
];

export default function AppNav({ current }: { current: string }) {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <span className="text-sm font-semibold tracking-tight text-ink">
            Maweb Solutions
            <span className="ml-1.5 font-normal text-ink/40">· system</span>
          </span>
          <nav className="flex gap-1">
            {links.map((l) => {
              const active = l.href === current;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={
                    active
                      ? "rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-canvas"
                      : "rounded-full px-3 py-1.5 text-sm font-medium text-ink/55 transition hover:bg-ink/[0.06] hover:text-ink"
                  }
                >
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
