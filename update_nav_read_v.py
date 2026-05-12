#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import shutil
from pathlib import Path


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return path.read_text(encoding="latin-1")


def write_text(path: Path, content: str) -> None:
    path.write_text(content, encoding="utf-8", newline="")


def backup_file(path: Path) -> None:
    bak = path.with_suffix(path.suffix + ".bak")
    shutil.copy2(path, bak)


def update_nav_read_version(html: str, version: str) -> tuple[str, int]:
    """
    Updates nav-read.js in <script ... src="...nav-read.js[?v=...]" ...> to use ?v=<version>.

    - If ?v= is missing, it is added.
    - If ?v= exists, its value is replaced.
    - Preserves original quoting style and leaves other script tags alone.
    """

    # Capture the src attribute value that ends with nav-read.js, optionally followed by ?v=something
    # Examples matched:
    #   src="../../assets/js/nav-read.js"
    #   src='../../assets/js/nav-read.js?v=123'
    #   src="../../assets/js/nav-read.js?v=250108"
    pattern = re.compile(
        r"""
        (?P<prefix>\bsrc\s*=\s*)(?P<q>["'])
        (?P<path>[^"']*?/nav-read\.js)
        (?P<query>\?v=[^"']*)?
        (?P=q)
        """,
        re.IGNORECASE | re.VERBOSE,
    )

    def repl(m: re.Match) -> str:
        return f"{m.group('prefix')}{m.group('q')}{m.group('path')}?v={version}{m.group('q')}"

    updated, n = pattern.subn(repl, html)
    return updated, n


def main() -> int:
    ap = argparse.ArgumentParser(
        description="Add/update ?v=... for nav-read.js in rmlives/fr/reading HTML files."
    )
    ap.add_argument("--root", default="rmlives/fr/reading", help="Root folder (default: rmlives/fr/reading)")
    ap.add_argument("--version", required=True, help="Version string, e.g. 250108")
    ap.add_argument("--dry-run", action="store_true", help="Preview changes without writing.")
    ap.add_argument("--no-backup", action="store_true", help="Do not create .bak backups.")
    ap.add_argument("--include-subdirs", action="store_true", help="Scan subfolders (recommended).")
    args = ap.parse_args()

    root = Path(args.root)
    if not root.exists():
        print(f"ERROR: root not found: {root.resolve()}")
        return 2

    files = sorted(root.rglob("*.html") if args.include_subdirs else root.glob("*.html"))

    changed_files = 0
    total_replacements = 0

    for f in files:
        original = read_text(f)
        updated, n = update_nav_read_version(original, args.version)

        if n == 0:
            continue

        changed_files += 1
        total_replacements += n

        suffix = " (dry-run)" if args.dry_run else ""
        print(f"{f}: updated {n} src occurrence(s){suffix}")

        if not args.dry_run:
            if not args.no_backup:
                backup_file(f)
            write_text(f, updated)

    print(f"\nDone. Files scanned: {len(files)}")
    print(f"Files changed: {changed_files}")
    print(f"Total src updates: {total_replacements}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
