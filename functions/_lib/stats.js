// « Stats » (Comptes, 24/11, docs/handoff/chef-stats-analyse.md): GET /api/stats — the free summary (3 sentences from the
// artist's real data) and, for Pro / Creator Plus, the full part. Without them: `pro: null, locked: true` (App shows the
// blurred preview with a padlock; no paid figure is sent to a free account).
// Never a made-up figure: what we do not have is null, and the state says why (no link, not read yet, failed this week).
// Spotify's 0 plays = « fewer than 1,000 »: sent as {streams: null, under1000: true}.
import { getArtist, spotifyArtistId, isoWeek } from './artist.js';
import { planFor } from './entitlements.js';
import { apifyOn, spotifyApiOn } from './spotify.js';

const DAY = 864e5;
const monthKey = (t) => new Date(t).toISOString().slice(0, 7);
const monthsBack = (n, t) => { const d = new Date(t), out = []; for (let i = n - 1; i >= 0; i--) out.push(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - i, 1)).toISOString().slice(0, 7)); return out; };
const dateOf = (r) => (r.release_date && r.date_precision === 'day' ? Date.parse(r.release_date + 'T12:00:00Z') : null);
const nf = (lang) => new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-US');

export async function statsFor(env, user, { lang = 'fr', now = Date.now() } = {}) {
  lang = lang === 'en' ? 'en' : 'fr';
  const [artist, { plan }] = await Promise.all([getArtist(env, user, now), planFor(env, user)]);
  const p = artist.profile, pro = plan === 'pro' || plan === 'creator';
  const links = (p && p.links) || {};
  const artistId = spotifyArtistId(links.spotify);
  // what the analysis needs (Chef's rules: TikTok for everyone, Spotify when already released)
  const missing = [];
  if (!links.tiktok) missing.push('tiktok');
  if (p && p.onPlatforms === true && !links.spotify) missing.push('spotify');

  const db = env.DB;
  const [tt, sync, snaps, rels, tracks] = await Promise.all([
    db.prepare("SELECT 1 AS x FROM social_accounts WHERE user_id = ?1 AND provider = 'tiktok'").bind(user.id).first(),
    db.prepare('SELECT * FROM spotify_sync WHERE user_id = ?1').bind(user.id).first(),
    db.prepare('SELECT week, fetched_at, monthly_listeners, followers, world_rank, top_cities FROM spotify_snapshots WHERE user_id = ?1 ORDER BY week DESC LIMIT 52').bind(user.id).all(),
    db.prepare('SELECT release_id, name, kind, release_date, date_precision, total_tracks FROM spotify_releases WHERE user_id = ?1 ORDER BY COALESCE(release_date, \'\') DESC').bind(user.id).all(),
    db.prepare('SELECT month, track_id, release_id, name, stream_count FROM spotify_track_counts WHERE user_id = ?1 AND month IN (SELECT DISTINCT month FROM spotify_track_counts WHERE user_id = ?1 ORDER BY month DESC LIMIT 2)').bind(user.id).all(),
  ]);
  const snapshots = snaps.results, releases = rels.results, week = isoWeek(now);
  const last = snapshots[0] || null;

  // ---- the state of the Spotify figures, for the screen ----
  let state;
  if (!links.spotify) state = 'no_link';
  else if (!artistId) state = 'not_artist_link';          // a song or short link: « colle le lien de ton profil d'artiste »
  else if (!apifyOn(env)) state = last ? 'stale' : 'off';
  else if (last && last.week === week) state = 'ok';
  else if (sync && sync.artist_error && sync.artist_try_at && (!sync.artist_at || sync.artist_try_at > sync.artist_at)) state = last ? 'stale' : 'failed';
  else state = last ? 'stale' : 'pending';
  const spotify = { state, updatedAt: last ? new Date(last.fetched_at).toISOString() : null, week: last ? last.week : null,
    releasesState: !artistId ? null : !spotifyApiOn(env) ? 'off' : sync && sync.releases_error ? 'failed' : sync && sync.releases_at ? 'ok' : 'pending' };

  // ---- facts ----
  const given = artist.listeners.filter((x) => x.platform === 'spotify');          // what the artist typed (weekly)
  const listeners = last && last.monthly_listeners != null ? { n: last.monthly_listeners, source: 'spotify', week: last.week }
    : given.length ? { n: given[given.length - 1].listeners, source: 'artist', week: given[given.length - 1].week } : null;
  const ago4 = snapshots.find((s) => s.week <= isoWeek(now - 28 * DAY) && s.monthly_listeners != null);
  const change4w = listeners && listeners.source === 'spotify' && ago4 ? listeners.n - ago4.monthly_listeners : null;
  const dated = releases.map((r) => ({ ...r, t: dateOf(r) })).filter((r) => r.t).sort((a, b) => b.t - a.t);
  const lastRelease = dated[0] ? { name: dated[0].name, date: dated[0].release_date, daysAgo: Math.max(0, Math.floor((now - dated[0].t) / DAY)), kind: dated[0].kind } : null;
  const months12 = monthsBack(12, now);
  const byMonth = months12.map((m) => ({ month: m, releases: dated.filter((r) => monthKey(r.t) === m).length,
    songs: dated.filter((r) => monthKey(r.t) === m).reduce((s, r) => s + (r.total_tracks || 1), 0) }));
  const last6 = byMonth.slice(-6), perMonth6 = releases.length ? Math.round(last6.reduce((s, x) => s + x.releases, 0) / 6 * 10) / 10 : null;
  const gaps = dated.slice(0, 6).map((r, i, a) => (i ? Math.round((a[i - 1].t - r.t) / DAY) : null)).filter((x) => x != null);
  const curMonth = tracks.results.length ? tracks.results.reduce((m, x) => (x.month > m ? x.month : m), '') : null;
  const songOf = (x) => ({ id: x.track_id, name: x.name, releaseId: x.release_id, streams: x.stream_count > 0 ? x.stream_count : null, under1000: !(x.stream_count > 0) });
  const songs = tracks.results.filter((x) => x.month === curMonth).map(songOf).sort((a, b) => (b.streams || 0) - (a.streams || 0));
  const prevBy = new Map(tracks.results.filter((x) => x.month !== curMonth).map((x) => [x.track_id, x.stream_count]));
  const cities = last && last.top_cities ? (() => { try { return JSON.parse(last.top_cities); } catch { return []; } })() : [];
  const facts = { listeners, listenersChange4w: change4w, followers: last ? last.followers : null, lastRelease,
    releasesPerMonth6: perMonth6, releaseCount: releases.length, topSong: songs[0] || null, topCity: cities[0] || null, songsMonth: curMonth };

  return {
    plan, pro, missing, ready: !missing.length && !!p,
    spotify, tiktokLinked: !!tt,           // the linked TikTok account: App reads its figures with the TikTok stats route
    summary: { facts, sentences: sentences(facts, spotify, missing, lang) },
    locked: !pro,
    pro: !pro ? null : {
      weeks: snapshots.slice().reverse().map((s) => ({ week: s.week, listeners: s.monthly_listeners, followers: s.followers })),
      given: given.map((x) => ({ week: x.week, listeners: x.listeners })),
      songs: songs.map((s) => ({ ...s, previous: prevBy.has(s.id) ? (prevBy.get(s.id) > 0 ? prevBy.get(s.id) : null) : undefined })),
      releases: dated.slice(0, 30).map((r) => ({ id: r.release_id, name: r.name, kind: r.kind, date: r.release_date, tracks: r.total_tracks })),
      byMonth, rhythm: { daysSinceLast: lastRelease ? lastRelease.daysAgo : null, lastGapDays: gaps[0] ?? null,
        avgGapDays: gaps.length ? Math.round(gaps.reduce((s, x) => s + x, 0) / gaps.length) : null },
      cities,
    },
  };
}

// 3 sentences from what is true; a missing piece is said as missing, never guessed
export function sentences(f, sp, missing, lang) {
  const n = nf(lang).format, fr = lang === 'fr', out = [];
  if (f.listeners) {
    const ch = f.listenersChange4w;
    out.push(fr
      ? `Tu as ${n(f.listeners.n)} auditeurs mensuels sur Spotify${f.listeners.source === 'artist' ? ' (le chiffre que tu as donné)' : ''}${ch ? (ch > 0 ? `, ${n(ch)} de plus qu’il y a 4 semaines` : `, ${n(-ch)} de moins qu’il y a 4 semaines`) : ''}.`
      : `You have ${n(f.listeners.n)} monthly listeners on Spotify${f.listeners.source === 'artist' ? ' (the figure you gave)' : ''}${ch ? (ch > 0 ? `, ${n(ch)} more than 4 weeks ago` : `, ${n(-ch)} fewer than 4 weeks ago`) : ''}.`);
  } else if (sp.state === 'failed' || sp.state === 'stale') out.push(fr ? 'Tes chiffres Spotify n’ont pas pu être mis à jour cette semaine.' : 'Your Spotify figures could not be updated this week.');
  else if (sp.state === 'pending') out.push(fr ? 'On lit tes chiffres Spotify : ils arrivent bientôt.' : 'We are reading your Spotify figures: they are coming soon.');
  else if (missing.includes('spotify') || sp.state === 'no_link') out.push(fr ? 'Ajoute ton lien Spotify pour suivre tes auditeurs.' : 'Add your Spotify link to follow your listeners.');
  else if (sp.state === 'not_artist_link') out.push(fr ? 'Ton lien Spotify n’est pas celui de ton profil d’artiste : colle le lien open.spotify.com/artist/….' : 'Your Spotify link is not your artist profile: paste the open.spotify.com/artist/… link.');
  if (f.lastRelease) {
    const d = f.lastRelease.daysAgo;
    out.push(fr
      ? `Ton dernier son, « ${f.lastRelease.name} », est sorti il y a ${d === 0 ? 'moins d’un jour' : d === 1 ? '1 jour' : d + ' jours'}${f.releasesPerMonth6 != null ? ` ; tu sors en moyenne ${String(f.releasesPerMonth6).replace('.', ',')} son${f.releasesPerMonth6 >= 2 ? 's' : ''} par mois (6 derniers mois)` : ''}.`
      : `Your last song, “${f.lastRelease.name}”, came out ${d === 0 ? 'less than a day ago' : d === 1 ? '1 day ago' : d + ' days ago'}${f.releasesPerMonth6 != null ? `; you release ${f.releasesPerMonth6} song${f.releasesPerMonth6 === 1 ? '' : 's'} a month on average (last 6 months)` : ''}.`);
  }
  if (f.topSong) {
    const s = f.topSong;
    const plays = s.streams ? (fr ? `${n(s.streams)} écoutes` : `${n(s.streams)} plays`) : (fr ? 'moins de 1 000 écoutes' : 'fewer than 1,000 plays');
    out.push(fr ? `Ton son le plus écouté : « ${s.name} » (${plays}).` : `Your most played song: “${s.name}” (${plays}).`);
  } else if (f.topCity && out.length < 3) out.push(fr ? `Ta 1re ville d’écoute : ${f.topCity.city} (${n(f.topCity.listeners)} auditeurs).` : `Your top city: ${f.topCity.city} (${n(f.topCity.listeners)} listeners).`);
  if (missing.includes('tiktok') && out.length < 3) out.push(fr ? 'Ajoute ton lien TikTok pour qu’on analyse aussi tes vidéos.' : 'Add your TikTok link so we can also analyse your videos.');
  return out.slice(0, 3);
}
