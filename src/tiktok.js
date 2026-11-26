/* « Publier sur TikTok » and « Mes stats » (domain « Réseaux sociaux », 21/11/2026). stalak.app only (loaded after the app).
   Reads the app through window.StalakApp (the exported file, its caption, the plan, the language) and the account through
   window.StalakAccount. Talks to /api/connect/tiktok (link, unlink) and /api/tiktok/* (functions/_lib/tiktok.js).

   TikTok's Content Sharing Guidelines (read 21/11/2026), each one followed here:
   1a the creator's nickname is shown · 1b a posting pause stops the sending and says to try later · 1c the video's length is
   checked against max_video_post_duration_sec · 2a an editable title · 2b visibility from privacy_level_options, chosen by the
   person, no default · 2c comments / Duet / Stitch off unless ticked, greyed out when the account forbids them · 3a the
   commercial content toggle is off; on, « Your brand » and / or « Branded content » must be chosen, with the label it gives
   · 3b branded content cannot be private · 4 the consent sentence with the Music Usage Confirmation (and the Branded Content
   Policy) · 5a a preview · 5b the caption can be edited · 5c nothing is sent before the person taps « Publier » · 5d « it may
   take a few minutes to appear on your profile » · 5e the status is followed until the end.
   « Publier sur TikTok » is for Pro (owner, 21/11): TikTok forbids a watermark added by the app, the free export carries one.
   « Mes stats »: a free preview, the detailed analysis for Pro; it never promises views. */
(() => {
'use strict';
const APP = window.StalakApp, ACC = window.StalakAccount;
if (!APP || !ACC) return;
const $ = (s, r) => (r || document).querySelector(s);
const lang = () => (APP.lang() === 'en' ? 'en' : 'fr');

const TXT = {
  fr: {
    'card.t': 'TikTok', 'card.p': 'Relie ton compte TikTok pour publier sans quitter Stalak et voir tes stats.',
    'link': 'Relier TikTok', 'unlink': 'Délier', 'unlinkQ': 'Délier ton compte TikTok de Stalak ?', 'stats': 'Mes stats',
    'linked': 'Compte relié', 'expired': 'Le lien a expiré : relie ton compte à nouveau.',
    'linkOk': 'Ton compte TikTok est relié.', 'linkErr': 'Le compte TikTok n’a pas pu être relié. Réessaie.',
    'linkCancel': 'Tu as annulé : rien n’a été relié.', 'popupBlocked': 'Ton navigateur a bloqué la fenêtre de TikTok. Autorise-la, puis réessaie.',
    'am': 'TikTok · Mes stats', 'pub.btn': 'Publier sur TikTok', 'pub.wm': 'Cette vidéo a le filigrane : TikTok ne l’accepte pas d’une appli. Refais-la sans filigrane, puis publie-la.',
    'pub.t': 'Publier sur TikTok', 'pub.acct': 'Sur le compte', 'pub.mode': 'Comment ?', 'pub.direct': 'Publier maintenant',
    'pub.draft': 'Envoyer en brouillon dans TikTok', 'pub.draftNote': 'Tu termines la publication dans l’appli TikTok : ouvre la notification dans ta boîte de réception.',
    'pub.cap': 'Légende', 'pub.vis': 'Qui peut voir la vidéo ?', 'pub.visPick': 'Choisis…',
    'vis.PUBLIC_TO_EVERYONE': 'Tout le monde', 'vis.MUTUAL_FOLLOW_FRIENDS': 'Amis (abonnés en commun)', 'vis.FOLLOWER_OF_CREATOR': 'Tes abonnés', 'vis.SELF_ONLY': 'Seulement moi',
    'pub.allow': 'Autoriser', 'pub.comment': 'Commentaires', 'pub.duet': 'Duo', 'pub.stitch': 'Collage', 'pub.off': 'désactivé dans ton compte TikTok',
    'pub.cc': 'Contenu commercial', 'pub.ccHelp': 'Indique si cette vidéo fait la promotion de toi-même, d’une marque, d’un produit ou d’un service.',
    'pub.yours': 'Ta marque', 'pub.yoursHelp': 'Tu fais la promotion de toi-même ou de ta propre activité.',
    'pub.branded': 'Contenu de marque', 'pub.brandedHelp': 'Tu fais la promotion d’une autre marque ou d’un tiers.',
    'pub.lblYours': 'Ta vidéo portera la mention « Contenu promotionnel ».', 'pub.lblBranded': 'Ta vidéo portera la mention « Partenariat rémunéré ».',
    'pub.ccNeed': 'Indique si ta vidéo fait la promotion de toi-même, d’un tiers, ou des deux.', 'pub.brandedPriv': 'Un contenu de marque ne peut pas être privé.',
    'pub.consentMusic': 'En publiant, tu acceptes la {m} de TikTok.', 'pub.consentBoth': 'En publiant, tu acceptes la {b} et la {m} de TikTok.',
    'pub.music': 'confirmation d’utilisation de la musique', 'pub.bcp': 'politique sur le contenu de marque',
    'pub.go': 'Publier', 'pub.goDraft': 'Envoyer le brouillon', 'pub.cancel': 'Annuler', 'pub.close': 'Fermer',
    'pub.long': 'Ce compte TikTok peut publier des vidéos de {n} s au plus. Ta vidéo dure {d} s.',
    'st.send': 'Envoi à TikTok… {p} %', 'st.proc': 'TikTok prépare ta vidéo…', 'st.wait': 'Il peut falloir quelques minutes avant qu’elle apparaisse sur ton profil.',
    'st.pub': 'C’est publié sur TikTok ✓', 'st.pubPriv': 'C’est publié ✓ Elle est visible par toi seulement.', 'st.see': 'Voir sur TikTok',
    'st.inbox': 'C’est envoyé ✓ Ouvre TikTok : ta vidéo t’attend dans ta boîte de réception pour finir la publication.',
    'st.fail': 'TikTok n’a pas publié la vidéo.', 'st.later': 'TikTok n’a pas encore fini. Tu la retrouveras sur ton profil dans quelques minutes.',
    'st.waitD': 'TikTok la met dans ta boîte de réception : ça peut prendre quelques minutes. Tu peux fermer cette fenêtre.',
    'st.laterD': 'TikTok n’a pas encore fini. Tu recevras une notification dans TikTok quand ton brouillon sera prêt.', 'e.timeout': 'TikTok met trop de temps à répondre. Réessaie dans un instant.',
    'f.duration_check_failed': 'La durée de la vidéo ne convient pas à TikTok.', 'f.file_format_check_failed': 'Le format du fichier ne convient pas à TikTok.',
    'f.frame_rate_check_failed': 'La cadence d’images ne convient pas à TikTok.', 'f.picture_size_check_failed': 'La taille de l’image ne convient pas à TikTok.',
    'f.spam_risk_too_many_posts': 'Ton compte a atteint la limite de publications du jour. Réessaie demain.',
    'f.spam_risk_user_banned_from_posting': 'TikTok ne laisse pas ce compte publier pour l’instant.', 'f.spam_risk_text': 'TikTok a refusé la légende. Change-la, puis réessaie.',
    'f.publish_cancelled': 'La publication a été annulée.', 'f.auth_removed': 'Stalak n’a plus accès à ton compte TikTok : relie-le à nouveau.',
    'e.tt_too_many_posts': 'Ton compte TikTok a atteint la limite de publications du jour. Réessaie demain.',
    'e.tt_too_many_drafts': 'Trop de brouillons attendent dans l’appli TikTok. Termine-les ou supprime-les d’abord.',
    'e.tt_banned': 'TikTok ne laisse pas ce compte publier pour l’instant.', 'e.tt_app_cap': 'Trop de monde publie depuis Stalak aujourd’hui. Réessaie un peu plus tard.',
    'e.tt_private_only': 'Pour l’instant, TikTok laisse Stalak publier seulement sur un compte TikTok privé. Passe ton compte en privé dans TikTok (Paramètres → Confidentialité), ou envoie la vidéo en brouillon.',
    'e.tt_scope': 'Il manque une autorisation : relie ton compte TikTok à nouveau et accepte tout.', 'e.reconnect_needed': 'Le lien avec TikTok a expiré : relie ton compte à nouveau.',
    'e.not_connected': 'Relie d’abord ton compte TikTok.', 'e.tt_rate': 'TikTok demande d’attendre un peu. Réessaie dans une minute.',
    'e.upload_expired': 'L’envoi a pris trop de temps. Recommence.', 'e.rate_limited': 'Trop d’envois pour l’instant. Réessaie plus tard.',
    'e.generic': 'Ça n’a pas marché. Réessaie dans un instant.', 'e.offline': 'Pas de connexion. Vérifie ton réseau.',
    'ms.t': 'Mes stats TikTok', 'ms.followers': 'abonnés', 'ms.likes': 'j’aime', 'ms.videos': 'vidéos', 'ms.last': 'Tes dernières vidéos',
    'ms.views': 'vues', 'ms.loading': 'Chargement de tes stats…', 'ms.none': 'Pas encore de vidéo sur ce compte.',
    'ms.proT': 'L’analyse détaillée, avec Pro', 'ms.proP': 'Sur toutes tes vidéos, faites avec Stalak ou non : le jour et l’heure qui marchent le mieux, la durée, les hashtags, et le passage du son qui a le mieux marché pour les vidéos publiées depuis Stalak.',
    'ms.proGo': 'Voir Stalak Pro', 'ms.a': 'Ce qui marche sur ton compte', 'ms.n': 'Sur tes {n} dernières vidéos.',
    'ms.med': 'Vues (valeur du milieu)', 'ms.eng': 'Réactions par vue', 'ms.day': 'Jour de publication', 'ms.hour': 'Heure de publication',
    'ms.dur': 'Durée', 'ms.tags': 'Hashtags', 'ms.src': 'Faites avec Stalak ou non', 'ms.stalak': 'Publiées depuis Stalak', 'ms.other': 'Autres vidéos',
    'ms.pass': 'Passage du son', 'ms.passP': 'Pour {s} : le passage de la vidéo qui a le plus de vues est en premier.',
    'ms.top': 'Tes 3 vidéos les plus vues', 'ms.flop': 'Les 3 moins vues', 'ms.few': 'pas assez de vidéos pour conclure',
    'ms.vid': '{n} vidéo', 'ms.vids': '{n} vidéos', 'ms.honest': 'Ces chiffres montrent ce qui a marché jusqu’ici sur ton compte. Ils ne garantissent pas les vues des prochaines vidéos.',
    'ms.src2': 'Chiffres donnés par TikTok, mis à jour à chaque ouverture.',
    'day0': 'dimanche', 'day1': 'lundi', 'day2': 'mardi', 'day3': 'mercredi', 'day4': 'jeudi', 'day5': 'vendredi', 'day6': 'samedi', 's': 's',
  },
  en: {
    'card.t': 'TikTok', 'card.p': 'Link your TikTok account to post without leaving Stalak and see your stats.',
    'link': 'Link TikTok', 'unlink': 'Unlink', 'unlinkQ': 'Unlink your TikTok account from Stalak?', 'stats': 'My stats',
    'linked': 'Account linked', 'expired': 'The link has expired: link your account again.',
    'linkOk': 'Your TikTok account is linked.', 'linkErr': 'The TikTok account could not be linked. Try again.',
    'linkCancel': 'You cancelled: nothing was linked.', 'popupBlocked': 'Your browser blocked the TikTok window. Allow it, then try again.',
    'am': 'TikTok · My stats', 'pub.btn': 'Post to TikTok', 'pub.wm': 'This video has the watermark: TikTok doesn’t accept it from an app. Make it again without the watermark, then post it.',
    'pub.t': 'Post to TikTok', 'pub.acct': 'On the account', 'pub.mode': 'How?', 'pub.direct': 'Post now',
    'pub.draft': 'Send as a draft to TikTok', 'pub.draftNote': 'You finish posting in the TikTok app: open the notification in your inbox.',
    'pub.cap': 'Caption', 'pub.vis': 'Who can watch this video?', 'pub.visPick': 'Choose…',
    'vis.PUBLIC_TO_EVERYONE': 'Everyone', 'vis.MUTUAL_FOLLOW_FRIENDS': 'Friends (mutual followers)', 'vis.FOLLOWER_OF_CREATOR': 'Your followers', 'vis.SELF_ONLY': 'Only me',
    'pub.allow': 'Allow', 'pub.comment': 'Comments', 'pub.duet': 'Duet', 'pub.stitch': 'Stitch', 'pub.off': 'turned off in your TikTok account',
    'pub.cc': 'Commercial content', 'pub.ccHelp': 'Indicate whether this content promotes yourself, a brand, product or service.',
    'pub.yours': 'Your brand', 'pub.yoursHelp': 'You are promoting yourself or your own business.',
    'pub.branded': 'Branded content', 'pub.brandedHelp': 'You are promoting another brand or a third party.',
    'pub.lblYours': 'Your video will be labeled as “Promotional content”.', 'pub.lblBranded': 'Your video will be labeled as “Paid partnership”.',
    'pub.ccNeed': 'You need to indicate if your content promotes yourself, a third party, or both.', 'pub.brandedPriv': 'Branded content visibility cannot be set to private.',
    'pub.consentMusic': 'By posting, you agree to TikTok’s {m}.', 'pub.consentBoth': 'By posting, you agree to TikTok’s {b} and {m}.',
    'pub.music': 'Music Usage Confirmation', 'pub.bcp': 'Branded Content Policy',
    'pub.go': 'Post', 'pub.goDraft': 'Send the draft', 'pub.cancel': 'Cancel', 'pub.close': 'Close',
    'pub.long': 'This TikTok account can post videos of {n} s at most. Your video lasts {d} s.',
    'st.send': 'Sending to TikTok… {p}%', 'st.proc': 'TikTok is processing your video…', 'st.wait': 'It may take a few minutes for it to show on your profile.',
    'st.pub': 'Posted on TikTok ✓', 'st.pubPriv': 'Posted ✓ Only you can see it.', 'st.see': 'See it on TikTok',
    'st.inbox': 'Sent ✓ Open TikTok: your video is waiting in your inbox to finish posting.',
    'st.fail': 'TikTok didn’t post the video.', 'st.later': 'TikTok isn’t done yet. You’ll find it on your profile in a few minutes.',
    'st.waitD': 'TikTok is putting it in your inbox: it may take a few minutes. You can close this window.',
    'st.laterD': 'TikTok isn’t done yet. You’ll get a notification in TikTok when your draft is ready.', 'e.timeout': 'TikTok is taking too long to answer. Try again in a moment.',
    'f.duration_check_failed': 'The video’s length doesn’t suit TikTok.', 'f.file_format_check_failed': 'The file format doesn’t suit TikTok.',
    'f.frame_rate_check_failed': 'The frame rate doesn’t suit TikTok.', 'f.picture_size_check_failed': 'The picture size doesn’t suit TikTok.',
    'f.spam_risk_too_many_posts': 'Your account reached today’s posting limit. Try again tomorrow.',
    'f.spam_risk_user_banned_from_posting': 'TikTok doesn’t let this account post right now.', 'f.spam_risk_text': 'TikTok refused the caption. Change it, then try again.',
    'f.publish_cancelled': 'Posting was cancelled.', 'f.auth_removed': 'Stalak no longer has access to your TikTok account: link it again.',
    'e.tt_too_many_posts': 'Your TikTok account reached today’s posting limit. Try again tomorrow.',
    'e.tt_too_many_drafts': 'Too many drafts are waiting in the TikTok app. Finish or delete them first.',
    'e.tt_banned': 'TikTok doesn’t let this account post right now.', 'e.tt_app_cap': 'Too many people are posting from Stalak today. Try again a bit later.',
    'e.tt_private_only': 'For now TikTok only lets Stalak post to a private TikTok account. Make your account private in TikTok (Settings → Privacy), or send the video as a draft.',
    'e.tt_scope': 'A permission is missing: link your TikTok account again and accept everything.', 'e.reconnect_needed': 'The TikTok link has expired: link your account again.',
    'e.not_connected': 'Link your TikTok account first.', 'e.tt_rate': 'TikTok asks to wait a little. Try again in a minute.',
    'e.upload_expired': 'Sending took too long. Start again.', 'e.rate_limited': 'Too many sendings for now. Try again later.',
    'e.generic': 'That didn’t work. Try again in a moment.', 'e.offline': 'No connection. Check your network.',
    'ms.t': 'My TikTok stats', 'ms.followers': 'followers', 'ms.likes': 'likes', 'ms.videos': 'videos', 'ms.last': 'Your latest videos',
    'ms.views': 'views', 'ms.loading': 'Loading your stats…', 'ms.none': 'No video on this account yet.',
    'ms.proT': 'The detailed analysis, with Pro', 'ms.proP': 'Across all your videos, made with Stalak or not: the day and time that work best, length, hashtags, and the part of the song that worked best for videos posted from Stalak.',
    'ms.proGo': 'See Stalak Pro', 'ms.a': 'What works on your account', 'ms.n': 'Across your last {n} videos.',
    'ms.med': 'Views (median)', 'ms.eng': 'Reactions per view', 'ms.day': 'Day posted', 'ms.hour': 'Time posted',
    'ms.dur': 'Length', 'ms.tags': 'Hashtags', 'ms.src': 'Made with Stalak or not', 'ms.stalak': 'Posted from Stalak', 'ms.other': 'Other videos',
    'ms.pass': 'Part of the song', 'ms.passP': 'For {s}: the part used in the most-viewed video comes first.',
    'ms.top': 'Your 3 most viewed videos', 'ms.flop': 'The 3 least viewed', 'ms.few': 'not enough videos to tell',
    'ms.vid': '{n} video', 'ms.vids': '{n} videos', 'ms.honest': 'These numbers show what has worked on your account so far. They don’t guarantee views for your next videos.',
    'ms.src2': 'Numbers from TikTok, refreshed each time you open this.',
    'day0': 'Sunday', 'day1': 'Monday', 'day2': 'Tuesday', 'day3': 'Wednesday', 'day4': 'Thursday', 'day5': 'Friday', 'day6': 'Saturday', 's': 's',
  },
};
const t = (k, v) => { let s = (TXT[lang()][k] != null ? TXT[lang()][k] : TXT.fr[k]) || k; if (v) for (const n in v) s = s.split('{' + n + '}').join(v[n]); return s; };
const el = (tag, attrs, ...kids) => {
  const e = document.createElement(tag);
  for (const k in attrs || {}) { const v = attrs[k]; if (v == null || v === false) continue; if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v === true ? '' : v); }
  for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c)));
  return e;
};
const fmt = (n) => { try { return new Intl.NumberFormat(lang() === 'en' ? 'en-US' : 'fr-FR', { notation: n >= 10000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(n || 0); } catch (e) { return String(n || 0); } };
const fdate = (ms) => { try { return new Date(ms).toLocaleDateString(lang() === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'short' }); } catch (e) { return ''; } };

async function api(method, path, body, extra) {
  if (body === undefined && method !== 'GET' && !(extra && extra.body !== undefined)) body = {};   // the server wants JSON on every change (CSRF check)
  let res, data;
  // a time limit on every request (22/11): a request that never answers must not leave the screen turning forever
  const x = Object.assign({}, extra || {}), wait = x.timeout || 30e3; delete x.timeout;
  const ac = typeof AbortController === 'function' ? new AbortController() : null;
  const tm = ac ? setTimeout(() => ac.abort(), wait) : 0;
  try {
    res = await fetch(path, Object.assign({ method, credentials: 'same-origin', headers: body !== undefined ? { 'Content-Type': 'application/json' } : {},
      body: body !== undefined ? JSON.stringify(body) : undefined, signal: ac ? ac.signal : undefined }, x));
    data = await res.json().catch(() => ({}));
  } catch (e) { const er = new Error('offline'); er.code = ac && ac.signal.aborted ? 'timeout' : 'offline'; throw er; }
  finally { clearTimeout(tm); }
  if (!res.ok) { const er = new Error(data.message || 'error'); er.code = data.error || 'generic'; er.status = res.status; er.data = data; throw er; }
  return data;
}
const errText = (e) => (TXT.fr['e.' + (e && e.code)] ? t('e.' + e.code) : t('e.generic'));

// ---- state: is TikTok offered, is it linked ------------------------------------------------------------------------
const TT = { offered: null, acct: null, loaded: false };
async function offered() {
  if (TT.offered != null) return TT.offered;
  // maquettes only (*.pages.dev, règle 9): « ?ttkdemo » shows the TikTok buttons although the maquette has no TikTok keys
  // (nothing works behind them there; stalak.app ignores it)
  if (/\.pages\.dev$/.test(location.hostname) && /[?&]ttkdemo\b/.test(location.search)) return (TT.offered = true);
  try { const c = await api('GET', '/api/config'); TT.offered = !!(c.features && Array.isArray(c.features.social) && c.features.social.includes('tiktok')); }
  catch (e) { TT.offered = false; }
  return TT.offered;
}
async function refresh() {
  if (!(await offered()) || !(ACC.state && ACC.state.user)) { TT.acct = null; TT.loaded = true; paint(); return; }
  try { const r = await api('GET', '/api/connect'); TT.acct = (r.accounts || []).find((a) => a.provider === 'tiktok') || null; }
  catch (e) { TT.acct = null; }
  TT.loaded = true; paint();
}
const linked = () => !!(TT.acct && TT.acct.status === 'ok');

// linking: a small TikTok window, so the edit in progress is not lost; back through social.js (BroadcastChannel, message, storage)
let linkWait = null;
function link() {
  const path = location.pathname.startsWith('/fr') ? '/fr/' : '/';
  const url = '/api/connect/tiktok/start?return=' + encodeURIComponent(path) + '&popup=1';
  const w = window.open(url, 'stalak-tiktok', 'width=520,height=760');
  if (!w) { toast(t('popupBlocked')); return; }
  linkWait = Date.now();
}
function linkDone(frag) {
  if (!frag || !/^social-(ok|err)-/.test(frag) || !/tiktok|err/.test(frag)) return;
  linkWait = null;
  if (frag === 'social-ok-tiktok') toast(t('linkOk')); else if (frag === 'social-err-cancelled') toast(t('linkCancel')); else toast(t('linkErr'));
  refresh();
}
try { const bc = new BroadcastChannel('stalak-social'); bc.onmessage = (m) => linkDone(m.data && m.data.stalakSocial); } catch (e) {}
window.addEventListener('message', (m) => { if (m.origin === location.origin && m.data && m.data.stalakSocial) linkDone(m.data.stalakSocial); });
window.addEventListener('storage', (e) => { if (e.key === 'stalak:social' && e.newValue) { try { linkDone(JSON.parse(e.newValue).f); } catch (x) {} } });
// back in the same window (no popup): #social-ok-tiktok
if (/^#social-(ok|err)-/.test(location.hash)) { const f = location.hash.slice(1); try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} setTimeout(() => linkDone(f), 400); }

async function unlink() {
  if (!window.confirm(t('unlinkQ'))) return;
  try { await api('DELETE', '/api/connect/tiktok'); } catch (e) { toast(errText(e)); }
  refresh();
}

// ---- a small message at the bottom ------------------------------------------------------------------------------------
let toastT = 0;
function toast(msg) {
  let b = $('#ttkToast');
  if (!b) { b = el('div', { id: 'ttkToast', class: 'ttk-toast', role: 'status', 'aria-live': 'polite' }); document.body.append(b); }
  b.textContent = msg; b.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { b.hidden = true; }, 4500);
}

// ---- the layer (one at a time): « Publier sur TikTok », « Mes stats » ------------------------------------------------------
let layer = null, lastFocus = null;
function open(title, body, onClose) {
  close();
  lastFocus = document.activeElement;
  const h = el('h2', { class: 'ttk-h', id: 'ttkH', tabindex: '-1', text: title });
  const x = el('button', { class: 'ttk-x', type: 'button', 'aria-label': t('pub.close'), onclick: () => close() }, '×');
  const box = el('div', { class: 'ttk-box card' }, el('div', { class: 'ttk-top' }, h, x), body);
  layer = el('div', { class: 'ttk-layer', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'ttkH' }, box);
  layer._onClose = onClose;
  layer.addEventListener('click', (e) => { if (e.target === layer && !layer._busy) close(); });
  layer._key = (e) => {
    if (!layer) return;
    if (e.key === 'Escape' && !layer._busy) { e.preventDefault(); e.stopPropagation(); close(); return; }
    if (e.key === 'Tab') {
      const f = [...layer.querySelectorAll('button,select,textarea,input,a[href]')].filter((n) => !n.disabled && n.offsetParent !== null);
      if (!f.length) return; const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && (i === f.length - 1 || i < 0)) { e.preventDefault(); f[0].focus(); }
    }
  };
  // on the document (capture): the focus may be on the page when the layer's content changes (after sending)
  document.addEventListener('keydown', layer._key, true);
  document.body.append(layer); document.body.classList.add('ttk-on');
  setTimeout(() => { try { h.focus({ preventScroll: true }); } catch (e) {} }, 30);
  return layer;
}
function close() {
  if (!layer) return;
  const l = layer; layer = null;
  document.removeEventListener('keydown', l._key, true);
  if (l._onClose) try { l._onClose(); } catch (e) {}
  l.remove(); document.body.classList.remove('ttk-on');
  try { if (lastFocus) lastFocus.focus({ preventScroll: true }); } catch (e) {}
}

// ---- « Publier sur TikTok » -----------------------------------------------------------------------------------------------
function videoDuration(blob) {
  return new Promise((res) => {
    const v = document.createElement('video'), u = URL.createObjectURL(blob);
    const done = (d) => { URL.revokeObjectURL(u); res(d); };
    v.preload = 'metadata'; v.muted = true; v.onloadedmetadata = () => done(isFinite(v.duration) ? v.duration : 0); v.onerror = () => done(0);
    setTimeout(() => done(0), 8000); v.src = u;
  });
}
async function publishOpen() {
  const ex = APP.exported();
  if (!ex) return;
  if (!APP.can('tiktok')) { APP.plans('tiktok'); return; }
  if (ex.watermark) { toast(t('pub.wm')); return; }
  if (!linked()) { link(); return; }
  const body = el('div', { class: 'ttk-pub' }, el('p', { class: 'ttk-load', text: '…' }));
  const L = open(t('pub.t'), body);
  let info, dur;
  try { [info, dur] = await Promise.all([api('GET', '/api/tiktok/creator'), videoDuration(ex.blob)]); }
  catch (e) { body.replaceChildren(el('p', { class: 'ttk-err', role: 'alert', text: errText(e) }), linkAgain(e)); return; }
  if (layer !== L) return;
  buildForm(body, ex, info.creator, info.canDraft, dur);
}
function linkAgain(e) {
  return e && /tt_scope|reconnect_needed|not_connected/.test(e.code) ? el('button', { class: 'btn', type: 'button', onclick: () => { close(); link(); }, text: t('link') }) : null;
}
function buildForm(body, ex, c, canDraft, dur) {
  const url = URL.createObjectURL(ex.blob);
  layer._onClose = () => { URL.revokeObjectURL(url); stopPoll(); };
  const st = { mode: 'direct', privacy: '', comment: false, duet: false, stitch: false, cc: false, yours: false, branded: false };
  // 1a: the account the video goes to
  const who = el('div', { class: 'ttk-who' }, c.avatarUrl ? el('img', { class: 'ttk-av', src: c.avatarUrl, alt: '', referrerpolicy: 'no-referrer' }) : null,
    el('span', {}, el('span', { class: 'ttk-k', text: t('pub.acct') + ' ' }), el('b', { text: c.nickname || c.username || 'TikTok' }), c.username ? el('span', { class: 'ttk-k', text: ' @' + c.username }) : null));
  // 5a: the preview
  const prev = el('video', { class: 'ttk-prev', src: url, controls: true, playsinline: true, muted: true, preload: 'metadata' });
  // mode: direct or draft (video.upload)
  const modeBox = canDraft ? el('fieldset', { class: 'ttk-seg' }, el('legend', { text: t('pub.mode') }),
    ...['direct', 'draft'].map((m) => el('label', {}, el('input', { type: 'radio', name: 'ttkMode', value: m, checked: m === 'direct', onchange: () => { st.mode = m; sync(); } }), ' ', t(m === 'direct' ? 'pub.direct' : 'pub.draft')))) : null;
  const draftNote = el('p', { class: 'ttk-note', text: t('pub.draftNote'), hidden: true });
  // 2a / 5b: the caption, editable
  const cap = el('textarea', { id: 'ttkCap', rows: '3', maxlength: '2200', spellcheck: 'false' }); cap.value = ex.caption || '';
  const capBox = el('div', { class: 'ttk-f' }, el('label', { for: 'ttkCap', text: t('pub.cap') }), cap);
  // 2b: visibility, no default
  const sel = el('select', { id: 'ttkVis', required: true, onchange: () => { st.privacy = sel.value; sync(); } },
    el('option', { value: '', disabled: true, selected: true, text: t('pub.visPick') }),
    ...c.privacyOptions.map((p) => el('option', { value: p, text: t('vis.' + p) })));
  const visBox = el('div', { class: 'ttk-f' }, el('label', { for: 'ttkVis', text: t('pub.vis') }), sel);
  // 2c: interactions, off unless ticked; greyed out when the account forbids them
  const box = (k, label, off) => el('label', { class: 'ttk-chk' + (off ? ' is-off' : '') },
    el('input', { type: 'checkbox', disabled: off, onchange: (e) => { st[k] = e.target.checked; } }), ' ', label, off ? el('span', { class: 'ttk-k', text: ' (' + t('pub.off') + ')' }) : null);
  const allow = el('fieldset', { class: 'ttk-f ttk-row' }, el('legend', { text: t('pub.allow') }),
    box('comment', t('pub.comment'), c.commentDisabled), box('duet', t('pub.duet'), c.duetDisabled), box('stitch', t('pub.stitch'), c.stitchDisabled));
  // 3a: commercial content
  const ccToggle = el('input', { type: 'checkbox', role: 'switch', id: 'ttkCc', onchange: (e) => { st.cc = e.target.checked; sync(); } });
  const yours = el('input', { type: 'checkbox', onchange: (e) => { st.yours = e.target.checked; sync(); } });
  const branded = el('input', { type: 'checkbox', onchange: (e) => { st.branded = e.target.checked; sync(); } });
  const ccOpts = el('div', { class: 'ttk-cc', hidden: true },
    el('label', { class: 'ttk-chk' }, yours, ' ', el('span', {}, el('b', { text: t('pub.yours') }), el('br'), el('span', { class: 'ttk-k', text: t('pub.yoursHelp') }))),
    el('label', { class: 'ttk-chk' }, branded, ' ', el('span', {}, el('b', { text: t('pub.branded') }), el('br'), el('span', { class: 'ttk-k', text: t('pub.brandedHelp') }))));
  const ccLabel = el('p', { class: 'ttk-note', role: 'status' });
  const ccBox = el('div', { class: 'ttk-f' }, el('label', { class: 'ttk-chk ttk-sw', for: 'ttkCc' }, ccToggle, ' ', el('b', { text: t('pub.cc') })),
    el('p', { class: 'ttk-k', text: t('pub.ccHelp') }), ccOpts, ccLabel);
  // 4: the consent sentence
  const consent = el('p', { class: 'ttk-consent' });
  const MUSIC = 'https://www.tiktok.com/legal/page/global/music-usage-confirmation/' + (lang() === 'en' ? 'en' : 'fr');
  const BCP = 'https://www.tiktok.com/legal/page/global/bc-policy/' + (lang() === 'en' ? 'en' : 'fr');
  const linkTo = (href, txt) => el('a', { href, target: '_blank', rel: 'noopener', text: txt });
  const tooLong = c.maxDuration && dur > c.maxDuration + 0.5;
  const longMsg = tooLong ? el('p', { class: 'ttk-err', role: 'alert', text: t('pub.long', { n: c.maxDuration, d: Math.round(dur) }) }) : null;
  const go = el('button', { class: 'btn primary big', type: 'button', id: 'ttkGo' });
  const why = el('p', { class: 'ttk-note', role: 'status' });
  const cancel = el('button', { class: 'btn', type: 'button', text: t('pub.cancel'), onclick: () => close() });
  const form = el('div', { class: 'ttk-form' }, who, prev, modeBox, draftNote, capBox, visBox, allow, ccBox, longMsg, consent, why, el('div', { class: 'ttk-acts' }, go, cancel));
  body.replaceChildren(form);
  function sync() {
    const direct = st.mode === 'direct';
    [capBox, visBox, allow, ccBox].forEach((n) => { n.hidden = !direct; });
    draftNote.hidden = direct;
    ccOpts.hidden = !st.cc;
    // 3b: branded content cannot be private
    const priv = [...sel.options].find((o) => o.value === 'SELF_ONLY');
    if (priv) { priv.disabled = st.cc && st.branded; if (priv.disabled && st.privacy === 'SELF_ONLY') { sel.value = ''; st.privacy = ''; } }
    const lbl = st.cc && st.branded ? t('pub.lblBranded') : st.cc && st.yours ? t('pub.lblYours') : '';
    ccLabel.textContent = lbl; ccLabel.hidden = !lbl;
    // 4
    consent.replaceChildren();
    const parts = (direct && st.cc && st.branded ? t('pub.consentBoth') : t('pub.consentMusic')).split(/(\{[bm]\})/);
    for (const p of parts) consent.append(p === '{m}' ? linkTo(MUSIC, t('pub.music')) : p === '{b}' ? linkTo(BCP, t('pub.bcp')) : p);
    let block = '';
    if (tooLong) block = longMsg.textContent;
    else if (direct && !st.privacy) block = t('pub.vis');
    else if (direct && st.cc && !st.yours && !st.branded) block = t('pub.ccNeed');
    go.disabled = !!block; go.title = block || ''; why.textContent = direct && st.cc && !st.yours && !st.branded ? t('pub.ccNeed') : '';
    go.textContent = direct ? t('pub.go') : t('pub.goDraft');
  }
  sync();
  go.onclick = () => { if (!go.disabled) send(form, ex, st, cap.value, dur, c); };
}

// sending: only after « Publier » (5c); the file goes in pieces through Stalak's server to TikTok
let pollT = 0;
const stopPoll = () => { clearTimeout(pollT); pollT = 0; };
async function send(form, ex, st, caption, dur, c) {
  const L = layer; L._busy = true;
  const bar = el('progress', { class: 'ttk-bar', max: '100', value: '0' });
  const msg = el('p', { class: 'ttk-st', role: 'status', 'aria-live': 'polite', text: t('st.send', { p: 0 }) });
  const out = el('div', { class: 'ttk-out' }, msg, bar);
  form.replaceWith(out);
  msg.tabIndex = -1; try { msg.focus({ preventScroll: true }); } catch (e) {}
  const fail = (text, e) => { L._busy = false; out.replaceChildren(el('p', { class: 'ttk-err', role: 'alert', text }), linkAgain(e) || el('button', { class: 'btn', type: 'button', text: t('pub.close'), onclick: () => close() })); };
  let start;
  try {
    start = await api('POST', '/api/tiktok/publish', {
      mode: st.mode, size: ex.blob.size, duration: Math.round(dur * 10) / 10 || 1, consent: true,
      title: caption, privacy: st.privacy, comment: st.comment, duet: st.duet, stitch: st.stitch,
      commercial: { on: st.cc, yourBrand: st.cc && st.yours, branded: st.cc && st.branded },
      meta: { song: ex.song, start: ex.start, end: ex.end, format: ex.format },
    });
  } catch (e) { fail(errText(e), e); return; }
  for (let n = 0; n < start.chunks; n++) {
    if (layer !== L) return;
    const a = n * start.chunkSize, b = n === start.chunks - 1 ? ex.blob.size : a + start.chunkSize;
    let ok = false, last;
    for (let k = 0; k < 3 && !ok; k++) {
      try { await api('PUT', `/api/tiktok/publish/${start.id}/chunk/${n}`, undefined, { headers: { 'Content-Type': 'application/octet-stream' }, body: ex.blob.slice(a, b), timeout: 120e3 }); ok = true; }
      catch (e) {
        last = e;
        // the piece arrived but the answer was lost (network, time limit): the server already has it, go on (22/11)
        if (e.code === 'bad_chunk' && e.data && e.data.next > n) { ok = true; break; }
        if (e.code === 'not_uploading' && n === start.chunks - 1) { ok = true; break; }
        if (e.code === 'upload_expired' || e.status === 409 || e.status === 404 || e.status === 403) break;
        await new Promise((r) => setTimeout(r, 1500 * (k + 1)));
      }
    }
    if (!ok) { fail(errText(last), last); return; }
    const p = Math.round(((n + 1) / start.chunks) * 100); bar.value = p; msg.textContent = t('st.send', { p });
  }
  const draft = st.mode === 'draft';
  msg.textContent = t('st.proc'); bar.removeAttribute('value');
  L._busy = false;   // the file is with TikTok: closing is safe now (22/11)
  out.append(el('p', { class: 'ttk-note', text: t(draft ? 'st.waitD' : 'st.wait') }),
    el('button', { class: 'btn', type: 'button', text: t('pub.close'), onclick: () => close() }));
  const t0 = Date.now();
  let errs = 0;
  const later = () => { bar.remove(); msg.textContent = t(draft ? 'st.laterD' : 'st.later'); };
  const poll = async () => {
    if (layer !== L) return;
    let s;
    try { s = await api('GET', `/api/tiktok/publish/${start.id}`); errs = 0; }
    catch (e) {
      if (layer !== L) return;
      if (/reconnect_needed|not_connected|tt_scope|not_found/.test(e.code)) { fail(errText(e), e); return; }
      if (++errs >= 5) { later(); return; }
      s = { status: 'processing' };
    }
    if (layer !== L) return;
    if (s.status === 'published') {
      L._busy = false; bar.remove();
      msg.textContent = st.privacy === 'SELF_ONLY' ? t('st.pubPriv') : t('st.pub');
      out.replaceChildren(msg, s.url ? el('a', { class: 'btn primary', href: s.url, target: '_blank', rel: 'noopener', text: t('st.see') }) : el('p', { class: 'ttk-note', text: t('st.wait') }),
        el('button', { class: 'btn', type: 'button', text: t('pub.close'), onclick: () => close() }));
      return;
    }
    if (s.status === 'inbox') { L._busy = false; bar.remove(); msg.textContent = t('st.inbox'); out.replaceChildren(msg, el('button', { class: 'btn', type: 'button', text: t('pub.close'), onclick: () => close() })); return; }
    if (s.status === 'failed') { fail(t('st.fail') + ' ' + (TXT.fr['f.' + s.failReason] ? t('f.' + s.failReason) : '')); return; }
    if (Date.now() - t0 > 5 * 60e3) { later(); return; }
    pollT = setTimeout(poll, 4000);
  };
  pollT = setTimeout(poll, 2500);
}

// ---- « Mes stats » --------------------------------------------------------------------------------------------------------
async function statsOpen() {
  if (!linked()) { link(); return; }
  const body = el('div', { class: 'ttk-ms' }, el('p', { class: 'ttk-load', role: 'status', text: t('ms.loading') }));
  const L = open(t('ms.t'), body);
  let d;
  try { d = await api('GET', '/api/tiktok/stats?tz=' + new Date().getTimezoneOffset()); }
  catch (e) { if (layer === L) body.replaceChildren(el('p', { class: 'ttk-err', role: 'alert', text: errText(e) }), linkAgain(e)); return; }
  if (layer !== L) return;
  const a = d.account;
  const head = el('div', { class: 'ttk-who ttk-big' }, a.avatarUrl ? el('img', { class: 'ttk-av', src: a.avatarUrl, alt: '', referrerpolicy: 'no-referrer' }) : null, el('b', { text: a.displayName || 'TikTok' }));
  const nums = el('div', { class: 'ttk-nums' }, ...[['followers', a.followers], ['likes', a.likes], ['videos', a.videos]].map(([k, v]) => el('div', { class: 'ttk-num' }, el('b', { text: fmt(v) }), el('span', { text: t('ms.' + k) }))));
  const byId = new Map(d.videos.map((v) => [v.id, v]));
  const vrow = (v) => el('a', { class: 'ttk-v', href: v.url || '#', target: '_blank', rel: 'noopener' },
    v.cover ? el('img', { src: v.cover, alt: '', loading: 'lazy', referrerpolicy: 'no-referrer' }) : el('span', { class: 'ttk-vph' }),
    el('span', { class: 'ttk-vt' }, el('span', { class: 'ttk-vtt', text: v.title || '—' }), el('span', { class: 'ttk-k', text: fdate(v.createdAt) + (v.stalak ? ' · Stalak' : '') })),
    el('span', { class: 'ttk-vn' }, el('b', { text: fmt(v.views) }), el('span', { class: 'ttk-k', text: t('ms.views') + ' · ' + fmt(v.likes) + ' ♥' })));
  const list = d.videos.length ? el('div', { class: 'ttk-list' }, ...d.videos.slice(0, 10).map(vrow)) : el('p', { class: 'ttk-note', text: t('ms.none') });
  const parts = [head, nums, el('h3', { text: t('ms.last') }), list];
  if (!d.pro) {
    parts.push(el('div', { class: 'ttk-pro card' }, el('h3', { text: t('ms.proT') }), el('p', { text: t('ms.proP') }),
      el('button', { class: 'btn primary', type: 'button', text: t('ms.proGo'), onclick: () => { close(); APP.plans('tiktok'); } })));
  } else if (d.analysis) parts.push(analysisView(d.analysis, byId, vrow));
  parts.push(el('p', { class: 'ttk-k ttk-src', text: t('ms.src2') }));
  body.replaceChildren(...parts);
}
function analysisView(A, byId, vrow) {
  const nv = (n) => t(n > 1 ? 'ms.vids' : 'ms.vid', { n });
  const table = (title, rows, label) => {
    if (!rows || !rows.length) return null;
    return el('div', { class: 'ttk-g' }, el('h4', { text: title }), el('ul', {}, ...rows.slice(0, 6).map((g) => el('li', { class: g.enough ? '' : 'is-few' },
      el('span', { class: 'ttk-gl', text: label(g.key) }), el('b', { text: g.medianViews != null ? fmt(g.medianViews) + ' ' + t('ms.views') : '—' }),
      el('span', { class: 'ttk-k', text: nv(g.n) + (g.enough ? '' : ' · ' + t('ms.few')) })))));
  };
  const durL = (k) => (k === '61+' ? '61 s +' : k.replace('-', '–') + ' ' + t('s'));
  const box = el('div', { class: 'ttk-an' }, el('h3', { text: t('ms.a') }), el('p', { class: 'ttk-k', text: t('ms.n', { n: A.n }) }),
    el('div', { class: 'ttk-nums' }, el('div', { class: 'ttk-num' }, el('b', { text: A.medianViews != null ? fmt(A.medianViews) : '—' }), el('span', { text: t('ms.med') })),
      el('div', { class: 'ttk-num' }, el('b', { text: A.engagement != null ? String(A.engagement).replace('.', lang() === 'fr' ? ',' : '.') + ' %' : '—' }), el('span', { text: t('ms.eng') }))),
    table(t('ms.day'), A.weekday, (k) => t('day' + k)),
    table(t('ms.hour'), A.hour, (k) => k.replace('-', ' h – ') + ' h'),
    table(t('ms.dur'), A.duration, durL),
    table(t('ms.tags'), A.hashtags, (k) => k),
    table(t('ms.src'), A.stalak, (k) => t(k === 'stalak' ? 'ms.stalak' : 'ms.other')));
  for (const p of A.passages || []) {
    box.append(el('div', { class: 'ttk-g' }, el('h4', { text: t('ms.pass') }), el('p', { class: 'ttk-k', text: t('ms.passP', { s: p.song }) }),
      el('ul', {}, ...p.videos.slice(0, 5).map((v) => el('li', {}, el('span', { class: 'ttk-gl', text: mmss(v.start) + ' → ' + mmss(v.end) }), el('b', { text: fmt(v.views) + ' ' + t('ms.views') }))))));
  }
  if (A.top && A.top.length) box.append(el('h4', { text: t('ms.top') }), el('div', { class: 'ttk-list' }, ...A.top.map((id) => byId.get(id)).filter(Boolean).map(vrow)));
  if (A.flop && A.flop.length) box.append(el('h4', { text: t('ms.flop') }), el('div', { class: 'ttk-list' }, ...A.flop.map((id) => byId.get(id)).filter(Boolean).map(vrow)));
  box.append(el('p', { class: 'ttk-note ttk-honest', text: t('ms.honest') }));
  return box;
}
const mmss = (s) => { if (s == null || !isFinite(s)) return '?'; const m = Math.floor(s / 60), r = Math.floor(s % 60); return m + ':' + String(r).padStart(2, '0'); };

// ---- TikTok's logo (22/11) ------------------------------------------------------------------------------------------------
// The official TikTok icon, taken unchanged from TikTok for Developers' « Logo and Button pack » (Button_Black.svg, the white
// note of the « Continue with TikTok » button). Rules (TikTok brand guidelines): never redrawn, stretched, outlined or recoloured:
// white on black (or black on white, in the menu: currentColor), with room around it, and always next to a written label.
// https://developers.tiktok.com/doc/getting-started-design-guidelines
const TT_ICON = '<svg class="ttk-logo" viewBox="11 11 22 22" aria-hidden="true" focusable="false"><path style="fill:currentColor;stroke:none" fill-rule="evenodd" clip-rule="evenodd" d="M25.5172 25.0575C25.4647 26.4295 24.3093 27.5306 22.8929 27.5306C22.5691 27.5306 22.2591 27.4729 21.9727 27.3675C22.2591 27.4729 22.5692 27.5306 22.893 27.5306C24.3094 27.5306 25.4648 26.4295 25.5174 25.0576L25.5224 12.8063H27.8124C28.0331 13.971 28.7405 14.9704 29.7205 15.5948C29.7208 15.5952 29.7212 15.5956 29.7215 15.596C30.4037 16.0305 31.2171 16.284 32.0903 16.284V16.9645C32.0903 16.9645 32.0903 16.9645 32.0904 16.9646V19.3405C30.4684 19.3405 28.9654 18.8334 27.7386 17.9728V24.1852C27.7386 27.2878 25.1559 29.8119 21.9812 29.8119C20.7545 29.8119 19.6169 29.4338 18.6818 28.7921C18.6813 28.7916 18.6808 28.791 18.6802 28.7905C17.1964 27.7717 16.224 26.0876 16.224 24.1846C16.224 21.0821 18.8067 18.5579 21.9814 18.5579C22.2448 18.5579 22.503 18.5791 22.7572 18.6128V19.337C19.861 19.4031 17.4865 21.5682 17.1713 24.3333C17.4868 21.5685 19.8611 19.4037 22.7571 19.3376V21.7342C22.5115 21.6591 22.2519 21.6154 21.9812 21.6154C20.5314 21.6154 19.3519 22.7683 19.3519 24.1852C19.3519 25.1719 19.9247 26.0292 20.7616 26.4596C20.7616 26.4597 20.7616 26.4597 20.7616 26.4597C21.1265 26.6474 21.541 26.7549 21.9811 26.7549C23.3975 26.7549 24.5529 25.6538 24.6055 24.2819L24.6105 12.0305H27.7385C27.7385 12.2955 27.7646 12.5545 27.8123 12.8063H25.5223L25.5172 25.0575Z"/></svg>';
function ttLabel(b, text) {
  let s = b.querySelector('.ttk-lbl');
  if (!s) { b.textContent = ''; b.insertAdjacentHTML('afterbegin', TT_ICON); s = el('span', { class: 'ttk-lbl' }); b.append(s); }
  s.textContent = text;
  return b;
}

// ---- where it shows in the app ------------------------------------------------------------------------------------------
// 1. the account page (« Ton compte »): a TikTok card, linked or not
function card() {
  const v = $('#apAccount'); if (!v) return;
  let c = $('#ttkCard', v);
  const on = TT.offered && ACC.state && ACC.state.user;
  if (!on) { if (c) c.hidden = true; return; }
  if (!c) { c = el('div', { class: 'card ap-card ttk-card', id: 'ttkCard' }); const sec = v.querySelectorAll('.ap-card')[1]; if (sec) sec.after(c); else v.append(c); }
  c.hidden = false;
  const a = TT.acct;
  const kids = [el('h3', { text: t('card.t') })];
  if (a && a.status === 'ok') {
    kids.push(el('div', { class: 'ttk-who' }, a.avatarUrl ? el('img', { class: 'ttk-av', src: a.avatarUrl, alt: '', referrerpolicy: 'no-referrer' }) : null,
      el('span', {}, el('b', { text: a.displayName || 'TikTok' }), el('br'), el('span', { class: 'ttk-k', text: t('linked') }))));
    kids.push(el('div', { class: 'row ttk-acts' }, el('button', { class: 'btn', type: 'button', id: 'ttkStats', text: t('stats'), onclick: statsOpen }),
      el('button', { class: 'btn', type: 'button', id: 'ttkUnlink', text: t('unlink'), onclick: unlink })));
  } else {
    kids.push(el('p', { class: 'ttk-k', text: a && a.status !== 'ok' ? t('expired') : t('card.p') }));
    kids.push(el('div', { class: 'row' }, ttLabel(el('button', { class: 'btn ttk-tt', type: 'button', id: 'ttkLink', onclick: link }), t('link'))));
  }
  c.replaceChildren(...kids);
}
// 2. the account menu: « TikTok · Mes stats »
function menu() {
  const m = $('#acctMenu'); if (!m) return;
  let b = $('[data-am="tiktok"]', m);
  const on = TT.offered && ACC.state && ACC.state.user;
  if (!on) { if (b) b.hidden = true; return; }
  if (!b) {
    b = el('button', { type: 'button', role: 'menuitem', tabindex: '-1', 'data-am': 'tiktok' });
    b.innerHTML = TT_ICON;
    b.append(el('span', { class: 'ttk-amT' }));
    b.addEventListener('click', (e) => { e.stopPropagation(); APP.menuClose(); linked() ? statsOpen() : link(); });
    const help = $('[data-am="help"]', m); if (help) help.before(b); else m.prepend(b);
  }
  b.hidden = false; $('.ttk-amT', b).textContent = t('am');
}
// 3. the end of the export: « Publier sur TikTok » under « Enregistrer la vidéo »
function doneButton() {
  const dv = $('#doneView'); if (!dv) return;
  let b = $('#ttkPub');
  const ex = document.body.classList.contains('isdone') ? APP.exported() : null;
  const on = TT.offered && ex && !ex.demo;
  if (!on) { if (b) b.hidden = true; return; }
  if (!b) {
    b = el('button', { class: 'btn big ttk-pubbtn ttk-tt', type: 'button', id: 'ttkPub', onclick: () => { if (!APP.busy()) publishOpen(); } });
    const after = $('#shareBox') && !$('#shareBox').hidden ? $('#shareBox') : $('#saveRow');
    (after || $('#result') || dv).after(b);
  }
  b.hidden = false; ttLabel(b, t('pub.btn'));
  const pro = APP.can('tiktok');
  b.classList.toggle('protag', !pro); if (!pro) b.dataset.plan = 'PRO'; else delete b.dataset.plan;
}
function paint() { try { card(); menu(); doneButton(); } catch (e) {} }

// follow the app: the account state, the end of the export, the account page and menu opening, the language
// (26/11) TikTok is offered per account while the app is in Sandbox (only the test accounts): asked again when the account changes
ACC.onChange(() => { const id = (ACC.state && ACC.state.user && ACC.state.user.id) || ''; if (id !== TT.uid){ TT.uid = id; TT.offered = null; } refresh(); });
new MutationObserver(() => doneButton()).observe(document.body, { attributes: true, attributeFilter: ['class'] });
const watch = (id, f) => { const n = document.getElementById(id); if (n) new MutationObserver(f).observe(n, { attributes: true, attributeFilter: ['hidden'] }); };
watch('apAccount', () => { if (!$('#apAccount').hidden) refresh(); });
watch('acctMenu', () => menu());
watch('doneView', () => doneButton());
new MutationObserver(() => paint()).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
refresh();
// for the tests (tests/ui/tiktok_ui.py)
window.StalakTikTok = Object.freeze({ publishOpen, statsOpen, refresh, link });
})();
