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
> pilier). Un pilier peut vivre hors de la racine du hub (clé `chemins`) : la
> formation LEAN/vectorbt reste dans le mono-dépôt crypto tout en étant
> présentée sous Formations. Voir l'en-tête de `tools/sync-site.py`.

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
  commençant par `## ` deviennent des sous-titres).
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
  son parent. Une CHAÎNE est l'id d'une entrée de la clé `exchanges` du projet
  (couleur et monogramme déclarés une seule fois, dans le squelette du hub) ; un
  OBJET `{nom, monogramme, couleur}` est pris tel quel, pour une marque qui
  n'est pas un exchange (les moteurs de backtesting). La rondelle REMPLACE
  l'accroche sur la carte.
- `vignette` — chemin d'image ; l'aperçu coiffe la carte de la section et
  remplace lui aussi l'accroche. Sert l'arborescence du pilier Visualisations
  (la capture des quatre vues en tête, chaque vue en dessous).
- `marques` — liste de rondelles rendue en rangée EN TÊTE de la page de la
  section. Mêmes valeurs que `pastille` (chaîne ou objet), plus `statut` {fr,en}
  et `ecarte: true` optionnels. Pour une section sans sous-hub qui veut quand
  même montrer ses outils (les deux moteurs du backtesting des indices).

## Clé `exchanges` (hub crypto)

À la racine du JSON, à côté de `sections`. Chaque entrée = `id`, `nom`,
`monogramme` (2 lettres), `couleur` (hex de la marque), `statut` {fr,en},
`role` {fr,en}, et `ecarte: true` le cas échéant. Le site en fait un bandeau de
logos en tête du hub (`data-projet-exchanges` dans la page) : la pastille est
fabriquée en SVG à la volée — aucun logo déposé n'est hébergé — et l'encre du
monogramme suit la luminance de la couleur. Le bandeau ne montre QUE les
rondelles et les noms ; le sort de chaque exchange, écartés compris, se raconte
sur sa page (sous Historiques et sous Temps réel), et `role` sert de source à
ces pages plutôt qu'à un affichage direct. Les piliers s'y réfèrent par id via
le champ `pastille` d'une section. Les autres clés de premier niveau d'un
squelette de hub sont recopiées telles quelles : `exchanges` n'est pas un cas
particulier du script.

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
