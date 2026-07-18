/*
 * lightbox.js
 * --------------------------------------------------------------------------
 * Visionneuse d'images maison — aucune image n'ouvre plus de nouvel onglet.
 *
 * Se branche par délégation sur les hooks [data-lightbox] posés par
 * content.js (planches, figures pleines, cartes-figures, images de cartes).
 * Plein écran assombri ; zoom à la molette, déplacement à la souris ;
 * pincement et glissement au tactile ; flèches pour parcourir la série de la
 * page ; Échap ou clic sur le fond pour fermer. Le href des ancres reste le
 * secours sans JavaScript.
 * --------------------------------------------------------------------------
 */

(function () {
  let voile = null;      // l'overlay, construit au premier usage
  let image = null;
  let legende = null;
  let serie = [];        // [{ url, alt }] — les images de la page, en ordre
  let idx = 0;
  let echelle = 1;
  let tx = 0;
  let ty = 0;
  const pointeurs = new Map(); // pincement / glissement (Pointer Events)
  let pinceeDepart = 0;

  // URL affichable d'un hook : data-url d'abord (l'original), sinon le href
  // de l'ancre, sinon le src de l'image elle-même.
  function urlDeHook(el) {
    return el.getAttribute("data-url") || el.getAttribute("href") || el.src || "";
  }
  function altDeHook(el) {
    if (el.alt) return el.alt;
    const img = el.querySelector && el.querySelector("img");
    return (img && img.alt) || "";
  }

  function construireVoile() {
    voile = document.createElement("div");
    voile.className = "lightbox";
    voile.setAttribute("role", "dialog");
    voile.setAttribute("aria-modal", "true");
    voile.innerHTML =
      '<img class="lightbox-image" alt="">' +
      '<button class="lightbox-bouton lightbox-fermer" aria-label="Fermer / Close">✕</button>' +
      '<button class="lightbox-bouton lightbox-prec" aria-label="Précédente / Previous">‹</button>' +
      '<button class="lightbox-bouton lightbox-suiv" aria-label="Suivante / Next">›</button>' +
      '<p class="lightbox-legende"></p>';
    document.body.appendChild(voile);
    image = voile.querySelector(".lightbox-image");
    legende = voile.querySelector(".lightbox-legende");

    voile.querySelector(".lightbox-fermer").addEventListener("click", fermer);
    voile.querySelector(".lightbox-prec").addEventListener("click", function () { naviguer(-1); });
    voile.querySelector(".lightbox-suiv").addEventListener("click", function () { naviguer(1); });
    // Clic sur le fond (pas sur l'image ni les boutons) : fermer.
    voile.addEventListener("click", function (e) {
      if (e.target === voile) fermer();
    });

    // Zoom à la molette (borné), recentré à l'échelle 1.
    voile.addEventListener("wheel", function (e) {
      e.preventDefault();
      poserEchelle(echelle * (e.deltaY < 0 ? 1.2 : 1 / 1.2));
    }, { passive: false });

    // Pointer Events : un doigt/souris = déplacement, deux doigts = pincement.
    image.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      image.setPointerCapture(e.pointerId);
      pointeurs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointeurs.size === 2) pinceeDepart = distancePincee() / echelle;
    });
    image.addEventListener("pointermove", function (e) {
      const avant = pointeurs.get(e.pointerId);
      if (!avant) return;
      pointeurs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointeurs.size === 2) {
        poserEchelle(distancePincee() / pinceeDepart);
      } else if (echelle > 1) {
        tx += e.clientX - avant.x;
        ty += e.clientY - avant.y;
        appliquer();
      }
    });
    function lacherPointeur(e) {
      pointeurs.delete(e.pointerId);
    }
    image.addEventListener("pointerup", lacherPointeur);
    image.addEventListener("pointercancel", lacherPointeur);
    // Double-clic : zoom ×2, ou retour à l'échelle 1 si déjà zoomé.
    image.addEventListener("dblclick", function () {
      poserEchelle(echelle > 1 ? 1 : 2);
    });

    document.addEventListener("keydown", function (e) {
      if (!voile || voile.hidden) return;
      if (e.key === "Escape") fermer();
      else if (e.key === "ArrowLeft") naviguer(-1);
      else if (e.key === "ArrowRight") naviguer(1);
    });
  }

  function distancePincee() {
    const deux = [...pointeurs.values()];
    return Math.hypot(deux[0].x - deux[1].x, deux[0].y - deux[1].y);
  }

  function poserEchelle(valeur) {
    echelle = Math.min(8, Math.max(1, valeur));
    if (echelle === 1) { tx = 0; ty = 0; }
    appliquer();
  }
  function appliquer() {
    image.style.transform =
      "translate(" + tx + "px, " + ty + "px) scale(" + echelle + ")";
    image.style.cursor = echelle > 1 ? "grab" : "zoom-in";
  }

  function montrer() {
    const entree = serie[idx];
    if (!entree) return;
    poserEchelle(1);
    image.src = entree.url;
    image.alt = entree.alt;
    legende.textContent =
      (serie.length > 1 ? (idx + 1) + " / " + serie.length + " — " : "") +
      entree.alt;
    const plusieurs = serie.length > 1;
    voile.querySelector(".lightbox-prec").hidden = !plusieurs;
    voile.querySelector(".lightbox-suiv").hidden = !plusieurs;
  }
  function naviguer(pas) {
    idx = (idx + pas + serie.length) % serie.length;
    montrer();
  }

  function ouvrir(url) {
    if (!voile) construireVoile();
    // La série = tous les hooks de la page, en ordre de lecture, sans doublon
    // d'URL (l'image ET son bouton « Voir en grand » pointent au même endroit).
    const vues = {};
    serie = [];
    document.querySelectorAll("[data-lightbox]").forEach(function (el) {
      const u = urlDeHook(el);
      if (!u || vues[u]) return;
      vues[u] = true;
      serie.push({ url: u, alt: altDeHook(el) });
    });
    idx = Math.max(0, serie.findIndex(function (s) { return s.url === url; }));
    voile.hidden = false;
    document.body.classList.add("lightbox-ouverte");
    montrer();
  }
  function fermer() {
    voile.hidden = true;
    document.body.classList.remove("lightbox-ouverte");
    image.src = "";
  }

  // Délégation : tout clic sur un hook [data-lightbox] ouvre la visionneuse.
  document.addEventListener("click", function (e) {
    const hook = e.target.closest && e.target.closest("[data-lightbox]");
    if (!hook) return;
    e.preventDefault();
    ouvrir(urlDeHook(hook));
  });
})();
