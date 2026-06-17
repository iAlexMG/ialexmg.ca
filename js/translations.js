/*
 * translations.js
 * --------------------------------------------------------------------------
 * Dictionnaire central des textes d'interface (FR / EN).
 *
 * Pour AJOUTER UNE LANGUE :
 *   1. Copiez le bloc "fr" ou "en" ci-dessous, renommez la clé (ex : "es").
 *   2. Traduisez chaque valeur.
 *   3. Ajoutez le code de langue dans LANGUES_DISPONIBLES.
 *
 * Pour AJOUTER UN TEXTE :
 *   - Ajoutez la même clé dans CHAQUE langue.
 *   - Dans le HTML, ajoutez l'attribut data-i18n="ma.cle" sur l'élément.
 *
 * Les clés utilisent une notation pointée (ex : "nav.accueil") purement
 * conventionnelle ; ce sont des clés plates dans l'objet.
 * --------------------------------------------------------------------------
 */

// Langues proposées par le sélecteur, dans l'ordre. La 1re est la langue par défaut.
const LANGUES_DISPONIBLES = ["fr", "en"];

const TRADUCTIONS = {
  fr: {
    // Méta
    "site.langue_courante": "FR",
    "site.basculer_langue": "EN",
    "site.basculer_aria": "Passer en anglais",

    // Navigation
    "nav.accueil": "Accueil",
    "nav.galerie": "Galerie",
    "nav.apropos": "À propos",
    "nav.contact": "Contact",
    "nav.portfolios": "Portfolios",

    // Domaines
    "domaine.ml": "Machine Learning & Deep Learning",
    "domaine.statistiques": "Statistiques",
    "domaine.crypto": "Crypto",
    "domaine.quantower": "Quantower",
    "domaine.ml.court": "ML & DL",

    // Accueil
    "accueil.titre": "Alexandre Massie Godon",
    "accueil.sous_titre": "iAlexMG — Data, modèles et marchés",
    "accueil.intro": "Bienvenue. Je conçois des projets autour de l'apprentissage automatique, des statistiques et des marchés financiers. Explorez mes portfolios par domaine.",
    "accueil.portfolios_titre": "Mes portfolios",
    "accueil.voir_portfolio": "Voir le portfolio",
    "accueil.cta_galerie": "Parcourir la galerie",

    // Descriptions courtes des domaines (cartes d'accueil)
    "accueil.ml.desc": "Modèles prédictifs, réseaux de neurones et vision par ordinateur.",
    "accueil.statistiques.desc": "Analyse de données, inférence et visualisation statistique.",
    "accueil.crypto.desc": "Stratégies, backtests et analyse de marchés crypto.",
    "accueil.quantower.desc": "Indicateurs et outils personnalisés pour le trading.",

    // Galerie
    "galerie.titre": "Galerie",
    "galerie.intro": "Une sélection d'images et de vidéos issues de mes projets.",
    "galerie.vide": "🚧 Section en construction — du contenu sera ajouté prochainement.",
    "galerie.chargement": "Chargement du contenu…",
    "galerie.erreur": "Impossible de charger le contenu de la galerie.",
    "galerie.badge_video": "Vidéo",
    "galerie.badge_image": "Image",

    // Pages domaine
    "domaine.intro": "Portfolio dédié. Le contenu ci-dessous est filtré pour ce domaine.",

    // À propos
    "apropos.titre": "À propos",
    "apropos.p1": "Je suis Alexandre Massie Godon, aussi connu sous le nom iAlexMG. Je travaille à l'intersection de la science des données, des statistiques et des marchés financiers.",
    "apropos.p2": "Ce site rassemble mes projets en machine learning et deep learning, en statistiques, en crypto, ainsi que mes développements pour la plateforme Quantower.",
    "apropos.p3": "Mon approche : des méthodes rigoureuses, des résultats mesurables et des outils réutilisables.",

    // Contact
    "contact.titre": "Contact",
    "contact.intro": "N'hésitez pas à me contacter pour toute question ou collaboration.",
    "contact.email_label": "Courriel",
    "contact.github_label": "GitHub",

    // Pied de page
    "pied.droits": "Tous droits réservés.",
  },

  en: {
    // Meta
    "site.langue_courante": "EN",
    "site.basculer_langue": "FR",
    "site.basculer_aria": "Switch to French",

    // Navigation
    "nav.accueil": "Home",
    "nav.galerie": "Gallery",
    "nav.apropos": "About",
    "nav.contact": "Contact",
    "nav.portfolios": "Portfolios",

    // Domains
    "domaine.ml": "Machine Learning & Deep Learning",
    "domaine.statistiques": "Statistics",
    "domaine.crypto": "Crypto",
    "domaine.quantower": "Quantower",
    "domaine.ml.court": "ML & DL",

    // Home
    "accueil.titre": "Alexandre Massie Godon",
    "accueil.sous_titre": "iAlexMG — Data, models and markets",
    "accueil.intro": "Welcome. I build projects around machine learning, statistics and financial markets. Explore my portfolios by domain.",
    "accueil.portfolios_titre": "My portfolios",
    "accueil.voir_portfolio": "View portfolio",
    "accueil.cta_galerie": "Browse the gallery",

    // Domain short descriptions (home cards)
    "accueil.ml.desc": "Predictive models, neural networks and computer vision.",
    "accueil.statistiques.desc": "Data analysis, inference and statistical visualization.",
    "accueil.crypto.desc": "Strategies, backtests and crypto market analysis.",
    "accueil.quantower.desc": "Custom indicators and tools for trading.",

    // Gallery
    "galerie.titre": "Gallery",
    "galerie.intro": "A selection of images and videos from my projects.",
    "galerie.vide": "🚧 Section under construction — content coming soon.",
    "galerie.chargement": "Loading content…",
    "galerie.erreur": "Unable to load the gallery content.",
    "galerie.badge_video": "Video",
    "galerie.badge_image": "Image",

    // Domain pages
    "domaine.intro": "Dedicated portfolio. The content below is filtered for this domain.",

    // About
    "apropos.titre": "About",
    "apropos.p1": "I am Alexandre Massie Godon, also known as iAlexMG. I work at the intersection of data science, statistics and financial markets.",
    "apropos.p2": "This site brings together my projects in machine learning and deep learning, statistics, crypto, as well as my developments for the Quantower platform.",
    "apropos.p3": "My approach: rigorous methods, measurable results and reusable tools.",

    // Contact
    "contact.titre": "Contact",
    "contact.intro": "Feel free to reach out for any question or collaboration.",
    "contact.email_label": "Email",
    "contact.github_label": "GitHub",

    // Footer
    "pied.droits": "All rights reserved.",
  },
};

// Exposition globale (pas de système de modules pour rester compatible file:// et GitHub Pages).
window.LANGUES_DISPONIBLES = LANGUES_DISPONIBLES;
window.TRADUCTIONS = TRADUCTIONS;
