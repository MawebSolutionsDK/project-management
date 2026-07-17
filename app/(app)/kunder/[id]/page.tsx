import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Save,
  Trash2,
  Briefcase,
  Target,
  RefreshCw,
  LifeBuoy,
  Plus,
  Mail,
  Circle,
  CheckCircle2,
} from "lucide-react";
import { BackLink } from "@/components/back-link";
import { Field } from "@/components/form-field";
import { StatusBadge } from "@/components/status-badge";
import { createClient } from "@/lib/supabase/server";
import { updateCustomer, deleteCustomer } from "../actions";
import {
  projectStatusLabels,
  projectStatusTones,
  leadStatusLabels,
  leadStatusTones,
  agreementStatusLabels,
  agreementStatusTones,
  supportStatusLabels,
  supportStatusTones,
} from "@/lib/types";

export default async function KundeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!customer) notFound();

  const [projectsRes, leadsRes, agreementsRes, supportRes, emailsRes] =
    await Promise.all([
      supabase
        .from("projects")
        .select("id, name, status")
        .eq("customer_id", params.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("leads")
        .select("id, name, status")
        .eq("customer_id", params.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("maintenance_agreements")
        .select("id, plan_name, status, renewal_date")
        .eq("customer_id", params.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("support_cases")
        .select("id, title, status")
        .eq("customer_id", params.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("emails")
        .select(
          "id, subject, from_name, from_address, received_at, is_read, is_actioned",
        )
        .eq("matched_customer_id", params.id)
        .order("received_at", { ascending: false })
        .limit(10),
    ]);

  const projects = projectsRes.data ?? [];
  const leads = leadsRes.data ?? [];
  const agreements = agreementsRes.data ?? [];
  const supportCases = supportRes.data ?? [];
  const emails = emailsRes.data ?? [];

  const updateWithId = updateCustomer.bind(null, params.id);
  const deleteWithId = deleteCustomer.bind(null, params.id);

  const sections = [
    {
      title: "Projekter",
      icon: Briefcase,
      items: projects.map((p) => ({
        id: p.id,
        label: p.name,
        status: p.status,
        tones: projectStatusTones,
        labels: projectStatusLabels,
      })),
      href: (id: string) => `/projekter/${id}`,
      newHref: `/projekter/ny?customer_id=${customer.id}`,
    },
    {
      title: "Leads",
      icon: Target,
      items: leads.map((l) => ({
        id: l.id,
        label: l.name,
        status: l.status,
        tones: leadStatusTones,
        labels: leadStatusLabels,
      })),
      href: (id: string) => `/leads/${id}`,
      newHref: `/leads/ny?customer_id=${customer.id}`,
    },
    {
      title: "Vedligeholdelsesaftaler",
      icon: RefreshCw,
      items: agreements.map((a) => ({
        id: a.id,
        label: `${a.plan_name} (fornyes ${a.renewal_date})`,
        status: a.status,
        tones: agreementStatusTones,
        labels: agreementStatusLabels,
      })),
      href: (id: string) => `/vedligeholdelse/${id}`,
      newHref: `/vedligeholdelse/ny?customer_id=${customer.id}`,
    },
    {
      title: "Support",
      icon: LifeBuoy,
      items: supportCases.map((s) => ({
        id: s.id,
        label: s.title,
        status: s.status,
        tones: supportStatusTones,
        labels: supportStatusLabels,
      })),
      href: (id: string) => `/support/${id}`,
      newHref: `/support/ny?customer_id=${customer.id}`,
    },
  ];

  return (
    <>
      <BackLink href="/kunder" label="Tilbage til kunder" />
      <h1 className="mb-6 text-2xl font-semibold text-ink">{customer.name}</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <form action={updateWithId} className="card space-y-4 p-6">
            <Field
              label="Navn"
              name="name"
              defaultValue={customer.name}
              required
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="CVR" name="cvr" defaultValue={customer.cvr ?? ""} />
              <Field
                label="Kontaktperson"
                name="contact_person"
                defaultValue={customer.contact_person ?? ""}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Email"
                name="email"
                type="email"
                defaultValue={customer.email ?? ""}
              />
              <Field
                label="Telefon"
                name="phone"
                defaultValue={customer.phone ?? ""}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Branche"
                name="industry"
                defaultValue={customer.industry ?? ""}
              />
              <div>
                <label className="label">Status</label>
                <select
                  name="status"
                  defaultValue={customer.status}
                  className="input"
                >
                  <option value="aktiv">Aktiv</option>
                  <option value="tidligere">Tidligere</option>
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-ink/75">
              <input
                type="checkbox"
                name="is_internal"
                defaultChecked={customer.is_internal}
                className="h-4 w-4 rounded border-line text-accent focus:ring-accent"
              />
              Dette er min egen virksomhed (interne projekter)
            </label>
            <div>
              <label className="label">Noter</label>
              <textarea
                name="notes"
                rows={3}
                defaultValue={customer.notes ?? ""}
                className="input"
              />
            </div>
            <div className="flex items-center gap-4">
              <button type="submit" className="btn-primary gap-1.5">
                <Save className="h-4 w-4" />
                Gem ændringer
              </button>
            </div>
          </form>

          <form action={deleteWithId} className="mt-3">
            <button
              type="submit"
              className="link-danger inline-flex items-center gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Slet kunde
            </button>
          </form>
        </div>

        <div className="space-y-4 lg:col-span-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="card p-5">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-ink/75">
                  <Icon className="h-4 w-4 text-accent" />
                  {section.title}
                </h2>
                {section.items.length === 0 ? (
                  <p className="mt-2 text-sm text-ink/55">Ingen endnu.</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {section.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <Link
                          href={section.href(item.id)}
                          className="truncate text-ink/80 hover:underline"
                        >
                          {item.label}
                        </Link>
                        <StatusBadge
                          tone={
                            item.tones[item.status as keyof typeof item.tones]
                          }
                        >
                          {item.labels[
                            item.status as keyof typeof item.labels
                          ] ?? item.status}
                        </StatusBadge>
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  href={section.newHref}
                  className="link-muted mt-3 inline-flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Opret {section.title.toLowerCase()}
                </Link>
              </div>
            );
          })}

          <div className="card p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink/75">
              <Mail className="h-4 w-4 text-accent" />
              E-mails
            </h2>
            {emails.length === 0 ? (
              <p className="mt-2 text-sm text-ink/55">
                Ingen mails knyttet til kunden endnu.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {emails.map((mail) => (
                  <li
                    key={mail.id}
                    className="flex items-start justify-between gap-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-ink/80">
                        {mail.subject || "(intet emne)"}
                      </p>
                      <p className="truncate text-xs text-ink/60">
                        {mail.from_name ||
                          mail.from_address ||
                          "Ukendt afsender"}
                        {mail.received_at
                          ? ` · ${new Date(mail.received_at).toLocaleDateString("da-DK")}`
                          : ""}
                      </p>
                    </div>
                    <span
                      title={
                        mail.is_actioned
                          ? "Handlet"
                          : mail.is_read
                            ? "Læst"
                            : "Ulæst"
                      }
                      className="mt-0.5 shrink-0"
                    >
                      {mail.is_actioned ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 text-ink/30" />
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/mails?filter=all"
              className="link-muted mt-3 inline-flex items-center gap-1"
            >
              <Mail className="h-3.5 w-3.5" />
              Se alle mails
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
