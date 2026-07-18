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
  // Navigation complète : Trading ▾ (Crypto, Indices) · Statistiques ·
  // Formations · À propos · Contact. L'accueil s'atteint par la marque.
  // Le groupe Trading est un menu déroulant sur desktop ; sur mobile ses deux
  // entrées s'affichent à plat (le déclencheur devient une étiquette).
  function liensNavigation() {
    return [
      {
        i18n: "nav.trading",
        pages: ["crypto", "indices"],
        sous: [
          { href: "crypto.html", page: "crypto", i18n: "projet.crypto" },
          { href: "indices.html", page: "indices", i18n: "projet.indices" },
        ],
      },
      { href: "statistiques.html", page: "statistiques", i18n: "projet.statistiques" },
      { href: "formations.html", page: "formations", i18n: "projet.formations" },
      { href: "apropos.html", page: "apropos", i18n: "nav.apropos" },
      { href: "contact.html", page: "contact", i18n: "nav.contact" },
    ];
  }

  function construireLien(lien, pageCourante) {
    const actif = lien.page === pageCourante ? ' class="actif" aria-current="page"' : "";
    return '<a href="' + lien.href + '"' + actif + ' data-i18n="' + lien.i18n + '"></a>';
  }

  function construireEntete(pageCourante) {
    const liens = liensNavigation().map(function (lien) {
      if (!lien.sous) return "<li>" + construireLien(lien, pageCourante) + "</li>";

      // Groupe déroulant. Le déclencheur s'allume quand une page du groupe
      // est active ; le caret est décoratif.
      const actif = lien.pages.indexOf(pageCourante) !== -1 ? " actif" : "";
      const sousLiens = lien.sous
        .map(function (s) { return "<li>" + construireLien(s, pageCourante) + "</li>"; })
        .join("");
      return (
        '<li class="nav-groupe">' +
        '<button class="nav-declencheur' + actif + '" aria-expanded="false" aria-haspopup="true">' +
        '<span data-i18n="' + lien.i18n + '"></span><span class="nav-caret" aria-hidden="true">▾</span>' +
        "</button>" +
        '<ul class="nav-sous-menu">' + sousLiens + "</ul>" +
        "</li>"
      );
    }).join("");

    return (
      '<div class="conteneur entete-contenu">' +
      '  <a class="marque" href="/">iAlexMG</a>' +
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

  // Rangées de projet pour l'accueil, générées depuis window.PROJETS.
  // S'insèrent dans le conteneur [data-rangees-projets] de index.html.
  // Chaque rangée : grande capture réelle d'un côté (quand le projet en a
  // une), titre + accroche + liens directs vers les piliers de l'autre.
  // Les visuels alternent gauche/droite ; l'en-tête de groupe « Trading »
  // coiffe les deux rangées crypto et indices sans les fusionner.
  function construireRangeesProjets() {
    const morceaux = [];
    let visuelADroite = false;

    (window.PROJETS || []).forEach(function (p) {
      if (p.id === "crypto") {
        morceaux.push(
          '<p class="groupe-titre" data-i18n="accueil.groupe_trading"></p>'
        );
      }

      const visuel = p.miniature
        ? '<a class="rangee-visuel" href="' + p.href + '" tabindex="-1" aria-hidden="true">' +
          '<img src="' + encodeURI(p.miniature) + '" alt="" loading="lazy">' +
          "</a>"
        : "";

      const piliers = (p.piliers || [])
        .map(function (pilier) {
          return (
            '<a class="pilier-chip" href="projet-section.html?p=' +
            encodeURIComponent(p.id) + "&s=" + encodeURIComponent(pilier.s) +
            '" data-i18n="' + pilier.i18n + '"></a>'
          );
        })
        .join("");

      morceaux.push(
        '<article class="rangee-projet' +
        (visuel && visuelADroite ? " rangee-inverse" : "") +
        (visuel ? "" : " rangee-sans-visuel") + '">' +
        visuel +
        '<div class="rangee-corps">' +
        '  <h3><a href="' + p.href + '" data-i18n="' + p.titre + '"></a></h3>' +
        '  <p class="rangee-accroche" data-i18n="' + p.desc + '"></p>' +
        (piliers ? '<div class="rangee-piliers">' + piliers + "</div>" : "") +
        '  <a class="rangee-voir" href="' + p.href + '">' +
        '<span data-i18n="accueil.voir_projet"></span> →</a>' +
        "</div>" +
        "</article>"
      );

      // On n'alterne que lorsque la rangée a un visuel : une rangée en texte
      // seul ne « pèse » d'aucun côté.
      if (visuel) visuelADroite = !visuelADroite;
    });

    return morceaux.join("");
  }

  function construirePied() {
    const annee = new Date().getFullYear();
    return (
      '<div class="conteneur pied-contenu">' +
      "  <span>© " + annee + " iAlexMG.</span> " +
      '  <span data-i18n="pied.droits"></span> ' +
      // Date de dernière mise à jour, remplie par main.js (rendreDateMaj).
      "  <span data-maj></span>" +
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

    // Rangées de projets (présentes uniquement sur l'accueil).
    const rangeesProjets = document.querySelector("[data-rangees-projets]");
    if (rangeesProjets) rangeesProjets.innerHTML = construireRangeesProjets();

    // Menu déroulant Trading : clic pour ouvrir/fermer (touche), fermeture au
    // clic hors du groupe et à Échap. Le survol l'ouvre aussi, en CSS.
    const groupe = document.querySelector(".nav-groupe");
    const declencheur = groupe && groupe.querySelector(".nav-declencheur");
    if (groupe && declencheur) {
      function fermerGroupe() {
        groupe.classList.remove("ouvert");
        declencheur.setAttribute("aria-expanded", "false");
      }
      declencheur.addEventListener("click", function () {
        const ouvert = groupe.classList.toggle("ouvert");
        declencheur.setAttribute("aria-expanded", ouvert ? "true" : "false");
      });
      document.addEventListener("click", function (e) {
        if (!groupe.contains(e.target)) fermerGroupe();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") fermerGroupe();
      });
    }

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
