# let-a-refusal-point-at-its-cause

**Status: scaffolded, not started (2026-10-02).** Found by `add-pegs-hint`; the
Check & Save half is the owner's (2026-10-02: *"what I need from it in games
like Pegs is that it would reject if there is no applicable hint. I think this
needs to be engine functionality"*).

## Why

Two gaps with one cause: the engine cannot tell a refusal that says **this
position is doomed** from one that says **the hint cannot help here**, and a
doomed verdict cannot point at what dooms it.

**Check & Save saves a doomed position.** `checkAndSave`
(`src/puzzle/quick-save-actions.ts`) asks only `findMistakes`. Pegs has none
(`notApplicable`, since any finish wins), so on a board with a peg cut off for
good the command says "Saved." and keeps a checkpoint the player can never
finish from. The same holds for every game whose hint can say a board is
doomed without a single entry being wrong: Bricks, Clusters, Subsets and Loopy
answer `CONTRADICTION_UNLOCALIZED` from `hint` while their `findMistakes`
finds nothing, so Check & Save calls those boards "No mistakes. Saved." too
(to be re-verified by reading each, not by grepping for the constant).

**A doomed refusal can only count its cause.** A refusal is a bare string, so:

- Pegs: "2 pegs are cut off where no other peg can ever reach them…"
  (`pegs/hint.ts`, from `frozenPegs`, which knows exactly which pegs).
- Inertia: "The ball can no longer reach a gem…" (`inertia/hint.ts`, from
  `unreachableGems`, which knows exactly which gems).

The one refusal that highlights its cause, `FIX_MISTAKES_FIRST`, can because the
midend owns both its sentence and the overlay.

## What

1. **Type the verdict.** Every `HintRefusal` kind says whether the position is
   doomed. Doomed: `NO_SOLUTION_FROM_HERE`, `CONTRADICTION_UNLOCALIZED`,
   `GAME_OVER`, and a game's own dead end (Pegs' cut-off pegs, Inertia's dead
   ball and stranded gems). Not doomed: `DEDUCTION_EXHAUSTED`,
   `SEARCH_OUT_OF_REACH`, `NO_MOVE_WORTH_MAKING`, `PUZZLE_NOT_REASONABLE`,
   `SOLUTION_UNKNOWN`. `puzzleHintRefusal` splits accordingly, so a game states
   the verdict where it writes the sentence.
2. **Let a doomed refusal mark its cause.** It carries a `Narration` whose
   references name the elements, painted the way a step's marks are and held to
   its words by the binding walk.
3. **Check by the engine.** One midend check answers Check & Save and Check
   without saving for every game with `findMistakes` *or* `hint`: mistakes
   first, as today; otherwise the hint's verdict, and a doomed one refuses to
   save, shows the refusal's words, and draws its marks. A game with neither
   keeps today's plain save.

## Open questions for the design

- **Past a search's reach.** `SEARCH_OUT_OF_REACH` establishes nothing about the
  board, so it must not refuse a save, but saying only "Saved." hides that the
  check could not settle it. Owner's call on the wording, with the measured
  frequency (Pegs: positions random play leaves on the 33-hole and larger
  boards).
- Whether a marked refusal is a `HintStep` with no move (the display path
  exists) or a new result arm; the first breaks "every step has a move", which
  `hint-gesture.ts` relies on.
- How the marks cross the worker boundary: only `explanation` crosses today.
- The cost of a check: a hint can take most of a second on Pegs' largest boards.

## Hints to pull in

None. Pegs and Inertia already have hints and check this change.
