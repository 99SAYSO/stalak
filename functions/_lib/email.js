// Code emails (sign up, new device, forgot password), sent with the Resend HTTP API
// (https://resend.com/docs/api-reference/emails/send-email).
import { HttpError, isDev, appOrigin } from './http.js';
import { mail } from './mail-layout.js';

const FROM = 'Stalak <login@stalak.app>';

const TEXTS = {
  fr: {
    subject: (c) => `${c} est ton code Stalak`,
    title: { signup: 'Bienvenue sur Stalak !', login: 'Nouvel appareil', reset: 'Nouveau mot de passe', code: 'Ton code Stalak' },
    pre: { signup: 'Ton code pour créer ton compte', login: 'Ton code pour te connecter sur ce nouvel appareil', reset: 'Ton code pour choisir un nouveau mot de passe', code: 'Ton code pour te connecter' },
    intro: {
      signup: 'Voici ton code pour confirmer ton adresse e-mail et créer ton compte :',
      login: 'Quelqu’un (sans doute toi) se connecte à Stalak depuis un nouvel appareil. Voici ton code :',
      reset: 'Voici ton code pour choisir un nouveau mot de passe Stalak :',
      code: 'Voici ton code pour te connecter à Stalak :',
    },
    expiry: 'Tape-le dans Stalak. Il est valable 10 minutes.',
    ignore: {
      signup: 'Si tu n’as pas demandé à créer un compte, ignore simplement ce message.',
      login: 'Si ce n’est pas toi, ne donne ce code à personne et change ton mot de passe.',
      reset: 'Si tu n’as rien demandé, ignore ce message : ton mot de passe ne change pas.',
      code: 'Si tu n’as pas demandé ce code, ignore simplement ce message.',
    },
    reason: {
      signup: 'Cette adresse a été utilisée pour créer un compte Stalak.',
      login: 'Quelqu’un se connecte à ton compte Stalak depuis un nouvel appareil.',
      reset: 'Un nouveau mot de passe a été demandé pour ton compte Stalak.',
      code: 'Un code de connexion a été demandé pour ton compte Stalak.',
    },
  },
  en: {
    subject: (c) => `${c} is your Stalak code`,
    title: { signup: 'Welcome to Stalak!', login: 'New device sign-in', reset: 'Reset your password', code: 'Your Stalak code' },
    pre: { signup: 'Your code to create your account', login: 'Your code to sign in on this new device', reset: 'Your code to pick a new password', code: 'Your code to sign in' },
    intro: {
      signup: 'Here is your code to confirm your email and create your account:',
      login: 'Someone (probably you) is signing in to Stalak from a new device. Here is your code:',
      reset: 'Here is your code to choose a new Stalak password:',
      code: 'Here is your code to sign in to Stalak:',
    },
    expiry: 'Type it in Stalak. It is valid for 10 minutes.',
    ignore: {
      signup: 'If you did not ask to create an account, just ignore this email.',
      login: 'If it was not you, do not share this code and change your password.',
      reset: 'If you did not ask for anything, ignore this email: your password stays the same.',
      code: 'If you did not ask for this code, just ignore this email.',
    },
    reason: {
      signup: 'This address was used to create a Stalak account.',
      login: 'Someone is signing in to your Stalak account from a new device.',
      reset: 'A new password was requested for your Stalak account.',
      code: 'A sign-in code was requested for your Stalak account.',
    },
  },
};

// site: where the logo and the pictures are (APP_ORIGIN: https://stalak.app)
export function codeEmail(code, lang, purpose = 'code', site) {
  const t = TEXTS[lang] || TEXTS.en;   // English unless the person uses Stalak in French
  const k = t.intro[purpose] ? purpose : 'code';
  return mail({
    lang: lang === 'fr' ? 'fr' : 'en', site, subject: t.subject(code), preheader: `${t.pre[k]} : ${code}`.replace(' : ', lang === 'fr' ? ' : ' : ': '),
    title: t.title[k], mascot: 'hello', reason: t.reason[k],
    blocks: [{ p: t.intro[k] }, { code }, { p: t.expiry }, { small: t.ignore[k] }],
  });
}
export const loginEmail = (code, lang, site) => codeEmail(code, lang, 'code', site);

// Returns { sent: true } or, in dev without a key, { sent: false, devCode }.
export async function sendCodeEmail(env, email, code, lang, purpose) {
  const msg = codeEmail(code, lang, purpose, appOrigin(env));
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
