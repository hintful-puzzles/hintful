# Tasks — propose-puzzle-categories

## 0. Decide (owner, 2026-09-19)

- [x] 0.1 One taxonomy or several independent axes? One family per game.
- [x] 0.2 Which axes, and their values: the nine families in `proposal.md`.
- [x] 0.3 Which parts are derived rather than declared: no derived axis for now.
      Where code can vouch for a family, the tag is held to it (design D2).
- [x] 0.4 Where it surfaces: filter chips on the home screen, and "more like
      this" in the quick-switch on the puzzle screen (design D4).

## 1. Data

- [x] 1.1 `PuzzleData.family` (required, typed by `puzzleFamilies`),
      documented as a declaration a mechanism consumes; `familyLabel` and
      `puzzlesInFamily` in `catalog.ts`.
- [x] 1.2 Classify all 57 games (a script inserted the lines; every changed
      line in the diff was a `family:` line).
- [x] 1.3 `catalog-families.test.ts`: every game in exactly one family, no
      family under two, distinct labels, vacuity counts. Seen red by planting
      ABCD in Latin squares and Keen out of it.
- [x] 1.4 Hold Latin squares to the code: the users of `engine/latin-hint` form
      the lower bound and the users of the shared Latin engine the upper.

## 2. Surface

- [x] 2.1 Fold the family label into `catalog-search.ts`.
- [x] 2.2 Home-screen family chips; the quick-switch opens on the current
      game's family. Fixed `current` being an `@state` that ignored the
      attribute, which had hidden the "Playing" mark. Tests set it as an
      attribute, and they were seen red with `@state` put back.
- [x] 2.3 Checked in the running app at 390px and 1440px, in light and dark.

## 3. Docs

- [x] 3.1 `docs/games/README.md` registration step, `AGENTS.md` § "Special
      files", `scripts/new-game-port.sh`.
- [x] 3.2 Point `sequence-hints-in-cell-games` at `puzzlesInFamily("latin")`
      as its corpus.

## 4. Close

- [x] 4.1 `openspec validate propose-puzzle-categories --strict`.
- [x] 4.2 Owner decisions taken before implementation: the family names, the
      one-family shape and both surfaces. The rendered result was checked in
      the running app (2.3). Any adjustment the owner wants after seeing it
      goes on top as a follow-up.
