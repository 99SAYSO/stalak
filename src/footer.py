"""The footer of Stalak: the ONE source of its content (owner, 01/11), for every page, in French and English:
- the app (/ and /fr/, built by build_site.py from src/markup.html, where <!--FOOTER--> stands for it);
- the Pricing and legal pages, the 6 guides and the Triller page (site_src/, built by build_site.py: their <footer> is replaced);
- the claude.ai version (build.py): a light footer (brand, language, last line), the site's pages do not exist there.

    render(lang, page=None, lite=False, i18n=None) -> the whole <footer>

  page: the address of the static page being built ('/pricing', '/fr/tarifs'…): its « Français / English » are then two links
  to the same page in the other language. None = the app: the FR / EN buttons of the app (the language changes in place, the
  work stays; app.js), and the footer's content is written again in the other language (key i18n, see build_site.py).

Its look: src/footer.css (added to the app's style and to /site.css). Only our own sites are linked (owner's decision):
Stalak's pages and Stalak's Instagram and TikTok accounts.
Marketing & croissance: the 6 guides and the official accounts are listed HERE now (build_site.py reads them from here:
sitemap, schema.org « sameAs »). Written by App & montage, 01/11/2026."""
import html as H
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
ICONS = ROOT / 'site_src' / 'icons'

# Marketing & croissance : comptes officiels de Stalak (adresse complète du profil ; une case vide n'apparaît nulle part)
SOCIAL = {'Instagram': 'https://www.instagram.com/stalak_app/', 'TikTok': 'https://www.tiktok.com/@stalak_app', 'YouTube': 'https://www.youtube.com/@stalak_app'}
SOCIAL = {k: v for k, v in SOCIAL.items() if v}
# Marketing & croissance : les 6 guides par cas d'usage (anglais seulement, sans page française ; décision du 31/10)
GUIDES = [('lip-sync-video-editor', 'Lip-sync video editor'), ('music-video-maker-for-rappers', 'Music video maker for rappers'),
          ('rap-snippet-video', 'Rap snippet video'), ('lip-sync-videos-for-singers', 'Performance videos for singers'),
          ('how-to-make-a-lip-sync-video', 'How to make a lip-sync video'), ('edit-video-to-the-beat', 'Edit video to the beat')]
TXT = {
    'fr': {
        'home': '/fr/', 'tagline': 'Ton playback monté sur le rythme, directement dans ton navigateur.',
        'product': 'Produit', 'legal': 'Légal', 'choices': 'Tes choix',
        'pricing': ('/fr/tarifs', 'Tarifs'), 'triller': ('/fr/alternative-triller', 'Alternative à Triller'),
        'legal_links': [('/fr/conditions', 'Conditions'), ('/fr/remboursement', 'Remboursement'),
                        ('/fr/confidentialite', 'Confidentialité'), ('/fr/mentions-legales', 'Mentions légales')],
        # « Your Privacy Choices »: the name required in the United States, in English in both languages (owner, 01/11)
        'cookies': ('/fr/confidentialite#cookies', 'Gérer les cookies'), 'pc': ('/fr/confidentialite#cookies', 'Your Privacy Choices'),
        'social': 'Stalak sur {n} (@stalak_app)',
    },
    'en': {
        'home': '/', 'tagline': 'Lip-sync videos cut to the beat, right in your browser.',
        'product': 'Product', 'legal': 'Legal', 'choices': 'Your choices',
        'pricing': ('/pricing', 'Pricing'), 'triller': ('/triller-alternative', 'Triller alternative'),
        'legal_links': [('/terms', 'Terms'), ('/refunds', 'Refunds'), ('/privacy', 'Privacy'), ('/legal-notice', 'Legal notice')],
        'cookies': ('/privacy#cookies', 'Cookie settings'), 'pc': ('/privacy#choices', 'Your Privacy Choices'),
        'social': 'Stalak on {n} (@stalak_app)',
    },
}
# the same page in the other language (the guides have no French page: their French is the French home)
PAIRS = [('/fr/', '/'), ('/fr/tarifs', '/pricing'), ('/fr/conditions', '/terms'), ('/fr/remboursement', '/refunds'),
         ('/fr/confidentialite', '/privacy'), ('/fr/mentions-legales', '/legal-notice'), ('/fr/alternative-triller', '/triller-alternative')]
BOTTOM = '© 2026 Stalak · Made by 99Sayso'
FLAG_FR = ('<svg class="flag" viewBox="0 0 3 2" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path fill="#002654" d="M0 0h1v2H0z"/>'
           '<path fill="#fff" d="M1 0h1v2H1z"/><path fill="#ce1126" d="M2 0h1v2H2z"/></svg>')
FLAG_EN = '<svg class="flag" viewBox="0 0 19 10" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><path fill="#fff" d="M0 0h19v10H0z"/><path fill="#b22234" d="M0 0.000h19v0.769H0zM0 1.538h19v0.769H0zM0 3.077h19v0.769H0zM0 4.615h19v0.769H0zM0 6.154h19v0.769H0zM0 7.692h19v0.769H0zM0 9.231h19v0.769H0z"/><path fill="#3c3b6e" d="M0 0h7.6v5.385H0z"/><g fill="#fff"><circle cx="0.63" cy="0.54" r=".27"/><circle cx="1.90" cy="0.54" r=".27"/><circle cx="3.17" cy="0.54" r=".27"/><circle cx="4.44" cy="0.54" r=".27"/><circle cx="5.71" cy="0.54" r=".27"/><circle cx="6.98" cy="0.54" r=".27"/><circle cx="0.63" cy="1.61" r=".27"/><circle cx="1.90" cy="1.61" r=".27"/><circle cx="3.17" cy="1.61" r=".27"/><circle cx="4.44" cy="1.61" r=".27"/><circle cx="5.71" cy="1.61" r=".27"/><circle cx="6.98" cy="1.61" r=".27"/><circle cx="0.63" cy="2.68" r=".27"/><circle cx="1.90" cy="2.68" r=".27"/><circle cx="3.17" cy="2.68" r=".27"/><circle cx="4.44" cy="2.68" r=".27"/><circle cx="5.71" cy="2.68" r=".27"/><circle cx="6.98" cy="2.68" r=".27"/><circle cx="0.63" cy="3.75" r=".27"/><circle cx="1.90" cy="3.75" r=".27"/><circle cx="3.17" cy="3.75" r=".27"/><circle cx="4.44" cy="3.75" r=".27"/><circle cx="5.71" cy="3.75" r=".27"/><circle cx="6.98" cy="3.75" r=".27"/><circle cx="0.63" cy="4.82" r=".27"/><circle cx="1.90" cy="4.82" r=".27"/><circle cx="3.17" cy="4.82" r=".27"/><circle cx="4.44" cy="4.82" r=".27"/><circle cx="5.71" cy="4.82" r=".27"/><circle cx="6.98" cy="4.82" r=".27"/></g></svg>'


def other_page(page, lang):
    """the address of the same page in the other language"""
    for fr, en in PAIRS:
        if page == (fr if lang == 'fr' else en): return en if lang == 'fr' else fr
    return '/' if lang == 'fr' else '/fr/'


def _svg(path, cls):
    t = re.sub(r'<title>.*?</title>', '', path.read_text(encoding='utf-8')).replace('role="img" ', '')
    return t.replace('<svg ', '<svg class="' + cls + '" aria-hidden="true" focusable="false" fill="currentColor" ', 1)


def _a(href, label, extra=''):
    return '<a href="' + H.escape(href) + '"' + extra + '>' + H.escape(label) + '</a>'


def _lang_switch(lang, page):
    """FR / EN: in the app, its buttons (app.js changes the language in place); on a static page, two links"""
    if page is None:
        return ('<div class="langsw" role="group" aria-label="Langue · Language">'
                '<button type="button" data-lang="fr" lang="fr" aria-pressed="' + str(lang == 'fr').lower() + '" title="Français">' + FLAG_FR + '<span>Français</span></button>'
                '<button type="button" data-lang="en" lang="en" aria-pressed="' + str(lang == 'en').lower() + '" title="English">' + FLAG_EN + '<span>English</span></button></div>')
    fr_url, en_url = (page, other_page(page, lang)) if lang == 'fr' else (other_page(page, lang), page)
    return ('<div class="langsw" role="group" aria-label="Langue · Language">'
            '<a href="' + fr_url + '" hreflang="fr" lang="fr"' + (' aria-current="true"' if lang == 'fr' else '') + '>' + FLAG_FR + '<span>Français</span></a>'
            '<a href="' + en_url + '" hreflang="en" lang="en"' + (' aria-current="true"' if lang == 'en' else '') + '>' + FLAG_EN + '<span>English</span></a></div>')


def inner(lang, page=None, lite=False):
    """the footer's content"""
    T = TXT[lang]
    social = '<div class="ft-social">' + ''.join(
        '<a href="' + H.escape(u) + '" rel="me noopener" target="_blank" aria-label="' + H.escape(T['social'].format(n=n)) + '" title="'
        + H.escape(T['social'].format(n=n)) + '">' + _svg(ICONS / 'social' / (n.lower() + '.svg'), 'ft-ico') + '</a>'
        for n, u in SOCIAL.items()) + '</div>'
    brand = ('<div class="ft-col ft-brand"><a class="ft-home" href="' + T['home'] + '">' + _svg(ICONS / 'icon.svg', 'ft-logo')
             + '<span class="ft-name">Stalak</span></a><p class="ft-tag">' + H.escape(T['tagline']) + '</p>' + social + '</div>')
    links = '' if lite else ('<ul class="ft-list"><li>' + _a(T['cookies'][0], T['cookies'][1], ' data-ck') + '</li><li>'
                             + _a(T['pc'][0], T['pc'][1], ' data-pc' + (' lang="en"' if lang == 'fr' else '')) + '</li></ul>')
    choices = '<div class="ft-col"><h2 class="ft-h">' + T['choices'] + '</h2>' + links + _lang_switch(lang, page) + '</div>'
    if lite:   # claude.ai: no pages of the site there
        brand = brand.replace('<a class="ft-home" href="' + T['home'] + '">', '<span class="ft-home">').replace('</span></a><p', '</span></span><p')
        cols = brand + choices
    else:
        en = ' lang="en"' if lang == 'fr' else ''
        product = ('<div class="ft-col"><h2 class="ft-h">' + T['product'] + '</h2><ul class="ft-list"><li>' + _a(*T['pricing']) + '</li>'
                   + ''.join('<li>' + _a('/' + s, n, en) + '</li>' for s, n in GUIDES) + '<li>' + _a(*T['triller']) + '</li></ul></div>')
        legal = ('<div class="ft-col"><h2 class="ft-h">' + T['legal'] + '</h2><ul class="ft-list">'
                 + ''.join('<li>' + _a(u, n) + '</li>' for u, n in T['legal_links']) + '</ul></div>')
        cols = brand + product + legal + choices
    return '<div class="ft-cols' + (' ft-lite' if lite else '') + '">' + cols + '</div><p class="ft-bottom">' + H.escape(BOTTOM) + '</p>'


def render(lang, page=None, lite=False, i18n=None):
    """the whole <footer>; i18n: in the app, the key under which app.js finds the content in the other language"""
    attr = ' data-i18n="' + i18n + '"' if i18n else ''
    return '<footer class="ft" id="siteFoot"><section class="ft-in"' + attr + '>' + inner(lang, page, lite) + '</section></footer>'
