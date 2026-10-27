# Publier depuis Stalak sur TikTok et Instagram — ce que le propriétaire crée

> Conversation « Réseaux sociaux ». Mis à jour le 27/10/2026.
> Tu crées les comptes, tu tapes les mots de passe, tu acceptes les conditions. Une fois connecté dans Chrome, Claude peut remplir le reste avec toi.
> Les clés secrètes vont **uniquement** dans Cloudflare → stalak-site → Settings → Variables and Secrets (type **Secret**), jamais dans une conversation.

## Les adresses à recopier (les mêmes partout)

| À quoi ça sert | Adresse |
|---|---|
| Site | `https://stalak.app` |
| Confidentialité | `https://stalak.app/confidentialite` |
| Conditions | `https://stalak.app/conditions` |
| Retour TikTok (« Redirect URI ») | `https://stalak.app/api/connect/tiktok/callback` |
| Retour Instagram (« OAuth redirect URI ») | `https://stalak.app/api/connect/instagram/callback` |
| Instagram : « Deauthorize callback URL » | `https://stalak.app/api/connect/instagram/deauthorize` |
| Instagram : « Data deletion request URL » | `https://stalak.app/api/connect/instagram/data-deletion` |

Ces adresses doivent être recopiées **exactement** (pas de `/` en trop à la fin).

---

## A. TikTok (gratuit)

1. **Compte TikTok de Stalak** : crée-le dans l'appli TikTok (il servira aussi de compte de test).
2. **Compte développeur** : va sur <https://developers.tiktok.com>, clique « Log in », connecte-toi avec ce compte TikTok, accepte les conditions développeur.
3. **Créer l'appli** : « Manage apps » → « Connect an app ». Choisis « Individual » (pas d'entreprise pour l'instant). Remplis :
   - nom : **Stalak** ; icône : le logo carré 1024 × 1024 ; catégorie : *Photo & Video* ;
   - description : « Stalak monte automatiquement tes vidéos de playback sur le rythme et les publie sur ton TikTok. » ;
   - Terms of Service URL et Privacy Policy URL : les adresses du tableau ;
   - plateforme : **Web**, adresse du site `https://stalak.app`.
4. **Vérifier le site** : TikTok demande de prouver que `stalak.app` est à toi (« Verify URL properties »). Choisis la méthode **DNS** : il donne un texte `tiktok-developers-site-verification=…`. Dis-le-moi : je t'indique où le coller dans Cloudflare (DNS → enregistrement TXT). Vérifie aussi le **préfixe** `https://stalak.app/` : il servira à l'envoi des vidéos plus tard.
5. **Ajouter les produits** (« Add products ») :
   - **Login Kit** → Redirect URI : l'adresse « Retour TikTok » du tableau ;
   - **Content Posting API** → coche **Direct Post**.
6. **Permissions** (« Scopes ») : `user.info.basic` et `video.publish`.
7. **Mode test (Sandbox)** : crée un sandbox et ajoute ton compte TikTok (et celui de 99sayso si tu veux) comme « Target users ». Ces comptes pourront relier Stalak avant la validation.
8. **Les clés** : dans « Credentials », tu vois **Client key** et **Client secret**. Mets-les dans Cloudflare (type Secret) :
   - `TIKTOK_CLIENT_KEY` = le Client key ;
   - `TIKTOK_CLIENT_SECRET` = le Client secret.
9. **Plus tard (pas maintenant)** : la demande de validation (« Submit for review ») avec la vidéo de démo que je prépare. Tant que l'appli n'est pas validée, TikTok publie les vidéos **en privé seulement** : c'est normal pendant les tests.

## B. Meta / Instagram (gratuit)

1. **Instagram de Stalak en compte professionnel** : Paramètres → Type de compte et outils → Passer à un compte professionnel → *Créateur* ou *Entreprise*. Seuls ces comptes peuvent publier par l'API (vrai aussi pour les utilisateurs de Stalak).
2. **Compte développeur Meta** : va sur <https://developers.facebook.com>, connecte-toi avec un compte Facebook personnel, clique « Get started ». Meta demande en général de confirmer un numéro de téléphone et d'activer la double authentification.
3. **Créer l'appli** : « My Apps » → « Create app » :
   - nom : **Stalak** ; e-mail de contact : `contact@stalak.app` ;
   - cas d'usage : **« Manage messaging & content on Instagram »** (c'est l'« API Instagram avec connexion Instagram ») ;
   - type d'appli, s'il est demandé : **Business** ; pas de portefeuille business pour l'instant.
4. **Réglages de base** (App settings → Basic) : icône 1024 × 1024, catégorie, Privacy Policy URL, Terms of Service URL, et « User data deletion » → *Data deletion callback URL* = l'adresse « Data deletion request URL » du tableau.
5. **Instagram → API setup with Instagram login** :
   - note l'**Instagram app ID** et l'**Instagram app secret** (attention : ce ne sont **pas** l'App ID et l'App secret de Facebook affichés ailleurs) ;
   - « Set up Instagram business login » → OAuth redirect URI, Deauthorize callback URL, Data deletion request URL : les adresses du tableau.
6. **Testeurs** : App roles → Roles → « Add people » → **Instagram Tester** → le compte Instagram de Stalak (et 99sayso si tu veux). Puis, dans l'appli Instagram de chaque compte : Paramètres → Applis et sites web → **Invitations de testeur** → Accepter.
7. **Les clés** dans Cloudflare (type Secret) :
   - `INSTAGRAM_APP_ID` = l'Instagram app ID ;
   - `INSTAGRAM_APP_SECRET` = l'Instagram app secret.
8. **Plus tard (pas maintenant)** : la validation (« App Review ») pour `instagram_business_basic` et `instagram_business_content_publish`, avec la vidéo de démo. ⚠️ Meta peut demander une **vérification d'entreprise** pour l'accès complet : ça risque d'attendre la LLC prévue (à voir avec la conversation Juridique). En attendant, seuls les comptes testeurs peuvent relier Stalak.

## C. Commun aux deux

1. **`SOCIAL_TOKEN_KEY`** (type Secret dans Cloudflare) : une suite **aléatoire de 40 caractères ou plus**, que tu génères toi-même (par exemple avec le générateur de mots de passe de ton téléphone ou de ton gestionnaire de mots de passe). Elle chiffre les connexions TikTok / Instagram enregistrées en base.
   **Ne la change plus ensuite** : si elle change, chaque personne devra relier ses comptes à nouveau.
2. Mets les mêmes secrets dans l'environnement **Preview** si tu veux tester sur une adresse `…stalak-site.pages.dev`. Attention : TikTok et Instagram ne renvoient que vers les adresses déclarées (stalak.app).
3. **Ce que fait le Chef de projet** (pas toi, pas moi) : lancer `migrations/0005_social_accounts.sql` dans la console D1, **puis** fusionner la branche, et passer `SOCIAL_CONNECT_ENABLED` à `"1"` dans `wrangler.toml` le jour où on teste.

## Récapitulatif des secrets

| Nom | Où le trouver |
|---|---|
| `TIKTOK_CLIENT_KEY` | TikTok for Developers → ton appli → Credentials |
| `TIKTOK_CLIENT_SECRET` | idem |
| `INSTAGRAM_APP_ID` | Meta → ton appli → Instagram → API setup with Instagram login |
| `INSTAGRAM_APP_SECRET` | idem |
| `SOCIAL_TOKEN_KEY` | tu l'inventes (40 caractères aléatoires ou plus) |

## Sources (consultées le 27/10/2026)

- TikTok : [Login Kit for Web](https://developers.tiktok.com/doc/login-kit-web), [jetons d'accès](https://developers.tiktok.com/doc/oauth-user-access-token-management), [infos utilisateur](https://developers.tiktok.com/doc/tiktok-api-v2-get-user-info), [Content Posting API](https://developers.tiktok.com/doc/content-posting-api-get-started).
- Meta : [Business Login for Instagram](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/business-login), [premiers pas](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/get-started), [demande de suppression de données](https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback).
- Les écrans de TikTok et Meta changent souvent : si un nom de bouton diffère, dis-le-moi, on trouve ensemble.
