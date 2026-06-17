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
 * Et indiquer la page courante sur la balise <body data-page="galerie">
 * pour mettre en évidence le lien actif dans le menu.
 *
 * Dépend de i18n.js (traductions appliquées après injection).
 * --------------------------------------------------------------------------
 */

const Composants = (function () {
  // Liste centrale des liens de navigation.
  // "page" correspond à la valeur de body[data-page] pour marquer l'onglet actif.
  const LIENS = [
    { href: "index.html", page: "accueil", i18n: "nav.accueil" },
    { href: "galerie.html", page: "galerie", i18n: "nav.galerie" },
    { href: "ml.html", page: "ml", i18n: "domaine.ml.court" },
    { href: "statistiques.html", page: "statistiques", i18n: "domaine.statistiques" },
    { href: "crypto.html", page: "crypto", i18n: "domaine.crypto" },
    { href: "quantower.html", page: "quantower", i18n: "domaine.quantower" },
    { href: "apropos.html", page: "apropos", i18n: "nav.apropos" },
    { href: "contact.html", page: "contact", i18n: "nav.contact" },
  ];

  function construireEntete(pageCourante) {
    const liens = LIENS.map(function (lien) {
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
