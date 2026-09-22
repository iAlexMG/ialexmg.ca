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
  // Navigation complète : Trading ▾ (Crypto, Indices) · Machine Learning ·
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
      { href: "machine-learning.html", page: "machine-learning", i18n: "projet.machine-learning" },
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

  // Cartes de projet pour l'accueil, générées depuis window.PROJETS et
  // s'insérant dans le conteneur [data-cartes-accueil] de index.html. Trois
  // cartes côte à côte au large, empilées en mobile : visuel 16:9 en tête,
  // puis titre, accroche, liens directs vers les piliers et « Voir le projet ».
  // Les projets d'un même groupe (GROUPES_ACCUEIL) partagent une carte : leurs
  // miniatures s'y côtoient, chacune menant à son hub, et un lien par hub
  // remplace « Voir le projet ».
  function miniature(p) {
    return (
      '<a href="' + p.href + '" tabindex="-1" aria-hidden="true">' +
      '<img src="' + encodeURI(p.miniature) + '" alt="" loading="lazy">' +
      "</a>"
    );
  }

  function carteProjet(p) {
    const piliers = (p.piliers || [])
      .map(function (pilier) {
        return (
          '<a class="pilier-chip" href="projet-section.html?p=' +
          encodeURIComponent(p.id) + "&s=" + encodeURIComponent(pilier.s) +
          '" data-i18n="' + pilier.i18n + '"></a>'
        );
      })
      .join("");

    return (
      '<article class="carte-accueil">' +
      (p.miniature ? '<div class="carte-accueil-visuel">' + miniature(p) + "</div>" : "") +
      '<div class="carte-accueil-corps">' +
      '  <h3><a href="' + p.href + '" data-i18n="' + p.titre + '"></a></h3>' +
      '  <p class="carte-accueil-accroche" data-i18n="' + p.desc + '"></p>' +
      (piliers ? '<div class="carte-accueil-piliers">' + piliers + "</div>" : "") +
      '  <div class="carte-accueil-liens">' +
      '    <a class="carte-accueil-voir" href="' + p.href + '">' +
      '<span data-i18n="accueil.voir_projet"></span> →</a>' +
      "  </div>" +
      "</div>" +
      "</article>"
    );
  }

  function carteGroupe(groupe, membres) {
    const visuels = membres.filter(function (p) { return p.miniature; }).map(miniature).join("");
    const liens = membres
      .map(function (p) {
        return (
          '<a class="carte-accueil-voir" href="' + p.href + '">' +
          '<span data-i18n="' + p.titre + '"></span> →</a>'
        );
      })
      .join("");

    return (
      '<article class="carte-accueil">' +
      (visuels ? '<div class="carte-accueil-visuel carte-accueil-duo">' + visuels + "</div>" : "") +
      '<div class="carte-accueil-corps">' +
      '  <h3 data-i18n="' + groupe.titre + '"></h3>' +
      '  <p class="carte-accueil-accroche" data-i18n="' + groupe.desc + '"></p>' +
      '  <div class="carte-accueil-liens">' + liens + "</div>" +
      "</div>" +
      "</article>"
    );
  }

  function construireCartesAccueil() {
    const projets = window.PROJETS || [];
    const groupes = window.GROUPES_ACCUEIL || {};
    const dejaRendus = {};

    return projets
      .map(function (p) {
        const groupe = p.groupe && groupes[p.groupe];
        if (!groupe) return carteProjet(p);
        if (dejaRendus[p.groupe]) return "";
        dejaRendus[p.groupe] = true;
        return carteGroupe(
          groupe,
          projets.filter(function (q) { return q.groupe === p.groupe; })
        );
      })
      .join("");
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

  // Bouton flottant « retour en haut » : créé une fois, ajouté au <body>.
  // Apparaît après un défilement notable, ramène en haut (respecte
  // prefers-reduced-motion). La visibilité passe par une classe .visible ;
  // le CSS le rend invisible ET non focalisable (visibility) tant qu'il dort.
  function brancherHautDePage() {
    if (document.querySelector(".haut-page")) return;
    const bouton = document.createElement("button");
    bouton.type = "button";
    bouton.className = "haut-page";
    bouton.setAttribute("data-i18n", "site.haut_page");
    bouton.setAttribute("data-i18n-attr", "aria-label");
    bouton.setAttribute("aria-label", "Retour en haut de la page");
    bouton.textContent = "↑";
    document.body.appendChild(bouton);

    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function basculer() {
      bouton.classList.toggle("visible", window.scrollY > 600);
    }
    bouton.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduit ? "auto" : "smooth" });
    });
    window.addEventListener("scroll", basculer, { passive: true });
    basculer();
  }

  // Injecte en-tête et pied, puis branche les interactions et les traductions.
  function initialiser() {
    const pageCourante = document.body.getAttribute("data-page") || "";

    const entete = document.getElementById("entete");
    if (entete) entete.innerHTML = construireEntete(pageCourante);

    const pied = document.getElementById("pied");
    if (pied) pied.innerHTML = construirePied();

    // Cartes de projets (présentes uniquement sur l'accueil).
    const cartesAccueil = document.querySelector("[data-cartes-accueil]");
    if (cartesAccueil) cartesAccueil.innerHTML = construireCartesAccueil();

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

    // Bouton « retour en haut » : chrome commun à toutes les pages, injecté une
    // seule fois. Masqué (visibility) tant qu'on n'a pas défilé — donc hors de
    // l'ordre de tabulation et des lecteurs d'écran jusqu'à ce qu'il serve. Le
    // libellé (aria-label) suit la langue via data-i18n ; changerLangue
    // ré-applique les traductions sur tout le document.
    brancherHautDePage();

    // Traduit le contenu fraîchement injecté.
    window.I18n.appliquerTraductions(document);
  }

  return { initialiser: initialiser };
})();

window.Composants = Composants;
