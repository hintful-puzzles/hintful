# Design: add-pegs-hint

## D1. What was measured (task 0.1)

Positions were reached from every preset by 0–16 random jumps, eight seeds
each, and searched (2026-10-02, on the development machine under load ~15, so
read the milliseconds as upper bounds and the ratios as the result).

- **A plain depth-first search with a memo of lost positions is too weak.** At
  two million positions (about four seconds) it could not solve the *opening*
  position of 7×9 Cross, 9×9 Cross or 9×9 Random, and move ordering only
  changed which boards it got lucky on: one ordering solved a board in 1,000
  positions that another had not solved in 2,000,000. Restarts over a portfolio
  of orderings sharing the memo helped finding and did nothing for proving.
- **A beam search finds solutions.** Each level keeps the 300 most compact
  positions, counted as the sides of pegs that face no peg. It solved every
  preset's opening in at most ~100 ms, 9×9 Cross included, and across the 432
  measured positions **every solution any method found, the beam found** (300
  wide, or 3,000 as a second try). The depth-first search never found one the
  beam missed. So the beam finds and the depth-first search only proves loss.
- **Proving loss is where the reach ends.** Positions random play leaves on the
  33-hole and larger boards often need more than a million positions to prove
  lost. This is the honest `SEARCH_OUT_OF_REACH` the proposal anticipated.
- **"A peg nothing can ever reach"** (`PegsBoard.frozen`) is sound and cheap:
  let every peg stay put while new ones appear wherever two in a line could
  jump in, and a peg none of whose neighbors that closure reaches can never be
  jumped or jump. On positions reached by play it fires only late (the k=15–16
  rows), so it is a refusal and a per-step warning, not the hint's opener. As a
  prune inside the depth-first search it saved about 10%.
- **The rule of three never refuses a position reached by play.** Jumps
  preserve the position class and every start the generator deals is soluble,
  so a reached position's class always admits a finish. Argued from the code,
  not from a sample, so no power argument is owed.
- **Along hint paths** (the beam's own solution from three seeds per preset,
  1,000 steps in all): the hinted jump was *proved* the only jump that can
  still finish with one peg on 86 steps (each rival searched to exhaustion
  within 20,000 positions), some rival jump would leave a peg frozen on 88, and
  the same peg jumped again next on 87.

**Falsifier outcome:** two claims fire on roughly a tenth of steps each, which
is more than a handful but a minority. So the hint is a search with honest
refusals, narrating the consequence it can check, and the two claims where
they hold.

## D2. The solver (`solver.ts`)

`findFinish(state)`: beam 300, then beam 3,000, then the depth-first search
with the frozen-peg prune and a budget of 300,000 positions. It returns a
solution, a proof of loss, or out-of-reach. Every jump removes a peg, so a plan
recomputed after any move cannot cycle: the peg count is the potential, and
`hint-resume.test.ts`'s recompute walk has nothing to catch beyond reach.

The memo keys are exact (pegs packed sixteen to a character, or a number up to
48 holes), never a hash, because a collision would make the hint call a
soluble position lost.

## D3. Solve

`solve(orig, curr)` searches from `curr` first. If that position is lost or
out of reach, it searches from `orig`, the dealt board, which every generator
makes soluble and the beam solves at once. That keeps `SEARCH_OUT_OF_REACH`'s
advice ("take the answer from Show solution") true for Pegs. The move is
`{ type: "solve", finish }`, the grid index of the last peg: the solved board
is fully determined by it, as Flood's Solve snaps to the finished board. A
board no search finishes from says `NO_SOLUTION` if the depth-first search
proved it, else `PUZZLE_NOT_REASONABLE`, which only a typed game ID can reach.

## D4. The hint

Refusals, in order:

1. Pegs frozen (`frozen`) while more than one peg is left: a puzzle-specific
   sentence through `puzzleHintRefusal` saying how many are cut off, the one
   thing Pegs can prove at a glance and the thing to undo.
2. The search proved the position lost: `NO_SOLUTION_FROM_HERE`.
3. Out of reach: `SEARCH_OUT_OF_REACH`.

A plan is the found line of jumps, one step per jump, in the imperative house
(the move is recommended, not forced). The jumping peg and the hole it lands in
are ringed (kinds `PEG` and `HOLE`), and each step's sentence is chosen from
what was checked, in this order:

- **only**: every rival jump was searched to exhaustion and loses. The step
  says this is the only jump that can still leave one peg. Proofs share a
  budget per plan, so a plan never costs more than a bounded search however
  long it is, and a claim is made only where the proof finished.
- **strands**: some rival jump would leave a peg frozen. The step outlines that
  peg and says another jump would cut it off.
- **again**: the same peg jumped in the previous step. The step continues that
  peg's run (`continuesPrevious`), one journey for one peg's chain of jumps.
- **plain**: the jump, and how many pegs it leaves.

`hintKeepTrack` completes on the step's own jump and drops the plan on any
other. `hintGesture` drags the peg to the hole, through `interpretMove`'s own
press and release.

## D5. Rendering

The hint marks ride the per-tile cache as two more flags on the cached value: a
ring in `HINT_ACTION` around the ringed peg and hole, and one in
`HINT_EVIDENCE` around an outlined peg. Both sit in the margin outside the peg,
so they stay visible on the peg's own blue.
