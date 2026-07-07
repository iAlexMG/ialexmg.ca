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
 *   id        : identifiant utilisé dans data/projets.json (clé du contenu)
 *               et dans la page via <... data-projet="id">.
 *   href      : fichier HTML de la page du projet.
 *   page      : valeur de <body data-page="..."> pour marquer l'onglet actif.
 *   titre     : clé i18n du titre complet (menu, en-tête de page, carte accueil).
 *   desc      : clé i18n de la description courte (carte d'accueil).
 *   stack     : (optionnel) technologies affichées en badges sur la carte
 *               d'accueil (noms identiques FR/EN, pas de clé i18n).
 *   miniature : (optionnel) chemin d'une capture affichée en tête de carte.
 *
 * L'ordre du tableau = l'ordre des cartes sur l'accueil. Les projets les plus
 * pertinents pour un recruteur « ingénierie / trading » sont placés en tête
 * (Crypto, IBKR, Backtesting), puis 649 et Python.
 *
 * POUR AJOUTER UN PROJET :
 *   1. Ajoutez une entrée ci-dessous.
 *   2. Dupliquez une page de projet (ex : crypto.html) en <href>, et changez
 *      data-page="<page>" et data-projet="<id>".
 *   3. Ajoutez les clés i18n (titre + desc) dans js/translations.js (fr ET en).
 *   4. Ajoutez le contenu du projet dans data/projets.json (clé "<id>").
 * --------------------------------------------------------------------------
 */

const PROJETS = [
  {
    id: "crypto",
    href: "crypto.html",
    page: "crypto",
    titre: "projet.crypto",
    desc: "projet.crypto.desc",
    stack: ["Python", "asyncio", "WebSocket"],
    miniature: "assets/crypto/img/Hybride.PNG",
  },
  {
    id: "ibkr",
    href: "ibkr.html",
    page: "ibkr",
    titre: "projet.ibkr",
    desc: "projet.ibkr.desc",
    stack: ["Python", "PyQt5", "pyqtgraph", "ib_insync"],
    miniature: "assets/IBKR/img/Capture_01.PNG",
  },
  {
    id: "backtesting",
    href: "backtesting.html",
    page: "backtesting",
    titre: "projet.backtesting",
    desc: "projet.backtesting.desc",
    stack: ["Python", "LEAN", "vectorbt", "Docker"],
    miniature: "assets/Backtesting/figures/optim-heatmap-isoos.png",
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
  // Projets sans contenu pour l'instant : masqués de la grille d'accueil
  // (les pages quantower.html / detection.html restent accessibles par URL).
  // Pour les réactiver, décommenter l'entrée une fois du contenu ajouté
  // dans data/projets.json.
  // {
  //   id: "quantower",
  //   href: "quantower.html",
  //   page: "quantower",
  //   titre: "projet.quantower",
  //   desc: "projet.quantower.desc",
  // },
  // {
  //   id: "detection",
  //   href: "detection.html",
  //   page: "detection",
  //   titre: "projet.detection",
  //   desc: "projet.detection.desc",
  // },
];

// Exposition globale (pas de modules pour rester compatible file:// et GitHub Pages).
window.PROJETS = PROJETS;
