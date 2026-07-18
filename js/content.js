/*
 * content.js
 * --------------------------------------------------------------------------
 * Rendu du contenu d'un PROJET. Un même projet peut mélanger images, figures,
 * vidéos YouTube et PDF.
 *
 * Charge data/projets/<projet>.json puis génère le contenu demandé selon la vue :
 *   - rendre        : projet « à plat » (tous les items d'un coup).
 *   - rendreHub     : table des matières — une carte par SECTION (projet
 *                     sectionné, ex. 649) OU une carte par ITEM (projet à items
 *                     plats, ex. Python). Chaque carte mène à sa sous-page.
 *   - rendreSection : UNE section (via ?s=). Si la section a "sousMenu":true,
 *                     elle affiche un sous-hub (une carte par item) ; sinon la
 *                     ou les figures + le texte détaillé.
 *   - rendreItem    : UNE feuille (via ?i=) — figure en grand OU visionneuse
 *                     PDF + texte détaillé.
 *
 * Schéma d'un item (dans data/projets/<projet>.json) :
 *   { "type": "image",  "url": "assets/x.png", ... }
 *   { "type": "figure", "url": "assets/x.png", "texte": {fr,en}? ... }
 *   { "type": "video",  "url": "https://youtu.be/ID", ... }
 *   { "type": "pdf",    "fichier": "assets/x.pdf", "texte": {fr,en}? ... }
 * Tous acceptent "titre" {fr,en}, "description" {fr,en} et "texte" {fr,en}
 * (prose détaillée ; les lignes « ## … » deviennent des sous-titres).
 * --------------------------------------------------------------------------
 */

const Contenu = (function () {
  const DOSSIER_DONNEES = "data/projets/";
  const cacheProjets = {}; // évite de re-télécharger le JSON d'un projet à chaque rendu.

  // Charge (et met en cache) le JSON d'UN projet (data/projets/<id>.json).
  // Renvoie null si le fichier n'existe pas : la page affichera « vide »,
  // comme avant pour un projet absent du JSON central.
  async function chargerProjet(projet) {
    if (!projet) return null;
    if (projet in cacheProjets) return cacheProjets[projet];
    const url = DOSSIER_DONNEES + encodeURIComponent(projet) + ".json";
    const reponse = await fetch(url, { cache: "no-cache" });
    if (reponse.status === 404) return (cacheProjets[projet] = null);
    if (!reponse.ok) throw new Error("HTTP " + reponse.status);
    return (cacheProjets[projet] = await reponse.json());
  }

  // Protection minimale contre l'injection HTML dans les champs texte du JSON.
  function echapper(texte) {
    return String(texte == null ? "" : texte)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Encode un chemin de fichier pour une URL (gère notamment les espaces dans
  // les noms de PDF), tout en conservant les "/" de l'arborescence.
  function encoderChemin(chemin) {
    return encodeURI(String(chemin == null ? "" : chemin));
  }

  // Renvoie le texte bilingue d'un champ ({fr, en}) selon la langue active.
  function texteLocalise(champ) {
    if (champ == null) return "";
    if (typeof champ === "string") return champ; // tolère un champ non bilingue.
    const langue = window.I18n.langueActive();
    return champ[langue] || champ.fr || champ.en || "";
  }

  // --- Métadonnées de projet (depuis window.PROJETS) -------------------------

  function metaProjet(projet) {
    return (window.PROJETS || []).filter(function (p) {
      return p.id === projet;
    })[0] || null;
  }
  function titreProjet(projet) {
    const meta = metaProjet(projet);
    return meta ? window.I18n.t(meta.titre) : "";
  }
  function hrefProjet(projet) {
    const meta = metaProjet(projet);
    return meta ? meta.href : "index.html";
  }

  // Bouton « Code source (GitHub) » en tête de la page projet, si le projet
  // déclare un champ `code` dans projects.js. Renvoie "" sinon.
  function lienCodeSource(projet) {
    const meta = metaProjet(projet);
    if (!meta || !meta.code) return "";
    return (
      '<div class="doc-actions projet-code-source">' +
      '<a class="bouton" href="' + encodeURI(meta.code) + '"' +
      ' target="_blank" rel="noopener" data-i18n="contenu.code_source"></a>' +
      "</div>"
    );
  }

  // --- Prose détaillée -------------------------------------------------------

  // Rend un bloc de prose : les blocs séparés par une ligne vide deviennent des
  // paragraphes ; un bloc commençant par « ## » devient un sous-titre (suivi de
  // son paragraphe éventuel). Renvoie "" si le texte est vide.
  // Mise en forme INLINE de la prose : échappe le HTML puis convertit le
  // gras **…**, le code `…` et les liens [texte](https://…) — le seul
  // Markdown inline que les contenus des projets utilisent. Liens https
  // uniquement (le texte est déjà échappé, l'URL ne peut pas fermer l'attribut).
  function formaterInline(texte) {
    return echapper(texte)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(
        /\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener">$1</a>'
      );
  }

  // Un bloc SANS titre : liste à puces si toutes ses lignes commencent par
  // « - », paragraphe sinon.
  function rendreBlocProse(t) {
    const lignes = t.split("\n").map(function (l) {
      return l.trim();
    }).filter(Boolean);
    const estListe = lignes.length && lignes.every(function (l) {
      return l.indexOf("- ") === 0;
    });
    if (estListe) {
      return (
        "<ul>" +
        lignes.map(function (l) {
          return "<li>" + formaterInline(l.slice(2)) + "</li>";
        }).join("") +
        "</ul>"
      );
    }
    return "<p>" + formaterInline(t) + "</p>";
  }

  function rendreProse(texte) {
    if (!texte) return "";
    const html = String(texte)
      .split(/\n\s*\n/)
      .map(function (bloc) {
        const t = bloc.trim();
        if (!t) return "";
        const m = t.match(/^##\s+(.+?)(?:\n([\s\S]*))?$/);
        if (m) {
          let out =
            '<h3 class="prose-sous-titre">' + echapper(m[1].trim()) + "</h3>";
          if (m[2] && m[2].trim()) out += rendreBlocProse(m[2].trim());
          return out;
        }
        return rendreBlocProse(t);
      })
      .join("");
    return '<div class="section-prose">' + html + "</div>";
  }

  // Extrait l'identifiant d'une vidéo YouTube depuis différentes formes d'URL.
  function extraireIdYoutube(url) {
    const motifs = [
      /[?&]v=([^&]+)/, // https://www.youtube.com/watch?v=ID
      /youtu\.be\/([^?]+)/, // https://youtu.be/ID
      /youtube\.com\/embed\/([^?]+)/, // https://www.youtube.com/embed/ID
    ];
    for (const motif of motifs) {
      const m = String(url || "").match(motif);
      if (m) return m[1];
    }
    return null;
  }

  // --- Constructeurs de média par type -------------------------------------

  function creerEmbedYoutube(url, titre) {
    const id = extraireIdYoutube(url);
    if (!id) return '<div class="media-erreur">URL vidéo invalide</div>';
    const src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id);
    return (
      '<div class="media-cadre">' +
      '<iframe src="' + src + '" title="' + echapper(titre) + '"' +
      ' loading="lazy" frameborder="0" allowfullscreen' +
      ' allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>' +
      "</div>"
    );
  }

  function creerImage(item, titre) {
    const src = item.miniature || item.url;
    return (
      '<div class="media-cadre">' +
      // data-lightbox + data-url : hooks prêts pour une future visionneuse.
      '<img src="' + encoderChemin(src) + '" alt="' + echapper(titre) + '"' +
      ' loading="lazy" data-lightbox="1" data-url="' + encoderChemin(item.url) + '">' +
      "</div>"
    );
  }

  // Carte FIGURE : aperçu de l'image EN ENTIER (object-fit: contain), pensé pour les
  // planches « manuel scientifique » au format portrait, denses en texte. Bouton
  // « Voir en grand » qui ouvre le PNG plein écran (lisible) dans un nouvel onglet.
  function creerCarteFigure(item, titre, description) {
    const src = encoderChemin(item.miniature || item.url);
    const url = encoderChemin(item.url);
    return (
      '<article class="carte carte-figure">' +
      '<a class="fig-apercu" href="' + url + '" target="_blank" rel="noopener">' +
      '  <img src="' + src + '" alt="' + echapper(titre) + '" loading="lazy"' +
      '       data-lightbox="1" data-url="' + url + '">' +
      "</a>" +
      '<div class="carte-corps">' +
      '  <span class="badge" data-i18n="contenu.badge_figure"></span>' +
      '  <h3 class="carte-titre">' + echapper(titre) + "</h3>" +
      '  <p class="carte-desc">' + echapper(description) + "</p>" +
      '  <div class="doc-actions">' +
      '    <a class="bouton" href="' + url + '" target="_blank" rel="noopener"' +
      '       data-i18n="contenu.voir_figure"></a>' +
      "  </div>" +
      "</div>" +
      "</article>"
    );
  }

  // Figure affichée EN GRAND sur une page item (pas dans une carte) : l'image
  // occupe toute la largeur, fond blanc, clic pour ouvrir l'original lisible.
  function creerFigurePleine(item, titre) {
    const src = encoderChemin(item.miniature || item.url);
    const url = encoderChemin(item.url);
    return (
      '<figure class="figure-pleine">' +
      '  <a href="' + url + '" target="_blank" rel="noopener" data-lightbox="1" data-url="' + url + '">' +
      '    <img src="' + src + '" alt="' + echapper(titre) + '" loading="lazy">' +
      "  </a>" +
      '  <figcaption>' +
      '    <a class="bouton" href="' + url + '" target="_blank" rel="noopener"' +
      '       data-i18n="contenu.voir_figure"></a>' +
      "  </figcaption>" +
      "</figure>"
    );
  }

  // Visionneuse PDF EN GRAND sur une page item : aperçu large + boutons.
  function creerVisionneusePdf(item, titre) {
    const url = encoderChemin(item.fichier);
    return (
      '<div class="pdf-pleine">' +
      '  <div class="doc-apercu doc-apercu-grand">' +
      '    <iframe src="' + url + '#view=FitH" title="' + echapper(titre) + '" loading="lazy"></iframe>' +
      "  </div>" +
      '  <div class="doc-actions">' +
      '    <a class="bouton" href="' + url + '" target="_blank" rel="noopener"' +
      '       data-i18n="documents.voir"></a>' +
      '    <a class="doc-lien" href="' + url + '" download' +
      '       data-i18n="documents.telecharger"></a>' +
      "  </div>" +
      "</div>"
    );
  }

  // --- Cartes ---------------------------------------------------------------

  // Carte image ou vidéo.
  function creerCarteMedia(item, titre, description) {
    const estVideo = item.type === "video";
    const media = estVideo
      ? creerEmbedYoutube(item.url, titre)
      : creerImage(item, titre);
    const badge = estVideo
      ? '<span class="badge" data-i18n="contenu.badge_video"></span>'
      : '<span class="badge" data-i18n="contenu.badge_image"></span>';

    return (
      '<article class="carte">' +
      media +
      '<div class="carte-corps">' +
      "  " + badge +
      '  <h3 class="carte-titre">' + echapper(titre) + "</h3>" +
      '  <p class="carte-desc">' + echapper(description) + "</p>" +
      "</div>" +
      "</article>"
    );
  }

  // Carte document PDF : aperçu intégré + boutons « Voir » et « Télécharger ».
  function creerCartePdf(item, titre, description) {
    const url = encoderChemin(item.fichier);
    return (
      '<article class="carte doc-carte">' +
      '<div class="doc-apercu">' +
      // Aperçu intégré. view=FitH ajuste la largeur ; la barre d'outils native
      // du lecteur reste disponible (consultation/téléchargement/impression).
      '  <iframe src="' + url + '#view=FitH" title="' + echapper(titre) + '" loading="lazy"></iframe>' +
      "</div>" +
      '<div class="carte-corps">' +
      '  <span class="badge" data-i18n="contenu.badge_pdf"></span>' +
      '  <h3 class="carte-titre">' + echapper(titre) + "</h3>" +
      '  <p class="carte-desc">' + echapper(description) + "</p>" +
      '  <div class="doc-actions">' +
      '    <a class="bouton" href="' + url + '" target="_blank" rel="noopener"' +
      '       data-i18n="documents.voir"></a>' +
      '    <a class="doc-lien" href="' + url + '" download' +
      '       data-i18n="documents.telecharger"></a>' +
      "  </div>" +
      "</div>" +
      "</article>"
    );
  }

  function creerCarte(item) {
    const titre = texteLocalise(item.titre);
    const description = texteLocalise(item.description);
    if (item.type === "pdf") return creerCartePdf(item, titre, description);
    if (item.type === "figure") return creerCarteFigure(item, titre, description);
    return creerCarteMedia(item, titre, description);
  }

  // --- Cartes de navigation (hub / sous-hub) --------------------------------

  // Carte « portfolio » menant à une sous-page (titre + description + flèche).
  // `visuel` (HTML, optionnel) coiffe la carte — une rondelle de marque ou la
  // vignette d'une vue. Il tient alors lieu de description : l'appelant qui
  // passe un visuel passe une desc vide.
  function creerCarteLien(titre, desc, href, fleche, visuel, numero) {
    // `numero` (optionnel) : suffixe d'index sur le titre — sert à numéroter les
    // stratégies d'un banc (« 01 », « 02 »…) sans toucher au texte des données.
    const suffixeNum = numero
      ? ' <span class="carte-numero">' + echapper(numero) + "</span>"
      : "";
    return (
      '<a class="carte-portfolio' + (visuel ? " carte-illustree" : "") +
      (numero ? " carte-numerotee" : "") + '"' +
      ' href="' + href + '">' +
      (visuel || "") +
      "  <h3>" + echapper(titre) + suffixeNum + "</h3>" +
      (desc ? "  <p>" + echapper(desc) + "</p>" : "") +
      '  <span class="fleche">' + echapper(fleche) + " →</span>" +
      "</a>"
    );
  }

  // Bandeau « concept transversal » d'un hub (section marquée "concept": true) :
  // pleine largeur sous la grille des piliers — un concept traverse la chaîne,
  // il ne s'y insère pas comme un pilier. Montre toujours l'accroche (c'est le
  // manifeste du concept), même en mode titres seuls.
  function creerBandeauConcept(section, projet, pageSection) {
    const titre = texteLocalise(section.titre);
    const desc = texteLocalise(section.accroche) || texteLocalise(section.intro);
    const chip = texteLocalise(section.statut);
    const href =
      pageSection +
      "?p=" + encodeURIComponent(projet) +
      "&s=" + encodeURIComponent(section.id);
    return (
      '<a class="carte-portfolio carte-concept" href="' + href + '">' +
      (chip ? '<span class="concept-etiquette">' + echapper(chip) + "</span>" : "") +
      "  <h3>" + echapper(titre) + "</h3>" +
      (desc ? "  <p>" + echapper(desc) + "</p>" : "") +
      '  <span class="fleche">' + echapper(window.I18n.t("hub.ouvrir")) + " →</span>" +
      "</a>"
    );
  }

  // --- Pyramide des piliers (hubs crypto / indices) --------------------------

  // Les piliers d'une chaîne « de la donnée à l'exécution » ne forment pas une
  // liste plate : Historique et Temps réel alimentent ENSEMBLE la Visualisation,
  // qui nourrit le Backtesting, qui mène à l'Automatisation. La clé `etage`
  // (1, 2, 3…) du JSON porte ce niveau ; le rendu empile les étages dans le sens
  // de lecture, du socle le plus large vers l'exécution.
  // Renvoie null dès qu'UN pilier n'a pas d'étage : le hub retombe alors sur la
  // grille — les autres projets (formations, statistiques, 649) rassemblent des
  // sections côte à côte, sans chaîne à raconter.
  function etagesDePiliers(piliers) {
    if (!piliers.length) return null;
    const numerotes = piliers.every(function (s) {
      return typeof s.etage === "number";
    });
    if (!numerotes) return null;
    const niveaux = [];
    piliers
      .slice()
      .sort(function (a, b) {
        return a.etage - b.etage;
      })
      .forEach(function (section) {
        const dernier = niveaux[niveaux.length - 1];
        if (dernier && dernier.etage === section.etage) dernier.sections.push(section);
        else niveaux.push({ etage: section.etage, sections: [section] });
      });
    return niveaux;
  }

  // Jonction entre deux étages : une FOURCHE quand l'étage du dessus porte
  // plusieurs piliers qui convergent (Historique + Temps réel vers la
  // Visualisation), une simple TIGE sinon. Décor pur, masqué aux lecteurs
  // d'écran : la succession des cartes dit déjà l'ordre de la chaîne.
  function creerJonction(piliersDessus) {
    return (
      '<div class="pyramide-jonction' +
      (piliersDessus > 1 ? " pyramide-jonction-fourche" : "") +
      '" aria-hidden="true"></div>'
    );
  }

  // Fourche DIVERGENTE : la racine d'une arborescence (l'image générale d'un
  // pilier) descend vers les cartes de ses branches. C'est l'inverse de la
  // fourche de la pyramide, où plusieurs piliers convergent vers un seul : son
  // « U » ne se retourne pas, et il faut ici une branche par carte. D'où une
  // tige centrale, puis une cellule par carte qui porte le rail et sa branche —
  // la grille des cellules rejoue celle des cartes, et l'alignement suit
  // (voir .arbre-branches). Décor pur, masqué aux lecteurs d'écran : la
  // succession image → cartes dit déjà l'arborescence.
  function creerFourcheArbre(nombreDeCartes) {
    let branches = "";
    for (let i = 0; i < nombreDeCartes; i++) branches += "<span><i></i></span>";
    return (
      '<div class="arbre-jonction" aria-hidden="true">' +
      '<div class="arbre-tige"></div>' +
      '<div class="arbre-branches">' + branches + "</div>" +
      "</div>"
    );
  }

  function construirePyramide(niveaux, projet, pageSection, titresSeuls) {
    return (
      '<div class="pyramide">' +
      niveaux
        .map(function (niveau, rang) {
          const cartes = niveau.sections
            .map(function (section) {
              return carteDePilier(section, projet, pageSection, titresSeuls);
            })
            .join("");
          // --rang pilote le resserrement de l'étage (voir styles.css).
          return (
            (rang === 0 ? "" : creerJonction(niveaux[rang - 1].sections.length)) +
            '<div class="pyramide-etage" style="--rang: ' + (rang + 1) + '">' +
            cartes +
            "</div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  // Sous-hub : une carte par item d'une section (mène à la page item).
  function construireSousHub(items, projet, sectionId, pageItem) {
    return (
      '<div class="grille-hub">' +
      items
        .map(function (item) {
          const titre = texteLocalise(item.titre);
          const desc = texteLocalise(item.description);
          const href =
            pageItem +
            "?p=" + encodeURIComponent(projet) +
            "&s=" + encodeURIComponent(sectionId) +
            "&i=" + encodeURIComponent(item.id);
          const fleche = window.I18n.t("hub.ouvrir");
          return creerCarteLien(titre, desc, href, fleche);
        })
        .join("") +
      "</div>"
    );
  }

  // Vignette d'une carte de sous-hub (clé `vignette` d'une section) : l'aperçu
  // de la vue que la sous-section documente. Sert l'arborescence du pilier
  // Visualisations — la capture des quatre vues en tête, chaque vue en dessous.
  function vignetteDeCarte(section, titre) {
    if (!section.vignette) return "";
    return (
      '<span class="carte-vignette">' +
      '<img src="' + encoderChemin(section.vignette) + '"' +
      ' alt="' + echapper(titre) + '" loading="lazy">' +
      "</span>"
    );
  }

  // Ordonne les cartes d'un sous-hub sur le bandeau des sources : les rondelles
  // se lisent alors dans le même ordre, de gauche à droite, sur toutes les
  // pages du projet. Sans cette règle l'ordre est celui des sections du JSON,
  // et il dérive d'un pilier à l'autre — Bitget ouvrait le Temps réel et
  // arrivait cinquième dans l'Historique, si bien que les rondelles semblaient
  // alterner d'une page à l'autre. L'ordre du bandeau fait foi : il est déclaré
  // une seule fois, dans le squelette du hub (clé `sources`).
  // Ne trie QUE si toutes les sous-sections portent une rondelle de source —
  // même prudence qu'`etagesDePiliers` : les sous-hubs sans rondelle (les
  // stratégies d'un moteur) ou aux marques déclarées en clair (les moteurs de
  // backtesting) gardent l'ordre voulu par l'auteur.
  function ordonnerSurLesSources(sections, sources) {
    const rang = {};
    (sources || []).forEach(function (source, i) {
      rang[source.id] = i;
    });
    const toutes = sections.every(function (s) {
      return typeof s.pastille === "string" && rang[s.pastille] !== undefined;
    });
    if (!toutes) return sections;
    return sections.slice().sort(function (a, b) {
      return rang[a.pastille] - rang[b.pastille];
    });
  }

  // Sous-hub de SECTIONS : une carte par sous-section (mène à sa page section).
  // Sert à imbriquer un niveau (ex. « La formation » -> LEAN / vbt / conclusion).
  // Une section qui porte une vignette ou une pastille se présente par son
  // visuel : la rondelle de la source ou l'aperçu de la vue remplace l'accroche
  // (`sources` = la clé du projet, pour résoudre les pastilles par id).
  function construireSousHubSections(sections, projet, pageSection, sources) {
    return (
      '<div class="grille-hub">' +
      ordonnerSurLesSources(sections, sources)
        .map(function (section) {
          const titre = texteLocalise(section.titre);
          const visuel =
            vignetteDeCarte(section, titre) || pastilleDeCarte(section, sources);
          const desc = visuel
            ? ""
            : texteLocalise(section.accroche) ||
              texteLocalise(section.intro) ||
              texteLocalise(section.texte);
          const href =
            pageSection +
            "?p=" + encodeURIComponent(projet) +
            "&s=" + encodeURIComponent(section.id);
          return creerCarteLien(
            titre, desc, href, libelleCarteSection(section), visuel, section.numero
          );
        })
        .join("") +
      "</div>"
    );
  }

  // --- Pastilles de marque --------------------------------------------------

  // Pastille d'une marque : monogramme sur une rondelle à sa couleur.
  // Fabriquée ici plutôt que chargée en image — pas de logo déposé à héberger,
  // et le rendu suit le thème. Le monogramme passe en foncé sur les couleurs
  // claires (le jaune de Binance) : on choisit selon la luminance perçue.
  function creerPastille(marque) {
    const couleur = /^#[0-9a-f]{6}$/i.test(String(marque.couleur || ""))
      ? marque.couleur
      : "#6E7681";
    const r = parseInt(couleur.slice(1, 3), 16);
    const v = parseInt(couleur.slice(3, 5), 16);
    const b = parseInt(couleur.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * v + 0.114 * b) / 255;
    const encre = luminance > 0.6 ? "#12161C" : "#FFFFFF";
    const monogramme = String(marque.monogramme || "?");
    // Un monogramme de 3 lettres (VBT) doit tenir dans la même rondelle qu'un
    // monogramme de 2 (BN) : on resserre la fonte plutôt que la rondelle.
    const taille = monogramme.length > 2 ? 14 : 18;
    return (
      '<svg class="pastille" viewBox="0 0 48 48" role="img"' +
      ' aria-label="' + echapper(marque.nom) + '">' +
      '<circle cx="24" cy="24" r="24" fill="' + couleur + '"></circle>' +
      '<text x="24" y="24" text-anchor="middle" dominant-baseline="central"' +
      ' font-size="' + taille + '" font-weight="700" fill="' + encre + '"' +
      ' font-family="system-ui, sans-serif">' +
      echapper(monogramme) +
      "</text></svg>"
    );
  }

  // Résout le champ `pastille` / une entrée de `marques` d'une section :
  //   - une CHAÎNE est l'id d'une source du projet (clé "sources" du JSON) — la
  //     couleur et le monogramme d'une source sont déclarés une seule fois, dans
  //     le squelette du hub, et les piliers s'y réfèrent par id ;
  //   - un OBJET {nom, monogramme, couleur} est pris tel quel — pour les marques
  //     qui ne sont pas des sources de données (les moteurs de backtesting).
  // Renvoie null si l'id est inconnu : une carte sans rondelle vaut mieux
  // qu'une rondelle « ? » sur une coquille de frappe.
  function resoudreMarque(valeur, sources) {
    if (!valeur) return null;
    if (typeof valeur !== "string") return valeur;
    return (sources || []).filter(function (s) {
      return s.id === valeur;
    })[0] || null;
  }

  // Rondelle d'une carte de sous-hub. Grisée si la marque est écartée du
  // périmètre (Kraken) : le statut se lit alors avant même la puce.
  function pastilleDeCarte(section, sources) {
    const marque = resoudreMarque(section.pastille, sources);
    if (!marque) return "";
    return (
      '<span class="carte-pastille' + (marque.ecarte ? " pastille-ecartee" : "") + '">' +
      creerPastille(marque) +
      "</span>"
    );
  }

  // Rangée de rondelles en tête d'une page section (clé `marques`) : sert aux
  // sections sans sous-hub qui veulent quand même afficher leurs outils —
  // ex. les deux moteurs du backtesting des indices.
  function creerRangeeMarques(section, sources) {
    const marques = (Array.isArray(section.marques) ? section.marques : [])
      .map(function (m) {
        return resoudreMarque(m, sources);
      })
      .filter(Boolean);
    if (!marques.length) return "";
    return (
      '<div class="rangee-marques">' +
      marques
        .map(function (marque) {
          const statut = texteLocalise(marque.statut);
          // -item : `.marque` seul est le mot-symbole du site dans l'en-tête.
          return (
            '<span class="marque-item' +
            (marque.ecarte ? " marque-item-ecartee" : "") + '">' +
            creerPastille(marque) +
            '<span class="marque-item-nom">' + echapper(marque.nom) + "</span>" +
            (statut ? '<span class="marque-item-chip">' + echapper(statut) + "</span>" : "") +
            "</span>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  // --- Sources de données (bandeau des hubs crypto / indices) ---------------

  // « Source » et non « exchange » : crypto tire ses données de sept exchanges,
  // les indices d'un seul marché (le CME) atteint par deux plateformes
  // (Quantower, IBKR). Un seul mot couvre les deux hubs.

  // Bandeau du hub : la rondelle de chaque source du périmètre, écartées
  // comprises (grisées). Aucun texte de rôle ici — le sort de chaque source est
  // raconté sur sa page, sous Historique et sous Temps réel. Le nom reste sous
  // la rondelle : un monogramme seul (« KC », « BG ») n'identifie personne.
  function creerLogoSource(source) {
    const classe = "source-logo" + (source.ecarte ? " source-ecartee" : "");
    return (
      '<li class="' + classe + '">' +
      creerPastille(source) +
      '<span class="source-nom">' + echapper(source.nom) + "</span>" +
      "</li>"
    );
  }

  // Rend le bandeau des sources d'un projet (clé "sources" de son JSON).
  // Sans cette clé, le conteneur reste vide : les autres projets ne changent pas.
  async function rendreSources(options) {
    const conteneur = options.conteneur;
    const projet = options.projet || null;
    if (!conteneur) return;
    try {
      const bloc = await chargerProjet(projet);
      const sources = (bloc && Array.isArray(bloc.sources)) ? bloc.sources : [];
      if (!sources.length) {
        conteneur.innerHTML = "";
        return;
      }
      conteneur.innerHTML =
        '<ul class="bandeau-sources">' +
        sources.map(creerLogoSource).join("") +
        "</ul>";
    } catch (err) {
      console.error("[sources] Échec du chargement :", err);
      conteneur.innerHTML = "";
    } finally {
      window.I18n.appliquerTraductions(conteneur);
    }
  }

  // --- Sections (regroupement du contenu d'un projet) -----------------------

  // Identifiant d'ancre stable pour une section (sommaire + lien profond #...).
  function ancreSection(section, idx) {
    if (section.id) return "sec-" + String(section.id);
    return "sec-" + (idx + 1);
  }

  // Rend une section : titre + intro optionnelle + (grille de cartes OU prose).
  function creerSection(section, idx) {
    const titre = texteLocalise(section.titre);
    const intro = texteLocalise(section.intro);
    const texte = texteLocalise(section.texte);
    const items = Array.isArray(section.items) ? section.items : [];
    const ancre = ancreSection(section, idx);

    let corps;
    if (items.length) {
      corps =
        '<div class="galerie">' + items.map(creerCarte).join("") + "</div>" +
        rendreProse(texte);
    } else if (texte) {
      corps = rendreProse(texte);
    } else {
      corps =
        '<div class="galerie"><p class="galerie-message" data-i18n="contenu.vide"></p></div>';
    }

    return (
      '<section class="projet-section" id="' + echapper(ancre) + '">' +
      '  <h2 class="projet-section-titre">' + echapper(titre) + "</h2>" +
      (intro ? '  <p class="section-intro">' + echapper(intro) + "</p>" : "") +
      avertissementTexteFr(section.texte) +
      corps +
      "</section>"
    );
  }

  // Sommaire cliquable en tête de page (ancres vers chaque section).
  function creerSommaire(sections) {
    if (sections.length < 2) return ""; // inutile pour une seule section.
    const liens = sections
      .map(function (section, idx) {
        const titre = texteLocalise(section.titre);
        return (
          '<li><a href="#' + echapper(ancreSection(section, idx)) + '">' +
          echapper(titre) + "</a></li>"
        );
      })
      .join("");
    return (
      '<nav class="projet-sommaire" aria-label="Sommaire">' +
      '  <span class="projet-sommaire-titre" data-i18n="contenu.sommaire"></span>' +
      '  <ol>' + liens + "</ol>" +
      "</nav>"
    );
  }

  // Vrai si au moins un item (toutes sections confondues) est un PDF.
  function contientPdf(sections) {
    return sections.some(function (section) {
      return (section.items || []).some(function (it) {
        return it.type === "pdf";
      });
    });
  }

  // Avertissement affiché en anglais quand le contenu comporte des PDF
  // (les PDF ne sont disponibles qu'en français).
  function banniereAvertissementPdf(aDesPdf) {
    const enAnglais = window.I18n.langueActive() === "en";
    if (!enAnglais || !aDesPdf) return "";
    return '<p class="avertissement-langue" data-i18n="documents.avertissement_fr"></p>';
  }

  // Avertissement affiché en anglais quand le texte d'une section ou d'un item
  // n'existe qu'en français (texteLocalise retombe alors silencieusement sur
  // le fr, sans que le visiteur sache pourquoi).
  function avertissementTexteFr(champ) {
    if (window.I18n.langueActive() !== "en") return "";
    if (!champ || typeof champ === "string" || champ.en || !champ.fr) return "";
    return '<p class="avertissement-langue" data-i18n="contenu.avertissement_texte_fr"></p>';
  }

  // Normalise un bloc projet vers une liste de sections.
  //   - Nouveau schéma : { "sections": [ { titre, intro?, items } ] }.
  //   - Ancien schéma  : { "items": [ ... ] }  -> une section unique sans titre.
  function sectionsDuBloc(bloc) {
    if (!bloc) return [];
    if (Array.isArray(bloc.sections)) return bloc.sections;
    if (Array.isArray(bloc.items)) return [{ items: bloc.items, _plat: true }];
    return [];
  }

  // Rendu principal (projet « à plat »). Gère chargement / vide / erreur / contenu.
  async function rendre(options) {
    const conteneur = options.conteneur;
    const projet = options.projet || null;
    if (!conteneur) return;

    conteneur.setAttribute("aria-busy", "true");
    conteneur.innerHTML =
      '<p class="galerie-message" data-i18n="contenu.chargement"></p>';
    window.I18n.appliquerTraductions(conteneur);

    try {
      const bloc = await chargerProjet(projet);
      const sections = sectionsDuBloc(bloc);
      const lienCode = lienCodeSource(projet);
      const total = sections.reduce(function (n, s) {
        return n + (Array.isArray(s.items) ? s.items.length : 0);
      }, 0);

      if (total === 0) {
        conteneur.classList.add("galerie");
        conteneur.innerHTML =
          lienCode +
          '<p class="galerie-message" data-i18n="contenu.vide"></p>';
      } else if (sections.length === 1 && sections[0]._plat) {
        conteneur.classList.add("galerie");
        const items = sections[0].items;
        conteneur.innerHTML =
          lienCode +
          banniereAvertissementPdf(contientPdf(sections)) +
          items.map(creerCarte).join("");
      } else {
        conteneur.classList.remove("galerie");
        conteneur.innerHTML =
          lienCode +
          banniereAvertissementPdf(contientPdf(sections)) +
          creerSommaire(sections) +
          sections.map(creerSection).join("");
      }
    } catch (err) {
      console.error("[contenu] Échec du chargement :", err);
      conteneur.innerHTML =
        '<p class="galerie-message erreur" data-i18n="contenu.erreur"></p>';
    } finally {
      conteneur.setAttribute("aria-busy", "false");
      window.I18n.appliquerTraductions(conteneur);
    }
  }

  // --- Hub de projet : table des matières ------------------------------------

  // Libellé de comptage d'une section (ex. « 10 documents », « 6 figures »,
  // « Lecture » pour une section en texte seul).
  function libelleCompte(section) {
    const items = Array.isArray(section.items) ? section.items : [];
    const n = items.length;
    if (n === 0) return window.I18n.t("hub.lecture");
    const cle = items[0].type === "pdf" ? "hub.documents" : "hub.figures";
    const mot = window.I18n.t(n > 1 ? cle : cle + "_un");
    return n + " " + mot;
  }

  // Libellé du chip d'une carte de section : le champ "statut" (bilingue) s'il
  // existe — ex. « 9 leçons », « En attente », « 3 parties » — sinon le compte
  // d'items. Permet à une section-hub (sans items) ou en attente d'annoncer son
  // état plutôt qu'un décompte trompeur.
  function libelleCarteSection(section) {
    return texteLocalise(section.statut) || libelleCompte(section);
  }

  // Carte d'un pilier dans la table des matières d'un hub — grille OU pyramide.
  function carteDePilier(section, projet, pageSection, titresSeuls, idx) {
    const titre = texteLocalise(section.titre);
    // Accroche courte pour la carte du hub ; à défaut l'intro, puis le texte
    // complet. 'accroche' évite d'étaler toute la prose (ex. la Conclusion, qui
    // n'a pas d'intro) sur la table des matières.
    const desc = titresSeuls
      ? ""
      : texteLocalise(section.accroche) ||
        texteLocalise(section.intro) ||
        texteLocalise(section.texte);
    const id = section.id || String(idx);
    const href =
      pageSection +
      "?p=" + encodeURIComponent(projet) +
      "&s=" + encodeURIComponent(id);
    return creerCarteLien(titre, desc, href, libelleCarteSection(section));
  }

  // Rendu du HUB (table des matières). Deux cas :
  //   - projet SECTIONNÉ (649) : une carte par section -> page section.
  //   - projet à items PLATS (Python) : une carte par item -> page item.
  async function rendreHub(options) {
    const conteneur = options.conteneur;
    const projet = options.projet || null;
    const pageSection = options.pageSection || "";
    const pageItem = options.pageItem || "";
    if (!conteneur) return;

    conteneur.setAttribute("aria-busy", "true");
    conteneur.innerHTML =
      '<p class="galerie-message" data-i18n="contenu.chargement"></p>';
    window.I18n.appliquerTraductions(conteneur);

    try {
      const bloc = await chargerProjet(projet);
      const toutes = sectionsDuBloc(bloc);
      const estPlat = toutes.length === 1 && toutes[0]._plat;
      const lienCode = lienCodeSource(projet);
      // data-hub-titres-seuls sur le conteneur : cartes sans description
      // (les hubs Crypto / Indices, où le titre du pilier suffit).
      const titresSeuls = conteneur.hasAttribute("data-hub-titres-seuls");
      const sections = toutes.filter(function (s) {
        // On exclut les sous-sections (parent défini) : elles sont présentées
        // dans le sous-hub de leur section parente, pas dans le hub principal.
        return !s._plat && !s.parent;
      });

      if (estPlat) {
        // Projet à items plats : la table des matières liste les items.
        const items = toutes[0].items || [];
        if (!items.length) {
          conteneur.innerHTML =
            lienCode +
            '<p class="galerie-message" data-i18n="contenu.vide"></p>';
        } else {
          conteneur.innerHTML =
            lienCode +
            '<div class="grille-hub">' +
            items
              .map(function (item) {
                const titre = texteLocalise(item.titre);
                const desc = texteLocalise(item.description);
                const href =
                  pageItem +
                  "?p=" + encodeURIComponent(projet) +
                  "&i=" + encodeURIComponent(item.id);
                const fleche =
                  item.type === "pdf"
                    ? window.I18n.t("documents.voir")
                    : window.I18n.t("hub.ouvrir");
                return creerCarteLien(titre, desc, href, fleche);
              })
              .join("") +
            "</div>";
        }
      } else if (sections.length === 0) {
        conteneur.innerHTML =
          lienCode +
          '<p class="galerie-message" data-i18n="contenu.vide"></p>';
      } else {
        // Les sections « concept » sortent de la grille des piliers : elles se
        // rendent en bandeau pleine largeur à la suite.
        const concepts = sections.filter(function (s) {
          return s.concept;
        });
        const piliers = sections.filter(function (s) {
          return !s.concept;
        });
        // Les piliers étagés (clé `etage`) racontent une chaîne : ils se rendent
        // en pyramide. Les autres hubs gardent la grille.
        const niveaux = etagesDePiliers(piliers);
        function grilleDesPiliers() {
          return (
            '<div class="grille-hub">' +
            piliers
              .map(function (section, idx) {
                return carteDePilier(section, projet, pageSection, titresSeuls, idx);
              })
              .join("") +
            "</div>"
          );
        }
        conteneur.innerHTML =
          lienCode +
          (niveaux
            ? construirePyramide(niveaux, projet, pageSection, titresSeuls)
            : grilleDesPiliers()) +
          concepts
            .map(function (section) {
              return creerBandeauConcept(section, projet, pageSection);
            })
            .join("");
      }
    } catch (err) {
      console.error("[hub] Échec du chargement :", err);
      conteneur.innerHTML =
        '<p class="galerie-message erreur" data-i18n="contenu.erreur"></p>';
    } finally {
      conteneur.setAttribute("aria-busy", "false");
      window.I18n.appliquerTraductions(conteneur);
    }
  }

  // Résout une section par id (ou index numérique de secours).
  function trouverSection(sections, sectionId) {
    let section = sections.filter(function (s) {
      return String(s.id || "") === String(sectionId);
    })[0];
    if (!section && /^\d+$/.test(String(sectionId))) {
      section = sections[parseInt(sectionId, 10)];
    }
    return section || null;
  }

  // Résout un item par id (ou index numérique de secours).
  function trouverItem(items, itemId) {
    let item = items.filter(function (it) {
      return String(it.id || "") === String(itemId);
    })[0];
    if (!item && /^\d+$/.test(String(itemId))) {
      item = items[parseInt(itemId, 10)];
    }
    return item || null;
  }

  // Chaîne des parents d'une section, du hub vers elle (« backtesting »
  // avant « moteur-lean »). Garde-fou contre un cycle accidentel de `parent`.
  function cheminSections(sections, section) {
    const chaine = [];
    let s = section;
    let garde = 0;
    while (s && garde++ < 6) {
      chaine.unshift(s);
      s = s.parent ? trouverSection(sections, s.parent) : null;
    }
    return chaine;
  }

  // Fil d'Ariane des sous-pages (« Crypto / Backtesting / RSI ») : remplit
  // [data-fil-ariane] depuis une liste { titre, href } — le dernier morceau
  // est la page courante, sans lien. Renvoie false si le gabarit n'a pas de
  // fil d'Ariane : l'appelant retombe alors sur le lien-retour simple.
  function remplirFilAriane(morceaux) {
    const elAriane = document.querySelector("[data-fil-ariane]");
    if (!elAriane) return false;
    elAriane.innerHTML = morceaux
      .map(function (m, i) {
        const dernier = i === morceaux.length - 1;
        return !dernier && m.href
          ? '<a href="' + m.href + '">' + echapper(m.titre) + "</a>"
          : '<span aria-current="page">' + echapper(m.titre) + "</span>";
      })
      .join('<span class="fil-separateur" aria-hidden="true">/</span>');
    return true;
  }

  // Rendu d'UNE section (sous-page). Remplit aussi l'en-tête de page :
  // [data-section-titre], [data-section-intro] et le fil d'Ariane
  // [data-fil-ariane] (ou l'ancien lien retour [data-lien-retour]).
  async function rendreSection(options) {
    const conteneur = options.conteneur;
    const projet = options.projet || null;
    const sectionId = options.sectionId || null;
    const pageItem = options.pageItem || "";
    const pageSection = options.pageSection || ""; // pour les cartes d'un sous-hub.
    if (!conteneur) return;

    conteneur.setAttribute("aria-busy", "true");
    conteneur.innerHTML =
      '<p class="galerie-message" data-i18n="contenu.chargement"></p>';
    window.I18n.appliquerTraductions(conteneur);

    try {
      const bloc = await chargerProjet(projet);
      const sections = sectionsDuBloc(bloc);
      const section = trouverSection(sections, sectionId);

      const elTitre = document.querySelector("[data-section-titre]");
      const elIntro = document.querySelector("[data-section-intro]");
      // Fil d'Ariane : hub du projet / chaîne des parents / section courante.
      const morceaux = [{ titre: titreProjet(projet), href: hrefProjet(projet) }];
      cheminSections(sections, section).forEach(function (s) {
        morceaux.push({
          titre: texteLocalise(s.titre),
          href:
            pageSection +
            "?p=" + encodeURIComponent(projet) +
            "&s=" + encodeURIComponent(s.id),
        });
      });
      if (!remplirFilAriane(morceaux)) {
        // Ancien gabarit : lien retour simple vers la section PARENTE si
        // sous-section, sinon vers l'accueil du projet. On fixe le texte ici
        // (et on retire data-i18n) pour qu'appliquerTraductions ne l'écrase pas.
        const elRetour = document.querySelector("[data-lien-retour]");
        if (elRetour) {
          elRetour.removeAttribute("data-i18n");
          if (section && section.parent) {
            const parentSection = trouverSection(sections, section.parent);
            elRetour.setAttribute(
              "href",
              pageSection +
                "?p=" + encodeURIComponent(projet) +
                "&s=" + encodeURIComponent(section.parent)
            );
            elRetour.textContent =
              "← " + texteLocalise(parentSection ? parentSection.titre : "");
          } else {
            elRetour.setAttribute("href", hrefProjet(projet));
            elRetour.textContent = window.I18n.t("contenu.retour");
          }
        }
      }

      if (!section) {
        conteneur.innerHTML =
          '<p class="galerie-message erreur" data-i18n="contenu.erreur"></p>';
        return;
      }

      const titre = texteLocalise(section.titre);
      if (elTitre) elTitre.textContent = titre;
      if (elIntro) elIntro.textContent = texteLocalise(section.intro);
      if (titre) document.title = titre + " — " + titreProjet(projet) + " — iAlexMG";

      const items = Array.isArray(section.items) ? section.items : [];
      const texte = texteLocalise(section.texte);
      // Les pastilles se déclarent par id dans les piliers ; leurs couleurs
      // vivent dans la clé "sources" du projet (squelette du hub).
      const sources = Array.isArray(bloc && bloc.sources) ? bloc.sources : [];
      const marques = creerRangeeMarques(section, sources);

      if (section.sousHub) {
        // Section-hub : ses sous-sections (parent === cette section) forment un
        // sous-hub imbriqué — une carte par sous-section, menant à sa page.
        // Ses items éventuels l'illustrent en tête (ex. la capture du terminal
        // sur le pilier Visualisations).
        const enfants = sections.filter(function (s) {
          return s.parent === (section.id || sectionId);
        });
        // Les items d'une section-hub ne sont pas des items parmi d'autres :
        // ils portent le sujet de la page (la capture des quatre vues, en tête
        // de l'arborescence des Visualisations). D'où la galerie de tête.
        const galerie = items.length
          ? '<div class="galerie galerie-tete">' + items.map(creerCarte).join("") + "</div>"
          : "";
        const sousHub = construireSousHubSections(enfants, projet, pageSection, sources);
        // Une section-hub illustrée EN TÊTE est une arborescence : l'image
        // générale est la racine, ses sous-sections les branches qui la
        // démontent. Une fourche descend donc de l'image vers les cartes, et la
        // prose passe SOUS l'arbre — une vue se lit juste sous l'image dont elle
        // est extraite, pas après un paragraphe. Les section-hubs sans
        // illustration (Historiques, Temps réel) n'ont pas de racine à montrer :
        // ils gardent leur prose avant les cartes.
        // `cartesEnTete` : le sous-hub passe AVANT la prose — la page se lit
        // alors comme un index navigable (les cartes numérotées d'un banc, avec
        // leur résultat), le récit détaillé venant en soutien dessous. Sans le
        // drapeau, on garde l'ordre habituel (prose puis cartes).
        conteneur.innerHTML =
          avertissementTexteFr(section.texte) +
          marques +
          (galerie && enfants.length
            ? // --n : le nombre de branches. La fourche et la grille des cartes
              // s'y accordent pour tenir sur une rangée unique (voir styles.css).
              '<div class="arborescence" style="--n: ' + enfants.length + '">' +
              galerie + creerFourcheArbre(enfants.length) + sousHub +
              "</div>" + rendreProse(texte)
            : section.cartesEnTete
            ? galerie + sousHub + rendreProse(texte)
            : galerie + rendreProse(texte) + sousHub);
      } else if (section.sousMenu && items.length) {
        // Sous-menu : une carte par item (mène à sa page item).
        conteneur.innerHTML =
          avertissementTexteFr(section.texte) +
          marques +
          rendreProse(texte) +
          construireSousHub(items, projet, section.id || sectionId, pageItem);
      } else if (items.length) {
        const aPdf = items.some(function (it) {
          return it.type === "pdf";
        });
        conteneur.innerHTML =
          banniereAvertissementPdf(aPdf) +
          avertissementTexteFr(section.texte) +
          marques +
          '<div class="galerie">' + items.map(creerCarte).join("") + "</div>" +
          rendreProse(texte);
      } else if (texte) {
        conteneur.innerHTML =
          avertissementTexteFr(section.texte) + marques + rendreProse(texte);
      } else if (marques) {
        conteneur.innerHTML = marques;
      } else {
        conteneur.innerHTML =
          '<div class="galerie"><p class="galerie-message" data-i18n="contenu.vide"></p></div>';
      }
    } catch (err) {
      console.error("[section] Échec du chargement :", err);
      conteneur.innerHTML =
        '<p class="galerie-message erreur" data-i18n="contenu.erreur"></p>';
    } finally {
      conteneur.setAttribute("aria-busy", "false");
      window.I18n.appliquerTraductions(conteneur);
    }
  }

  // Rendu d'UNE feuille (page item). Média en grand + texte détaillé.
  // Remplit l'en-tête : [data-section-titre], [data-section-intro] et le lien
  // retour [data-lien-retour] (vers la section pour un projet sectionné, vers le
  // hub pour un projet à items plats).
  async function rendreItem(options) {
    const conteneur = options.conteneur;
    const projet = options.projet || null;
    const sectionId = options.sectionId || null;
    const itemId = options.itemId || null;
    const pageSection = options.pageSection || "";
    if (!conteneur) return;

    conteneur.setAttribute("aria-busy", "true");
    conteneur.innerHTML =
      '<p class="galerie-message" data-i18n="contenu.chargement"></p>';
    window.I18n.appliquerTraductions(conteneur);

    const elTitre = document.querySelector("[data-section-titre]");
    const elIntro = document.querySelector("[data-section-intro]");

    try {
      const bloc = await chargerProjet(projet);
      const sections = sectionsDuBloc(bloc);

      let section = null;
      let items = [];
      if (sectionId) {
        section = trouverSection(sections, sectionId);
        items = section ? section.items || [] : [];
      } else {
        const plat = sections.filter(function (s) {
          return s._plat;
        })[0] || sections[0];
        items = plat ? plat.items || [] : [];
      }
      const item = trouverItem(items, itemId);

      // Fil d'Ariane : hub / chaîne des sections (sauf plat) / item courant.
      const morceaux = [{ titre: titreProjet(projet), href: hrefProjet(projet) }];
      if (section && !section._plat) {
        cheminSections(sections, section).forEach(function (s) {
          morceaux.push({
            titre: texteLocalise(s.titre),
            href:
              pageSection +
              "?p=" + encodeURIComponent(projet) +
              "&s=" + encodeURIComponent(s.id),
          });
        });
      }
      if (item) morceaux.push({ titre: texteLocalise(item.titre) });
      if (!remplirFilAriane(morceaux)) {
        // Ancien gabarit : lien retour simple vers la section (649) ou le hub
        // du projet (Python). On retire data-i18n car on fixe le texte ici
        // (sinon appliquerTraductions sur tout le document l'écraserait).
        const elRetour = document.querySelector("[data-lien-retour]");
        if (elRetour) {
          elRetour.removeAttribute("data-i18n");
          if (section && !section._plat) {
            elRetour.setAttribute(
              "href",
              pageSection +
                "?p=" + encodeURIComponent(projet) +
                "&s=" + encodeURIComponent(sectionId)
            );
            elRetour.textContent = "← " + texteLocalise(section.titre);
          } else {
            elRetour.setAttribute("href", hrefProjet(projet));
            elRetour.textContent = window.I18n.t("contenu.retour");
          }
        }
      }

      if (!item) {
        if (elTitre) elTitre.textContent = window.I18n.t("contenu.erreur");
        conteneur.innerHTML =
          '<p class="galerie-message erreur" data-i18n="contenu.erreur"></p>';
        return;
      }

      const titre = texteLocalise(item.titre);
      if (elTitre) elTitre.textContent = titre;
      if (elIntro) elIntro.textContent = texteLocalise(item.description);
      if (titre) document.title = titre + " — " + titreProjet(projet) + " — iAlexMG";

      const estPdf = item.type === "pdf";
      const media = estPdf
        ? creerVisionneusePdf(item, titre)
        : creerFigurePleine(item, titre);

      conteneur.innerHTML =
        banniereAvertissementPdf(estPdf) +
        avertissementTexteFr(item.texte) +
        media +
        rendreProse(texteLocalise(item.texte));
    } catch (err) {
      console.error("[item] Échec du chargement :", err);
      conteneur.innerHTML =
        '<p class="galerie-message erreur" data-i18n="contenu.erreur"></p>';
    } finally {
      conteneur.setAttribute("aria-busy", "false");
      window.I18n.appliquerTraductions(conteneur);
    }
  }

  return {
    rendre: rendre,
    rendreHub: rendreHub,
    rendreSources: rendreSources,
    rendreSection: rendreSection,
    rendreItem: rendreItem,
  };
})();

window.Contenu = Contenu;
