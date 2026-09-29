# Tasks

## 1. Re-derive the population and the blocker

- [x] 1.1 Read every `drawn`: 28 of 37 are straight reads, 9 restate a renderer
  rule (design D1).
- [x] 1.2 Try the recorded frame as the check: role by color and element by
  footprint are not recoverable without two new declarations per game (D1).

## 2. The engine

- [x] 2.1 `stepMarks(step)` in `hint-words.ts`: the words' marks by role and kind.
- [x] 2.2 `testing/hint-binding.ts` checks by ablation on the rendered frame
  (D2), run by the hint-quality walk with each step over the state it is
  narrated for.
- [x] 2.3 Prove it fails: Signpost with its outlines painted from highlights
  fails both rules (a named outline not drawn, a frame without references that
  is not the unhinted one).
- [x] 2.4 `OverlaySidecar.pack` reads the words, and a ringed note rings its cell
  (`NOTE.within`); `hintTileBits` reads the words; `BorderHint` keeps only the
  edge keep-track compares against.
- [x] 2.5 Delete `HintMarkLegend.drawn`, `candidateHintMarks`, `borderHintMarks`.

## 3. The games

- [x] 3.1 The twelve overlay games, Palisade, Separate and Signpost, with every
  render snapshot unchanged.
- [x] 3.2 The remaining thirty games, each passing the walk with its render
  snapshots unchanged. Untangle's `CROSSING` kind was keyed by position, so
  two crossings on one spot merged in `stepMarks`; it is keyed by its pair of
  lines. `hatch-contrast.test.ts` finds its population from the words'
  stripes, not from highlight fields, which surfaced Subsets' spotlight glyph
  (ledgered).
- [x] 3.3 The walk drops an element's contained elements with it (`within`),
  since a ringed note rings its cell.

## 4. Documentation

- [x] 4.1 `docs/games/hints.md` § "Bind the words to the marks",
  `engine-catalog.md`, `rendering.md`.
- [x] 4.2 The ts-engine delta.

## 5. Rect's hint

- [x] 5.1 Write Rect's hint against role-drawn marks, and record what a mark
  that straddles tiles needed (design D6: nothing).
- [x] 5.2 Deal only boards the rungs finish; retire the one C fixture that was
  such a board.
- [x] 5.3 Run it in the app: the ring, the outlines and a played-through board.
