// src/lib/notifications.ts
// Shared helpers for Discord webhook + Resend email notifications.
// Both functions are fire-and-forget — they log errors but never throw,
// so a failing notification never breaks the submission response.

export type NotificationPayload =
  | { type: "comment"; slug: string; author: string; content: string }
  | { type: "review"; author: string; rating: number; content: string };

// ---------------------------------------------------------------------------
// Discord
// ---------------------------------------------------------------------------

export async function notifyDiscord(
  webhookUrl: string,
  payload: NotificationPayload,
): Promise<void> {
  const embed =
    payload.type === "comment"
      ? {
          title: "💬 New comment pending review",
          color: 0x7f77dd, // purple
          fields: [
            { name: "Post", value: `\`${payload.slug}\``, inline: true },
            { name: "Author", value: payload.author, inline: true },
            { name: "Content", value: payload.content.slice(0, 300) },
          ],
        }
      : {
          title: "⭐ New review pending review",
          color: 0x1d9e75, // teal
          fields: [
            { name: "Author", value: payload.author, inline: true },
            {
              name: "Rating",
              value: `${"★".repeat(payload.rating)}${"☆".repeat(5 - payload.rating)}`,
              inline: true,
            },
            { name: "Content", value: payload.content.slice(0, 300) },
          ],
        };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });
    if (!res.ok) {
      console.error("[Discord] Webhook failed:", res.status, await res.text());
    }
  } catch (err) {
    console.error("[Discord] Webhook error:", err);
  }
}

// ---------------------------------------------------------------------------
// Resend
// ---------------------------------------------------------------------------

export async function notifyResend(
  apiKey: string,
  to: string,
  payload: NotificationPayload,
): Promise<void> {
  const subject =
    payload.type === "comment"
      ? `New comment on "${payload.slug}" — pending review`
      : `New ${payload.rating}★ review — pending review`;

  const html =
    payload.type === "comment"
      ? /* html */ `
        <p><strong>Post:</strong> ${payload.slug}</p>
        <p><strong>Author:</strong> ${payload.author}</p>
        <blockquote style="border-left:3px solid #ccc;padding-left:12px;color:#555">
          ${payload.content}
        </blockquote>
        <p>Log into <a href="/admin">/admin</a> to approve or reject.</p>
      `
      : /* html */ `
        <p><strong>Author:</strong> ${payload.author}</p>
        <p><strong>Rating:</strong> ${"★".repeat(payload.rating)}${"☆".repeat(5 - payload.rating)}</p>
        <blockquote style="border-left:3px solid #ccc;padding-left:12px;color:#555">
          ${payload.content}
        </blockquote>
        <p>Log into <a href="/admin">/admin</a> to approve or reject.</p>
      `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "info.kiseki-miracle.dev",
        to,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      console.error("[Resend] Email failed:", res.status, await res.text());
    }
  } catch (err) {
    console.error("[Resend] Email error:", err);
  }
}
