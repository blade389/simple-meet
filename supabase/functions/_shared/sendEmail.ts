// Shared helper to send a pre-rendered HTML email through Lovable Emails.
//
// Drop-in replacement for direct Resend calls. Preserves all existing
// custom HTML and 8-language templates: callers keep building their own
// HTML and just pass it here. The helper handles:
//  - suppression list check (skip blocked recipients)
//  - unsubscribe token (one per email address)
//  - logging to email_send_log
//  - enqueueing into the `transactional_emails` pgmq queue
// The shared `process-email-queue` worker then sends via Lovable Emails,
// with retries, rate-limit backoff, and DLQ behavior.

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

// Configuration — must match the verified Lovable Emails domain for this project.
const SITE_NAME = "FlashMatch";
const SENDER_DOMAIN = "notify.flashmatch.org"; // verified subdomain (NS-delegated)
const FROM_DOMAIN = "flashmatch.org"; // visible From: domain

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export interface SendAppEmailOptions {
  to: string;
  subject: string;
  html: string;
  /** Short tag for logs (e.g. "welcome-email", "match-request"). */
  label: string;
  /** Optional idempotency key — defaults to a fresh UUID. */
  idempotencyKey?: string;
  /** Optional display name override (defaults to "FlashMatch"). */
  fromName?: string;
}

export interface SendAppEmailResult {
  success: boolean;
  reason?: "suppressed" | "enqueue_failed" | "token_failed";
  messageId?: string;
}

export async function sendAppEmail(
  supabase: SupabaseClient,
  opts: SendAppEmailOptions,
): Promise<SendAppEmailResult> {
  const messageId = crypto.randomUUID();
  const idempotencyKey = opts.idempotencyKey ?? messageId;
  const normalizedEmail = opts.to.toLowerCase().trim();
  const fromName = opts.fromName ?? SITE_NAME;

  // 1) Suppression check
  const { data: suppressed, error: suppressionError } = await supabase
    .from("suppressed_emails")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (suppressionError) {
    console.error("sendAppEmail: suppression check failed", suppressionError);
    return { success: false, reason: "enqueue_failed" };
  }
  if (suppressed) {
    await supabase.from("email_send_log").insert({
      message_id: messageId,
      template_name: opts.label,
      recipient_email: normalizedEmail,
      status: "suppressed",
    });
    return { success: false, reason: "suppressed", messageId };
  }

  // 2) Get or create unsubscribe token
  let unsubscribeToken: string | null = null;
  const { data: existingToken } = await supabase
    .from("email_unsubscribe_tokens")
    .select("token, used_at")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (existingToken?.token && !existingToken.used_at) {
    unsubscribeToken = existingToken.token;
  } else if (!existingToken) {
    const candidate = generateToken();
    await supabase
      .from("email_unsubscribe_tokens")
      .upsert(
        { token: candidate, email: normalizedEmail },
        { onConflict: "email", ignoreDuplicates: true },
      );
    const { data: stored } = await supabase
      .from("email_unsubscribe_tokens")
      .select("token")
      .eq("email", normalizedEmail)
      .maybeSingle();
    unsubscribeToken = stored?.token ?? candidate;
  } else {
    // Token used but not suppressed — treat as suppressed (safety).
    await supabase.from("email_send_log").insert({
      message_id: messageId,
      template_name: opts.label,
      recipient_email: normalizedEmail,
      status: "suppressed",
      error_message: "Unsubscribe token already used",
    });
    return { success: false, reason: "suppressed", messageId };
  }

  // 3) Log pending and enqueue
  await supabase.from("email_send_log").insert({
    message_id: messageId,
    template_name: opts.label,
    recipient_email: normalizedEmail,
    status: "pending",
  });

  const { error: enqueueError } = await supabase.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload: {
      message_id: messageId,
      to: normalizedEmail,
      from: `${fromName} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject: opts.subject,
      html: opts.html,
      text: htmlToText(opts.html),
      purpose: "transactional",
      label: opts.label,
      idempotency_key: idempotencyKey,
      unsubscribe_token: unsubscribeToken,
      queued_at: new Date().toISOString(),
    },
  });

  if (enqueueError) {
    console.error("sendAppEmail: enqueue failed", enqueueError);
    await supabase.from("email_send_log").insert({
      message_id: messageId,
      template_name: opts.label,
      recipient_email: normalizedEmail,
      status: "failed",
      error_message: "Failed to enqueue email",
    });
    return { success: false, reason: "enqueue_failed", messageId };
  }

  return { success: true, messageId };
}

/** Convenience: send the same HTML to multiple recipients (one queue entry each). */
export async function sendAppEmailBulk(
  supabase: SupabaseClient,
  recipients: string[],
  base: Omit<SendAppEmailOptions, "to" | "idempotencyKey"> & { idempotencyKeyPrefix?: string },
): Promise<SendAppEmailResult[]> {
  const results: SendAppEmailResult[] = [];
  for (const to of recipients) {
    const idempotencyKey = base.idempotencyKeyPrefix
      ? `${base.idempotencyKeyPrefix}-${to}`
      : undefined;
    results.push(
      await sendAppEmail(supabase, {
        to,
        subject: base.subject,
        html: base.html,
        label: base.label,
        fromName: base.fromName,
        idempotencyKey,
      }),
    );
  }
  return results;
}