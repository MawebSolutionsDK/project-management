import { NextResponse } from "next/server";
import { ImapFlow, type FetchMessageObject } from "imapflow";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type ServiceClient = ReturnType<typeof createServiceClient>;

interface MailboxConfig {
  address: string;
  imapUser: string;
  imapPassword: string;
}

// Add sales@ / info@ here later, each backed by its own *_IMAP_PASSWORD env var.
function getConfiguredMailboxes(): MailboxConfig[] {
  const configs: (MailboxConfig | null)[] = [
    process.env.MA_IMAP_PASSWORD
      ? {
          address: "ma@mawebsolutions.dk",
          imapUser: process.env.MA_IMAP_USER || "ma@mawebsolutions.dk",
          imapPassword: process.env.MA_IMAP_PASSWORD,
        }
      : null,
  ];
  return configs.filter((c): c is MailboxConfig => c !== null);
}

async function findMatch(supabase: ServiceClient, table: "customers" | "leads", email: string) {
  const { data } = await supabase.from(table).select("id").ilike("email", email).limit(1);
  return data && data.length > 0 ? data[0].id : null;
}

async function importMessage(supabase: ServiceClient, config: MailboxConfig, message: FetchMessageObject) {
  const fromEntry = message.envelope?.from?.[0];
  const fromAddress = fromEntry?.address?.toLowerCase() ?? null;
  const fromName = fromEntry?.name ?? null;
  const subject = message.envelope?.subject ?? null;
  const receivedAt = message.envelope?.date ? new Date(message.envelope.date).toISOString() : null;
  const messageId = message.envelope?.messageId ?? `${config.address}-uid-${message.uid}`;

  let matchedCustomerId: string | null = null;
  let matchedLeadId: string | null = null;

  if (fromAddress) {
    matchedCustomerId = await findMatch(supabase, "customers", fromAddress);
    if (!matchedCustomerId) {
      matchedLeadId = await findMatch(supabase, "leads", fromAddress);
    }
  }

  const { error: insertError } = await supabase.from("emails").insert({
    mailbox: config.address,
    message_id: messageId,
    imap_uid: message.uid,
    from_address: fromAddress,
    from_name: fromName,
    subject,
    received_at: receivedAt,
    matched_customer_id: matchedCustomerId,
    matched_lead_id: matchedLeadId,
  });

  if (!insertError) return true;
  if (insertError.message?.includes("duplicate key")) return false;
  throw new Error(insertError.message);
}

async function syncMailbox(supabase: ServiceClient, config: MailboxConfig) {
  const result: { mailbox: string; imported: number; error: string | null } = {
    mailbox: config.address,
    imported: 0,
    error: null,
  };

  const client = new ImapFlow({
    host: "mail.simply.com",
    port: 143,
    secure: false,
    auth: { user: config.imapUser, pass: config.imapPassword },
    logger: false,
  });

  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");

    try {
      const currentUidNext = client.mailbox && "uidNext" in client.mailbox ? client.mailbox.uidNext : undefined;

      const { data: state } = await supabase
        .from("mail_sync_state")
        .select("*")
        .eq("mailbox", config.address)
        .maybeSingle();

      if (!state) {
        // First run for this mailbox: pick up the last 3 days (so mail sent around setup/testing
        // isn't silently missed) without backfilling the entire mailbox history.
        const since = new Date();
        since.setUTCDate(since.getUTCDate() - 3);

        const recentUids = await client.search({ since }, { uid: true });

        if (recentUids && recentUids.length > 0) {
          for await (const message of client.fetch(recentUids, { envelope: true, uid: true }, { uid: true })) {
            if (await importMessage(supabase, config, message)) {
              result.imported += 1;
            }
          }
        }

        await supabase.from("mail_sync_state").insert({
          mailbox: config.address,
          last_uid: (currentUidNext ?? 1) - 1,
          last_synced_at: new Date().toISOString(),
        });
        return result;
      }

      const fromUid = Number(state.last_uid) + 1;

      if (!currentUidNext || fromUid >= currentUidNext) {
        await supabase
          .from("mail_sync_state")
          .update({ last_synced_at: new Date().toISOString() })
          .eq("mailbox", config.address);
        return result;
      }

      let maxUidSeen = Number(state.last_uid);

      for await (const message of client.fetch(`${fromUid}:*`, { envelope: true, uid: true }, { uid: true })) {
        maxUidSeen = Math.max(maxUidSeen, message.uid);
        if (await importMessage(supabase, config, message)) {
          result.imported += 1;
        }
      }

      await supabase
        .from("mail_sync_state")
        .update({ last_uid: maxUidSeen, last_synced_at: new Date().toISOString() })
        .eq("mailbox", config.address);
    } finally {
      lock.release();
    }
  } catch (err) {
    console.error(`[mail-sync] ${config.address} failed:`, err);
    try {
      const plain: Record<string, unknown> = {};
      for (const key of Object.getOwnPropertyNames(err as object)) {
        const value = (err as Record<string, unknown>)[key];
        if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
          plain[key] = value;
        }
      }
      result.error = JSON.stringify(plain);
    } catch {
      result.error = err instanceof Error ? err.message : String(err);
    }
  } finally {
    try {
      await client.logout();
    } catch {
      // connection may already be closed - safe to ignore
    }
  }

  return result;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const providedSecret = request.headers.get("x-mail-sync-secret") ?? url.searchParams.get("secret");

  if (!process.env.MAIL_SYNC_SECRET || providedSecret !== process.env.MAIL_SYNC_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const mailboxes = getConfiguredMailboxes();
  if (mailboxes.length === 0) {
    return NextResponse.json({ error: "no mailboxes configured" }, { status: 500 });
  }

  const supabase = createServiceClient();
  const results = [];
  for (const mailbox of mailboxes) {
    results.push(await syncMailbox(supabase, mailbox));
  }

  return NextResponse.json({ results });
}
