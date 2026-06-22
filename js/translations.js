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
    "nav.apropos": "À propos",
    "nav.contact": "Contact",

    // Projets (titres complets — menu, en-tête de page, cartes d'accueil)
    "projet.649": "649",
    "projet.python": "Formation Python",
    "projet.crypto": "Crypto",
    "projet.quantower": "Quantower",

    // Descriptions courtes des projets (cartes d'accueil)
    "projet.649.desc": "Analyse de données et modèles autour du 6/49.",
    "projet.python.desc": "Supports de cours et documents PDF de la formation Python.",
    "projet.crypto.desc": "Stratégies, backtests et analyse de marchés crypto.",
    "projet.quantower.desc": "Indicateurs et outils personnalisés pour le trading.",

    // Accueil
    "accueil.construction": "🚧 Site en construction — le contenu arrive bientôt.",
    "accueil.titre": "iAlexMG",
    "accueil.sous_titre": "Data, modèles et marchés",
    "accueil.intro": "Bienvenue. Je conçois des projets autour de l'apprentissage automatique, des statistiques et des marchés financiers. Découvrez-les ci-dessous.",
    "accueil.projets_titre": "Mes projets",
    "accueil.voir_projet": "Voir le projet",
    "accueil.cta_projets": "Voir mes projets",

    // En-tête générique des pages de projet
    "projet.intro": "Projet dédié. Vous trouverez ci-dessous les contenus associés.",

    // Contenu de projet (images / vidéos / PDF)
    "contenu.chargement": "Chargement du contenu…",
    "contenu.vide": "🚧 Section en construction — du contenu sera ajouté prochainement.",
    "contenu.erreur": "Impossible de charger le contenu.",
    "contenu.badge_video": "Vidéo",
    "contenu.badge_image": "Image",
    "contenu.badge_pdf": "PDF",

    // Documents PDF
    "documents.voir": "Voir le PDF",
    "documents.telecharger": "Télécharger",
    "documents.avertissement_fr": "⚠️ Les documents PDF ne sont disponibles qu'en français.",

    // Projet Python (intro spécifique)
    "python.intro": "Voici les fichiers que j'ai créés pour apprendre et me perfectionner en Python. Toujours en amélioration constante !",

    // À propos
    "apropos.titre": "À propos",
    "apropos.p1": "Je travaille sous le nom iAlexMG, à l'intersection de la science des données, des statistiques et des marchés financiers.",
    "apropos.p2": "Ce site rassemble mes projets : analyse du 6/49, formation Python, crypto, ainsi que mes développements pour la plateforme Quantower.",
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
    "nav.apropos": "About",
    "nav.contact": "Contact",

    // Projects (full titles — menu, page header, home cards)
    "projet.649": "649",
    "projet.python": "Python Training",
    "projet.crypto": "Crypto",
    "projet.quantower": "Quantower",

    // Project short descriptions (home cards)
    "projet.649.desc": "Data analysis and models around the 6/49 lottery.",
    "projet.python.desc": "Course materials and PDF documents from the Python training.",
    "projet.crypto.desc": "Strategies, backtests and crypto market analysis.",
    "projet.quantower.desc": "Custom indicators and tools for trading.",

    // Home
    "accueil.construction": "🚧 Site under construction — content coming soon.",
    "accueil.titre": "iAlexMG",
    "accueil.sous_titre": "Data, models and markets",
    "accueil.intro": "Welcome. I build projects around machine learning, statistics and financial markets. Discover them below.",
    "accueil.projets_titre": "My projects",
    "accueil.voir_projet": "View project",
    "accueil.cta_projets": "View my projects",

    // Generic project page header
    "projet.intro": "Dedicated project. You'll find the related content below.",

    // Project content (images / videos / PDF)
    "contenu.chargement": "Loading content…",
    "contenu.vide": "🚧 Section under construction — content coming soon.",
    "contenu.erreur": "Unable to load the content.",
    "contenu.badge_video": "Video",
    "contenu.badge_image": "Image",
    "contenu.badge_pdf": "PDF",

    // PDF documents
    "documents.voir": "View PDF",
    "documents.telecharger": "Download",
    "documents.avertissement_fr": "⚠️ The PDF documents are only available in French.",

    // Python project (specific intro)
    "python.intro": "Here are the files I created to learn and improve my Python skills. Always a work in progress!",

    // About
    "apropos.titre": "About",
    "apropos.p1": "I work under the name iAlexMG, at the intersection of data science, statistics and financial markets.",
    "apropos.p2": "This site brings together my projects: 6/49 analysis, Python training, crypto, as well as my developments for the Quantower platform.",
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
