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
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <nav className="flex gap-4 text-sm font-medium">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={
                l.href === current
                  ? "text-gray-900 underline"
                  : "text-gray-500 hover:text-gray-900"
              }
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <SignOutButton />
      </div>
    </header>
  );
}
