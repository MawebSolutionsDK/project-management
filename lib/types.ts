export type CustomerStatus = "aktiv" | "tidligere";

export type LeadStatus =
  | "ny"
  | "kontaktet"
  | "vurdering_sendt"
  | "tilbud"
  | "vundet"
  | "tabt";

export type ProjectStatus =
  | "forespoergsel"
  | "tilbud_sendt"
  | "aftalt"
  | "i_gang"
  | "afsluttet"
  | "efter_service";

export type InvoiceStatus = "ikke_faktureret" | "faktureret" | "betalt";

export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger";

export interface Customer {
  id: string;
  name: string;
  cvr: string | null;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  industry: string | null;
  status: CustomerStatus;
  is_internal: boolean;
  notes: string | null;
  created_at: string;
}

export interface Lead {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
  status: LeadStatus;
  customer_id: string | null;
  next_action: string | null;
  next_action_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  customer_id: string;
  name: string;
  type: string | null;
  status: ProjectStatus;
  scope_description: string | null;
  deadline: string | null;
  price: number | null;
  invoice_status: InvoiceStatus;
  links: string | null;
  notes: string | null;
  created_at: string;
}

export const customerStatusLabels: Record<CustomerStatus, string> = {
  aktiv: "Aktiv",
  tidligere: "Tidligere",
};
export const customerStatusTones: Record<CustomerStatus, BadgeTone> = {
  aktiv: "success",
  tidligere: "neutral",
};

export const leadStatusLabels: Record<LeadStatus, string> = {
  ny: "Ny",
  kontaktet: "Kontaktet",
  vurdering_sendt: "Vurdering sendt",
  tilbud: "Tilbud",
  vundet: "Vundet",
  tabt: "Tabt",
};
export const leadStatusTones: Record<LeadStatus, BadgeTone> = {
  ny: "neutral",
  kontaktet: "info",
  vurdering_sendt: "info",
  tilbud: "warning",
  vundet: "success",
  tabt: "danger",
};

export const projectStatusLabels: Record<ProjectStatus, string> = {
  forespoergsel: "Forespørgsel",
  tilbud_sendt: "Tilbud sendt",
  aftalt: "Aftalt",
  i_gang: "I gang",
  afsluttet: "Afsluttet",
  efter_service: "Efter-service",
};
export const projectStatusTones: Record<ProjectStatus, BadgeTone> = {
  forespoergsel: "neutral",
  tilbud_sendt: "warning",
  aftalt: "info",
  i_gang: "info",
  afsluttet: "success",
  efter_service: "neutral",
};

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  ikke_faktureret: "Ikke faktureret",
  faktureret: "Faktureret",
  betalt: "Betalt",
};
export const invoiceStatusTones: Record<InvoiceStatus, BadgeTone> = {
  ikke_faktureret: "neutral",
  faktureret: "warning",
  betalt: "success",
};

export type AgreementStatus = "aktiv" | "opsagt" | "udloebet";
export type SupportStatus = "aaben" | "loest";

export interface MaintenanceAgreement {
  id: string;
  customer_id: string;
  plan_name: string;
  monthly_price: number;
  period_years: 1 | 2 | 3;
  start_date: string;
  renewal_date: string;
  status: AgreementStatus;
  notes: string | null;
  created_at: string;
}

export interface SupportCase {
  id: string;
  customer_id: string;
  title: string;
  description: string | null;
  hours_spent: number | null;
  invoice_status: InvoiceStatus;
  status: SupportStatus;
  opened_at: string;
  closed_at: string | null;
  notes: string | null;
  created_at: string;
}

export type BillingFrequency = "maanedlig" | "aarlig";

export interface BusinessExpense {
  id: string;
  name: string;
  category: string | null;
  cost: number;
  billing_frequency: BillingFrequency;
  renewal_date: string | null;
  notes: string | null;
  created_at: string;
}

export const billingFrequencyLabels: Record<BillingFrequency, string> = {
  maanedlig: "Månedligt",
  aarlig: "Årligt",
};

export function annualizedCost(expense: { cost: number; billing_frequency: BillingFrequency }): number {
  return expense.billing_frequency === "maanedlig" ? expense.cost * 12 : expense.cost;
}

export const agreementStatusLabels: Record<AgreementStatus, string> = {
  aktiv: "Aktiv",
  opsagt: "Opsagt",
  udloebet: "Udløbet",
};
export const agreementStatusTones: Record<AgreementStatus, BadgeTone> = {
  aktiv: "success",
  opsagt: "neutral",
  udloebet: "danger",
};

export const supportStatusLabels: Record<SupportStatus, string> = {
  aaben: "Åben",
  loest: "Løst",
};
export const supportStatusTones: Record<SupportStatus, BadgeTone> = {
  aaben: "warning",
  loest: "success",
};

export type PricingType = "engangsbeloeb" | "maanedlig";

export interface Product {
  id: string;
  name: string;
  category: string | null;
  pricing_type: PricingType;
  default_price: number;
  description: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
}

export const pricingTypeLabels: Record<PricingType, string> = {
  engangsbeloeb: "Engangsbeløb",
  maanedlig: "Månedligt",
};
