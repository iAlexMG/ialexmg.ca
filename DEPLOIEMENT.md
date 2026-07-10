# Mémo de déploiement — iAlexMG.ca

Aide-mémoire personnel pour gérer le site une fois en ligne.
Site hébergé sur **GitHub Pages**, dépôt **github.com/iAlexMG/ialexmg.ca**,
DNS géré par **Cloudflare**, domaine **ialexmg.ca**.

---

## 🔄 Mettre à jour le site (le geste à retenir)

Le contenu d'un projet se modifie **dans le dossier du projet**, sous
`Portfolio/<Projet>/site-content/` — jamais directement dans le site :

1. Dépose/modifie les fichiers dans `Portfolio/<Projet>/site-content/`
   (`contenu.json` pour les textes, `assets/…` pour images et PDF).
2. Synchronise vers le site, puis publie :

```powershell
cd "C:/Users/Moi/Desktop/Claude_Code/iAlexMG.ca"
python tools/sync-site.py
git add .
git commit -m "Description de ma modification"
git push
```

➡️ Le site en ligne se met à jour **tout seul en ~1 minute** après le `git push`.

> Les **textes d'interface** (menus, accueil, À propos…) restent dans le site
> (`js/translations.js`) : pour eux, pas de synchro — modifier puis Git direct.

> Astuce : si rien ne change après le push, vide le cache du navigateur
> (Ctrl+F5) — le navigateur garde parfois l'ancienne version en mémoire.

---

## 🗂️ Le contenu est rangé PAR PROJET — la source est dans Portfolio

La **source de vérité** d'un projet est son dossier
`Portfolio/<Projet>/site-content/` :

| Dossier dans Portfolio        | id du site  |
|-------------------------------|-------------|
| Lotto 649                     | `649`       |
| Formation - Python            | `python`    |
| Détection d'objets            | `detection` |
| crypto (mono-dépôt, hub)      | `crypto`    |
| indicesBoursiers (mono-dépôt, hub) | `indices` |

`tools/sync-site.py` copie `site-content/contenu.json` vers
`data/projets/<id>.json` et `site-content/assets/**` vers `assets/<id>/**`
en **miroir** : un fichier supprimé de la source est retiré du site.

**Hubs `crypto` / `indices`** : le mono-dépôt a un `site-content/` à sa racine
(le squelette : une section par pilier) **et** un `site-content/` dans chaque
pilier publié (`affichage/`, `backtesting/`…). La synchro **assemble** le tout
en un seul `data/projets/<id>.json` (les sections des piliers deviennent des
sous-sections) et met en miroir les assets des piliers vers leurs dossiers
historiques du site : `crypto/affichage → assets/crypto`,
`crypto/backtesting → assets/backtesting`, `indicesBoursiers/affichage →
assets/ibkr`. Détails : en-tête de `tools/sync-site.py`.

📁 **Correspondance des chemins** : un fichier déposé dans
`site-content/assets/figures/x.png` sera servi à `assets/<id>/figures/x.png`
— c'est **ce chemin final** qu'on écrit dans `contenu.json`
(ex. `"url": "assets/649/figures/x.png"`).

> ⚠️ Pour un projet synchronisé, on n'édite **plus directement**
> `data/projets/<id>.json` ni `assets/<id>/` dans le site : la prochaine
> synchro écraserait la modification. On n'édite **jamais** le HTML.
> Schéma du `contenu.json` : `data/projets/README.md`.

> ⚠️ Attention à la **virgule** entre chaque entrée `{ ... }` du tableau.
> En cas de doute, vérifie le fichier sur https://jsonlint.com (copier-coller)
> — la synchro valide aussi le JSON et refuse un fichier invalide.

---

## 🖼️ Ajouter une image ou une vidéo à un projet

1. (Image) Dépose ton fichier dans le dossier source du projet, ex.
   **`Portfolio/Lotto 649/site-content/assets/figures/`**.
   (Vidéo) Récupère le lien YouTube — rien à déposer.
2. Ouvre **`Portfolio/<Projet>/site-content/contenu.json`** et ajoute une
   entrée dans son `items` :

```json
{
  "type": "image",
  "url": "assets/649/mon-image.png",
  "miniature": "",
  "titre":       { "fr": "Titre FR",       "en": "Title EN" },
  "description": { "fr": "Description FR.", "en": "Description EN." }
}
```

- `type` : `"image"` ou `"video"`
- `url` (vidéo) : le lien YouTube (`https://www.youtube.com/watch?v=...`)
- `url` (image) : `assets/mon-fichier.png` (ou une URL externe)

3. Sauvegarde, puis synchronise + mise à jour Git (section ci-dessus).

---

## 📄 Ajouter un PDF à un projet

Les PDF se gèrent aussi dans le **`contenu.json`** du projet (type `"pdf"`).

1. Dépose ton fichier PDF dans le dossier source du projet, ex.
   **`Portfolio/Formation - Python/site-content/assets/`**.
2. Ouvre **`Portfolio/<Projet>/site-content/contenu.json`** et ajoute une
   entrée dans son `items` :

```json
{
  "type": "pdf",
  "fichier": "assets/python/01 - Fondamentaux.pdf",
  "titre":       { "fr": "Les bases de Python", "en": "The basics of Python" },
  "description": { "fr": "Premier chapitre du cours.", "en": "First chapter of the course." }
}
```

- `fichier` : chemin du PDF, sous le dossier du projet (`assets/<projet>/`).
- `titre` / `description` : objets bilingues `{ "fr": "…", "en": "…" }`.

3. Sauvegarde, puis synchronise + mise à jour Git (section « Mettre à jour le site »).

> Tant que `items` est vide, la page du projet affiche « section en construction ».
> Dès qu'il y a au moins une entrée PDF, les PDF s'affichent (aperçu + boutons
> « Voir le PDF » / « Télécharger »).
> En **anglais**, un avertissement « PDF en français uniquement » s'affiche
> automatiquement.
> ⚠️ Le nom du fichier dans `contenu.json` doit correspondre **exactement**
> (espaces, majuscules/minuscules compris) au fichier déposé.

---

## ✍️ Modifier un texte de l'interface (menus, titres, etc.)

Les textes FR/EN sont dans **`js/translations.js`**. Modifie la valeur voulue
dans `fr` **et** dans `en`, puis fais la mise à jour Git.

---

## 🔒 HTTPS / « Non sécurisé »

- Le certificat HTTPS est généré **automatiquement par GitHub** (gratuit).
- Après la 1re config DNS, il peut mettre **jusqu'à ~1 h** à apparaître.
- Quand il est prêt : **GitHub → Settings → Pages → cocher « Enforce HTTPS »**.
- Ensuite, `http://` redirige automatiquement vers `https://` (cadenas 🔒).

---

## 🌐 Rappel de la configuration (en cas de souci)

**GitHub Pages** (Settings → Pages)
- Source : *Deploy from a branch* — branche `main`, dossier `/ (root)`
- Custom domain : `ialexmg.ca`

**DNS Cloudflare** (DNS → Records) — tous en **DNS only** (nuage gris) :
| Type  | Name  | Contenu             |
|-------|-------|---------------------|
| A     | `@`   | `185.199.108.153`   |
| A     | `@`   | `185.199.109.153`   |
| A     | `@`   | `185.199.110.153`   |
| A     | `@`   | `185.199.111.153`   |
| CNAME | `www` | `ialexmg.github.io` |

> Ne pas activer le proxy Cloudflare (nuage orange) sur ces enregistrements :
> ça empêcherait GitHub d'émettre le certificat HTTPS.

---

## 🔗 Liens utiles
- Site : https://ialexmg.ca
- Dépôt : https://github.com/iAlexMG/ialexmg.ca
- Réglages Pages : https://github.com/iAlexMG/ialexmg.ca/settings/pages
- DNS Cloudflare : https://dash.cloudflare.com
