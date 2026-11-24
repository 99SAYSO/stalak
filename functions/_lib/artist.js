// Comptes, 23/11: the onboarding answers kept on the account (mobile redesign, point 13) and the monthly listeners the artist
// gives each week in « Stats ». The streaming services do not give this figure (Spotify's API stopped in February 2026):
// it is what the artist says. Used for the owner's analysis (dashboard, as totals only) and future tools (stats, planning).
// Closed lists only (unknown values are dropped); links only to their own site; everything goes with the account.
import { HttpError } from './http.js';

export const ARTIST_LISTS = {
  genres: ['rap', 'drill', 'chant', 'autre'],
  postsOn: ['tiktok', 'reels', 'shorts'],
  blockers: ['few_views', 'editing_time', 'no_ideas'],
  goals: ['song_launch', 'post_more', 'fill_concerts'],
};
export const LISTENERS_NOW = ['lt100', '100_1k', '1k_10k', 'gt10k'];
export const LISTENERS_GOAL = ['1k', '10k', '100k', '1m'];
const LINKS = {
  spotify: { col: 'spotify_url', hosts: ['open.spotify.com', 'spotify.link'] },
  appleMusic: { col: 'apple_music_url', hosts: ['music.apple.com'] },
  soundcloud: { col: 'soundcloud_url', hosts: ['soundcloud.com', 'm.soundcloud.com', 'on.soundcloud.com'] },
  instagram: { col: 'instagram_url', hosts: ['instagram.com', 'www.instagram.com'] },
  // 24/11 (« Stats »): TikTok (needed for the analysis) and YouTube; « @name » accepted for both
  tiktok: { col: 'tiktok_url', hosts: ['tiktok.com', 'www.tiktok.com', 'm.tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com'] },
  youtube: { col: 'youtube_url', hosts: ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtu.be'] },
};
const HANDLE_URL = { instagram: (h) => 'https://www.instagram.com/' + h + '/', tiktok: (h) => 'https://www.tiktok.com/@' + h, youtube: (h) => 'https://www.youtube.com/@' + h };
const HANDLE_RE = { instagram: /^@?([A-Za-z0-9._]{1,30})$/, tiktok: /^@([A-Za-z0-9._]{2,24})$/, youtube: /^@([A-Za-z0-9._-]{3,30})$/ };
// the Spotify artist id in a profile link (open.spotify.com/artist/<22 characters>, also /intl-fr/artist/…); null otherwise
export function spotifyArtistId(link) {
  const m = /^https:\/\/open\.spotify\.com\/(?:intl-[a-z]{2}(?:-[a-z]{2})?\/)?artist\/([A-Za-z0-9]{22})(?:[/?]|$)/.exec(String(link || ''));
  return m ? m[1] : null;
}
const LIST_COL = { genres: 'genres', postsOn: 'posts_on', blockers: 'blockers', goals: 'goals' };

const list = (v, allowed) => Array.isArray(v) ? [...new Set(v.map((x) => String(x).toLowerCase()).filter((x) => allowed.includes(x)))] : [];
const parse = (s) => { try { const a = JSON.parse(s || '[]'); return Array.isArray(a) ? a : []; } catch { return []; } };

// a link of that site only (https), « @name » allowed for Instagram; '' = removed; undefined = not a link of that site
export function cleanLink(kind, v) {
  if (v == null || String(v).trim() === '') return '';
  let s = String(v).trim().slice(0, 300);
  const hm = HANDLE_RE[kind] && HANDLE_RE[kind].exec(s);
  if (hm) return HANDLE_URL[kind](hm[1]);
  if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
  let u; try { u = new URL(s); } catch { return undefined; }
  const host = u.hostname.toLowerCase();
  if (!LINKS[kind].hosts.includes(host) || u.username || u.password) return undefined;
  u.protocol = 'https:'; u.hash = '';
  return u.toString();
}
export function cleanName(v) {
  if (v == null) return '';
  const s = String(v).replace(/[\u0000-\u001f\u007f​-‏‪-‮⁦-⁩]/g, '').replace(/\s+/g, ' ').trim();
  return s.slice(0, 60);
}

function out(r) {
  if (!r) return null;
  return {
    artistName: r.artist_name || '', genres: parse(r.genres), onPlatforms: r.on_platforms == null ? null : !!r.on_platforms,
    genreOther: r.genre_other || '',
    links: { spotify: r.spotify_url || '', appleMusic: r.apple_music_url || '', soundcloud: r.soundcloud_url || '', instagram: r.instagram_url || '',
      tiktok: r.tiktok_url || '', youtube: r.youtube_url || '' },
    listenersNow: r.listeners_now || null, postsOn: parse(r.posts_on), blockers: parse(r.blockers), listenersGoal: r.listeners_goal || null,
    goals: parse(r.goals), answeredAt: r.answered_at ? new Date(r.answered_at).toISOString() : null,
  };
}

// ---- weeks (ISO 8601, Monday first) ----
export function isoWeek(t = Date.now()) {
  const d = new Date(t); const day = (d.getUTCDay() + 6) % 7;
  const th = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day + 3));
  const y = th.getUTCFullYear(), jan4 = new Date(Date.UTC(y, 0, 4));
  const w = 1 + Math.round(((th - jan4) / 864e5 - 3 + ((jan4.getUTCDay() + 6) % 7)) / 7);
  return y + '-W' + String(w).padStart(2, '0');
}
const weeksBack = (n, t = Date.now()) => Array.from({ length: n + 1 }, (_, i) => isoWeek(t - i * 7 * 864e5));

// GET /api/artist: the answers (null before the onboarding), the listeners given (the last 52 weeks), and whether this
// week's figure is still to give (« Stats » asks it once a week)
export async function getArtist(env, user, now = Date.now()) {
  const r = await env.DB.prepare('SELECT * FROM artist_profiles WHERE user_id = ?1').bind(user.id).first();
  const { results } = await env.DB.prepare('SELECT week, platform, listeners, updated_at FROM listener_counts WHERE user_id = ?1 ORDER BY week DESC LIMIT 104')
    .bind(user.id).all();
  const week = isoWeek(now);
  return { profile: out(r), listeners: results.slice(0, 52).reverse().map((x) => ({ week: x.week, platform: x.platform, listeners: x.listeners })),
    week, listenersDue: !results.some((x) => x.week === week && x.platform === 'spotify') };
}

// PUT /api/artist: the onboarding answers, all or some (only the fields sent change). A link of the wrong site: 400.
export async function putArtist(env, user, b, now = Date.now()) {
  if (!b || typeof b !== 'object' || Array.isArray(b)) throw new HttpError(400, 'bad_request', 'Send the answers as an object.');
  const set = {};
  if ('artistName' in b) set.artist_name = cleanName(b.artistName) || null;
  // 24/11: « Dis-nous ce que tu fais » (when « Autre » is chosen), short free text, kept for the analysis
  if ('genreOther' in b) set.genre_other = cleanName(b.genreOther) || null;
  for (const k in LIST_COL) if (k in b) set[LIST_COL[k]] = JSON.stringify(list(b[k], ARTIST_LISTS[k]));
  if ('onPlatforms' in b) set.on_platforms = b.onPlatforms === true ? 1 : b.onPlatforms === false ? 0 : null;
  if ('listenersNow' in b) set.listeners_now = LISTENERS_NOW.includes(b.listenersNow) ? b.listenersNow : null;
  if ('listenersGoal' in b) set.listeners_goal = LISTENERS_GOAL.includes(b.listenersGoal) ? b.listenersGoal : null;
  if (b.links && typeof b.links === 'object') {
    for (const k in LINKS) if (k in b.links) {
      const v = cleanLink(k, b.links[k]);
      if (v === undefined) throw new HttpError(400, 'bad_link', `This is not a ${k} link.`, { field: k });
      set[LINKS[k].col] = v || null;
    }
  }
  const cols = Object.keys(set);
  if (!cols.length) return getArtist(env, user, now);
  await env.DB.prepare(`INSERT INTO artist_profiles (user_id, ${cols.join(', ')}, answered_at, updated_at)
      VALUES (?1, ${cols.map((_, i) => '?' + (i + 3)).join(', ')}, ?2, ?2)
      ON CONFLICT(user_id) DO UPDATE SET ${cols.map((c) => `${c} = excluded.${c}`).join(', ')}, updated_at = ?2`)
    .bind(user.id, now, ...cols.map((c) => set[c])).run();
  return getArtist(env, user, now);
}

// PUT /api/artist/listeners {listeners, week?, platform?}: the monthly listeners of the week (this week by default; one of
// the last 8 weeks to fix a figure); null removes it. Spotify for now (the onboarding asks Spotify for Artists).
export async function putListeners(env, user, b, now = Date.now()) {
  const week = b && b.week != null ? String(b.week) : isoWeek(now);
  if (!weeksBack(8, now).includes(week)) throw new HttpError(400, 'bad_week', 'Only this week or one of the last 8 weeks.');
  const platform = b && b.platform != null ? String(b.platform) : 'spotify';
  if (!['spotify'].includes(platform)) throw new HttpError(400, 'bad_platform', 'Spotify only for now.');
  if (b && b.listeners === null) {
    await env.DB.prepare('DELETE FROM listener_counts WHERE user_id = ?1 AND week = ?2 AND platform = ?3').bind(user.id, week, platform).run();
    return getArtist(env, user, now);
  }
  // a number, or the digits typed in a field (« 1200 »)
  const raw = b && b.listeners, n = typeof raw === 'number' ? raw : /^\d{1,10}$/.test(String(raw == null ? '' : raw).trim()) ? Number(String(raw).trim()) : NaN;
  if (!Number.isInteger(n) || n < 0 || n > 1e9) throw new HttpError(400, 'bad_listeners', 'A whole number of listeners, 0 or more.');
  await env.DB.prepare(`INSERT INTO listener_counts (user_id, week, platform, listeners, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?5)
      ON CONFLICT(user_id, week, platform) DO UPDATE SET listeners = excluded.listeners, updated_at = excluded.updated_at`)
    .bind(user.id, week, platform, n, now).run();
  return getArtist(env, user, now);
}

// Dashboard (admin.js): totals only, never one artist's answers. How many answered, and for each question how many picked
// each choice; how many gave their listeners this week and the last 4 weeks.
export async function artistTotals(env, now = Date.now()) {
  const { results } = await env.DB.prepare('SELECT genres, on_platforms, listeners_now, posts_on, blockers, listeners_goal, goals FROM artist_profiles').all();
  const count = (keys) => Object.fromEntries(keys.map((k) => [k, 0]));
  const t = { profiles: results.length, onPlatforms: 0, genres: count(ARTIST_LISTS.genres), postsOn: count(ARTIST_LISTS.postsOn),
    blockers: count(ARTIST_LISTS.blockers), goals: count(ARTIST_LISTS.goals), listenersNow: count(LISTENERS_NOW), listenersGoal: count(LISTENERS_GOAL) };
  for (const r of results) {
    if (r.on_platforms === 1) t.onPlatforms++;
    for (const [k, col] of Object.entries(LIST_COL)) for (const v of parse(r[col])) if (v in t[k]) t[k][v]++;
    if (r.listeners_now in t.listenersNow) t.listenersNow[r.listeners_now]++;
    if (r.listeners_goal in t.listenersGoal) t.listenersGoal[r.listeners_goal]++;
  }
  const wk = weeksBack(3, now);
  const w = await env.DB.prepare(`SELECT COUNT(DISTINCT CASE WHEN week = ?1 THEN user_id END) AS thisWeek, COUNT(DISTINCT user_id) AS last4
      FROM listener_counts WHERE week IN (?1, ?2, ?3, ?4)`).bind(...wk).first();
  t.listenersGiven = { thisWeek: (w && w.thisWeek) || 0, last4Weeks: (w && w.last4) || 0 };
  return t;
}
