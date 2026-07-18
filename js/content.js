/*
 * content.js
 * --------------------------------------------------------------------------
 * Rendu du contenu d'un PROJET. Un même projet peut mélanger images, figures,
 * vidéos YouTube et PDF.
 *
 * Charge data/projets/<projet>.json puis génère le contenu demandé selon la vue :
 *   - rendre        : projet « à plat » (tous les items d'un coup).
 *   - rendreHub     : table des matières — une carte par SECTION (projet
 *                     sectionné, ex. 649) OU une carte par ITEM (projet à items
 *                     plats, ex. Python). Chaque carte mène à sa sous-page.
 *   - rendreSection : UNE section (via ?s=). Si la section a "sousMenu":true,
 *                     elle affiche un sous-hub (une carte par item) ; sinon la
 *                     ou les figures + le texte détaillé.
 *   - rendreItem    : UNE feuille (via ?i=) — figure en grand OU visionneuse
 *                     PDF + texte détaillé.
 *
 * Schéma d'un item (dans data/projets/<projet>.json) :
 *   { "type": "image",  "url": "assets/x.png", ... }
 *   { "type": "figure", "url": "assets/x.png", "texte": {fr,en}? ... }
 *   { "type": "video",  "url": "https://youtu.be/ID", ... }
 *   { "type": "pdf",    "fichier": "assets/x.pdf", "texte": {fr,en}? ... }
 * Tous acceptent "titre" {fr,en}, "description" {fr,en} et "texte" {fr,en}
 * (prose détaillée ; les lignes « ## … » deviennent des sous-titres).
 * --------------------------------------------------------------------------
 */

const Contenu = (function () {
  const DOSSIER_DONNEES = "data/projets/";
  const cacheProjets = {}; // évite de re-télécharger le JSON d'un projet à chaque rendu.

  // Charge (et met en cache) le JSON d'UN projet (data/projets/<id>.json).
  // Renvoie null si le fichier n'existe pas : la page affichera « vide »,
  // comme avant pour un projet absent du JSON central.
  async function chargerProjet(projet) {
    if (!projet) return null;
    if (projet in cacheProjets) return cacheProjets[projet];
    const url = DOSSIER_DONNEES + encodeURIComponent(projet) + ".json";
    const reponse = await fetch(url, { cache: "no-cache" });
    if (reponse.status === 404) return (cacheProjets[projet] = null);
    if (!reponse.ok) throw new Error("HTTP " + reponse.status);
    return (cacheProjets[projet] = await reponse.json());
  }

  // Protection minimale contre l'injection HTML dans les champs texte du JSON.
  function echapper(texte) {
    return String(texte == null ? "" : texte)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Encode un chemin de fichier pour une URL (gère notamment les espaces dans
  // les noms de PDF), tout en conservant les "/" de l'arborescence.
  function encoderChemin(chemin) {
    return encodeURI(String(chemin == null ? "" : chemin));
  }

  // Renvoie le texte bilingue d'un champ ({fr, en}) selon la langue active.
  function texteLocalise(champ) {
    if (champ == null) return "";
    if (typeof champ === "string") return champ; // tolère un champ non bilingue.
    const langue = window.I18n.langueActive();
    return champ[langue] || champ.fr || champ.en || "";
  }

  // --- Métadonnées de projet (depuis window.PROJETS) -------------------------

  function metaProjet(projet) {
    return (window.PROJETS || []).filter(function (p) {
      return p.id === projet;
    })[0] || null;
  }
  function titreProjet(projet) {
    const meta = metaProjet(projet);
    return meta ? window.I18n.t(meta.titre) : "";
  }
  function hrefProjet(projet) {
    const meta = metaProjet(projet);
    return meta ? meta.href : "index.html";
  }

  // Bouton « Code source (GitHub) » en tête de la page projet, si le projet
  // déclare un champ `code` dans projects.js. Renvoie "" sinon.
  function lienCodeSource(projet) {
    const meta = metaProjet(projet);
    if (!meta || !meta.code) return "";
    return (
      '<div class="doc-actions projet-code-source">' +
      '<a class="bouton" href="' + encodeURI(meta.code) + '"' +
      ' target="_blank" rel="noopener" data-i18n="contenu.code_source"></a>' +
      "</div>"
    );
  }

  // --- Prose détaillée -------------------------------------------------------

  // Rend un bloc de prose : les blocs séparés par une ligne vide deviennent des
  // paragraphes ; un bloc commençant par « ## » devient un sous-titre (suivi de
  // son paragraphe éventuel). Renvoie "" si le texte est vide.
  // Mise en forme INLINE de la prose : échappe le HTML puis convertit le
  // gras **…**, le code `…`, les renvois de concept [[id]] / [[id|libellé]]
  // (terme souligné pointillé — le clic ouvre la fiche du concept, voir la
  // section Concepts plus bas) et les liens [texte](url). Deux formes d'URL
  // seulement : https:// (externe, nouvel onglet) et les pages internes
  // projet-section.html / projet-item.html — un test du 649 renvoie ainsi à
  // son document formatif sans quitter le site. Le texte est déjà échappé,
  // l'URL ne peut pas fermer l'attribut.
  function formaterInline(texte) {
    return echapper(texte)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g, function (m, id, libelle) {
        return (
          '<button type="button" class="concept-lien" data-concept="' + id + '">' +
          (libelle || id) +
          "</button>"
        );
      })
      .replace(
        /\[([^\]]+)\]\(((?:https:\/\/|projet-(?:section|item)\.html\?)[^\s)]+)\)/g,
        function (m, texteLien, url) {
          const externe = url.indexOf("https://") === 0;
          return (
            '<a href="' + url + '"' +
            (externe ? ' target="_blank" rel="noopener"' : "") +
            ">" + texteLien + "</a>"
          );
        }
      );
  }

  // Un bloc SANS titre : liste à puces si toutes ses lignes commencent par
  // « - », paragraphe sinon.
  function rendreBlocProse(t) {
    const lignes = t.split("\n").map(function (l) {
      return l.trim();
    }).filter(Boolean);
    const estListe = lignes.length && lignes.every(function (l) {
      return l.indexOf("- ") === 0;
    });
    if (estListe) {
      return (
        "<ul>" +
        lignes.map(function (l) {
          return "<li>" + formaterInline(l.slice(2)) + "</li>";
        }).join("") +
        "</ul>"
      );
    }
    return "<p>" + formaterInline(t) + "</p>";
  }

  function rendreProse(texte) {
    if (!texte) return "";
    const html = String(texte)
      .split(/\n\s*\n/)
      .map(function (bloc) {
        const t = bloc.trim();
        if (!t) return "";
        const m = t.match(/^##\s+(.+?)(?:\n([\s\S]*))?$/);
        if (m) {
          let out =
            '<h3 class="prose-sous-titre">' + echapper(m[1].trim()) + "</h3>";
          if (m[2] && m[2].trim()) out += rendreBlocProse(m[2].trim());
          return out;
        }
        return rendreBlocProse(t);
      })
      .join("");
    return '<div class="section-prose">' + html + "</div>";
  }

  // --- Concepts (renvois transversaux vers les formations) -------------------

  // Les concepts sont déclarés UNE fois, dans le squelette Formations (clé
  // racine "concepts" de data/projets/formations.json, recopiée telle quelle
  // par sync-site.py) : { id, titre {fr,en}, resume {fr,en}, lien {p, s, i?} }.
  // Un [[id]] dans la prose ou une clé de section "renvois" y renvoie ; le
  // clic ouvre une fiche <dialog> (résumé + « Voir la leçon → »). Règle
  // éditoriale : pop-up pour un concept, lien direct pour un document entier.

  async function chargerConcepts() {
    try {
      const bloc = await chargerProjet("formations");
      const liste = bloc && Array.isArray(bloc.concepts) ? bloc.concepts : [];
      const parId = {};
      liste.forEach(function (c) {
        if (c && c.id) parId[c.id] = c;
      });
      return parId;
    } catch (err) {
      console.error("[concepts] Échec du chargement :", err);
      return {};
    }
  }

  // Adresse de la leçon d'un concept ({p, s, i?}) : la page item si le
  // concept pointe une leçon précise, la page section sinon.
  function hrefConcept(lien) {
    if (!lien || !lien.p) return "";
    return (
      (lien.i ? "projet-item.html" : "projet-section.html") +
      "?p=" + encodeURIComponent(lien.p) +
      (lien.s ? "&s=" + encodeURIComponent(lien.s) : "") +
      (lien.i ? "&i=" + encodeURIComponent(lien.i) : "")
    );
  }

  // Rangée de chips « Concepts : … » (clé "renvois" d'une section) : chaque
  // chip ouvre la même fiche qu'un [[id]] dans la prose.
  function creerChipsConcepts(renvois, concepts) {
    return (renvois || [])
      .map(function (id) {
        return concepts[id];
      })
      .filter(Boolean)
      .map(function (c) {
        return (
          '<button type="button" class="concept-lien concept-chip" data-concept="' +
          echapper(c.id) + '">' + echapper(texteLocalise(c.titre)) + "</button>"
        );
      })
      .join("");
  }

  function creerRenvois(renvois, concepts) {
    const chips = creerChipsConcepts(renvois, concepts);
    if (!chips) return "";
    return (
      '<div class="renvois">' +
      '<span class="renvois-titre" data-i18n="concept.renvois"></span>' +
      chips +
      "</div>"
    );
  }

  // Fiche d'un concept : un seul <dialog> réutilisé, rempli au clic.
  // Fermeture : bouton ×, Échap (natif) et clic sur le fond assombri.
  function dialogConcept() {
    let dlg = document.querySelector(".concept-dialog");
    if (dlg) return dlg;
    dlg = document.createElement("dialog");
    dlg.className = "concept-dialog";
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg) dlg.close();
    });
    document.body.appendChild(dlg);
    return dlg;
  }

  async function ouvrirConcept(id) {
    const concepts = await chargerConcepts();
    const concept = concepts[id];
    if (!concept) return; // id inconnu : le terme reste un simple mot.
    const dlg = dialogConcept();
    const href = hrefConcept(concept.lien);
    dlg.innerHTML =
      '<div class="concept-fiche">' +
      '<button type="button" class="concept-fermer"' +
      ' data-i18n="concept.fermer" data-i18n-attr="aria-label">×</button>' +
      '<h3 class="concept-titre">' + echapper(texteLocalise(concept.titre)) + "</h3>" +
      '<p class="concept-resume">' + echapper(texteLocalise(concept.resume)) + "</p>" +
      (href
        ? '<a class="concept-voir" href="' + href + '">' +
          '<span data-i18n="concept.voir_lecon"></span> →</a>'
        : "") +
      "</div>";
    window.I18n.appliquerTraductions(dlg);
    dlg.querySelector(".concept-fermer").addEventListener("click", function () {
      dlg.close();
    });
    dlg.showModal();
  }

  // Délégation globale : tout .concept-lien (prose, chips, bloc Continuer)
  // ouvre la fiche — le contenu étant re-rendu à chaque changement de langue,
  // un écouteur unique sur le document évite de rebrancher chaque terme.
  document.addEventListener("click", function (e) {
    const declencheur = e.target.closest && e.target.closest(".concept-lien");
    if (declencheur) ouvrirConcept(declencheur.getAttribute("data-concept"));
  });

  // Extrait l'identifiant d'une vidéo YouTube depuis différentes formes d'URL.
  function extraireIdYoutube(url) {
    const motifs = [
      /[?&]v=([^&]+)/, // https://www.youtube.com/watch?v=ID
      /youtu\.be\/([^?]+)/, // https://youtu.be/ID
      /youtube\.com\/embed\/([^?]+)/, // https://www.youtube.com/embed/ID
    ];
    for (const motif of motifs) {
      const m = String(url || "").match(motif);
      if (m) return m[1];
    }
    return null;
  }

  // --- Constructeurs de média par type -------------------------------------

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

  function creerImage(item, titre) {
    const src = item.miniature || item.url;
    return (
      '<div class="media-cadre">' +
      // data-lightbox + data-url : hooks prêts pour une future visionneuse.
      '<img src="' + encoderChemin(src) + '" alt="' + echapper(titre) + '"' +
      ' loading="lazy" data-lightbox="1" data-url="' + encoderChemin(item.url) + '">' +
      "</div>"
    );
  }

  // Carte FIGURE : aperçu de l'image EN ENTIER (object-fit: contain), pensé
  // pour les planches « manuel scientifique » au format portrait, denses en
  // texte. Ne sert plus qu'aux illustrations de tête (galerie-tete d'une
  // arborescence) : les listes d'items passent par les planches. Le clic
  // ouvre la visionneuse ; le href reste en secours sans JavaScript.
  function creerCarteFigure(item, titre, description) {
    const src = encoderChemin(item.miniature || item.url);
    const url = encoderChemin(item.url);
    return (
      '<article class="carte carte-figure">' +
      '<a class="fig-apercu" href="' + url + '" data-lightbox="1" data-url="' + url + '">' +
      '  <img src="' + src + '" alt="' + echapper(titre) + '" loading="lazy">' +
      "</a>" +
      '<div class="carte-corps">' +
      '  <span class="badge" data-i18n="contenu.badge_figure"></span>' +
      '  <h3 class="carte-titre">' + echapper(titre) + "</h3>" +
      '  <p class="carte-desc">' + echapper(description) + "</p>" +
      '  <div class="doc-actions">' +
      '    <a class="bouton" href="' + url + '" data-lightbox="1" data-url="' + url + '"' +
      '       data-i18n="contenu.voir_figure"></a>' +
      "  </div>" +
      "</div>" +
      "</article>"
    );
  }

  // Figure affichée EN GRAND sur une page item (pas dans une carte) : l'image
  // occupe toute la largeur, fond blanc, clic = visionneuse plein écran.
  function creerFigurePleine(item, titre) {
    const src = encoderChemin(item.miniature || item.url);
    const url = encoderChemin(item.url);
    return (
      '<figure class="figure-pleine">' +
      '  <a href="' + url + '" data-lightbox="1" data-url="' + url + '">' +
      '    <img src="' + src + '" alt="' + echapper(titre) + '" loading="lazy">' +
      "  </a>" +
      '  <figcaption>' +
      '    <a class="bouton" href="' + url + '" data-lightbox="1" data-url="' + url + '"' +
      '       data-i18n="contenu.voir_figure"></a>' +
      "  </figcaption>" +
      "</figure>"
    );
  }

  // --- Planches et index de fichiers (les images hors des cartes) -----------

  // Numéro de planche « FIG. 03 » : zéro devant, pour l'alignement mono.
  function numeroPlanche(n) {
    return "FIG. " + (n < 10 ? "0" + n : n);
  }

  // Planche pleine largeur : l'image entière, jamais rognée, la légende mono
  // dessous — une pièce à conviction numérotée. `hrefItem` (optionnel) ajoute
  // « Ouvrir → » vers la page de l'item quand il a un récit à lire. Le clic
  // sur l'image ouvre la visionneuse (lightbox.js) ; le href reste en secours
  // sans JavaScript.
  function creerPlanche(item, numero, hrefItem) {
    const titre = texteLocalise(item.titre);
    const desc = texteLocalise(item.description);
    const legende =
      '<figcaption class="planche-legende">' +
      '<span class="planche-numero">' + numeroPlanche(numero) + "</span>" +
      '<span class="planche-titre">' + echapper(titre) + "</span>" +
      (hrefItem
        ? '<a class="planche-lien" href="' + hrefItem + '">' +
          '<span data-i18n="hub.ouvrir"></span> →</a>'
        : "") +
      "</figcaption>" +
      (desc ? '<p class="planche-desc">' + formaterInline(desc) + "</p>" : "");
    if (item.type === "video") {
      return (
        '<figure class="planche">' +
        creerEmbedYoutube(item.url, titre) +
        legende +
        "</figure>"
      );
    }
    const src = encoderChemin(item.miniature || item.url);
    const url = encoderChemin(item.url);
    return (
      '<figure class="planche">' +
      '<a href="' + url + '" data-lightbox="1" data-url="' + url + '">' +
      '<img src="' + src + '" alt="' + echapper(titre) + '" loading="lazy">' +
      "</a>" +
      legende +
      "</figure>"
    );
  }

  // Index de fichiers façon terminal pour une liste de PDF : une ligne mono
  // par document — numéro, titre, description, actions VOIR (la page item, où
  // vit l'aperçu intégré) et TÉLÉCHARGER. Remplace la grille d'iframes, trop
  // lourde pour dix documents.
  function creerIndexFichiers(items, fabriquerHrefItem) {
    return (
      '<ol class="index-fichiers">' +
      items
        .map(function (item, i) {
          // Un document déjà numéroté dans son titre (« 01 — Fondations… »)
          // ferait doublon avec la colonne de numéros : on retire le préfixe
          // quand il répète exactement le rang de la ligne.
          const titre = texteLocalise(item.titre).replace(
            /^\s*0*(\d+)\s*[—–-]\s*/,
            function (prefixe, n) {
              return parseInt(n, 10) === i + 1 ? "" : prefixe;
            }
          );
          const desc = texteLocalise(item.description);
          const url = encoderChemin(item.fichier);
          const hrefItem = fabriquerHrefItem(item, false);
          const nom = hrefItem
            ? '<a class="fichier-nom" href="' + hrefItem + '">' + echapper(titre) + "</a>"
            : '<span class="fichier-nom">' + echapper(titre) + "</span>";
          const voir = hrefItem
            ? '<a href="' + hrefItem + '" data-i18n="documents.voir"></a>'
            : '<a href="' + url + '" target="_blank" rel="noopener" data-i18n="documents.voir"></a>';
          return (
            '<li class="fichier-ligne">' +
            '<span class="fichier-numero">' + (i + 1 < 10 ? "0" : "") + (i + 1) + "</span>" +
            nom +
            '<span class="fichier-actions">' +
            voir +
            '<a href="' + url + '" download data-i18n="documents.telecharger"></a>' +
            "</span>" +
            (desc ? '<span class="fichier-desc">' + echapper(desc) + "</span>" : "") +
            "</li>"
          );
        })
        .join("") +
      "</ol>"
    );
  }

  // Rend la liste d'items d'une page de section : les PDF en index de
  // fichiers, le reste (figures, images, vidéos) en planches numérotées.
  // `fabriquerHrefItem(item, exigerTexte)` renvoie l'URL de la page item, ou
  // null quand elle n'apporterait rien de plus.
  function rendreItemsEnPlanches(items, fabriquerHrefItem) {
    const pdfs = items.filter(function (it) {
      return it.type === "pdf";
    });
    const autres = items.filter(function (it) {
      return it.type !== "pdf";
    });
    let html = pdfs.length ? creerIndexFichiers(pdfs, fabriquerHrefItem) : "";
    autres.forEach(function (it, i) {
      html += creerPlanche(it, i + 1, fabriquerHrefItem(it, true));
    });
    return html ? '<div class="planches">' + html + "</div>" : "";
  }

  // Marque les planches « pleine trame » : une vraie capture d'écran
  // panoramique (terminal crypto, vues Quantower — ≥1600 px de large, bien
  // plus large que haute) déborde du conteneur de 1100 px jusqu'à ~1400 px.
  // Décidé sur la taille NATURELLE de l'image : les charts de signal
  // (1260 px) restent dans la trame, les captures plein écran en sortent.
  function marquerPlanchesLarges(conteneur) {
    conteneur.querySelectorAll(".planche img").forEach(function (img) {
      function marquer() {
        if (img.naturalWidth >= 1600 && img.naturalWidth >= 1.6 * img.naturalHeight) {
          const planche = img.closest(".planche");
          if (planche) planche.classList.add("planche-large");
        }
      }
      if (img.complete && img.naturalWidth) marquer();
      else img.addEventListener("load", marquer, { once: true });
    });
  }

  // Visionneuse PDF EN GRAND sur une page item : aperçu large + boutons.
  function creerVisionneusePdf(item, titre) {
    const url = encoderChemin(item.fichier);
    return (
      '<div class="pdf-pleine">' +
      '  <div class="doc-apercu doc-apercu-grand">' +
      '    <iframe src="' + url + '#view=FitH" title="' + echapper(titre) + '" loading="lazy"></iframe>' +
      "  </div>" +
      '  <div class="doc-actions">' +
      '    <a class="bouton" href="' + url + '" target="_blank" rel="noopener"' +
      '       data-i18n="documents.voir"></a>' +
      '    <a class="doc-lien" href="' + url + '" download' +
      '       data-i18n="documents.telecharger"></a>' +
      "  </div>" +
      "</div>"
    );
  }

  // --- Cartes ---------------------------------------------------------------

  // Carte image ou vidéo.
  function creerCarteMedia(item, titre, description) {
    const estVideo = item.type === "video";
    const media = estVideo
      ? creerEmbedYoutube(item.url, titre)
      : creerImage(item, titre);
    const badge = estVideo
      ? '<span class="badge" data-i18n="contenu.badge_video"></span>'
      : '<span class="badge" data-i18n="contenu.badge_image"></span>';

    return (
      '<article class="carte">' +
      media +
      '<div class="carte-corps">' +
      "  " + badge +
      '  <h3 class="carte-titre">' + echapper(titre) + "</h3>" +
      '  <p class="carte-desc">' + echapper(description) + "</p>" +
      "</div>" +
      "</article>"
    );
  }

  // Carte document PDF : aperçu intégré + boutons « Voir » et « Télécharger ».
  function creerCartePdf(item, titre, description) {
    const url = encoderChemin(item.fichier);
    return (
      '<article class="carte doc-carte">' +
      '<div class="doc-apercu">' +
      // Aperçu intégré. view=FitH ajuste la largeur ; la barre d'outils native
      // du lecteur reste disponible (consultation/téléchargement/impression).
      '  <iframe src="' + url + '#view=FitH" title="' + echapper(titre) + '" loading="lazy"></iframe>' +
      "</div>" +
      '<div class="carte-corps">' +
      '  <span class="badge" data-i18n="contenu.badge_pdf"></span>' +
      '  <h3 class="carte-titre">' + echapper(titre) + "</h3>" +
      '  <p class="carte-desc">' + echapper(description) + "</p>" +
      '  <div class="doc-actions">' +
      '    <a class="bouton" href="' + url + '" target="_blank" rel="noopener"' +
      '       data-i18n="documents.voir"></a>' +
      '    <a class="doc-lien" href="' + url + '" download' +
      '       data-i18n="documents.telecharger"></a>' +
      "  </div>" +
      "</div>" +
      "</article>"
    );
  }

  function creerCarte(item) {
    const titre = texteLocalise(item.titre);
    const description = texteLocalise(item.description);
    if (item.type === "pdf") return creerCartePdf(item, titre, description);
    if (item.type === "figure") return creerCarteFigure(item, titre, description);
    return creerCarteMedia(item, titre, description);
  }

  // --- Cartes de navigation (hub / sous-hub) --------------------------------

  // Carte « portfolio » menant à une sous-page (titre + description + flèche).
  // `visuel` (HTML, optionnel) coiffe la carte — une rondelle de marque ou la
  // vignette d'une vue. Il tient alors lieu de description : l'appelant qui
  // passe un visuel passe une desc vide.
  function creerCarteLien(titre, desc, href, fleche, visuel, numero) {
    // `numero` (optionnel) : suffixe d'index sur le titre — sert à numéroter les
    // stratégies d'un banc (« 01 », « 02 »…) sans toucher au texte des données.
    const suffixeNum = numero
      ? ' <span class="carte-numero">' + echapper(numero) + "</span>"
      : "";
    return (
      '<a class="carte-portfolio' + (visuel ? " carte-illustree" : "") +
      (numero ? " carte-numerotee" : "") + '"' +
      ' href="' + href + '">' +
      (visuel || "") +
      "  <h3>" + echapper(titre) + suffixeNum + "</h3>" +
      (desc ? "  <p>" + echapper(desc) + "</p>" : "") +
      '  <span class="fleche">' + echapper(fleche) + " →</span>" +
      "</a>"
    );
  }

  // Bandeau « concept transversal » d'un hub (section marquée "concept": true) :
  // pleine largeur sous la grille des piliers — un concept traverse la chaîne,
  // il ne s'y insère pas comme un pilier. Montre toujours l'accroche (c'est le
  // manifeste du concept), même en mode titres seuls.
  function creerBandeauConcept(section, projet, pageSection) {
    const titre = texteLocalise(section.titre);
    const desc = texteLocalise(section.accroche) || texteLocalise(section.intro);
    const chip = texteLocalise(section.statut);
    const href =
      pageSection +
      "?p=" + encodeURIComponent(projet) +
      "&s=" + encodeURIComponent(section.id);
    return (
      '<a class="carte-portfolio carte-concept" href="' + href + '">' +
      (chip ? '<span class="concept-etiquette">' + echapper(chip) + "</span>" : "") +
      "  <h3>" + echapper(titre) + "</h3>" +
      (desc ? "  <p>" + echapper(desc) + "</p>" : "") +
      '  <span class="fleche">' + echapper(window.I18n.t("hub.ouvrir")) + " →</span>" +
      "</a>"
    );
  }

  // --- Pyramide des piliers (hubs crypto / indices) --------------------------

  // Les piliers d'une chaîne « de la donnée à l'exécution » ne forment pas une
  // liste plate : Historique et Temps réel alimentent ENSEMBLE la Visualisation,
  // qui nourrit le Backtesting, qui mène à l'Automatisation. La clé `etage`
  // (1, 2, 3…) du JSON porte ce niveau ; le rendu empile les étages dans le sens
  // de lecture, du socle le plus large vers l'exécution.
  // Renvoie null dès qu'UN pilier n'a pas d'étage : le hub retombe alors sur la
  // grille — les autres projets (formations, statistiques, 649) rassemblent des
  // sections côte à côte, sans chaîne à raconter.
  function etagesDePiliers(piliers) {
    if (!piliers.length) return null;
    const numerotes = piliers.every(function (s) {
      return typeof s.etage === "number";
    });
    if (!numerotes) return null;
    const niveaux = [];
    piliers
      .slice()
      .sort(function (a, b) {
        return a.etage - b.etage;
      })
      .forEach(function (section) {
        const dernier = niveaux[niveaux.length - 1];
        if (dernier && dernier.etage === section.etage) dernier.sections.push(section);
        else niveaux.push({ etage: section.etage, sections: [section] });
      });
    return niveaux;
  }

  // Jonction entre deux étages : une FOURCHE quand l'étage du dessus porte
  // plusieurs piliers qui convergent (Historique + Temps réel vers la
  // Visualisation), une simple TIGE sinon. Décor pur, masqué aux lecteurs
  // d'écran : la succession des cartes dit déjà l'ordre de la chaîne.
  function creerJonction(piliersDessus) {
    return (
      '<div class="pyramide-jonction' +
      (piliersDessus > 1 ? " pyramide-jonction-fourche" : "") +
      '" aria-hidden="true"></div>'
    );
  }

  // Fourche DIVERGENTE : la racine d'une arborescence (l'image générale d'un
  // pilier) descend vers les cartes de ses branches. C'est l'inverse de la
  // fourche de la pyramide, où plusieurs piliers convergent vers un seul : son
  // « U » ne se retourne pas, et il faut ici une branche par carte. D'où une
  // tige centrale, puis une cellule par carte qui porte le rail et sa branche —
  // la grille des cellules rejoue celle des cartes, et l'alignement suit
  // (voir .arbre-branches). Décor pur, masqué aux lecteurs d'écran : la
  // succession image → cartes dit déjà l'arborescence.
  function creerFourcheArbre(nombreDeCartes) {
    let branches = "";
    for (let i = 0; i < nombreDeCartes; i++) branches += "<span><i></i></span>";
    return (
      '<div class="arbre-jonction" aria-hidden="true">' +
      '<div class="arbre-tige"></div>' +
      '<div class="arbre-branches">' + branches + "</div>" +
      "</div>"
    );
  }

  // Étiquette mono d'un étage du schéma de flux (« 01 · HIST·TR ») : le rang
  // sur deux chiffres, puis les codes de rail des piliers de l'étage. Décor
  // pur (les cartes se suffisent) — masquée aux lecteurs d'écran.
  function etiquetteEtage(niveau, rang) {
    const codes = niveau.sections.map(etiquetteRail).join("·");
    return (
      '<p class="pyramide-etiquette" aria-hidden="true">' +
      (rang < 10 ? "0" + rang : rang) + " · " + echapper(codes) +
      "</p>"
    );
  }

  function construirePyramide(niveaux, projet, pageSection, titresSeuls) {
    return (
      '<div class="pyramide">' +
      niveaux
        .map(function (niveau, rang) {
          const cartes = niveau.sections
            .map(function (section) {
              return carteDePilier(section, projet, pageSection, titresSeuls);
            })
            .join("");
          // --rang pilote le resserrement de l'étage (voir styles.css).
          return (
            (rang === 0 ? "" : creerJonction(niveaux[rang - 1].sections.length)) +
            etiquetteEtage(niveau, rang + 1) +
            '<div class="pyramide-etage" style="--rang: ' + (rang + 1) + '">' +
            cartes +
            "</div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  // Vignette d'une carte de sous-hub (clé `vignette` d'une section) : l'aperçu
  // de la vue que la sous-section documente. Sert l'arborescence du pilier
  // Visualisations — la capture des quatre vues en tête, chaque vue en dessous.
  function vignetteDeCarte(section, titre) {
    if (!section.vignette) return "";
    return (
      '<span class="carte-vignette">' +
      '<img src="' + encoderChemin(section.vignette) + '"' +
      ' alt="' + echapper(titre) + '" loading="lazy">' +
      "</span>"
    );
  }

  // Ordonne les cartes d'un sous-hub sur le bandeau des sources : les rondelles
  // se lisent alors dans le même ordre, de gauche à droite, sur toutes les
  // pages du projet. Sans cette règle l'ordre est celui des sections du JSON,
  // et il dérive d'un pilier à l'autre — Bitget ouvrait le Temps réel et
  // arrivait cinquième dans l'Historique, si bien que les rondelles semblaient
  // alterner d'une page à l'autre. L'ordre du bandeau fait foi : il est déclaré
  // une seule fois, dans le squelette du hub (clé `sources`).
  // Ne trie QUE si toutes les sous-sections portent une rondelle de source —
  // même prudence qu'`etagesDePiliers` : les sous-hubs sans rondelle (les
  // stratégies d'un moteur) ou aux marques déclarées en clair (les moteurs de
  // backtesting) gardent l'ordre voulu par l'auteur.
  function ordonnerSurLesSources(sections, sources) {
    const rang = {};
    (sources || []).forEach(function (source, i) {
      rang[source.id] = i;
    });
    const toutes = sections.every(function (s) {
      return typeof s.pastille === "string" && rang[s.pastille] !== undefined;
    });
    if (!toutes) return sections;
    return sections.slice().sort(function (a, b) {
      return rang[a.pastille] - rang[b.pastille];
    });
  }

  // Sous-hub de SECTIONS : une carte par sous-section (mène à sa page section).
  // Sert à imbriquer un niveau (ex. « La formation » -> LEAN / vbt / conclusion).
  // Une section qui porte une vignette ou une pastille se présente par son
  // visuel : la rondelle de la source ou l'aperçu de la vue remplace l'accroche
  // (`sources` = la clé du projet, pour résoudre les pastilles par id).
  function construireSousHubSections(sections, projet, pageSection, sources) {
    return (
      '<div class="grille-hub">' +
      ordonnerSurLesSources(sections, sources)
        .map(function (section) {
          const titre = texteLocalise(section.titre);
          const visuel =
            vignetteDeCarte(section, titre) || pastilleDeCarte(section, sources);
          const desc = visuel
            ? ""
            : texteLocalise(section.accroche) ||
              texteLocalise(section.intro) ||
              texteLocalise(section.texte);
          const href =
            pageSection +
            "?p=" + encodeURIComponent(projet) +
            "&s=" + encodeURIComponent(section.id);
          return creerCarteLien(
            titre, desc, href, libelleCarteSection(section), visuel, section.numero
          );
        })
        .join("") +
      "</div>"
    );
  }

  // --- Pastilles de marque --------------------------------------------------

  // Pastille d'une marque : monogramme sur une rondelle à sa couleur.
  // Fabriquée ici plutôt que chargée en image — pas de logo déposé à héberger,
  // et le rendu suit le thème. Le monogramme passe en foncé sur les couleurs
  // claires (le jaune de Binance) : on choisit selon la luminance perçue.
  function creerPastille(marque) {
    const couleur = /^#[0-9a-f]{6}$/i.test(String(marque.couleur || ""))
      ? marque.couleur
      : "#6E7681";
    const r = parseInt(couleur.slice(1, 3), 16);
    const v = parseInt(couleur.slice(3, 5), 16);
    const b = parseInt(couleur.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * v + 0.114 * b) / 255;
    const encre = luminance > 0.6 ? "#12161C" : "#FFFFFF";
    const monogramme = String(marque.monogramme || "?");
    // Un monogramme de 3 lettres (VBT) doit tenir dans la même rondelle qu'un
    // monogramme de 2 (BN) : on resserre la fonte plutôt que la rondelle.
    const taille = monogramme.length > 2 ? 14 : 18;
    return (
      '<svg class="pastille" viewBox="0 0 48 48" role="img"' +
      ' aria-label="' + echapper(marque.nom) + '">' +
      '<circle cx="24" cy="24" r="24" fill="' + couleur + '"></circle>' +
      '<text x="24" y="24" text-anchor="middle" dominant-baseline="central"' +
      ' font-size="' + taille + '" font-weight="700" fill="' + encre + '"' +
      ' font-family="system-ui, sans-serif">' +
      echapper(monogramme) +
      "</text></svg>"
    );
  }

  // Résout le champ `pastille` / une entrée de `marques` d'une section :
  //   - une CHAÎNE est l'id d'une source du projet (clé "sources" du JSON) — la
  //     couleur et le monogramme d'une source sont déclarés une seule fois, dans
  //     le squelette du hub, et les piliers s'y réfèrent par id ;
  //   - un OBJET {nom, monogramme, couleur} est pris tel quel — pour les marques
  //     qui ne sont pas des sources de données (les moteurs de backtesting).
  // Renvoie null si l'id est inconnu : une carte sans rondelle vaut mieux
  // qu'une rondelle « ? » sur une coquille de frappe.
  function resoudreMarque(valeur, sources) {
    if (!valeur) return null;
    if (typeof valeur !== "string") return valeur;
    return (sources || []).filter(function (s) {
      return s.id === valeur;
    })[0] || null;
  }

  // Rondelle d'une carte de sous-hub. Grisée si la marque est écartée du
  // périmètre (Kraken) : le statut se lit alors avant même la puce.
  function pastilleDeCarte(section, sources) {
    const marque = resoudreMarque(section.pastille, sources);
    if (!marque) return "";
    return (
      '<span class="carte-pastille' + (marque.ecarte ? " pastille-ecartee" : "") + '">' +
      creerPastille(marque) +
      "</span>"
    );
  }

  // Rangée de rondelles en tête d'une page section (clé `marques`) : sert aux
  // sections sans sous-hub qui veulent quand même afficher leurs outils —
  // ex. les deux moteurs du backtesting des indices.
  function creerRangeeMarques(section, sources) {
    const marques = (Array.isArray(section.marques) ? section.marques : [])
      .map(function (m) {
        return resoudreMarque(m, sources);
      })
      .filter(Boolean);
    if (!marques.length) return "";
    return (
      '<div class="rangee-marques">' +
      marques
        .map(function (marque) {
          const statut = texteLocalise(marque.statut);
          // -item : `.marque` seul est le mot-symbole du site dans l'en-tête.
          return (
            '<span class="marque-item' +
            (marque.ecarte ? " marque-item-ecartee" : "") + '">' +
            creerPastille(marque) +
            '<span class="marque-item-nom">' + echapper(marque.nom) + "</span>" +
            (statut ? '<span class="marque-item-chip">' + echapper(statut) + "</span>" : "") +
            "</span>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  // --- Sources de données (bandeau des hubs crypto / indices) ---------------

  // « Source » et non « exchange » : crypto tire ses données de sept exchanges,
  // les indices d'un seul marché (le CME) atteint par deux plateformes
  // (Quantower, IBKR). Un seul mot couvre les deux hubs.

  // Bandeau du hub : la rondelle de chaque source du périmètre, écartées
  // comprises (grisées). Aucun texte de rôle ici — le sort de chaque source est
  // raconté sur sa page, sous Historique et sous Temps réel. Le nom reste sous
  // la rondelle : un monogramme seul (« KC », « BG ») n'identifie personne.
  function creerLogoSource(source) {
    const classe = "source-logo" + (source.ecarte ? " source-ecartee" : "");
    return (
      '<li class="' + classe + '">' +
      creerPastille(source) +
      '<span class="source-nom">' + echapper(source.nom) + "</span>" +
      "</li>"
    );
  }

  // Rend le bandeau des sources d'un projet (clé "sources" de son JSON).
  // Sans cette clé, le conteneur reste vide : les autres projets ne changent pas.
  async function rendreSources(options) {
    const conteneur = options.conteneur;
    const projet = options.projet || null;
    if (!conteneur) return;
    try {
      const bloc = await chargerProjet(projet);
      const sources = (bloc && Array.isArray(bloc.sources)) ? bloc.sources : [];
      if (!sources.length) {
        conteneur.innerHTML = "";
        return;
      }
      conteneur.innerHTML =
        '<ul class="bandeau-sources">' +
        sources.map(creerLogoSource).join("") +
        "</ul>";
    } catch (err) {
      console.error("[sources] Échec du chargement :", err);
      conteneur.innerHTML = "";
    } finally {
      window.I18n.appliquerTraductions(conteneur);
    }
  }

  // --- Sections (regroupement du contenu d'un projet) -----------------------

  // Identifiant d'ancre stable pour une section (sommaire + lien profond #...).
  function ancreSection(section, idx) {
    if (section.id) return "sec-" + String(section.id);
    return "sec-" + (idx + 1);
  }

  // Rend une section : titre + intro optionnelle + (grille de cartes OU prose).
  function creerSection(section, idx) {
    const titre = texteLocalise(section.titre);
    const intro = texteLocalise(section.intro);
    const texte = texteLocalise(section.texte);
    const items = Array.isArray(section.items) ? section.items : [];
    const ancre = ancreSection(section, idx);

    let corps;
    if (items.length) {
      corps =
        '<div class="galerie">' + items.map(creerCarte).join("") + "</div>" +
        rendreProse(texte);
    } else if (texte) {
      corps = rendreProse(texte);
    } else {
      corps =
        '<div class="galerie"><p class="galerie-message" data-i18n="contenu.vide"></p></div>';
    }

    return (
      '<section class="projet-section" id="' + echapper(ancre) + '">' +
      '  <h2 class="projet-section-titre">' + echapper(titre) + "</h2>" +
      (intro ? '  <p class="section-intro">' + echapper(intro) + "</p>" : "") +
      avertissementTexteFr(section.texte) +
      corps +
      "</section>"
    );
  }

  // Sommaire cliquable en tête de page (ancres vers chaque section).
  function creerSommaire(sections) {
    if (sections.length < 2) return ""; // inutile pour une seule section.
    const liens = sections
      .map(function (section, idx) {
        const titre = texteLocalise(section.titre);
        return (
          '<li><a href="#' + echapper(ancreSection(section, idx)) + '">' +
          echapper(titre) + "</a></li>"
        );
      })
      .join("");
    return (
      '<nav class="projet-sommaire" aria-label="Sommaire">' +
      '  <span class="projet-sommaire-titre" data-i18n="contenu.sommaire"></span>' +
      '  <ol>' + liens + "</ol>" +
      "</nav>"
    );
  }

  // Vrai si au moins un item (toutes sections confondues) est un PDF.
  function contientPdf(sections) {
    return sections.some(function (section) {
      return (section.items || []).some(function (it) {
        return it.type === "pdf";
      });
    });
  }

  // Avertissement affiché en anglais quand le contenu comporte des PDF
  // (les PDF ne sont disponibles qu'en français).
  function banniereAvertissementPdf(aDesPdf) {
    const enAnglais = window.I18n.langueActive() === "en";
    if (!enAnglais || !aDesPdf) return "";
    return '<p class="avertissement-langue" data-i18n="documents.avertissement_fr"></p>';
  }

  // Avertissement affiché en anglais quand le texte d'une section ou d'un item
  // n'existe qu'en français (texteLocalise retombe alors silencieusement sur
  // le fr, sans que le visiteur sache pourquoi).
  function avertissementTexteFr(champ) {
    if (window.I18n.langueActive() !== "en") return "";
    if (!champ || typeof champ === "string" || champ.en || !champ.fr) return "";
    return '<p class="avertissement-langue" data-i18n="contenu.avertissement_texte_fr"></p>';
  }

  // Normalise un bloc projet vers une liste de sections.
  //   - Nouveau schéma : { "sections": [ { titre, intro?, items } ] }.
  //   - Ancien schéma  : { "items": [ ... ] }  -> une section unique sans titre.
  function sectionsDuBloc(bloc) {
    if (!bloc) return [];
    if (Array.isArray(bloc.sections)) return bloc.sections;
    if (Array.isArray(bloc.items)) return [{ items: bloc.items, _plat: true }];
    return [];
  }

  // --- Rail de chaîne (hubs crypto / indices et leurs sous-pages) ------------

  // La chaîne HIST·TR → VIEW → TEST → EXEC, toujours à portée : une barre
  // compacte sous l'en-tête, qui devient une colonne fixe dans la marge
  // gauche quand la fenêtre est assez large (voir styles.css). Construite
  // depuis les mêmes étages que la pyramide : seuls les projets à piliers
  // étagés (crypto, indices) ont une chaîne à montrer. `actifId` — l'id du
  // pilier racine de la page courante — allume la position.

  // Étiquette mono d'un pilier sur le rail (« HIST », « VIEW »…) : déclarée
  // dans translations.js (rail.<id>), les deux hubs partageant les mêmes ids.
  // Un pilier sans étiquette retombe sur son titre tronqué — jamais sur la
  // clé brute que renverrait I18n.t.
  function etiquetteRail(section) {
    const dico = window.TRADUCTIONS[window.I18n.langueActive()] || {};
    const cle = "rail." + String(section.id || "");
    if (Object.prototype.hasOwnProperty.call(dico, cle)) return dico[cle];
    return texteLocalise(section.titre).slice(0, 4).toUpperCase();
  }

  function rendreRailChaine(bloc, projet, pageSection, actifId) {
    document.querySelectorAll(".rail-chaine").forEach(function (el) {
      el.remove();
    });
    document.body.classList.remove("avec-rail");
    const main = document.querySelector("main");
    if (!main) return;
    const piliers = sectionsDuBloc(bloc).filter(function (s) {
      return !s._plat && !s.parent && !s.concept;
    });
    const niveaux = etagesDePiliers(piliers);
    if (!niveaux) return;

    const etages = niveaux
      .map(function (niveau) {
        const liens = niveau.sections
          .map(function (section) {
            const actif = String(section.id) === String(actifId || "");
            const href =
              pageSection +
              "?p=" + encodeURIComponent(projet) +
              "&s=" + encodeURIComponent(section.id);
            return (
              '<a class="rail-lien' + (actif ? " rail-actif" : "") + '"' +
              ' href="' + href + '"' +
              (actif ? ' aria-current="location"' : "") +
              ' title="' + echapper(texteLocalise(section.titre)) + '">' +
              echapper(etiquetteRail(section)) +
              "</a>"
            );
          })
          .join('<span class="rail-point" aria-hidden="true">·</span>');
        // Le nœud (HIST·TR) vit dans son propre span : en colonne fixe, la
        // flèche de jonction se place AU-DESSUS du nœud, pas à sa gauche.
        return (
          '<li class="rail-etage"><span class="rail-noeud">' + liens + "</span></li>"
        );
      })
      .join("");

    const nav = document.createElement("nav");
    nav.className = "rail-chaine";
    nav.setAttribute("aria-label", window.I18n.t("rail.aria"));
    nav.innerHTML = "<ol>" + etages + "</ol>";
    main.insertBefore(nav, main.firstChild);
    // Le drapeau sert au CSS : en colonne fixe, les planches pleine trame
    // cèdent la marge gauche au rail au lieu de passer dessous.
    document.body.classList.add("avec-rail");
  }

  // --- Carte des stratégies (SVG — page moteur-lean du hub crypto) -----------

  // Un SVG inline généré depuis les sous-sections : le banc au centre-gauche
  // (clé `carteCentre` de la section-hub), une rangée par famille (clé
  // `familles` : {id, titre, liaison}) et un nœud cliquable par stratégie
  // (clé `famille` + `carteNom` court ; le numéro et le statut existent
  // déjà). Les liaisons se lisent sur les arêtes du tronc ; une clé `arete`
  // {vers, libelle} d'une stratégie trace en plus un renvoi pointillé vers un
  // nœud superposé (« ajoute des stops à »). Aucune position dans le JSON :
  // la grille se calcule ici. Au large, la carte remplace les cartes du
  // sous-hub ; en mobile elles reprennent la main (voir .avec-carte).

  function creerCarteStrategies(section, enfants, projet, pageSection) {
    const familles = Array.isArray(section.familles) ? section.familles : [];
    const centre = texteLocalise(section.carteCentre);
    if (!centre || !familles.length) return "";

    const rangees = familles
      .map(function (famille) {
        return {
          famille: famille,
          strategies: enfants.filter(function (s) {
            return s.famille === famille.id;
          }),
        };
      })
      .filter(function (r) {
        return r.strategies.length;
      });
    if (rangees.length < 2) return "";

    // La grille : nœuds de 200×64, rangées de 92 px, tronc en L à gauche.
    const NOEUD_L = 200, NOEUD_H = 64, PAS_X = 28, DEPART_X = 268;
    const RANGEE_H = 92, HAUT = 18, TRONC_X = 224, CENTRE_L = 180;
    const H = HAUT + rangees.length * RANGEE_H;
    const centreY = H / 2;

    // Position de chaque nœud (pour les chaînes et les renvois `arete`).
    const geo = {};
    rangees.forEach(function (r, i) {
      const yHaut = HAUT + i * RANGEE_H;
      r.strategies.forEach(function (s, j) {
        geo[s.id] = { x: DEPART_X + j * (NOEUD_L + PAS_X), y: yHaut };
      });
    });

    function noeud(s) {
      const g = geo[s.id];
      const cy = g.y + NOEUD_H / 2;
      const nom = texteLocalise(s.carteNom) || texteLocalise(s.titre);
      const verdict = texteLocalise(s.statut);
      const aria =
        (s.numero ? s.numero + " · " : "") +
        texteLocalise(s.titre) +
        (verdict ? " — " + verdict : "");
      const href =
        pageSection +
        "?p=" + encodeURIComponent(projet) +
        "&s=" + encodeURIComponent(s.id);
      return (
        '<a class="cs-noeud" href="' + href + '" aria-label="' + echapper(aria) + '">' +
        '<rect x="' + g.x + '" y="' + g.y + '" width="' + NOEUD_L +
        '" height="' + NOEUD_H + '" rx="4"></rect>' +
        (s.numero
          ? '<text class="cs-numero" x="' + (g.x + 14) + '" y="' + (cy - 4) + '">' +
            echapper(s.numero) + "</text>"
          : "") +
        '<text class="cs-nom" x="' + (g.x + (s.numero ? 44 : 14)) + '" y="' + (cy - 2) + '">' +
        echapper(nom) + "</text>" +
        (verdict
          ? '<text class="cs-verdict" x="' + (g.x + 14) + '" y="' + (cy + 20) + '">' +
            echapper(verdict) + "</text>"
          : "") +
        "</a>"
      );
    }

    let traits = "";
    let etiquettes = "";
    let noeuds = "";
    let renvois = "";

    // Le tronc : du banc vers la colonne, puis un L par rangée de famille.
    const premierCy = HAUT + NOEUD_H / 2;
    const dernierCy = HAUT + (rangees.length - 1) * RANGEE_H + NOEUD_H / 2;
    traits +=
      '<path class="cs-tronc" d="M ' + (8 + CENTRE_L) + " " + centreY +
      " H " + TRONC_X + " M " + TRONC_X + " " + premierCy +
      " V " + dernierCy + '"></path>';

    rangees.forEach(function (r, i) {
      const yHaut = HAUT + i * RANGEE_H;
      const cy = yHaut + NOEUD_H / 2;
      traits +=
        '<path class="cs-tronc" d="M ' + TRONC_X + " " + cy +
        " H " + DEPART_X + '"></path>';
      // L'étiquette de famille se lit À DROITE de sa rangée, centrée sur elle :
      // la bande entre deux rangées reste libre pour les renvois `arete`.
      const titre = texteLocalise(r.famille.titre).toUpperCase();
      const liaison = texteLocalise(r.famille.liaison);
      const finRangee =
        geo[r.strategies[r.strategies.length - 1].id].x + NOEUD_L;
      etiquettes +=
        '<text class="cs-famille" x="' + (finRangee + 18) + '" y="' + (cy + 4) + '">' +
        echapper(titre) +
        (liaison
          ? ' <tspan class="cs-liaison">· ' + echapper(liaison) + "</tspan>"
          : "") +
        "</text>";
      // La chaîne entre deux stratégies d'une même famille (SMA — MACD).
      r.strategies.forEach(function (s, j) {
        if (j > 0) {
          const gauche = geo[r.strategies[j - 1].id];
          traits +=
            '<path class="cs-chaine" d="M ' + (gauche.x + NOEUD_L) + " " + cy +
            " H " + geo[s.id].x + '"></path>';
        }
        noeuds += noeud(s);
      });
    });

    // Renvois pointillés entre nœuds superposés (clé `arete` d'une stratégie).
    enfants.forEach(function (s) {
      if (!s.arete || !s.arete.vers || !geo[s.id]) return;
      const cible = geo[s.arete.vers];
      if (!cible) return;
      const g = geo[s.id];
      const gauche = Math.max(g.x, cible.x);
      const droite = Math.min(g.x + NOEUD_L, cible.x + NOEUD_L);
      if (droite - gauche < 40) return; // pas de recouvrement : rien à tracer.
      const xm = (gauche + droite) / 2;
      const haut = Math.min(g.y, cible.y) + NOEUD_H;
      const bas = Math.max(g.y, cible.y);
      renvois +=
        '<path class="cs-arete" d="M ' + xm + " " + haut + " V " + bas + '"></path>' +
        '<text class="cs-libelle" x="' + (xm + 10) + '" y="' +
        ((haut + bas) / 2 + 4) + '">' +
        echapper(texteLocalise(s.arete.libelle)) + "</text>";
    });

    // Le nœud central : la page courante — pas un lien, un repère.
    const centreHtml =
      '<g class="cs-noeud cs-centre" aria-hidden="true">' +
      '<rect x="8" y="' + (centreY - NOEUD_H / 2) + '" width="' + CENTRE_L +
      '" height="' + NOEUD_H + '" rx="4"></rect>' +
      '<text class="cs-nom" x="24" y="' + (centreY - 2) + '">' +
      echapper(centre) + "</text>" +
      '<text class="cs-verdict" x="24" y="' + (centreY + 20) + '">' +
      echapper(libelleCarteSection(section)) + "</text>" +
      "</g>";

    return (
      '<figure class="carte-strategies">' +
      '<svg viewBox="0 0 1080 ' + H + '" role="img" aria-label="' +
      echapper(window.I18n.t("carte.aria")) + '">' +
      traits + renvois + etiquettes + centreHtml + noeuds +
      "</svg>" +
      "</figure>"
    );
  }

  // --- Flux d'étapes d'un hub (clé racine "flux" — le parcours du 6/49) ------

  // « Phase 0 → Phase 1 (6 tests) → Phase 2 (4 modèles) → Synthèse » : une
  // étape cliquable par section listée, son statut en chip. Le titre se coupe
  // sur son tiret (« Phase 1 — Tests statistiques ») : le début en gros, la
  // suite en dessous.
  function creerFluxEtapes(bloc, projet, pageSection) {
    const ids = Array.isArray(bloc && bloc.flux) ? bloc.flux : [];
    if (!ids.length) return "";
    const sections = sectionsDuBloc(bloc);
    const etapes = ids
      .map(function (id) {
        return trouverSection(sections, id);
      })
      .filter(Boolean)
      .map(function (section) {
        const morceaux = texteLocalise(section.titre).split(/\s+—\s+/);
        const href =
          pageSection +
          "?p=" + encodeURIComponent(projet) +
          "&s=" + encodeURIComponent(section.id);
        return (
          '<a class="flux-etape" href="' + href + '">' +
          '<span class="flux-titre">' + echapper(morceaux[0]) + "</span>" +
          (morceaux[1]
            ? '<span class="flux-sous">' + echapper(morceaux[1]) + "</span>"
            : "") +
          '<span class="flux-chip">' + echapper(libelleCarteSection(section)) + "</span>" +
          "</a>"
        );
      });
    if (!etapes.length) return "";
    return (
      '<nav class="flux-etapes" aria-label="' +
      echapper(window.I18n.t("flux.aria")) + '">' +
      etapes.join('<span class="flux-fleche" aria-hidden="true">→</span>') +
      "</nav>"
    );
  }

  // --- Bloc « Continuer » et miroir crypto ↔ indices -------------------------

  // Aucune page de section ne finit en cul-de-sac : la suite logique, le même
  // pilier sur l'autre marché (clé racine "jumeau" des squelettes crypto /
  // indices — recopiée telle quelle par sync-site.py), et les concepts liés
  // (clé "renvois" de la section, les mêmes chips qu'en tête de page).

  // La section « suivante » dans le sens de lecture : le prochain frère de
  // même parent, sinon le suivant du parent (récursif) — la dernière
  // stratégie d'un banc continue ainsi vers l'autre moteur. Les bandeaux
  // « concept » du hub n'entrent pas dans la marche.
  function sectionSuivante(sections, section) {
    let s = section;
    let garde = 0;
    while (s && garde++ < 6) {
      const parent = s.parent || null;
      const freres = sections.filter(function (f) {
        return !f._plat && !f.concept && (f.parent || null) === parent;
      });
      const idx = freres.indexOf(s);
      if (idx !== -1 && idx + 1 < freres.length) return freres[idx + 1];
      s = parent ? trouverSection(sections, parent) : null;
    }
    return null;
  }

  function carteContinuer(etiquetteCle, titre, href) {
    return (
      '<a class="carte-portfolio carte-continuer" href="' + href + '">' +
      '<span class="continuer-etiquette" data-i18n="' + etiquetteCle + '"></span>' +
      "<h3>" + echapper(titre) + "</h3>" +
      '<span class="fleche">' + echapper(window.I18n.t("hub.ouvrir")) + " →</span>" +
      "</a>"
    );
  }

  async function creerBlocContinuer(bloc, projet, pageSection, section, sections, concepts) {
    const cartes = [];

    const suivante = sectionSuivante(sections, section);
    if (suivante) {
      cartes.push(
        carteContinuer(
          "continuer.suite",
          texteLocalise(suivante.titre),
          pageSection +
            "?p=" + encodeURIComponent(projet) +
            "&s=" + encodeURIComponent(suivante.id)
        )
      );
    }

    // Le miroir de l'autre marché, au niveau du PILIER racine : depuis une
    // stratégie du backtesting crypto, le jumeau est le pilier Backtesting
    // des indices — même chaîne, autre marché. On vérifie que le pilier
    // existe bien chez le jumeau avant d'offrir la carte.
    const racine = cheminSections(sections, section)[0] || null;
    if (bloc && bloc.jumeau && racine && typeof racine.etage === "number") {
      try {
        const blocJumeau = await chargerProjet(bloc.jumeau);
        const pilierJumeau = trouverSection(sectionsDuBloc(blocJumeau), racine.id);
        if (pilierJumeau) {
          cartes.push(
            carteContinuer(
              "continuer.jumeau",
              texteLocalise(pilierJumeau.titre) + " — " + titreProjet(bloc.jumeau),
              pageSection +
                "?p=" + encodeURIComponent(bloc.jumeau) +
                "&s=" + encodeURIComponent(racine.id)
            )
          );
        }
      } catch (err) {
        console.error("[continuer] Jumeau injoignable :", err);
      }
    }

    const chips = creerChipsConcepts(section.renvois, concepts);
    if (chips) {
      cartes.push(
        '<div class="carte-portfolio carte-continuer carte-continuer-concepts">' +
        '<span class="continuer-etiquette" data-i18n="continuer.concepts"></span>' +
        '<div class="continuer-chips">' + chips + "</div>" +
        "</div>"
      );
    }

    if (!cartes.length) return "";
    return (
      '<aside class="continuer">' +
      '<h2 class="continuer-titre" data-i18n="continuer.titre"></h2>' +
      '<div class="continuer-grille">' + cartes.join("") + "</div>" +
      "</aside>"
    );
  }

  // Bandeau-miroir d'un hub (« Même chaîne, autre marché : Indices → ») :
  // pleine largeur sous la pyramide, depuis la clé racine "jumeau".
  function creerBandeauMiroir(bloc) {
    const meta = bloc && bloc.jumeau ? metaProjet(bloc.jumeau) : null;
    if (!meta) return "";
    return (
      '<a class="bandeau-miroir" href="' + meta.href + '">' +
      '<span class="miroir-etiquette" data-i18n="continuer.jumeau"></span>' +
      '<span class="miroir-titre" data-i18n="' + meta.titre + '"></span>' +
      '<span class="fleche">→</span>' +
      "</a>"
    );
  }

  // Rendu principal (projet « à plat »). Gère chargement / vide / erreur / contenu.
  async function rendre(options) {
    const conteneur = options.conteneur;
    const projet = options.projet || null;
    if (!conteneur) return;

    conteneur.setAttribute("aria-busy", "true");
    conteneur.innerHTML =
      '<p class="galerie-message" data-i18n="contenu.chargement"></p>';
    window.I18n.appliquerTraductions(conteneur);

    try {
      const bloc = await chargerProjet(projet);
      const sections = sectionsDuBloc(bloc);
      const lienCode = lienCodeSource(projet);
      const total = sections.reduce(function (n, s) {
        return n + (Array.isArray(s.items) ? s.items.length : 0);
      }, 0);

      if (total === 0) {
        conteneur.classList.add("galerie");
        conteneur.innerHTML =
          lienCode +
          '<p class="galerie-message" data-i18n="contenu.vide"></p>';
      } else if (sections.length === 1 && sections[0]._plat) {
        conteneur.classList.add("galerie");
        const items = sections[0].items;
        conteneur.innerHTML =
          lienCode +
          banniereAvertissementPdf(contientPdf(sections)) +
          items.map(creerCarte).join("");
      } else {
        conteneur.classList.remove("galerie");
        conteneur.innerHTML =
          lienCode +
          banniereAvertissementPdf(contientPdf(sections)) +
          creerSommaire(sections) +
          sections.map(creerSection).join("");
      }
    } catch (err) {
      console.error("[contenu] Échec du chargement :", err);
      conteneur.innerHTML =
        '<p class="galerie-message erreur" data-i18n="contenu.erreur"></p>';
    } finally {
      conteneur.setAttribute("aria-busy", "false");
      window.I18n.appliquerTraductions(conteneur);
    }
  }

  // --- Hub de projet : table des matières ------------------------------------

  // Libellé de comptage d'une section (ex. « 10 documents », « 6 figures »,
  // « Lecture » pour une section en texte seul).
  function libelleCompte(section) {
    const items = Array.isArray(section.items) ? section.items : [];
    const n = items.length;
    if (n === 0) return window.I18n.t("hub.lecture");
    const cle = items[0].type === "pdf" ? "hub.documents" : "hub.figures";
    const mot = window.I18n.t(n > 1 ? cle : cle + "_un");
    return n + " " + mot;
  }

  // Libellé du chip d'une carte de section : le champ "statut" (bilingue) s'il
  // existe — ex. « 9 leçons », « En attente », « 3 parties » — sinon le compte
  // d'items. Permet à une section-hub (sans items) ou en attente d'annoncer son
  // état plutôt qu'un décompte trompeur.
  function libelleCarteSection(section) {
    return texteLocalise(section.statut) || libelleCompte(section);
  }

  // Carte d'un pilier dans la table des matières d'un hub — grille OU pyramide.
  function carteDePilier(section, projet, pageSection, titresSeuls, idx) {
    const titre = texteLocalise(section.titre);
    // Accroche courte pour la carte du hub ; à défaut l'intro, puis le texte
    // complet. 'accroche' évite d'étaler toute la prose (ex. la Conclusion, qui
    // n'a pas d'intro) sur la table des matières.
    const desc = titresSeuls
      ? ""
      : texteLocalise(section.accroche) ||
        texteLocalise(section.intro) ||
        texteLocalise(section.texte);
    const id = section.id || String(idx);
    const href =
      pageSection +
      "?p=" + encodeURIComponent(projet) +
      "&s=" + encodeURIComponent(id);
    return creerCarteLien(titre, desc, href, libelleCarteSection(section));
  }

  // Rendu du HUB (table des matières). Deux cas :
  //   - projet SECTIONNÉ (649) : une carte par section -> page section.
  //   - projet à items PLATS (Python) : une carte par item -> page item.
  async function rendreHub(options) {
    const conteneur = options.conteneur;
    const projet = options.projet || null;
    const pageSection = options.pageSection || "";
    const pageItem = options.pageItem || "";
    if (!conteneur) return;

    conteneur.setAttribute("aria-busy", "true");
    conteneur.innerHTML =
      '<p class="galerie-message" data-i18n="contenu.chargement"></p>';
    window.I18n.appliquerTraductions(conteneur);

    try {
      const bloc = await chargerProjet(projet);
      const toutes = sectionsDuBloc(bloc);
      const estPlat = toutes.length === 1 && toutes[0]._plat;
      const lienCode = lienCodeSource(projet);
      // data-hub-titres-seuls sur le conteneur : cartes sans description
      // (les hubs Crypto / Indices, où le titre du pilier suffit).
      const titresSeuls = conteneur.hasAttribute("data-hub-titres-seuls");
      const sections = toutes.filter(function (s) {
        // On exclut les sous-sections (parent défini) : elles sont présentées
        // dans le sous-hub de leur section parente, pas dans le hub principal.
        return !s._plat && !s.parent;
      });

      if (estPlat) {
        // Projet à items plats : la table des matières liste les items.
        const items = toutes[0].items || [];
        if (!items.length) {
          conteneur.innerHTML =
            lienCode +
            '<p class="galerie-message" data-i18n="contenu.vide"></p>';
        } else {
          conteneur.innerHTML =
            lienCode +
            '<div class="grille-hub">' +
            items
              .map(function (item) {
                const titre = texteLocalise(item.titre);
                const desc = texteLocalise(item.description);
                const href =
                  pageItem +
                  "?p=" + encodeURIComponent(projet) +
                  "&i=" + encodeURIComponent(item.id);
                const fleche =
                  item.type === "pdf"
                    ? window.I18n.t("documents.voir")
                    : window.I18n.t("hub.ouvrir");
                return creerCarteLien(titre, desc, href, fleche);
              })
              .join("") +
            "</div>";
        }
      } else if (sections.length === 0) {
        conteneur.innerHTML =
          lienCode +
          '<p class="galerie-message" data-i18n="contenu.vide"></p>';
      } else {
        // Les sections « concept » sortent de la grille des piliers : elles se
        // rendent en bandeau pleine largeur à la suite.
        const concepts = sections.filter(function (s) {
          return s.concept;
        });
        const piliers = sections.filter(function (s) {
          return !s.concept;
        });
        // Les piliers étagés (clé `etage`) racontent une chaîne : ils se rendent
        // en pyramide. Les autres hubs gardent la grille.
        const niveaux = etagesDePiliers(piliers);
        function grilleDesPiliers() {
          return (
            '<div class="grille-hub">' +
            piliers
              .map(function (section, idx) {
                return carteDePilier(section, projet, pageSection, titresSeuls, idx);
              })
              .join("") +
            "</div>"
          );
        }
        conteneur.innerHTML =
          lienCode +
          creerFluxEtapes(bloc, projet, pageSection) +
          (niveaux
            ? construirePyramide(niveaux, projet, pageSection, titresSeuls)
            : grilleDesPiliers()) +
          concepts
            .map(function (section) {
              return creerBandeauConcept(section, projet, pageSection);
            })
            .join("") +
          creerBandeauMiroir(bloc);
      }
      // Rail de chaîne du hub : la chaîne entière, aucune position allumée.
      rendreRailChaine(bloc, projet, pageSection, null);
    } catch (err) {
      console.error("[hub] Échec du chargement :", err);
      conteneur.innerHTML =
        '<p class="galerie-message erreur" data-i18n="contenu.erreur"></p>';
    } finally {
      conteneur.setAttribute("aria-busy", "false");
      window.I18n.appliquerTraductions(conteneur);
    }
  }

  // Résout une section par id (ou index numérique de secours).
  function trouverSection(sections, sectionId) {
    let section = sections.filter(function (s) {
      return String(s.id || "") === String(sectionId);
    })[0];
    if (!section && /^\d+$/.test(String(sectionId))) {
      section = sections[parseInt(sectionId, 10)];
    }
    return section || null;
  }

  // Résout un item par id (ou index numérique de secours).
  function trouverItem(items, itemId) {
    let item = items.filter(function (it) {
      return String(it.id || "") === String(itemId);
    })[0];
    if (!item && /^\d+$/.test(String(itemId))) {
      item = items[parseInt(itemId, 10)];
    }
    return item || null;
  }

  // Chaîne des parents d'une section, du hub vers elle (« backtesting »
  // avant « moteur-lean »). Garde-fou contre un cycle accidentel de `parent`.
  function cheminSections(sections, section) {
    const chaine = [];
    let s = section;
    let garde = 0;
    while (s && garde++ < 6) {
      chaine.unshift(s);
      s = s.parent ? trouverSection(sections, s.parent) : null;
    }
    return chaine;
  }

  // Fil d'Ariane des sous-pages (« Crypto / Backtesting / RSI ») : remplit
  // [data-fil-ariane] depuis une liste { titre, href } — le dernier morceau
  // est la page courante, sans lien. Renvoie false si le gabarit n'a pas de
  // fil d'Ariane : l'appelant retombe alors sur le lien-retour simple.
  function remplirFilAriane(morceaux) {
    const elAriane = document.querySelector("[data-fil-ariane]");
    if (!elAriane) return false;
    elAriane.innerHTML = morceaux
      .map(function (m, i) {
        const dernier = i === morceaux.length - 1;
        return !dernier && m.href
          ? '<a href="' + m.href + '">' + echapper(m.titre) + "</a>"
          : '<span aria-current="page">' + echapper(m.titre) + "</span>";
      })
      .join('<span class="fil-separateur" aria-hidden="true">/</span>');
    return true;
  }

  // Rendu d'UNE section (sous-page). Remplit aussi l'en-tête de page :
  // [data-section-titre], [data-section-intro] et le fil d'Ariane
  // [data-fil-ariane] (ou l'ancien lien retour [data-lien-retour]).
  async function rendreSection(options) {
    const conteneur = options.conteneur;
    const projet = options.projet || null;
    const sectionId = options.sectionId || null;
    const pageItem = options.pageItem || "";
    const pageSection = options.pageSection || ""; // pour les cartes d'un sous-hub.
    if (!conteneur) return;

    conteneur.setAttribute("aria-busy", "true");
    conteneur.innerHTML =
      '<p class="galerie-message" data-i18n="contenu.chargement"></p>';
    window.I18n.appliquerTraductions(conteneur);

    try {
      const bloc = await chargerProjet(projet);
      const sections = sectionsDuBloc(bloc);
      const section = trouverSection(sections, sectionId);

      const elTitre = document.querySelector("[data-section-titre]");
      const elIntro = document.querySelector("[data-section-intro]");
      // Chaîne des parents (fil d'Ariane, rail, bloc Continuer) : son premier
      // maillon est le pilier RACINE de la page courante.
      const chemin = cheminSections(sections, section);
      rendreRailChaine(bloc, projet, pageSection, chemin.length ? chemin[0].id : null);
      // Fil d'Ariane : hub du projet / chaîne des parents / section courante.
      const morceaux = [{ titre: titreProjet(projet), href: hrefProjet(projet) }];
      chemin.forEach(function (s) {
        morceaux.push({
          titre: texteLocalise(s.titre),
          href:
            pageSection +
            "?p=" + encodeURIComponent(projet) +
            "&s=" + encodeURIComponent(s.id),
        });
      });
      if (!remplirFilAriane(morceaux)) {
        // Ancien gabarit : lien retour simple vers la section PARENTE si
        // sous-section, sinon vers l'accueil du projet. On fixe le texte ici
        // (et on retire data-i18n) pour qu'appliquerTraductions ne l'écrase pas.
        const elRetour = document.querySelector("[data-lien-retour]");
        if (elRetour) {
          elRetour.removeAttribute("data-i18n");
          if (section && section.parent) {
            const parentSection = trouverSection(sections, section.parent);
            elRetour.setAttribute(
              "href",
              pageSection +
                "?p=" + encodeURIComponent(projet) +
                "&s=" + encodeURIComponent(section.parent)
            );
            elRetour.textContent =
              "← " + texteLocalise(parentSection ? parentSection.titre : "");
          } else {
            elRetour.setAttribute("href", hrefProjet(projet));
            elRetour.textContent = window.I18n.t("contenu.retour");
          }
        }
      }

      if (!section) {
        conteneur.innerHTML =
          '<p class="galerie-message erreur" data-i18n="contenu.erreur"></p>';
        return;
      }

      const titre = texteLocalise(section.titre);
      if (elTitre) elTitre.textContent = titre;
      if (elIntro) elIntro.textContent = texteLocalise(section.intro);
      if (titre) document.title = titre + " — " + titreProjet(projet) + " — iAlexMG";

      const items = Array.isArray(section.items) ? section.items : [];
      const texte = texteLocalise(section.texte);
      // Les pastilles se déclarent par id dans les piliers ; leurs couleurs
      // vivent dans la clé "sources" du projet (squelette du hub).
      const sources = Array.isArray(bloc && bloc.sources) ? bloc.sources : [];
      const marques = creerRangeeMarques(section, sources);
      // Renvois de concepts (clé "renvois") : la carte des concepts n'est
      // chargée que si la page en déclare — les autres pages ne paient rien.
      const concepts =
        section.renvois && section.renvois.length ? await chargerConcepts() : {};
      const entete = marques + creerRenvois(section.renvois, concepts);

      if (section.sousHub) {
        // Section-hub : ses sous-sections (parent === cette section) forment un
        // sous-hub imbriqué — une carte par sous-section, menant à sa page.
        // Ses items éventuels l'illustrent en tête (ex. la capture du terminal
        // sur le pilier Visualisations).
        const enfants = sections.filter(function (s) {
          return s.parent === (section.id || sectionId);
        });
        // Les items d'une section-hub ne sont pas des items parmi d'autres :
        // ils portent le sujet de la page (la capture des quatre vues, en tête
        // de l'arborescence des Visualisations). D'où la galerie de tête.
        const galerie = items.length
          ? '<div class="galerie galerie-tete">' + items.map(creerCarte).join("") + "</div>"
          : "";
        const sousHub = construireSousHubSections(enfants, projet, pageSection, sources);
        // Carte SVG des stratégies (clés carteCentre/familles) : au large elle
        // remplace les cartes du sous-hub, en mobile les cartes restent.
        const carte = creerCarteStrategies(section, enfants, projet, pageSection);
        const indexEnfants = carte
          ? '<div class="avec-carte">' + carte + sousHub + "</div>"
          : sousHub;
        // Une section-hub illustrée EN TÊTE est une arborescence : l'image
        // générale est la racine, ses sous-sections les branches qui la
        // démontent. Une fourche descend donc de l'image vers les cartes, et la
        // prose passe SOUS l'arbre — une vue se lit juste sous l'image dont elle
        // est extraite, pas après un paragraphe. Les section-hubs sans
        // illustration (Historiques, Temps réel) n'ont pas de racine à montrer :
        // ils gardent leur prose avant les cartes.
        // `cartesEnTete` : le sous-hub passe AVANT la prose — la page se lit
        // alors comme un index navigable (les cartes numérotées d'un banc, avec
        // leur résultat), le récit détaillé venant en soutien dessous. Sans le
        // drapeau, on garde l'ordre habituel (prose puis cartes).
        conteneur.innerHTML =
          avertissementTexteFr(section.texte) +
          entete +
          (galerie && enfants.length
            ? // --n : le nombre de branches. La fourche et la grille des cartes
              // s'y accordent pour tenir sur une rangée unique (voir styles.css).
              '<div class="arborescence" style="--n: ' + enfants.length + '">' +
              galerie + creerFourcheArbre(enfants.length) + sousHub +
              "</div>" + rendreProse(texte)
            : section.cartesEnTete
            ? galerie + indexEnfants + rendreProse(texte)
            : galerie + rendreProse(texte) + indexEnfants);
      } else if (items.length) {
        // Les items d'une page de section se lisent hors des cartes : PDF en
        // index de fichiers façon terminal, figures en planches numérotées
        // pleine largeur. Une section `sousMenu` (chaque item a sa page) lie
        // chaque planche/ligne vers sa page item ; sans le drapeau, on ne lie
        // une planche que si l'item a un récit détaillé à offrir.
        function hrefItemDeSection(item, exigerTexte) {
          if (!pageItem || !item.id) return null;
          if (
            exigerTexte &&
            !section.sousMenu &&
            !(item.texte && texteLocalise(item.texte))
          )
            return null;
          return (
            pageItem +
            "?p=" + encodeURIComponent(projet) +
            "&s=" + encodeURIComponent(section.id || sectionId) +
            "&i=" + encodeURIComponent(item.id)
          );
        }
        const aPdf = items.some(function (it) {
          return it.type === "pdf";
        });
        conteneur.innerHTML =
          banniereAvertissementPdf(aPdf) +
          avertissementTexteFr(section.texte) +
          entete +
          (section.sousMenu
            ? rendreProse(texte) + rendreItemsEnPlanches(items, hrefItemDeSection)
            : rendreItemsEnPlanches(items, hrefItemDeSection) + rendreProse(texte));
        marquerPlanchesLarges(conteneur);
      } else if (texte) {
        conteneur.innerHTML =
          avertissementTexteFr(section.texte) + entete + rendreProse(texte);
      } else if (entete) {
        conteneur.innerHTML = entete;
      } else {
        conteneur.innerHTML =
          '<div class="galerie"><p class="galerie-message" data-i18n="contenu.vide"></p></div>';
      }

      // Fin de page : le bloc « Continuer » — jamais de cul-de-sac.
      const continuer = await creerBlocContinuer(
        bloc, projet, pageSection, section, sections, concepts
      );
      if (continuer) conteneur.insertAdjacentHTML("beforeend", continuer);
    } catch (err) {
      console.error("[section] Échec du chargement :", err);
      conteneur.innerHTML =
        '<p class="galerie-message erreur" data-i18n="contenu.erreur"></p>';
    } finally {
      conteneur.setAttribute("aria-busy", "false");
      window.I18n.appliquerTraductions(conteneur);
    }
  }

  // Rendu d'UNE feuille (page item). Média en grand + texte détaillé.
  // Remplit l'en-tête : [data-section-titre], [data-section-intro] et le lien
  // retour [data-lien-retour] (vers la section pour un projet sectionné, vers le
  // hub pour un projet à items plats).
  async function rendreItem(options) {
    const conteneur = options.conteneur;
    const projet = options.projet || null;
    const sectionId = options.sectionId || null;
    const itemId = options.itemId || null;
    const pageSection = options.pageSection || "";
    if (!conteneur) return;

    conteneur.setAttribute("aria-busy", "true");
    conteneur.innerHTML =
      '<p class="galerie-message" data-i18n="contenu.chargement"></p>';
    window.I18n.appliquerTraductions(conteneur);

    const elTitre = document.querySelector("[data-section-titre]");
    const elIntro = document.querySelector("[data-section-intro]");

    try {
      const bloc = await chargerProjet(projet);
      const sections = sectionsDuBloc(bloc);

      let section = null;
      let items = [];
      if (sectionId) {
        section = trouverSection(sections, sectionId);
        items = section ? section.items || [] : [];
      } else {
        const plat = sections.filter(function (s) {
          return s._plat;
        })[0] || sections[0];
        items = plat ? plat.items || [] : [];
      }
      const item = trouverItem(items, itemId);

      // Rail de chaîne : la position de la page est son pilier racine.
      const chemin =
        section && !section._plat ? cheminSections(sections, section) : [];
      rendreRailChaine(bloc, projet, pageSection, chemin.length ? chemin[0].id : null);

      // Fil d'Ariane : hub / chaîne des sections (sauf plat) / item courant.
      const morceaux = [{ titre: titreProjet(projet), href: hrefProjet(projet) }];
      if (section && !section._plat) {
        chemin.forEach(function (s) {
          morceaux.push({
            titre: texteLocalise(s.titre),
            href:
              pageSection +
              "?p=" + encodeURIComponent(projet) +
              "&s=" + encodeURIComponent(s.id),
          });
        });
      }
      if (item) morceaux.push({ titre: texteLocalise(item.titre) });
      if (!remplirFilAriane(morceaux)) {
        // Ancien gabarit : lien retour simple vers la section (649) ou le hub
        // du projet (Python). On retire data-i18n car on fixe le texte ici
        // (sinon appliquerTraductions sur tout le document l'écraserait).
        const elRetour = document.querySelector("[data-lien-retour]");
        if (elRetour) {
          elRetour.removeAttribute("data-i18n");
          if (section && !section._plat) {
            elRetour.setAttribute(
              "href",
              pageSection +
                "?p=" + encodeURIComponent(projet) +
                "&s=" + encodeURIComponent(sectionId)
            );
            elRetour.textContent = "← " + texteLocalise(section.titre);
          } else {
            elRetour.setAttribute("href", hrefProjet(projet));
            elRetour.textContent = window.I18n.t("contenu.retour");
          }
        }
      }

      if (!item) {
        if (elTitre) elTitre.textContent = window.I18n.t("contenu.erreur");
        conteneur.innerHTML =
          '<p class="galerie-message erreur" data-i18n="contenu.erreur"></p>';
        return;
      }

      const titre = texteLocalise(item.titre);
      if (elTitre) elTitre.textContent = titre;
      if (elIntro) elIntro.textContent = texteLocalise(item.description);
      if (titre) document.title = titre + " — " + titreProjet(projet) + " — iAlexMG";

      const estPdf = item.type === "pdf";
      const media = estPdf
        ? creerVisionneusePdf(item, titre)
        : creerFigurePleine(item, titre);

      conteneur.innerHTML =
        banniereAvertissementPdf(estPdf) +
        avertissementTexteFr(item.texte) +
        media +
        rendreProse(texteLocalise(item.texte));
    } catch (err) {
      console.error("[item] Échec du chargement :", err);
      conteneur.innerHTML =
        '<p class="galerie-message erreur" data-i18n="contenu.erreur"></p>';
    } finally {
      conteneur.setAttribute("aria-busy", "false");
      window.I18n.appliquerTraductions(conteneur);
    }
  }

  return {
    rendre: rendre,
    rendreHub: rendreHub,
    rendreSources: rendreSources,
    rendreSection: rendreSection,
    rendreItem: rendreItem,
  };
})();

window.Contenu = Contenu;
