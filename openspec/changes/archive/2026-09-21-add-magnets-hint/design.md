# add-magnets-hint — design

The proposal named two hard parts. The census answered both before any design
was drawn, and both turned out smaller than they looked. That is recorded here
because the proposal's framing would otherwise be read as still standing.

## D1. One ladder, not two

`solve` and `solveUnnumbered` are the two `runDeductionFixpoint` call sites.
They are not two halves of one deduction:

- **`solve`** walks the eight-rung graded ladder over a clued board. It is what
  the generator grades with, what `findMistakes` and Solve re-solve with, and
  the only ladder a player's board can be at.
- **`solveUnnumbered`** walks `force`/`neither` over a *partially laid* board
  with **no clue counts at all**, inside the generator's `layDominoes`, between
  placements of the solution. No board a player sees is ever at that stage.

So the hint sees one ladder, and the runner needed no seam to compose two. The
framework question the proposal asked ("does `runDeductionFixpoint` compose?")
has no instance here. The one thing the runner was asked for that it did not
already offer is nothing: the single-firing driver is the Tracks shape
(`settled` after one firing, `beforeTechnique` clearing the standing premise),
and `solve`'s technique list moved into a `ladder()` method so the solve and the
hint read one declaration.

## D2. No new notation: the board already says every "cannot be + / −"

The proposal's hard part was that the solver keeps three "cannot be" bits and
the player can write only one, the `?` (cannot be neutral). Before designing a
notation for the other two, we asked the Subsets question
(docs/games/hints.md § "Give the facts a notation (Loopy)", the Subsets
paragraph): which of the solver's facts does the board already say?

Every writer of a NOT-+ or NOT-− bit is `unflag`, and it is reached from exactly
three places:

1. `set` → `unflagSurrounds`: a placed pole rules its sign out of its four
   neighbors. The pole is on the board.
2. `checkfull` with a count already met: the line's placed poles are on the
   board and its clue is printed.
3. `advancedfull`: the count is met once the magnets marked `?` lying along the
   line are counted, each bringing one + and one −. The `?` marks are on the
   board.

And `unflag` writes the domino's other end as the opposite pole, which the rules
make visible by construction. So `reading.ts`'s `whyNot` states that reading, and
`magnets-reading.test.ts` holds the claim over whole solves, one firing at a time,
on the path the hint walks: **46,502 bits across 120 boards, 0 unreadable** when
first measured, with the marked-magnet arm reached and a planted defect in it
turning four tests red.

Consequences:

- **No UI change.** The flag cycle stays `empty → neutral → ? → empty`.
- **The hint places every `?` its deductions rest on**, as moves (three rungs
  conclude "cannot be neutral"), and **hides** the firings that set only NOT-±
  bits: `lineFull` on a pole and `magnetsFill`. Hiding is honest because the
  board shows what they found; a later step that cites one re-derives it from
  the board, in the board's terms ("beside another +", "as its row already has
  all its +s").
- **`findMistakes` now vouches for a `?`**: one on a domino that is neutral in
  the solution is a mistake. The hint seeds the player's `?` marks as facts
  (`seedSolver`), and a note the plan reads from has to be one the mistake check
  vouches for (the Seismic and Loopy premise). This is the one player-visible
  change outside the hint itself; before it, a wrong `?` was silently accepted.

## D3. A firing is a journey of one kind of move

What a firing did is read off a before/after comparison of the solver's board
(the Galaxies lesson: never from the rules' return codes), with `GS_MARK`
masked because `advancedfull` rewrites that scratch bit whether or not it
fires. A firing that placed dominoes becomes one leg per domino; one that marked
magnets becomes one `?` leg per domino; the census asserts a firing never does
both. Every leg speaks the firing's one sentence, and each leg's rings are its
own squares and those of the legs still to come.

Each rung, when a recorder stands, records its premise before acting and
returns at the first line (or square) that changed something, which is the
guide's "return per premise". The generator's path has no recorder, so it
accumulates across the grid exactly as before, and the frozen differential
still matches byte for byte.

## D4. Following a leg by the game's own press cycle

Magnets' input is a cycle, so the move a leg asks for is often two presses
away: a − is placed through a + (or by one press on the other end), and a `?`
through neutral. `hintKeepTrack` calls the press on the way `"onTrack"`, which
holds the leg, and the press that lands it `"completed"`. A clue's done-gray
changes no square and holds the leg too.

## D5. Sentences

A line is "this row" or "this column", tied to the board by recoloring its clue
digits, since Magnets draws no line numbers. The neutral-domino deductions rest
on two premises, and the first draft ran to 140 characters where a count is met
only by counting marked magnets. Rather than ledger them (a sentence that
fires once in three thousand steps would read as a dead listing to the gate's
narrower walk), they are said as the hypothetical they are: "a − would overfill
its column", which is true however the count was met. The help now teaches that
a marked magnet counts. The longest sentence is 118 characters; every arm is
checked at every value it takes in `magnets-hint.test.ts`, since the rarest
(`bothInFull`) fired once in 3,433 steps.

## Refactor-as-you-go: evaluated and declined

- **The flag cycle as an engine mechanic.** Magnets cycles a whole *domino*
  through `empty → neutral → ?`, and its left press cycles polarity from the end
  pressed. What a game would legitimately do differently here is everything:
  the unit (a cell, a domino, an edge), the states, and which press means what.
  Nothing is shared beyond "a press advances a state", so there is no framework
  shape to own. Declined.
- **Tri-state candidates against `NoteEncoding`.** Moot: D2 means Magnets needs
  no per-square candidate notes at all.

## Cost

Game production lines added: `hint.ts` 512, `hint-text.ts` 161, `reading.ts`
153, plus `solver.ts` +125/−44, `index.ts` +39/−8, `render.ts` +78/−2. The
recording projection is the solver diff and `hint.ts`'s first ~215 lines
(`seedSolver`, the firing diff, `recordingPass`); `reading.ts` is the part no
earlier adopted hint needed, and is what replaced a notation.
