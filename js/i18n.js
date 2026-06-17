/*
 * i18n.js
 * --------------------------------------------------------------------------
 * Moteur de traduction minimaliste.
 *
 * Dépend de translations.js (window.TRADUCTIONS, window.LANGUES_DISPONIBLES).
 *
 * Fonctionnement :
 *   - La langue active est stockée dans localStorage ("langue").
 *   - t(cle) renvoie le texte traduit dans la langue active.
 *   - appliquerTraductions(racine) parcourt les éléments [data-i18n] et
 *     remplace leur contenu (ou un attribut via data-i18n-attr).
 *   - changerLangue(lang) met à jour la langue, l'attribut <html lang>,
 *     ré-applique les traductions et notifie les autres modules via un
 *     évènement "langue:changee" (utile pour redessiner la galerie).
 *
 * Utilisation dans le HTML :
 *   <h1 data-i18n="accueil.titre"></h1>                -> remplace le texte
 *   <a data-i18n="nav.contact"></a>                    -> remplace le texte
 *   <img data-i18n="img.alt" data-i18n-attr="alt">     -> remplace l'attribut alt
 * --------------------------------------------------------------------------
 */

const I18n = (function () {
  const CLE_STOCKAGE = "langue";
  const LANGUE_DEFAUT = window.LANGUES_DISPONIBLES[0] || "fr";

  // Récupère la langue mémorisée, ou la langue par défaut.
  function langueActive() {
    const memo = localStorage.getItem(CLE_STOCKAGE);
    return window.LANGUES_DISPONIBLES.includes(memo) ? memo : LANGUE_DEFAUT;
  }

  // Traduit une clé dans la langue active. Renvoie la clé elle-même si absente
  // (visible en développement, signale une traduction manquante).
  function t(cle, lang) {
    const langue = lang || langueActive();
    const dico = window.TRADUCTIONS[langue] || {};
    if (Object.prototype.hasOwnProperty.call(dico, cle)) return dico[cle];
    console.warn("[i18n] Clé manquante :", cle, "(" + langue + ")");
    return cle;
  }

  // Applique les traductions à tous les éléments [data-i18n] sous "racine".
  function appliquerTraductions(racine) {
    const zone = racine || document;
    const langue = langueActive();

    zone.querySelectorAll("[data-i18n]").forEach(function (el) {
      const cle = el.getAttribute("data-i18n");
      const attr = el.getAttribute("data-i18n-attr"); // ex : "alt", "placeholder", "aria-label"
      const valeur = t(cle, langue);
      if (attr) {
        el.setAttribute(attr, valeur);
      } else {
        el.textContent = valeur;
      }
    });
  }

  // Change la langue active puis rafraîchit la page (textes + évènement).
  function changerLangue(nouvelleLangue) {
    if (!window.LANGUES_DISPONIBLES.includes(nouvelleLangue)) return;
    localStorage.setItem(CLE_STOCKAGE, nouvelleLangue);
    document.documentElement.setAttribute("lang", nouvelleLangue);
    appliquerTraductions(document);
    // Notifie les modules dynamiques (galerie, etc.) qu'ils doivent se redessiner.
    document.dispatchEvent(
      new CustomEvent("langue:changee", { detail: { langue: nouvelleLangue } })
    );
  }

  // Bascule vers la "prochaine" langue de la liste (toggle simple FR <-> EN).
  function basculerLangue() {
    const liste = window.LANGUES_DISPONIBLES;
    const indexActuel = liste.indexOf(langueActive());
    const suivant = liste[(indexActuel + 1) % liste.length];
    changerLangue(suivant);
  }

  return {
    langueActive: langueActive,
    t: t,
    appliquerTraductions: appliquerTraductions,
    changerLangue: changerLangue,
    basculerLangue: basculerLangue,
  };
})();

window.I18n = I18n;
