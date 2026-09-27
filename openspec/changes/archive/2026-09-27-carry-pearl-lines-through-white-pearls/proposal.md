# carry-pearl-lines-through-white-pearls

## Why

The follow-up to `draw-pearl-arms-whole`, from the owner's playtest the same
day: a white pearl running across into a second white pearl beside it took one
step for the first pearl and another for the second. The second step only
restated the rule that a white pearl's line goes straight through it.

The owner asked whether there was a teaching objection. There isn't one, as
long as only the rule's own consequence is folded in. That the square past a
white pearl must turn is reasoning, and stays a step of its own.

Measured over the same 40 boards as before, following the hint took 2,431 steps
before this change and 2,335 after.

## What changes

- The hint's fold generalizes from a black pearl's run-on to both pearls'
  rules, applied to closure (`carryOn` in `src/games/pearl/hint.ts`). A black
  arm ending in a white pearl carries on through it, and a row of white pearls
  comes in one step.
- A step that carries a line through a white pearl ends with "It runs straight
  on through the next white pearl too." (or "pearls"). The fold can follow six
  different sentences, so a fixed second sentence names it instead of rewriting
  each one. That makes those sentences 127 to 172 characters long, and they are
  listed in `LONG_NARRATIONS`.
- A black pearl's run-on still comes only from the pearl's own step, and the
  narration still throws otherwise.
- `pearl-hint.test.ts` checks, over the whole corpus, that every line a step
  draws has its carried lines already on the board or in the step. It also
  checks that a carry through a white pearl the deduction did not name is
  spoken. Planted a dropped white fold, and the test went red.
