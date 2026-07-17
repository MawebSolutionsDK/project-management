"use client";

interface CustomerOption {
  id: string;
  name: string;
}

// Lille auto-submitting select til manuel kunde-tilknytning på en mail-række.
// Gemmer med det samme ved valg - ingen separat "gem"-knap nødvendig i tabellen.
export function EmailMatchSelect({
  customers,
  defaultCustomerId,
  action,
}: {
  customers: CustomerOption[];
  defaultCustomerId: string | null;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action}>
      <select
        name="customer_id"
        defaultValue={defaultCustomerId ?? ""}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="w-full rounded-md border border-line bg-canvas px-2 py-1 text-xs text-ink/80"
      >
        <option value="">– Ingen match –</option>
        {customers.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </form>
  );
}
