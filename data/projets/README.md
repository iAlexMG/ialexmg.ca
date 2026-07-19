# Contenu du site — un fichier JSON par projet

> ⚠️ **Fichiers générés** : pour un projet ayant un dossier
> `Portfolio/<Projet>/site-content/`, le fichier `<id>.json` est copié depuis
> `site-content/contenu.json` par `tools/sync-site.py` — éditez la **source**,
> pas ce fichier (la prochaine synchro écraserait la modification).
>
> Les projets **hub** (`crypto.json`, `indices.json`, `formations.json`,
> `statistiques.json`) sont **assemblés** : le squelette (une section par
> pilier) vient de `<racine du hub>/site-content/`, et les sections des piliers
> qui portent `"inclure"` y sont injectées comme sous-sections (`parent` = le
> pilier). Un pilier peut vivre hors de la racine du hub (clé `chemins`) —
> depuis le 2026-07-19, les trois cours de Formations vivent ensemble sous
> `Portfolio/Formations` (Python, Github, Trading). Voir l'en-tête de
> `tools/sync-site.py`.

Chaque fichier `<id>.json` contient le contenu d'UN projet. L'`id` correspond
au champ `id` défini dans `js/projects.js` et à `data-projet="…"` dans la page.
Chaque projet a SON dossier de médias sous `assets/<id>/` ; pour un hub,
chaque pilier inclus a le sien sous `assets/<id>/<pilier>/`
(ex. `assets/crypto/affichage/`).

## Deux schémas possibles

1. **Plat** — un tableau `items` à la racine (ex. `python.json`) : la page
   projet en fait une table des matières, chaque item ouvrant `projet-item.html`.
2. **Sectionné** — un tableau `sections` (ex. `649.json`, `crypto.json`) :
   chaque section a un `titre` {fr,en}, une `accroche` {fr,en} optionnelle
   (phrase courte pour la carte du hub), une `intro` {fr,en} optionnelle et son
   propre tableau `items`.

## Champs d'une section

- `sousMenu: true` — sa page (`projet-section.html`) affiche un sous-menu
  (une carte par item, chacune ouvrant `projet-item.html`) plutôt que les
  figures en grille.
- `sousHub: true` — section-hub : ses sous-sections (celles qui portent
  `parent: "<id de la section>"`) forment un sous-hub imbriqué.
- `statut` {fr,en} — libellé du chip de la carte (ex. « 9 leçons »,
  « En attente ») ; à défaut, le compte d'items est affiché.
- `texte` {fr,en} — prose détaillée rendue sous le contenu (les lignes
  commençant par `## ` deviennent des sous-titres). Inline : `**gras**`,
  `` `code` ``, `[texte](https://…)` (externe, nouvel onglet),
  `[texte](projet-item.html?…)` / `[texte](projet-section.html?…)` (lien
  interne — un test du 649 renvoie ainsi à son document formatif) et `[[id]]` /
  `[[id|libellé]]` (fiche de concept en pop-up, voir la clé `concepts`).
- `masque: true` — (source de pilier seulement) la section est ÉCARTÉE à
  l'assemblage : le fichier source reste versionné, mais la page disparaît du
  site. Sert à retirer d'un sous-hub une section dont le contenu est déjà dit
  ailleurs, sans en perdre la trace. **Aucune source ne l'utilise depuis le
  2026-07-15** : Kraken, son seul cas, a retrouvé ses pages quand le bandeau du
  hub a perdu ses textes de rôle — sa carte grisée porte maintenant elle-même
  la mention « Éliminé ». Le mécanisme reste en place pour le prochain cas.
- `concept: true` — la section se rend en bandeau pleine largeur sous la grille
  des piliers du hub, plutôt que comme une carte.
- `pastille` — rondelle de marque sur la carte de la section dans le sous-hub de
  son parent. Une CHAÎNE est l'id d'une entrée de la clé `sources` du projet
  (couleur et monogramme déclarés une seule fois, dans le squelette du hub) ; un
  OBJET `{nom, monogramme, couleur}` est pris tel quel, pour une marque qui
  n'est pas une source de données (les moteurs de backtesting). La rondelle
  REMPLACE l'accroche sur la carte.
- `vignette` — chemin d'image ; l'aperçu coiffe la carte de la section et
  remplace lui aussi l'accroche. Sert l'arborescence du pilier Visualisations
  (la capture des quatre vues en tête, chaque vue en dessous).
- `marques` — liste de rondelles rendue en rangée EN TÊTE de la page de la
  section. Mêmes valeurs que `pastille` (chaîne ou objet), plus `statut` {fr,en}
  et `ecarte: true` optionnels. Pour une section sans sous-hub qui veut quand
  même montrer ses outils (les deux moteurs du backtesting des indices).
- `renvois` — liste d'ids de CONCEPTS (voir la clé `concepts` plus bas) : la
  page de la section affiche une rangée de chips « Concepts : … » en tête, et
  les reprend dans son bloc « Continuer ». Règle éditoriale : 2 à 4 renvois par
  page maximum ; pop-up pour un concept, lien direct pour un document entier.

## Clé `sources` (hubs crypto / indices)

À la racine du JSON, à côté de `sections`. Chaque entrée = `id`, `nom`,
`monogramme` (2 lettres), `couleur` (hex de la marque), `statut` {fr,en},
`role` {fr,en}, et `ecarte: true` le cas échéant. Le site en fait un bandeau de
logos en tête du hub (`data-projet-sources` dans la page) : la pastille est
fabriquée en SVG à la volée — aucun logo déposé n'est hébergé — et l'encre du
monogramme suit la luminance de la couleur. Le bandeau ne montre QUE les
rondelles et les noms ; le sort de chaque source, écartées comprises, se raconte
sur sa page (sous Historique et sous Temps réel), et `role` sert de source à
ces pages plutôt qu'à un affichage direct. Les piliers s'y réfèrent par id via
le champ `pastille` d'une section. Les autres clés de premier niveau d'un
squelette de hub sont recopiées telles quelles : `sources` n'est pas un cas
particulier du script.

« Source » et non « exchange » : crypto tire ses données de sept exchanges, les
indices d'un seul marché (le CME) atteint par deux plateformes (Quantower,
IBKR). Un seul mot couvre les deux hubs.

## Clé `concepts` (squelette Formations)

À la racine de `formations.json` (source :
`Portfolio/Formations/site-content/contenu.json` — recopiée telle quelle par la
synchro). Chaque entrée : `id`, `titre` {fr,en}, `resume` {fr,en} (3-4
phrases), `lien` `{p, s, i?}` — la leçon qui enseigne le concept (`i` absent :
la page de section suffit). Deux façons d'y renvoyer depuis n'importe quel
projet : la syntaxe inline `[[id]]` / `[[id|libellé]]` dans un `texte` (terme
souligné pointillé → fiche pop-up avec « Voir la leçon → »), et la clé de
section `renvois` (chips en tête de page). Un id inconnu est ignoré sans bruit.

## Clé `jumeau` (hubs crypto / indices)

À la racine du squelette : l'id du projet miroir (`"jumeau": "indices"` chez
crypto, et réciproquement). Le hub en tire son bandeau « Même chaîne, autre
marché : … → » sous la pyramide, et chaque page de pilier une carte vers le
même pilier de l'autre marché dans son bloc « Continuer » (le pilier doit
exister sous le même id des deux côtés).

## Clé `flux` (squelette d'un hub)

À la racine du squelette : la liste ordonnée d'ids de sections qui forment le
parcours du hub (« Phase 0 → Phase 1 → Phase 2 → Synthèse » pour le 6/49). Le
hub la rend en tête, en étapes cliquables — le titre coupé sur son tiret, le
`statut` de la section en chip. Un id absent est ignoré sans bruit.

## Carte des stratégies (section-hub, page moteur-lean)

Une section-hub qui déclare `carteCentre` {fr,en} (le nœud central — le banc)
et `familles` (liste `{id, titre {fr,en}, liaison {fr,en}}`) se rend en carte
SVG cliquable au lieu de ses cartes de sous-hub au large (les cartes
reprennent en mobile). Chaque sous-section y participe via `famille` (l'id de
sa famille), `carteNom` {fr,en} (nom court du nœud — le titre complet reste
sur sa page) ; `numero` et `statut` fournissent le numéro et le mini-verdict.
Une sous-section peut déclarer `arete` `{vers, libelle {fr,en}}` : un renvoi
pointillé vers un autre nœud (« ajoute des stops à »). Aucune position dans le
JSON — la grille se calcule au rendu.

## Clé `etage` (piliers d'un hub)

Sur une section de pilier : son niveau (1, 2, 3…) dans la chaîne du projet. Dès
que TOUS les piliers d'un hub en portent un, la table des matières se rend en
PYRAMIDE plutôt qu'en grille — les piliers de même étage partagent une rangée,
et les rangées se resserrent vers le bas. C'est la chaîne « de la donnée à
l'exécution » de crypto et des indices : Historique et Temps réel (étage 1)
alimentent les Visualisations (2), qui nourrissent le Backtesting (3), qui mène
à l'Automatisation (4). Un seul pilier sans `etage` suffit à retomber sur la
grille — les hubs qui rassemblent des sections sans chaîne (formations,
statistiques) n'ont donc rien à déclarer. Une section `concept` reste hors
pyramide : elle garde son bandeau pleine largeur, en dessous.

## Types d'item

- `image` → `url` (chemin `assets/<id>/…` ou URL externe)
- `figure` → `url` (planche affichée en entier)
- `video` → `url` (lien YouTube)
- `pdf` → `fichier` (chemin `assets/<id>/…`)

Tous acceptent `titre` {fr,en}, `description` {fr,en}, `texte` {fr,en} et
`miniature` (image d'aperçu optionnelle).

Quand un projet n'a aucun item, sa page affiche « en construction ».

## Valider après édition

```bash
python -c "import json, glob; [json.load(open(f, encoding='utf-8')) for f in glob.glob('data/projets/*.json')]; print('OK')"
```

Une erreur de syntaxe ne casse que le projet concerné, plus tout le site.
