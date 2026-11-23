## 1. Read first

- [ ] 1.1 Every `it(` in the born games' `*.test.ts`, sorted by kind
      (proposal.md § "Why"), with the guard or data form each becomes,
      written in a design.md for this change. Read the existing guards
      first (`src/guards/`, `docs/testing.md` § "What a game owes the
      cross-game guards"): a kind a guard already covers loses its
      per-game copy with no new guard. List any case that fits no kind,
      with what it needs.
- [ ] 1.2 Where the data lives: beside the description in its own file
      (as `*.plants.yaml` is), or in the description. Decide by what the
      description's readers would otherwise load; record why.

## 2. The format and its readers

- [ ] 2.1 The schema for a game's test data, and its reader in
      `src/engine/testing/`, with the examples' outcomes the engine
      reports (hint step kind and marks, mistakes, live errors, text,
      status, refusal message). A malformed entry fails with its file
      and line. Verified by a reader test that fails first on a planted
      wrong expectation.
- [ ] 2.2 The cross-game guards for each kind in 1.1 that has none,
      each reading its population from what the games declare. See each
      fail on a planted defect before trusting it (`docs/method.md`
      § "See a guard fail before trusting it").

## 3. Capabilities on their own descriptions

- [ ] 3.1 Fixture descriptions under `src/engine/testing/` or beside the
      capability's tests, naming no game, and each capability a born
      game names tested on one. Count the capabilities and the ones
      covered; a capability no fixture reaches is listed, not skipped.

## 4. The born games

- [ ] 4.1 Each born game's `*.test.ts` moved to data, one commit a game
      or a few, the cases of 1.1 kept as data or named by the guard that
      holds them. `npm run test:hint-sweeps` before the last commit.
- [ ] 4.2 `docs/testing.md` § "What a new game ships" (and
      `docs/new-game.md` where it names a test file) say a born game ships
      test data, not tests. Verified by the gate's guide checks.
