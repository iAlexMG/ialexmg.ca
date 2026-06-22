/*
 * main.js
 * --------------------------------------------------------------------------
 * Point d'entrée commun, chargé en dernier sur chaque page.
 *
 * Rôle :
 *   1. Fixer la langue active sur <html lang="…"> dès le départ.
 *   2. Construire l'en-tête, la grille de projets (accueil) et le pied.
 *   3. Appliquer les traductions à la page.
 *   4. Rendre le contenu du projet si la page contient un [data-projet].
 *   5. Re-rendre ce contenu quand la langue change (évènement "langue:changee").
 *
 * Une page de projet déclare son contenu ainsi :
 *   <div data-projet="python"></div>   -> rend le contenu du projet "python"
 * --------------------------------------------------------------------------
 */

(function () {
  // Rend le contenu de chaque projet présent sur la page.
  // (window.Contenu n'est chargé que sur les pages de projet.)
  function rendreProjets() {
    if (!window.Contenu) return;

    // Page de projet « classique » (tout le contenu).
    document.querySelectorAll("[data-projet]").forEach(function (conteneur) {
      window.Contenu.rendre({
        conteneur: conteneur,
        projet: conteneur.getAttribute("data-projet") || null,
      });
    });

    // Hub de projet : une carte par section, menant à sa sous-page.
    document.querySelectorAll("[data-projet-hub]").forEach(function (conteneur) {
      window.Contenu.rendreHub({
        conteneur: conteneur,
        projet: conteneur.getAttribute("data-projet-hub") || null,
        pageSection: conteneur.getAttribute("data-page-section") || "",
      });
    });

    // Sous-page d'une section : le choix vient du paramètre d'URL ?s=<id>.
    document.querySelectorAll("[data-projet-section]").forEach(function (conteneur) {
      const params = new URLSearchParams(window.location.search);
      window.Contenu.rendreSection({
        conteneur: conteneur,
        projet: conteneur.getAttribute("data-projet-section") || null,
        sectionId: params.get("s"),
      });
    });
  }

  function initialiser() {
    // 1. Appliquer la langue mémorisée à l'attribut lang du document.
    document.documentElement.setAttribute("lang", window.I18n.langueActive());

    // 2 & 3. En-tête / grille projets / pied + traductions (Composants applique
    // déjà les traductions sur le contenu injecté).
    window.Composants.initialiser();

    // 4. Contenu du projet éventuel.
    rendreProjets();

    // 5. Redessiner au changement de langue (titres/descriptions bilingues
    //    et avertissement PDF FR/EN).
    document.addEventListener("langue:changee", function () {
      rendreProjets();
    });
  }

  // Lance l'initialisation une fois le DOM prêt.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialiser);
  } else {
    initialiser();
  }
})();
