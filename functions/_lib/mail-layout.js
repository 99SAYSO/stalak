// The one look of every e-mail Stalak sends to a person (owner's request of 1/11): the codes, the reply of « Parler à un
// humain », the warning before online projects are deleted, the yearly reminder. (The alerts to the owner stay plain.)
// Stalak's style (STALAK_CONTEXTE.md, section 1): blue sky #1f6fd6, a white card with an ink #0a0d14 outline, icicles
// under its top edge and a hard shadow (a thicker bottom border: box-shadow is dropped by Gmail), the logo and the mascot, Lilita One for titles (a heavy fallback where e-mail
// clients do not load fonts), Rubik-like text.
// E-mail rules followed: tables for the layout, every style written on its tag (Gmail drops most of <style>), 600 px wide
// and fluid on a phone, PNG images only (Gmail shows no SVG), all small (logo 12 KB, mascot ≈ 7 KB, icicles 2 KB) and hosted on
// stalak.app, dark mode handled where the client lets us (Apple Mail, iOS, Outlook) and readable when Gmail inverts it,
// a hidden preview line, and a plain-text version next to the HTML.
//
// mail({ lang, site, subject, preheader, title, mascot, blocks, reason }) -> { subject, html, text }
//   blocks: [{ p }, { code }, { button: { href, label } }, { box: { label?, text } }, { quote: { label, text } },
//            { list: [..] }, { small }]; text is plain (escaped here), links in p/small are made clickable.

export const MAIL_INK = '#0a0d14';
export const MAIL_SKY = '#1f6fd6';
const SKY_DEEP = '#1a64c8';
const ICE = '#eef7ff';
const MUTED = '#3f5170';
const SOCIAL = { instagram: 'https://www.instagram.com/stalak_app/', tiktok: 'https://www.tiktok.com/@stalak_app' };
const MASCOTS = ['hello', 'cool', 'shock', 'coffee'];   // site_src/icons/mail/<name>.png (176 px, shown at 88 px)
// French pages: at the root today; '/fr/' after the move of English to the main address (docs/marketing/US_FIRST.md)
export const FR_HOME = '/fr/';
export const EN_HOME = '/';

const TITLE_FONT = "'Lilita One','Arial Rounded MT Bold','Arial Black','Helvetica Neue',Helvetica,Arial,sans-serif";
const BODY_FONT = "Rubik,'Helvetica Neue',Helvetica,Arial,sans-serif";
const CODE_FONT = "'SF Mono',Menlo,Consolas,'Roboto Mono','Courier New',monospace";

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// escaped text with its https:// links and e-mail addresses made clickable
function linkify(s) {
  return esc(s).replace(/(https:\/\/[^\s<>"']+[^\s<>"'.,;:!?)])|([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g, (m, url, mail) =>
    `<a href="${url ? url : 'mailto:' + mail}" style="color:${SKY_DEEP};text-decoration:underline;font-weight:700" class="st-link">${m}</a>`);
}
export const siteOf = (site) => String(site || 'https://stalak.app').replace(/\/+$/, '');
export const homeOf = (site, lang) => siteOf(site) + (lang === 'fr' ? FR_HOME : EN_HOME);

const T = {
  fr: { home: 'Ouvrir Stalak', follow: 'Suis-nous', why: 'Pourquoi cet e-mail ?', tag: 'Monte tes playbacks sur le rythme.' },
  en: { home: 'Open Stalak', follow: 'Follow us', why: 'Why this email?', tag: 'Edit your lip-sync videos on the beat.' },
};

function blockHtml(b) {
  if (b.p != null) return `<p class="st-text" style="margin:0 0 16px;font:400 17px/1.55 ${BODY_FONT};color:${MAIL_INK}">${linkify(b.p)}</p>`;
  if (b.small != null) return `<p class="st-muted" style="margin:0 0 12px;font:400 14px/1.5 ${BODY_FONT};color:${MUTED}">${linkify(b.small)}</p>`;
  if (b.code != null) {
    // the code: very big, digits spaced, easy to read and to copy (one tap selects it all where supported)
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 20px">
<tr><td align="center" class="st-codebox" style="background:${ICE};border:3px dashed ${MAIL_SKY};border-radius:18px;padding:18px 8px">
<div class="st-code" style="font:800 46px/1.1 ${CODE_FONT};letter-spacing:10px;color:${MAIL_INK};-webkit-user-select:all;user-select:all;white-space:nowrap">${esc(b.code)}</div>
</td></tr></table>`;
  }
  if (b.button) {
    // a « bulletproof » button: a table cell with the colour, so it shows even without images
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:6px auto 22px">
<tr><td align="center" bgcolor="${MAIL_SKY}" class="st-btn" style="background:${MAIL_SKY};border:3px solid ${MAIL_INK};border-bottom-width:7px;border-radius:16px">
<a href="${esc(b.button.href)}" target="_blank" style="display:inline-block;padding:14px 28px;font:400 20px/1.2 ${TITLE_FONT};font-weight:900;color:#ffffff;text-decoration:none;letter-spacing:.3px">${esc(b.button.label)}</a>
</td></tr></table>`;
  }
  if (b.box) {
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px">
<tr><td class="st-box" style="background:${ICE};border:3px solid ${MAIL_INK};border-radius:18px;padding:16px 18px">
${b.box.label ? `<p class="st-muted" style="margin:0 0 6px;font:700 13px/1.3 ${BODY_FONT};color:${MUTED};text-transform:uppercase;letter-spacing:.6px">${esc(b.box.label)}</p>` : ''}
<div class="st-text" style="font:400 17px/1.55 ${BODY_FONT};color:${MAIL_INK};white-space:pre-wrap;word-break:break-word">${linkify(b.box.text)}</div>
</td></tr></table>`;
  }
  if (b.quote) {
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px">
<tr><td class="st-quote" style="border-left:4px solid #a9d3ff;padding:4px 0 4px 14px">
<p class="st-muted" style="margin:0 0 4px;font:700 13px/1.3 ${BODY_FONT};color:${MUTED};text-transform:uppercase;letter-spacing:.6px">${esc(b.quote.label)}</p>
<div class="st-muted" style="font:400 15px/1.5 ${BODY_FONT};color:${MUTED};white-space:pre-wrap;word-break:break-word">${esc(b.quote.text)}</div>
</td></tr></table>`;
  }
  if (b.list) {
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px">` +
      b.list.map((it) => `<tr><td width="26" valign="top" style="font:900 18px/1.5 ${TITLE_FONT};color:${MAIL_SKY}">❄</td>` +
        `<td class="st-text" style="padding:0 0 6px;font:700 17px/1.5 ${BODY_FONT};color:${MAIL_INK};word-break:break-word">${esc(it)}</td></tr>`).join('') +
      `</table>`;
  }
  return '';
}

function blockText(b, fr) {
  if (b.p != null) return b.p;
  if (b.small != null) return b.small;
  if (b.code != null) return '    ' + b.code;
  if (b.button) return `${b.button.label}${fr ? ' : ' : ': '}${b.button.href}`;
  if (b.box) return (b.box.label ? b.box.label + '\n' : '') + b.box.text;
  if (b.quote) return `${b.quote.label}\n> ${String(b.quote.text).replace(/\n/g, '\n> ')}`;
  if (b.list) return b.list.map((x) => '• ' + x).join('\n');
  return '';
}

export function mail({ lang, site, subject, preheader, title, mascot, blocks, reason }) {
  const fr = lang === 'fr', t = fr ? T.fr : T.en, base = siteOf(site), home = homeOf(site, lang);
  const img = (p) => base + p;
  const m = MASCOTS.includes(mascot) ? mascot : 'hello';
  const body = blocks.map(blockHtml).join('\n');
  const html = `<!doctype html>
<html lang="${fr ? 'fr' : 'en'}" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${esc(subject)}</title>
<style>
@font-face{font-family:'Lilita One';src:url('${img('/fonts/lilitaone.ttf')}') format('truetype');font-weight:400;font-style:normal}
body{margin:0;padding:0;width:100%!important;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
a{text-decoration:underline}
@media (max-width:620px){
  .st-pad{padding:30px 20px 24px!important}
  .st-title{font-size:30px!important}
  .st-code{font-size:38px!important;letter-spacing:7px!important}
}
@media (prefers-color-scheme:dark){
  .st-bg{background:#0d2f63!important}
  .st-card{background:#121823!important;border-color:#a9d3ff!important}
  .st-text,.st-title{color:#eef4ff!important}
  .st-muted{color:#b8c7de!important}
  .st-codebox,.st-box{background:#0f2747!important;border-color:#a9d3ff!important}
  .st-code{color:#ffffff!important}
  .st-link{color:#8cc4ff!important}
}
[data-ogsc] .st-card{background:#121823!important;border-color:#a9d3ff!important}
[data-ogsc] .st-text,[data-ogsc] .st-title,[data-ogsc] .st-code{color:#eef4ff!important}
[data-ogsc] .st-codebox,[data-ogsc] .st-box{background:#0f2747!important}
</style>
</head>
<body class="st-bg" style="margin:0;padding:0;background:${MAIL_SKY}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;font-size:1px;line-height:1px">${esc(preheader || '')}${'&#8199;&#65279;&#847; '.repeat(30)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="st-bg" bgcolor="${MAIL_SKY}" style="background:${MAIL_SKY}">
<tr><td align="center" style="padding:28px 12px 32px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px">
<tr><td align="center" style="padding:0 0 18px">
<a href="${esc(home)}" target="_blank" style="text-decoration:none;color:#ffffff">
<img src="${esc(img('/icons/icon-192.png'))}" width="52" height="52" alt="" style="display:inline-block;vertical-align:middle;border:0;width:52px;height:52px">
<span style="display:inline-block;vertical-align:middle;margin-left:10px;font:400 34px/1 ${TITLE_FONT};font-weight:900;color:#ffffff;letter-spacing:.5px">Stalak</span>
</a>
</td></tr>
<tr><td class="st-card" bgcolor="#ffffff" style="background:#ffffff;border:3px solid ${MAIL_INK};border-bottom-width:9px;border-radius:26px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="padding:0 22px;line-height:0;font-size:0"><img src="${esc(img('/icons/mail/icicles.png'))}" width="556" height="26" alt="" style="display:block;width:100%;max-width:556px;height:auto;border:0"></td></tr>
<tr><td class="st-pad" style="padding:30px 36px 28px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td align="center" style="padding:0 0 12px"><img src="${esc(img('/icons/mail/' + m + '.png'))}" width="88" height="88" alt="" style="display:block;width:88px;height:88px;border:0"></td></tr>
<tr><td align="center" style="padding:0 0 18px"><h1 class="st-title" style="margin:0;font:400 34px/1.15 ${TITLE_FONT};font-weight:900;color:${MAIL_INK};letter-spacing:.3px">${esc(title)}</h1></td></tr>
<tr><td>
${body}
</td></tr>
</table>
</td></tr>
</table>
</td></tr>
<tr><td align="center" style="padding:24px 10px 0;font:400 14px/1.6 ${BODY_FONT};color:#ffffff">
<p style="margin:0 0 6px;font:400 18px/1.3 ${TITLE_FONT};font-weight:900;color:#ffffff">${esc(t.tag)}</p>
<p style="margin:0 0 10px"><a href="${esc(home)}" target="_blank" style="color:#ffffff;font-weight:700;text-decoration:underline">stalak.app</a>
&nbsp;·&nbsp; ${t.follow} <a href="${SOCIAL.instagram}" target="_blank" style="color:#ffffff;font-weight:700;text-decoration:underline">Instagram</a>
&amp; <a href="${SOCIAL.tiktok}" target="_blank" style="color:#ffffff;font-weight:700;text-decoration:underline">TikTok</a> @stalak_app</p>
<p style="margin:0;font-size:13px;line-height:1.5;color:#e6f1ff">${esc(t.why)} ${linkify(reason).replace(/color:#1a64c8/g, 'color:#ffffff')}</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
  const text = [title, '', ...blocks.map((b) => blockText(b, fr)).filter((x) => x !== '').flatMap((x) => [x, '']),
    '—', `Stalak · ${home} · Instagram & TikTok @stalak_app`, `${t.why} ${reason}`].join('\n');
  return { subject, html, text };
}
