// Login code email, sent with the Resend HTTP API (https://resend.com/docs/api-reference/emails/send-email).
import { HttpError, isDev } from './http.js';

const FROM = 'Stalak <login@stalak.app>';

const TEXTS = {
  fr: {
    subject: (c) => `${c} est ton code Stalak`,
    intro: 'Voici ton code pour te connecter à Stalak :',
    expiry: 'Il est valable 10 minutes.',
    ignore: 'Si tu n’as pas demandé ce code, ignore simplement ce message.',
  },
  en: {
    subject: (c) => `${c} is your Stalak code`,
    intro: 'Here is your code to sign in to Stalak:',
    expiry: 'It is valid for 10 minutes.',
    ignore: 'If you did not ask for this code, just ignore this email.',
  },
};

export function loginEmail(code, lang) {
  const t = TEXTS[lang] || TEXTS.fr;
  const text = `${t.intro}\n\n${code}\n\n${t.expiry}\n${t.ignore}\n\nStalak — stalak.app`;
  const html = `<!doctype html><html lang="${lang === 'en' ? 'en' : 'fr'}"><body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#111;padding:24px">
<p>${t.intro}</p>
<p style="font-size:32px;font-weight:700;letter-spacing:6px;margin:16px 0">${code}</p>
<p>${t.expiry}<br>${t.ignore}</p>
<p style="color:#888;font-size:12px">Stalak — <a href="https://stalak.app" style="color:#888">stalak.app</a></p>
</body></html>`;
  return { subject: t.subject(code), text, html };
}

// Returns { sent: true } or, in dev without a key, { sent: false, devCode }.
export async function sendLoginCode(env, email, code, lang) {
  const msg = loginEmail(code, lang);
  if (!env.RESEND_API_KEY) {
    if (isDev(env)) {
      console.log(`[stalak dev] login code for ${email}: ${code}`);
      return { sent: false, devCode: code };
    }
    throw new HttpError(500, 'email_not_configured', 'Email sending is not configured (RESEND_API_KEY).');
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.EMAIL_FROM || FROM, to: [email], subject: msg.subject, text: msg.text, html: msg.html }),
  });
  if (!res.ok) {
    console.error('[stalak] Resend error', res.status, await res.text().catch(() => ''));
    throw new HttpError(502, 'email_failed', 'Could not send the email, try again in a moment.');
  }
  return { sent: true };
}
