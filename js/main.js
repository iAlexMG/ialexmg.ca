/*
 * main.js
 * --------------------------------------------------------------------------
 * Point d'entrée commun, chargé en dernier sur chaque page.
 *
 * Rôle :
 *   1. Fixer la langue active sur <html lang="…"> dès le départ.
 *   2. Construire l'en-tête et le pied (via Composants).
 *   3. Appliquer les traductions à la page.
 *   4. Si la page contient une galerie ([data-galerie]), la rendre.
 *   5. Re-rendre la galerie quand la langue change (évènement "langue:changee").
 *
 * Une page déclare une galerie ainsi :
 *   <div data-galerie></div>                 -> galerie complète (tous domaines)
 *   <div data-galerie data-domaine="ml"></div> -> galerie filtrée sur un domaine
 * --------------------------------------------------------------------------
 */

(function () {
  // Rend toutes les galeries présentes sur la page.
  function rendreGaleries() {
    document.querySelectorAll("[data-galerie]").forEach(function (conteneur) {
      window.Galerie.rendre({
        conteneur: conteneur,
        domaine: conteneur.getAttribute("data-domaine") || null,
      });
    });
  }

  function initialiser() {
    // 1. Appliquer la langue mémorisée à l'attribut lang du document.
    document.documentElement.setAttribute("lang", window.I18n.langueActive());

    // 2 & 3. En-tête / pied + traductions (Composants applique déjà les traductions).
    window.Composants.initialiser();

    // 4. Galeries éventuelles.
    rendreGaleries();

    // 5. Redessiner les galeries au changement de langue (titres/descriptions bilingues).
    document.addEventListener("langue:changee", function () {
      rendreGaleries();
    });
  }

  // Lance l'initialisation une fois le DOM prêt.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialiser);
  } else {
    initialiser();
  }
})();
