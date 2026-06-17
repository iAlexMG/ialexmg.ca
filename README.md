# iAlexMG — Site portfolio

Site portfolio personnel d'**Alexandre Massie Godon** (*iAlexMG*).
Site **statique** (HTML / CSS / JavaScript pur), sans framework ni étape de build,
prêt pour **GitHub Pages**. Bilingue **FR / EN**, responsive (mobile-first).

Domaine cible : **ialexmg.ca**

---

## Arborescence

```
iAlexMG.ca/
├── index.html            # Accueil (présentation + accès aux portfolios)
├── galerie.html          # Galerie complète (tous domaines)
├── ml.html               # Portfolio : Machine Learning & Deep Learning
├── statistiques.html     # Portfolio : Statistiques
├── crypto.html           # Portfolio : Crypto
├── quantower.html        # Portfolio : Quantower
├── apropos.html          # À propos
├── contact.html          # Contact
├── CNAME                 # Domaine personnalisé GitHub Pages (ialexmg.ca)
├── css/
│   └── styles.css        # Tout le style (variables de thème en haut du fichier)
├── js/
│   ├── translations.js   # Dictionnaire des textes FR/EN (à enrichir)
│   ├── i18n.js           # Moteur de traduction (langue active, application, bascule)
│   ├── components.js     # En-tête + navigation + pied de page communs
│   ├── gallery.js        # Lecture du JSON et génération des galeries
│   └── main.js           # Initialisation commune de chaque page
├── data/
│   └── gallery.json      # CONTENU de la galerie (images + vidéos) — éditable
└── assets/               # Vos images locales
```

---

## Tester en local

Comme le site charge `data/gallery.json` via `fetch`, ouvrir les fichiers
directement avec `file://` peut bloquer le chargement (selon le navigateur).
Lancez un petit serveur local :

```bash
# Python 3
python -m http.server 8000
```

Puis ouvrez <http://localhost:8000>.

> Sur GitHub Pages, tout fonctionne sans serveur particulier : le `fetch` est servi en HTTP.

---

## Ajouter du contenu à la galerie (sans toucher au HTML)

Tout le contenu vient de **`data/gallery.json`**. Ajoutez une entrée dans le
tableau `items` :

```json
{
  "id": "ml-4",
  "type": "image",
  "domaine": "ml",
  "url": "assets/mon-graphique.png",
  "miniature": "assets/mon-graphique-min.png",
  "titre":       { "fr": "Mon titre",       "en": "My title" },
  "description": { "fr": "Ma description.",  "en": "My description." }
}
```

Champs :

| Champ         | Obligatoire | Description                                                                 |
|---------------|-------------|-----------------------------------------------------------------------------|
| `id`          | recommandé  | Identifiant unique (utile pour de futures fonctionnalités).                 |
| `type`        | oui         | `"image"` ou `"video"`.                                                     |
| `domaine`     | oui         | `"ml"`, `"statistiques"`, `"crypto"` ou `"quantower"`.                       |
| `url`         | oui         | Image : chemin (`assets/...`) ou URL. Vidéo : lien **YouTube**.             |
| `miniature`   | non         | Image d'aperçu (sinon `url` est utilisée).                                  |
| `titre`       | oui         | Objet `{ "fr": "…", "en": "…" }`.                                           |
| `description` | oui         | Objet `{ "fr": "…", "en": "…" }`.                                           |

**Vidéos YouTube** : collez simplement le lien habituel
(`https://www.youtube.com/watch?v=ID`, `https://youtu.be/ID` ou un lien
`/embed/ID`) — le code extrait l'identifiant et génère l'intégration.

**Images locales** : déposez le fichier dans `assets/` et mettez
`"url": "assets/mon-image.jpg"`.

> Le contenu actuel est du **placeholder de démonstration** (images via picsum.photos,
> vidéos YouTube d'exemple). Remplacez-le par vos propres médias.

---

## Ajouter / modifier les textes d'interface (et les langues)

Les textes de l'interface sont dans **`js/translations.js`**.

- **Modifier un texte** : changez sa valeur dans `fr` *et* `en`.
- **Ajouter un texte** : ajoutez la même clé dans chaque langue, puis dans le
  HTML mettez `data-i18n="ma.cle"` sur l'élément (ou
  `data-i18n="ma.cle" data-i18n-attr="alt"` pour traduire un attribut).
- **Ajouter une langue** : dupliquez le bloc `en`, renommez-le (ex. `es`),
  traduisez, puis ajoutez le code dans `LANGUES_DISPONIBLES`.
  Le bouton de langue bascule en cycle sur toutes les langues disponibles.

La langue choisie est mémorisée dans le navigateur (`localStorage`). FR par défaut.

---

## Ajouter une page de domaine

1. Dupliquez `ml.html` en `mondomaine.html`.
2. Changez `<body data-page="mondomaine">`.
3. Changez le `data-i18n` du `<h1>` (et ajoutez la clé dans `translations.js`).
4. Changez le filtre : `<div class="galerie" data-galerie data-domaine="mondomaine"></div>`.
5. Ajoutez le lien dans le menu : éditez le tableau `LIENS` dans `js/components.js`.
6. Utilisez `"domaine": "mondomaine"` dans `data/gallery.json` pour ses contenus.

La navigation est centralisée dans `js/components.js` : un seul endroit à modifier
pour tous les en-têtes.

---

## Déployer sur GitHub Pages

1. Créez un dépôt GitHub et poussez le contenu de ce dossier à la racine.
   ```bash
   git init
   git add .
   git commit -m "Site portfolio iAlexMG"
   git branch -M main
   git remote add origin https://github.com/iAlexMG/<depot>.git
   git push -u origin main
   ```
2. Dans le dépôt : **Settings → Pages**.
   - **Source** : `Deploy from a branch`.
   - **Branch** : `main`, dossier `/ (root)`.
3. Le fichier **`CNAME`** (déjà présent) configure le domaine `ialexmg.ca`.
   Chez votre registraire DNS, pointez le domaine vers GitHub Pages :
   - Enregistrements **A** vers : `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`
   - ou un **CNAME** `www` vers `iAlexMG.github.io`.
4. Activez **Enforce HTTPS** une fois le certificat émis.

> Astuce : pas besoin de fichier `.nojekyll` ici — aucun fichier ne commence par
> un underscore. Si vous en ajoutez, créez un `.nojekyll` vide à la racine.

---

## Fonctionnalités prévues plus tard (structure déjà prête)

Le code est commenté et modulaire pour faciliter ces ajouts :

- **Recherche** : filtrer `donnees.items` sur titre/description dans `gallery.js`.
- **Filtres par domaine sur la galerie** : réutiliser le paramètre `domaine` de
  `Galerie.rendre(...)`.
- **Lightbox / plein écran** : les images portent déjà `data-lightbox` et
  `data-url` (hooks prêts à brancher).
- **Lecteur vidéo custom** : remplacer `creerEmbedYoutube()` dans `gallery.js`.

---

© Alexandre Massie Godon — iAlexMG.
