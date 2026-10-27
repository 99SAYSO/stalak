// Social posting (TikTok, Instagram) — NOT IMPLEMENTED. Disabled unless SOCIAL_CONNECT_ENABLED = "1".
//
// TODO TikTok (Content Posting API, https://developers.tiktok.com/doc/content-posting-api-get-started):
//   - register the app, request scopes user.info.basic + video.publish (or video.upload), pass app review
//   - start: build the authorize URL (client_key, scope, redirect_uri=https://stalak.app/api/connect/tiktok/callback,
//     state = random value stored server-side / in a short-lived cookie, PKCE code_challenge)
//   - callback: check state, exchange code for access/refresh tokens, store them ENCRYPTED in a new D1 table
//     (social_accounts: user_id, provider, open_id, access_token_enc, refresh_token_enc, expires_at)
//   - posting: needs the video file reachable by TikTok (upload or PULL_FROM_URL from R2 binding MEDIA)
// TODO Instagram (Instagram API with Instagram Login, content publishing):
//   - Meta app, scopes instagram_business_basic + instagram_business_content_publish, app review
//   - only Business/Creator accounts can publish; reels are published from a public video URL (R2 MEDIA)
//   - same start/callback/state pattern as above; long-lived tokens (60 days) must be refreshed
// Both reviews require: privacy policy, account deletion (DELETE /api/account exists), data-deletion instructions.
import { HttpError } from './http.js';
import { requireUser } from './auth.js';

const PROVIDERS = new Set(['tiktok', 'instagram']);
const STEPS = new Set(['start', 'callback']);

export async function social(request, env, provider, step) {
  if (!PROVIDERS.has(provider) || !STEPS.has(step)) throw new HttpError(404, 'not_found', 'Unknown API route.');
  if (env.SOCIAL_CONNECT_ENABLED !== '1') throw new HttpError(404, 'not_enabled', 'Social posting is not available yet.');
  await requireUser(request, env);
  throw new HttpError(501, 'not_implemented', `Connecting ${provider} is not implemented yet.`);
}
