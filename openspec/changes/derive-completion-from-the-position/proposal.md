# derive-completion-from-the-position

**Status: scaffolded, not started (2026-10-01).** Follows
`own-the-hint-refusals`, whose falsifier found three games whose status could
not see their own finished board. Read that change's `design.md` § "Task 0"
first.

## Why

**Every game hand-maintains a record of when it was won, and the record is
where the bugs are.** Measured 2026-10-01 at `971b0fa7`: every game directory
spells a `completed` (Guess: `solved`) field, read 206 times across 96 source
files. The flag is set by hand at each transition that can finish a board, and
each such transition is a place to forget:

- **`newState`**: almost every game starts `completed: false` without asking
  whether the board is finished. Fifteen, Sixteen and Netslide therefore call a
  game ID typed already sorted "ongoing" at move 0, which is why their hints
  still refuse "already solved" themselves, and why `ALREADY_SOLVED` is still a
  `HintRefusal` a game may return.
- **The solve move**: most games special-case it, three ways: `completed = true`
  (Range), `completed = check(next)` (Crossing, Rome, Seismic, Mathrax), or not
  at all. Map's was the third, so Show solution left a full board "ongoing" and
  a Hint after it threw (fixed in `own-the-hint-refusals`).
- **Every other move**: `if (!next.completed && check(next)) next.completed =
  true`, written out per game, sometimes once per move kind (Crossing writes it
  three times).

**And the collection answers a question that is not about any puzzle in two
ways.** Most games *latch* `completed` on a player move (once solved, solved,
until undo), as upstream does. Palisade and Separate *recompute* it every move,
so a board the player breaks reverts to unsolved: a divergence introduced by a
post-port tidy (`9da402c5`), not by any owner decision found in the record
(`add-palisade-ts-port`'s design latched). Flood and Same Game recompute too,
where it cannot matter, since their finished boards take no more moves.
`ts-engine`'s "One completion vocabulary across games" calls the choice "the
game's own business", and `flash.ts` records un-latching as "per-game work". By
AGENTS.md's test (can we say what a game would legitimately want to do
differently?), it is neither: whether a solved board that the player then
breaks still counts as solved is a rule of the app, not of Palisade.

**The engine already holds the history half, twice over.** The midend keeps its
own `cheated` (for "solved with help" and the save envelope) and latches the
timer on the first solved status, while each game keeps a second `cheated` and
a second latch in its state. So the shape that suggests itself is not new
machinery but deleting the copy.

## The shape

**A game says what a position is; the engine says what happened.**

- `Game.status(state)` becomes a **pure function of the position**: is this
  board won, lost, or neither, judged from the board alone, never from how it
  was reached. A typed sorted Fifteen is solved at move 0 because its tiles are
  in order, and a solve move completes a board because the board it leaves is
  complete. No game stores `completed` or `cheated`.
- The **midend** evaluates `status` once per history entry (cached beside it,
  so an expensive check costs what the per-move flag costs today) and derives
  everything else from the history it already owns: the latch, the move the
  board was first solved at, whether the solver was used and on which move, the
  win flash's trigger, and the status bar's completion words
  (`completionStatus`, today called by each game).
- Every consumer reads the engine's derivation: the hint's and Solve's
  refusals, the end-of-game dialog, the timer, the flash, the status bar.

What stays the game's is what is about the puzzle: what a won and a lost
position look like, which moves a finished board still accepts (no fill is
legal on a flooded Flood board, which is Flood's rule), a flash duration that
sweeps its own board, and a status-bar phrase of its own ("Solved in 4
guesses").

**What it buys:** the newState and solve-move omissions become impossible
rather than guarded; `ALREADY_SOLVED` leaves `HintRefusal`, so the finished-board
refusal is the engine's outright; Fifteen's, Sixteen's and Netslide's own checks
and Slide's `-1` sentinel go; `winFlash`'s exceptions shrink to the ones that
are about a board (more than one flashing outcome is two status transitions the
engine can already see); and a new game writes one predicate where it now
writes a flag, a latch, a solve-move special case, a flash condition and a
status prefix.

## Decision for the owner (before implementing)

**What does a board show once the player breaks a solved position?** The
engine can hold two facts, *solved now* (the predicate) and *first solved at
move k* (the history), and each consumer picks. The recommendation:

- the hint's and Solve's refusals read **solved now**, so "already solved" is
  never said of a board that visibly is not;
- the timer, the end-of-game dialog and the flash read **first solved**, so a
  board is celebrated and timed once, as today;
- the status bar's `COMPLETED!` reads **solved now** (the alternative, latched,
  is upstream's).

Undo before move k un-solves it either way, as today. This changes what the
latching games show after a solved board is broken, which is why it is asked
rather than decided.

## Task 0

Re-take, by shape and not by the name `completed`:

1. every write of a completion flag, classified as newState, solve move, or
   other move, and latched or recomputed;
2. every read of one outside `status`, `flashLength` and `statusbarText`
   (`interpretMove` guards, `redraw`, hints), each to be answered from the
   predicate or from an engine-supplied fact;
3. every `flashLength` and the `winFlash` exception list in `flash.ts`, sorted
   into "a status transition the engine sees" and "about the board";
4. every status-bar prefix that is not `completionStatus` (Fifteen's "Moves
   since auto-solve", Guess's "Solved in N guesses"), each to be an engine fact
   or the game's phrase.

**Falsifier:** a game whose won or lost cannot be judged from the position
alone, because the record of how it was reached is part of the rules. List each;
if they are more than a couple, the predicate needs a history argument and the
shape above is wrong. Candidates to check first: Mines (laid out by the first
click, which `supersededDesc` already makes part of the position), Guess (a
revealed answer, which a Solve move puts in the state), Inertia (a dead ball
that upstream deliberately never reports as lost), Black Box (the reveal).

## Phases

1. The midend caches `status` per history entry and derives the latch, the
   first-solved move, the solver-used move and the flash trigger; refusals,
   timer and end dialog read them. `status` keeps its signature.
2. Games migrate one at a time: `status` from the board, `completed` and
   `cheated` out of the state, solve-move special cases and flash conditions
   out of `executeMove` and `flashLength`. A guard derives the migrated
   population (no completion field in the state type) and asserts `status` is a
   function of the position by replaying each board's moves and asking it of a
   state rebuilt from the same position.
3. The status bar's completion words become the engine's; `ALREADY_SOLVED`
   leaves `HintRefusal`; "One completion vocabulary across games" is replaced.

Save formats are untouched: the state is rebuilt by replaying moves and is
never serialized, and the save envelope's own `cheated` key stays (the
requirement above says why).

## Hints to pull in

**Mines**, from `hintless-games-in-reserve`. It presses on every half of this:
a won and a lost outcome, a loss the player can undo, a board laid out by its
first move, and a hint that must refuse on a dead board in words the engine now
owns.
