/*
 * content.js
 * --------------------------------------------------------------------------
 * Rendu du contenu d'un PROJET. Remplace les anciens modules gallery.js et
 * documents.js : un même projet peut mélanger images, vidéos YouTube et PDF.
 *
 * Charge data/projets.json puis génère les cartes du projet demandé.
 *
 * Point d'entrée :
 *   Contenu.rendre({ conteneur, projet })
 *     - conteneur : élément DOM qui recevra les cartes.
 *     - projet    : id du projet (clé dans projets.json). Obligatoire.
 *
 * Schéma d'un item (dans projets.json) :
 *   { "type": "image", "url": "assets/x.png", "miniature": "",
 *     "titre": {fr,en}, "description": {fr,en} }
 *   { "type": "video", "url": "https://youtu.be/ID",
 *     "titre": {fr,en}, "description": {fr,en} }
 *   { "type": "pdf",   "fichier": "assets/pdf/x.pdf",
 *     "titre": {fr,en}, "description": {fr,en} }
 *
 * EXTENSIONS FUTURES (laissées ouvertes) :
 *   - Recherche / filtres : filtrer "items" avant rendu.
 *   - Lightbox : hook data-lightbox/data-url déjà posé sur les images.
 *   - Lecteur vidéo custom : remplacer creerEmbedYoutube().
 * --------------------------------------------------------------------------
 */

const Contenu = (function () {
  const CHEMIN_DONNEES = "data/projets.json";
  let cacheDonnees = null; // évite de re-télécharger le JSON à chaque rendu.

  // Charge (et met en cache) le JSON des projets.
  async function chargerDonnees() {
    if (cacheDonnees) return cacheDonnees;
    const reponse = await fetch(CHEMIN_DONNEES, { cache: "no-cache" });
    if (!reponse.ok) throw new Error("HTTP " + reponse.status);
    cacheDonnees = await reponse.json();
    return cacheDonnees;
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
      // « Voir » : ouvre le PDF en plein écran dans un nouvel onglet.
      '    <a class="bouton" href="' + url + '" target="_blank" rel="noopener"' +
      '       data-i18n="documents.voir"></a>' +
      // « Télécharger » : l'attribut download force le téléchargement.
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

  // --- Sections (regroupement du contenu d'un projet) -----------------------

  // Identifiant d'ancre stable pour une section (sommaire + lien profond #...).
  function ancreSection(section, idx) {
    if (section.id) return "sec-" + String(section.id);
    return "sec-" + (idx + 1);
  }

  // Rend une section : titre + intro optionnelle + (grille de cartes OU prose).
  // Une section peut être :
  //   - une grille (elle a des 'items') ;
  //   - un bloc de texte seul (champ 'texte' {fr,en}, sans items) — ex. Conclusion ;
  //   - vide (ni items ni texte) -> message « en construction ».
  function creerSection(section, idx) {
    const titre = texteLocalise(section.titre);
    const intro = texteLocalise(section.intro);
    const texte = texteLocalise(section.texte);
    const items = Array.isArray(section.items) ? section.items : [];
    const ancre = ancreSection(section, idx);

    let corps;
    if (items.length) {
      corps = '<div class="galerie">' + items.map(creerCarte).join("") + "</div>";
    } else if (texte) {
      // Bloc de prose (chaque double saut de ligne = un paragraphe).
      corps =
        '<div class="section-prose">' +
        texte
          .split(/\n\s*\n/)
          .map(function (p) {
            return "<p>" + echapper(p.trim()) + "</p>";
          })
          .join("") +
        "</div>";
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

  // Rendu principal. Gère les états : chargement, vide, erreur, contenu.
  async function rendre(options) {
    const conteneur = options.conteneur;
    const projet = options.projet || null;
    if (!conteneur) return;

    conteneur.setAttribute("aria-busy", "true");
    conteneur.innerHTML =
      '<p class="galerie-message" data-i18n="contenu.chargement"></p>';
    window.I18n.appliquerTraductions(conteneur);

    try {
      const donnees = await chargerDonnees();
      const projets = donnees.projets || {};
      const bloc = projet && projets[projet] ? projets[projet] : null;
      const sections = sectionsDuBloc(bloc);
      const total = sections.reduce(function (n, s) {
        return n + (Array.isArray(s.items) ? s.items.length : 0);
      }, 0);

      if (total === 0) {
        // Aucun contenu : on garde la grille et le message « en construction ».
        conteneur.classList.add("galerie");
        conteneur.innerHTML =
          '<p class="galerie-message" data-i18n="contenu.vide"></p>';
      } else if (sections.length === 1 && sections[0]._plat) {
        // Ancien schéma (items plats) : rendu grille direct, inchangé.
        conteneur.classList.add("galerie");
        const items = sections[0].items;
        conteneur.innerHTML =
          banniereAvertissementPdf(contientPdf(sections)) +
          items.map(creerCarte).join("");
      } else {
        // Nouveau schéma à sections : le conteneur devient un empilement de
        // sections (chacune avec sa propre grille), précédé d'un sommaire.
        conteneur.classList.remove("galerie");
        conteneur.innerHTML =
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
      // Traduit badges, messages et boutons fraîchement injectés.
      window.I18n.appliquerTraductions(conteneur);
    }
  }

  return { rendre: rendre };
})();

window.Contenu = Contenu;
