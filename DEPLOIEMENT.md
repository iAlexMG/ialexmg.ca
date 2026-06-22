# Mémo de déploiement — iAlexMG.ca

Aide-mémoire personnel pour gérer le site une fois en ligne.
Site hébergé sur **GitHub Pages**, dépôt **github.com/iAlexMG/ialexmg.ca**,
DNS géré par **Cloudflare**, domaine **ialexmg.ca**.

---

## 🔄 Mettre à jour le site (le geste à retenir)

À chaque modification (ajouter une image/vidéo, changer un texte, etc.) :

```powershell
cd "C:/Users/Moi/Desktop/Claude_Code/iAlexMG.ca"
git add .
git commit -m "Description de ma modification"
git push
```

➡️ Le site en ligne se met à jour **tout seul en ~1 minute** après le `git push`.

> Astuce : si rien ne change après le push, vide le cache du navigateur
> (Ctrl+F5) — le navigateur garde parfois l'ancienne version en mémoire.

---

## 🗂️ Le contenu est rangé PAR PROJET

Tout le contenu vient de **`data/projets.json`**. On n'édite **jamais** le HTML.
Le fichier contient un bloc par projet (`"649"`, `"python"`, `"crypto"`,
`"quantower"`, …) ; chacun a une liste `items`. On ajoute le média dans le
projet voulu.

> ⚠️ Attention à la **virgule** entre chaque entrée `{ ... }` du tableau.
> En cas de doute, vérifie le fichier sur https://jsonlint.com (copier-coller).

---

## 🖼️ Ajouter une image ou une vidéo à un projet

1. (Image) Dépose ton fichier dans le dossier **`assets/`**.
   (Vidéo) Récupère le lien YouTube — rien à déposer.
2. Ouvre **`data/projets.json`** et ajoute une entrée dans le `items` du
   projet voulu :

```json
{
  "type": "image",
  "url": "assets/mon-image.png",
  "miniature": "",
  "titre":       { "fr": "Titre FR",       "en": "Title EN" },
  "description": { "fr": "Description FR.", "en": "Description EN." }
}
```

- `type` : `"image"` ou `"video"`
- `url` (vidéo) : le lien YouTube (`https://www.youtube.com/watch?v=...`)
- `url` (image) : `assets/mon-fichier.png` (ou une URL externe)

3. Sauvegarde, puis fais la mise à jour Git (section ci-dessus).

---

## 📄 Ajouter un PDF à un projet

Les PDF se gèrent aussi dans **`data/projets.json`** (type `"pdf"`).

1. Dépose ton fichier PDF dans le dossier **`assets/pdf/`**
   (ex : `assets/pdf/01 - Fondamentaux.pdf`).
2. Ouvre **`data/projets.json`** et ajoute une entrée dans le `items` du
   projet voulu (ex. `"python"`) :

```json
{
  "type": "pdf",
  "fichier": "assets/pdf/01 - Fondamentaux.pdf",
  "titre":       { "fr": "Les bases de Python", "en": "The basics of Python" },
  "description": { "fr": "Premier chapitre du cours.", "en": "First chapter of the course." }
}
```

- `fichier` : chemin du PDF, **toujours** sous `assets/pdf/`.
- `titre` / `description` : objets bilingues `{ "fr": "…", "en": "…" }`.

3. Sauvegarde, puis fais la mise à jour Git (section « Mettre à jour le site »).

> Tant que `items` est vide, la page du projet affiche « section en construction ».
> Dès qu'il y a au moins une entrée PDF, les PDF s'affichent (aperçu + boutons
> « Voir le PDF » / « Télécharger »).
> En **anglais**, un avertissement « PDF en français uniquement » s'affiche
> automatiquement.
> ⚠️ Le nom du fichier dans `data/projets.json` doit correspondre
> **exactement** (espaces, majuscules/minuscules compris) au fichier déposé.

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
