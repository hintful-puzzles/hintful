# give-map-mark-all-and-the-reading

**Status: scaffolded, not started.** Owner-requested, 2026-09-25.

## Why

`examine-implicit-candidates` gave every candidate game on the shared walk a
player preference, "Hints pencil in" (`hint-notes`): only as needed, or every
candidate first. Map was left out on the grounds that it "has no Mark-all move
for a populate step to follow". The owner pointed out that this is circular: it
says only that nobody has built one. Nothing about Map prevents either:

- **A Mark-all press.** Map's move is already a list of ops (`MapOp`: `color` or
  `pencil` toggles), so a fill is just a longer list and needs no new move shape
  or save format. Map has no `canMarkAll` today and nothing bound to `M`
  (checked 2026-09-25).
- **The choice.** Map's own plan (`map/hint.ts`) reads a region's colors as its
  dots when it has any, otherwise all four less its neighbors' colors: that is
  the implicit reading. Under the populate reading it would open with the
  fill and the clean, after which every uncolored region is dotted and the
  existing plan runs unchanged.

What should differ is only the default, which stays implicit (a Map Easy board
needs no dots at all).

## What changes

- An adaptive Mark-all for Map, like every other note game's (the additive rule
  in `candidate-hint.ts`'s `adaptiveMarkAll`): the first press dots all four
  colors into each uncolored, dot-less region; a later press crosses out the
  colors a neighbor already shows; a press with nothing to do is no move.
  `canMarkAll: true`, `M` on the keyboard, the bottom-bar button.
- `candidateReading` in `MapUi` (default `implicit`, with the reason) and
  `candidateReadingPref` in Map's prefs.
- Map's plan honors the reading: under `populate`, a fill step and a clean step
  (one journey), then the plan as now.
- Help: Map's page mentions the press; `help/features.md`'s list of which games
  start on which reading gains Map.

## Watch for

- `candidate-reading.test.ts` enrolls Map the moment `MapUi` carries the field.
  Its "each reading's setup move never appears in the other's plan" check reads a
  move's `type` or `kind`; Map's moves carry neither, so for Map it would pass
  over nothing. Ask the question some other way (a move whose ops are all
  pencil adds across many regions is a fill), and prove the check fails for Map.
  Its premise check reads `state.grid` / `state.pencil` by cell index, which Map
  (regions, `coloring`) does not have: Map needs its own answer, derived from the
  step's `targets`/`evidence` regions, not a manifest row.
- `mark-all.test.ts` enrolls Map by `canMarkAll` and reads `state.pencil`; check
  its slot assumptions hold for a region-indexed array.
- The hint's clean step must name neighbor colors the way Map's sentences name
  colors (`FOUR_NAMES`), and pass `hint-text-convention` and the narration ledger.
- Run the app: the press twice, then a hint under each reading, in both color
  schemes.
