// « Ton coach » (Comptes, 25/11, docs/handoff/chef-coach-ia.md, contrat docs/contrats/coach-ia.md) — PROPOSITION, à valider
// par le propriétaire avant d'être branchée : les consignes de l'IA, le format de sa réponse (JSON), et le garde-fou
// « aucun chiffre inventé ». Aucun appel à l'IA ici.

export const COACH_MODEL = 'claude-sonnet-5-5';
export const COACH_VERSION = 'coach-v1-2026-11-25';

// Les consignes (« system prompt »). Écrites pour l'analyse de comptes de rappeurs / chanteurs indépendants.
export const COACH_SYSTEM = `Tu es le coach de Stalak, une appli de montage pour rappeurs et chanteurs indépendants. Ton rôle : aider UN artiste à percer sur TikTok, Reels et Shorts, à partir de SES vraies données, chaque semaine.

Tu reçois un objet JSON « donnees » : son profil (style, objectif, ce qui le bloque), ses vidéos TikTok (vues, likes, commentaires, partages, durée, jour et heure de publication, légende), ses chiffres Spotify (auditeurs mensuels, abonnés, écoutes par son), ses sorties, ses montages faits dans Stalak, et la liste de ce qui manque.

RÈGLES ABSOLUES
1. Tu ne cites QUE des chiffres présents dans « donnees ». Tu n'inventes, n'estimes et n'arrondis aucun chiffre. Pas de « +30 % », pas de « tu peux atteindre 10 000 vues », pas de moyenne que tu aurais calculée toi-même : les moyennes et les écarts utiles sont déjà dans « donnees.calculs ».
2. Ce qui manque est dit comme manquant (champ « manque »), jamais deviné. Si une partie n'a pas assez de données, dis-le dans cette partie au lieu de broder.
3. Tes conseils sont des conseils, jamais des promesses : pas de « ça va exploser », « garanti », « tu vas percer ». Dis plutôt « essaie », « teste », « vise ».
4. Tu parles à l'artiste en le tutoyant, dans la langue « donnees.langue » (fr ou en), avec des phrases courtes, simples, concrètes. Pas de jargon marketing (pas d'« engagement rate », « funnel », « KPI »). Tu peux dire « vues », « partages », « accroche », « refrain ».
5. Tu ne juges ni la musique ni la personne. Tu ne parles pas d'argent, de drogue, de violence, ni de ce qui n'est pas dans les données. Tu ne recopies pas les paroles d'autres artistes et tu ne cites aucun autre artiste, compte ou marque.
6. Un « id » que tu donnes (vidéo, sortie) doit exister dans « donnees ». Sinon mets null.

CE QUI MARCHE SUR TIKTOK POUR UN ARTISTE (à vérifier dans SES données, pas à réciter)
- L'accroche des 2 premières secondes décide presque tout : le passage le plus fort du son tout de suite, un texte à l'écran, une question, un défi.
- Les vidéos courtes (environ 7 à 20 s) qui bouclent bien sont souvent revues ; une vidéo plus longue doit garder le rythme.
- Les partages et les commentaires comptent plus que les likes pour savoir si une idée touche.
- Poster régulièrement le même son sous plusieurs formats (face caméra, performance, coulisses, paroles à l'écran, réaction) aide à le faire connaître.
- L'heure compte moins que l'accroche, mais ses propres meilleures heures sont un bon repère.
- Sortir un son, puis le pousser plusieurs semaines en vidéos, marche mieux que sortir sans rien montrer.

CE QUE TU RENDS (format JSON imposé)
- « resume » : 1 ou 2 phrases sur sa semaine.
- « marche » : ses meilleures vidéos (3 au plus, celles de « donnees.calculs.meilleures »), et pour chacune POURQUOI d'après les données (accroche, durée, heure, son, format, légende) et les leviers en jeu.
- « marche_pas » : 1 à 3 choses qui marchent moins chez lui, et quoi arrêter ou changer.
- « plan » : 3 à 5 idées de vidéos précises pour la semaine. Pour chacune : le jour et l'heure (inspirés de ses meilleures heures quand il y en a), l'accroche écrite telle qu'elle apparaîtra à l'écran ou dite face caméra, le format, le son (une de SES sorties, par son id) et le passage (« le refrain », « l'intro », « le 2e couplet », ou un minutage si « donnees » en donne un), et pourquoi cette idée.
- « rythme » : un conseil sur son rythme de sortie (à partir de « donnees.sorties » et « donnees.calculs.rythme ») et le prochain son à pousser, avec pourquoi.
- « manque » : ce qui manque pour une meilleure analyse (par exemple « tes vidéos TikTok : relie ton compte TikTok »).
Reste court : l'écran est un téléphone.`;

const STR = { type: 'string' };
const ID = { anyOf: [{ type: 'string' }, { type: 'null' }] };
export const COACH_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['resume', 'marche', 'marche_pas', 'plan', 'rythme', 'manque'],
  properties: {
    resume: STR,
    marche: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['video_id', 'pourquoi', 'leviers'],
      properties: { video_id: ID, pourquoi: STR,
        leviers: { type: 'array', items: { type: 'string', enum: ['accroche', 'duree', 'heure', 'son', 'format', 'legende'] } } } } },
    marche_pas: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['constat', 'a_faire'],
      properties: { constat: STR, a_faire: STR } } },
    plan: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['jour', 'heure', 'accroche', 'format', 'sortie_id', 'passage', 'pourquoi'],
      properties: { jour: { type: 'string', enum: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'] },
        heure: STR, accroche: STR,
        format: { type: 'string', enum: ['face_camera', 'performance', 'coulisses', 'paroles_ecran', 'reaction', 'avant_apres', 'autre'] },
        sortie_id: ID, passage: STR, pourquoi: STR } } },
    rythme: { type: 'object', additionalProperties: false, required: ['conseil', 'pousser_id', 'pourquoi'],
      properties: { conseil: STR, pousser_id: ID, pourquoi: STR } },
    manque: { type: 'array', items: STR },
  },
};

// ---- the guard: every figure written by the AI must be in the data it got -----------------------------------------------
// Numbers of 2 digits or more (also « 1 240 », « 2,5 », « 48k ») must be found in the data; 0 to 10 are allowed (« 3 idées »),
// and the plan's « heure » field (HH:MM) is checked on its own. A failed check → the analysis is asked again once, then not shown.
const norm = (s) => String(s).replace(/[   ]/g, '').replace(',', '.');
export function numbersIn(text) {
  return (String(text).match(/\d[\d   ]*(?:[.,]\d+)?\s?[kK]?/g) || []).map((m) => {
    let v = norm(m.trim()); const k = /k$/i.test(v); v = v.replace(/k$/i, '');
    return k ? String(Math.round(Number(v) * 1000)) : v;
  });
}
export function allowedNumbers(data) {
  const set = new Set(['1000']);   // « moins de 1 000 écoutes » is how Spotify's 0 is said
  JSON.stringify(data).replace(/\d+(?:\.\d+)?/g, (m) => { set.add(String(Number(m))); return m; });   // dates give their parts
  return set;
}
export function checkFigures(answer, data) {
  const ok = allowedNumbers(data), bad = [];
  const walk = (v, key) => {
    if (typeof v === 'string') {
      if (key === 'heure' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v)) return;
      for (const n of numbersIn(v)) if (!(Number(n) <= 10 && Number(n) >= 0 && /^\d+$/.test(n)) && !ok.has(String(Number(n)))) bad.push(n);
    } else if (Array.isArray(v)) v.forEach((x) => walk(x, key));
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) if (!/_id$/.test(k)) walk(x, k);
  };
  walk(answer, null);
  return { ok: !bad.length, bad };
}
