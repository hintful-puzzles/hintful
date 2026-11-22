## 1. Design

- [x] 1.1 Read `archive/2026-11-21-architectural-review-blue-sky/design.md`
      whole, and the prior art it cites (pzprjs's board and checklist,
      cspuz's serializer combinators).
- [x] 1.2 Pick the new game: Kakurasu (design.md § 1).
- [x] 1.3 Design the board, `Edit`, `Ui` and the `fillGame` entry point;
      what each consumes from the description; how a game-ID codec and a
      sampler are declared; the render layers. Write `design.md`.

## 2. The engine

The baseline for 3.3 is the parent of this change's first engine commit:
note its hash here when that commit lands.

- [ ] 2.1 `engine/fill/`: the board, `Edit`, `FillUi`, and the hooks built
      from them (`executeMove` with marks' `while`, `status`, `solve`,
      `findMistakes`/`clearMistakes`/`revealOne`, `textFormat`, `rules`,
      `difficulty`); unit tests on a hand-built board.
- [ ] 2.2 The compiler: `play:`, `catalog:`, `id:`, `tierLetters:`,
      `deal.sample:`, a mark's `while:`, `labels:`; `clueHolds_<kind>` and
      `deriveClues`; the generated `<id>.game.ts`. Schema and lint.
- [ ] 2.3 `src/games/catalog.ts` as the one way to the catalog, every
      reader of `src/games/*/catalog.ts` moved to it; `src/games/index.ts`
      registers the generated games.
- [ ] 2.4 Input from `play` (verbs, keys, Shift/Ctrl painting, `stroke`,
      `links`).
- [ ] 2.5 Render by layers: the engine walk, painters in
      `engine/render/pieces/`, margins, labels.
- [ ] 2.6 The deal: `scatter`/`partner` samplers, the tier gate, the codec
      combinators and the params codec.
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
- [ ] 4.2 Spec deltas (`engine-*`, `tents`, a new `kakurasu`);
      `docs/new-game.md` gains the route for a game born from its
      description.
- [ ] 4.3 Commit, push, archive. File the migration batches (review stage
      4) as changes if the pilot holds; if it does not, record why in the
      doctrine.
