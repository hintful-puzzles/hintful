# check-the-last-move

**Status: decided with the owner (2026-11-18)**, after the measurements
below, "something useful, without trying to make it perfect".

## Why

Check & save says whether the board is right (`quick-save`, "Check & save
gates the checkpoint on a clean board"): no mistakes against the answer, and
no dead end the hint would send the player back from. It says nothing about
how the player got there. A move that is right by luck passes exactly as one
that was reasoned, and the hint, which explains why a move is forced, is the
only place the fork teaches that.

A player reaches for Check & save after a move they are unsure of. That move
is the one worth judging: whether the board as it stood before it forced it,
and if so, by what.

## What Changes

- **Check & save judges the last move**, beside its answer check, against
  the position before it: did the game's own deductions reach it from there?
  It never gates the save; a mistake or a dead end gates it as today.
- **A move that followed is told what it followed from**, in the words of
  the deduction that makes it: that step's stated sentence, behind a lead-in,
  with the hint's marks. Where only a chain of deductions reaches it, the
  chain's first step is quoted (the one that reads only what is on the
  board), and the words say the move follows on from there.
- **A move no deduction reached is told so**, its square marked: it was
  right, but nothing on the board forced it yet.
- **What counts as a move**: the facts the player's marks differ by, before
  and after: a value placed, a cross, a candidate struck. A move that decides
  several squares followed only if every one did, and the first that did not
  is the one marked. A note added (mark-all's included), undo and redo, and a
  play aid with no meaning in the description (Unequal's `done`) are not
  judged.
- **Where it shows**: in the words area under the board, where the hint's
  explanation sits, styled as the hint with a "Check" lead so a verdict is not
  read as advice. **Check & save's refusals move there too**, out of the
  modal alert, kept red and plain: the count of mistakes, or the dead end's
  sentence, with nothing saved.
- **Which games**: the games whose hint is the engine's walk over a compiled
  ladder. The others say nothing new (below).

## Decided (owner, 2026-11-18)

- **In Check & save, and no new control or preference**: the button is what
  a player reaches for after a move they are unsure of.
- **The last move only.** "I don't see that much of a benefit about telling
  them that they've made an unsound deduction 5 minutes ago in a move they
  already forgot."
- **Crosses and pencil notes count**, as far as they can: a struck candidate
  is a deduction; a note added asserts nothing a board can force.
- **Say which deduction it was**, reusing its sentence, with what syntactic
  change the lead-in needs.
- **Shown where the hint is**; the earlier rule against showing a successful
  check stood because it covered the board, which the hint's place does not.
- **Refusals move to the same place**, "red and obvious".

## Measured (2026-11-17)

Each game's largest preset, at its hardest tier on the menu, two boards,
played by following the hint and timed at every position; the deduction to
its fixpoint from the board as dealt, three boards; the search for answers
on an Unreasonable board of the same size. A scratch probe on this machine
under its usual load.

- **A "forced" search decides nothing on a board with one answer.** Every
  board the app deals has exactly one answer, so for a correct move no answer
  agreeing with the rules and the position before it can disagree with it:
  "forced" is "correct". The verdict that tells a player something is whether
  the game's deductions reached the move, and it needs no search.
- **That costs one deduction fixpoint** from the position before the move: at
  most 43 ms from the board as dealt on any game (Crossing 15×15), under
  10 ms on most. The hint's walk, which gives the sentence, took a median of
  20 ms or less at every position in every game that marks cells but Loopy
  (54 ms); the slowest single position was Mines' at 208 ms.
- **The search**, for comparison: 113 ms or less on an Unreasonable board
  of the largest size, but Group's 2.1 s and 7.7 s at 12×12.
- **The games it cannot serve**: moves that are not marks (Cube, Fifteen,
  Flip, Flood, Inertia, Netslide, Numgame, Pegs, Same Game, Sixteen, Slide,
  Sokoban, Twiddle, Untangle), where any legal move is allowed and the
  dead-end check already says whether the puzzle stays winnable; an answer
  the player cannot see (Guess, Black Box), where a probe is never forced;
  and a hint that is not the engine's walk (Ascent, Undead, Mines), which
  needs its own solver's reach first.
- **Found in passing, fixed** (`c582e4f41`): Solo's difficulty contract
  called a stuck board "impossible" below the recursive tier.

## What it touches

- `quick-save` and `app-shell`: what Check & save says, and where.
- `engine-hints`, `described-ladder`: the walk from the position before the
  move, and a step's sentence spoken as a verdict. A capability of the
  engine, consumed from what each game already declares, never written per
  game.

## Acceptance

The owner plays a move that follows, one that is a guess, a cross and a
struck candidate, and a mistake, in a few games, and reads what Check & save
says and where.
