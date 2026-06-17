Crée un site portfolio personnel statique pour GitHub Pages.

## Stack technique
- HTML, CSS et JavaScript pur (vanilla). Aucun framework (pas de React/Vue/build step).
- Doit fonctionner directement sur GitHub Pages sans configuration.
- Domaine cible : ialexmg.ca (prévoir un fichier CNAME).
- Responsive (mobile, tablette, desktop) par défaut, approche mobile-first.

## Identité
- Nom professionnel / marque : iAlexMG
- Le site présente plusieurs portfolios par domaine : Machine Learning & Deep Learning, Statistiques, Crypto, Quantower.

## Structure des pages
- Accueil : présentation de la marque iAlexMG + accès aux différents portfolios par domaine.
- Galerie : affichage d'images et de vidéos (vidéos hébergées sur YouTube, intégrées via embed). Prévoir la possibilité de filtrer par domaine plus tard.
- À propos.
- Contact.
- Crée une section/page distincte par domaine (ML & DL, Statistiques, Crypto, Quantower), chacune pouvant contenir ses propres images et vidéos.

## Données
- TOUT le contenu de galerie (images et vidéos) doit venir d'un ou plusieurs fichiers JSON séparés, que je pourrai éditer pour ajouter du contenu sans toucher au HTML.
- Chaque entrée JSON : type (image/vidéo), titre, description, domaine/catégorie, URL (lien YouTube ou chemin image), miniature optionnelle.
- Le JavaScript lit ces JSON et génère dynamiquement les galeries.

## Bilingue FR/EN
- Sélecteur de langue (bouton FR/EN) présent dès le départ, FR par défaut.
- Tous les textes d'interface gérés via un système simple de traduction (ex : objet JSON de traductions), pour ajouter facilement des langues.

## Design
- Style simple, sobre, épuré.
- Palette de couleurs neutres, douce et agréable au regard (tons clairs, beaucoup d'espace blanc, contrastes doux).
- Typographie lisible et élégante.
- Transitions et survols discrets.

## Fonctionnalités
- Minimum essentiel pour l'instant : navigation, galerie images + vidéos YouTube, sélecteur de langue, responsive.
- IMPORTANT : structure le code de façon propre, modulaire et commentée pour pouvoir ajouter facilement plus tard : recherche, filtres par domaine, lecteur vidéo custom, mode plein écran/lightbox.

## Livrables
- Arborescence claire des fichiers (index.html, pages, /css, /js, /data avec les JSON, /assets pour images).
- Code commenté en français.
- Un fichier README expliquant comment ajouter du contenu (éditer les JSON), comment ajouter une page, et comment déployer sur GitHub Pages.
- Contenu de démonstration (placeholder) dans les JSON pour voir le rendu immédiatement.