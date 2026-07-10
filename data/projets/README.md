# Contenu du site — un fichier JSON par projet

> ⚠️ **Fichiers générés** : pour un projet ayant un dossier
> `Portfolio/<Projet>/site-content/`, le fichier `<id>.json` est copié depuis
> `site-content/contenu.json` par `tools/sync-site.py` — éditez la **source**,
> pas ce fichier (la prochaine synchro écraserait la modification).
>
> Les projets **hub** (`crypto.json`, `indices.json`) sont **assemblés** : le
> squelette (une section par pilier) vient de `<mono-dépôt>/site-content/`,
> et les sections des piliers qui portent `"inclure"` y sont injectées comme
> sous-sections (`parent` = le pilier). Voir l'en-tête de `tools/sync-site.py`.

Chaque fichier `<id>.json` contient le contenu d'UN projet. L'`id` correspond
au champ `id` défini dans `js/projects.js` et à `data-projet="…"` dans la page.
Chaque projet a SON dossier de médias sous `assets/<id>/`.

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
