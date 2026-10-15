# Design — add-numgame-ts-port

## Context

The other greenfield change (Path) and every port before it had a `struct
game` to follow. `numgame.c` is a standalone command-line solver for the
Countdown numbers game, and upstream "hasn't even started on writing a Puzzles
user interface". This change designs a game over that solver.

## D1 — The game is built (owner, 2026-10-15)

The scaffold asked whether a mental-arithmetic puzzle belongs in the
collection, and recommended "not now". The owner chose to build it, with
classic Countdown rules. The collection's goal is the app stores' puzzle
games (`docs/doctrine.md` § "The goal"), and target-number games (Countdown
apps, NYT's Digits, "Make 24") are among them.

## D2 — The rules: Countdown's numbers round

- Six numbers, each drawn without replacement from Countdown's cards: two each
  of 1 to 10 (the small numbers) and one each of 25, 50, 75 and 100 (the large
  numbers). The params choose how many are large, 0 to 4, as a contestant does.
- A target from 100 to 999.
- A move combines two numbers with `+`, `−`, `×` or `÷` into one. Every result
  is a positive whole number: a subtraction that would give zero or less, and a
  division with a remainder, are not moves. A number is used at most once, and
  the numbers need not all be used.
- The puzzle is solved when a number on the board equals the target exactly.
  (Countdown awards points for coming close; a puzzle has one goal.)

Upstream's `rules_countdown` allows a negative intermediate. Positive-only is
Countdown's own rule, and it makes no target unreachable that a negative would
reach: `x − (a − b)` with `a < b` is `x + (b − a)`, and a product or quotient
of two negatives is that of their opposites.

**One move, two taps of numbers and one of an operator, in either order.**
`−` and `÷` always take the smaller from or into the larger: the other order is
never a legal move, except `x ÷ x`, which is the same either way. The result
lands in the larger number's place (the lower place between equals). The
first version put it in the second-tapped number's place, as NYT's Digits
does; the hint review found that a player who followed a step tapping its two
numbers the other way round dropped the plan, and its next step read as a
restart. A place means nothing in this puzzle, so the order of the taps now
means nothing either, and "the smaller slides onto the larger" is as easy to
predict.

## D3 — The solver: values reachable from each subset

Every combination of `k` numbers takes exactly `k − 1` operations. So "the
fewest operations that make the target" is the smallest subset of the numbers
on the board whose reachable values include it, less one. The solver computes,
for each subset of the numbers (at most 63), the values made by using **all**
of it, from its splits into two smaller subsets, and keeps one derivation per
value (the first found, in a fixed order, so a plan is a function of the
board).

That is the C's search over the same rules, organized by subset rather than by
a breadth-first walk over multisets (`numgame.c` notes the BFS's path counts
overstate difficulty and never resolved it, D4). The C's `tree234`s become a
`Map` per subset. Nothing else is transcribed: the C's rationals, its
concatenation flag and its other rule sets serve variants this game does not
have.

**What stands in for an oracle** (the C cannot be run: `reference/README.md`).
The test suite holds the subset solver to a second, independent search, a
plain recursion over the multiset of numbers, on fixed and random boards: the
two agree on every reachable value and its fewest operations. Every derivation
the solver emits is replayed through the game's own `executeMove` and must
make the value it is filed under.

## D4 — Difficulty: the fewest operations the target needs

Three tiers, by the fewest operations that make the target: Easy two, Normal
three, Hard four or more. A one-operation target is never dealt.

This is the measure upstream's TODO circles: its path counts are inflated by
associativity and by tree-shaped calculations. The fewest operations is
neither, and it is a fact a player can check and the hint can state. It is
monotone in its cap, which `Game.difficulty` needs: a target made in two is
made within three. So `solveAtCap` answers "solved" where the target is made
within the tier's operations, "unsolved" where only more will do, and
"impossible" where it cannot be made.

Not taken on: how obvious an operation is, and how many ways a target has.
Both are refinements of a tier, and neither changes what the hint can say.

## D5 — The board

- **Six tiles**, two rows of three, in the desc's order (large numbers first,
  as Countdown lays out its cards). A combination empties the smaller
  number's place and puts the result in the larger's, so the board never
  reflows and no tile moves but the one combined.
- **A tile the player made says how**: its sum, small, under its value
  ("75 − 3"). The board then reads as the player's working.
- **The target** above the tiles; **the four operators** in a row below.
- **What a tap does.** A number selects it; the same number again deselects
  it; another number moves the selection while no operator is chosen; an
  operator chooses it (again, unchooses it). With a number and an operator
  chosen, the numbers that would not make a legal move are dimmed and a tap on
  one does nothing; a tap on any other makes the move. Every board change
  clears the selection.
- **Keyboard**: the arrows move a cursor over the six places, Enter and Space
  tap the one under it, `+ - * /` (and `x`) choose an operator, Escape clears
  the selection.
- **The secondary button means nothing** (`ignoresSecondaryButton`).
- **Animation**: the smaller number slides onto the larger.

## D6 — Solve, the mistake check, a lost position

- **Solve** plays a shortest line from the position on the board where one
  exists, and else from the dealt numbers.
- **No mistake check** (`notApplicable`): any combination that leaves the
  target reachable is fine, so there is no one answer to compare a move with.
- **A lost position** is one whose numbers can no longer make the target, and
  `hasNoSolution` says so with a `markedDeadEnd`. The proof is the solver's
  full enumeration, cheap at six numbers (measured in the tests).

## D7 — The hint

A Countdown move is never forced, so the hint is a search hint
(`docs/hints-search.md`), and the solver makes it exact: what it says is
proved, not measured.

- **A hint is one operation of a shortest line from the board on display**,
  and gives away nothing more of it (owner, 2026-10-15): "You can finish in 5
  more operations, starting 4 ways. One of them: 100 + 3 = 103." The count of
  operations is proved by the solver's whole search; the ways are the
  distinct boards a first combination leaves on a line that short, each
  judged by `judgeRivals`, so "only one first combination does it, so …" is said only
  where every other start was proved longer (owner, 2026-10-16: say there are
  several ways, or that there is one). The target is on the board, so the
  words do not repeat it. Of the line's combinations whose two numbers are on
  the board, the hint takes the one working on the biggest number.
- **Its potential is the fewest operations still needed**, which every hinted
  step lowers by exactly one, so asking again cannot cycle
  (`docs/hints-search.md` § "Recompute-stable plans").
- **Withdrawn: the whole line, told by its last operation's split** ("952
  needs at least 5 operations, ending with 927 + 25. First, …"), offered as
  one plan of steps. It gave the solution away, the owner found on playing it.
- **Marks**: the two numbers of a step are ringed, and its operator.

A number made by the player sits on the same ground as a dealt one, which
the first version did not do: a made number on the plain surface read as
disabled in the dark scheme (owner, 2026-10-15). Its sum beneath its value
tells it apart.

## D8 — Names, and where the game sits

- The id stays `numgame`, upstream's name for the file. It is in every shared
  link and save, so it is not changed lightly.
- The name a player sees is **Target**, with the aliases *Countdown*, *Numbers
  game* and *Digits*, which are what a player searches for. The family is
  "Numbers & letters".

## Findings: what building it cost (the baseline measurement)

Every question this build stopped to answer that was not about the puzzle,
kept as it happened (proposal § "Also: this is a baseline measurement").

Measured 2026-10-15, one session. The puzzle's own work (solver, generator,
rules, sentences) was the smaller part; these are the rest, most costly first.

1. **The scaffold has one skeleton, a grid solved by deduction.** For a game
   of moves on a board that is not a grid, every file of the copy was
   replaced, and the copied tests were deleted and rewritten. What the copy
   gave was its file names and its closing checklist. A second skeleton (moves
   and search, no grid) is the obvious engine candidate.
2. **A board that is not a grid is built by hand.** The layout, the hit
   test, a cursor over rows of different widths, and a cache keyed per element
   (two words for a value past 2^31) came to about 150 lines with no shared
   helper or exemplar. `squareGrid` and `HintMarks` serve a grid of cells only;
   the hint ring here is `drawMarkSides` called by each element.
3. **Three cross-game guards assumed that one input is one move.** A move
   here is three taps, two of which change only the selection, and the
   target-verb guard (Enter against a click), the keyboard-commit probe and the
   drag-cancel probe each found nothing to compare. Each was generalized in this
   change: the target-verb guard arms the move with the clicks that precede the
   committing one, the keyboard probe tries "pick, key, move, pick", and the
   drag-cancel probe puts a board in play with Solve where no single gesture
   moves it.
4. **The hint gesture is hand-written.** `verbClicks` needs every click to make
   a move the step keeps, so a gesture whose first taps only select cannot use
   it.
5. **`searchRefusal` enrolls a game in the "search can run out" ledger by
   being called.** An exhaustive search that cannot run out had to avoid the
   helper. The derivation reads "uses the shared outcome" as "has a reach".
6. **A tiered game that does not deduce gets a deduction's refusal.** Without
   `hasNoSolution`, an unreachable target would have been refused as needing
   "trial and error", the words the tier contract's load check has.
7. **The generated Controls paragraph said "around the grid"** for every
   game; it now says "around the board".
