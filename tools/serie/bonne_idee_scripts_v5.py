# Version 2 of the 6 « BONNE IDÉE VS MAUVAISE IDÉE » scripts (owner's decisions of 23/11, 11 h 45): 40 to 50 s, Stalak from 29 s,
# no « stalak.app » before Stalak is presented, a « blue cow » hook really screamed, 3 hooks per script. Facts: those verified on 20/11.
import json, os, re, datetime
HERE = os.path.dirname(os.path.abspath(__file__))
import sys
# usage: python3 tools/serie/bonne_idee_scripts_v5.py <folder of the current cards, saved by ArtifactData> <output folder> (cards 2 to 6; n° 1 keeps the owner's validated hook)
OLD = sys.argv[1]; OUT = sys.argv[2]; os.makedirs(OUT, exist_ok=True)
NOW = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')

RULES = ("Règles de toute la vidéo (mode d'emploi FORMAT_BONNE_IDEE_VS_MAUVAISE_IDEE.md, version du 23/11) : "
         "40 à 50 s. Dès l'image 0, en haut, le sujet en majuscules et dessous la barre « BONNE IDÉE » (vert) · « VS » · « MAUVAISE IDÉE » (rouge), "
         "jusqu'au tampon du verdict, rien d'autre en haut. Les personnages sont déjà là, en pleine dispute. "
         "Le hook est un VRAI cri (voir « Le cri » plus bas), écrit en très gros dès l'image 0, mot par mot, le mot choc en couleur. "
         "Ensuite tout ce qui est dit s'écrit 2 à 4 mots à la fois, avec le nom de celui qui parle. "
         "« stalak.app » n'apparaît NULLE PART avant 0:29 (ni carte, ni coin, ni fin) : Stalak arrive seulement quand Big Mo le présente. "
         "Un seul décor, sans saut de temps ; Big Mo entre en marchant ; un plan toutes les 2 à 4 s. "
         "Le fait de Big Mo est vérifié, sa source écrite en petit sous la carte (liste à la fin). "
         "Écrans de TikTok, d'Instagram ou de Spotify dessinés « à la manière de », sans logos. "
         "Les chiffres de l'histoire (abonnés, écoutes, jours de Liam) sont de la fiction sur les personnages.")

CRI = ("Le cri (règles du 23/11, 12 h 05 et 12 h 15) : le hook montre une galère que TOUS ceux qui postent leurs sons reconnaissent en 1 seconde (« c'est moi ça ») ; le gag propre à nos personnages vient après, dans la dispute. C'est TOUJOURS Liam qui crie, avec un juron. Le juron est dit en entier à l'oral et censuré à l'écran avec une étoile (« P*TAIN », « M*RDE », « CH*ER »). Jamais d'insulte envers une personne, un groupe ou un vrai artiste ; le juron reste dans le hook, le reste de la vidéo garde le ton habituel. "
       "Voix Gemini générée avec la consigne de jeu « screaming, furious, very loud, voice almost cracking » (en français, crié à pleine voix), "
       "puis vérifiée à l'écoute : si ça ne crie pas vraiment, on regénère avant de monter (règle du 23/11 : pas un cri léger). "
       "Pendant le cri, un petit tremblement de l'image et le mot choc qui grossit quand il tombe.")

BRIDGE = ("0:27–0:29 · Le pont, mot pour mot comme dans toutes les vidéos.\n"
          "LIAM : « Mais comment t'as fait ce clip ? »\n"
          "BIG MO : « C'est simple. »")

STALAK = ("0:29–0:42 · Stalak, en 13 secondes : le même passage dans les 6 vidéos (voix de Big Mo enregistrée une seule fois). "
          "C'est le premier moment où Stalak apparaît. Le téléphone de Big Mo montre TES vrais enregistrements d'écran d'iPhone sur stalak.app, "
          "découpés et accélérés, sans rien inventer et sans zoom ; sous le téléphone, la carte façon App Store (logo rond, « Stalak », bouton « Ouvrir ») ; "
          "au-dessus de la tête de Big Mo, l'étape en cours.\n"
          "· « STALAK.APP » : la page d'accueil, puis « Choisis ton son ».\n"
          "BIG MO : « Va sur stalak.app, c'est gratuit. »\n"
          "· « 1 · SON » puis « 2 · PRISES » (« Filmer maintenant »).\n"
          "BIG MO : « Tu choisis ton son, tu te filmes plusieurs fois, »\n"
          "· « 3 · PAROLES » (« Coller mes paroles » ; la transcription auto, marquée PRO, n'est pas choisie).\n"
          "BIG MO : « tu colles tes paroles. »\n"
          "· « 4 · MONTAGE » : le montage qui joue, coupé sur le temps, puis « Ta vidéo est prête ✓ » et ta vraie vidéo finie (export gratuit, avec son filigrane).\n"
          "BIG MO : « Stalak coupe tes prises sur le rythme, lèvres synchro. Ton snippet est prêt. »\n"
          "Rien de Pro présenté comme gratuit. Le passage de 22 s fait le 20/11 est recoupé à 13 s (mêmes images, plus rapides).")

def snippet_line():
    return ("Son snippet est dessiné, calé sur le son, SANS texte en surimpression : pas de « stalak.app » avant 0:29. "
            "Big Mo est une star : son clip est sans filigrane, comme avec Stalak Pro, et rien ne dit que le sien est gratuit "
            "(la vidéo gratuite, avec son vrai filigrane, n'arrive qu'à 0:29 dans la partie Stalak). Si tu préfères, on lui laisse le filigrane, mais alors « stalak.app » se voit 4 s avant.")

def son(verdict, extra):
    vic = "Victoire « Funk Upbeat » juste après le tampon" if verdict == 'BONNE IDÉE' else "un court passage de Galère « Urban Hip Hop » juste après le tampon"
    return ("Musiques Pixabay de l'onglet Univers (sans Content ID), sous les voix : rien pendant le cri (il doit claquer seul), Plan foireux « Sneeze » pendant la dispute, "
            "Hustle « Game Show » à l'arrivée de Big Mo, un coup de tampon (bruitage) au verdict, " + vic + ", Hustle pour son snippet ; "
            "pendant Stalak, le son de tes enregistrements bas sous la voix, un pop à chaque étape. "
            "Voix Gemini sur Flora, une réplique à la fois, jeu réaliste SAUF le cri du début, joué à fond (« screaming, furious, very loud ») et vérifié à l'écoute "
            "(Liam : Fenrir ×1,1 ; Nadia : Pulcherrima ×1,15 ; Deuce : Schedar ×1,25 ; Maya : Despina ×1,15 ; Big Mo : Alnilam ×1,15). "
            "Communes aux 6 vidéos, générées une fois : « Mauvaise idée. » / « Bonne idée. », « Ce qui marche, c'est ça. », le pont et le passage Stalak. "
            "Propres à cette vidéo : %d répliques, environ %s $ (le cri peut être regénéré 1 ou 2 fois, quelques centimes de plus). Rien n'est généré avant ta validation et ton feu vert."
            % (extra, ('%.2f' % (extra * 0.013)).replace('.', ',')))

V = []
V.append(dict(id='bonne-idee-02', num=2, titre='Son seul feat possible', sujet='UN FEAT À 0 ABONNÉ', verdict='BONNE IDÉE', decor="La chambre-studio de Liam, de jour.",
  hooks=[("LIAM", "Putain, personne veut faire UN FEAT avec moi !", "P*TAIN, PERSONNE VEUT FAIRE UN FEAT AVEC MOI !", "UN FEAT",
          "Tous les petits rappeurs ont demandé des feats sans réponse : on se reconnaît en 1 seconde. Le gag (Deuce, le manager à 0 abonné, se propose) arrive juste après."),
         ("LIAM", "Fais chier, cent messages et ZÉRO RÉPONSE !", "FAIS CH*ER, CENT MESSAGES ET ZÉRO RÉPONSE !", "ZÉRO RÉPONSE", "La même galère (les DM pour un feat restés sans réponse), un peu moins claire sur le sujet."),
         ("LIAM", "Merde, mes potes likent MÊME PAS mes sons !", "M*RDE, MES POTES LIKENT MÊME PAS MES SONS !", "MÊME PAS", "Tout le monde la connaît, mais elle colle moins au sujet du feat.")],
  scenes=[("0:03–0:08", "Étiquettes « LIAM, ALIAS T-CRAZY », « DEUCE, SON MANAGER », « MAYA, LA VOISINE ». Deuce s'approche du micro du placard, très sérieux ; Maya assise sur le lit.",
           ["DEUCE : « Moi, je veux ! Le manager est dans la place. »", "MAYA : « Deuce ? Il a zéro abonné ! Même sa mère le suit pas ! »"]),
          ("0:08–0:14", "Liam met un casque sur la tête de Deuce.", ["LIAM : « Il rappe trop bien ! »", "MAYA : « Il te faut quelqu'un de connu ! »"]),
          ("0:14–0:22", "Big Mo entre en marchant. Carte : « LE NOMBRE D'ABONNÉS NE COMPTE PAS DIRECTEMENT » (source en petit : TikTok). Deux téléphones postent le même son.",
           ["BIG MO : « TikTok l'a écrit : tes abonnés comptent pas directement. Un feat, c'est DEUX VIDÉOS, DEUX CHANCES. »"])],
  end="DEUCE : « Donc je suis une bonne idée ? » MAYA : « Le feat, oui. »", prochain='METTRE 30 HASHTAGS',
  legende="Son seul feat possible, c'est son manager à 0 abonné. Bonne idée ou mauvaise idée ? Dis-le en commentaire 👇 #rap #feat #rappeur #promo",
  motsCles=['feat', 'zéro abonné', 'algorithme TikTok', 'Pour toi', 'promo musique', 'rap', 'snippet'],
  sources=["TikTok, « How TikTok recommends videos #ForYou », 18/06/2020 : « neither follower count nor whether the account has had previous high-performing videos are direct factors in the recommendation system » (https://newsroom.tiktok.com/en-us/how-tiktok-recommends-videos-for-you).",
           "« Deux vidéos, deux chances » : un simple compte (deux comptes postent chacun une vidéo), pas un chiffre d'étude.",
           "« Même sa mère le suit pas », les 100 messages : fiction sur les personnages."], extra=7))
V.append(dict(id='bonne-idee-03', num=3, titre='Hashtag chaton', sujet='METTRE 30 HASHTAGS', verdict='MAUVAISE IDÉE', decor="Devant l'épicerie « REYES », de jour.",
  hooks=[("LIAM", "Putain, je poste tous les jours et RIEN !", "P*TAIN, JE POSTE TOUS LES JOURS ET RIEN !", "ET RIEN",
          "La galère de tous ceux qui postent leurs sons : chaque jour, et zéro résultat. Le gag (hashtag chaton sous un son de rap) arrive juste après, quand Deuce lit sa légende."),
         ("LIAM", "C'est quoi cette merde ? L'ALGO M'A OUBLIÉ !", "C'EST QUOI CETTE M*RDE ? L'ALGO M'A OUBLIÉ !", "L'ALGO", "Tout le monde l'a pensé ; un peu moins précis que « tous les jours et rien »."),
         ("LIAM", "Putain, trente hashtags et PERSONNE ME TROUVE !", "P*TAIN, TRENTE HASHTAGS ET PERSONNE ME TROUVE !", "PERSONNE ME TROUVE", "Colle au sujet, mais « trente hashtags » parle moins que la galère elle-même.")],
  scenes=[("0:03–0:08", "Étiquettes « LIAM, ALIAS T-CRAZY » et « DEUCE, SON MANAGER ». Deuce se penche sur l'écran : la légende déborde de hashtags (#rap #viral #recette #chaton #foot…).",
           ["DEUCE : « T'as mis hashtag chaton sous un son de rap ?! »", "LIAM : « Trente hashtags ! Plus j'en mets, plus on me trouve ! »"]),
          ("0:08–0:14", "Deuce fait défiler, de plus en plus inquiet.", ["DEUCE : « Hashtag recette ?! »", "LIAM : « Les gens qui cuisinent écoutent du rap ! »"]),
          ("0:14–0:22", "Big Mo sort de l'épicerie en marchant, un sac de glaçons à la main. Carte : « INSTAGRAM : 5 HASHTAGS MAXIMUM » (source en petit : Instagram, décembre 2025) ; les hashtags après le 5e passent en rouge.",
           ["BIG MO : « Depuis décembre 2025, Instagram en prend CINQ maximum. Et un hashtag dit de quoi parle ta vidéo. »"])],
  end="LIAM : « Bon… j'efface hashtag chaton. »", prochain='QUE SUR SPOTIFY',
  legende="Il a mis #chaton sous son son de rap 🐱 Bonne idée ou mauvaise idée ? Dis-le en commentaire 👇 #rap #rappeur #hashtags #promo",
  motsCles=['hashtags', '5 hashtags Instagram', 'légende', 'promo musique', 'rap', 'snippet'],
  sources=["Instagram limite les hashtags à 5 par publication et par Reel, annoncé le 18/12/2025 par @creators : Social Media Today, 18/12/2025 (https://www.socialmediatoday.com/news/instagram-implements-new-limits-on-hashtag-use/808309/) ; Blog du Modérateur, 19/12/2025 (https://www.blogdumoderateur.com/instagram-limite-hashtags-5-par-publication/).",
           "« Un hashtag dit de quoi parle ta vidéo » : le patron d'Instagram, mai 2025 : « a great way to let people know what a post is about » (même article de Social Media Today)."], extra=6))
V.append(dict(id='bonne-idee-04', num=4, titre='Deux écoutes de sa mère', sujet='QUE SUR SPOTIFY', verdict='MAUVAISE IDÉE', decor="Le toit aménagé, en fin d'après-midi.",
  hooks=[("LIAM", "Putain, trois écoutes… et DEUX C'EST MA MÈRE !", "P*TAIN, TROIS ÉCOUTES… ET DEUX C'EST MA MÈRE !", "DEUX C'EST MA MÈRE",
          "Tous ceux qui sortent un son connaissent les écoutes qui viennent de la famille : on se dit « c'est moi » en 1 seconde, et ça fait rire. Le Chef l'a retenu comme exemple."),
         ("LIAM", "Ma musique pue la merde OU QUOI ? Trois écoutes !", "MA MUSIQUE PUE LA M*RDE OU QUOI ? TROIS ÉCOUTES !", "OU QUOI", "Ton exemple : très fort et très reconnu, mais un peu long à crier (9 mots)."),
         ("LIAM", "Putain, PERSONNE ÉCOUTE mon son !", "P*TAIN, PERSONNE ÉCOUTE MON SON !", "PERSONNE ÉCOUTE", "Le plus universel et le plus court, mais moins drôle.")],
  scenes=[("0:03–0:08", "Étiquettes « LIAM, ALIAS T-CRAZY » et « MAYA, LA VOISINE ». Sur l'écran de Liam : son son, « 3 écoutes ».",
           ["MAYA : « Tu l'as sorti que sur Spotify ? »", "LIAM : « TikTok, c'est pour les danses. Moi, je suis un artiste. »"]),
          ("0:08–0:14", "Maya croise les bras.", ["MAYA : « Un artiste que personne découvre. »", "LIAM : « Ils vont venir ! »"]),
          ("0:14–0:22", "Big Mo arrive en marchant par la porte du toit. Carte : « 84 % » en vert (source en petit : étude Luminate pour TikTok, 2025).",
           ["BIG MO : « Une étude faite pour TikTok : 84 % des sons entrés au Billboard Global 200 en 2024 ont d'abord percé sur TikTok. »"])],
  end="LIAM : « Bon… TikTok, c'est aussi pour les artistes. »", prochain='POSTER LE MÊME REFRAIN',
  legende="3 écoutes sur Spotify, dont 2 de sa mère. Bonne idée ou mauvaise idée ? Dis-le en commentaire 👇 #rap #rappeur #spotify #promo",
  motsCles=['Spotify', 'TikTok', 'découvrir un son', 'promo musique', 'rap', 'snippet'],
  sources=["TikTok et Luminate, « Music Impact Report », 13/02/2025 (données 2024) : « 84% of songs that entered the Billboard Global 200 in 2024 went viral on TikTok first » (https://newsroom.tiktok.com/tiktok-and-luminate-release-latest-music-impact-report?lang=en). Étude commandée par TikTok : Big Mo le dit.",
           "Les 3 écoutes de Liam (dont 2 de sa mère) sont de la fiction."], extra=6))
V.append(dict(id='bonne-idee-05', num=5, titre='Sa mère chante son refrain', sujet='POSTER LE MÊME REFRAIN', verdict='BONNE IDÉE', decor="La cuisine de Nadia, le matin.",
  hooks=[("LIAM", "Merde, deux cents vues… MON SON EST MORT !", "M*RDE, DEUX CENTS VUES… MON SON EST MORT !", "MON SON EST MORT",
          "Tout le monde a cru qu'un son était fini après un post raté. C'est pile le sujet : le reposter (bonne idée). Le gag (sa mère qui a le refrain dans la tête) vient juste après."),
         ("LIAM", "Putain, dix jours que je poste… TOUJOURS RIEN !", "P*TAIN, DIX JOURS QUE JE POSTE… TOUJOURS RIEN !", "TOUJOURS RIEN", "Très reconnu, mais on peut croire que poster tous les jours est la mauvaise idée."),
         ("LIAM", "Putain, l'algo montre mon son À PERSONNE !", "P*TAIN, L'ALGO MONTRE MON SON À PERSONNE !", "À PERSONNE", "Reconnu, mais moins lié au refrain.")],
  scenes=[("0:03–0:08", "Étiquettes « LIAM, ALIAS T-CRAZY » et « NADIA, SA MÈRE ». Nadia sort de la salle de bain, une serviette sur la tête, en fredonnant le refrain, et se fige.",
           ["NADIA : « Mort ? Dix jours que tu postes le même refrain ! Je l'ai dans la tête ! »", "LIAM : « C'est mon meilleur passage ! »"]),
          ("0:08–0:14", "Nadia pose son café.", ["NADIA : « Les gens vont en avoir marre ! »", "LIAM : « Toi, t'es pas mon public. »"]),
          ("0:14–0:22", "Big Mo entre en marchant. Carte : « PLUS ON L'ENTEND EN PASSANT, PLUS ON L'AIME » (source en petit : Szpunar et al., 2004). Trois cases : le même refrain filmé à trois endroits.",
           ["BIG MO : « Des chercheurs l'ont testé : un son entendu en passant, plus on l'entend, plus on l'aime. Change juste la vidéo. »"])],
  end="LIAM : « Maman… tu bouges la tête ! » NADIA : « Pas du tout. »", prochain="20 SECONDES D'INTRO",
  legende="Sa mère chante son refrain sous la douche. Bonne idée ou mauvaise idée de le poster tous les jours ? Dis-le en commentaire 👇 #rap #refrain #rappeur #promo",
  motsCles=['refrain', 'poster tous les jours', 'répétition', 'promo musique', 'rap', 'snippet'],
  sources=["Szpunar, Schellenberg et Pliner, « Liking and memory for musical stimuli as a function of exposure », Journal of Experimental Psychology: Learning, Memory, and Cognition, 2004, 30(2), p. 370-381 (https://pubmed.ncbi.nlm.nih.gov/14979811/) : « After incidental listening, liking ratings were higher for music heard more often » ; en écoute attentive, l'effet s'inverse au bout d'un moment, d'où « change juste la vidéo ».",
           "« Change juste la vidéo » : le conseil qu'on en tire, pas un chiffre."], extra=7))
V.append(dict(id='bonne-idee-06', num=6, titre="Deuce s'est endormi", sujet="20 SECONDES D'INTRO", verdict='MAUVAISE IDÉE', decor="Le terrain de basket grillagé, de jour.",
  hooks=[("LIAM", "Putain, ils swipent AVANT MON PREMIER MOT !", "P*TAIN, ILS SWIPENT AVANT MON PREMIER MOT !", "AVANT MON PREMIER MOT",
          "Tous ceux qui postent un son ont vu les gens partir avant le couplet : le Chef l'a retenu comme exemple. Raccourci à 7 mots pour finir avant 3 s. Le gag (Deuce endormi pendant l'intro) arrive juste après."),
         ("LIAM", "Fais chier, personne entend MON COUPLET !", "FAIS CH*ER, PERSONNE ENTEND MON COUPLET !", "MON COUPLET", "La même galère, un peu moins nette."),
         ("LIAM", "Merde, PERSONNE REGARDE jusqu'au bout !", "M*RDE, PERSONNE REGARDE JUSQU'AU BOUT !", "PERSONNE REGARDE", "Reconnu, mais moins lié à l'intro.")],
  scenes=[("0:03–0:08", "Étiquettes « LIAM, ALIAS T-CRAZY » et « DEUCE, SON MANAGER ». Deuce se réveille en sursaut ; la vidéo de Liam tourne : que la prod.",
           ["DEUCE (qui se réveille) : « Vingt secondes d'ambiance, frérot. »", "LIAM : « C'est une intro ! Ça installe l'ambiance ! »"]),
          ("0:08–0:14", "Deuce se frotte les yeux.", ["DEUCE : « Pendant ton ambiance, j'ai fait une sieste. »", "LIAM : « Les vrais artistes font des intros ! »"]),
          ("0:14–0:22", "Big Mo entre en marchant, un ballon sous le bras. Carte : « 20 S → 5 S », une barre d'intro qui raccourcit (source en petit : Ohio State University, 2017).",
           ["BIG MO : « Au milieu des années 80, les intros des tubes duraient plus de vingt secondes. En 2015, environ cinq. »"])],
  end="LIAM : « Bon… l'intro, je la garde pour l'album. »", prochain='PAYER UNE PLAYLIST',
  legende="Son manager s'est endormi pendant son intro 😴 Bonne idée ou mauvaise idée, 20 secondes avant de rapper ? Dis-le en commentaire 👇 #rap #intro #rappeur #promo",
  motsCles=['intro', 'début de son', 'accroche', 'promo musique', 'rap', 'snippet'],
  sources=["Ohio State University, 4/04/2017, « Has music streaming killed the instrumental intro? » : intros des chansons du top 10 de plus de 20 s en moyenne au milieu des années 80, environ 5 s à la fin de l'étude (1986-2015) ; étude de Hubert Léveillé Gauvin, Musicae Scientiae (https://news.osu.edu/has-music-streaming-killed-the-instrumental-intro/)."], extra=7))

SPOKEN = re.compile(r"«([^»]*)»")
def nwords(s): return len(re.findall(r"[\wÀ-ÿ'’%.-]+", s))
STALAK_W = nwords("Va sur stalak.app, c'est gratuit. Tu choisis ton son, tu te filmes plusieurs fois, tu colles tes paroles. Stalak coupe tes prises sur le rythme, lèvres synchro. Ton snippet est prêt.")
for v in V:
    old = json.load(open(os.path.join(OLD, v['id'] + '.json')))
    who, line, ecran, shock, why = v['hooks'][0]
    big = line.replace(shock, '« ' + shock + ' »')
    hk = ["LES 3 HOOKS PROPOSÉS (tu choisis ; une galère reconnue de tous, règle du 23/11, 12 h 15) :"]
    for i, (w, l, e, s, r) in enumerate(v['hooks'], 1):
        hk.append("%d. %s (crie) : « %s » — à l'écran : « %s »%s — %s" % (i, w, l, e, '  ← mon conseil' if i == 1 else '', r))
    parts = ["VERSION 5 (23/11, 12 h 30 : hook = une galère que tout rappeur sur TikTok reconnaît, crié par Liam avec un juron censuré à l'écran ; 40-50 s, Stalak à 0:29, pas de stalak.app avant) · format « BONNE IDÉE VS MAUVAISE IDÉE », vidéo n° %d. Sujet : %s. Verdict : %s. Même histoire et mêmes faits que la version 2 (vérifiés le 20/11), en plus court." % (v['num'], v['sujet'], v['verdict']),
             RULES, "", "\n".join(hk), "", CRI, ""] + ([v['head'], ""] if v.get('head') else []) + [
             "0:00–0:03 · %s Les personnages déjà en pleine dispute. En haut : %s, et la barre." % (v['decor'], v['sujet']),
             "%s (CRIE, à pleine voix, le juron dit en entier) : « %s » — écrit en très gros dès l'image 0, mot par mot, juron censuré : « %s », « %s » en couleur." % (who, line, ecran, shock), ""]
    story = [line]
    for t, desc, lines in v['scenes']:
        parts += ["%s · %s" % (t, desc)] + lines + [""]
        story += [m.group(1) for l in lines for m in SPOKEN.finditer(l)]
    vv = 'Mauvaise idée.' if v['verdict'] == 'MAUVAISE IDÉE' else 'Bonne idée.'
    parts += ["0:22–0:25 · Le tampon « %s » tombe en plein écran (%s), avec un bruit sourd. La barre du haut s'efface." % (v['verdict'], 'rouge' if v['verdict'] == 'MAUVAISE IDÉE' else 'vert'),
              "BIG MO : « %s »" % vv, "",
              "0:25–0:27 · Big Mo tourne son téléphone : son propre snippet, qui passe d'une prise à l'autre sur le temps, et des commentaires qui arrivent. " + snippet_line(),
              "BIG MO : « Ce qui marche, c'est ça. »", "", BRIDGE, "", STALAK, "",
              "0:42–0:48 · La chute, puis la carte de fin « PROCHAIN SUJET : %s » (sans stalak.app)." % v['prochain'], v['end'], "",
              "Sources vérifiées (20/11, relues le 23/11) :"] + ["- " + s for s in v['sources']]
    story += [m.group(1) for m in SPOKEN.finditer(v['end'])]
    w = sum(nwords(s) for s in story) + 2 + 6 + 6 + STALAK_W   # verdict + « Ce qui marche » + bridge + Stalak
    est = w / 2.7 + 9   # plus: the stamp, the snippet, the end card, the Stalak screens with no words
    card = dict(old)
    card.update(titre=v['titre'], accroche="%s (crie) : « %s » · en haut : %s et la barre BONNE IDÉE VS MAUVAISE IDÉE" % (who, line, v['sujet']),
                hooks=[dict(qui=w_, texte=l_, ecran=e_, motChoc=s_, garde=(i == 0), pourquoi="À l'écran : « " + e_ + " ». " + r_) for i, (w_, l_, e_, s_, r_) in enumerate(v['hooks'])],
                script="\n".join(parts), sources=v['sources'], legende=v['legende'], motsCles=v['motsCles'], son=son(v['verdict'], v['extra']),
                duree='environ %d s (estimée sur le texte : %d mots ; cible 40 à 50 s)' % (round(est), w), statut='script', note='', majPar='marketing', majLe=NOW)
    json.dump(card, open(os.path.join(OUT, v['id'] + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(v['id'], v['titre'], '| mots', w, '| ~%d s' % round(est), '| hook:', line)
