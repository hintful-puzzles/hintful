# check-guess-rule-outs

Asked for by the owner (2026-10-03), after `play-only-boards-with-one-answer`:
*"let's talk about Guess, why not have a mistake check there?"*, then *"please do
that"*.

## Why

Guess excused `findMistakes` because its code is hidden: *"checking a guess
against it would give it away. Each row's feedback pegs are the check."* That is
the reason `play-only-boards-with-one-answer` retired for Black Box and Mines.
Guess has one answer, the code, so a check against it is well defined.

What a Guess check reads is the question. A guess is a probe: a row that is not
the code is how the game is played, so it is never a mistake, and submitted rows
are history. What the player claims is the answer row's rule-out marks ("not this
color, in this slot"), and one can be wrong: ruling out the color the code has
there. That is the mistake every pencil-mark game already reports, and the one
mark that can leave a player unable to finish, since they would never try that
color in that slot again.

## What Changes

- `findMistakes` reports each answer slot whose rule-outs include the code's
  color there, and nothing once the game is over. It reports the slot, not the
  color, as a pencil-mark check reports the cell and not the digit, so it never
  says what the code holds.
- The slot gets a frame in the error color in the margin round its well, where
  the hint's outline goes, held in the slot's cache key.
- The `notApplicable.findMistakes` excuse goes.
- The check is written in Guess rather than through `entryMistakes`: that
  helper reads candidate masks, and Guess keeps their complement, so a slot with
  every color ruled out would read there as unmarked.
- The hint is unchanged: it reasons only from the scored rows and its own
  deductions, reading the player's marks only to skip one already made.
- Help and `docs/games/solver-and-generator.md` say what the check reads.

## Not in scope

The other thirteen games that excuse `findMistakes` give reasons about the
puzzle, not about secrecy: their moves cannot be wrong, only longer, or many
answers win. Of those whose positions can become unwinnable, Check & Save
refuses a dead end through the hint where the game has one (Flood, Inertia,
Pegs); Samegame and Sokoban have no hint yet, which `hintless-games-in-reserve`
tracks.
