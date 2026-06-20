/*
 * documents.js
 * --------------------------------------------------------------------------
 * Charge la liste des documents PDF depuis data/python-docs.json et génère
 * dynamiquement des cartes affichant chaque PDF (aperçu intégré en lecture
 * seule, barre d'outils masquée). Utilisé par la page Documentation Python.
 *
 * Point d'entrée :
 *   Documents.rendre({ conteneur })
 *     - conteneur : élément DOM qui recevra les cartes.
 *
 * Schéma d'une entrée JSON :
 *   {
 *     "id": "py-1",
 *     "fichier": "assets/pdf/01-introduction.pdf",
 *     "titre":       { "fr": "...", "en": "..." },
 *     "description": { "fr": "...", "en": "..." }
 *   }
 *
 * EXTENSIONS FUTURES :
 *   - Catégories/chapitres : ajouter un champ "categorie" et filtrer ici.
 *   - Recherche : filtrer "donnees.items" sur titre/description avant rendu.
 * --------------------------------------------------------------------------
 */

const Documents = (function () {
  const CHEMIN_DONNEES = "data/python-docs.json";
  let cacheDonnees = null; // évite de re-télécharger le JSON à chaque rendu.

  // Charge (et met en cache) le JSON des documents.
  async function chargerDonnees() {
    if (cacheDonnees) return cacheDonnees;
    const reponse = await fetch(CHEMIN_DONNEES, { cache: "no-cache" });
    if (!reponse.ok) throw new Error("HTTP " + reponse.status);
    cacheDonnees = await reponse.json();
    return cacheDonnees;
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
    if (typeof champ === "string") return champ;
    const langue = window.I18n.langueActive();
    return champ[langue] || champ.fr || champ.en || "";
  }

  // Construit le HTML d'une carte document.
  function creerCarte(item) {
    const titre = texteLocalise(item.titre);
    const description = texteLocalise(item.description);
    const url = echapper(item.fichier);

    return (
      '<article class="carte doc-carte">' +
      // Aperçu intégré du PDF (#view=FitH ajuste la largeur). loading="lazy"
      // évite de charger les PDF hors écran immédiatement.
      '<div class="doc-apercu">' +
      // Aperçu intégré en LECTURE SEULE.
      // Paramètres après le # : toolbar=0 masque la barre d'outils (téléchargement,
      // impression, « ouvrir dans Drive »), navpanes=0 masque le panneau latéral,
      // view=FitH ajuste la largeur. (Pris en charge par Chrome/Edge ; voir note.)
      '  <iframe src="' + url + '#toolbar=0&navpanes=0&view=FitH" title="' + echapper(titre) + '" loading="lazy"></iframe>' +
      "</div>" +
      '<div class="carte-corps">' +
      '  <span class="badge" data-i18n="documents.badge"></span>' +
      '  <h3 class="carte-titre">' + echapper(titre) + "</h3>" +
      '  <p class="carte-desc">' + echapper(description) + "</p>" +
      "</div>" +
      "</article>"
    );
  }

  // Rendu principal. Gère les états : chargement, vide, erreur, contenu.
  async function rendre(options) {
    const conteneur = options.conteneur;
    if (!conteneur) return;

    conteneur.setAttribute("aria-busy", "true");
    conteneur.innerHTML =
      '<p class="galerie-message" data-i18n="documents.chargement"></p>';
    window.I18n.appliquerTraductions(conteneur);

    try {
      const donnees = await chargerDonnees();
      const items = Array.isArray(donnees.items) ? donnees.items : [];

      if (items.length === 0) {
        conteneur.innerHTML =
          '<p class="galerie-message" data-i18n="documents.vide"></p>';
      } else {
        conteneur.innerHTML = items.map(creerCarte).join("");
      }
    } catch (err) {
      console.error("[documents] Échec du chargement :", err);
      conteneur.innerHTML =
        '<p class="galerie-message erreur" data-i18n="documents.erreur"></p>';
    } finally {
      conteneur.setAttribute("aria-busy", "false");
      window.I18n.appliquerTraductions(conteneur);
    }
  }

  return { rendre: rendre };
})();

window.Documents = Documents;
