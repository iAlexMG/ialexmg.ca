/*
 * gallery.js
 * --------------------------------------------------------------------------
 * Charge le contenu depuis data/gallery.json et génère dynamiquement les
 * cartes de la galerie. Utilisé à la fois par la page Galerie (tous domaines)
 * et par les pages de domaine (filtré sur un domaine).
 *
 * Point d'entrée :
 *   Galerie.rendre({ conteneur, domaine })
 *     - conteneur : élément DOM qui recevra les cartes
 *     - domaine   : (optionnel) filtre, ex "ml". Si absent -> tout afficher.
 *
 * Le contenu est mis en cache après le 1er chargement pour permettre un
 * redessin instantané lors d'un changement de langue.
 *
 * EXTENSIONS FUTURES (laissées volontairement ouvertes) :
 *   - Recherche : filtrer "donnees.items" sur titre/description avant rendu.
 *   - Filtres par domaine sur la page Galerie : réutiliser le paramètre "domaine".
 *   - Lightbox / plein écran : voir le hook data-lightbox sur les cartes image.
 *   - Lecteur vidéo custom : remplacer creerEmbedYoutube() par votre lecteur.
 * --------------------------------------------------------------------------
 */

const Galerie = (function () {
  const CHEMIN_DONNEES = "data/gallery.json";
  let cacheDonnees = null; // évite de re-télécharger le JSON à chaque rendu.

  // Charge (et met en cache) le JSON de la galerie.
  async function chargerDonnees() {
    if (cacheDonnees) return cacheDonnees;
    const reponse = await fetch(CHEMIN_DONNEES, { cache: "no-cache" });
    if (!reponse.ok) throw new Error("HTTP " + reponse.status);
    cacheDonnees = await reponse.json();
    return cacheDonnees;
  }

  // Extrait l'identifiant d'une vidéo YouTube depuis différentes formes d'URL.
  function extraireIdYoutube(url) {
    const motifs = [
      /[?&]v=([^&]+)/, // https://www.youtube.com/watch?v=ID
      /youtu\.be\/([^?]+)/, // https://youtu.be/ID
      /youtube\.com\/embed\/([^?]+)/, // https://www.youtube.com/embed/ID
    ];
    for (const motif of motifs) {
      const m = url.match(motif);
      if (m) return m[1];
    }
    return null;
  }

  // Construit un iframe d'intégration YouTube.
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

  // Construit une vignette image.
  function creerImage(item, titre) {
    const src = item.miniature || item.url;
    return (
      '<div class="media-cadre">' +
      // data-lightbox + data-url : hooks prêts pour une future visionneuse plein écran.
      '<img src="' + echapper(src) + '" alt="' + echapper(titre) + '"' +
      ' loading="lazy" data-lightbox="1" data-url="' + echapper(item.url) + '">' +
      "</div>"
    );
  }

  // Petite protection contre l'injection HTML dans les champs texte du JSON.
  function echapper(texte) {
    return String(texte == null ? "" : texte)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Renvoie le texte bilingue d'un champ ({fr, en}) selon la langue active.
  function texteLocalise(champ) {
    if (champ == null) return "";
    if (typeof champ === "string") return champ; // tolère un champ non bilingue.
    const langue = window.I18n.langueActive();
    return champ[langue] || champ.fr || champ.en || "";
  }

  // Construit le HTML d'une carte (image ou vidéo).
  function creerCarte(item) {
    const titre = texteLocalise(item.titre);
    const description = texteLocalise(item.description);
    const estVideo = item.type === "video";
    const media = estVideo ? creerEmbedYoutube(item.url, titre) : creerImage(item, titre);
    const badge = estVideo
      ? '<span class="badge" data-i18n="galerie.badge_video"></span>'
      : '<span class="badge" data-i18n="galerie.badge_image"></span>';

    return (
      '<article class="carte" data-domaine="' + echapper(item.domaine) + '">' +
      media +
      '<div class="carte-corps">' +
      "  " + badge +
      '  <h3 class="carte-titre">' + echapper(titre) + "</h3>" +
      '  <p class="carte-desc">' + echapper(description) + "</p>" +
      "</div>" +
      "</article>"
    );
  }

  // Rendu principal. Gère les états : chargement, vide, erreur, contenu.
  async function rendre(options) {
    const conteneur = options.conteneur;
    const domaine = options.domaine || null;
    if (!conteneur) return;

    conteneur.setAttribute("aria-busy", "true");
    conteneur.innerHTML =
      '<p class="galerie-message" data-i18n="galerie.chargement"></p>';
    window.I18n.appliquerTraductions(conteneur);

    try {
      const donnees = await chargerDonnees();
      let items = Array.isArray(donnees.items) ? donnees.items : [];

      // Filtre par domaine si demandé (pages de portfolio dédiées).
      if (domaine) items = items.filter((it) => it.domaine === domaine);

      if (items.length === 0) {
        conteneur.innerHTML =
          '<p class="galerie-message" data-i18n="galerie.vide"></p>';
      } else {
        conteneur.innerHTML = items.map(creerCarte).join("");
      }
    } catch (err) {
      console.error("[galerie] Échec du chargement :", err);
      conteneur.innerHTML =
        '<p class="galerie-message erreur" data-i18n="galerie.erreur"></p>';
    } finally {
      conteneur.setAttribute("aria-busy", "false");
      // Traduit les badges et messages injectés.
      window.I18n.appliquerTraductions(conteneur);
    }
  }

  return { rendre: rendre };
})();

window.Galerie = Galerie;
