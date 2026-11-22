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
- [ ] 2.3 The generated games in the catalog and the registry. Re-derived
      2026-11-22: every reader already goes through one module,
      `src/puzzle/catalog.ts` (`catalogFrom` in `catalog-data.ts`), and only
      it, `vite-plugins/catalog.ts` and `src/games/index.ts` glob
      `src/games/*/catalog.ts`; so no `src/games/catalog.ts` is needed, and
      those three glob the generated games beside. The compiler: `catalog:`,
      and the generated `<id>.game.ts`. Needs `fillGame`, so it is done
      after 2.7, with 3.1.
- [ ] 2.4 `FillUi`, `newUi`, `changedState`, and input from `play` (verbs,
      keys, Shift/Ctrl painting, `stroke`, `links`). The compiler: `play:`.
- [ ] 2.5 Render by layers: the engine walk, painters in
      `engine/render/pieces/`, margins, labels. The compiler: `labels:`.
- [ ] 2.6 The deal: `scatter`/`partner` samplers reading `deal.sample`, the
      tier gate, the codec combinators and the params codec. The compiler:
      `id:` and `tierLetters:`.
- [ ] 2.7 The hint: `describedFiringHint`'s hooks from the board; `MARK`
      facts as an `Edit`'s marks; step words from `says` and its arms.

## 3. The games

- [ ] 3.1 Kakurasu from its description alone: description, help, spec,
      icons; measure its deal rate first (design.md § "Risks"). Each gap
      is closed in the engine, and listed here as a capability added.
- [ ] 3.2 Tents moved: `id:` keeps upstream's grammar (the upstream-descs
      guard proves it); its walk's link reading as engine capabilities;
      `lineCount` split by `says.arms`. Checked in the app, including
      links, drags, hints and dark mode. List the capabilities added.
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
