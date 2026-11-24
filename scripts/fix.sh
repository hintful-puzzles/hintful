#!/usr/bin/env sh
# `npm run fix`: write the fixes the gate's refusals have one right answer
# for, into every file the working tree changed (staged or not, untracked
# included: what the next commit is made of), and name each file written.
#
# A refusal belongs here when a tool can mend it with no judgment: biome's
# formatting, import order and safe lint fixes, and the order of a game
# spec's subjects. The gate itself never writes, and its refusal names this
# command; `npm run fast-checks` runs it first.
set -e

changed=$(git diff --name-only --no-renames HEAD; git ls-files --others --exclude-standard)

# `fix <files> <command>...`: run a fixer and name each of the files it changed.
sums() { for f in "$@"; do [ -f "$f" ] && cksum "$f"; done; }
fix() {
  fix_files=$1
  shift
  # shellcheck disable=SC2086 # newline-separated paths, no globs.
  fix_before=$(sums $fix_files)
  "$@" >/dev/null 2>&1 || true
  # shellcheck disable=SC2086
  sums $fix_files | grep -vxF -e "$fix_before" | sed "s|^[0-9]* [0-9]* |✎ fixed by $2: |" || true
}

files=$(printf '%s\n' "$changed" | while read -r f; do [ -f "$f" ] && echo "$f"; done || true)
if [ -n "$files" ]; then
  # shellcheck disable=SC2086 # newline-separated paths, no globs.
  fix "$files" npx biome check --write --no-errors-on-unmatched \
    --files-ignore-unknown=true $files
fi
# `--fix` moves whole requirements and changes no word.
fix "$(ls openspec/specs/*/spec.md openspec/changes/*/specs/*/spec.md 2>/dev/null)" \
  node scripts/checks/spec-subjects.mjs --fix
