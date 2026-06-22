# Prompt hybride — Site iAlexMG.ca (organisation par projet)

> Ce prompt fusionne le prompt initial (`PROMPT.md`, fondations du site) avec les
> évolutions demandées (`PROMPT - Copie.md`, passage à une organisation par projet
> + corrections PDF). Il décrit le site **cible**.

Crée / fais évoluer un site portfolio personnel **statique** pour GitHub Pages.

## Stack technique
- HTML, CSS et JavaScript pur (vanilla). Aucun framework (pas de React/Vue/build step).
- Fonctionne directement sur GitHub Pages, sans configuration.
- Domaine cible : **ialexmg.ca** (fichier `CNAME` présent).
- Responsive (mobile, tablette, desktop), approche **mobile-first**.

## Identité
- Nom professionnel / marque : **iAlexMG**.
- Le site présente le travail **organisé par PROJET** (et non plus par domaine
  thématique). Projets actuels : **649**, **Formation Python**, **Crypto**,
  **Quantower** — la liste doit pouvoir s'allonger facilement.

## Architecture — organisation par projet
- **Changement clé par rapport à la v1** : on abandonne les onglets par domaine
  (Galerie / ML&DL / Statistiques / …). Le portfolio est désormais **divisé en
  projets**. Chaque projet a sa propre page/section.
- **Un projet peut contenir un mélange de médias** : images, vidéos (YouTube
  en embed) et/ou documents PDF. Le rendu doit gérer ces trois types
  indifféremment dans une même page de projet.
- Pages : **Accueil** (présentation de la marque + cartes d'accès aux projets),
  une page par projet, **À propos**, **Contact**.

## Données (contenu éditable sans toucher au HTML)
- TOUT le contenu des projets vient de fichier(s) **JSON** séparés, éditables à la
  main pour ajouter du contenu sans modifier le HTML.
- Le contenu est regroupé **par projet**. Chaque entrée de média précise :
  `type` (`image` / `video` / `pdf`), `titre`, `description` (bilingues),
  et selon le type : `url` (image ou lien YouTube) ou `fichier` (chemin PDF),
  `miniature` optionnelle.
- Le JavaScript lit ces JSON et génère dynamiquement le contenu de chaque projet.
- La **liste des projets** (id, page, libellés) est centralisée à un seul endroit
  pour piloter à la fois la navigation et les cartes de l'accueil.

## Documents PDF — exigences spécifiques
- **PDF consultables et téléchargeables** : chaque PDF doit pouvoir être
  **affiché** (aperçu intégré + ouverture plein écran dans un nouvel onglet) **et
  téléchargé**. Fournir des boutons explicites « Voir le PDF » et « Télécharger ».
  (On revient sur le verrouillage en lecture seule de la v1 qui empêchait
  l'affichage et le téléchargement.)
- Les chemins de fichiers contenant des espaces doivent être correctement encodés
  pour s'afficher de façon fiable.
- **Avertissement de langue** : les PDF ne sont disponibles **qu'en français**.
  Lorsque l'interface est en **anglais** et qu'un projet contient des PDF, afficher
  un avertissement clair (ex. « ⚠️ The PDF documents are only available in French. »).

## Bilingue FR/EN
- Sélecteur de langue (bouton FR/EN) présent partout, **FR par défaut**.
- Tous les textes d'interface gérés par un système simple de traductions
  (dictionnaire JSON FR/EN), pour ajouter facilement d'autres langues.
- La langue choisie est mémorisée (localStorage) et le contenu dynamique se
  redessine au changement de langue.

## Design
- Style simple, sobre, épuré.
- Palette neutre, douce (tons clairs, beaucoup d'espace blanc, contrastes doux).
- Typographie lisible et élégante. Transitions et survols discrets.

## Fonctionnalités
- Essentiel : navigation par projet, contenu mixte (images / vidéos YouTube / PDF),
  sélecteur de langue, responsive.
- Code **propre, modulaire et commenté en français** pour pouvoir ajouter plus
  tard : recherche, filtres, lightbox / plein écran, lecteur vidéo custom, et
  surtout **de nouveaux projets** en quelques lignes.

## Livrables
- Arborescence claire (`index.html`, une page par projet, `/css`, `/js`,
  `/data` pour les JSON, `/assets` pour images et `/assets/pdf` pour les PDF).
- Code commenté en français.
- README + mémo de déploiement expliquant comment **ajouter un projet**, comment
  **ajouter un média ou un PDF à un projet** (éditer le JSON) et comment déployer
  sur GitHub Pages.
- Contenu de démonstration / placeholder pour visualiser le rendu immédiatement
  (les projets sans contenu affichent un message « en construction »).
