# Les compteurs du tableau de bord (où les lire dans la base)

> Tenu par 3. Comptes. Mis à jour le 7/11/2026 (rapport chiffres du 7/11, pistes 1, 2, 5 et 8).
> Tous ces compteurs sont des **totaux anonymes par jour** (table `daily_counts` : `day`, `name`, `n`), sauf mention contraire.
> Aucun n'est relié à une personne, un compte ou un numéro de visite.

## Visites
| Nom | Ce que c'est |
|---|---|
| table `visits` | une ligne par page ouverte et par jour (numéro au hasard, langue, pays, appareil, `?ref=`) ; 90 jours |
| `vs:<source>:<pays>` | **7/11** : une nouvelle visite, par provenance et pays (Cloudflare ; `XX` = inconnu) |
| `fs:visit:<source>` | **7/11** : la même visite, 1ʳᵉ étape de l'entonnoir par source |

`<source>` : `tiktok`, `ig` (Instagram), `yt` (YouTube), `google`, `discord`, `triller`, `x`, `reddit`, `facebook`, `bing`,
`ref:<code>` (un `?ref=` / `utm_source` qui n'est pas une plateforme connue), `site:<domaine>` (site d'origine), `direct`.
Calculée par la page (`src/app.js` `VISIT_SRC`) à partir de `?ref=`, puis `utm_source`, puis du site d'origine ; gardée
seulement le temps de l'onglet (`sessionStorage` « stalak:vsrc »). Un `?ref=` qui contient le nom d'une plateforme
(`seo-triller`, `ytshort`…) compte pour cette plateforme.

## Entonnoir
| Nom | Ce que c'est |
|---|---|
| `ev_export_start`, `ev_export_ok`, `ev_export_fail`, `ev_export_fail_<raison>` | exports lancés, réussis, ratés (raison) |
| `ev_pro_offer` | offre Pro vue après la 1ʳᵉ vidéo |
| `ev_plans_open`, `ev_plans_why_<raison>` | page des formules ouverte, et pourquoi : une fonction Pro (`filters`, `clip`, `fx`, `text`, `lyrics`, `pack`, `cloud`, `human`, `wm`) ou, **13/11**, d'où vient la personne sans fonction précise : `menu` (menu du compte ou bouton Pro en haut), `account` (page Mon compte), `pricing` (page Tarifs, « Choose Pro »), `link` (lien `#pro`) ; `other` = le reste (retour en arrière…) |
| `ev_clip_ask_pro` / `_reel` / `_none` | **7/11** : réponse à la question « Clip sans Pro » (Pro / TikTok-Reels / Annuler). `ev_plans_why_clip` ne compte que ceux qui ont choisi « Pro » ici : c'est pourquoi il est tombé à 0 après le 7/11 |
| `ev_clip_open` | **13/11** : le mode Clip choisi (une fois par page) ; envoyé par l'app à partir de la branche App qui l'ajoute |
| `ev_checkout_open` | fenêtre de paiement Paddle ouverte |
| `ev_checkout_done` | **7/11** : la fenêtre a fini par un achat (vu par la page) |
| `ev_checkout_close_start` / `_details` / `_payment` | **7/11** : fenêtre fermée **sans acheter** : tout de suite / après l'e-mail (et le pays) / en payant (carte remplie ou paiement essayé) |
| `fs:<étape>:<source>` | **7/11** : `export_ok`, `plans_open`, `checkout_open`, `checkout_done` par provenance |
| `paid_first` | 1ᵉʳ paiement (vu par le serveur, webhook Paddle) |
| `ios_<étape>` | la même étape sur iPhone / iPad |
| `ev_ad_*` | anciens évènements pub (plus affichés depuis le 6/11) |

À savoir : `fs:checkout_done` vient de la page (un bloqueur peut l'empêcher) ; le vrai nombre d'achats reste `paid_first`.

## Autres
| Nom | Ce que c'est |
|---|---|
| `src_eu:<source>` | provenance des comptes créés en Europe, anonyme (branche `compte/provenance-ue`, en attente) |
| table `hourly_counts` | exports par heure (UTC) ; 90 jours |
| table `video_counts` | vidéos par numéro de visite et par jour (« vidéos par personne ») ; 90 jours |
| table `email_optins` | **7/11** : e-mails donnés librement à la fin d'une vidéo, avec accord ; pas un compteur (voir BACKEND 15.7) |
| `code_mail`, `help_q`, `err_5xx`, `alert` | e-mails de code, questions à l'assistant, erreurs serveur, alertes |

## Lire les chiffres (console D1, lecture seule)
```sql
-- visites par source sur 7 jours
SELECT substr(name, 10) AS source, SUM(n) FROM daily_counts WHERE name LIKE 'fs:visit:%' AND day >= date('now', '-6 days') GROUP BY 1 ORDER BY 2 DESC;
-- fenêtre de paiement fermée sans acheter, par étape
SELECT name, SUM(n) FROM daily_counts WHERE name LIKE 'ev_checkout_close_%' AND day >= date('now', '-6 days') GROUP BY 1;
-- e-mails confirmés
SELECT COUNT(*) FROM email_optins WHERE confirmed_at IS NOT NULL;
```
