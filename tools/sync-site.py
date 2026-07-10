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

Après une synchro : git add -A && git commit && git push (voir DEPLOIEMENT.md).
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

# id du site (data/projets/<id>.json, assets/<id>/) -> dossier dans Portfolio.
PROJETS = {
    "649": "Lotto 649",
    "python": "Formation - Python",
    "crypto": "Crypto",
    "backtesting": "Backtesting",
    "ibkr": "IBKR",
    "quantower": "Quantower",
    "detection": "Détection d'objets",
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


def synchroniser_projet(pid, dossier_portfolio, dry_run):
    """Synchronise UN projet. Renvoie (ok, résumé) ; ok=False si JSON invalide."""
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
    assets_src = source / "assets"
    assets_dst = RACINE_SITE / "assets" / pid
    if assets_src.is_dir():
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

    return True, " ; ".join(actions) if actions else "à jour"


def main():
    parser = argparse.ArgumentParser(
        description="Synchronise Portfolio/<Projet>/site-content vers le site."
    )
    parser.add_argument("projets", nargs="*", choices=[[], *PROJETS],
                        help="ids à synchroniser (défaut : tous)")
    parser.add_argument("--dry-run", action="store_true",
                        help="n'écrit rien, montre ce qui serait fait")
    parser.add_argument("--portfolio", type=Path,
                        default=RACINE_SITE.parent / "Portfolio",
                        help="chemin du dossier Portfolio")
    args = parser.parse_args()

    if not args.portfolio.is_dir():
        sys.exit(f"Dossier Portfolio introuvable : {args.portfolio}")

    ids = args.projets or list(PROJETS)
    prefixe = "[dry-run] " if args.dry_run else ""
    erreurs = 0
    for pid in ids:
        ok, resume = synchroniser_projet(pid, args.portfolio, args.dry_run)
        print(f"{prefixe}{pid:<12} {resume}")
        if not ok:
            erreurs += 1

    if erreurs:
        sys.exit(1)


if __name__ == "__main__":
    main()
