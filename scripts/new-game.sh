#!/bin/bash
# Start a new game from the skeleton: copy src/skeleton/<kind>/ to
# src/games/<gameId>/, renamed for the game, register it, and check that the
# copy compiles, lints and passes its tests.
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
# `kind` names the skeleton, a directory of src/skeleton/ whose table says
# what each is for: `grid` (the default) or `edges`. The checklist differs
# where the skeletons do, which the `case` below says.

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

if [ ! -d "${SRC}" ]; then
  echo "no skeleton of kind '${KIND}' (looked in ${SRC})" >&2
  exit 2
fi

# What the checklist says of this kind's copy.
case "${KIND}" in
  grid)
    HAS="params and their codec, presets,
the desc, target-verb input, a deduction ladder with two tiers, a solver-gated
generator, the mistake check, an explained hint with its marks and gesture, a
tile-cached renderer, and tests for each."
    PUZZLE="The rules and the hint's sentences live in
     ${GAME}.description.yaml, the board in state.ts. Rename what the copy calls a \"mark\", a
     \"clue\" and its two rungs to this puzzle's own words as you go."
    ROLES="Each of the three hint roles in hintMarks (ring, outline, stripes)"
    DESCRIPTION="Shading puzzle"
    OBJECTIVE="Shade squares so that every number counts the shaded squares beside it."
    ;;
  edges)
    HAS="params and their codec, presets,
the desc, the engine's line drawing (the drag, a click, the keys and the cross
sweep), a deduction ladder with two tiers (a square's count of edges, and a
bounded look-ahead), a solver-gated generator, the mistake check on set edges,
an explained hint with its edge marks and gesture, a tile-cached renderer, and
tests for each."
    PUZZLE="The rules and the hint's sentences live in
     ${GAME}.description.yaml, what a line may do in moves.ts, the board in
     state.ts. Rename
     what the copy calls a \"wall\" and its two rungs to this puzzle's own
     words as you go. The generator's answer is a loop through every square;
     a puzzle with other answers draws its own."
    ROLES="Each of the two hint roles in hintMarks (ring, outline)"
    DESCRIPTION="Loop puzzle"
    OBJECTIVE="Draw one loop through every square that never crosses a wall."
    ;;
  *)
    echo "scripts/new-game.sh has no checklist for kind '${KIND}'" >&2
    exit 2
    ;;
esac
if [ -e "${DIR}" ]; then
  echo "refusing to overwrite existing ${DIR}" >&2
  exit 1
fi

# The three spellings the skeleton uses for its own name, and the game's.
PASCAL="$(printf '%s' "${GAME}" | awk '{ print toupper(substr($0,1,1)) substr($0,2) }')"
UPPER="$(printf '%s' "${GAME}" | tr '[:lower:]' '[:upper:]')"

# A skeleton's compiled module is generated under src/generated/skeleton/<kind>/,
# and a game's under src/generated/games/<gameId>/, at the same depth.
rename() {
  sed -e "s#generated/skeleton/${KIND}/#generated/games/skeleton/#g" \
    -e "s/SKELETON/${UPPER}/g" -e "s/Skeleton/${PASCAL}/g" -e "s/skeleton/${GAME}/g"
}

# Every file of the skeleton, under its renamed path: its description, which
# holds the help page, among them. Not its snapshots: they are the skeleton's
# output, and the copy's own tests write the copy's below.
(cd "${SRC}" && find . -type f -not -path './__snapshots__/*' | sort) | while IFS= read -r file; do
  target="${DIR}/$(printf '%s' "${file#./}" | rename)"
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
# The import goes before the first one, below the file's header comment.
{
  awk '!done && /^import / { print "import { registerGame } from \"../../engine/registry.ts\";"; done = 1 } { print }' "${INDEX}"
  echo ""
  echo "registerGame(${GAME_OBJECT});"
} > "${INDEX}.new"
mv "${INDEX}.new" "${INDEX}"

cd "${REPO_ROOT}"

# Registered in the collection, so that every cross-game guard reads it from
# the first verdict on (the script's header says why).
node scripts/new-game-register.mjs "${GAME}" "${DESCRIPTION}" "${OBJECTIVE}"

# A longer name reflows lines, and the imports added want their sorted place.
npx biome check --write "src/games/${GAME}" src/games/index.ts src/puzzle/catalog-data.ts > /dev/null

# Its techniques are the skeleton's as written, so the skeleton's soundness
# verdicts are the copy's: each is a fingerprint of the technique, which
# src/describe/compile.test.ts checks against the copy, and refuses once the
# technique it was for is gone.
node -e '
  const fs = require("node:fs");
  const [file, from, to] = process.argv.slice(1);
  const verdicts = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const [key, print] of Object.entries(verdicts))
    if (key.startsWith(from)) verdicts[to + key.slice(from.length)] = print;
  const sorted = Object.fromEntries(Object.entries(verdicts).sort(([a], [b]) => (a < b ? -1 : 1)));
  fs.writeFileSync(file, `${JSON.stringify(sorted, null, 2)}\n`);
' src/describe/soundness.json \
  "src/skeleton/${KIND}/skeleton.description.yaml#" \
  "src/games/${GAME}/${GAME}.description.yaml#"
# The copy's module is compiled from its description.
npm run -s describe > /dev/null

# The copy's verdict, before a line of it is changed.
echo "Checking the copy: typecheck, lint, tests."
npm run -s tsc -- -b --noEmit
npx biome check "src/games/${GAME}"
npx vitest run "src/games/${GAME}"

cat <<EOF

src/games/${GAME}/ is a copy of the '${KIND}' skeleton that plays as the
skeleton's own puzzle, and ${GAME}.description.yaml there holds its help page.

What the copy has, each on the shared way: ${HAS}

The game is registered: ${GAME_OBJECT} in src/games/index.ts, and its entry
in src/puzzle/catalog-data.ts, whose words are the skeleton's puzzle's.

What is left to do, and the copy does none of it:
  1. Run the game's whole verdict now, and after every concern you change:
       npm run game -- ${GAME}
     It names every guard that refuses the game, with the guide section the
     guard cites, all on its first run. Records kept by hand refuse a new
     game at once:
       - the snapshots of capability-surface.test.ts and
         params-stability.test.ts (run each with -u and read the diff)
       - its icons and its spec, steps 5 and 6 below
  2. Replace the puzzle. ${PUZZLE}
     The catalog entry is the puzzle's too: its name, description,
     objective, aliases, family, and the puzzles it is similar to, which
     the All-the-puzzles help page lists.
     ${ROLES} is
     drawn by the copy; one the puzzle's hint never names goes, with its
     line in the legend (warm-repaint.test.ts holds the two together).
     A help page that says where the puzzle comes from says it in its
     description's help.origins (help-coverage.test.ts).
  3. Pin the hint again once the rungs are this puzzle's:
       npm run hint-scan -- src/games/${GAME}/${GAME}-hint.test.ts --all
     A rung with no pin fails the hint test, naming that command, and the
     typecheck stays green meanwhile. The copy's snapshots are its own:
     where a change moves one, read the diff and write it again with -u.
  4. Write the help page's rules and its Hints section in the game's words.
  5. Add the two icons, src/assets/icons/${GAME}-{64,128}d8.png, captured
     from the running game (openspec/specs/puzzle-icons/spec.md).
  6. Write the game's spec in the openspec change that adds it
     (docs/new-game.md § "What a game's spec holds").
  7. Run the app and play it before calling anything done.
EOF
