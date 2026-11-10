# check-the-last-move

**Status: filed on the owner's word (2026-11-07)**, "to see if we could":
an exploration. **The owner wants to consider this before it is built, and
it waits until the description work (`describe-the-whole-catalog`) is
done.** The session that takes it up brings them what it measured and the
answers it proposes to the questions below, before writing a design.

**It waits for the explained verdict (the owner, 2026-11-10)**: a verdict
with no reason was weighed and not wanted first. The explanation is the
engine's answer to "what does this fact rest on?", which
`explain-a-firing-by-its-witness-and-parents` builds, spoken in the words
`state-hint-sentences-in-the-description` gives a technique. This is the
last of the plan in
[`derive-hint-steps-from-the-description/report.md`](../archive/2026-11-10-derive-hint-steps-from-the-description/report.md).

**What that plan already answers** (2026-11-10), for the session to check
and bring to the owner as proposed answers:

- *Uniqueness*: a described technique is checked sound against the rules
  alone, so a known deduction never assumes the board has one answer, and
  the search that says "forced" need not either.
- *Which marks count*: a mark whose description gives it a meaning can be
  judged as a placed value is; a play aid with none (Unequal's `done`)
  cannot.
- *What the last move is*: the facts by which the marks differ before and
  after it, read through the adapter `build-hint-steps-in-the-engine`
  gives each game, each fact judged.
- *A caution*: where a game's candidates cannot be written (Magnets,
  Ascent, Filling), a move can be a known deduction that rests on facts the
  player never saw. The verdict holds; its explanation has to say them.

## Why

Check & save says whether the board is right (`quick-save`, "Check & save
gates the checkpoint on a clean board"): no mistakes against the answer, and
no dead end the hint would send the player back from. It says nothing about
how the player got there. A move that is right by luck passes exactly as one
that was reasoned, and the hint, which explains why a move is forced, is the
only place the fork teaches that.

The owner asks whether Check & save could also say whether the **last move
was logically valid**: whether the board as it stood before the move forced
it.

## What Changes

Check & save, beside its answer check, gives a verdict on the player's last
move, judged against the position before it:

- **A known deduction**: one of the game's techniques, or a combination of
  them, makes the move from that position.
- **Forced, beyond the known deductions**: no technique reaches it, but no
  answer consistent with the rules and with what was on the board before the
  move disagrees with it. Nothing the player could see allowed another way.
- **Not forced**: some answer consistent with that position disagrees with
  the move. The move may still be right; it was not yet decided.

The answer check stays as it is: a move that is wrong is a mistake whatever
its verdict, and saving is gated as today.

## Questions for the owner

- **Does uniqueness count?** Every board is dealt with one answer, so against
  the answer alone every right move is forced. The second verdict is only
  meaningful judged by the rules and the marks, without assuming the board
  has one answer, as the hint reasons. Which reading is wanted?
- **What is "the last move"?** One stroke can decide many cells or edges and
  can mix forced and unforced parts (a Path drag, a Loopy line). Is it judged
  whole, or each mark it made?
- **Which marks count?** A struck candidate or a cross is information too. Is
  a pencil mark, a cross or a note judged as a placed value is, or not at all?
- **How far does "a combination" reach?** Is a move several of the ladder's
  firings deep a known deduction, and up to which tier: the board's own, or
  the whole ladder?
- **Only the last move, or any?** Undo history holds the positions before
  each move.
- **Unreasonable boards**: where a board's tier allows trial and error, is a
  move not yet forced reported at all?
- **What the player sees**: the wording of each verdict, whether it sits in
  the same alert as the answer check, whether it gates the save (today
  nothing but a mistake or a dead end does), and whether a hint-style
  explanation of the deduction follows.
- **Whether it is Check & save at all**, or a check of its own beside it.

## What it touches

- `quick-save` and `app-shell`: what Check & save says, and possibly whether
  it saves.
- `engine-hints`, `engine-difficulty`, `described-ladder`: the ladder a known
  deduction is judged by, and the search that says whether a move was forced.
  It is a capability of the engine, consumed from what each game already
  declares (its ladder, its answer check, its search), never written per game.

## Constraints to measure before designing

- **Cost.** The second verdict is a search over answers from a position with
  less on it than the player's, where the answer cache does not help. Measure
  it on each game's largest presets against the time a button press can wait,
  and say what the check says where the search cannot settle in time (as
  Check & save already does for the hint's dead-end search).
- **What the engine already offers** (2026-11-07, `describe-lines-and-loops`):
  a described game's search (`searchAnswers`) counts answers to two from
  marks, so "forced" may be one search from the position before the move
  with the move's opposite seeded: no answer means forced. A known deduction
  is best asked of the hint's walk (`ladderWalk`), one firing at a time: a
  fixpoint run fires every binding in a pass, and a binding that reads a set
  bound before an earlier firing reads it stale (Path's `pairBreaks` did).
- **Every game.** A game with no ladder or no search, and the games whose
  moves are not marks on cells (Untangle, Sokoban, Fifteen), need a stated
  verdict or none.
- **Offline**, and touch, keyboard and mouse alike.

## Acceptance

Written once the owner has answered the questions above.
