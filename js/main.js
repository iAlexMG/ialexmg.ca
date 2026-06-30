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
  // Date de dernière mise à jour du site (format ISO AAAA-MM-JJ).
  // ⚙️ À METTRE À JOUR à chaque déploiement notable : c'est la seule valeur à
  // changer pour rafraîchir la bannière « en construction » de l'accueil.
  const DATE_MAJ = "2026-06-30";

  // Formate DATE_MAJ dans la langue active (ex. « 30 juin 2026 » / « June 30, 2026 »).
  function formaterDateMaj(langue) {
    const morceaux = DATE_MAJ.split("-").map(Number);
    const date = new Date(morceaux[0], morceaux[1] - 1, morceaux[2]);
    const locale = langue === "en" ? "en-US" : "fr-CA";
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  }

  // Remplit la bannière « en construction » de l'accueil (avertissement + date).
  // Le texte est construit ici (et non via data-i18n) pour y intégrer la date.
  function rendreBanniereConstruction() {
    const banniere = document.querySelector("[data-construction]");
    if (!banniere) return; // présente uniquement sur l'accueil.
    const langue = window.I18n.langueActive();
    banniere.textContent =
      window.I18n.t("accueil.construction") +
      " · " +
      window.I18n.t("accueil.maj") +
      " " +
      formaterDateMaj(langue);
  }

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

    // Hub de projet (table des matières) : une carte par section OU par item.
    document.querySelectorAll("[data-projet-hub]").forEach(function (conteneur) {
      window.Contenu.rendreHub({
        conteneur: conteneur,
        projet: conteneur.getAttribute("data-projet-hub") || null,
        pageSection: conteneur.getAttribute("data-page-section") || "",
        pageItem: conteneur.getAttribute("data-page-item") || "",
      });
    });

    // Sous-page d'une section : projet via l'attribut OU ?p=, section via ?s=.
    document.querySelectorAll("[data-projet-section]").forEach(function (conteneur) {
      const params = new URLSearchParams(window.location.search);
      window.Contenu.rendreSection({
        conteneur: conteneur,
        projet: conteneur.getAttribute("data-projet-section") || params.get("p"),
        sectionId: params.get("s"),
        pageItem: conteneur.getAttribute("data-page-item") || "",
      });
    });

    // Page feuille (item) : projet via l'attribut OU ?p=, ?s= (optionnel), ?i=.
    document.querySelectorAll("[data-projet-item]").forEach(function (conteneur) {
      const params = new URLSearchParams(window.location.search);
      window.Contenu.rendreItem({
        conteneur: conteneur,
        projet: conteneur.getAttribute("data-projet-item") || params.get("p"),
        sectionId: params.get("s"),
        itemId: params.get("i"),
        pageSection: conteneur.getAttribute("data-page-section") || "",
      });
    });
  }

  function initialiser() {
    // 1. Appliquer la langue mémorisée à l'attribut lang du document.
    document.documentElement.setAttribute("lang", window.I18n.langueActive());

    // 2 & 3. En-tête / grille projets / pied + traductions (Composants applique
    // déjà les traductions sur le contenu injecté).
    window.Composants.initialiser();

    // 4. Bannière « en construction » (accueil) + contenu du projet éventuel.
    rendreBanniereConstruction();
    rendreProjets();

    // 5. Redessiner au changement de langue (bannière + titres/descriptions
    //    bilingues et avertissement PDF FR/EN).
    document.addEventListener("langue:changee", function () {
      rendreBanniereConstruction();
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
