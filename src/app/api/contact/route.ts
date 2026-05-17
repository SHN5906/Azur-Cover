import { NextResponse } from "next/server";
import { Resend } from "resend";
import { checkBotId } from "botid/server";
import { site } from "@/content/site";

export const runtime = "nodejs";

type ContactPayload = {
  company?: string;
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  project?: string;
  message?: string;
  // Honeypot — should remain empty. Bots fill all fields.
  website?: string;
};

function isString(v: unknown): v is string {
  return typeof v === "string";
}

// In-memory rate limit. Map<ip, lastRequestTimestamp>.
// On Vercel Fluid Compute, a function instance handles many concurrent
// requests in the same process, so this Map is shared across requests
// hitting the same instance. It's a best-effort defense against
// casual abuse, NOT a hard cryptographic limit (a determined attacker
// rotating IPs / hitting cold instances would bypass it).
// 1 request per IP per 60 seconds.
const RATE_WINDOW_MS = 60_000;
const lastSeen = new Map<string, number>();

function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: Request) {
  // Vercel BotID — invisible bot detection. Returns isHuman:true in dev,
  // calls the Kasada API in prod via Vercel OIDC. Same-origin proxy is set
  // up by withBotId() in next.config.ts.
  const verification = await checkBotId();
  if (verification.isBot) {
    return NextResponse.json({ error: "Requête refusée." }, { status: 403 });
  }

  // Resend API key. Set in .env.local for dev, in Vercel env vars for prod.
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY missing");
    return NextResponse.json(
      { error: "Service email indisponible. Écrivez-nous à " + site.email + "." },
      { status: 500 }
    );
  }

  // Rate-limit per IP. Cheap protection against form spam.
  const ip = getClientIp(req);
  const now = Date.now();
  const last = lastSeen.get(ip);
  if (last && now - last < RATE_WINDOW_MS) {
    const retryAfter = Math.ceil((RATE_WINDOW_MS - (now - last)) / 1000);
    return NextResponse.json(
      { error: `Trop de demandes. Réessayez dans ${retryAfter} s.` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  let body: ContactPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  // Honeypot
  if (body.website && body.website.trim() !== "") {
    // Pretend success so bots stop retrying
    return NextResponse.json({ ok: true });
  }

  const required = (["company", "name", "email", "message"] as const).filter(
    (k) => !isString(body[k]) || (body[k] as string).trim() === ""
  );
  if (required.length) {
    return NextResponse.json(
      { error: `Champs requis manquants : ${required.join(", ")}.` },
      { status: 400 }
    );
  }

  // Basic email shape validation
  const email = (body.email ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email invalide." }, { status: 400 });
  }

  // Length safety (prevent giant payloads)
  for (const k of ["company", "name", "phone", "city", "project", "message"] as const) {
    if (isString(body[k]) && (body[k] as string).length > 5000) {
      return NextResponse.json({ error: `Champ ${k} trop long.` }, { status: 400 });
    }
  }

  const subject = `Demande d'audit — ${body.company || body.name || "site web"}`;

  // Plain-text body (used for the email body)
  const textLines = [
    `Entreprise : ${body.company}`,
    `Nom : ${body.name}`,
    `Email : ${body.email}`,
    body.phone && `Téléphone : ${body.phone}`,
    body.city && `Ville du bâtiment : ${body.city}`,
    body.project && `Type de projet : ${body.project}`,
    "",
    "Message :",
    body.message,
    "",
    "—",
    "Envoyé depuis le formulaire de contact azurcover.com",
  ].filter(Boolean) as string[];
  const text = textLines.join("\n");

  // HTML version
  const html = `
<!doctype html>
<html><body style="font-family:system-ui,sans-serif;color:#0a0a0b;line-height:1.6;max-width:560px;margin:0 auto;padding:24px">
  <h2 style="margin:0 0 16px;font-size:20px;font-weight:600">Nouvelle demande d'audit</h2>
  <table style="width:100%;border-collapse:collapse">
    <tr><td style="padding:6px 0;color:#6e6e73;font-size:12px;text-transform:uppercase;letter-spacing:0.1em">Entreprise</td><td style="padding:6px 0">${escapeHtml(body.company ?? "")}</td></tr>
    <tr><td style="padding:6px 0;color:#6e6e73;font-size:12px;text-transform:uppercase;letter-spacing:0.1em">Nom</td><td style="padding:6px 0">${escapeHtml(body.name ?? "")}</td></tr>
    <tr><td style="padding:6px 0;color:#6e6e73;font-size:12px;text-transform:uppercase;letter-spacing:0.1em">Email</td><td style="padding:6px 0"><a href="mailto:${escapeHtml(body.email ?? "")}">${escapeHtml(body.email ?? "")}</a></td></tr>
    ${body.phone ? `<tr><td style="padding:6px 0;color:#6e6e73;font-size:12px;text-transform:uppercase;letter-spacing:0.1em">Téléphone</td><td style="padding:6px 0">${escapeHtml(body.phone)}</td></tr>` : ""}
    ${body.city ? `<tr><td style="padding:6px 0;color:#6e6e73;font-size:12px;text-transform:uppercase;letter-spacing:0.1em">Ville</td><td style="padding:6px 0">${escapeHtml(body.city)}</td></tr>` : ""}
    ${body.project ? `<tr><td style="padding:6px 0;color:#6e6e73;font-size:12px;text-transform:uppercase;letter-spacing:0.1em">Projet</td><td style="padding:6px 0">${escapeHtml(body.project)}</td></tr>` : ""}
  </table>
  <hr style="border:none;border-top:1px solid #d2d2d7;margin:20px 0" />
  <p style="white-space:pre-wrap;margin:0">${escapeHtml(body.message ?? "")}</p>
</body></html>`.trim();

  const resend = new Resend(apiKey);
  // FROM must be a verified domain in Resend. Default to onboarding@resend.dev
  // for dev/testing — replace with your own domain for prod.
  const from = process.env.RESEND_FROM ?? "Azur Cover <onboarding@resend.dev>";
  const to = process.env.RESEND_TO ?? site.email;

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject,
      text,
      html,
    });
    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Échec de l'envoi. Réessayez ou écrivez à " + site.email + "." },
        { status: 502 }
      );
    }
    // Mark this IP as just used. Only on success — failed attempts don't lock out.
    lastSeen.set(ip, now);
    return NextResponse.json({ ok: true, id: data?.id });
  } catch (err) {
    console.error("Resend threw:", err);
    return NextResponse.json(
      { error: "Échec de l'envoi. Réessayez ou écrivez à " + site.email + "." },
      { status: 500 }
    );
  }
}
