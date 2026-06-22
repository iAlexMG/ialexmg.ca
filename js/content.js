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
    return creerCarteMedia(item, titre, description);
  }

  // Avertissement affiché en anglais quand le projet contient des PDF
  // (les PDF ne sont disponibles qu'en français).
  function banniereAvertissementPdf(items) {
    const enAnglais = window.I18n.langueActive() === "en";
    const aDesPdf = items.some((it) => it.type === "pdf");
    if (!enAnglais || !aDesPdf) return "";
    return '<p class="avertissement-langue" data-i18n="documents.avertissement_fr"></p>';
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
      const items = bloc && Array.isArray(bloc.items) ? bloc.items : [];

      if (items.length === 0) {
        conteneur.innerHTML =
          '<p class="galerie-message" data-i18n="contenu.vide"></p>';
      } else {
        conteneur.innerHTML =
          banniereAvertissementPdf(items) + items.map(creerCarte).join("");
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
