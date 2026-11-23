# Version 2 of the 6 « BONNE IDÉE VS MAUVAISE IDÉE » scripts (owner's decisions of 23/11, 11 h 45): 40 to 50 s, Stalak from 29 s,
# no « stalak.app » before Stalak is presented, a « blue cow » hook really screamed, 3 hooks per script. Facts: those verified on 20/11.
import json, os, re, datetime
HERE = os.path.dirname(os.path.abspath(__file__))
OLD = os.path.join(HERE, 'cards', 'videos'); OUT = os.path.join(HERE, 'out'); os.makedirs(OUT, exist_ok=True)
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

CRI = ("Le cri : voix Gemini générée avec la consigne de jeu « screaming, furious, very loud, voice almost cracking » (en français, crié à pleine voix), "
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
V.append(dict(id='bonne-idee-01', num=1, titre='Des robots pour son clip', sujet='ACHETER DES VUES', verdict='MAUVAISE IDÉE', decor="La cuisine de Nadia, le soir.",
  hooks=[("NADIA", "Mon fils a payé des ROBOTS pour regarder son clip !", "ROBOTS",
          "GARDÉ. Personne n'a jamais entendu une mère crier ça. L'image (des robots devant un clip de rap) est absurde, et on reste pour savoir si c'est vrai : c'est vrai, Big Mo le prouve (les vues achetées viennent de faux comptes)."),
         ("NADIA", "T'as acheté des fans qui EXISTENT PAS ?!", "EXISTENT PAS", "Fort, mais on a déjà entendu « faux fans »."),
         ("LIAM", "Dix mille vues et PAS UN SEUL j'aime !", "PAS UN SEUL", "Vrai et drôle, mais c'est un constat : pas de choc.")],
  scenes=[("0:03–0:08", "Étiquettes « LIAM, ALIAS T-CRAZY » et « NADIA, SA MÈRE ». Liam tend son téléphone, fier : « 10 000 vues », le cœur à 0.",
           ["LIAM : « J'étais bloqué à trois cents vues ! C'était en promo ! »"]),
          ("0:08–0:14", "Nadia zoome sur la vidéo.", ["NADIA : « Dix mille vues… et pas un seul j'aime ? »", "LIAM : « Ils sont timides. »"]),
          ("0:14–0:22", "Big Mo entre en marchant, lunettes qui brillent (étiquette « BIG MO »). Sur l'écran : derrière les vues, des profils vides, sans photo. Carte : « FAUX ENGAGEMENT : INTERDIT » (source en petit : TikTok).",
           ["BIG MO : « Des vues achetées, c'est des FAUX COMPTES. Et TikTok l'interdit noir sur blanc. »"])],
  end="LIAM : « Bon… je débranche les robots. »", prochain='UN FEAT À 0 ABONNÉ',
  legende="Il a payé des robots pour regarder son clip 🤖 Bonne idée ou mauvaise idée ? Dis-le en commentaire 👇 #rap #rappeur #promo #vues",
  motsCles=['acheter des vues', 'faux comptes', 'robots', 'promo musique', 'rap', 'snippet', 'playback'],
  sources=["Le faux engagement est interdit par TikTok : « We do not allow fake engagement, such as facilitating the trade or marketing of services » qui gonflent artificiellement l'engagement (« How TikTok counters deceptive behaviour », 9/12/2024, https://newsroom.tiktok.com/en-eu/how-tiktok-counters-deceptive-behaviour).",
           "« Robots » : on dit « faux comptes » dans l'explication (le mot de TikTok) ; « robots » est la façon de parler de Nadia, et les profils vides montrés sont dessinés.",
           "Les 300 et 10 000 vues de Liam sont de la fiction."], extra=6))
V.append(dict(id='bonne-idee-02', num=2, titre='Même sa mère le suit pas', sujet='UN FEAT À 0 ABONNÉ', verdict='BONNE IDÉE', decor="La chambre-studio de Liam, de jour.",
  hooks=[("MAYA", "Il a pris en feat un mec que MÊME SA MÈRE suit pas !", "MÊME SA MÈRE",
          "GARDÉ. Phrase jamais entendue, très visuelle, et elle pose la question qu'on veut vérifier : un feat avec 0 abonné, c'est vraiment nul ? Le verdict surprend (bonne idée)."),
         ("MAYA", "Un feat avec un mec à ZÉRO ABONNÉ ?!", "ZÉRO ABONNÉ", "Clair, mais c'est une phrase « normale »."),
         ("DEUCE", "Zéro abonné, et je suis LA MEILLEURE IDÉE de ta vie !", "LA MEILLEURE IDÉE", "Drôle, mais ça annonce le verdict avant la dispute.")],
  scenes=[("0:03–0:08", "Étiquettes « LIAM, ALIAS T-CRAZY », « DEUCE, SON MANAGER », « MAYA, LA VOISINE ». Liam et Deuce serrés devant le micro du placard.",
           ["LIAM : « Deuce rappe trop bien ! »", "DEUCE : « Le manager est dans la place. »"]),
          ("0:08–0:14", "Maya se lève du lit.", ["MAYA : « Il te faut quelqu'un de connu ! »", "LIAM : « Les gens connus me répondent pas ! »"]),
          ("0:14–0:22", "Big Mo entre en marchant. Carte : « LE NOMBRE D'ABONNÉS NE COMPTE PAS DIRECTEMENT » (source en petit : TikTok). Deux téléphones postent le même son.",
           ["BIG MO : « TikTok l'a écrit : tes abonnés comptent pas directement. Un feat, c'est DEUX VIDÉOS, DEUX CHANCES. »"])],
  end="DEUCE : « Donc je suis une bonne idée ? » MAYA : « Le feat, oui. »", prochain='METTRE 30 HASHTAGS',
  legende="Un feat avec un pote que même sa mère suit pas. Bonne idée ou mauvaise idée ? Dis-le en commentaire 👇 #rap #feat #rappeur #promo",
  motsCles=['feat', 'zéro abonné', 'algorithme TikTok', 'Pour toi', 'promo musique', 'rap', 'snippet'],
  sources=["TikTok, « How TikTok recommends videos #ForYou », 18/06/2020 : « neither follower count nor whether the account has had previous high-performing videos are direct factors in the recommendation system » (https://newsroom.tiktok.com/en-us/how-tiktok-recommends-videos-for-you).",
           "« Deux vidéos, deux chances » : un simple compte (deux comptes postent chacun une vidéo), pas un chiffre d'étude.",
           "« Même sa mère le suit pas » : fiction sur Deuce (0 abonné)."], extra=7))
V.append(dict(id='bonne-idee-03', num=3, titre='Hashtag chaton', sujet='METTRE 30 HASHTAGS', verdict='MAUVAISE IDÉE', decor="Devant l'épicerie « REYES », de jour.",
  hooks=[("DEUCE", "Il a mis HASHTAG CHATON sous son son de rap !", "HASHTAG CHATON",
          "GARDÉ. Une phrase que personne n'a jamais criée : l'image d'un chaton sous un son de rap arrête le pouce, et on veut savoir pourquoi il a fait ça (30 hashtags pour « être trouvé »)."),
         ("DEUCE", "T'as mis TRENTE HASHTAGS sous ton son ?!", "TRENTE HASHTAGS", "La version d'avant : une phrase normale."),
         ("LIAM", "Plus je mets de hashtags, PLUS ON ME TROUVE !", "PLUS ON ME TROUVE", "C'est l'idée de Liam, mais elle ressemble à un conseil qu'on a déjà lu.")],
  scenes=[("0:03–0:08", "Étiquettes « LIAM, ALIAS T-CRAZY » et « DEUCE, SON MANAGER ». La légende de Liam déborde de hashtags (#rap #viral #recette #chaton #foot…).",
           ["LIAM : « Trente hashtags ! Plus j'en mets, plus on me trouve ! »"]),
          ("0:08–0:14", "Deuce fait défiler, de plus en plus inquiet.", ["DEUCE : « Hashtag recette ?! »", "LIAM : « Les gens qui cuisinent écoutent du rap ! »"]),
          ("0:14–0:22", "Big Mo sort de l'épicerie en marchant, un sac de glaçons à la main. Carte : « INSTAGRAM : 5 HASHTAGS MAXIMUM » (source en petit : Instagram, décembre 2025) ; les hashtags après le 5e passent en rouge.",
           ["BIG MO : « Depuis décembre 2025, Instagram en prend CINQ maximum. Et un hashtag dit de quoi parle ta vidéo. »"])],
  end="LIAM : « Bon… j'efface hashtag chaton. »", prochain='QUE SUR SPOTIFY',
  legende="Il a mis #chaton sous son son de rap 🐱 Bonne idée ou mauvaise idée ? Dis-le en commentaire 👇 #rap #rappeur #hashtags #promo",
  motsCles=['hashtags', '5 hashtags Instagram', 'légende', 'promo musique', 'rap', 'snippet'],
  sources=["Instagram limite les hashtags à 5 par publication et par Reel, annoncé le 18/12/2025 par @creators : Social Media Today, 18/12/2025 (https://www.socialmediatoday.com/news/instagram-implements-new-limits-on-hashtag-use/808309/) ; Blog du Modérateur, 19/12/2025 (https://www.blogdumoderateur.com/instagram-limite-hashtags-5-par-publication/).",
           "« Un hashtag dit de quoi parle ta vidéo » : le patron d'Instagram, mai 2025 : « a great way to let people know what a post is about » (même article de Social Media Today)."], extra=6))
V.append(dict(id='bonne-idee-04', num=4, titre='Deux écoutes de sa mère', sujet='QUE SUR SPOTIFY', verdict='MAUVAISE IDÉE', decor="Le toit aménagé, en fin d'après-midi.",
  hooks=[("MAYA", "Trois écoutes sur Spotify… et DEUX C'EST TA MÈRE !", "DEUX C'EST TA MÈRE",
          "GARDÉ. Une vanne qu'on n'a jamais entendue, qui fait mal et fait rire, et qui pose le sujet (que Spotify) : on reste pour savoir ce qu'il aurait dû faire."),
         ("MAYA", "T'as sorti ton son QUE SUR SPOTIFY ?!", "QUE SUR SPOTIFY", "La version d'avant : une phrase normale."),
         ("LIAM", "TikTok c'est pour les danses, moi je suis UN ARTISTE !", "UN ARTISTE", "Une opinion qu'on a souvent entendue.")],
  scenes=[("0:03–0:08", "Étiquettes « LIAM, ALIAS T-CRAZY » et « MAYA, LA VOISINE ». Sur l'écran de Liam : son son, « 3 écoutes ».",
           ["LIAM : « TikTok, c'est pour les danses. Moi, je suis un artiste. »"]),
          ("0:08–0:14", "Maya croise les bras.", ["MAYA : « Un artiste que personne découvre. »", "LIAM : « Ils vont venir ! »"]),
          ("0:14–0:22", "Big Mo arrive en marchant par la porte du toit. Carte : « 84 % » en vert (source en petit : étude Luminate pour TikTok, 2025).",
           ["BIG MO : « Une étude faite pour TikTok : 84 % des sons entrés au Billboard Global 200 en 2024 ont d'abord percé sur TikTok. »"])],
  end="LIAM : « Bon… TikTok, c'est aussi pour les artistes. »", prochain='POSTER LE MÊME REFRAIN',
  legende="3 écoutes sur Spotify, dont 2 de sa mère. Bonne idée ou mauvaise idée ? Dis-le en commentaire 👇 #rap #rappeur #spotify #promo",
  motsCles=['Spotify', 'TikTok', 'découvrir un son', 'promo musique', 'rap', 'snippet'],
  sources=["TikTok et Luminate, « Music Impact Report », 13/02/2025 (données 2024) : « 84% of songs that entered the Billboard Global 200 in 2024 went viral on TikTok first » (https://newsroom.tiktok.com/tiktok-and-luminate-release-latest-music-impact-report?lang=en). Étude commandée par TikTok : Big Mo le dit.",
           "Les 3 écoutes de Liam (dont 2 de sa mère) sont de la fiction."], extra=6))
V.append(dict(id='bonne-idee-05', num=5, titre='Son refrain dans ses rêves', sujet='POSTER LE MÊME REFRAIN', verdict='BONNE IDÉE', decor="La cuisine de Nadia, le matin.",
  hooks=[("NADIA", "J'entends ton refrain même DANS MES RÊVES ! ARRÊTE !", "DANS MES RÊVES",
          "GARDÉ. Une mère qui crie qu'elle rêve du refrain : jamais entendu, et c'est justement la preuve que la répétition marche. On reste pour le verdict, qui surprend (bonne idée)."),
         ("NADIA", "Dix jours que tu postes LE MÊME REFRAIN !", "LE MÊME REFRAIN", "La version d'avant : une phrase normale."),
         ("LIAM", "Je vais poster ce refrain CENT JOURS DE SUITE !", "CENT JOURS", "Fort, mais c'est une menace, pas un choc.")],
  scenes=[("0:03–0:08", "Étiquettes « LIAM, ALIAS T-CRAZY » et « NADIA, SA MÈRE ». Liam se filme devant le frigo, le téléphone contre la boîte de céréales.",
           ["LIAM : « C'est mon meilleur passage ! Dix jours que je le poste ! »"]),
          ("0:08–0:14", "Nadia pose son café.", ["NADIA : « Les gens vont en avoir marre ! »", "LIAM : « Toi, t'es pas mon public. »"]),
          ("0:14–0:22", "Big Mo entre en marchant. Carte : « PLUS ON L'ENTEND EN PASSANT, PLUS ON L'AIME » (source en petit : Szpunar et al., 2004). Trois cases : le même refrain filmé à trois endroits.",
           ["BIG MO : « Des chercheurs l'ont testé : un son entendu en passant, plus on l'entend, plus on l'aime. Change juste la vidéo. »"])],
  end="LIAM : « Maman… tu bouges la tête ! » NADIA : « Pas du tout. »", prochain="20 SECONDES D'INTRO",
  legende="Sa mère entend son refrain dans ses rêves. Bonne idée ou mauvaise idée ? Dis-le en commentaire 👇 #rap #refrain #rappeur #promo",
  motsCles=['refrain', 'poster tous les jours', 'répétition', 'promo musique', 'rap', 'snippet'],
  sources=["Szpunar, Schellenberg et Pliner, « Liking and memory for musical stimuli as a function of exposure », Journal of Experimental Psychology: Learning, Memory, and Cognition, 2004, 30(2), p. 370-381 (https://pubmed.ncbi.nlm.nih.gov/14979811/) : « After incidental listening, liking ratings were higher for music heard more often » ; en écoute attentive, l'effet s'inverse au bout d'un moment, d'où « change juste la vidéo ».",
           "« Change juste la vidéo » : le conseil qu'on en tire, pas un chiffre."], extra=7))
V.append(dict(id='bonne-idee-06', num=6, titre="Endormi avant le premier mot", sujet="20 SECONDES D'INTRO", verdict='MAUVAISE IDÉE', decor="Le terrain de basket grillagé, de jour.",
  hooks=[("DEUCE", "J'ai eu le temps de M'ENDORMIR avant ton premier mot !", "M'ENDORMIR",
          "GARDÉ. Il se réveille en sursaut en le criant : l'image est drôle, jamais entendue, et chacun se demande si son intro est trop longue. Big Mo répond avec un vrai chiffre."),
         ("DEUCE", "VINGT SECONDES avant que tu rappes ?!", "VINGT SECONDES", "La version d'avant : une phrase normale."),
         ("LIAM", "Mon intro dure PLUS LONGTEMPS que mon couplet !", "PLUS LONGTEMPS", "Drôle, mais Liam ne crierait pas ça : c'est lui qui défend l'intro.")],
  scenes=[("0:03–0:08", "Étiquettes « LIAM, ALIAS T-CRAZY » et « DEUCE, SON MANAGER ». La vidéo de Liam tourne : que la prod.",
           ["LIAM : « C'est une intro ! Ça installe l'ambiance ! »"]),
          ("0:08–0:14", "Deuce se frotte les yeux.", ["DEUCE : « Vingt secondes d'ambiance. »", "LIAM : « Les vrais artistes font des intros ! »"]),
          ("0:14–0:22", "Big Mo entre en marchant, un ballon sous le bras. Carte : « 20 S → 5 S », une barre d'intro qui raccourcit (source en petit : Ohio State University, 2017).",
           ["BIG MO : « Au milieu des années 80, les intros des tubes duraient plus de vingt secondes. En 2015, environ cinq. »"])],
  end="LIAM : « Bon… l'intro, je la garde pour l'album. »", prochain='PAYER UNE PLAYLIST',
  legende="Il s'est endormi avant le premier mot du son 😴 Bonne idée ou mauvaise idée ? Dis-le en commentaire 👇 #rap #intro #rappeur #promo",
  motsCles=['intro', 'début de son', 'accroche', 'promo musique', 'rap', 'snippet'],
  sources=["Ohio State University, 4/04/2017, « Has music streaming killed the instrumental intro? » : intros des chansons du top 10 de plus de 20 s en moyenne au milieu des années 80, environ 5 s à la fin de l'étude (1986-2015) ; étude de Hubert Léveillé Gauvin, Musicae Scientiae (https://news.osu.edu/has-music-streaming-killed-the-instrumental-intro/)."], extra=6))

SPOKEN = re.compile(r"«([^»]*)»")
def nwords(s): return len(re.findall(r"[\wÀ-ÿ'’%.-]+", s))
STALAK_W = nwords("Va sur stalak.app, c'est gratuit. Tu choisis ton son, tu te filmes plusieurs fois, tu colles tes paroles. Stalak coupe tes prises sur le rythme, lèvres synchro. Ton snippet est prêt.")
for v in V:
    old = json.load(open(os.path.join(OLD, v['id'] + '.json')))
    who, line, shock, why = v['hooks'][0]
    big = line.replace(shock, '« ' + shock + ' »')
    hk = ["LES 3 HOOKS PROPOSÉS (tu choisis ; règle « vache bleue » du 23/11) :"]
    for i, (w, l, s, r) in enumerate(v['hooks'], 1):
        hk.append("%d. %s (crie) : « %s »%s — %s" % (i, w, l, '  ← celui que je garde' if i == 1 else '', r))
    parts = ["VERSION 3 (23/11, nouvelles règles : 40-50 s, hook « vache bleue », Stalak à 0:29, pas de stalak.app avant) · format « BONNE IDÉE VS MAUVAISE IDÉE », vidéo n° %d. Sujet : %s. Verdict : %s. Même histoire et mêmes faits que la version 2 (vérifiés le 20/11), en plus court." % (v['num'], v['sujet'], v['verdict']),
             RULES, "", "\n".join(hk), "", CRI, "",
             "0:00–0:03 · %s Les personnages déjà en pleine dispute. En haut : %s, et la barre." % (v['decor'], v['sujet']),
             "%s (CRIE, à pleine voix) : « %s » — écrit en très gros dès l'image 0, mot par mot, « %s » en couleur." % (who, line, shock), ""]
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
                hooks=[dict(qui=w_, texte=l_, motChoc=s_, garde=(i == 0), pourquoi=r_) for i, (w_, l_, s_, r_) in enumerate(v['hooks'])],
                script="\n".join(parts), sources=v['sources'], legende=v['legende'], motsCles=v['motsCles'], son=son(v['verdict'], v['extra']),
                duree='environ %d s (estimée sur le texte : %d mots ; cible 40 à 50 s)' % (round(est), w), statut='script', note='', majPar='marketing', majLe=NOW)
    json.dump(card, open(os.path.join(OUT, v['id'] + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(v['id'], v['titre'], '| mots', w, '| ~%d s' % round(est), '| hook:', line)
