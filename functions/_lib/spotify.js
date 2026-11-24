// « Stats » — the artist's Spotify figures (Comptes, 24/11, docs/handoff/chef-stats-analyse.md,
// docs/audit/test-apify-spotify-2026-11-24.md).
// 1. Releases (albums and singles): Spotify's official Web API, GET /v1/artists/{id}/albums (read 24/11: include_groups
//    album,single; limit 10 at most; a market is needed with an app token). App token by « client credentials »
//    (SPOTIFY_CLIENT_ID + secret SPOTIFY_CLIENT_SECRET, the owner's developer access), kept ~50 min in memory.
// 2. Monthly listeners, followers, cities; plays of each song: the public page read by the Apify robot
//    beatanalytics/spotify-play-count-scraper (secret APIFY_TOKEN), run-sync-get-dataset-items (waits 300 s at most; ~0,004 $
//    per link). The artist (1 link) once a week; the songs (1 link per release) once a month or at a new release.
// Rules (Chef's test of 24/11):
// - streamCount 0 means « fewer than 1,000 plays » on Spotify: stored as 0, never shown as 0 (stats.js says « < 1 000 »);
// - a failed or odd answer overwrites nothing; the screen says the figures were not updated this week;
// - 2 failed runs in a row: one alert to the owner (Telegram / ntfy), at most once a day.
// Only public figures of the artist's own profile, kept with the account and deleted with it.
import { spotifyArtistId, isoWeek } from './artist.js';
import { notifyOwner } from './notify.js';

export const APIFY_ACTOR = 'beatanalytics~spotify-play-count-scraper';
const APIFY_URL = 'https://api.apify.com/v2/acts/' + APIFY_ACTOR + '/run-sync-get-dataset-items';
const SP_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SP_API = 'https://api.spotify.com/v1';
const ARTISTS_PER_RUN = 10;      // artists read together in one robot run (1 link each)
const RELEASES_PER_RUN = 20;     // the 20 latest releases at most for the monthly songs run
const RUN_WAIT_S = 25;           // the robot took 5 s in the test; the page's background work must stay short
const RETRY_AFTER = 20 * 3600e3; // a failed artist is tried again the next day, not at each daily task

export const apifyOn = (env) => !!(env.APIFY_TOKEN && String(env.APIFY_TOKEN).length > 10);
export const spotifyApiOn = (env) => !!(env.SPOTIFY_CLIENT_ID && env.SPOTIFY_CLIENT_SECRET);
const month = (t) => new Date(t).toISOString().slice(0, 7);
const int = (v) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.round(v) : null);
const txt = (v, n = 120) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, n) : null);
const ID22 = /^[A-Za-z0-9]{22}$/;

async function syncRow(env, userId) {
  return env.DB.prepare('SELECT * FROM spotify_sync WHERE user_id = ?1').bind(userId).first();
}
async function setSync(env, userId, fields) {
  const cols = Object.keys(fields);
  await env.DB.prepare(`INSERT INTO spotify_sync (user_id, ${cols.join(', ')}) VALUES (?1, ${cols.map((_, i) => '?' + (i + 2)).join(', ')})
    ON CONFLICT(user_id) DO UPDATE SET ${cols.map((c) => `${c} = excluded.${c}`).join(', ')}`).bind(userId, ...cols.map((c) => fields[c])).run();
}

// ---- 1. releases, official API ------------------------------------------------------------------------------------------
let SP_TOKEN = null;
export function spotifyResetCache() { SP_TOKEN = null; }
async function spToken(env, now) {
  if (SP_TOKEN && SP_TOKEN.until > now) return SP_TOKEN.token;
  const res = await fetch(SP_TOKEN_URL, { method: 'POST', signal: AbortSignal.timeout(10000),
    headers: { Authorization: 'Basic ' + btoa(env.SPOTIFY_CLIENT_ID + ':' + env.SPOTIFY_CLIENT_SECRET), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials' });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.access_token) throw Object.assign(new Error('token'), { code: res.status === 400 || res.status === 401 ? 'sp_key_refused' : 'sp_token_' + res.status });
  SP_TOKEN = { token: j.access_token, until: now + Math.min(50 * 60e3, Math.max(60e3, (Number(j.expires_in) || 3600) * 1000 - 5 * 60e3)) };
  return SP_TOKEN.token;
}
// the artist's albums and singles (up to 50), newest first; throws {code} on an error
export async function fetchReleases(env, artistId, now = Date.now()) {
  const token = await spToken(env, now), market = /^[A-Z]{2}$/.test(env.SPOTIFY_MARKET || '') ? env.SPOTIFY_MARKET : 'FR';
  const out = [];
  for (let offset = 0; offset < 50; offset += 10) {
    let res;
    try {
      res = await fetch(`${SP_API}/artists/${artistId}/albums?include_groups=album,single&market=${market}&limit=10&offset=${offset}`,
        { headers: { Authorization: 'Bearer ' + token }, signal: AbortSignal.timeout(10000) });
    } catch { throw Object.assign(new Error('network'), { code: 'sp_network' }); }
    if (res.status === 401) SP_TOKEN = null;
    if (res.status === 404 || res.status === 400) throw Object.assign(new Error('not found'), { code: 'sp_not_found' });
    if (!res.ok) throw Object.assign(new Error('http'), { code: 'sp_http_' + res.status });
    const j = await res.json().catch(() => null);
    if (!j || !Array.isArray(j.items)) throw Object.assign(new Error('answer'), { code: 'sp_bad_answer' });
    for (const a of j.items) {
      if (!a || !ID22.test(String(a.id || ''))) continue;
      out.push({ id: a.id, name: txt(a.name), kind: ['album', 'single', 'compilation'].includes(a.album_type) ? a.album_type : 'single',
        date: /^\d{4}(-\d{2}(-\d{2})?)?$/.test(String(a.release_date || '')) ? a.release_date : null,
        precision: ['day', 'month', 'year'].includes(a.release_date_precision) ? a.release_date_precision : null, tracks: int(a.total_tracks) });
    }
    if (!j.next) break;
  }
  return out;
}
async function storeReleases(env, userId, list, now, firstTime) {
  const known = new Set((await env.DB.prepare('SELECT release_id FROM spotify_releases WHERE user_id = ?1').bind(userId).all()).results.map((r) => r.release_id));
  let fresh = 0;
  for (const r of list) {
    if (!known.has(r.id)) fresh++;
    await env.DB.prepare(`INSERT INTO spotify_releases (user_id, release_id, name, kind, release_date, date_precision, total_tracks, first_seen_at)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8) ON CONFLICT(user_id, release_id) DO UPDATE SET name = excluded.name, kind = excluded.kind,
      release_date = COALESCE(excluded.release_date, release_date), date_precision = COALESCE(excluded.date_precision, date_precision),
      total_tracks = COALESCE(excluded.total_tracks, total_tracks)`).bind(userId, r.id, r.name, r.kind, r.date, r.precision, r.tracks, now).run();
  }
  return firstTime ? 0 : fresh;
}
export async function syncReleases(env, userId, artistId, now = Date.now()) {
  if (!spotifyApiOn(env)) return { releases: 'off' };
  const before = await syncRow(env, userId);
  try {
    const list = await fetchReleases(env, artistId, now);
    const fresh = await storeReleases(env, userId, list, now, !before || !before.releases_at);
    await setSync(env, userId, { artist_id: artistId, releases_at: now, releases_error: null, ...(fresh ? { tracks_due: 1 } : {}) });
    return { releases: 'ok', count: list.length, fresh };
  } catch (e) {
    await setSync(env, userId, { artist_id: artistId, releases_error: e.code || 'error' });
    return { releases: 'error', error: e.code || 'error' };
  }
}

// ---- 2. the robot -------------------------------------------------------------------------------------------------------
export async function apifyRun(env, urls) {
  const q = new URLSearchParams({ timeout: String(RUN_WAIT_S), maxTotalChargeUsd: (Math.max(1, urls.length) * 0.01).toFixed(2) });
  let res;
  try {
    res = await fetch(APIFY_URL + '?' + q, { method: 'POST', signal: AbortSignal.timeout((RUN_WAIT_S + 8) * 1000),
      headers: { Authorization: 'Bearer ' + env.APIFY_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: urls.map((url) => ({ url })), followAlbums: false, followSingles: false }) });
  } catch { return { error: 'network' }; }
  if (res.status === 408) return { error: 'timeout' };
  if (res.status === 401 || res.status === 403) return { error: 'auth' };
  if (res.status === 402) return { error: 'credits' };
  if (!res.ok) return { error: 'http_' + res.status };
  const items = await res.json().catch(() => null);
  return Array.isArray(items) ? { items } : { error: 'bad_answer' };
}
async function robotResult(env, ok, error, now) {
  const r = (await env.DB.prepare("SELECT fails, alerted_at FROM robot_state WHERE name = 'apify_spotify'").first()) || { fails: 0, alerted_at: null };
  if (ok) {
    await env.DB.prepare(`INSERT INTO robot_state (name, fails, last_error, last_ok_at) VALUES ('apify_spotify', 0, NULL, ?1)
      ON CONFLICT(name) DO UPDATE SET fails = 0, last_error = NULL, last_ok_at = ?1`).bind(now).run();
    return;
  }
  const fails = (r.fails || 0) + 1, alert = fails >= 2 && (!r.alerted_at || r.alerted_at < now - 864e5);
  await env.DB.prepare(`INSERT INTO robot_state (name, fails, last_error, alerted_at) VALUES ('apify_spotify', ?1, ?2, ?3)
    ON CONFLICT(name) DO UPDATE SET fails = ?1, last_error = ?2, alerted_at = COALESCE(?3, alerted_at)`).bind(fails, error, alert ? now : null).run();
  if (alert) await notifyOwner(env, { title: '⚠️ Stalak : le relevé Spotify a raté ' + fails + ' fois de suite',
    message: 'Le robot Apify (' + APIFY_ACTOR + ') ne répond plus comme prévu (' + error + '). Les artistes voient « chiffres pas mis à jour cette semaine ». À vérifier dans la console Apify.' }).catch(() => {});
}

// one artist item → the figures, or null when the answer is not what the test showed (nothing is then overwritten)
export function artistFigures(it) {
  if (!it || typeof it !== 'object') return null;
  const listeners = int(it.monthlyListeners), followers = int(it.followers);
  if (listeners === null && followers === null) return null;
  const cities = (Array.isArray(it.topCities) ? it.topCities : []).slice(0, 5).map((c) => ({ city: txt(c && c.city, 60), country: txt(c && c.country, 4), listeners: int(c && c.numberOfListeners) }))
    .filter((c) => c.city && c.listeners !== null);
  return { listeners, followers, rank: int(it.worldRank), cities };
}

// The weekly artist run: the artists without this week's figures (and not failed in the last 20 h), up to 10 in one run
export async function spotifyWeekly(env, now = Date.now(), { only = null } = {}) {
  const week = isoWeek(now);
  const { results } = await env.DB.prepare(`SELECT p.user_id, p.spotify_url, s.artist_try_at, s.artist_fails, s.releases_at
      FROM artist_profiles p LEFT JOIN spotify_sync s ON s.user_id = p.user_id
      WHERE p.spotify_url LIKE 'https://open.spotify.com/%' ${only ? 'AND p.user_id = ?2' : ''}
        AND NOT EXISTS (SELECT 1 FROM spotify_snapshots n WHERE n.user_id = p.user_id AND n.week = ?1)
      ORDER BY COALESCE(s.artist_try_at, 0) LIMIT 50`).bind(week, ...(only ? [only] : [])).all();
  const todo = results.map((r) => ({ ...r, artistId: spotifyArtistId(r.spotify_url) }))
    .filter((r) => r.artistId && (only || !r.artist_try_at || r.artist_try_at < now - RETRY_AFTER)).slice(0, ARTISTS_PER_RUN);
  const out = { spotify: 'ok', artists: 0, failed: 0 };
  // the releases first (official API, free), at most once a week per artist
  for (const r of todo) if (!r.releases_at || r.releases_at < now - 6 * 864e5 || only) await syncReleases(env, r.user_id, r.artistId, now);
  if (!todo.length) return { ...out, spotify: 'none' };
  if (!apifyOn(env)) return { ...out, spotify: 'off' };
  const run = await apifyRun(env, todo.map((r) => 'https://open.spotify.com/artist/' + r.artistId));
  const byId = new Map();
  for (const it of run.items || []) if (it && ID22.test(String(it.id || ''))) byId.set(it.id, it);
  let anyOk = false;
  for (const r of todo) {
    const f = run.error ? null : artistFigures(byId.get(r.artistId));
    if (!f) {
      out.failed++;
      await setSync(env, r.user_id, { artist_id: r.artistId, artist_try_at: now, artist_error: run.error || 'no_data', artist_fails: (r.artist_fails || 0) + 1 });
      continue;
    }
    anyOk = true; out.artists++;
    await env.DB.prepare(`INSERT OR REPLACE INTO spotify_snapshots (user_id, week, fetched_at, monthly_listeners, followers, world_rank, top_cities)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`).bind(r.user_id, week, now, f.listeners, f.followers, f.rank, JSON.stringify(f.cities)).run();
    await setSync(env, r.user_id, { artist_id: r.artistId, artist_at: now, artist_try_at: now, artist_error: null, artist_fails: 0 });
  }
  await robotResult(env, anyOk, run.error || (anyOk ? null : 'no_data'), now);
  if (run.error) out.spotify = run.error;
  // then the songs of those due (monthly, or a new release), one artist per run
  out.tracks = await spotifyTracks(env, now, { only });
  return out;
}

// The songs run: the releases of one artist (newest 20), their songs' plays. Due once a month, or at a new release.
export async function spotifyTracks(env, now = Date.now(), { only = null } = {}) {
  if (!apifyOn(env)) return 'off';
  const m = month(now);
  const r = await env.DB.prepare(`SELECT s.user_id, s.tracks_try_at FROM spotify_sync s
      WHERE (s.tracks_month IS NULL OR s.tracks_month <> ?1 OR s.tracks_due = 1) ${only ? 'AND s.user_id = ?2' : 'AND (s.tracks_try_at IS NULL OR s.tracks_try_at < ?2)'}
        AND EXISTS (SELECT 1 FROM spotify_releases x WHERE x.user_id = s.user_id)
      ORDER BY COALESCE(s.tracks_try_at, 0) LIMIT 1`).bind(m, only || now - RETRY_AFTER).first();
  if (!r) return 'none';
  const { results: rel } = await env.DB.prepare(`SELECT release_id FROM spotify_releases WHERE user_id = ?1
      ORDER BY COALESCE(release_date, '') DESC LIMIT ?2`).bind(r.user_id, RELEASES_PER_RUN).all();
  const run = await apifyRun(env, rel.map((x) => 'https://open.spotify.com/album/' + x.release_id));
  const songs = [];
  for (const it of run.items || []) {
    if (!it || !ID22.test(String(it.id || '')) || !Array.isArray(it.tracks)) continue;
    for (const t of it.tracks) {
      const n = int(t && t.streamCount);
      if (t && ID22.test(String(t.id || '')) && n !== null) songs.push({ id: t.id, release: it.id, name: txt(t.name), n });
    }
  }
  if (run.error || !songs.length) {
    await setSync(env, r.user_id, { tracks_try_at: now, tracks_error: run.error || 'no_data' });
    await robotResult(env, false, run.error || 'no_data', now);
    return run.error || 'no_data';
  }
  for (const s of songs) await env.DB.prepare(`INSERT OR REPLACE INTO spotify_track_counts (user_id, month, track_id, release_id, name, stream_count, fetched_at)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`).bind(r.user_id, m, s.id, s.release, s.name, s.n, now).run();
  await setSync(env, r.user_id, { tracks_month: m, tracks_try_at: now, tracks_error: null, tracks_due: 0 });
  await robotResult(env, true, null, now);
  return 'ok';
}

// a new Spotify link in the profile: its releases and its figures at once (the « Stats » loading screen), in the background
export async function spotifyNow(env, userId, now = Date.now()) {
  return spotifyWeekly(env, now, { only: userId });
}
