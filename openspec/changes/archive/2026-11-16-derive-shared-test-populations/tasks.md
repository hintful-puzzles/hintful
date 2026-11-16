# Tasks

- [x] 1 Re-check each list at HEAD; walk the Norinori commit's shared-test edits
- [x] 2 The region fills own their close-color exemption
- [x] 3 Planted defects declared beside the game
- [x] 4 The palette guard keys on a color sink, still catching a planted literal
- [x] 5 Each remaining list derived, or kept with its reason

## What was done (2026-11-16)

- **Close colors**: `neighbor-contrast.test.ts` exempts an area pair of the
  board's margin and a `REGION_FILLS` token, found by the token's reference
  in the game's palette, so Map, Star Battle and Norinori lost their ledger
  entries and a game that paints a region fill inherits the exemption. It
  is wider than the proposal's "draws with `region-walls.ts`": Map draws its
  own regions and was on the ledger for the same reason. A test fails if the
  exemption stops firing in those three; seen to fail with Norinori painting
  a copy of the fill.
- **Plants**: every technique, library `once` and dead-end plant moved from
  `describe-check.test.ts` and `dead-end-check.test.ts` to a
  `<name>.plants.yaml` beside each description, the two skeletons' included,
  so `new-game.sh` copies them with no change. All 319 technique plants
  mapped to a technique and none was missing (two bare keys, `fullRegion`
  and `exactRegion`, served Star Battle and Norinori, and now each has its
  own). `plants.test.ts` holds each file to its description in the gate; seen
  to fail on a renamed key and an unparsable formula. The checks ran on
  Norinori's `between`, Ascent's `deadEnd` (its plant's line breaks were
  folded to spaces) and Flood's dead ends, each plant caught.
- **Palette guard**: rule 1 asks the type checker for array literals whose
  contextual type is `engine/types.ts`'s `Color`, by symbol, so `NOT_COLORS`
  is gone. It found two computed colors the regex could not: Slide's
  `raise` and Twiddle's `clampColor`, now `slideRaised` and the gentle
  bevels' own clamp in `palette-games.ts`, values unchanged. Seen to catch an
  inline literal, a `: Color` declaration and an `as Color`, and to pass
  `[2, 3, 4]`. Norinori's tier tables stay as they are: keyed by tier
  constant, they read no worse than the arrays they replaced.

## Kept as lists, with the reason

- `LONG_NARRATIONS` (`hint-quality.test.ts`): taken up for described games by
  `check-a-description-when-it-compiles`.
- `hint-resume.test.ts`'s floor: already per game a share walks
  (`SHARE_GAMES`, derived from `HINT_GAMES`), so the next game raises its
  share's floor by its own count.
- `help/puzzles.md`: a row carries prose the catalog does not hold (the
  related names, with their trademark marks), and `help-coverage.test.ts`
  derives the population from the catalog, so a missing row fails.
- `catalog-data.ts` and `games/index.ts` are the declaration itself;
  `divide.test.ts` tested the new `growFromSeeds` argument; the snapshots and
  `soundness.json` are written by their tools.
