// The TikTok conversion API (Events API), Comptes, 23/11 (owner's decision): ready, OFF until the TikTok Ads account exists.
// - Sent by the server only, for a purchase confirmed by Paddle (webhook transaction.completed / paid): the first payment of a
//   subscription (the 1 € of the offer, a purchase, or the first payment after a free trial); never a renewal.
// - ONLY if the person accepted the cookies on the page that opened the payment (Paddle customData.mc = 1, consent.js).
// - The e-mail is sent hashed (SHA-256 of the address in lower case, as TikTok asks), never in clear; the account id hashed too;
//   the TikTok click id (ttclid) when the page had one (kept only after « Accepter »). No IP, no browser details.
// - On when TIKTOK_PIXEL_ID (a variable) and TIKTOK_EVENTS_TOKEN (a secret, typed by the owner in Cloudflare) are both set.
//   TIKTOK_TEST_EVENT_CODE (optional) sends to TikTok's « Test events » tab instead, to check before going live.
// The event_id is Paddle's transaction id: TikTok counts it once even if Paddle sends the webhook twice.
import { sha256Hex } from './crypto.js';
import { bump } from './metrics.js';

export const TIKTOK_EVENTS_URL = 'https://business-api.tiktok.com/open_api/v1.3/event/track/';
export const tiktokConversionsOn = (env) => !!(env.TIKTOK_PIXEL_ID && env.TIKTOK_EVENTS_TOKEN);

// data = Paddle's transaction; plan = 'pro' | 'creator' | null; userId / email from the account (may be null)
export async function tiktokPurchase(env, data, { plan = null, userId = null, email = null, totalCents = null, currency = null } = {}) {
  if (!tiktokConversionsOn(env) || !data || !data.id) return { tiktok: 'off' };
  const cd = data.custom_data || {};
  if (!(cd.mc === 1 || cd.mc === '1' || cd.mc === true)) return { tiktok: 'no_consent' };
  if (!(totalCents > 0)) return { tiktok: 'no_amount' };
  const user = {};
  if (email) user.email = await sha256Hex(String(email).trim().toLowerCase());
  if (userId) user.external_id = await sha256Hex(String(userId));
  if (typeof cd.ttclid === 'string' && /^[\w.-]{8,200}$/.test(cd.ttclid)) user.ttclid = cd.ttclid;
  const cur = String(currency || 'USD').toUpperCase().slice(0, 3);
  const body = {
    event_source: 'web', event_source_id: String(env.TIKTOK_PIXEL_ID),
    data: [{
      // 25/11: « Purchase » is TikTok's standard name now (Ads Manager help, read 25/11); the page sends the same event with
      // the same event_id (consent.js), so TikTok counts it once
      event: 'Purchase', event_time: Math.floor((Date.parse(data.billed_at || data.updated_at || '') || Date.now()) / 1000),
      event_id: String(data.id), user,
      properties: { currency: cur, value: Math.round(totalCents) / 100, content_type: 'product',
        contents: [{ content_id: 'stalak_' + (plan || 'pro'), content_name: plan === 'creator' ? 'Stalak Creator Plus' : 'Stalak Pro', quantity: 1 }] },
      page: { url: 'https://stalak.app/' },
    }],
  };
  if (env.TIKTOK_TEST_EVENT_CODE) body.test_event_code = String(env.TIKTOK_TEST_EVENT_CODE);
  try {
    const res = await fetch(TIKTOK_EVENTS_URL, { method: 'POST', signal: AbortSignal.timeout(10000),
      headers: { 'Access-Token': env.TIKTOK_EVENTS_TOKEN, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await res.json().catch(() => ({}));
    const ok = res.ok && (j.code === 0 || j.code === undefined);
    await bump(env, ok ? 'tt_conv_ok' : 'tt_conv_fail').catch(() => {});
    if (!ok) console.warn('[stalak] tiktok conversion refused', res.status, j && j.code, j && String(j.message || '').slice(0, 120));
    return { tiktok: ok ? 'sent' : 'refused' };
  } catch (e) {
    await bump(env, 'tt_conv_fail').catch(() => {});
    console.warn('[stalak] tiktok conversion not sent', (e && e.name) || '-');
    return { tiktok: 'error' };
  }
}
