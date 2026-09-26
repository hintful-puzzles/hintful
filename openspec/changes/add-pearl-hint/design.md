# add-pearl-hint — design

## D1. The shape-set question: no notation, measured

Pearl's solver keeps, per square, the shapes it may still take. The player can
only mark edges. So the question under rule 6 was whether any conclusion rests on
a shape strike that the edges do not show.

**Census, one level finer than the rungs** (scratch survey, 2026-09-26: 40
boards each at 6x6 and 8x8 Easy and Tricky, 8 at 10x10 Tricky). Each shape a
rung struck on the player's view was checked for whether it nails an edge of
its own square at once:

- `pearl-clues`, classified by what a strike left (the survey did not split
  the rules). A plain square left one state nailed an edge every time, 1,719
  strikes, which is mostly the black pearl's "run straight on". A white pearl
  (its "run the other way") nailed every time, 101 strikes. A plain square left
  several states, which is the white pearl's "turn on the other side", nailed
  in 122 of 140. The survey read the square after the whole sweep, so some of
  those 18 may be squares whose edge the same sweep had already written. The
  hint does not depend on which: a strike that nails nothing is taken back
  (D2).
- `shortcut-loop`'s shape half. Where the square keeps one state (blank, or
  a white pearl's other straight) it nailed edges every time, 473 strikes.
  Where it keeps several it **never** did, 140 of 140. That is the
  connections-0 case: a square between two ends of one piece, told only "not
  the shape that joins them". It is exactly the pair fact Loopy needed a corner
  note for.

**Then the bet itself:** a solver that forgets every strike not visible as an
edge, re-reading each square off its pearl and edges before each firing. Over
11,568 verdicts on generator-shaped boards, it **agrees with the real solver
every time**. That was 6x6, 8x8 and 10x10, with a maximal clue set thinned one
clue at a time as the generator does, at both caps. So the pair fact exists and
nothing ever needs it. Pearl gets no notation and no `Unreasonable` tier.

Why that is plausible rather than luck: a hidden strike "S can't join ends A
and B" stays re-derivable for as long as it is not visible, because while A and
B are still ends of one piece, the piece cannot have grown and the count of
squares that cannot be blank cannot have shrunk. So the rung finds it again
whenever it would matter. The corpus test holds it: the hint must finish every
board it deals.

## D2. The recording projection: threaded, with the player's view reset

The hint runs the solver's own ladder (`pearlRecordingPass`), through
`singleFirings`, with a recorder standing. Everything the recorder adds is
behind `if (rec)`. The ladder-equivalence test and the frozen differential
pass unedited, so the generator's path is byte-identical.

- **Before every firing, every square is re-read from its clue and edges**
  (`readSquaresFromEdges`). So no firing's premise holds a fact the player has
  no mark for. `pearl-hint.test.ts` checks every firing's `before` snapshot
  against that reading. Removing the reset turned it red.
- **A shape strike counts only through the edges it nails there and then**
  (`narrow`). On the hint path the square is settled at once, and a strike
  that nails nothing is taken back and the scan moves on. That is the pairing
  of `shapes-from-edges` with `edges-from-shapes` the tasks asked for. It is
  done at the strike, so the shape set never outlives the step.
- **One premise per firing.** `edges-from-shapes` returns at the first square
  (at the first *axis* of a black pearl, since each axis is its own
  deduction). `pearl-clues` returns per pearl rule, and `shortcut-loop` per
  edge, then per square state. The shortcut rung tries its edge half first
  across the whole board: a state running from a piece's end to its other end
  is ruled out by exactly the edge that half finds.
- **What a firing decided is read off the board**: the edges that changed.

## D3. Hide what a full square already says

A cross beside a square that already has both its lines is evident. The game
does not refuse a third line, but a player reads the square as surely as a
cross, and asking for those crosses is busywork: without this, a square's
second line would be followed by a step saying "this square already has its
two lines". So `evident` drops such crosses from a step's move. A firing with nothing
else is hidden, and still advances the working board. Later sentences that
count "no other way to go on" count those edges as closed, which is honest
because the full square is on the board. The help says so in its last
paragraph.

## D4. Narration and picture

Seven reason kinds, each sentence under 120 characters in `hint-text.ts`. The
census test asserts every kind is reached on the corpus. The one never reached
there is a variant, not a kind: an early loop that leaves only lines out, and
no pearl. It is direct-tested for length and voice.

The decided edge is drawn in the game's own shapes, in the hint color: a line
from the square's center to the edge (a stroke at half the laid line's weight,
so it reads as proposed), or a cross heavier than the player's. The squares a
step reasons from are outlined with `hint-mark.ts`'s band, inside the tile and
under the lines.

## D5. What changed around it

- **`findMistakes` flags a cross on an edge the solution uses.** The hint reads
  crosses as facts, so the mistake check must vouch for them, as Loopy's does.
  The overlay draws such a cross in the mistake color.
- **`H` no longer autosolves in place.** Upstream's key filled in the whole
  deduction without marking the game as solved-by-help. It also shadowed the
  app's `h`, and the shortcut ledger excused that as "its own hint", which it
  was not. The key now reaches Next hint. The move kind stays, so a saved
  game that used it still replays.

## D6. Refactor-as-you-go: what Pearl shares with Loopy, and what not

Read against `loopy/hint.ts`, `notes.ts`, `record.ts` and `render.ts`:

- **Notes, the recorder of derived facts, and deferred placement.** None of it
  applies: D1 is the finding that Pearl needs no notation, so there is nothing
  to record or place.
- **Edge marks.** Loopy draws on arbitrary tilings from `engine/grid/`
  geometry, with no cells or tiles. Pearl draws square tiles through a tile cache
  and echoes its own half-edge shapes. The only common idea is "echo the move's
  shape", which is already the guide's rule, not code.
- **The sentences.** Pearl reuses Loopy's words ("must be a line", "no other way
  to go on", "would dead-end") so the two games teach the same moves the same
  way. Sharing the strings would couple two games' wording for three sentences;
  declined.
- **The plan loop, refusal opening, marks and single-firing driver** are
  already shared (`deduceHintPlan`, `commonHintRefusal`, `hint-mark.ts`,
  `singleFirings`), and Pearl uses them unchanged.

## Cost

`src/games/pearl/` runs in about 4 s, and the hint tests in under 4 s.
