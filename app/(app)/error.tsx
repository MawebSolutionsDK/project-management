"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[system.mawebsolutions.dk]", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rust-soft text-rust">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <div>
        <h1 className="text-lg font-semibold text-ink">Der opstod en fejl</h1>
        <p className="mt-1 max-w-sm text-sm text-ink/55">
          Noget gik galt under indlæsning af siden. Prøv igen, eller gå tilbage
          til oversigten hvis fejlen fortsætter.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => reset()} className="btn-primary">
          Prøv igen
        </button>
        <a href="/dashboard" className="link-muted text-sm">
          Til oversigten
        </a>
      </div>
    </div>
  );
}
