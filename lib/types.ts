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
