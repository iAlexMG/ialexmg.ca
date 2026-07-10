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
    "projet.649": "Lotto 649",
    "projet.python": "Formation Python",
    "projet.crypto": "Crypto",
    "projet.quantower": "Quantower",
    "projet.backtesting": "Backtesting",
    "projet.detection": "Détection d'objets",
    "projet.ibkr": "IBKR",

    // Descriptions courtes des projets (cartes d'accueil)
    "projet.649.desc": "Mettre le hasard à l'épreuve : tests statistiques et apprentissage automatique sur des décennies de tirages.",
    "projet.python.desc": "Maîtriser Python, des bases aux concepts avancés.",
    "projet.crypto.desc": "Peut-on vraiment battre le marché crypto ?",
    "projet.quantower.desc": "Des indicateurs sur mesure pour trader autrement.",
    "projet.backtesting.desc": "Et si on testait les stratégies avant de miser ?",
    "projet.backtesting.intro": "Construire un backtesting de niveau pro sur de vraies données crypto : deux résultats phares, et une formation en trois temps — LEAN, vectorbt, réconciliation.",
    "projet.detection.desc": "Apprendre à la machine à reconnaître ce qu'elle voit.",
    "projet.ibkr.desc": "Automatiser le trading via l'API d'Interactive Brokers.",

    // Accueil
    "accueil.titre": "iAlexMG",
    "accueil.sous_titre": "Science des données · Statistiques · Marchés financiers",
    "accueil.intro": "Je conçois des projets d'analyse de données et de modélisation, de la statistique rigoureuse jusqu'à l'apprentissage automatique. Mon terrain de jeu : les marchés boursiers et la crypto — actions, indices comme le S&P 500 et le Nasdaq, et actifs numériques. J'y développe des stratégies de trading, des indicateurs d'analyse de marché et des outils de backtesting pour transformer les données en décisions mesurables.\n\nVoici une sélection de mes travaux.",
    "accueil.projets_titre": "Mes projets",
    "accueil.voir_projet": "Voir le projet",
    "accueil.cta_projets": "Voir mes projets",
    "accueil.cta_contact": "Me contacter",

    // En-tête générique des pages de projet
    "projet.intro": "Projet dédié. Vous trouverez ci-dessous les contenus associés.",

    // Contenu de projet (images / vidéos / PDF)
    "contenu.chargement": "Chargement du contenu…",
    "contenu.vide": "🚧 Section en construction — du contenu sera ajouté prochainement.",
    "contenu.erreur": "Impossible de charger le contenu.",
    "contenu.badge_video": "Vidéo",
    "contenu.badge_image": "Image",
    "contenu.badge_pdf": "PDF",
    "contenu.badge_figure": "Figure",
    "contenu.voir_figure": "Voir en grand",
    "contenu.sommaire": "Sommaire",
    "contenu.retour": "← Retour au projet",
    "contenu.retour_accueil": "← Retour à l'accueil",
    "contenu.code_source": "Code source (GitHub) ↗",

    // Hub de projet (cartes par section)
    "hub.documents": "documents",
    "hub.documents_un": "document",
    "hub.figures": "figures",
    "hub.figures_un": "figure",
    "hub.lecture": "Lecture",
    "hub.ouvrir": "Ouvrir",

    // Documents PDF
    "documents.voir": "Voir le PDF",
    "documents.telecharger": "Télécharger",
    "documents.avertissement_fr": "⚠️ Les documents PDF ne sont disponibles qu'en français.",

    // Projet Python (intro spécifique)
    "python.intro": "Voici les fichiers que j'ai créés pour apprendre et me perfectionner en Python. Toujours en amélioration constante !",

    // Projet Crypto (intro spécifique)
    "crypto.intro": "Un terminal d'orderflow façon Bookmap qui réconcilie six exchanges crypto en une vue cohérente : footprint, heatmap de liquidité, carnet et trades, le tout normalisé puis fusionné en un marché « hybride » avec détection d'arbitrage en direct. Le vrai sujet n'est pas « j'ai branché six exchanges », mais que chacun s'est battu pour rentrer dans le moule : choisissez-en un pour voir ses embûches et leurs solutions, puis suivez l'hybride, l'arbitrage et l'architecture.",

    // Projet 649 (intro spécifique)
    "649.intro": "Le Lotto 6/49 est-il vraiment aléatoire ? Plutôt que de chercher à prédire les numéros, ce projet vérifie si l'historique des tirages se comporte autrement qu'un pur hasard. J'y teste deux croyances répandues — le numéro « en retard » et le numéro « en avance » — d'abord avec des statistiques, puis avec des modèles d'apprentissage automatique. J'ai choisi le Lotto 6/49 pour son historique de plusieurs décennies : plus l'historique est long, plus les résultats gagnent en crédibilité. Vous trouverez ci-dessous les documents explicatifs et les résultats, classés par étape.",

    // Projet IBKR (intro spécifique)
    "ibkr.intro": "Un tableau de bord d'orderflow temps réel pour les futures ES et NQ d'Interactive Brokers : footprint, heatmap de liquidité, trades et carnet d'ordres superposés sur un même graphe, façon Bookmap et Quantower. Construit en Python (PyQt5, pyqtgraph, ib_insync), avec une source de données unique derrière laquelle on permute le flux réel d'IBKR et un mode démo synthétique. Parcourez les couches une à une, puis la contrainte de données propre à IBKR.",

    // À propos
    "apropos.titre": "À propos",
    "apropos.p1": "Je travaille sous le nom iAlexMG, à l'intersection de la science des données, des statistiques et des marchés financiers.",
    "apropos.p2": "Ce site rassemble mes projets : terminal d'orderflow crypto multi-exchanges, tableau de bord temps réel IBKR, backtesting (LEAN, vectorbt), analyse statistique du 6/49 et formation Python.",
    "apropos.p3": "Mon approche : des méthodes rigoureuses, des résultats mesurables et des outils réutilisables.",

    // Contact
    "contact.titre": "Contact",
    "contact.intro": "N'hésitez pas à me contacter pour toute question ou collaboration.",
    "contact.email_label": "Courriel",
    "contact.github_label": "GitHub",

    // Pied de page
    "pied.droits": "Tous droits réservés.",
    "pied.maj": "Dernière mise à jour le",
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
    "projet.649": "Lotto 649",
    "projet.python": "Python Training",
    "projet.crypto": "Crypto",
    "projet.quantower": "Quantower",
    "projet.backtesting": "Backtesting",
    "projet.detection": "Object Detection",
    "projet.ibkr": "IBKR",

    // Project short descriptions (home cards)
    "projet.649.desc": "Putting randomness to the test: statistics and machine learning on decades of draws.",
    "projet.python.desc": "Mastering Python, from the basics to advanced concepts.",
    "projet.crypto.desc": "Can you really beat the crypto market?",
    "projet.quantower.desc": "Custom-built indicators to trade differently.",
    "projet.backtesting.desc": "What if we tested strategies before betting?",
    "projet.backtesting.intro": "Building professional-grade backtesting on real crypto data: two headline results, and a course in three parts — LEAN, vectorbt, reconciliation.",
    "projet.detection.desc": "Teaching the machine to recognize what it sees.",
    "projet.ibkr.desc": "Automating trading through the Interactive Brokers API.",

    // Home
    "accueil.titre": "iAlexMG",
    "accueil.sous_titre": "Data science · Statistics · Financial markets",
    "accueil.intro": "I build data-analysis and modeling projects, from rigorous statistics all the way to machine learning. My playground: the stock and crypto markets — equities, indices like the S&P 500 and the Nasdaq, and digital assets. There I develop trading strategies, market-analysis indicators and backtesting tools to turn data into measurable decisions.\n\nHere is a selection of my work.",
    "accueil.projets_titre": "My projects",
    "accueil.voir_projet": "View project",
    "accueil.cta_projets": "View my projects",
    "accueil.cta_contact": "Contact me",

    // Generic project page header
    "projet.intro": "Dedicated project. You'll find the related content below.",

    // Project content (images / videos / PDF)
    "contenu.chargement": "Loading content…",
    "contenu.vide": "🚧 Section under construction — content coming soon.",
    "contenu.erreur": "Unable to load the content.",
    "contenu.badge_video": "Video",
    "contenu.badge_image": "Image",
    "contenu.badge_pdf": "PDF",
    "contenu.badge_figure": "Figure",
    "contenu.voir_figure": "View full size",
    "contenu.sommaire": "Contents",
    "contenu.retour": "← Back to the project",
    "contenu.retour_accueil": "← Back to home",
    "contenu.code_source": "Source code (GitHub) ↗",

    // Project hub (one card per section)
    "hub.documents": "documents",
    "hub.documents_un": "document",
    "hub.figures": "figures",
    "hub.figures_un": "figure",
    "hub.lecture": "Read",
    "hub.ouvrir": "Open",

    // PDF documents
    "documents.voir": "View PDF",
    "documents.telecharger": "Download",
    "documents.avertissement_fr": "⚠️ The PDF documents are only available in French.",

    // Crypto project (specific intro)
    "crypto.intro": "A Bookmap-style orderflow terminal that reconciles six crypto exchanges into one coherent view: footprint, liquidity heatmap, order book and trades, all normalized then merged into a \"hybrid\" market with live arbitrage detection. The real story isn't \"I plugged in six exchanges\" but that each one had to fight its way into the mold: pick one to see its pitfalls and fixes, then follow the hybrid, arbitrage and architecture.",

    // Python project (specific intro)
    "python.intro": "Here are the files I created to learn and improve my Python skills. Always a work in progress!",

    // 649 project (specific intro)
    "649.intro": "Is Lotto 6/49 really random? Rather than trying to predict the numbers, this project checks whether the draw history behaves any differently from pure chance. I test two common beliefs — the \"overdue\" number and the \"hot\" number — first with statistics, then with machine-learning models. I chose Lotto 6/49 precisely for its decades-long history: the longer the record, the more credible the results. Below you'll find the explanatory documents and the results, organized by stage.",

    // IBKR project (specific intro)
    "ibkr.intro": "A real-time order-flow dashboard for the ES and NQ futures on Interactive Brokers: footprint, liquidity heatmap, trades and order book superposed on a single chart, Bookmap- and Quantower-style. Built in Python (PyQt5, pyqtgraph, ib_insync), with a single data source behind which the real IBKR feed and a synthetic demo mode are interchangeable. Walk through the layers one by one, then the data constraint specific to IBKR.",

    // About
    "apropos.titre": "About",
    "apropos.p1": "I work under the name iAlexMG, at the intersection of data science, statistics and financial markets.",
    "apropos.p2": "This site brings together my projects: a multi-exchange crypto orderflow terminal, a real-time IBKR dashboard, backtesting (LEAN, vectorbt), statistical analysis of the 6/49 and Python training.",
    "apropos.p3": "My approach: rigorous methods, measurable results and reusable tools.",

    // Contact
    "contact.titre": "Contact",
    "contact.intro": "Feel free to reach out for any question or collaboration.",
    "contact.email_label": "Email",
    "contact.github_label": "GitHub",

    // Footer
    "pied.droits": "All rights reserved.",
    "pied.maj": "Last updated",
  },
};

// Exposition globale (pas de système de modules pour rester compatible file:// et GitHub Pages).
window.LANGUES_DISPONIBLES = LANGUES_DISPONIBLES;
window.TRADUCTIONS = TRADUCTIONS;
