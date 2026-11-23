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
      runs it; `npm run hint-scan` writes a cases file's pins. `input`,
      `input-cases.ts`, came with Singles.)
- [x] 2.2 The cross-game guards for each kind in 1.1 that has none,
      each reading its population from what the games declare. See each
      fail on a planted defect before trusting it (`docs/method.md`
      § "See a guard fail before trusting it").
      - [x] The mistake outline (`mistake-outline.test.ts`), seen to fail
            on all fourteen with the overlay's mark planted away; Pattern
            left `NO_OVERLAY_TEST`.
      - [x] A desc written back, in `upstream-descs.test.ts`: every born
            game's corpus descs (126 of nine games), through the codec its
            description compiles to; an `ids` case's `writesBack` for IDs
            from elsewhere. Seen to fail with the run letters one off.
      - [x] A deal's symmetry holds (`dealt-symmetry.test.ts`): a
            symmetric hide's clues and a sample's first cells at their
            option's symmetry, read from each compiled deal; seen to fail
            on Light Up, Range and Sticks with the half-turn copy and the
            hide's pairing planted wrong.
      - [x] A deal's clues are its answer's (`dealt-clues.test.ts`): a
            withheld value never dealt, a hide flag's kind dealt everywhere
            with the flag off and fewer with it on. That the clues are the
            answer's is the rules' guards'; Singles' shaded repeats follow
            from loading's uniqueness (an unrepeated shaded square could be
            cleared). Seen to fail with the flag's kind hidden regardless,
            and with the compiler's withheld filter planted off.
      - [x] What a placement brings (`placement-brings.test.ts`): each
            answer placement alone brings exactly what the live rules rule
            out with it, washed squares and matchings left out; laid in
            order, a subset. Agreed on all 673 placements of the four
            declaring games before it was written; seen to fail with a
            technique dropped and with the premise check dropped.
      - [x] Absence over every picture of a small size (Pattern's "no
            Unreasonable board up to 3x3"): an absent cell written
            `{cell, exhaustive: true}` (`testing/every-answer.ts`), every
            answer of the size tried in place of the generator's tries.
            Seen to fail on 2x2 to 3x3 with the search tier planted to
            take a board of several answers.

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

- [x] 4.1 Each born game's `*.test.ts` moved to data, one commit a game
      or a few, the cases of 1.1 kept as data or named by the guard that
      holds them. `npm run test:hint-sweeps` before the last commit.
      Moved: Kakurasu, Unruly, Mosaic, Norinori, Range, Clusters, Star
      Battle, Light Up, Tents, Pattern (a step expected names its `step`
      in the plan where it is not the next), Boats (its tally case is
      `engine/fill/tally-display.test.ts`'s, on plain values, which 3.1's
      tally fixture may take). A position draws under `preferences`,
      `draws` names a collection color (`yellow-wash`) for a surface with
      no role, and `brings` is what its last move's placement rules out.
      Singles (`input` for its wrapping cursor and the margin press; its
      rungs on boards too small to load are its pins'), Sticks (an input
      case reads its board as the codec does, answers or none), Bricks
      (an input step's `holds`; the hexagon's shear is `hexGrid`'s, on a
      fixture in `target-verb.test.ts`; "two in five are bricks" is the
      deal's own `least` check, dropped). `wordings` renders a technique's stated step from terms on
      the compiled module (`BornGame.compiled`), the pieces named as the
      hint names them (`pairPieces`); `draws` takes `any` for a piece in
      the game's own colors. A position's
      `text` and `statusbar` take `null` for none shown. An ID case's `holds` is
      the codec's reading, so it may sit beside a `refused` (Norinori's
      walls read as regions on a board loading refuses); a position's
      `circled` reads the text inside each hint circle (Mosaic). Each
      game's outline case left for `mistake-outline.test.ts`.
      `born-game-cases.test.ts` holds every born game to a cases file and
      no test file of its own, seen to fail on a planted one.
- [ ] 4.2 `docs/testing.md` § "What a new game ships" (and
      `docs/new-game.md` where it names a test file) say a born game ships
      test data, not tests. Verified by the gate's guide checks.
      (Written; checked off once the last game moves.)
