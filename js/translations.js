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
    "nav.trading": "Trading",
    "nav.apropos": "À propos",
    "nav.contact": "Contact",

    // Projets (titres complets — menu, en-tête de page, cartes d'accueil)
    "projet.statistiques": "Statistiques",
    "projet.formations": "Formations",
    "projet.crypto": "Crypto",
    "projet.indices": "Indices boursiers",
    "projet.detection": "Détection d'objets",

    // Descriptions courtes des projets (cartes d'accueil)
    "projet.statistiques.desc": "Mettre le hasard à l'épreuve : tests statistiques et apprentissage automatique sur des décennies de tirages.",
    "projet.formations.desc": "Ce que j'ai appris, remis au propre : Python, Git & GitHub, et deux moteurs de backtesting.",
    "projet.crypto.desc": "La chaîne complète sur le Bitcoin : données historiques, terminal d'orderflow, backtesting, automatisation.",
    "projet.indices.desc": "Les futures d'indices du CME (NQ, ES) : données temps réel, backtesting sur historique — jusqu'au trading automatisé en simulation.",
    "projet.detection.desc": "Apprendre à la machine à reconnaître ce qu'elle voit.",

    // Accueil
    "accueil.titre": "iAlexMG",
    "accueil.sous_titre": "Science des données · Statistiques · Marchés financiers",
    "accueil.intro": "Je conçois des projets d'analyse de données et de modélisation, de la statistique rigoureuse jusqu'à l'apprentissage automatique. Mon terrain de jeu : les marchés boursiers et la crypto — actions, indices comme le S&P 500 et le Nasdaq, et actifs numériques. J'y développe des stratégies de trading, des indicateurs d'analyse de marché et des outils de backtesting pour transformer les données en décisions mesurables.\n\nVoici une sélection de mes travaux.",
    "accueil.projets_titre": "Mes projets",
    "accueil.voir_projet": "Voir le projet",
    "accueil.cta_projets": "Voir mes projets",
    "accueil.cta_contact": "Me contacter",

    // Tuiles du hero (les quatre messages au recruteur)
    "accueil.tuile1_titre": "Rigueur",
    "accueil.tuile1_desc": "Walk-forward IS/OOS, verdicts assumés",
    "accueil.tuile2_titre": "Temps réel",
    "accueil.tuile2_desc": "NQ/ES en direct, pont C#",
    "accueil.tuile3_titre": "Bout en bout",
    "accueil.tuile3_desc": "De la donnée brute jusqu'à ce site",
    "accueil.tuile4_titre": "Marchés",
    "accueil.tuile4_desc": "Crypto & indices CME",

    // Rangées de projet de l'accueil
    "accueil.groupe_trading": "Trading — deux marchés, une même chaîne",

    // Liens de piliers dans les rangées (crypto / indices partagent les ids)
    "pilier.historique": "Historique",
    "pilier.temps-reel": "Temps réel",
    "pilier.affichage": "Visualisations",
    "pilier.backtesting": "Backtesting",
    "pilier.automatisation": "Automatisation",
    "pilier.docs": "Documents",
    "pilier.phase1": "Phase 1 — six tests",
    "pilier.phase2": "Phase 2 — modèles",
    "pilier.synthese": "Synthèse",
    "pilier.python": "Python",
    "pilier.github": "Git & GitHub",
    "pilier.formation": "Formation backtesting",

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
    "contenu.avertissement_texte_fr": "⚠️ Cette section n'est disponible qu'en français.",

    // Hub de projet (cartes par section)
    "hub.documents": "documents",
    "hub.documents_un": "document",
    "hub.figures": "figures",
    "hub.figures_un": "figure",
    "hub.lecture": "Lecture",
    "hub.ouvrir": "Ouvrir",

    // Rail de chaîne (hubs crypto / indices) — étiquettes mono par pilier.
    // Volontairement identiques en anglais : ce sont des codes de terminal.
    "rail.aria": "Chaîne du projet",
    "rail.historique": "HIST",
    "rail.temps-reel": "TR",
    "rail.affichage": "VIEW",
    "rail.backtesting": "TEST",
    "rail.automatisation": "EXEC",

    // Concepts (renvois transversaux vers les formations)
    "concept.renvois": "Concepts :",
    "concept.voir_lecon": "Voir la leçon",
    "concept.fermer": "Fermer la fiche",

    // Bloc « Continuer » (fin des pages de section)
    "continuer.titre": "Continuer",
    "continuer.suite": "La suite",
    "continuer.jumeau": "Même chaîne, autre marché",
    "continuer.concepts": "Concepts liés",

    // Schémas (phase 5) : carte des stratégies, flux d'étapes d'un hub
    "carte.aria": "Carte des stratégies",
    "flux.aria": "Le parcours du projet",

    // Documents PDF
    "documents.voir": "Voir le PDF",
    "documents.telecharger": "Télécharger",
    "documents.avertissement_fr": "⚠️ Les documents PDF ne sont disponibles qu'en français.",

    // Hub Formations (intro spécifique)
    "formations.intro": "Ce que j'ai appris, remis au propre. Chaque formation part de zéro et suit le même parcours : les fondements d'abord, puis les concepts, puis un projet qui les met à l'épreuve. Toujours en amélioration constante.",

    // Hub Crypto (intro spécifique)
    "crypto.intro": "Le marché crypto ne dort jamais : le Bitcoin (BTC/USDT) se négocie 24 h sur 24, 7 jours sur 7, et contrairement aux marchés boursiers, les exchanges exposent publiquement des données très détaillées — chaque transaction, chaque mouvement du carnet d'ordres.\n\nL'objectif de ce projet : automatiser le trading. Cela exige d'abord de recevoir et d'afficher les données du marché en temps réel, puis de valider chaque stratégie par un backtesting sur l'historique avant de la laisser tourner. D'où les cinq piliers ci-dessous.",

    // Hub Indices boursiers (intro spécifique)
    "indices.intro": "Les futures d'indices du CME — le NQ (Nasdaq 100) et l'ES (S&P 500) — jouent sur un terrain différent de la crypto : le marché ouvre et ferme à heures fixes, et les données détaillées y sont plus rares et plus coûteuses.\n\nL'objectif reste le même : automatiser le trading. Cela exige d'abord de recevoir et d'afficher les données du marché en temps réel, puis de valider chaque stratégie par un backtesting sur l'historique avant de la laisser tourner. D'où les cinq piliers ci-dessous.",

    // Hub Statistiques (intro spécifique)
    "statistiques.intro": "Des questions où la réponse se mesure plutôt qu'elle ne s'argumente. On y teste des croyances répandues contre des données longues, avec les outils de la statistique classique d'abord, ceux de l'apprentissage automatique ensuite — et on accepte le verdict, même quand il est négatif.\n\nUn premier projet ci-dessous ; d'autres suivront.",

    // À propos
    "apropos.titre": "À propos",
    "apropos.p1": "Je travaille sous le nom iAlexMG, à l'intersection de la science des données, des statistiques et des marchés financiers.",
    "apropos.p2": "Ce site rassemble mes projets : deux chaînes de trading complètes — crypto (BTC) et indices boursiers (ES/NQ) — de l'extraction des données à l'affichage order-flow, au backtesting (LEAN, vectorbt) et à l'automatisation. S'y ajoutent des travaux de statistique, à commencer par le 6/49, et mes formations : Python, Git & GitHub, et les deux moteurs de backtesting.",
    "apropos.p3": "Mon approche : des méthodes rigoureuses, des résultats mesurables et des outils réutilisables.",
    "apropos.p4": "Ces projets ont été développés avec l'assistance de Claude Code (Anthropic), employé comme outil de programmation et de rédaction — la conception, les décisions et la validation restent les miennes.",

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
    "nav.trading": "Trading",
    "nav.apropos": "About",
    "nav.contact": "Contact",

    // Projects (full titles — menu, page header, home cards)
    "projet.statistiques": "Statistics",
    "projet.formations": "Courses",
    "projet.crypto": "Crypto",
    "projet.indices": "Stock Indices",
    "projet.detection": "Object Detection",

    // Project short descriptions (home cards)
    "projet.statistiques.desc": "Putting randomness to the test: statistics and machine learning on decades of draws.",
    "projet.formations.desc": "What I learned, written up properly: Python, Git & GitHub, and two backtesting engines.",
    "projet.crypto.desc": "The full chain on Bitcoin: historical data, orderflow terminal, backtesting, automation.",
    "projet.indices.desc": "The CME index futures (NQ, ES): real-time data, backtesting on history — all the way to automated trading in simulation.",
    "projet.detection.desc": "Teaching the machine to recognize what it sees.",

    // Home
    "accueil.titre": "iAlexMG",
    "accueil.sous_titre": "Data science · Statistics · Financial markets",
    "accueil.intro": "I build data-analysis and modeling projects, from rigorous statistics all the way to machine learning. My playground: the stock and crypto markets — equities, indices like the S&P 500 and the Nasdaq, and digital assets. There I develop trading strategies, market-analysis indicators and backtesting tools to turn data into measurable decisions.\n\nHere is a selection of my work.",
    "accueil.projets_titre": "My projects",
    "accueil.voir_projet": "View project",
    "accueil.cta_projets": "View my projects",
    "accueil.cta_contact": "Contact me",

    // Hero tiles (the four messages to the recruiter)
    "accueil.tuile1_titre": "Rigor",
    "accueil.tuile1_desc": "Walk-forward IS/OOS, verdicts owned",
    "accueil.tuile2_titre": "Real time",
    "accueil.tuile2_desc": "NQ/ES live, C# bridge",
    "accueil.tuile3_titre": "End to end",
    "accueil.tuile3_desc": "From raw data all the way to this site",
    "accueil.tuile4_titre": "Markets",
    "accueil.tuile4_desc": "Crypto & CME indices",

    // Home project rows
    "accueil.groupe_trading": "Trading — two markets, one chain",

    // Pillar links in the rows (crypto / indices share the ids)
    "pilier.historique": "History",
    "pilier.temps-reel": "Real time",
    "pilier.affichage": "Visualizations",
    "pilier.backtesting": "Backtesting",
    "pilier.automatisation": "Automation",
    "pilier.docs": "Documents",
    "pilier.phase1": "Phase 1 — six tests",
    "pilier.phase2": "Phase 2 — models",
    "pilier.synthese": "Synthesis",
    "pilier.python": "Python",
    "pilier.github": "Git & GitHub",
    "pilier.formation": "Backtesting course",

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
    "contenu.avertissement_texte_fr": "⚠️ This section is only available in French.",

    // Project hub (one card per section)
    "hub.documents": "documents",
    "hub.documents_un": "document",
    "hub.figures": "figures",
    "hub.figures_un": "figure",
    "hub.lecture": "Read",
    "hub.ouvrir": "Open",

    // Chain rail (crypto / indices hubs) — mono labels per pillar.
    // Deliberately the same in French: they're terminal codes.
    "rail.aria": "Project chain",
    "rail.historique": "HIST",
    "rail.temps-reel": "TR",
    "rail.affichage": "VIEW",
    "rail.backtesting": "TEST",
    "rail.automatisation": "EXEC",

    // Concepts (cross-references to the courses)
    "concept.renvois": "Concepts:",
    "concept.voir_lecon": "See the lesson",
    "concept.fermer": "Close",

    // "Continue" block (bottom of section pages)
    "continuer.titre": "Continue",
    "continuer.suite": "Up next",
    "continuer.jumeau": "Same chain, other market",
    "continuer.concepts": "Related concepts",

    // Schemas (phase 5): strategy map, hub step flow
    "carte.aria": "Strategy map",
    "flux.aria": "The project's path",

    // PDF documents
    "documents.voir": "View PDF",
    "documents.telecharger": "Download",
    "documents.avertissement_fr": "⚠️ The PDF documents are only available in French.",

    // Crypto hub (specific intro)
    "crypto.intro": "The crypto market never sleeps: Bitcoin (BTC/USDT) trades around the clock, 7 days a week, and unlike stock markets, the exchanges publicly expose very detailed data — every trade, every move of the order book.\n\nThe goal of this project: automating the trading. That means first receiving and displaying market data in real time, then validating each strategy with a backtest on history before letting it run. Hence the five pillars below.",

    // Stock Indices hub (specific intro)
    "indices.intro": "The CME index futures — the NQ (Nasdaq 100) and the ES (S&P 500) — play on a different field than crypto: the market opens and closes at fixed hours, and detailed data is scarcer and more expensive.\n\nThe goal stays the same: automating the trading. That means first receiving and displaying market data in real time, then validating each strategy with a backtest on history before letting it run. Hence the five pillars below.",

    // Courses hub (specific intro)
    "formations.intro": "What I learned, written up properly. Each course starts from zero and follows the same path: the fundamentals first, then the concepts, then a project that puts them to the test. Always a work in progress.",

    // Statistics hub (specific intro)
    "statistiques.intro": "Questions whose answer gets measured rather than argued. Common beliefs are tested against long records, with the tools of classical statistics first, machine learning next — and the verdict is accepted, even when it's negative.\n\nA first project below; more will follow.",

    // About
    "apropos.titre": "About",
    "apropos.p1": "I work under the name iAlexMG, at the intersection of data science, statistics and financial markets.",
    "apropos.p2": "This site brings together my projects: two complete trading chains — crypto (BTC) and stock indices (ES/NQ) — from data extraction to order-flow display, backtesting (LEAN, vectorbt) and automation. Alongside them: statistical work, starting with the 6/49, and my courses — Python, Git & GitHub, and both backtesting engines.",
    "apropos.p3": "My approach: rigorous methods, measurable results and reusable tools.",
    "apropos.p4": "These projects were developed with the assistance of Claude Code (Anthropic), used as a programming and writing tool — the design, decisions and validation remain my own.",

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
