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

- [x] 4.1 `{ supplied: flag | number | element | elements }` in `says` terms,
  `{ supplied: elements }` in marks (schema, `parseSays`, the compiler's
  placeholder and `<Id>Supplied`, `SuppliedById` in a game's module); a
  wording's `when` that reads one is refused (it is chosen before the game
  supplies it), and arms must supply alike. `{ supplied: several }` is the
  engine's: `STATED` lists it by kind and `describedEdgeHint` sets it to
  whether the firing decides more than one element (several legs, or one leg
  ringing several), which replaced its `"multi" in says.terms`.
  `compile.test.ts` "a supplied term".
- [x] 4.2 The eight games declare them (2026-11-16: `git grep -c "{ supplied:"
  -- 'src/games/*.yaml'`). `describedEdgeHint`'s `supplied` is one hook a
  technique (`SuppliedHooks<SuppliedById, Marked, State>`): leaving out a
  technique or a term is a type error, seen to fail (Dominosa's `setDoubles`,
  which shares its block by a YAML anchor). Boats' `TrialSupplied` is now
  `SuppliedById["lastWater"]`; Mathrax types its two by `SuppliedById`.
  Supplying a term in full meant a `none` base for Path's clash terms and
  Pearl's shut sides, where the placeholder stood in before. Tracks re-read
  four formulas as pieces: each is stated under its own name (`sides`,
  `rails`) and the sentence's term (`shut`, `unable`, `crossing`) supplied.
  Pearl's black run-on assertion moved from its terms to `stepOf`, so it still
  covers every technique. Word dumps (`DUMP_DEALS=8`, a scratchpad worktree of
  HEAD `f60a9b16a`) byte-identical for all eight: Boats 36940 lines, Dominosa
  39648, Mathrax 153092, Palisade 26324, Path 79988, Pearl 6556, Spokes 27060,
  Tracks 34267.

## 5. The hooks

- [x] 5.1 `describedEdgeHint`'s and `describedFiringHint`'s `termAt`,
  `termKinds`, `terms`, `later`, `outline` and `elements` read against the
  call: each removed, or its doc says which games need it and why. Users,
  2026-11-16: `termAt` Path, Tracks; `termKinds` Mosaic, Path, Pearl, Range,
  Tracks; `terms` Dominosa, Path, Pearl, Spokes, Tracks; `later` Palisade,
  Separate; `outline` Spokes (and Boats, Light Up, Singles on the firing
  walk); `elements` Pearl, Spokes, Tracks. `terms` and `outline` are the
  hooks that fill `# supplied` placeholders, so they go with 4.
  Done: `terms` and `outline` removed for `supplied` (Spokes' Checks declare
  their outline supplied; its other techniques' own outlines were what the
  hook gave them, and the dump is unchanged). `describedFiringHint` has no
  `outline` hook: the note above misread Boats', Light Up's and Singles'
  `highlights`, which read the outline. Stay, with their docs saying why:
  `later` (the move says "a wall" or "walls" by the leg's ring count, which no
  slot says without marking the words), `elements` (how a game draws its
  elements), `termKinds` and `termAt` (by name, since Tracks draws two terms
  of one sort as different kinds).

## 6. Acceptance

- [x] 6.1 Word dumps before and after for the four games; every changed
  sentence listed here. None changed: 1 to 3 were byte-identical (1.4, 2.2,
  3.2); 4 and 5 reach Magnets only through `describedEdgeHint`, whose dump is
  identical (26320 lines), as are Separate's (8708) and Bridges' (24755), the
  edge games without supplied terms, and the eight supplying games' (4.2).
- [x] 6.2 Each of the four read in the running app. After 1 to 3
  (2026-11-16, Chrome, the default preset, Hint walked to the finish): Magnets
  25 sentences (pole, line, `wouldBreak` and the magnet's reason met), Towers
  21, Undead 17, Salad 40; each reads right and its marks sit on what the
  words name (screenshots of Magnets' and Towers' first steps). 4 changed no
  word. Read again after 4 where its hooks moved (2026-11-16, Chrome): Spokes
  4x4 Easy walked to the finish (`rest` on later legs) and four 5x7 Normal
  boards (eight Checks, the supplied outline on the hubs a trial strands or
  starves); Tracks 8x8 Easy (the supplied `shut` sides outlined on the square,
  its open side ringed).
- [x] 6.3 Hand-written lines (`speak.ts`) after 1 to 3: Towers 107, Undead
  120, Salad 229, Magnets 469 (and Magnets' description 32 shorter).
- [x] 6.4 `docs/descriptions.md` § "A firing's reason is built from its
  binding" says the call (done), the unit term, phrases and supplied
  declarations.
