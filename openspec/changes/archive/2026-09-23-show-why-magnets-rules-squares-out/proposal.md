# show-why-magnets-rules-squares-out

## Why

Owner playtest, 2026-09-22, on a phone (5x6 Normal, strip clues): *"it's
highlighting the wrong area"*. The step was the `onlyEndLeft` count premise,
*"This column needs 3 more +s and just 3 dominoes can still give one; this one
only here, so it must be +."*, and it drew three things wrong:

- **The evidence outline drew a domino that is not there.** Both count premises
  outlined "the rest of the line". On that board the rest of the column was the
  right halves of two horizontal dominoes, which the outline joins into one
  vertical shape.
- **It rested on facts it never showed.** Those two dominoes cannot give a +
  because their left halves would then be −, and the column on their left has
  all its −s (its clue is 0). Neither the sentence nor the picture said so. The
  Magnets spec already requires a step citing such a fact to name it in board
  terms, and `whyNot` already reads it; only these two premises skipped it.
- **"This one only here" was said of a domino whose "here" was not yet
  forced.** The firing places its dominoes in one sweep, and the vertical one's
  top end loses the + only once the leg before it places a + beside it. On the
  board the step read (and in step 1, which rings every leg) the claim was
  false, and its ring covered both ends.

The same missing reason is in the `lineExact` pole premise, *"only these N
squares can still take one"*: the squares it excludes are excluded for reasons
the step never gives. The census for this change (every preset × 30 seeds)
found reasons ruled out a square in 484 of its 587 firings and 34 of the 68
`onlyEndLeft` ones, with two or more kinds of reason in one step more often
than one.

## What changes

- The two count premises name why the rest of their line is ruled out, as the
  things a + (or −) there would do: touch one, overfill its row or column, or,
  at the domino's other end, put the opposite sign beside its own kind or one
  too many in a line.
- Their evidence becomes those ruled-out squares and what rules them out (the
  sign they touch, or the met line and its clue), through the `evidenceOf` the
  forced-end sentences already use, instead of the rest of the line.
- Their targets ring only the square that takes the sign.
- A domino lying along the line says, in its own leg, why its other end is out,
  read off the board as that leg stands, so a leg forced by the leg before it
  says so.
- The sentences join `hint-quality.test.ts`'s `LONG_NARRATIONS`: two premises
  (the count, and why the rest cannot supply it).

## Impact

- `src/games/magnets/hint.ts`, `hint-text.ts`, their tests.
- `openspec/specs/magnets/spec.md`: one added requirement.
- Player-visible: a hint's wording and marks. The owner chose this direction
  (reasons, not only a fixed outline) and accepts the result.
