#!/bin/bash
# Start a new game from the skeleton: copy src/skeleton/<kind>/ to
# src/games/<gameId>/, renamed for the game, and check that the copy compiles,
# lints and passes its tests.
#
# Usage:
#   scripts/new-game.sh <gameId> [kind]
#
# The skeleton is a small game that plays, kept as source the gate's typecheck
# reads (src/skeleton/README.md says what it is and is not). What this copies
# is therefore a working game whose puzzle is the wrong one: the work is to
# replace the puzzle, and the checklist printed at the end is what the copy
# leaves undone.
#
# `kind` names the skeleton: `grid` (the default, and the only one so far) is
# a square grid of cells the player marks, solved by deduction.

set -euo pipefail

GAME="${1:-}"
KIND="${2:-grid}"
if [ -z "${GAME}" ]; then
  echo "usage: scripts/new-game.sh <gameId> [kind]" >&2
  exit 2
fi
if ! printf '%s' "${GAME}" | grep -Eq '^[a-z][a-z0-9]*$'; then
  echo "gameId must be lowercase letters/digits (e.g. 'singles'); got '${GAME}'" >&2
  exit 2
fi
if printf '%s' "${GAME}" | grep -q 'skeleton'; then
  echo "gameId must not contain 'skeleton': the copy is renamed by that word" >&2
  exit 2
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SRC="${REPO_ROOT}/src/skeleton/${KIND}"
DIR="${REPO_ROOT}/src/games/${GAME}"
HELP="${REPO_ROOT}/help/games/${GAME}.md"

if [ ! -d "${SRC}" ]; then
  echo "no skeleton of kind '${KIND}' (looked in ${SRC})" >&2
  exit 2
fi
for existing in "${DIR}" "${HELP}"; do
  if [ -e "${existing}" ]; then
    echo "refusing to overwrite existing ${existing}" >&2
    exit 1
  fi
done

# The three spellings the skeleton uses for its own name, and the game's.
PASCAL="$(printf '%s' "${GAME}" | awk '{ print toupper(substr($0,1,1)) substr($0,2) }')"
UPPER="$(printf '%s' "${GAME}" | tr '[:lower:]' '[:upper:]')"

rename() {
  sed -e "s/SKELETON/${UPPER}/g" -e "s/Skeleton/${PASCAL}/g" -e "s/skeleton/${GAME}/g"
}

# Every file of the skeleton, under its renamed path. The help page goes to
# help/games/, where the build reads it.
(cd "${SRC}" && find . -type f | sort) | while IFS= read -r file; do
  if [ "${file}" = "./help.md" ]; then
    target="${HELP}"
  else
    target="${DIR}/$(printf '%s' "${file#./}" | rename)"
  fi
  mkdir -p "$(dirname "${target}")"
  rename < "${SRC}/${file}" > "${target}"
done

# The skeleton is not a game of the collection, so it does not register
# itself; the copy is one, and does.
INDEX="${DIR}/index.ts"
GAME_OBJECT="${GAME}Game"
if ! grep -q "^export const ${GAME_OBJECT}:" "${INDEX}"; then
  echo "the skeleton's index.ts no longer exports its game as <id>Game" >&2
  exit 1
fi
{
  echo 'import { registerGame } from "../../engine/registry.ts";'
  cat "${INDEX}"
  echo ""
  echo "registerGame(${GAME_OBJECT});"
} > "${INDEX}.new"
mv "${INDEX}.new" "${INDEX}"

cd "${REPO_ROOT}"

# A longer name reflows lines, and the import above wants its sorted place.
npx biome check --write "src/games/${GAME}" > /dev/null

# The copy's verdict, before a line of it is changed.
echo "Checking the copy: typecheck, lint, tests."
npm run -s tsc -- -b --noEmit
npx biome check "src/games/${GAME}"
npx vitest run "src/games/${GAME}"

cat <<EOF

src/games/${GAME}/ is a copy of the '${KIND}' skeleton that plays as the
skeleton's own puzzle, and help/games/${GAME}.md is its help page.

What the copy has, each on the shared way: params and their codec, presets,
the desc, target-verb input, a deduction ladder with two tiers, a solver-gated
generator, the mistake check, an explained hint with its marks and gesture, a
tile-cached renderer, and tests for each.

What is left to do, and the copy does none of it:
  1. Replace the puzzle. The rules live in solver.ts, the board in state.ts,
     the sentences in hint-text.ts. Rename what the copy calls a "mark", a
     "clue" and its two rungs to this puzzle's own words as you go.
  2. Register the game, two edits made together (catalog-registry.test.ts
     holds them to each other):
       - import ${GAME_OBJECT} in src/games/index.ts and register it there
       - add its entry to src/puzzle/catalog-data.ts, with its family
     Until then no cross-game guard reads the game. Once it is registered,
     run the game's whole verdict, here and after every concern you change:
       npm run game -- ${GAME}
     It names every guard that refuses the game, with the guide section the
     guard cites. Two records kept by hand refuse a game on its first run:
       - help/puzzles.md: its row (help-coverage.test.ts)
       - the snapshots of capability-surface.test.ts and
         params-stability.test.ts (run each with --update and read the diff)
     and two things the copy has no reason to hold yet refuse it later:
       - a hint sentence that stripes a row or region needs "stripes" among
         the roles of hintMarks in index.ts (hint-quality.test.ts)
       - a help page that says where the puzzle comes from says it under
         "## Where the puzzle comes from" (help-coverage.test.ts)
  3. Pin the hint again once the rungs are this puzzle's:
       npm run hint-scan -- src/games/${GAME}/${GAME}-hint.test.ts --all
     and update the snapshots the copy brought with it:
       npx vitest run src/games/${GAME}/${GAME}.test.ts --update
  4. Write the help page's rules and its Hints section in the game's words.
  5. Add the two icons, src/assets/icons/${GAME}-{64,128}d8.png, captured
     from the running game (openspec/specs/puzzle-icons/spec.md).
  6. Write the game's spec in the openspec change that adds it
     (docs/new-game.md § "What a game's spec holds").
  7. Run the app and play it before calling anything done.
EOF
