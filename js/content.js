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
          if (m[2] && m[2].trim()) out += "<p>" + echapper(m[2].trim()) + "</p>";
          return out;
        }
        return "<p>" + echapper(t) + "</p>";
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
  function creerCarteLien(titre, desc, href, fleche) {
    return (
      '<a class="carte-portfolio" href="' + href + '">' +
      "  <h3>" + echapper(titre) + "</h3>" +
      "  <p>" + echapper(desc) + "</p>" +
      '  <span class="fleche">' + echapper(fleche) + " →</span>" +
      "</a>"
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

  // Sous-hub de SECTIONS : une carte par sous-section (mène à sa page section).
  // Sert à imbriquer un niveau (ex. « La formation » -> LEAN / vbt / conclusion).
  function construireSousHubSections(sections, projet, pageSection) {
    return (
      '<div class="grille-hub">' +
      sections
        .map(function (section) {
          const titre = texteLocalise(section.titre);
          const desc =
            texteLocalise(section.accroche) ||
            texteLocalise(section.intro) ||
            texteLocalise(section.texte);
          const href =
            pageSection +
            "?p=" + encodeURIComponent(projet) +
            "&s=" + encodeURIComponent(section.id);
          return creerCarteLien(titre, desc, href, libelleCarteSection(section));
        })
        .join("") +
      "</div>"
    );
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
        conteneur.innerHTML =
          lienCode +
          '<div class="grille-hub">' +
          sections
            .map(function (section, idx) {
              const titre = texteLocalise(section.titre);
              // Accroche courte pour la carte du hub ; à défaut l'intro, puis le
              // texte complet. 'accroche' évite d'étaler toute la prose (ex. la
              // Conclusion, qui n'a pas d'intro) sur la table des matières.
              const desc =
                texteLocalise(section.accroche) ||
                texteLocalise(section.intro) ||
                texteLocalise(section.texte);
              const id = section.id || String(idx);
              const href =
                pageSection +
                "?p=" + encodeURIComponent(projet) +
                "&s=" + encodeURIComponent(id);
              return creerCarteLien(titre, desc, href, libelleCarteSection(section));
            })
            .join("") +
          "</div>";
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

  // Rendu d'UNE section (sous-page). Remplit aussi l'en-tête de page :
  // [data-section-titre], [data-section-intro] et le lien retour [data-lien-retour].
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
      const elRetour = document.querySelector("[data-lien-retour]");
      // Lien retour : vers la section PARENTE si sous-section (ex. une partie de
      // la formation -> le hub Formation), sinon vers l'accueil du projet. On
      // fixe le texte ici (et on retire data-i18n) pour qu'appliquerTraductions
      // ne l'écrase pas.
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

      if (section.sousHub) {
        // Section-hub : ses sous-sections (parent === cette section) forment un
        // sous-hub imbriqué — une carte par sous-section, menant à sa page.
        const enfants = sections.filter(function (s) {
          return s.parent === (section.id || sectionId);
        });
        conteneur.innerHTML =
          rendreProse(texte) +
          construireSousHubSections(enfants, projet, pageSection);
      } else if (section.sousMenu && items.length) {
        // Sous-menu : une carte par item (mène à sa page item).
        conteneur.innerHTML =
          rendreProse(texte) +
          construireSousHub(items, projet, section.id || sectionId, pageItem);
      } else if (items.length) {
        const aPdf = items.some(function (it) {
          return it.type === "pdf";
        });
        conteneur.innerHTML =
          banniereAvertissementPdf(aPdf) +
          '<div class="galerie">' + items.map(creerCarte).join("") + "</div>" +
          rendreProse(texte);
      } else if (texte) {
        conteneur.innerHTML = rendreProse(texte);
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
    const elRetour = document.querySelector("[data-lien-retour]");

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

      // Lien retour : vers la section (649) ou le hub du projet (Python).
      // On retire data-i18n car on fixe le texte ici (sinon appliquerTraductions
      // sur tout le document écraserait le titre de section).
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
    rendreSection: rendreSection,
    rendreItem: rendreItem,
  };
})();

window.Contenu = Contenu;
