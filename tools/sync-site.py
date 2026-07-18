#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
sync-site.py — Synchronise le contenu des projets (dossier Portfolio) vers le site.

ARCHITECTURE « source → pipeline → vitrine » :
  - La SOURCE DE VÉRITÉ d'un projet est son dossier conventionné :
        Portfolio/<Projet>/site-content/
            contenu.json    (le contenu du projet — schéma : data/projets/README.md)
            assets/…        (figures, PDF, images — arborescence libre)
  - Ce script copie vers la VITRINE (ce dépôt) :
        contenu.json  ->  data/projets/<id>.json
        assets/**     ->  assets/<id>/**   (MIROIR : ajouts, mises à jour,
                                            suppressions des fichiers orphelins)

PROJETS « HUB » (crypto, indices) — un mono-dépôt en 4 piliers
(historique / affichage / backtesting / automatisation) :
  - Le SQUELETTE du hub est <mono-dépôt>/site-content/contenu.json : une section
    par pilier (titre, accroche, statut, prose). Ses autres clés de premier
    niveau (ex. "sources") sont recopiées telles quelles dans le JSON du site.
  - Une section du squelette peut porter "inclure": "<pilier>" : le script y
    injecte les sections de <mono-dépôt>/<pilier>/site-content/contenu.json en
    SOUS-SECTIONS (champ parent = id de la section, mécanisme sousHub du site).
  - Une section de pilier qui porte "masque": true est ÉCARTÉE de l'assemblage :
    sa source reste versionnée (l'évaluation qui a mené au rejet d'un exchange
    garde sa trace) mais elle ne paraît plus dans le sous-hub. Le hub la
    présente à sa façon — voir la clé "sources" du squelette crypto.
  - Cas particulier « pilier page unique » (ex. crypto/historique) : une section
    du pilier qui porte le MÊME id que la section du squelette la COMPLÈTE
    (texte, items… ; les champs du squelette priment) au lieu de s'y accrocher ;
    si le pilier n'apporte aucune sous-section, le flag sousHub est retiré.
  - Les assets de chaque pilier inclus vont dans assets/<id-du-hub>/<pilier>/
    (ex. assets/crypto/affichage) : les URL des contenu.json sources pointent
    déjà sur ce chemin final — on ne les réécrit pas.

USAGE (depuis la racine du site iAlexMG.ca) :
    python tools/sync-site.py             # synchronise tous les projets
    python tools/sync-site.py --dry-run   # montre ce qui serait fait, sans écrire
    python tools/sync-site.py 649 crypto  # limite à certains projets

RÈGLES :
  - Un projet SANS dossier site-content/ est ignoré : le site garde son contenu.
  - contenu.json est validé (json.load) AVANT toute copie ; en cas d'erreur de
    syntaxe, le projet est sauté et le script termine en code 1.
  - Les .gitkeep du site ne sont jamais supprimés.
  - Le dossier Portfolio est supposé être à côté du dossier du site
    (…/Claude_Code/Portfolio) ; sinon, passer --portfolio <chemin>.

Après une synchro : git add -A && git commit && git push.
"""

import argparse
import filecmp
import json
import shutil
import sys
from pathlib import Path

# Console Windows : force UTF-8 pour les accents et les symboles du rapport.
try:
    sys.stdout.reconfigure(encoding="utf-8")
except AttributeError:
    pass

# Projets SIMPLES : id du site (data/projets/<id>.json, assets/<id>/) -> dossier
# dans Portfolio (le site-content est à la racine de ce dossier).
PROJETS = {
    "detection": "Détection d'objets",
}

# Projets HUB : id du site -> le dossier qui porte son squelette (voir l'en-tête).
#   dossiers : candidats essayés dans l'ordre — le staging _restructure/ d'abord,
#              puis l'emplacement final prévu après le ménage local. ⚠️ Piège de
#              casse Windows : « crypto » matcherait aussi l'ANCIEN dossier
#              « Crypto » tant qu'il existe, d'où la priorité au staging.
#   chemins  : pilier inclus -> son dossier, RELATIF À PORTFOLIO. À défaut, le
#              pilier est cherché sous la racine du hub (<racine>/<pilier>). Sert
#              aux hubs dont les piliers vivent ailleurs : Formations rassemble
#              des cours qui restent chez eux (la formation LEAN/vectorbt reste
#              dans le mono-dépôt crypto, à côté des backtests qu'elle enseigne).
#              Toujours déclarer la casse exacte du dossier — voir le piège ci-dessus.
#   assets   : pilier inclus -> dossier assets/<...> du site, au schéma
#              standard <id-du-hub>/<pilier> (ne pas renommer sans réécrire
#              les URL dans les contenu.json sources).
HUBS = {
    "crypto": {
        "dossiers": ["_restructure/crypto", "crypto"],
        "assets": {
            "historique": "crypto/historique",
            "affichage": "crypto/affichage",
            "backtesting": "crypto/backtesting",
        },
    },
    "indices": {
        "dossiers": ["_restructure/indicesBoursiers", "indicesBoursiers"],
        "assets": {
            "historique": "indices/historique",
            "affichage": "indices/affichage",
            "backtesting": "indices/backtesting",
        },
    },
    "formations": {
        "dossiers": ["Formations"],
        "chemins": {
            "python": "Formations/Python",
            "github": "Formations/Github",
            "trading": "crypto/backtesting/formation",
        },
        "assets": {
            "python": "formations/python",
            "github": "formations/github",
            "trading": "formations/trading",
        },
    },
    "statistiques": {
        "dossiers": ["Statistiques"],
        "chemins": {"lotto-649": "Statistiques/Lotto 649"},
        "assets": {"lotto-649": "statistiques/lotto-649"},
    },
}

RACINE_SITE = Path(__file__).resolve().parent.parent


def lister_fichiers(dossier):
    """Tous les fichiers sous `dossier`, en chemins relatifs (Path). """
    if not dossier.is_dir():
        return set()
    return {p.relative_to(dossier) for p in dossier.rglob("*") if p.is_file()}


def copier(src, dst, dry_run):
    if not dry_run:
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)


def supprimer(fichier, dry_run):
    if not dry_run:
        fichier.unlink()


def miroir_assets(assets_src, assets_dst, dry_run, actions):
    """Miroir assets_src/** -> assets_dst/** (copies + orphelins supprimés)."""
    if not assets_src.is_dir():
        return
    fichiers_src = lister_fichiers(assets_src)
    fichiers_dst = lister_fichiers(assets_dst)

    copies = 0
    for rel in sorted(fichiers_src):
        src, dst = assets_src / rel, assets_dst / rel
        if rel not in fichiers_dst or not filecmp.cmp(src, dst, shallow=False):
            copier(src, dst, dry_run)
            copies += 1
    if copies:
        actions.append(f"{copies} fichier(s) copié(s)")

    # Suppression des orphelins (jamais les .gitkeep).
    orphelins = [
        rel for rel in sorted(fichiers_dst - fichiers_src)
        if rel.name != ".gitkeep"
    ]
    for rel in orphelins:
        supprimer(assets_dst / rel, dry_run)
    if orphelins:
        actions.append(
            f"{len(orphelins)} orphelin(s) supprimé(s) : "
            + ", ".join(str(r) for r in orphelins)
        )
        # Retire les dossiers devenus vides.
        if not dry_run:
            for d in sorted(
                (p for p in assets_dst.rglob("*") if p.is_dir()),
                key=lambda p: len(p.parts),
                reverse=True,
            ):
                if not any(d.iterdir()):
                    d.rmdir()


def ecrire_json(donnees, cible, dry_run, actions):
    """Écrit `donnees` (JSON indenté) dans `cible` si le contenu change."""
    texte = json.dumps(donnees, ensure_ascii=False, indent=2) + "\n"
    if cible.is_file() and cible.read_text(encoding="utf-8") == texte:
        return
    if not dry_run:
        cible.parent.mkdir(parents=True, exist_ok=True)
        cible.write_text(texte, encoding="utf-8", newline="\n")
    actions.append(f"{cible.name} mis à jour")


def synchroniser_projet(pid, dossier_portfolio, dry_run):
    """Synchronise UN projet simple. Renvoie (ok, résumé) ; ok=False si JSON invalide."""
    source = dossier_portfolio / PROJETS[pid] / "site-content"
    if not source.is_dir():
        return True, "site-content absent — ignoré"

    actions = []  # descriptions des changements effectués

    # 1) contenu.json -> data/projets/<id>.json (validé avant copie).
    contenu = source / "contenu.json"
    if contenu.is_file():
        try:
            json.loads(contenu.read_text(encoding="utf-8"))
        except json.JSONDecodeError as err:
            return False, f"contenu.json INVALIDE ({err}) — projet sauté"
        cible = RACINE_SITE / "data" / "projets" / f"{pid}.json"
        if not cible.is_file() or not filecmp.cmp(contenu, cible, shallow=False):
            copier(contenu, cible, dry_run)
            actions.append("contenu.json mis à jour")

    # 2) Miroir assets : site-content/assets/** -> assets/<id>/**.
    miroir_assets(source / "assets", RACINE_SITE / "assets" / pid, dry_run, actions)

    return True, " ; ".join(actions) if actions else "à jour"


def dossier_pilier(hub, racine, dossier_portfolio, pilier):
    """Dossier source d'un pilier : déclaré dans `chemins`, sinon sous la racine."""
    relatif = hub.get("chemins", {}).get(pilier)
    return (dossier_portfolio / relatif) if relatif else (racine / pilier)


def assembler_hub(pid, dossier_portfolio, dry_run):
    """Assemble UN projet hub (squelette + piliers inclus). Renvoie (ok, résumé)."""
    hub = HUBS[pid]
    racine = next(
        (dossier_portfolio / c for c in hub["dossiers"]
         if (dossier_portfolio / c / "site-content" / "contenu.json").is_file()),
        None,
    )
    if racine is None:
        return True, "site-content absent — ignoré"

    def lire(chemin):
        return json.loads(chemin.read_text(encoding="utf-8"))

    actions = []
    try:
        squelette = lire(racine / "site-content" / "contenu.json")
    except json.JSONDecodeError as err:
        return False, f"squelette INVALIDE ({err}) — projet sauté"

    # Injection des piliers : les sections d'un pilier deviennent des
    # sous-sections (parent = la section du squelette qui porte "inclure").
    sections = []
    masquees = 0
    for section in squelette.get("sections", []):
        pilier = section.pop("inclure", None)
        sections.append(section)
        if not pilier:
            continue
        source = dossier_pilier(hub, racine, dossier_portfolio, pilier) / "site-content" / "contenu.json"
        try:
            contenu_pilier = lire(source)
        except FileNotFoundError:
            return False, f"pilier {pilier}/site-content/contenu.json ABSENT — projet sauté"
        except json.JSONDecodeError as err:
            return False, f"pilier {pilier} INVALIDE ({err}) — projet sauté"
        enfants = 0
        for sous in contenu_pilier.get("sections", []):
            if sous.get("masque"):
                # Écartée du site : la source reste, la page disparaît.
                masquees += 1
                continue
            if sous.get("id") == section["id"]:
                # Pilier « page unique » (ex. historique) : la section homonyme
                # COMPLÈTE la section du squelette (dont les champs priment)
                # au lieu de s'y accrocher — sinon doublon d'id.
                for cle, valeur in sous.items():
                    section.setdefault(cle, valeur)
                continue
            # Les sections déjà imbriquées côté pilier (ex. les parties de la
            # formation) gardent leur parent ; les autres s'accrochent au pilier.
            sous.setdefault("parent", section["id"])
            sections.append(sous)
            enfants += 1
        # Sans sous-section injectée, la section n'est pas un sous-hub : sa
        # page (texte + items fusionnés) se rend directement.
        if not enfants:
            section.pop("sousHub", None)

    # Garde-fou : les ids de section doivent rester uniques dans le hub fusionné.
    ids = [s.get("id") for s in sections]
    doublons = {i for i in ids if i and ids.count(i) > 1}
    if doublons:
        return False, f"ids de section EN DOUBLE ({', '.join(sorted(doublons))}) — projet sauté"

    if masquees:
        actions.append(f"{masquees} section(s) masquée(s)")

    # Les autres clés du squelette (ex. "sources") passent telles quelles.
    ecrire_json({**squelette, "sections": sections},
                RACINE_SITE / "data" / "projets" / f"{pid}.json", dry_run, actions)

    # Miroir des assets de chaque pilier vers son dossier historique du site.
    for pilier, dossier_assets in hub["assets"].items():
        miroir_assets(dossier_pilier(hub, racine, dossier_portfolio, pilier) / "site-content" / "assets",
                      RACINE_SITE / "assets" / dossier_assets, dry_run, actions)

    return True, " ; ".join(actions) if actions else "à jour"


def main():
    parser = argparse.ArgumentParser(
        description="Synchronise Portfolio/<Projet>/site-content vers le site."
    )
    parser.add_argument("projets", nargs="*", choices=[[], *PROJETS, *HUBS],
                        help="ids à synchroniser (défaut : tous)")
    parser.add_argument("--dry-run", action="store_true",
                        help="n'écrit rien, montre ce qui serait fait")
    parser.add_argument("--portfolio", type=Path,
                        default=RACINE_SITE.parent / "Portfolio",
                        help="chemin du dossier Portfolio")
    args = parser.parse_args()

    if not args.portfolio.is_dir():
        sys.exit(f"Dossier Portfolio introuvable : {args.portfolio}")

    ids = args.projets or [*PROJETS, *HUBS]
    prefixe = "[dry-run] " if args.dry_run else ""
    erreurs = 0
    for pid in ids:
        synchro = assembler_hub if pid in HUBS else synchroniser_projet
        ok, resume = synchro(pid, args.portfolio, args.dry_run)
        print(f"{prefixe}{pid:<12} {resume}")
        if not ok:
            erreurs += 1

    if erreurs:
        sys.exit(1)


if __name__ == "__main__":
    main()
