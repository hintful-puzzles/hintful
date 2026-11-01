# describe-moves-and-finishes

**Status: filed by `check-the-answer-from-the-rules` (2026-11-01)**, step 3
of `describe-the-whole-catalog`'s plan (`design.md` § "The plan"). **Split by
move shape at its start (2026-11-01, `design.md` § "The split")**: this change
builds the runtime and describes Sixteen, Twiddle and Fifteen, and files
`describe-guarded-moves` and `describe-components-and-open-domains` for the
other eleven; the second of those files step 4,
`describe-the-king-move-games`.

## Why

Fourteen games have no deduction ladder: twelve planning games (Netslide,
Fifteen, Sixteen, Twiddle, Cube, Pegs, Inertia, Slide, Flood, Same Game,
Numgame, Sokoban), Flip and Untangle. Their rules are code, written in
`executeMove`, `status` and again in each solver's packed copy. The owner
chose (2026-11-01, `describe-the-whole-catalog/design.md` § "Games with no
deduction ladder") to build a position runtime, measured by what it makes
cheaper for a catalog about 200% larger: a new planning game is written from
its description, its planner is configuration, and its dead-end claims are
checked sound. Ball sort (`add-ball-sort`) waits on it.

## What Changes

- **A position runtime.** A description states a position, guarded moves, a
  finish and a lose state; `npm run describe` compiles them to what
  `executeMove`'s legality and `status` call, as step 2 compiled the rules
  to `isAnswer`.
- **The planners fed the compiled move relation**: `slide-planner` and
  `permutation-planner` for Sixteen and Twiddle, which already take moves as
  data (`finish-search` goes with `describe-guarded-moves`). A solver keeps
  its fast packed copy where the generic move is too slow, and says so with
  the measurement.
- **Dead-end claims checked sound** on small boards (`hasNoSolution`: here
  the parity invariants), as techniques are.
- **Sixteen, Twiddle and Fifteen described**, each game's move legality and
  finish retired where the compiled one says the same.

## Facts for the session (2026-11-01; re-check)

- The planners: `src/engine/slide-planner.ts`,
  `src/engine/permutation-planner.ts`, `src/engine/finish-search.ts`;
  `Game.hasNoSolution` is declared in `src/engine/desc-error.ts`.
- `executeMove` also carries move counters, animation and Solve moves; only
  its legality and the finish are the rules (`design.md`, same section).
- Same Game's finish and last-of-a-color test are written three times, and
  the rules twice inside Pegs, Inertia and Sokoban (`design.md`
  § "Corrections"); `language.md` § "Sokoban" (archived) omits pits, whose
  finish is two-sided (`sokoban/state.ts`).
- Step 2's compiled check is the pattern: `src/describe/compile.ts`
  `answerCheck`, and `docs/descriptions.md` § "The answer check".

## Decisions it inherits

`describe-the-whole-catalog/design.md` § "Decisions made here" and
§ "Games with no deduction ladder".

## Acceptance

Sixteen, Twiddle and Fifteen each have a description its runtime executes:
its moves' legality and its finish compiled and called, its hand-written
copies removed or kept with the reason and the measurement; `slide-planner`
and `permutation-planner` fed the compiled move relation; every dead-end
claim checked sound on small boards; every fixture, deal and hint walk
unchanged, or each difference reported; the guides updated
(`docs/descriptions.md`); the split's two changes filed.
