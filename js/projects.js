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
 *   id    : identifiant utilisé dans data/projets.json (clé du contenu)
 *           et dans la page via <... data-projet="id">.
 *   href  : fichier HTML de la page du projet.
 *   page  : valeur de <body data-page="..."> pour marquer l'onglet actif.
 *   titre : clé i18n du titre complet (menu, en-tête de page, carte accueil).
 *   desc  : clé i18n de la description courte (carte d'accueil).
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
    id: "649",
    href: "projet-649.html",
    page: "projet-649",
    titre: "projet.649",
    desc: "projet.649.desc",
  },
  {
    id: "python",
    href: "python.html",
    page: "python",
    titre: "projet.python",
    desc: "projet.python.desc",
  },
  {
    id: "crypto",
    href: "crypto.html",
    page: "crypto",
    titre: "projet.crypto",
    desc: "projet.crypto.desc",
  },
  {
    id: "quantower",
    href: "quantower.html",
    page: "quantower",
    titre: "projet.quantower",
    desc: "projet.quantower.desc",
  },
  {
    id: "backtesting",
    href: "backtesting.html",
    page: "backtesting",
    titre: "projet.backtesting",
    desc: "projet.backtesting.desc",
  },
  {
    id: "detection",
    href: "detection.html",
    page: "detection",
    titre: "projet.detection",
    desc: "projet.detection.desc",
  },
  {
    id: "ibkr",
    href: "ibkr.html",
    page: "ibkr",
    titre: "projet.ibkr",
    desc: "projet.ibkr.desc",
  },
];

// Exposition globale (pas de modules pour rester compatible file:// et GitHub Pages).
window.PROJETS = PROJETS;
