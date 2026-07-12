# iAlexMG — Site portfolio

Site portfolio personnel **iAlexMG**, organisé **par projet**.
Site **statique** (HTML / CSS / JavaScript pur), sans framework ni étape de build,
prêt pour **GitHub Pages**. Bilingue **FR / EN**, responsive (mobile-first).

Domaine cible : **ialexmg.ca**

---

## Arborescence

```
iAlexMG.ca/
├── index.html            # Accueil (présentation + cartes des projets)
├── projet-649.html       # Projet : 649
├── python.html           # Projet : Formation Python (PDF)
├── crypto.html           # Hub : Crypto (4 piliers)
├── indices.html          # Hub : Indices boursiers (4 piliers)
├── apropos.html          # À propos
├── contact.html          # Contact
├── CNAME                 # Domaine personnalisé GitHub Pages (ialexmg.ca)
├── css/
│   └── styles.css        # Tout le style (variables de thème en haut du fichier)
├── js/
│   ├── translations.js   # Dictionnaire des textes FR/EN (à enrichir)
│   ├── i18n.js           # Moteur de traduction (langue active, application, bascule)
│   ├── projects.js       # LISTE CENTRALE des projets (pilote nav + accueil)
│   ├── components.js     # En-tête + navigation + grille d'accueil + pied
│   ├── content.js        # Lecture du JSON et rendu du contenu d'un projet
│   │                     #   (images, vidéos YouTube et PDF)
│   └── main.js           # Initialisation commune de chaque page
├── tools/
│   └── sync-site.py      # Synchronise Portfolio/<Projet>/site-content -> site
├── data/
│   └── projets/          # CONTENU du site — UN fichier JSON par projet
│       ├── README.md     #   (schéma détaillé des fichiers)
│       ├── 649.json      #   crypto.json, indices.json, python.json, …
│       └── …             #   ⚠️ générés par sync-site.py — éditer la SOURCE
└── assets/               # UN DOSSIER PAR PROJET (images + PDF du projet)
    ├── 649/
    ├── python/
    ├── crypto/           # hub crypto : un sous-dossier par pilier
    │   ├── affichage/
    │   └── backtesting/
    └── indices/          # hub indices : idem
        └── affichage/
```

> **Où je mets mes fichiers ?** La **source de vérité** d'un projet est
> `Portfolio/<Projet>/site-content/` (à côté de ce dépôt) : `contenu.json`
> pour les textes, `assets/…` pour images et PDF. `python tools/sync-site.py`
> copie le tout vers `data/projets/<id>.json` et `assets/<id>/` (miroir) —
> pour un pilier de hub, vers `assets/<id-du-hub>/<pilier>/`.
> Dans `contenu.json`, on référence le chemin **final** sur le site :
> `assets/<id>/mon-fichier`.

---

## Tester en local

Comme le site charge les fichiers `data/projets/*.json` via `fetch`, ouvrir les fichiers
directement avec `file://` peut bloquer le chargement (selon le navigateur).
Lancez un petit serveur local :

```bash
# Python 3
python -m http.server 8000
```

Puis ouvrez <http://localhost:8000>.

> Sur GitHub Pages, tout fonctionne sans serveur particulier : le `fetch` est servi en HTTP.

---

## Ajouter du contenu à un projet (sans toucher au HTML)

Tout le contenu s'édite dans **`Portfolio/<Projet>/site-content/contenu.json`**
(la source), puis `python tools/sync-site.py` le copie vers
`data/projets/<id>.json` (un fichier par projet). Chaque projet possède un
tableau `items` (ou `sections` — schéma détaillé dans `data/projets/README.md`).
Ajoutez une entrée selon le type de média :

```json
{ "type": "image", "url": "assets/649/mon-graphique.png", "miniature": "",
  "titre": { "fr": "Mon titre", "en": "My title" },
  "description": { "fr": "Ma description.", "en": "My description." } }

{ "type": "video", "url": "https://www.youtube.com/watch?v=ID",
  "titre": { "fr": "…", "en": "…" }, "description": { "fr": "…", "en": "…" } }

{ "type": "pdf", "fichier": "assets/python/mon-document.pdf",
  "titre": { "fr": "…", "en": "…" }, "description": { "fr": "…", "en": "…" } }
```

> Déposez d'abord le fichier dans le dossier du projet (`assets/<projet>/`),
> puis utilisez ce même chemin dans `url` (image) ou `fichier` (PDF).

Champs :

| Champ         | Type      | Description                                                        |
|---------------|-----------|--------------------------------------------------------------------|
| `type`        | oui       | `"image"`, `"video"` ou `"pdf"`.                                   |
| `url`         | image/vidéo | Image : chemin (`assets/<projet>/...`) ou URL. Vidéo : lien **YouTube**. |
| `fichier`     | pdf       | Chemin du PDF, sous `assets/<projet>/`.                            |
| `miniature`   | non       | Image d'aperçu (sinon `url` est utilisée).                        |
| `titre`       | oui       | Objet `{ "fr": "…", "en": "…" }`.                                 |
| `description` | oui       | Objet `{ "fr": "…", "en": "…" }`.                                 |

**Vidéos YouTube** : collez le lien habituel
(`https://www.youtube.com/watch?v=ID`, `https://youtu.be/ID` ou `/embed/ID`) —
le code extrait l'identifiant et génère l'intégration.

**Images locales** : déposez le fichier dans `assets/<projet>/` puis
`"url": "assets/<projet>/mon-image.jpg"`.

**PDF** : déposez le fichier dans `assets/<projet>/` puis
`"fichier": "assets/<projet>/mon-document.pdf"`. Chaque PDF s'affiche en aperçu, avec
des boutons **Voir le PDF** (ouverture plein écran) et **Télécharger**.

> Tant que `items` est vide pour un projet, sa page affiche un message
> « section en construction ».

---

## ⚠️ PDF en français uniquement

Les documents PDF ne sont disponibles qu'**en français**. Lorsque l'interface
est en **anglais** et qu'un projet contient des PDF, un **avertissement** est
affiché automatiquement au-dessus du contenu (clé `documents.avertissement_fr`).

---

## Ajouter / modifier les textes d'interface (et les langues)

Les textes de l'interface sont dans **`js/translations.js`**.

- **Modifier un texte** : changez sa valeur dans `fr` *et* `en`.
- **Ajouter un texte** : ajoutez la même clé dans chaque langue, puis dans le
  HTML mettez `data-i18n="ma.cle"` sur l'élément (ou
  `data-i18n="ma.cle" data-i18n-attr="alt"` pour traduire un attribut).
- **Ajouter une langue** : dupliquez le bloc `en`, renommez-le (ex. `es`),
  traduisez, puis ajoutez le code dans `LANGUES_DISPONIBLES`.

La langue choisie est mémorisée dans le navigateur (`localStorage`). FR par défaut.

---

## Ajouter un projet

1. Ajoutez une entrée dans le tableau `PROJETS` de **`js/projects.js`**
   (`id`, `href`, `page`, `titre`, `desc`). La navigation et la grille de
   l'accueil se mettent à jour automatiquement.
2. Dupliquez une page de projet (ex. `crypto.html`) vers le fichier `href`
   choisi, puis changez `<body data-page="…">`, le `data-i18n` du `<h1>` et
   `data-projet="…"` du conteneur de contenu.
3. Ajoutez les clés i18n du titre et de la description dans `js/translations.js`
   (dans `fr` **et** `en`).
4. Créez `data/projets/<id>.json` avec le contenu du projet (tableau `items`
   ou `sections`).
5. Créez le dossier `assets/<id>/` pour y déposer les images et PDF du projet.

---

## Déployer sur GitHub Pages

1. Poussez le contenu de ce dossier à la racine d'un dépôt GitHub.
   ```bash
   git add .
   git commit -m "Mise à jour du site iAlexMG"
   git push
   ```
2. Dans le dépôt : **Settings → Pages**.
   - **Source** : `Deploy from a branch`.
   - **Branch** : `main`, dossier `/ (root)`.
3. Le fichier **`CNAME`** (déjà présent) configure le domaine `ialexmg.ca`.
4. Activez **Enforce HTTPS** une fois le certificat émis.

---

## Fonctionnalités prévues plus tard (structure déjà prête)

Le code est commenté et modulaire pour faciliter ces ajouts :

- **Recherche / filtres** : filtrer `items` avant rendu dans `content.js`.
- **Lightbox / plein écran** : les images portent déjà `data-lightbox` et
  `data-url` (hooks prêts à brancher).
- **Lecteur vidéo custom** : remplacer `creerEmbedYoutube()` dans `content.js`.

---

© iAlexMG.
