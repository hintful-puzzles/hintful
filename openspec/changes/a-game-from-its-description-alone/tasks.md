## 1. Design

- [x] 1.1 Read `archive/2026-11-21-architectural-review-blue-sky/design.md`
      whole, and the prior art it cites (pzprjs's board and checklist,
      cspuz's serializer combinators).
- [x] 1.2 Pick the new game: Kakurasu (design.md § 1).
- [x] 1.3 Design the board, `Edit`, `Ui` and the `fillGame` entry point;
      what each consumes from the description; how a game-ID codec and a
      sampler are declared; the render layers. Write `design.md`.

## 2. The engine

The baseline for 3.3 is `06662e01f`, the parent of this change's first
engine commit.

- [x] 2.1 `engine/fill/`: the board, `Edit` (with a mark's `while`), and
      the hooks that judge a board (`status`, `solve`,
      `findMistakes`/`clearMistakes`/`revealOne`, `textFormat`, `rules`,
      the difficulty verdict), tested on Tents' compiled module against
      Tents' own solver and text format. `FillUi` moved to 2.4, with the
      input that is its only reader.
- [x] 2.2 The compiler (`describe/compile-fill.ts`): a mark's `while:` as
      `markWhile`, which `applyEdit` reads; `deal.sample:` in the schema,
      and where a deal samples, `clueHolds_<kind>` and `deriveClues`, tested
      on Tents' module against its generator's clues. A declaration the
      engine only carries lands with the task whose code reads it, so none
      is compiled unread: `catalog:` and the generated `<id>.game.ts` in
      2.3, `play:` in 2.4, `labels:` in 2.5, `id:` and `tierLetters:` in 2.6.
- [x] 2.3 The generated games in the catalog and the registry. Re-derived
      2026-11-22: every reader already goes through one module,
      `src/puzzle/catalog.ts` (`catalogFrom` in `catalog-data.ts`), and only
      it, `vite-plugins/catalog.ts` and `src/games/index.ts` glob
      `src/games/*/catalog.ts`; so no `src/games/catalog.ts` is needed, and
      those three glob the generated games beside. As built: `fillGame`
      (`engine/fill/game.ts`); the description's `catalog:`, and `play:`'s
      `boards` (the first the default) and `hintMarks` (the legend); the
      compiler writes `<id>.catalog.ts`, which imports only a type so the
      Vite config may read it (and runs the compiler first where it is
      missing), and `<id>.game.ts`, which registers the game
      (`describe/sources.ts`, `bornFiles`).
- [x] 2.4 `FillUi`, `newUi`, and input from `play` (verbs, keys,
      Shift/Ctrl painting, `stroke`, `links`): `engine/fill/play.ts`, tested
      on Tents' compiled `play`. The compiler: `play:`. No `changedState`
      (design.md § 5). The renderer previews a drag by `previewed`, and the
      hint's link gesture is a drag between the two ends of `linkEdit`'s
      mark, in 2.7. Shift/Ctrl painting is Tents' (Shift the open cells,
      Ctrl the primary ones too); Boats' differs (Ctrl places boats), which
      is stage 4's question when Boats moves.
- [x] 2.5 Render by layers: the engine walk, painters in
      `engine/render/pieces/`, margins, labels. The compiler: `labels:`
      (under `play:`) and `lineClues`. Tested on Tents' compiled module
      with a recording; the warm-repaint and render-scenario guards reach
      it once `fillGame` registers a game (2.3).
- [x] 2.6 The deal: `scatter`/`partner` samplers reading `deal.sample`, the
      tier gate, the codec combinators and the params codec. The compiler:
      `id:` and `tierLetters:`, as the module's `deal`, and `clueMax`, each
      kind's largest value from its `range`, which bounds a desc's numbers.
      Tents' `id:` reads and writes upstream's descs byte for byte
      (`engine/fill/deal.test.ts`, against Tents' own parser). For 3.2:
      upstream's Tents generator rejects a board with a line holding
      neither a tent nor a tree, which the sampler does not; whether Tents
      keeps that is a `sample` parameter to add then, or a stated drop.
- [x] 2.7 The hint: `describedFiringHint`'s hooks from the board
      (`engine/fill/hint.ts`), the walk begun at the lowest tier that
      finishes the board as dealt; step words from `says`, its wordings and
      its arms (`STATED`). Tested on Kakurasu's compiled module
      (`engine/fill/hint.test.ts`), so Kakurasu's description and plants
      land here, their techniques checked sound; its help lands with its
      catalog entry in 2.3, since the help guard refuses help for a game
      not in the catalog. The compiler writes `domainOf` for a fill game
      whose domain is the board's. Moved to 3.2, the first game that reads
      them: `MARK` facts as an `Edit`'s marks (the firing hint reads only
      `PLACE` facts, and how a link's ring is said is Tents' words), and a
      line's clue outlined as `LINE` (Kakurasu's steps stripe the line,
      which hatches its clue; the renderer already draws both).

## 3. The games

- [x] 3.1 Kakurasu from its description alone: description, help, spec,
      icons; measure its deal rate first (design.md § "Risks"). Each gap
      is closed in the engine, and listed here as a capability added.
      Its description, plants and spec are in (2.7, 2.3). Capabilities
      added: a board-wide domain read as every cell's (`domainOf`,
      compile-fill); a born game's catalog entry, boards and legend (2.3);
      a move from a save that is not an edit refused as the game's
      (`editOf`); a step's linked rings read only where the game has links.
      The guards that read a game's sources read a born game's under
      `src/generated/` (coord-conversion); its directory's one TypeScript
      file is the test that paints its mistake outline.
      Deal rate measured 2026-11-22, 300 sampled answers a size at share
      one half (0.4 and 0.6 differ little): finished at Easy / at Normal /
      by neither: 5x5 33% / 59% / 8%; 6x6 7% / 70% / 23%; 7x7 0.7% / 43% /
      56%; 8x8 0 / 13% / 87%; 9x9 0 / 3% / 97%; 10x10 0 / 0.3%, a sample
      0.07 ms at 5x5 to 3.4 ms at 10x10. So the menu is 5x5, 5x7 (the
      menu's rectangle, portrait) and 7x7 at both tiers, and a custom side
      4 to 9; a board line reading cannot finish is the room a third tier
      would take, and is not this pilot's. Run in the app 2026-11-22:
      deal, clicks and right-clicks, hints (look, explain, apply, and a
      wrong square asked to be fixed first), both live errors as the help
      words them, dark mode; a cross drew as ground and now draws as the
      engine's cross. Icons captured from `?screenshot`.
- [ ] 3.2 Tents moved: `id:` keeps upstream's grammar (the upstream-descs
      guard proves it); its walk's link reading as engine capabilities;
      `lineCount` split by `says.arms`. The fill hint gains `MARK` facts as
      an `Edit`'s marks, rung as `LINK`, and a line's clue outlined as
      `LINE` (Tents' "its number"). Checked in the app, including links,
      drags, hints and dark mode. List the capabilities added.
      In parts (2026-11-22), each its own commit, the hand-written Tents
      playing on until the last:
  - [x] 3.2.1 The fill hint asks for a mark, and every Tents technique
        states its words (one part: the hint runs on no technique left
        unstated). A firing's `MARK` facts are targets beside its `PLACE`
        facts, followed by slot (a cell's value, or its mark past every
        cell), made by an `Edit`'s `mark` and dragged as the link; a clause
        rings them as `{ring mark}`, drawn as `LINK`. `fillGame`'s hint has a
        `gesture` (clicks, then a link's drag) in place of `targets`.
        `lineCount` is split by `says.arms` into `countMet`, `allOpen` and
        `noSpareRoom`; `betweenThem` is no leg of its own but
        `noSpareRoom`'s `{has 2: …}`. Decided against the plan: a line's
        clue is not outlined as `LINE`; the striped line hatches its clue,
        as Kakurasu's does, so the words say "this row" and not "its
        number" (consistency, pre-approved). "The tree above it" became the
        ringed tree. Each `reads` states Tents' own premise, since the
        hand-written hint's walk unions the two: a scan of HEAD in a scratch
        worktree walks the same 2589 positions with the same count for
        every kind. The hand-written steps the stated techniques share a
        name with carry `Step` until `steps:` goes; its rungs are the
        description's kinds (`SAYS_KINDS`), arms included.
  - [x] 3.2.3 The walk's link reading as engine capabilities, declared as
        `play.glance` (the techniques read once on the drawn links before
        each firing) and `play.askBefore` (where a deeper link is offered,
        for the techniques above; one more ask ends the ladder, for any):
        `engine/hint/glance.ts`. `describedFiringHint`'s walk gains
        `settle`, `fallback`, `writes` and `name`, and a `done` (a fill
        game with `blank` ends its plan at the answer); a step's kind is its
        technique's (`techniqueOf`), so an ask's step is `tentLink`'s or
        `treeLink`'s. Capabilities added: those two declarations. Measured
        2026-11-22 on 120 dealt 8x8 boards (60 Easy, 60 Normal), the engine
        walk against the hand-written one: the same rungs in the same order
        on 103; 13 link steps to its 14 (HEAD: no board the same, 676).
        The 17 that differ are the fill hint's tier start (it walks an
        Easy board at Easy, the hand-written at every tier, 14) and
        `betweenThem` said within `noSpareRoom` (3.2.1, 3).
  - [ ] 3.2.4 The flip: Tents born (its TypeScript gone, its catalog and
        help from the description), its tests on the engine's moves, the
        upstream-descs guard, run in the app.
- [ ] 3.3 Measure lines, frame time, hint-walk time and capabilities added
      per game, against the baseline; record the figures in design.md.

## 4. Finish

- [ ] 4.1 The ratchet on TypeScript lines under `src/games/`; see it fail
      on a planted line.
- [ ] 4.2 Spec deltas (`engine-*`, `tents`, a new `kakurasu`), with
      `skip_specs` dropped from `.openspec.yaml`;
      `docs/new-game.md` gains the route for a game born from its
      description.
- [ ] 4.3 Commit, push, archive. File the migration batches (review stage
      4) as changes if the pilot holds; if it does not, record why in the
      doctrine.
