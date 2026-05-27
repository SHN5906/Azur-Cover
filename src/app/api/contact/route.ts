import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { checkBotId } from "botid/server";
import { site } from "@/content/site";
import { checkRateLimit, getClientIp, resetRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Zod schema — aligné sur le reste de l'app (CMS, login). `website` est le
// honeypot : un humain le laisse vide, les bots le remplissent.
const ContactSchema = z.object({
  company: z.string().trim().min(1).max(5000),
  name: z.string().trim().min(1).max(5000),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().max(5000).optional(),
  city: z.string().trim().max(5000).optional(),
  project: z.string().trim().max(5000).optional(),
  message: z.string().trim().min(1).max(5000),
  website: z.string().max(5000).optional(),
});

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: Request) {
  // Vercel BotID — invisible bot detection. Returns isBot:false in dev,
  // calls the Kasada API in prod via Vercel OIDC.
  const verification = await checkBotId();
  if (verification.isBot) {
    return NextResponse.json({ error: "Requête refusée." }, { status: 403 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const parsed = ContactSchema.safeParse(raw);
  if (!parsed.success) {
    const fields = [...new Set(parsed.error.issues.map((i) => i.path[0]))].join(", ");
    return NextResponse.json(
      { error: `Champs invalides ou manquants : ${fields}.` },
      { status: 400 },
    );
  }
  const body = parsed.data;

  // Honeypot — pretend success so bots stop retrying.
  if (body.website && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  // Rate-limit per IP — 1 request / 60 s. Backup to BotID. Consumed here;
  // released below if the send fails so a transient error doesn't lock out.
  const ip = await getClientIp();
  const rlKey = `contact:${ip}`;
  const rl = await checkRateLimit(rlKey, 1, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Trop de demandes. Réessayez dans ${rl.retryAfterSec} s.` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY missing");
    await resetRateLimit(rlKey);
    return NextResponse.json(
      { error: "Service email indisponible. Écrivez-nous à " + site.email + "." },
      { status: 500 },
    );
  }

  const subject = `Demande d'audit — ${body.company || body.name}`;

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

  const html = `
<!doctype html>
<html><body style="font-family:system-ui,sans-serif;color:#0d2537;line-height:1.6;max-width:560px;margin:0 auto;padding:24px">
  <h2 style="margin:0 0 16px;font-size:20px;font-weight:600">Nouvelle demande d'audit</h2>
  <table style="width:100%;border-collapse:collapse">
    <tr><td style="padding:6px 0;color:#6e6e73;font-size:12px;text-transform:uppercase;letter-spacing:0.1em">Entreprise</td><td style="padding:6px 0">${escapeHtml(body.company)}</td></tr>
    <tr><td style="padding:6px 0;color:#6e6e73;font-size:12px;text-transform:uppercase;letter-spacing:0.1em">Nom</td><td style="padding:6px 0">${escapeHtml(body.name)}</td></tr>
    <tr><td style="padding:6px 0;color:#6e6e73;font-size:12px;text-transform:uppercase;letter-spacing:0.1em">Email</td><td style="padding:6px 0"><a href="mailto:${escapeHtml(body.email)}">${escapeHtml(body.email)}</a></td></tr>
    ${body.phone ? `<tr><td style="padding:6px 0;color:#6e6e73;font-size:12px;text-transform:uppercase;letter-spacing:0.1em">Téléphone</td><td style="padding:6px 0">${escapeHtml(body.phone)}</td></tr>` : ""}
    ${body.city ? `<tr><td style="padding:6px 0;color:#6e6e73;font-size:12px;text-transform:uppercase;letter-spacing:0.1em">Ville</td><td style="padding:6px 0">${escapeHtml(body.city)}</td></tr>` : ""}
    ${body.project ? `<tr><td style="padding:6px 0;color:#6e6e73;font-size:12px;text-transform:uppercase;letter-spacing:0.1em">Projet</td><td style="padding:6px 0">${escapeHtml(body.project)}</td></tr>` : ""}
  </table>
  <hr style="border:none;border-top:1px solid #d2d2d7;margin:20px 0" />
  <p style="white-space:pre-wrap;margin:0">${escapeHtml(body.message)}</p>
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
      replyTo: body.email,
      subject,
      text,
      html,
    });
    if (error) {
      console.error("Resend error:", error);
      await resetRateLimit(rlKey);
      return NextResponse.json(
        { error: "Échec de l'envoi. Réessayez ou écrivez à " + site.email + "." },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true, id: data?.id });
  } catch (err) {
    console.error("Resend threw:", err);
    await resetRateLimit(rlKey);
    return NextResponse.json(
      { error: "Échec de l'envoi. Réessayez ou écrivez à " + site.email + "." },
      { status: 500 },
    );
  }
}
