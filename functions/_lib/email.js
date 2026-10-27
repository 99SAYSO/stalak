// Code emails (sign up, new device, forgot password), sent with the Resend HTTP API
// (https://resend.com/docs/api-reference/emails/send-email).
import { HttpError, isDev } from './http.js';

const FROM = 'Stalak <login@stalak.app>';

const TEXTS = {
  fr: {
    subject: (c) => `${c} est ton code Stalak`,
    intro: {
      signup: 'Bienvenue sur Stalak ! Voici ton code pour confirmer ton adresse e-mail et créer ton compte :',
      login: 'Quelqu’un (sans doute toi) se connecte à Stalak depuis un nouvel appareil. Voici ton code :',
      reset: 'Voici ton code pour choisir un nouveau mot de passe Stalak :',
      code: 'Voici ton code pour te connecter à Stalak :',
    },
    expiry: 'Il est valable 10 minutes.',
    ignore: {
      signup: 'Si tu n’as pas demandé à créer un compte, ignore simplement ce message.',
      login: 'Si ce n’est pas toi, ne donne ce code à personne et change ton mot de passe.',
      reset: 'Si tu n’as rien demandé, ignore ce message : ton mot de passe ne change pas.',
      code: 'Si tu n’as pas demandé ce code, ignore simplement ce message.',
    },
  },
  en: {
    subject: (c) => `${c} is your Stalak code`,
    intro: {
      signup: 'Welcome to Stalak! Here is your code to confirm your email and create your account:',
      login: 'Someone (probably you) is signing in to Stalak from a new device. Here is your code:',
      reset: 'Here is your code to choose a new Stalak password:',
      code: 'Here is your code to sign in to Stalak:',
    },
    expiry: 'It is valid for 10 minutes.',
    ignore: {
      signup: 'If you did not ask to create an account, just ignore this email.',
      login: 'If it was not you, do not share this code and change your password.',
      reset: 'If you did not ask for anything, ignore this email: your password stays the same.',
      code: 'If you did not ask for this code, just ignore this email.',
    },
  },
};

export function codeEmail(code, lang, purpose = 'code') {
  const t = TEXTS[lang] || TEXTS.fr;
  const intro = t.intro[purpose] || t.intro.code, ignore = t.ignore[purpose] || t.ignore.code;
  const text = `${intro}\n\n${code}\n\n${t.expiry}\n${ignore}\n\nStalak — stalak.app`;
  const html = `<!doctype html><html lang="${lang === 'en' ? 'en' : 'fr'}"><body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#111;padding:24px">
<p>${intro}</p>
<p style="font-size:32px;font-weight:700;letter-spacing:6px;margin:16px 0">${code}</p>
<p>${t.expiry}<br>${ignore}</p>
<p style="color:#888;font-size:12px">Stalak — <a href="https://stalak.app" style="color:#888">stalak.app</a></p>
</body></html>`;
  return { subject: t.subject(code), text, html };
}
export const loginEmail = (code, lang) => codeEmail(code, lang, 'code');

// Returns { sent: true } or, in dev without a key, { sent: false, devCode }.
export async function sendCodeEmail(env, email, code, lang, purpose) {
  const msg = codeEmail(code, lang, purpose);
  if (!env.RESEND_API_KEY) {
    if (isDev(env)) {
      console.log(`[stalak dev] ${purpose || 'login'} code for ${email}: ${code}`);
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
export const sendLoginCode = (env, email, code, lang) => sendCodeEmail(env, email, code, lang, 'code');
