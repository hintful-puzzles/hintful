# Tasks

Baseline: HEAD `2a50688fb`, word dumps (`DUMP_DEALS=8`) of Towers, Undead,
Salad and Magnets; Slide's and Loopy's from a worktree of that HEAD (Loopy at
`DUMP_DEALS=2`, its eight-deal dump runs past the time limit). Hand-written
lines at the start (the four `speak.ts`): Towers 161, Undead 173, Salad 336,
Magnets 517.

## 1. The call

- [x] 1.1 `engine/step-voice.ts`: `stepVoice` (`sentence`, `premise`, `part`);
  a sort a game does not name is drawn on `kind`; the ring by the step's
  `ring` sort. `stepsBlock` emits `voice`.
- [x] 1.2 Towers, Undead, Salad and Magnets speak through their module's
  `voice`; no cast and no context builder in a game. (The adapters' casts
  were never needed: `MarkKind.key` is a method, so `MarkKind<Point>` is a
  `MarkKind<Point | number>`.)
- [x] 1.3 Loopy, Slide and `narrateLatinReason` too; `plannedSentence`,
  `PlannedKind` and `PlannedSaid` removed.
- [x] 1.4 Word dumps byte-identical: Towers (60200 lines), Undead (21928),
  Salad (122304), Magnets (26320), Slide (15820) and Loopy (6185146, at
  `DUMP_DEALS=2`, against a worktree of HEAD; 15 minutes a run).
  `research/hint-walk-dump` writes a line at a time now: Loopy's dump was
  past the longest string a runtime holds (`RangeError: Invalid string
  length`), at HEAD too, and it reports each board as it goes.

## 2. A unit term

- [x] 2.1 Term kind `unit` in `steps` (schema, `stepsOf`, the checker, the
  type `Unit`, the renderer); `compile.test.ts` "a unit term". A slot that
  says a term as a number (`numeral`, `spelled`, `a`, `color`, `or`, a count)
  is now known to the checker (`Slot.numbers`), which refuses a unit term
  there; it let `{numeral side}` through before, seen to fail.
- [x] 2.2 Towers', Salad's and Magnets' `{if col: column | row}` are unit
  terms (`axis`, and Magnets' `across`); `lineUnit` (`step-voice.ts`) says a
  Latin reason's `"row" | "col"`, the engine's hidden single included. Dumps
  byte-identical.

## 3. Phrases

- [x] 3.1 `phrases:` in the schema; `load.ts` puts each in place before
  anything reads a clause; `load.test.ts` "a phrase".
- [x] 3.2 Magnets' poles, its line, a magnet's reason, the count a line
  needs and the ruled-out passage (`wouldBreak`, written three times before);
  Salad's empty-square count. Dumps byte-identical.

## 4. Supplied terms

- [ ] 4.1 `{ supplied: … }` in `says` terms and marks; `SuppliedById` in the
  module.
- [ ] 4.2 The eight games' `# supplied` placeholders become declarations, and
  their supplying hooks are typed by it.

## 5. The hooks

- [ ] 5.1 `describedEdgeHint`'s and `describedFiringHint`'s `termAt`,
  `termKinds`, `terms`, `later`, `outline` and `elements` read against the
  call: each removed, or its doc says which games need it and why. Users,
  2026-11-16: `termAt` Path, Tracks; `termKinds` Mosaic, Path, Pearl, Range,
  Tracks; `terms` Dominosa, Path, Pearl, Spokes, Tracks; `later` Palisade,
  Separate; `outline` Spokes (and Boats, Light Up, Singles on the firing
  walk); `elements` Pearl, Spokes, Tracks. `terms` and `outline` are the
  hooks that fill `# supplied` placeholders, so they go with 4.

## 6. Acceptance

- [ ] 6.1 Word dumps before and after for the four games; every changed
  sentence listed here. None has changed so far.
- [ ] 6.2 Each of the four read in the running app. After 1 to 3
  (2026-11-16, Chrome, the default preset, Hint walked to the finish): Magnets
  25 sentences (pole, line, `wouldBreak` and the magnet's reason met), Towers
  21, Undead 17, Salad 40; each reads right and its marks sit on what the
  words name (screenshots of Magnets' and Towers' first steps). To read again
  once 4 changes any word.
- [x] 6.3 Hand-written lines (`speak.ts`) after 1 to 3: Towers 107, Undead
  120, Salad 229, Magnets 469 (and Magnets' description 32 shorter).
- [ ] 6.4 `docs/descriptions.md` § "A firing's reason is built from its
  binding" says the call (done), the unit term, phrases and supplied
  declarations.
