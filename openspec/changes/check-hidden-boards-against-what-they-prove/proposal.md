# check-hidden-boards-against-what-they-prove

**Status: scaffolded, not started (2026-10-02).** Proposed after
`give-a-hint-sentence-its-parts`, which wrote Black Box's hint.

## Why

Black Box and Mines are the two games that excuse `findMistakes` because their
answer is hidden (`Game.notApplicable`, read 2026-10-02):

- Black Box: "The balls are hidden, and checking your guesses against them would
  give them away."
- Mines: "The mines are hidden, and checking your flags against them would give
  them away."

Both reasons are true of a check against the **answer**. Neither is true of a
check against what the **board already proves**, and both games now compute
exactly that for their hint, from visible information only:

- Black Box's hint (`blackbox/hint.ts`, `deduce`) settles squares from the
  lasers fired, and a test holds it to reading nothing hidden
  (`blackbox-hint.test.ts`, "reads the lasers fired, never the hidden balls").
- Mines' hint deduces from the opened numbers alone and already names a flag on
  a square it proves safe as a conflict inside its own step
  (docs/games/hints.md § "A mark nothing can check is a claim, not a premise
  (Mines)").

So a guess on a square the lasers prove empty, or a flag on a square the
numbers prove safe, is a mistake the player could have found themselves, and
pointing at it gives away nothing the board does not. Every other deductive
game in the collection checks its marks; these two leave the player without
Check & Save's help for no reason that still holds.

## What

- Each game's `findMistakes` reports the marks that contradict its hint's own
  deductions (a guess or a known mark against a settled Black Box square, a flag
  on a square Mines proves safe), and nothing else: never a mark the visible
  board cannot refute.
- The `notApplicable.findMistakes` excuse goes, and the help pages' wording on
  checking follows.
- The hint then meets the collection's ordinary contract: the midend refuses on
  a board with a mistake before asking the hint, so the in-hint conflict
  handling (Black Box's `movesTo` taking a ball off a proven-empty square,
  Mines' "the flag must come off" leg) is re-read to see what is still
  reachable.

## Decisions for the owner

- Whether a check that finds only *provable* mistakes is the right meaning of
  Check & Save in a hidden-answer game. It cannot catch a wrong guess the
  lasers or numbers have not yet ruled out, which a player might read as
  "nothing is wrong". The words the check shows when it finds nothing may need
  to say what it checked.

## Not in scope

The verify at the end of Black Box (`checkGuesses`) stays as it is: it checks
against the hidden balls once the player says they are done, which is the
game's own rule.
