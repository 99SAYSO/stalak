"""The 9 new T-Crazy scripts of the week of 16/11 (written 17/11), as Studio Stalak cards (statut « script »).

python3 tools/serie/episodes/scripts_semaine_16-11.py  ->  <CARDS_OUT or ./cards>/<doc_id>.json, and a summary with the
estimated speech time of each episode. The cards were written to Studio Stalak (collection videos, tcrazy-ep7 to
tcrazy-ep15) with one ArtifactData batch ; Studio stays the reference once the owner edits them.
"""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from estimer_duree import est

OUT = os.environ.get('CARDS_OUT', os.path.join(os.getcwd(), 'cards'))
os.makedirs(OUT, exist_ok=True)
NOW = '2026-11-17T03:45:00Z'

VOICE = {
    'LIAM': 'Liam : Fenrir ×1,1', 'NARRATEUR': 'narrateur : Algieba ×1,35', 'NADIA': 'Nadia : Pulcherrima ×1,15',
    'DEUCE': 'Deuce : Schedar ×1,25', 'MAYA': 'Maya : Despina ×1,15', 'M. REYES': 'M. Reyes : Rasalgethi ×1,2',
    'BIG MO': 'Big Mo : Alnilam ×1,15',
}
ORDER = ['LIAM', 'NARRATEUR', 'NADIA', 'DEUCE', 'MAYA', 'M. REYES', 'BIG MO']

RULES = ("Règles de tout l'épisode : pas de générique. Tout ce qui est dit est écrit à l'écran (carte blanche, nom à côté). "
         "Seule l'accroche s'écrit en grand, mot par mot ; {shouter} est au centre et bien visible dès la première image. "
         "Le bandeau bleu reste jusqu'à la première phrase du narrateur. Chaque changement de lieu ou d'heure a son carton et passe par le noir : "
         "un enfant doit pouvoir suivre. Celui qui arrive entre en marchant et dit bonjour, et il n'y a qu'un décor à la fois. "
         "Les lumières sont réalistes : {lights}. {stalak}, et le clip monté qu'on voit est synchronisé avec la musique. "
         "La fin : Liam se tourne vers celui qui regarde, avec un appel à l'action qui parle de SA galère à lui.")

END = "Carte de fin : stalak.app · « Gratuit, sans téléchargement ni inscription » · « Prochain épisode : {next} »."

SON = ("Musiques Pixabay choisies dans l'onglet Univers (sans Content ID), toujours sous les voix : Plan foireux « Sneeze » (l'accroche), "
       "Galère « Urban Hip Hop » (ton choix du 16/11) quand ça se gâte, Hustle « Game Show » pour le son de Liam pendant les prises et dans le clip monté "
       "(environ 92 BPM, ses lèvres suivent ce rythme), puis Victoire « Funk Upbeat » quand il publie. "
       "Voix Gemini sur Flora, une réplique à la fois ({voices}), pauses raccourcies. "
       "{n} répliques, toutes nouvelles : environ {cost} $ de voix, générées une seule fois, après ta validation et ton feu vert. {decors}")

EPS = []


def ep(**k):
    EPS.append(k)


# ---------------------------------------------------------------------------------------------------------------- A · ÉP. 2
ep(id='tcrazy-ep7', num=7, date='2026-11-18', slot=2, heure='18 h', titre='Les tee-shirts',
   banner="SON POTE A IMPRIMÉ DES TEE-SHIRTS AVEC SA TÊTE", shouter='M. Reyes',
   when="le 18/11 à 18 h, juste après l'épisode 1",
   lights="le soleil de l'après-midi puis sa lumière plus dorée, l'enseigne de l'épicerie et l'écran du téléphone ont leur halo, et l'impression brillante des tee-shirts a ses reflets",
   next="IL FAIT NUIT À 17 H ET IL DEVAIT TOURNER SON CLIP",
   shots=[
       ("0:00–0:02", "La rue pavillonnaire, l'après-midi, devant l'épicerie. M. Reyes au centre, qui tient à bout de bras un tee-shirt blanc : la tête de Liam imprimée dessus, avec « T-CRAZY » en grosses lettres. Derrière lui, une table pliante couverte de tee-shirts et un carton plein ; Deuce derrière la table, Liam à côté, très fier.",
        [("M. REYES", "crie", "Cinquante tee-shirts avec ta tête ?!")], "BANDEAU"),
       ("0:02–0:05", "Liam ajuste sa casquette.",
        [("LIAM", "", "C'est ma collection. Le merch, c'est là qu'est l'argent.")], None),
       ("0:05–0:13", "Le bandeau s'en va. Étiquettes « LIAM, ALIAS T-CRAZY », « DEUCE, SON POTE » et « M. REYES, L'ÉPICIER ».",
        [("NARRATEUR", "", "Voici Liam. 15 ans. Zéro abonné. Et voici Deuce, son pote. Ce matin, il a imprimé cinquante tee-shirts avec la tête de Liam.")], None),
       ("0:13–0:18", "Deuce étale les tee-shirts sur la table, sûr de lui.",
        [("DEUCE", "", "Les grands rappeurs vendent des tee-shirts. Donc on vend des tee-shirts. C'est du business.")], None),
       ("0:18–0:21", "M. Reyes lui rend le tee-shirt et rentre dans sa boutique.",
        [("M. REYES", "", "Pas devant ma vitrine.")], None),
       ("0:21–0:25", "Carton « DEUX HEURES PLUS TARD · LA RUE ». La même rue, la lumière plus dorée. La table a reculé de deux mètres, la pile n'a pas bougé. Liam et Deuce attendent, le menton dans la main ; une feuille morte traverse le trottoir. Musique : Galère.",
        [("NARRATEUR", "", "Deux heures plus tard : zéro tee-shirt vendu.")], None),
       ("0:25–0:31", "Maya arrive en marchant, son téléphone à la main, et dit bonjour. Étiquette « MAYA, LA VOISINE ».",
        [("MAYA", "", "Salut. Vous vendez les tee-shirts de qui ?"), ("LIAM", "", "De moi ! T-Crazy !"), ("MAYA", "", "C'est qui, T-Crazy ?")], None),
       ("0:31–0:37", "Liam, vexé, croise les bras. Deuce lève le doigt : il a une idée.",
        [("DEUCE", "", "Les gens savent pas qui t'es ? Solution : cent tee-shirts de plus.")], None),
       ("0:37–0:45", "Maya s'assoit sur le coffre à glaçons.",
        [("MAYA", "", "Les gens achètent le tee-shirt d'un son qu'ils connaissent. Ton son, tu l'as jamais posté."),
         ("LIAM", "", "Parce qu'une vidéo, ça me prend toute la nuit à monter !")], None),
       ("0:45–0:54", "Maya lui tend son téléphone : l'écran de Stalak, dessiné (le son, les prises, les coupes sur le temps).",
        [("MAYA", "", "Prends Stalak. Tu te filmes trois fois sur ton son, et Stalak monte sur le rythme."),
         ("LIAM", "", "Et ça coûte combien ?"), ("MAYA", "", "Rien. Tu vas sur stalak.app.")], None),
       ("0:54–1:01", "Trois prises devant la table : Liam seul, puis avec Deuce qui danse derrière en agitant un tee-shirt, puis de près. Musique : le son de Liam. Stalak monte le clip : ça passe d'une prise à l'autre sur le temps, sa bouche reste synchro, et le petit logo Stalak de la version gratuite est dans un coin. La mascotte réagit avec son autocollant « hype ».",
        [("NARRATEUR", "", "Stalak monte les trois prises sur le rythme. Et Liam poste son son pour la première fois.")], None),
       ("1:01–1:06", "Liam appuie sur « Publier » : son clip s'affiche dans le fil, dessiné comme sur TikTok, sans logo (le cœur, les commentaires et le partage à droite, « @t.crazy » en bas). Un commentaire d'un inconnu arrive : « Le son est lourd. Il est où, le tee-shirt ? » Musique : Victoire.",
        [("DEUCE", "trop content", "Quelqu'un veut un tee-shirt ! Je l'avais dit !")], None),
       ("1:06–1:13", "Liam se tourne vers celui qui regarde.",
        [("LIAM", "", "Ton son, personne l'a encore entendu ? Filme trois prises, et Stalak monte sur le rythme. Les tee-shirts, après.")], "END"),
   ],
   legende="Son pote a imprimé 50 tee-shirts avec sa tête. Petit problème : personne sait qui c'est 😭 T'as déjà posté ton son, toi ? #rap #rappeur #merch #clip #playback",
   motsCles=['rap', 'rappeur', 'merch', 'tee-shirt', 'promo musique', 'clip', 'playback', 'série animée'],
   decors="Décor déjà fait : la rue pavillonnaire et l'épicerie (l'écran de Stalak et le fil façon TikTok existent aussi) ; à dessiner : la table pliante, les tee-shirts « T-CRAZY » avec la tête de Liam, le carton, la feuille morte.")

# ---------------------------------------------------------------------------------------------------------------- B · ÉP. 3
ep(id='tcrazy-ep8', num=8, date='2026-11-18', slot=3, heure='21 h', titre='Nuit à 17 h',
   banner="IL FAIT NUIT À 17 H ET IL DEVAIT TOURNER SON CLIP", shouter='Liam',
   when="le 18/11 à 21 h",
   lights="c'est le sujet de l'épisode : le ciel bleu nuit, les fenêtres allumées, le halo orange du lampadaire, la lampe blanche du téléphone, la lumière douce de la vitrine et le reflet de l'enseigne sur la doudoune",
   next="IL A PASSÉ LA NUIT SUR SA VIDÉO DE PROMO",
   shots=[
       ("0:00–0:02", "La rue en ville, à la tombée de la nuit : le ciel bleu nuit, les fenêtres qui s'allument, le lampadaire, l'enseigne « REYES » qui brille. Liam au centre, le téléphone tendu vers nous : l'écran affiche « 17:02 ». Derrière lui, Deuce, un téléphone au bout d'une perche à selfie.",
        [("LIAM", "crie", "Il est 17 h et il fait déjà nuit ?!")], "BANDEAU"),
       ("0:02–0:05", "Liam lève les bras au ciel.",
        [("LIAM", "", "Je devais tourner mon clip après les cours !")], None),
       ("0:05–0:12", "Le bandeau s'en va. Étiquettes « LIAM, ALIAS T-CRAZY » et « DEUCE, SON POTE ».",
        [("NARRATEUR", "", "Voici Liam. 15 ans. Zéro abonné. Et Deuce, son pote. En novembre, le soleil se couche vers cinq heures. Et Liam sort des cours à cinq heures.")], None),
       ("0:12–0:17", "Deuce allume la lampe de son téléphone : un halo blanc aveuglant, Liam plisse les yeux. Musique : Galère.",
        [("DEUCE", "", "Pas de soleil ? Pas de problème. J'ai la lampe de mon téléphone.")], None),
       ("0:17–0:22", "PRISE 1, sur l'écran du téléphone : Liam rappe en playback sous la lampe, le visage tout blanc, le fond tout noir. Musique : le son de Liam.",
        [("DEUCE", "", "Prise 1… On dirait un interrogatoire.")], None),
       ("0:22–0:28", "PRISE 2, sous le lampadaire : Liam est tout orange dans le halo, et des papillons de nuit tournent autour de lui.",
        [("NARRATEUR", "", "Prise 2, sous le lampadaire. Liam est tout orange, et les papillons de nuit adorent son son.")], None),
       ("0:28–0:33", "Maya arrive en marchant, son téléphone à la main, et dit bonsoir. Étiquette « MAYA, LA VOISINE ».",
        [("MAYA", "", "Bonsoir. Pourquoi t'es orange ?"), ("LIAM", "", "Je tourne mon clip !")], None),
       ("0:33–0:37", "Maya montre la vitrine de l'épicerie : sa lumière douce éclaire le trottoir.",
        [("MAYA", "", "Mets-toi devant la vitrine. Là, la lumière est belle.")], None),
       ("0:37–0:43", "PRISE 3, devant la vitrine : la lumière est douce, l'enseigne se reflète sur la doudoune de Liam. M. Reyes ouvre la porte de sa boutique. Étiquette « M. REYES, L'ÉPICIER ».",
        [("M. REYES", "", "Bonsoir. Devant ma vitrine, c'est un chewing-gum minimum."), ("LIAM", "", "Un chewing-gum, s'il vous plaît !")], None),
       ("0:43–0:52", "Assis sur le coffre à glaçons, les trois regardent le téléphone de Maya : l'écran de Stalak, dessiné, avec les trois prises et le choix du filtre.",
        [("MAYA", "", "Mets tes trois prises dans Stalak : il les coupe sur le rythme. Et prends le filtre Noir & blanc."),
         ("LIAM", "", "Pourquoi noir et blanc ?"), ("MAYA", "", "Comme ça, on voit plus que t'étais orange.")], None),
       ("0:52–0:59", "Le clip monté, en noir et blanc : ça passe d'une prise à l'autre sur le temps (la lampe, le lampadaire, la vitrine), sa bouche reste synchro, et le petit logo Stalak de la version gratuite est dans un coin. La mascotte réagit avec son autocollant « cool ». Musique : le son de Liam.",
        [("NARRATEUR", "", "En noir et blanc, la lampe, le lampadaire et la vitrine vont ensemble. Ça devient un style.")], None),
       ("0:59–1:04", "Liam publie : son clip dans le fil, dessiné comme sur TikTok, sans logo. Un commentaire d'un inconnu : « L'ambiance de nuit 🔥 ». Musique : Victoire.",
        [("LIAM", "", "Le clip de nuit, c'était voulu."), ("MAYA", "", "Bien sûr.")], None),
       ("1:04–1:12", "Liam se tourne vers celui qui regarde.",
        [("LIAM", "", "Toi aussi, il fait nuit après les cours ? Filme sous la lumière que t'as. Stalak coupe sur le rythme, et le noir et blanc est gratuit.")], "END"),
   ],
   legende="Il fait nuit à 17 h et t'as toujours pas tourné ton clip ? Pareil 🌙 #rap #rappeur #clip #playback #tournage",
   motsCles=['rap', 'rappeur', 'clip de nuit', 'tourner un clip', 'filtre noir et blanc', 'playback', 'série animée'],
   decors="Décor déjà fait : la rue en ville, le soir (version 2) ; à faire : ses lumières (lampadaire, vitrine, enseigne, fenêtres), la lampe du téléphone, les papillons de nuit, la perche à selfie, le choix du filtre dans l'écran de Stalak.")

# ---------------------------------------------------------------------------------------------------------------- C · ÉP. 6
ep(id='tcrazy-ep9', num=9, date='2026-11-19', slot=3, heure='21 h', titre='Le cahier de rap',
   banner="SA MÈRE A LU SES TEXTES DE RAP", shouter='Nadia',
   when="le 19/11 à 21 h, juste après l'épisode GTA 6",
   lights="la lumière bleue de l'aube par la fenêtre et la petite lampe au-dessus de la table, puis la lumière de l'après-midi ; la tasse de café fume, l'écran du téléphone a son halo",
   next="SON POTE S'EST NOMMÉ SON MANAGER",
   shots=[
       ("0:00–0:02", "La cuisine, à l'aube. Nadia au centre, encore en tenue d'infirmière, un cahier ouvert dans les mains. Derrière elle, Liam s'est endormi sur la table, la joue sur son stylo.",
        [("NADIA", "crie", "Tu rappes sur moi ?!")], "BANDEAU"),
       ("0:02–0:06", "Liam se réveille d'un coup.",
        [("LIAM", "", "Maman ! C'est privé, ça ! Rends-moi mon cahier !")], None),
       ("0:06–0:14", "Le bandeau s'en va. Étiquettes « LIAM, ALIAS T-CRAZY » et « NADIA, SA MÈRE ».",
        [("NARRATEUR", "", "Voici Liam. 15 ans. Zéro abonné. Et voici Nadia, sa mère, infirmière de nuit. En rentrant, elle a trouvé son cahier de rap.")], None),
       ("0:14–0:21", "Gros plan sur le cahier : les mots de Liam, écrits à la main, s'affichent pendant que Nadia lit.",
        [("NADIA", "elle lit", "“Ma daronne rentre à six heures, les yeux fatigués. Elle a sauvé des vies, moi j'ai sauvé un couplet.”")], None),
       ("0:21–0:26", "Nadia est touchée, mais elle ne le montre pas. Elle referme le cahier.",
        [("NADIA", "", "C'est… pas mal."), ("LIAM", "", "Pas mal ?! C'est le meilleur couplet de l'année !")], None),
       ("0:26–0:30", "Nadia s'assoit en face de lui, son café à la main. Musique : Galère.",
        [("NADIA", "", "Alors pourquoi personne l'a jamais entendu ?")], None),
       ("0:30–0:36", "Liam lui montre une de ses vidéos, dans un fil dessiné comme sur TikTok : il rappe à toute vitesse, sans les paroles à l'écran, et le seul commentaire dit : « Il dit quoi ? »",
        [("LIAM", "", "Dans mes vidéos, je rappe trop vite. Personne comprend ce que je dis.")], None),
       ("0:36–0:41", "Carton « APRÈS LES COURS · LA CUISINE ». Maya entre en marchant, son téléphone à la main, et dit bonjour. Étiquette « MAYA, LA VOISINE ».",
        [("MAYA", "", "Salut. Ta mère m'a dit que t'avais écrit un truc très beau."), ("LIAM", "", "Elle a dit ça ?!")], None),
       ("0:41–0:51", "Maya s'assoit à la table et lui tend son téléphone : l'écran de Stalak, dessiné. Les paroles de Liam y sont collées ; à chaque tap sur l'écran, une phrase se cale sur le son.",
        [("MAYA", "", "Mets tes paroles à l'écran. Dans Stalak, tu les colles, puis tu tapes en rythme pour les caler sur ton son."),
         ("LIAM", "", "Comme ça, tout le monde lit mon couplet ?"), ("MAYA", "", "Même ceux qui rappent moins vite que toi.")], None),
       ("0:51–0:59", "Le clip monté : trois prises de Liam dans la cuisine (seul, au comptoir, de près). Musique : le son de Liam. Stalak passe d'une prise à l'autre sur le temps, sa bouche reste synchro, et chaque phrase s'affiche en entier quand il la dit : « Elle a sauvé des vies, moi j'ai sauvé un couplet. » Le petit logo Stalak de la version gratuite est dans un coin. La mascotte réagit avec son autocollant « hype ».",
        [("NARRATEUR", "", "Stalak passe d'une prise à l'autre sur le rythme, et chaque phrase s'affiche quand Liam la dit.")], None),
       ("0:59–1:05", "Liam publie. Un commentaire d'un inconnu arrive : « La phrase sur sa mère 😭 ». Nadia entre dans la cuisine, sa tasse à la main. Musique : Victoire.",
        [("NADIA", "", "Bonjour, Maya. Très joli, ton couplet, Liam. Maintenant, la vaisselle.")], None),
       ("1:05–1:13", "Liam se tourne vers celui qui regarde.",
        [("LIAM", "", "T'as écrit des phrases que personne a jamais lues, toi aussi ? Mets-les à l'écran : avec Stalak, tu les cales au tap, gratuitement.")], "END"),
   ],
   legende="Sa mère a lu ses textes de rap. Elle a dit « pas mal ». Venant d'elle, c'est énorme 🥹 #rap #rappeur #paroles #lyrics #clip",
   motsCles=['rap', 'rappeur', 'paroles', 'lyrics', 'texte de rap', 'mettre les paroles sur une vidéo', 'clip', 'série animée'],
   decors="Décor déjà fait : la cuisine (le jour existe, l'aube est à faire en lumière) ; à dessiner : le cahier de rap écrit à la main, l'écran de Stalak avec les paroles collées et le tap.")

# ---------------------------------------------------------------------------------------------------------------- E · ÉP. 8
ep(id='tcrazy-ep10', num=10, date='2026-11-20', slot=2, heure='18 h', titre="L'extrait de 3 h du matin",
   banner="SON EXTRAIT A MARCHÉ, MAIS LE SON N'EST PAS FINI", shouter='Liam',
   when="le 20/11 à 18 h, juste après l'épisode du manager",
   lights="la lumière douce du matin par la fenêtre, le halo de l'écran de l'ordi et du téléphone, le néon bleu glace du studio",
   next="IL A PERDU SA VOIX LA VEILLE DE SON CLIP",
   shots=[
       ("0:00–0:02", "La chambre-studio, le matin. Liam au centre, le téléphone tendu vers nous : sur l'écran, son extrait dans un fil dessiné comme sur TikTok, et des commentaires qui défilent : « Le son en entier stp », « C'est quand, la sortie ? ».",
        [("LIAM", "crie", "Ils veulent le son en entier ?!")], "BANDEAU"),
       ("0:02–0:05", "Liam regarde son ordi, paniqué.",
        [("LIAM", "", "Mais il existe pas, le son en entier !")], None),
       ("0:05–0:13", "Le bandeau s'en va. Étiquette « LIAM, ALIAS T-CRAZY ». Gros plan sur le téléphone : l'extrait, publié à « 3:12 ».",
        [("NARRATEUR", "", "Voici Liam. 15 ans. Hier encore, zéro abonné. Cette nuit, à trois heures du matin, il a posté quinze secondes de son nouveau son.")], None),
       ("0:13–0:18", "Les commentaires continuent d'arriver.",
        [("NARRATEUR", "", "Ce matin, des inconnus réclament la suite. Le problème : Liam n'a écrit que le refrain.")], None),
       ("0:18–0:22", "On frappe : Deuce entre en marchant et dit bonjour. Étiquette « DEUCE, SON MANAGER ».",
        [("DEUCE", "", "Salut, la star. On est en rupture de stock.")], None),
       ("0:22–0:29", "Liam se prend la tête dans les mains. Musique : Galère.",
        [("LIAM", "", "Il me faut une semaine pour finir le son. D'ici là, ils vont m'oublier !"),
         ("DEUCE", "", "Alors tu postes un extrait par jour en attendant. Comme les grands.")], None),
       ("0:29–0:36", "Liam montre son ordi : une appli de montage inventée, sans logo, avec la frise pleine de petits morceaux.",
        [("LIAM", "", "Un extrait par jour ?! Celui-là m'a pris quatre heures de montage ! J'écris quand, moi ?")], None),
       ("0:36–0:41", "Maya entre en marchant, son téléphone à la main, et dit bonjour. Étiquette « MAYA, LA VOISINE ».",
        [("MAYA", "", "Salut. J'ai vu ton extrait. Il est où, le reste ?"), ("LIAM", "", "Toi aussi ?!")], None),
       ("0:41–0:50", "Maya s'assoit sur le matelas et lui tend son téléphone : l'écran de Stalak, dessiné (le refrain, les prises, les coupes sur le temps).",
        [("MAYA", "", "Le montage, laisse Stalak le faire. Tu te filmes trois fois sur ton refrain, et Stalak coupe sur le rythme. Toi, pendant ce temps, tu écris.")], None),
       ("0:50–0:58", "Deuce filme trois prises du refrain dans la chambre. Musique : le son de Liam. Stalak monte l'extrait : ça passe d'une prise à l'autre sur le temps, sa bouche reste synchro, et le petit logo Stalak de la version gratuite est dans un coin. La mascotte réagit avec son autocollant « hype ». À côté, Liam écrit dans son cahier.",
        [("NARRATEUR", "", "Stalak monte l'extrait sur le rythme. Et pendant ce temps-là, Liam écrit enfin son premier couplet.")], None),
       ("0:58–1:04", "Liam publie « Extrait 2 » ; un commentaire arrive : « Encore ! ». Musique : Victoire.",
        [("DEUCE", "", "Et moi, j'ai trouvé le nom de l'album : “Le son en entier”."), ("MAYA", "", "Écris d'abord le son en entier.")], None),
       ("1:04–1:12", "Liam se tourne vers celui qui regarde.",
        [("LIAM", "", "T'as un son pas fini, toi aussi ? Garde tes nuits pour écrire. Tes extraits, Stalak les monte sur le rythme.")], "END"),
   ],
   legende="Il poste un extrait à 3 h du matin. Le matin, tout le monde veut la suite… sauf qu'elle existe pas 😅 #rap #rappeur #snippet #extrait #playback",
   motsCles=['rap', 'rappeur', 'snippet', 'extrait', 'teaser un son', 'promo musique', 'playback', 'série animée'],
   decors="Décor déjà fait : la chambre-studio (de jour) ; l'appli de montage inventée existe (épisode « Le son de l'année ») ; à dessiner : les commentaires qui réclament la suite, l'extrait publié à 3:12.")

# ---------------------------------------------------------------------------------------------------------------- G · ÉP. 9
ep(id='tcrazy-ep11', num=11, date='2026-11-20', slot=3, heure='21 h', titre='La voix perdue',
   banner="IL A PERDU SA VOIX LA VEILLE DE SON CLIP", shouter='Deuce',
   when="le 20/11 à 21 h",
   lights="la lampe du salon et le reflet bleu de la télé, le mug qui fume, puis la lumière dorée de l'après-midi au terrain, avec les reflets du grillage",
   next="IL VOULAIT UN CLIP COMME DANS GTA",
   shots=[
       ("0:00–0:02", "Le salon, le soir. Deuce au centre, son téléphone à la main (sur l'écran : « TOURNAGE DEMAIN 16 H »). Derrière lui, Liam sur le canapé, une écharpe autour du cou, sous le plaid, un mug fumant dans les mains.",
        [("DEUCE", "crie", "T'as plus de voix et on tourne demain ?!")], "BANDEAU"),
       ("0:02–0:05", "Liam essaie de répondre : il n'arrive qu'à chuchoter.",
        [("LIAM", "tout bas, sans voix", "Ça va… je gère…")], None),
       ("0:05–0:12", "Le bandeau s'en va. Étiquettes « LIAM, ALIAS T-CRAZY » et « DEUCE, SON MANAGER ».",
        [("NARRATEUR", "", "Voici Liam. 15 ans. Zéro abonné. Et Deuce, son manager. Hier soir, Liam a rappé dehors, dans le froid, pendant trois heures. Ce matin, plus de voix.")], None),
       ("0:12–0:18", "Nadia entre en marchant, une tasse de thé à la main, et dit bonsoir. Étiquette « NADIA, SA MÈRE ».",
        [("NADIA", "", "Bonsoir, Deuce. Je suis infirmière : pour sa voix, c'est du thé, du repos, et pas un mot jusqu'à demain.")], None),
       ("0:18–0:22", "Liam tape sur son téléphone et montre l'écran : « ET MON CLIP ?! » s'écrit en gros.",
        [("NARRATEUR", "", "Liam ne peut plus parler. Alors il écrit.")], None),
       ("0:22–0:28", "Deuce se lève, très sérieux. Musique : Galère.",
        [("DEUCE", "", "Pas de panique. On annule le tournage, et on fait un communiqué de presse."),
         ("NADIA", "", "Ou alors, vous réfléchissez deux secondes.")], None),
       ("0:28–0:35", "Nadia s'assoit sur l'accoudoir du canapé.",
        [("NADIA", "", "Ton son, il est déjà enregistré. Dans ton clip, tu chantes pas pour de vrai : tu bouges les lèvres dessus."),
         ("DEUCE", "", "Le playback !")], None),
       ("0:35–0:38", "Carton « LE LENDEMAIN, 16 H · LE TERRAIN DE BASKET ». Le terrain grillagé, dans la lumière dorée de l'après-midi. Liam, l'écharpe autour du cou ; Deuce tient le téléphone.",
        [], None),
       ("0:38–0:47", "PRISES 1, 2 et 3 : on voit l'écran du téléphone (« PRISE 1 », point rouge, décompte 3, 2, 1), puis Liam qui bouge les lèvres sur son son, sans un bruit : au panier, sur le banc, puis de près avec l'écharpe. Musique : le son de Liam.",
        [("NARRATEUR", "", "Le son passe dans le téléphone. Et pour la première fois de sa vie, Liam tourne un clip sans dire un mot.")], None),
       ("0:47–0:52", "Maya arrive en marchant, son téléphone à la main, et dit bonjour. Étiquette « MAYA, LA VOISINE ».",
        [("MAYA", "", "Salut. C'est quoi, cette écharpe ?"), ("DEUCE", "", "Il a plus de voix. Mais il a un clip.")], None),
       ("0:52–0:59", "Maya s'assoit sur le banc à côté de Liam et ouvre Stalak sur son téléphone : l'écran de Stalak, dessiné.",
        [("MAYA", "", "Mets tes trois prises dans Stalak. Il les cale sur ton son, et il coupe sur le rythme. Ta bouche reste synchro.")], None),
       ("0:59–1:05", "Le clip monté : ça passe d'une prise à l'autre sur le temps, sa bouche reste synchro avec le son, et le petit logo Stalak de la version gratuite est dans un coin. La mascotte réagit avec son autocollant « cool ».",
        [("NARRATEUR", "", "Même sans voix, sa bouche est synchro. Personne ne devinerait qu'il est malade.")], None),
       ("1:05–1:09", "Liam publie. Un commentaire d'un inconnu : « Le style avec l'écharpe 🔥 ». Liam tape sur son téléphone, en gros : « C'ÉTAIT VOULU. » Musique : Victoire.",
        [("DEUCE", "", "Demain, je lance la mode des écharpes.")], None),
       ("1:09–1:16", "Liam se tourne vers celui qui regarde, et chuchote.",
        [("LIAM", "tout bas", "Toi aussi, t'as plus de voix ? Ton son est déjà enregistré. Filme-toi en playback, et Stalak cale tes prises sur ton son.")], "END"),
   ],
   legende="Plus de voix la veille du tournage. Heureusement, un clip, c'est du playback 🧣 #rap #rappeur #playback #clip #tournage",
   motsCles=['rap', 'rappeur', 'playback', "c'est quoi le playback", 'tourner un clip', 'lip sync', 'série animée'],
   decors="Décors déjà faits : le salon et le terrain grillagé (la caméra de Stalak existe, épisode « L'appli a fermé ») ; à dessiner : l'écharpe, le plaid, le mug, les messages que Liam écrit en gros sur son téléphone. La voix de Liam est chuchotée sur ses deux répliques.")

# ---------------------------------------------------------------------------------------------------------------- F · ÉP. 11
ep(id='tcrazy-ep12', num=12, date='2026-11-21', slot=2, heure='18 h', titre='Le clash au terrain',
   banner="IL A CLASHÉ LE RAPPEUR LE PLUS CONNU DU QUARTIER", shouter='Big Mo',
   stalak="Exceptionnellement, Stalak arrive vers le milieu, parce que l'histoire, c'est le secret de Big Mo",
   when="le 21/11 à 18 h, juste après « Le clip façon GTA », dont la carte de fin annonce déjà « LE CLASH AU TERRAIN » : elle reste juste",
   extra="Creator Plus est nommé, avec ce qu'il fait vraiment (la page Tarifs : packs de 5 à 30 vidéos aux coupes différentes, à partir de 2 playbacks). Liam, lui, part sur la version gratuite.",
   lights="le soleil bas de fin de journée et sa lumière dorée, les reflets sur les lunettes noires de Big Mo et sur le grillage, le halo des écrans de téléphone",
   next="IL A ÉCRIT “RAPPEUR” SUR SA FICHE D'ORIENTATION",
   shots=[
       ("0:00–0:02", "Le terrain de basket grillagé, en fin de journée. Big Mo au centre, lunettes noires, qui pointe le doigt vers Liam. Derrière, Deuce et Maya assis sur le banc.",
        [("BIG MO", "crie", "T'as zéro abonné et tu me clashes ?!")], "BANDEAU"),
       ("0:02–0:07", "Liam lève le menton et rappe son clash, sans musique.",
        [("LIAM", "", "Big Mo, tes clips, c'est tous les jours la même chose. Moi, j'en fais un par an, mais c'est grandiose !")], None),
       ("0:07–0:15", "Le bandeau s'en va. Étiquettes « LIAM, ALIAS T-CRAZY » et « BIG MO, LE RAPPEUR DU QUARTIER ».",
        [("NARRATEUR", "", "Voici Liam. 15 ans. Zéro abonné. Et voici Big Mo, le rappeur le plus connu du quartier : cinquante mille abonnés.")], None),
       ("0:15–0:20", "Big Mo rit, pose son téléphone sur le banc pour remettre ses lunettes, puis repart en marchant… sans son téléphone.",
        [("BIG MO", "", "Un par an ? Moi, c'est un par jour, le petit. Salut.")], None),
       ("0:20–0:25", "Liam, dégoûté, se tourne vers le banc. Étiquettes « DEUCE, SON MANAGER » et « MAYA, LA VOISINE ». Musique : Galère.",
        [("LIAM", "", "Un clip par jour ?! Moi, un clip, ça me prend tout un week-end !")], None),
       ("0:25–0:31", "Deuce réfléchit, très sérieux.",
        [("DEUCE", "", "Facile : il a une équipe de vingt personnes. Ou un clone.")], None),
       ("0:31–0:38", "Maya fait défiler les vidéos de Big Mo sur son téléphone : des dizaines de cases, et dans chacune on reconnaît le décor (le terrain, la rue, l'épicerie).",
        [("MAYA", "", "Regarde : c'est toujours les deux mêmes prises. Mais chaque jour, le montage change.")], None),
       ("0:38–0:46", "Sur le banc, le téléphone oublié de Big Mo s'allume. Liam le retourne : l'écran de Stalak, dessiné, avec deux prises et « Pack : 30 vidéos ». La mascotte réagit avec son autocollant « choc ».",
        [("LIAM", "", "Big Mo utilise Stalak ?!"),
         ("NARRATEUR", "", "Big Mo a Creator Plus : à partir de deux prises, Stalak lui fait un pack de cinq à trente vidéos, chacune coupée différemment.")], None),
       ("0:46–0:50", "Big Mo revient en marchant, récupère son téléphone et baisse ses lunettes.",
        [("BIG MO", "", "Mon téléphone. Et pas un mot, le petit.")], None),
       ("0:50–0:56", "Big Mo repart. Liam se tourne vers Maya.",
        [("LIAM", "", "Moi aussi, je veux un pack de trente vidéos !"),
         ("MAYA", "", "T'as pas un rond. Commence par la version gratuite : tes vidéos sont illimitées.")], None),
       ("0:56–1:04", "Deuce filme deux prises au terrain : Liam au panier, puis sur le banc. Musique : le son de Liam. Stalak monte le clip : ça passe d'une prise à l'autre sur le temps, sa bouche reste synchro, et le petit logo Stalak de la version gratuite est dans un coin.",
        [("NARRATEUR", "", "Deux prises, Stalak monte sur le rythme, et Liam poste sa vidéo du jour. Jour un.")], None),
       ("1:04–1:08", "Liam publie : son clip dans le fil, dessiné comme sur TikTok, avec « Jour 1 ». Un commentaire d'un inconnu : « Réponds à Big Mo 😂 ». Musique : Victoire.",
        [("DEUCE", "", "Plus que trois cent soixante-quatre.")], None),
       ("1:08–1:16", "Liam se tourne vers celui qui regarde.",
        [("LIAM", "", "Un clip te prend tout un week-end, toi aussi ? Filme tes prises, Stalak monte sur le rythme, et poste tous les jours.")], "END"),
   ],
   legende="Il a clashé le rappeur le plus connu du quartier. Avec zéro abonné 💀 Comment il fait, Big Mo, pour poster tous les jours ? #rap #rappeur #clash #clip #playback",
   motsCles=['rap', 'rappeur', 'clash', 'poster tous les jours', 'promo musique', 'clip', 'playback', 'série animée'],
   decors="Décor déjà fait : le terrain grillagé ; à dessiner : le profil de Big Mo avec ses cases de vidéos (on y reconnaît le terrain, la rue, l'épicerie), l'écran de Stalak avec « Pack : 30 vidéos ».")

# ---------------------------------------------------------------------------------------------------------------- D · ÉP. 12
ep(id='tcrazy-ep13', num=13, date='2026-11-21', slot=3, heure='21 h', titre="La fiche d'orientation",
   banner="IL A ÉCRIT “RAPPEUR” SUR SA FICHE D'ORIENTATION", shouter='Nadia',
   when="le 21/11 à 21 h",
   extra="Un épisode « lifestyle » : l'idée « Il raconte sa carrière avant de l'avoir » (le toit) est mêlée à celle de la fiche d'orientation. Le message reste sain : le rap, et les cours jusqu'au bout.",
   lights="la lampe au-dessus de la table de la cuisine, puis sur le toit le soleil qui se couche derrière la ville, avec son grand halo orange et les silhouettes à contre-jour",
   next="TRILLER N'EST PLUS SUR L'APP STORE",
   shots=[
       ("0:00–0:02", "La cuisine, le soir. Nadia au centre, une feuille à la main : « FICHE D'ORIENTATION · Métier envisagé : RAPPEUR (le prochain) ». Derrière elle, Liam assis à la table, l'air innocent.",
        [("NADIA", "crie", "T'as écrit “rappeur” sur ta fiche d'orientation ?!")], "BANDEAU"),
       ("0:02–0:06", "Liam, très calme.",
        [("LIAM", "", "Et j'ai mis “le prochain” entre parenthèses. Pour qu'ils sachent.")], None),
       ("0:06–0:14", "Le bandeau s'en va. Étiquettes « LIAM, ALIAS T-CRAZY » et « NADIA, SA MÈRE ».",
        [("NARRATEUR", "", "Voici Liam. 15 ans. Zéro abonné. Et Nadia, sa mère. Au lycée, on a demandé à Liam quel métier il voulait faire plus tard.")], None),
       ("0:14–0:20", "Nadia pose la feuille et croise les bras.",
        [("NADIA", "", "Rappeur, d'accord. Mais tu vas en cours jusqu'au bout. Et tu fais la vaisselle."), ("LIAM", "", "Les trois ?!")], None),
       ("0:20–0:24", "Carton « LE LENDEMAIN, AU COUCHER DU SOLEIL · LE TOIT ». Le toit de l'immeuble : le château d'eau, les climatiseurs, le soleil qui se couche derrière la ville. Liam debout sur une chaise pliante, les bras ouverts. Musique : Galère.",
        [], None),
       ("0:24–0:30", "Maya arrive en marchant par la porte du toit et dit bonjour. Étiquette « MAYA, LA VOISINE ».",
        [("MAYA", "", "Salut. Pourquoi t'es debout sur une chaise ?"), ("LIAM", "", "Je visualise. Dans un an, je remplis un stade.")], None),
       ("0:30–0:33", "Maya s'appuie sur un climatiseur.",
        [("MAYA", "", "Un stade. Avec qui dedans ?")], None),
       ("0:33–0:40", "Liam descend de sa chaise, un peu moins sûr de lui.",
        [("NARRATEUR", "", "Pour remplir un stade, il faut des gens qui connaissent ton son. Et pour ça, il faut le poster. Souvent.")], None),
       ("0:40–0:47", "Maya le regarde, les sourcils levés.",
        [("MAYA", "", "T'as posté combien de vidéos ce mois-ci ?"),
         ("LIAM", "", "Une. Entre les cours, les devoirs et la vaisselle, j'ai pas le temps de monter !")], None),
       ("0:47–0:56", "Maya lui tend son téléphone : l'écran de Stalak, dessiné.",
        [("MAYA", "", "Le montage, c'est Stalak. Tu te filmes trois fois sur ton son, ici, et Stalak coupe sur le rythme.")], None),
       ("0:56–1:03", "Trois prises sur le toit : debout sur la chaise, devant le château d'eau, puis de près avec le soleil derrière lui. Musique : le son de Liam. Stalak monte le clip : ça passe d'une prise à l'autre sur le temps, sa bouche reste synchro, et le petit logo Stalak de la version gratuite est dans un coin. La mascotte réagit avec son autocollant « cool ».",
        [("NARRATEUR", "", "Trois prises au coucher du soleil. Stalak monte sur le rythme, et Liam a posté avant le dîner.")], None),
       ("1:03–1:08", "Liam publie : son clip dans le fil, dessiné comme sur TikTok. Un commentaire d'un inconnu : « C'est où, ce toit ? 😍 ». Musique : Victoire.",
        [("LIAM", "", "Bon. Le stade, ce sera dans deux ans."), ("MAYA", "", "Fais d'abord tes devoirs.")], None),
       ("1:08–1:16", "Liam se tourne vers celui qui regarde.",
        [("LIAM", "", "T'as cours demain, toi aussi ? Filme trois prises ce soir. Stalak monte sur le rythme, et t'as posté avant tes devoirs.")], "END"),
   ],
   legende="Métier envisagé : rappeur (le prochain). Sa mère a moyennement apprécié 😂 #rap #rappeur #orientation #lycee #clip",
   motsCles=['rap', 'rappeur', "fiche d'orientation", 'lycée', 'devenir rappeur', 'clip', 'playback', 'série animée'],
   decors="Décors déjà faits : la cuisine et le toit au coucher du soleil (version 1) ; à faire : les lumières du toit, la fiche d'orientation, la chaise pliante.")

# ---------------------------------------------------------------------------------------------------------------- H · ÉP. 14
ep(id='tcrazy-ep14', num=14, date='2026-11-22', slot=2, heure='18 h', titre='Le Black Friday',
   banner="IL VEUT UNE CAMÉRA DE PRO POUR LE BLACK FRIDAY", shouter='Nadia',
   when="le 22/11 à 18 h, juste après « L'appli a fermé »",
   extra="Actualité : le Black Friday tombe le vendredi 27 novembre, cinq jours après la sortie (le narrateur le dit). Aucune marque : la caméra de la pub est dessinée sans logo.",
   lights="les rayures de lumière à travers les stores du salon et l'écran du téléphone, puis le soleil de l'après-midi dans la rue, l'enseigne de l'épicerie",
   next="IL A TOURNÉ SON DROP DANS UN NUAGE DE FARINE",
   shots=[
       ("0:00–0:02", "Le salon, en fin d'après-midi. Nadia au centre, sur le canapé, qui regarde le téléphone que Liam lui tend : une pub « BLACK FRIDAY » pour une caméra dessinée, sans marque, avec un prix barré.",
        [("NADIA", "crie", "Neuf cents balles, ta caméra ?!")], "BANDEAU"),
       ("0:02–0:05", "Liam insiste, le téléphone à bout de bras.",
        [("LIAM", "", "Mais elle est en promo ! C'est le Black Friday, maman !")], None),
       ("0:05–0:13", "Le bandeau s'en va. Étiquettes « LIAM, ALIAS T-CRAZY » et « NADIA, SA MÈRE ».",
        [("NARRATEUR", "", "Voici Liam. 15 ans. Zéro abonné. Et Nadia, sa mère. Dans cinq jours, c'est le Black Friday. Et Liam en est sûr : sans caméra de pro, pas de vrai clip.")], None),
       ("0:13–0:19", "Nadia lui rend le téléphone.",
        [("NADIA", "", "Ton téléphone filme très bien. Je le sais : c'est moi qui l'ai payé."),
         ("LIAM", "", "Mais les vrais rappeurs ont des caméras !")], None),
       ("0:19–0:24", "On sonne : Deuce entre en marchant, une boîte de baskets sous le bras, et dit bonsoir. Étiquette « DEUCE, SON MANAGER ».",
        [("DEUCE", "", "Bonsoir, madame. J'ai entendu “Black Friday”. J'ai un plan."), ("NADIA", "", "Non.")], None),
       ("0:24–0:30", "Deuce ouvre la boîte de baskets, vide, sûr de lui.",
        [("DEUCE", "", "On revend tes baskets, et avec l'argent, on prend la caméra."), ("LIAM", "", "Mes baskets ?! Jamais !")], None),
       ("0:30–0:33", "Carton « LE LENDEMAIN · LA RUE ». La rue pavillonnaire, l'après-midi. Liam et Deuce sur les marches de l'épicerie ; Deuce fait défiler des pubs du Black Friday sur son téléphone. Musique : Galère.",
        [], None),
       ("0:33–0:38", "Deuce montre les pubs une par une.",
        [("DEUCE", "", "Moins trente, moins quarante… Si on achète tout, on est riches !")], None),
       ("0:38–0:43", "Maya arrive en marchant, son téléphone à la main, et dit bonjour. Étiquette « MAYA, LA VOISINE ».",
        [("MAYA", "", "Salut. Vous achetez quoi ?"), ("LIAM", "", "Une caméra de pro.")], None),
       ("0:43–0:53", "Maya lui montre son téléphone : l'écran de Stalak, dessiné.",
        [("MAYA", "", "Un vrai clip, c'est pas la caméra, c'est le montage. Tu te filmes trois fois au téléphone, et Stalak coupe sur le rythme."),
         ("LIAM", "", "Et ça coûte combien ?"), ("MAYA", "", "Rien. Même pas besoin d'attendre le Black Friday.")], None),
       ("0:53–1:01", "Deuce filme trois prises avec le téléphone de Liam : devant l'épicerie, sur les marches, puis de près. Musique : le son de Liam. Stalak monte le clip : ça passe d'une prise à l'autre sur le temps, sa bouche reste synchro, et le petit logo Stalak de la version gratuite est dans un coin. La mascotte réagit avec son autocollant « hype ».",
        [("NARRATEUR", "", "Trois prises au téléphone, Stalak monte sur le rythme, et les baskets de Liam sont sauvées.")], None),
       ("1:01–1:06", "Liam publie : son clip dans le fil, dessiné comme sur TikTok. Un commentaire d'un inconnu : « Tu filmes avec quoi ? ». Musique : Victoire.",
        [("LIAM", "", "Avec une caméra de pro, évidemment."), ("MAYA", "", "Évidemment.")], None),
       ("1:06–1:14", "Liam se tourne vers celui qui regarde.",
        [("LIAM", "", "Avant de casser ta tirelire au Black Friday : ton téléphone suffit. Stalak monte tes prises sur le rythme, et c'est gratuit.")], "END"),
   ],
   legende="900 balles la caméra au Black Friday ? Ton téléphone filme déjà très bien 📱 #blackfriday #rap #rappeur #clip #playback",
   motsCles=['Black Friday', 'rap', 'rappeur', 'caméra', 'faire un clip avec son téléphone', 'clip', 'playback', 'série animée'],
   decors="Décors déjà faits : le salon et la rue pavillonnaire ; à dessiner : la pub du Black Friday (caméra sans marque, prix barré), la boîte de baskets, les pubs qui défilent sur le téléphone de Deuce.")

# ---------------------------------------------------------------------------------------------------------------- I · ÉP. 15
ep(id='tcrazy-ep15', num=15, date='2026-11-22', slot=3, heure='21 h', titre='Les effets spéciaux',
   banner="IL A TOURNÉ SON DROP DANS UN NUAGE DE FARINE", shouter='Liam',
   when="le 22/11 à 21 h : c'est le dernier épisode de la semaine",
   extra="« Nerveux » est un vrai réglage de Stalak (Rythme : Posé, Normal, Nerveux ; « coupes rapides, jusqu'à chaque temps »), dans la version gratuite.",
   lights="le rayon de soleil de la fenêtre où la farine flotte en poussière dorée, la lampe de la cuisine, le halo de l'écran du téléphone",
   next="(à décider avec toi : le premier épisode de la semaine prochaine)",
   shots=[
       ("0:00–0:02", "La cuisine, en fin d'après-midi. Liam au centre, blanc de farine de la casquette aux baskets ; un nuage de farine retombe doucement dans le rayon de soleil de la fenêtre. Derrière lui, Deuce, un paquet de farine vide dans une main et le téléphone dans l'autre.",
        [("LIAM", "crie", "Pourquoi t'as lancé de la farine pendant mon drop ?!")], "BANDEAU"),
       ("0:02–0:07", "Deuce, très calme.",
        [("DEUCE", "", "C'est un effet spécial. Dans les vrais clips, il y a de la fumée sur le drop.")], None),
       ("0:07–0:15", "Le bandeau s'en va. Étiquettes « LIAM, ALIAS T-CRAZY » et « DEUCE, SON MANAGER ».",
        [("NARRATEUR", "", "Voici Liam. 15 ans. Zéro abonné. Et voici Deuce, son manager. Le drop, c'est le moment où le son explose : Deuce voulait que ça se voie.")], None),
       ("0:15–0:21", "Deuce montre la prise sur son téléphone : au moment du drop, l'écran devient tout blanc.",
        [("DEUCE", "", "Regarde : le drop arrive, et… boum !"), ("LIAM", "", "On me voit plus ! On voit que de la farine !")], None),
       ("0:21–0:27", "La porte d'entrée s'ouvre : Nadia rentre en marchant, son sac sur l'épaule, et s'arrête net. Étiquette « NADIA, SA MÈRE ».",
        [("NADIA", "", "Bonsoir… Pourquoi ma cuisine est blanche ?"), ("DEUCE", "", "Bonsoir, madame. C'est de la direction artistique.")], None),
       ("0:27–0:31", "Nadia pose son sac et tend un balai à chacun.",
        [("NADIA", "", "Alors la direction artistique va passer le balai.")], None),
       ("0:31–0:34", "Carton « UNE HEURE PLUS TARD · LA CUISINE ». La cuisine est propre ; Liam et Deuce, épuisés, s'appuient sur leurs balais. Musique : Galère.",
        [], None),
       ("0:34–0:38", "Deuce lève le doigt : il a une autre idée.",
        [("DEUCE", "", "Pour le prochain clip, j'ai pensé aux confettis."), ("NADIA", "depuis le salon", "Non !")], None),
       ("0:38–0:43", "Maya entre en marchant, son téléphone à la main, et dit bonjour. Étiquette « MAYA, LA VOISINE ».",
        [("MAYA", "", "Salut. Il paraît que t'as tourné un clip dans la farine ?"), ("LIAM", "", "Je voulais juste que mon drop claque !")], None),
       ("0:43–0:53", "Maya s'assoit au comptoir et lui montre son téléphone : l'écran de Stalak, dessiné, avec le réglage « Rythme : Nerveux ».",
        [("MAYA", "", "Pour qu'un drop claque, il faut que ça coupe pile sur le temps. Et Stalak, en “Nerveux”, coupe jusqu'à chaque temps."),
         ("LIAM", "", "Sans farine ?"), ("MAYA", "", "Sans farine.")], None),
       ("0:53–1:01", "Trois prises dans la cuisine propre : Liam seul, avec Deuce qui fait semblant de lancer de la farine (sans farine), puis de près. Musique : le son de Liam. Stalak monte le clip : au drop, ça passe d'une prise à l'autre à chaque temps, sa bouche reste synchro, et le petit logo Stalak de la version gratuite est dans un coin. La mascotte réagit avec son autocollant « hype ».",
        [("NARRATEUR", "", "Au drop, Stalak passe d'une prise à l'autre à chaque temps. Ça explose, et la cuisine reste propre.")], None),
       ("1:01–1:06", "Liam publie : son clip dans le fil, dessiné comme sur TikTok. Un commentaire d'un inconnu : « Le drop 🔥🔥 ». Musique : Victoire.",
        [("DEUCE", "", "Tu vois ? Mon idée de farine, c'était presque ça."), ("MAYA", "", "Presque.")], None),
       ("1:06–1:14", "Liam se tourne vers celui qui regarde.",
        [("LIAM", "", "Tu veux que ton drop explose, toi aussi ? Pas besoin de farine : filme plusieurs prises, et Stalak coupe sur le rythme.")], "END"),
   ],
   legende="Son pote voulait des effets spéciaux sur le drop. Il a pris de la farine 🌫️ #rap #rappeur #drop #clip #playback",
   motsCles=['rap', 'rappeur', 'drop', 'effets spéciaux', 'montage sur le rythme', 'clip', 'playback', 'série animée'],
   decors="Décor déjà fait : la cuisine ; à dessiner : la farine (le nuage, Liam tout blanc, la poussière dans le rayon de soleil), les balais, le réglage « Rythme : Nerveux » dans l'écran de Stalak.")


def line(who, mod, text):
    return '%s%s : « %s »' % (who, ' (%s)' % mod if mod else '', text)


def build(e):
    head = ("VERSION 1 (17/11) · nouvel épisode, écrit pour avoir 3 vidéos par jour cette semaine. Il sort %s. C'est l'épisode %d à l'écran : "
            "tes 6 épisodes validés gardent les numéros 1 à 6 (ta réponse du 17/11 à 5 h), les nouveaux suivent dans leur ordre de sortie, "
            "et la carte de fin annonce la vidéo qui sort juste après." % (e['when'], e['num']))
    if e.get('extra'):
        head += '\n- ' + e['extra']
    parts = [head, RULES.format(shouter=e['shouter'], lights=e['lights'], stalak=e.get('stalak', "Stalak n'arrive que dans la deuxième moitié, quand Liam est coincé"))]
    whos = []
    for t, vis, lines, tail in e['shots']:
        s = '%s · %s' % (t, vis)
        for who, mod, text in lines:
            s += '\n' + line(who, mod, text)
            whos.append(who)
        if tail == 'BANDEAU':
            s += '\nBandeau : %s, avec « ÉP. %d ». Musique : Plan foireux.' % (e['banner'], e['num'])
        elif tail == 'END':
            nxt = e['next']
            s += '\n' + (END.format(next=nxt) if not nxt.startswith('(') else
                         "Carte de fin : stalak.app · « Gratuit, sans téléchargement ni inscription » · « Prochain épisode : » %s." % nxt)
        parts.append(s)
    script = '\n\n'.join(parts)
    n = len(whos)
    voices = ' ; '.join(VOICE[w] for w in ORDER if w in whos)
    cost = ('%.2f' % (n * 0.013)).replace('.', ',')
    tot, n2, per = est(script)
    assert n2 == n, (e['id'], n, n2)
    shouter_line = e['shots'][0][2][0]
    card = {
        'date': e['date'], 'slot': e['slot'], 'heure': e['heure'], 'titre': e['titre'],
        'serie': 'T-Crazy · épisode %d' % e['num'],
        'accroche': '%s : « %s » · bandeau %s' % (e['shouter'], shouter_line[2], e['banner']),
        'script': script, 'legende': e['legende'], 'motsCles': e['motsCles'],
        'son': SON.format(voices=voices, n=n, cost=cost, decors=e['decors']),
        'duree': None, 'reseaux': ['TikTok', 'Instagram Reels', 'YouTube Shorts'], 'format': 'Histoire animée',
        'statut': 'script', 'majPar': 'marketing', 'majLe': NOW,
    }
    return card, tot, n, per


if __name__ == '__main__':
    rows = []
    for e in EPS:
        card, tot, n, per = build(e)
        # the length : the speech (pipeline estimate) + the visual beats, cartons, the end card ; calibrated on the 6 validated
        # episodes (EP6 : 67 s of speech for 1:20, EP3 : 59 s for 1:14) -> about speech + 13 s
        secs = int(round(tot + 13))
        card['duree'] = 'environ 1 min %02d s' % (secs - 60) if secs >= 60 else 'environ %d s' % secs
        json.dump(card, open(os.path.join(OUT, e['id'] + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        rows.append((e['id'], e['num'], e['date'], e['heure'], e['titre'], n, round(tot, 1), secs, len(card['script'])))
    for r in rows:
        print('%-12s ÉP.%-2d %s %-5s %-28s lines %2d  speech %5.1f s  ~%d s  (%d chars)' % r)
