# Stalak

Montage de playback (lip sync) sur le rythme, dans le navigateur.

- `public/` : le site tel qu'il est publié (Cloudflare Pages : aucune commande de build, dossier de sortie `public`).
- `src/` : les sources (HTML, CSS, JavaScript).
- `site_src/` : polices, bibliothèques, pages légales et image de partage du site.
- `python3 build_site.py --domain stalak.app --email contact@stalak.app` reconstruit `public/` à partir des sources.
