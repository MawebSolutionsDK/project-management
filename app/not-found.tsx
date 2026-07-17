import Link from "next/link";
import { SearchX } from "lucide-react";

export default function RootNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
        <SearchX className="h-6 w-6" />
      </span>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
          Maweb Solutions
        </p>
        <h1 className="mt-1 text-lg font-semibold text-ink">
          Siden findes ikke
        </h1>
        <p className="mt-1 max-w-sm text-sm text-ink/55">
          Tjek at adressen er korrekt, eller gå til login.
        </p>
      </div>
      <Link href="/login" className="btn-primary">
        Til login
      </Link>
    </main>
  );
}
