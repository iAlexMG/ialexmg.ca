/*
 * projects.js
 * --------------------------------------------------------------------------
 * Liste CENTRALE des projets du portfolio.
 *
 * C'est l'unique endroit à modifier pour ajouter / retirer / réordonner un
 * projet : la navigation (components.js) et les cartes de l'accueil
 * (index.html) sont générées à partir de cette liste.
 *
 * Champs d'un projet :
 *   id        : identifiant du fichier de contenu (data/projets/<id>.json)
 *               et dans la page via <... data-projet="id">.
 *   href      : fichier HTML de la page du projet.
 *   page      : valeur de <body data-page="..."> pour marquer l'onglet actif.
 *   titre     : clé i18n du titre complet (menu, en-tête de page, carte accueil).
 *   desc      : clé i18n de la description courte (carte d'accueil).
 *   stack     : (optionnel) technologies affichées en badges sur la carte
 *               d'accueil (noms identiques FR/EN, pas de clé i18n).
 *   miniature : (optionnel) chemin d'une capture affichée en tête de carte.
 *   code      : (optionnel) URL du dépôt GitHub du projet — affiche un bouton
 *               « Code source » en tête de la page du projet (content.js).
 *
 * L'ordre du tableau = l'ordre des cartes sur l'accueil. Les projets les plus
 * pertinents pour un recruteur « ingénierie / trading » sont placés en tête
 * (les deux hubs Crypto et Indices boursiers), puis 649 et Python.
 *
 * HUBS : « crypto » et « indices » couvrent chacun un mono-dépôt GitHub en
 * 4 piliers (historique / affichage / backtesting / automatisation). Leur JSON
 * est ASSEMBLÉ par tools/sync-site.py depuis les site-content du mono-dépôt.
 *
 * POUR AJOUTER UN PROJET :
 *   1. Ajoutez une entrée ci-dessous.
 *   2. Dupliquez une page de projet (ex : crypto.html) en <href>, et changez
 *      data-page="<page>" et data-projet="<id>".
 *   3. Ajoutez les clés i18n (titre + desc) dans js/translations.js (fr ET en).
 *   4. Créez le fichier de contenu data/projets/<id>.json.
 * --------------------------------------------------------------------------
 */

const PROJETS = [
  {
    id: "crypto",
    href: "crypto.html",
    page: "crypto",
    titre: "projet.crypto",
    desc: "projet.crypto.desc",
    stack: ["Python", "asyncio", "WebSocket", "LEAN"],
    miniature: "assets/crypto/img/Hybride.PNG",
    code: "https://github.com/iAlexMG/crypto",
  },
  {
    id: "indices",
    href: "indices.html",
    page: "indices",
    titre: "projet.indices",
    desc: "projet.indices.desc",
    stack: ["Python", "PyQt5", "C#", "LEAN"],
    miniature: "assets/ibkr/img/Capture_01.PNG",
    code: "https://github.com/iAlexMG/indicesBoursiers",
  },
  {
    id: "649",
    href: "projet-649.html",
    page: "projet-649",
    titre: "projet.649",
    desc: "projet.649.desc",
    stack: ["Python", "pandas", "scikit-learn"],
    miniature: "assets/649/figures/fig12_phase2_synthese.png",
  },
  {
    id: "python",
    href: "python.html",
    page: "python",
    titre: "projet.python",
    desc: "projet.python.desc",
    stack: ["Python", "Matplotlib", "pandas", "Plotly"],
  },
  // Projet sans contenu pour l'instant : masqué de la grille d'accueil
  // (la page detection.html reste accessible par URL). Pour le réactiver,
  // décommenter l'entrée une fois du contenu ajouté dans data/projets/<id>.json.
  // {
  //   id: "detection",
  //   href: "detection.html",
  //   page: "detection",
  //   titre: "projet.detection",
  //   desc: "projet.detection.desc",
  // },
];

// Anciens ids de projet (avant la refonte en hubs, 2026-07) -> hub qui héberge
// désormais leur contenu. Sert à honorer les anciennes URL profondes
// (projet-section.html?p=backtesting&s=lean, …) : les ids de section ont été
// conservés lors de la fusion, seul le ?p= change.
const PROJETS_ALIAS = {
  ibkr: "indices",
  quantower: "indices",
  backtesting: "crypto",
};

// Exposition globale (pas de modules pour rester compatible file:// et GitHub Pages).
window.PROJETS = PROJETS;
window.PROJETS_ALIAS = PROJETS_ALIAS;
