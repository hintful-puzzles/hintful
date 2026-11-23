## 1. Read first

- [x] 1.1 Every `it(` in the born games' `*.test.ts`, sorted by kind
      (proposal.md § "Why"), with the guard or data form each becomes,
      written in a design.md for this change. Read the existing guards
      first (`src/guards/`, `docs/testing.md` § "What a game owes the
      cross-game guards"): a kind a guard already covers loses its
      per-game copy with no new guard. List any case that fits no kind,
      with what it needs.
- [x] 1.2 Where the data lives: beside the description in its own file
      (as `*.plants.yaml` is), or in the description. Decide by what the
      description's readers would otherwise load; record why.

## 2. The format and its readers

- [x] 2.1 The schema for a game's test data, and its reader in
      `src/engine/testing/`, with the examples' outcomes the engine
      reports (hint step kind and marks, mistakes, live errors, text,
      status, refusal message). A malformed entry fails with its file
      and line. Verified by a reader test that fails first on a planted
      wrong expectation.
      (`game-cases.ts`, its test on the fake game; `born-game-cases.test.ts`
      runs it; `npm run hint-scan` writes a cases file's pins. The
      `input` and `wordings` sections of design.md are still to add, with
      the first game that needs each: Bricks, Singles, Sticks; Clusters,
      Star Battle.)
- [ ] 2.2 The cross-game guards for each kind in 1.1 that has none,
      each reading its population from what the games declare. See each
      fail on a planted defect before trusting it (`docs/method.md`
      § "See a guard fail before trusting it").
      - [x] The mistake outline (`mistake-outline.test.ts`), seen to fail
            on all fourteen with the overlay's mark planted away; Pattern
            left `NO_OVERLAY_TEST`.
      - [ ] A desc written back, in `upstream-descs.test.ts`.
      - [x] A deal's symmetry holds (`dealt-symmetry.test.ts`): a
            symmetric hide's clues and a sample's first cells at their
            option's symmetry, read from each compiled deal; seen to fail
            on Light Up, Range and Sticks with the half-turn copy and the
            hide's pairing planted wrong.
      - [ ] A deal's clues are its answer's (with Boats or Singles).
      - [ ] What a placement brings (`rulesOut`).
      - [ ] Absence over every picture of a small size.

## 3. Capabilities on their own descriptions

- [ ] 3.1 Fixture descriptions under `src/engine/testing/` or beside the
      capability's tests, naming no game, and each capability a born
      game names tested on one. Count the capabilities and the ones
      covered; a capability no fixture reaches is listed, not skipped.
      Until then a capability whose check a count cannot state is tested
      in its engine module's tests on its one game's compiled module, as
      Tents' already are: the `joins` painter on Norinori
      (`engine/fill/render.test.ts`), which a fixture replaces.

## 4. The born games

- [ ] 4.1 Each born game's `*.test.ts` moved to data, one commit a game
      or a few, the cases of 1.1 kept as data or named by the guard that
      holds them. `npm run test:hint-sweeps` before the last commit.
      Moved: Kakurasu, Unruly, Mosaic, Norinori, Range. A position's
      `text` and `statusbar` take `null` for none shown. An ID case's `holds` is
      the codec's reading, so it may sit beside a `refused` (Norinori's
      walls read as regions on a board loading refuses); a position's
      `circled` reads the text inside each hint circle (Mosaic). The
      rest are `NOT_YET_DATA` in
      `born-game-cases.test.ts`, which only shrinks; each game's
      outline case leaves for `mistake-outline.test.ts`.
- [ ] 4.2 `docs/testing.md` § "What a new game ships" (and
      `docs/new-game.md` where it names a test file) say a born game ships
      test data, not tests. Verified by the gate's guide checks.
      (Written; checked off once the last game moves.)
