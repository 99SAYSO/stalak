# Demande du Chef de projet : arriver au « wow » en moins d'une minute (26/11/2026)

Pour : **App** (pilote), **Comptes** (mesure, relance), **Juridique** (relance par e-mail). Validé par le propriétaire le 26/11 à 16 h 16 (« vasy c'est parti on met tout en place »).

Source : un guide d'onboarding envoyé par le propriétaire (« getting users to value fast »), croisé avec Clarity du 26/11 (`docs/audit/clarity-2026-11-26.md`). Exemple vu dans Clarity : un visiteur commence sa 1re prise à 2 min 55 et voit son montage vers 4 min 40.

**Le « wow » de Stalak : voir SON son coupé sur le rythme.** C'est notre évènement d'activation : « première prévisualisation du montage ». Objectif : moins de 60 s après l'arrivée.

**Rappel du propriétaire :** le questionnaire sur le rappeur n'apparaît **que si on appuie sur « Stats »**. Au début, il n'y a que le tuto (`obMaybe` n'est plus appelé : c'est bien comme ça). À vérifier : le tuto fait **3 écrans au plus**, chacun avec un seul message, tous passables.

## App
1. **Le wow avant l'effort.** Juste après le choix du son (et du passage), un aperçu de **10 s : son son monté sur des prises d'exemple** (celles de `demo/example`, coupées sur SON rythme), avec « Maintenant, filme les tiennes ». Le parcours ensuite ne change pas. Maquette au propriétaire avant tout.
2. **Un parcours qu'on peut reprendre.** En revenant après un appel, un retour arrière ou un passage sur une page du site, on retrouve le son, les prises et le montage en cours, et on reprend là où on était (« Reprendre ton snippet ? »). Lié au cas Clarity du 26/11 (`chef-aide-glacon-26-11.md`).
3. **Préparer les autorisations caméra et micro.** Avant la fenêtre d'iOS, un écran Stalak : « On a besoin de ta caméra et de ton micro pour filmer tes prises. Rien n'est envoyé, tout reste sur ton téléphone. » Puis la fenêtre. Si l'utilisateur a refusé : comment réautoriser, avec l'import de vidéos en solution de secours.
4. **Des écrans vides qui guident** : « Montages » vide montre l'exemple et le bouton « Choisir mon son ».
5. **Les évènements d'étape** (pour Comptes, anonymes) : `step_song`, `step_passage`, `step_take1`, `step_take3`, `step_preview` (activation), `step_lyrics`, `step_export_start`, `step_export_ok`, plus la durée depuis l'arrivée pour `step_preview`.

## Comptes
6. **Entonnoir par étape** au tableau de bord : le nombre et la part qui passent chaque étape, sur 7 et 30 jours, iPhone et ordinateur, plus la **durée médiane jusqu'au wow**. L'étape qui perd le plus est mise en évidence.
7. **Relance des projets pas finis** (comptes avec e-mail accepté seulement, une seule fois) : 24 h après des prises sans export, un e-mail précis (« Tes 3 prises t'attendent, ton snippet est à un clic »), avec un lien qui rouvre le projet.

## Juridique
8. Vérifier que la relance (point 7) respecte le consentement aux e-mails et la confidentialité, en FR et en EN.

**Ordre :** 2 (reprendre) et 5-6 (mesure) d'abord ; puis 1 (le wow) et 3 (les autorisations) ; puis 4 et 7. Chaque point : maquette d'abord, puis branche, compte rendu et tests FR/EN, iPhone et ordinateur.
