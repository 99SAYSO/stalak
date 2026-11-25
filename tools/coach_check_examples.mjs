// Checks the 2 example analyses of docs/coach-ia/ : the JSON format (COACH_SCHEMA) and « no figure that is not in the data ».
import { readFileSync } from 'node:fs';
import { COACH_SCHEMA, checkFigures } from '../functions/_lib/coach-prompt.js';
function conforms(v, s, path = '$') {
  const errs = [];
  if (s.anyOf) return s.anyOf.some((x) => !conforms(v, x, path).length) ? [] : [path + ': none of anyOf'];
  if (s.type === 'object') {
    if (!v || typeof v !== 'object' || Array.isArray(v)) return [path + ': not an object'];
    for (const k of s.required || []) if (!(k in v)) errs.push(path + '.' + k + ': missing');
    for (const k of Object.keys(v)) if (!s.properties[k]) errs.push(path + '.' + k + ': not allowed'); else errs.push(...conforms(v[k], s.properties[k], path + '.' + k));
  } else if (s.type === 'array') { if (!Array.isArray(v)) return [path + ': not an array']; v.forEach((x, i) => errs.push(...conforms(x, s.items, path + '[' + i + ']'))); }
  else if (s.type === 'string') { if (typeof v !== 'string') errs.push(path + ': not a string'); else if (s.enum && !s.enum.includes(v)) errs.push(path + ': not in enum'); }
  else if (s.type === 'null') { if (v !== null) errs.push(path + ': not null'); }
  return errs;
}
let bad = 0;
for (const n of [1, 2]) {
  const data = JSON.parse(readFileSync(`docs/coach-ia/exemple-${n}-donnees.json`, 'utf8'));
  const out = JSON.parse(readFileSync(`docs/coach-ia/exemple-${n}-analyse.json`, 'utf8'));
  const e = conforms(out, COACH_SCHEMA), f = checkFigures(out, data);
  const ids = new Set([...data.tiktok.videos.map((v) => v.id), ...data.sorties.map((r) => r.id)]);
  const badIds = [...out.marche.map((x) => x.video_id), ...out.plan.map((x) => x.sortie_id), out.rythme.pousser_id].filter((x) => x !== null && !ids.has(x));
  const sizes = out.marche.length <= 3 && out.plan.length >= 3 && out.plan.length <= 5 && out.marche_pas.length >= 1 && out.marche_pas.length <= 3;
  console.log(`exemple ${n}: format ${e.length ? 'FAIL ' + e.join('; ') : 'ok'} · chiffres ${f.ok ? 'ok' : 'FAIL ' + f.bad.join(', ')} · ids ${badIds.length ? 'FAIL ' + badIds : 'ok'} · tailles ${sizes ? 'ok' : 'FAIL'}`);
  if (e.length || !f.ok || badIds.length || !sizes) bad++;
}
process.exit(bad ? 1 : 0);
