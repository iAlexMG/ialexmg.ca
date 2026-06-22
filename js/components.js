/*
 * components.js
 * --------------------------------------------------------------------------
 * Génère l'en-tête (logo + navigation + sélecteur de langue) et le pied de
 * page communs à toutes les pages. Cela évite de dupliquer le HTML dans
 * chaque fichier : on modifie la navigation à un seul endroit.
 *
 * Chaque page doit contenir :
 *   <header id="entete"></header>
 *   ... contenu ...
 *   <footer id="pied"></footer>
 *
 * Et indiquer la page courante sur la balise <body data-page="...">
 * pour mettre en évidence le lien actif dans le menu.
 *
 * Dépend de i18n.js (traductions) et de projects.js (window.PROJETS).
 * --------------------------------------------------------------------------
 */

const Composants = (function () {
  // Navigation construite dynamiquement : Accueil, puis un lien par PROJET
  // (depuis js/projects.js), puis À propos et Contact. Un seul endroit à
  // éditer pour ajouter un projet : la liste PROJETS.
  function liensNavigation() {
    const projets = (window.PROJETS || []).map(function (p) {
      return { href: p.href, page: p.page, i18n: p.titre };
    });
    return [
      { href: "index.html", page: "accueil", i18n: "nav.accueil" },
    ]
      .concat(projets)
      .concat([
        { href: "apropos.html", page: "apropos", i18n: "nav.apropos" },
        { href: "contact.html", page: "contact", i18n: "nav.contact" },
      ]);
  }

  function construireEntete(pageCourante) {
    const liens = liensNavigation().map(function (lien) {
      const actif = lien.page === pageCourante ? ' class="actif" aria-current="page"' : "";
      return (
        '<li><a href="' + lien.href + '"' + actif + ' data-i18n="' + lien.i18n + '"></a></li>'
      );
    }).join("");

    return (
      '<div class="conteneur entete-contenu">' +
      '  <a class="marque" href="index.html">iAlexMG</a>' +
      '  <button class="menu-bascule" id="menu-bascule" aria-label="Menu" aria-expanded="false">☰</button>' +
      '  <nav class="navigation" id="navigation" aria-label="Navigation principale">' +
      '    <ul>' + liens + "</ul>" +
      '  </nav>' +
      '  <button class="langue-bascule" id="langue-bascule"' +
      '          data-i18n="site.basculer_aria" data-i18n-attr="aria-label">' +
      '    <span data-i18n="site.basculer_langue"></span>' +
      "  </button>" +
      "</div>"
    );
  }

  // Grille des projets pour l'accueil, générée depuis window.PROJETS.
  // S'insère dans le conteneur [data-grille-projets] de index.html.
  function construireGrilleProjets() {
    return (window.PROJETS || [])
      .map(function (p) {
        return (
          '<a class="carte-portfolio" href="' + p.href + '">' +
          '  <h3 data-i18n="' + p.titre + '"></h3>' +
          '  <p data-i18n="' + p.desc + '"></p>' +
          '  <span class="fleche" data-i18n="accueil.voir_projet"></span> →' +
          "</a>"
        );
      })
      .join("");
  }

  function construirePied() {
    const annee = new Date().getFullYear();
    return (
      '<div class="conteneur pied-contenu">' +
      "  <span>© " + annee + " iAlexMG.</span> " +
      '  <span data-i18n="pied.droits"></span>' +
      "</div>"
    );
  }

  // Injecte en-tête et pied, puis branche les interactions et les traductions.
  function initialiser() {
    const pageCourante = document.body.getAttribute("data-page") || "";

    const entete = document.getElementById("entete");
    if (entete) entete.innerHTML = construireEntete(pageCourante);

    const pied = document.getElementById("pied");
    if (pied) pied.innerHTML = construirePied();

    // Grille des projets (présente uniquement sur l'accueil).
    const grilleProjets = document.querySelector("[data-grille-projets]");
    if (grilleProjets) grilleProjets.innerHTML = construireGrilleProjets();

    // Sélecteur de langue.
    const boutonLangue = document.getElementById("langue-bascule");
    if (boutonLangue) {
      boutonLangue.addEventListener("click", function () {
        window.I18n.basculerLangue();
      });
    }

    // Menu hamburger (mobile).
    const boutonMenu = document.getElementById("menu-bascule");
    const navigation = document.getElementById("navigation");
    if (boutonMenu && navigation) {
      boutonMenu.addEventListener("click", function () {
        const ouvert = navigation.classList.toggle("ouverte");
        boutonMenu.setAttribute("aria-expanded", ouvert ? "true" : "false");
      });
    }

    // Traduit le contenu fraîchement injecté.
    window.I18n.appliquerTraductions(document);
  }

  return { initialiser: initialiser };
})();

window.Composants = Composants;
