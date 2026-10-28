# Solver & Generator Guide

How a game's deduction engine, difficulty tiers, generator, `solve()` and
`findMistakes` fit together. The normative statements are in the specs:
[`engine-difficulty`](../openspec/specs/engine-difficulty/spec.md)
("Narratable-deduction generation policy", "A difficulty-capped solver is
monotone in its cap at every tier", "A difficulty tier binds the board it
generates", "An unbindable tier is refused, not silently downgraded"),
[`engine-hints`](../openspec/specs/engine-hints/spec.md) ("A hint step always
names a technique, with no un-narrated fallback") and
[`engine-helpers`](../openspec/specs/engine-helpers/spec.md). The hint's own
side is [hints.md](./hints.md), the tests are [testing.md](./testing.md), and
each shared helper named here has an entry in
[engine-catalog.md](./engine-catalog.md).

## What every game does

In this order, each step as the skeleton
([`src/skeleton/grid/`](../src/skeleton/grid/)) already does it:

1. **Write the deductions once, as a ladder.** `solver.ts` builds an array of
   `DeductionTechnique`s, each with an `id`, a `tier` and a `run`, easiest
   first. `runDeductionFixpoint` runs it to a fixpoint for the generator, Solve
   and the mistake check, and `singleFirings` runs the same rungs one firing at
   a time for the hint. See § "One engine, two projections" and § "The
   deduction fixpoint".
2. **Return a `DifficultyVerdict` from the capped solve**, and declare
   `Game.difficulty` in `index.ts` with a `solveAtCap` that builds a fresh
   state and calls it. See § "The difficulty contract".
3. **Deal under a `retryLimit` guard given a label and no count.**
   `generator.ts` draws a board, strips it while the ladder still finishes it
   at the tier asked, and keeps it only where `solvableAtExactlyTier` passes.
   See § "Every retry loop is bounded", § "A tier means exactly its rung" and
   § "Solver-gated generation".
4. **Derive the answer from the clues in `solve`**, and return a
   `SolveFailure` where the solver does not reach one. See § "Solve and the
   generator's aux".
5. **Compare the board with that answer in `findMistakes`**, through
   `entryMistakes`, and return `[]` where there is no answer. See § "The
   solvable-game contract".
6. **Pin the deal and the ladder in `<game>-generation.test.ts`** with
   `describeDealtTiers` and `describeLadderCensus`. See § "Proving an
   adoption: the fixtures are not enough" and § "A size that cannot carry a
   tier".

## Sections

| Section | Read it when |
| --- | --- |
| One engine, two projections | you are about to write a solver, a generator or a hint for a logic game |
| The deduction fixpoint | your solver applies techniques until none fires |
| – A fixpoint is order-independent only if every rule is monotone | a board's grade changes with the order its parts are listed or visited in |
| – Proving an adoption: the fixtures are not enough | you add, split, move or re-tier a rung, or move a solver onto the runner |
| – What the runner does not carry: the record | you want a technique to carry its own narration, or propose splitting one into find, apply and narrate |
| – Where the fixpoint does not fit | your solver's loop looks unlike the runner's and you are deciding whether to hand-roll it |
| Guess-free generation | your game has difficulty tiers, or you are deciding whether a board may need trial and error |
| – No option switches the generator's checks off | upstream has a checkbox or a tier that deals unchecked boards, or you write what `loadDesc` accepts |
| – The lowest tier asks the hint as well as the solver | the hint stops on a board the generator dealt at the lowest tier |
| – Giving a deductive game an Unreasonable tier | your game is to deal boards with one answer that its deductions do not reach |
| – What the search needs of the game's deduction | you write `deduce` and `assume` for `searchAnswers`, or size its budget |
| – What an Unreasonable deal draws and strips | you write `draw`, `strip` and `deduced` for `dealUnreasonable` |
| – Sizing and bounding an Unreasonable tier | you decide which sizes and options carry an Unreasonable tier, or what its menu offers |
| – A shallow search is a rule the solver lacks | an Unreasonable board needs only a few positions of search |
| – A middle tier below Unreasonable | a search-tier game has a deduction that is a step of its own for a player |
| – Check, Tactic, Search | you add or move a rung that tries a value, follows a chain or searches |
| – No un-narrated fallback | the generator accepts a board on a deduction the hint cannot name |
| – Strengthening a solver instead of shipping guesswork | a shipped tier turns out to need guessing |
| Difficulty tiers | your game offers more than one difficulty |
| – The difficulty contract | you write `Game.difficulty` and its `solveAtCap` |
| – A tier means exactly its rung | your generator decides whether a board belongs to the tier asked for |
| – A size that cannot carry a tier | a size or option has no board of a tier, or only rare ones |
| – Measuring whether a size has a tier | you are about to write, check or remove a refusal of a tier at a size |
| – A capped solver must be monotone in its cap | a board that solves at a low cap fails at a higher one |
| Divergence and what it costs | a fix or an improvement would change which boards a seed deals, or you meet an upstream quirk |
| Generators | you write or change `newDesc` |
| – Every retry loop is bounded | your generator has a loop that draws from the RNG until something works |
| – Unlucky, impossible, and load-bearing validation | a generator fails on some params, or `validateParams` does more than check bounds |
| – A draw that fails often is mended, not retried | most of a generator's tries are thrown away, and more so as the board grows |
| – A division into regions is the engine's | your board is divided into regions, of one size or of several |
| – Bound a generator by its tail, not its median | you pick the sizes of a preset menu, or set a memory bound |
| – A Custom size is not refused for its wait | a large or rare Custom size deals slowly, or not at all, and you are about to refuse it |
| – Solver-gated generation | your generator keeps or strips clues by running the solver, or you refactor such a solver |
| – A divergence retires or re-founds its fixture | a fix moves boards a frozen differential recorded |
| – Recover emergent parameters from the fixtures | you replace a generator whose output had a shape the code does not state |
| – Reuse the solver's pruning, not just its propagation | a constructive generator built on the solver backtracks heavily |
| Solve and the generator's aux | you write `solve`, or it wants the generator's `aux` |
| findMistakes | your game has an answer a player's board can disagree with |
| – The solvable-game contract | your game has one answer and you decide whether it ships `findMistakes` |
| – One answer, even when it is hidden | your game hides its answer, has no mistake check, or loads a pasted board |
| – Marks are checked like entries | the player pencils candidates into cells |
| – Edge games flag set edges only | the player draws walls or edges |
| – Live rule errors and the re-solve are both | the game already draws rule errors as the player works |
| – Self-validating games run their rule checker | the win check is a validity pass over the grid |
| The Latin family | your game is on a Latin square and imports `engine/latin.ts` |

## One engine, two projections

**Give a logic game one deduction engine and consume it twice: the generator
and grader run it with the recorder off, and the hint runs the same rungs
with the recorder on.** The techniques that decide which boards exist are
then the techniques the hint narrates, so no board is accepted on a technique
the hint cannot explain. `solve()` and `findMistakes` reuse the same solver
and do not grow a second opinion.

The engine gives `runDeductionFixpoint` and `singleFirings` in
[`engine/deduction-fixpoint.ts`](../src/engine/deduction-fixpoint.ts). Read
[`skeleton/grid/solver.ts`](../src/skeleton/grid/solver.ts): `solveSkeleton`
is the first projection and `skeletonRecordingPass` the second, over one
`ladder`.

## The deduction fixpoint

**Build a logic game's solver and hint loop on `runDeductionFixpoint`
([`engine/deduction-fixpoint.ts`](../src/engine/deduction-fixpoint.ts)) and
do not hand-roll it.** The loop is an ordered ladder of techniques, easiest
first. It restarts from the top the moment a technique fires, so one firing
is one hint group, and stops when nothing fires or the ladder has settled.
What the runner owns:

- **The technique contract.** A technique is `{ id, tier, run }`: a stable
  name, the difficulty tier it belongs to, and a `run` that applies it once
  and returns `> 0` (fired), `0` (nothing to do) or `< 0` (contradiction
  proved). Both `id` and `tier` are required.
- **The grade**: the highest `tier` that fired, never a position in the
  array. Several techniques may share a tier.
- **The `maxTier` cap.** It excludes by tier wherever the technique sits, so
  a ladder whose tiers do not increase along the array is legal. Pass it
  while grading, so a tier does not pay for techniques it cannot use.
- **The recording-path step budget.** Pass a
  [`stepBudget`](../src/engine/step-budget.ts) on the hint call and omit it
  on the generator call. A technique that reports progress without changing
  the board then fails loud on the hint path, and the thrown error names the
  techniques by firing count, most-fired first.
- **The `settled` early-out**: "there is nothing left for the ladder to do",
  which is broader than "solved". It may stop on a contradiction, on a
  complete-or-invalid board, or on a tier's own action budget.
- **The `beforeTechnique` hook**, which `latinSolverTop` uses to give one
  firing's records a shared `group`.
- **The `firings` tally**, an optional sink that counts each rung's firings
  for a census. Forward one optional parameter to it; do not wrap the ladder
  in a closure to observe firings.

**A technique that is only sometimes available guards itself in `run` and
returns `0`.** The runner has no `when` predicate and takes none: it would
be indistinguishable from returning `0`.

Every call site is `git grep -l runDeductionFixpoint src`. The ones to read
for a ladder that is not the plain shape:

| Read this for | Where |
| --- | --- |
| the plain ladder: several techniques sharing tiers, one `maxTier` | [`unruly/solver.ts`](../src/games/unruly/solver.ts) `solveGame` |
| an untiered ladder: every technique on tier 0, the grade unused | [`filling/solver.ts`](../src/games/filling/solver.ts) `FillingSolver.run` |
| a ladder built per difficulty level, so `tier` is the level | [`engine/latin.ts`](../src/engine/latin.ts) `latinSolverTop` |
| a verdict richer than a boolean, carried out through `settled` | [`clusters/solver.ts`](../src/games/clusters/solver.ts) `solveGame` |
| a pre-pass at the top of each iteration, as a non-firing technique in position 0, and a flag mapped onto the `-1` arm | [`singles/solver.ts`](../src/games/singles/solver.ts) `solveSpecific` |
| a ladder that is not a tier prefix, a clamped cap, and a cost accumulated across firings through `settled` | [`spokes/solver.ts`](../src/games/spokes/solver.ts) `spokesSolve` |
| a rung that runs at one tier and not at the tier above, so it guards itself | [`ascent/solver.ts`](../src/games/ascent/solver.ts) `ascentLadder` |
| a rung that sweeps a whole population before reporting, which is legal: the restart after a firing is the ladder's, not the rung's | [`bridges/solver.ts`](../src/games/bridges/solver.ts) `Solver.ladder` |
| a rung that exists only for the player's notation and touches nothing the generator reads | [`separate/solver.ts`](../src/games/separate/solver.ts) `separateLadder` |
| two grades with a cap each, so the runner's grade and `maxTier` go unused | [`solo/solver.ts`](../src/games/solo/solver.ts) `SolverUsage.ladder` |
| a hint-only recording ladder | [`pattern/solver.ts`](../src/games/pattern/solver.ts) |

### A fixpoint is order-independent only if every rule is monotone

**Make every rule monotone: a rule that fires on a position still fires, or
has nothing left to say, on every position with more decided.** One rule
that stops applying as the board fills lets two visiting orders end in
different places, and the grade then depends on how the state was built: a
board is dealt at one tier and solves at another once loaded.

- **Read the rule's slack as the board fills.** If a move the player or the
  solver makes can raise it, the rule is not monotone.
- **Test with a shuffle**: rebuild a board with its population listed in
  another order and compare the verdict at every cap. Pin the boards that
  split as descs. A census over dealt boards cannot be the guard alone, since
  the defect may show on a few boards in a hundred.

Exemplar: `bridges.test.ts`, "the grade does not depend on island order".

### Proving an adoption: the fixtures are not enough

**Prove a ladder by a census of which rungs fire, and plant a defect in each
upper-tier rung before trusting the corpus.** A byte-match differential
certifies only the rungs it fires and cannot say which those are: a rung that
fires on no recorded board can be deleted with every test green.

The engine gives `describeLadderCensus`
([`engine/testing/ladder-census.ts`](../src/engine/testing/ladder-census.ts)),
which walks a corpus at every cap and asserts which rungs fired, and reads
the runner's `firings` tally through one optional parameter of the game's
solve. Exemplar:
[`skeleton-generation.test.ts`](../src/skeleton/grid/skeleton-generation.test.ts).

- **While moving a solver onto the runner, compare against the loop being
  replaced.** The two agree on verdict, grade and full board state, at every
  cap, over a corpus the census shows reaches every rung. Then delete the old
  loop in the same change.
- **Record a rung the corpus cannot reach with its reason**, in the census's
  `unreached`, and check it against the C first: an unreachable deduction is
  the shape a porting bug takes. An `unreached` entry may be structural, a
  rung foreclosed by the one beneath it; then say so
  ([`magnets-ladder.test.ts`](../src/games/magnets/magnets-ladder.test.ts)).
- **A census cannot see a mis-tiered or reordered rung**, because the rung
  still fires. A frozen differential can. A game with no differential has
  only the census, so plant a mis-tier before relying on it.
- **Size the corpus by planting, once per upper-tier rung.** A mis-tiered
  rung shows only at a cap that excludes it, on a board where it is the first
  rung of its tier to fire after the lower tier stalls. Only a plant says the
  corpus holds such a board.
- **On a ladder whose every rung only removes candidates, the census is the
  half that bites.** The corpus is dealt by a generator gated on the solver
  under test, so a plant that weakens a rung changes the corpus along with
  the verdicts, and the board comparison stays green
  ([`abcd-ladder.test.ts`](../src/games/abcd/abcd-ladder.test.ts)).
- **A rung's firing count says it runs, not that anything depends on it.**
  To find whether a board depends on a rung, solve with the rung silenced and
  see whether the board still finishes
  ([`tents-ladder.test.ts`](../src/games/tents/tents-ladder.test.ts)).
- **Give a Tricky deduction its own rung where upstream folds it into an
  Easy sweep**, with a Tricky `tier`, so a census can say whether it is
  reached. Have the split rung write only what the Tricky half deduces. On a
  ladder of sound, monotone rungs this changes when the deduction runs and
  not what the ladder concludes; the board comparison at every cap proves it.

### What the runner does not carry: the record

**Thread the game's own recorder through its rungs; the runner carries the
loop and not the record.** A technique's `run` returns a number and the
runner does not know what the firing recorded.

**Do not split a technique into `find`, `apply` and `narrate`** to make an
un-narrated firing fail to compile. Narration splits below the rung: one rung
may hold several local rules, each a premise the hint returns on separately
([`hints.md`](./hints.md) § "A rung is not a premise, so return per
premise"), so the split would either break a rung into several techniques,
changing what a tier means, or leave the per-premise return where it is.
Grade the premises together and narrate them apart. `hint-resume.test.ts`
already walks each game's hints to a solved board on every preset, so a
firing nothing can narrate fails that walk; a proposal for the split says
what it buys beyond it.

### Where the fixpoint does not fit

**Hand-roll a solver loop only when you can name a promise the runner makes
that the game must break.** A reason that describes a loop's syntax ("drains
a queue", "three-valued early-out", "grades by a constant") is not one. A
cost accumulated across firings, a flag standing in for a `-1` return, a
pre-pass at the top of each iteration, a verdict richer than a boolean, and
a sweep of the whole ladder before restarting have each adopted, because a
technique can hold state and guard itself; the table under § "The deduction
fixpoint" names where for the first four, and the last is
[`abcd/solver.ts`](../src/games/abcd/solver.ts).

The solvers that break a promise, which
[`engine/deduction-fixpoint.ts`](../src/engine/deduction-fixpoint.ts)'s
header also lists:

| Game | The promise it breaks |
| --- | --- |
| Loopy | *A pass attempts every technique at or below the cap.* Each firing reports the cheapest rung that could use the new information, and the next pass skips the techniques below it. |
| Lightup | *Return after first firing.* Its two techniques are interleaved per cell inside one grid scan whose order decides which boards exist, and the pass sweeps the whole grid before restarting. |

- **Re-derive a recorded no-go when the runner's contract changes.** Read the
  loop, not the reason somebody recorded for it, and when a `continue` looks
  as if it decides the walk, check whether anything can reach it.
- **A no-go has dissolved when the adoption needs no new option on the
  runner and the game's byte-match differential passes untouched.**
- **Do not move one of the two onto the runner to tidy the tree.** A refactor
  that changes a solver verdict changes which boards exist
  (§ "Solver-gated generation").

#### What a bespoke loop still owes

A bespoke loop meets three obligations, stated for the game and not assumed
(`engine-helpers`, "A bespoke loop carries three obligations"):

- **Narratability survives**: every accepted board is walkable to completion
  by a hint that runs the solver's own rungs with a recorder.
- **Grading stays honest**: tiers bind to real technique differences, and
  generation is capped at the requested tier.
- **Budgets apply**: the recording path ticks a `stepBudget`, so
  non-termination fails loud.

Exemplars: `nextFiring` in Loopy's hint, and `solveSub` and `deduceHintPlan`
in Lightup's solver.

## Guess-free generation

**Every difficulty tier a logic puzzle ships is solvable by its deductive
solver with zero guessing, enforced when the board is generated.** A board is
accepted only if the deductive solver, with no recursion or backtracking,
solves it uniquely (`engine-difficulty`, "Narratable-deduction generation
policy"). A hint that falls back on the known solution or a search reveals an
answer and teaches no reason, so guess-freedom is a rule of generation and
not only of the hint.

- **The one exception is a tier named "Unreasonable".** An Unreasonable
  preset may need guess-and-backtrack, and its hint may refuse on those
  boards. No other tier name may need guessing.
- **Movement and objective games are outside the rule.** A sliding puzzle, a
  flood or an untangling is always solvable and has no deductive "why"; its
  hint is heuristic by design (`hints-search.md` § "What every game
  does"). A narrated objective with a solution fallback is the sanctioned
  non-deductive form.

Exemplars: [`range/solver.ts`](../src/games/range/solver.ts) keeps a board
only if it is uniquely solvable without guessing, and
[`unequal/generator.ts`](../src/games/unequal/generator.ts) caps assembly
below the recursive level.

### No option switches the generator's checks off

**Carry no option and no tier that deals an unchecked board: the generator
always applies its checks, every tier's boards have one answer, and no board
may be unsolvable.** Where upstream has a checkbox ("Ensure solubility",
"Ensure unique solution", "Allow unsoluble") or a tier ("Ambiguous") that
skips the checks, the port drops it and the params codec reads past the
letter upstream writes for it, so an ID that asks for an unchecked board
deals a checked one. A board with several answers has no mistake check
(§ "One answer, even when it is hidden"), and most boards dealt unchecked
have several.

**Loading holds a board to the same promise.** `loadDesc` refuses a board the
game's own solver cannot solve:

- **A tiered game is asked through its difficulty contract**, and the board
  loads when some cap solves it, whatever tier its ID states. Unreasonable is
  a cap like any other. A board no cap solves is refused with
  `DESC_NO_SINGLE_ANSWER` where the game has that tier and with
  `DESC_NOT_DEDUCIBLE` where it does not
  ([`engine/desc-error.ts`](../src/engine/desc-error.ts)).
- **An untiered game answers `Game.finishesByDeduction(state)`**, and
  `registerGame` throws for one that leaves it out. Where nothing is deduced
  (a sliding puzzle, a search, a guessing game) the answer is
  `nothingToDeduce` ([`engine/hint-finishes.ts`](../src/engine/hint-finishes.ts)),
  and `untiered-load.test.ts` holds that to the game's code: it is given
  exactly by the games whose hint cannot end in `DEDUCTION_EXHAUSTED`.
- **A game that deduces and has no tiers answers with `hintFinishes`, never
  a walk of its own.** A hint has no step to give on a won board, and a walk
  that reads that refusal as deduction run out refuses the ID and the save of
  a board with nothing left to do. This is for a game whose answer is hidden,
  where no search can prove a board the deductions stop on has one answer
  (exemplar: Mines). Any other deductive game has tiers, at the least Easy
  and Unreasonable (§ "Giving a deductive game an Unreasonable tier").

A desc upstream's generator wrote that fails these checks is refused, and
`upstream-descs.test.ts` holds the fixtures that are.

### The lowest tier asks the hint as well as the solver

**At a deductive game's lowest tier, accept a board only where the hint,
played from the opening a whole plan at a time, ends on a solved board.** A
solver can settle a board its hint cannot, and a hint can finish one its
solver stops on, and the hint is what the player meets. The engine gives
`hintFinishes` ([`engine/hint-finishes.ts`](../src/engine/hint-finishes.ts));
a game may walk its own hint engine instead. The walk reads the hint's
refusals, so a hint that meets a board it cannot finish returns a refusal and
does not throw. Exemplars: `finishes` in Net's generator and `rungsFinish` in
Rectangles'.

- **Close the gap in the engine first**: one deduction engine, so the hint
  knows what the solver does (§ "One engine, two projections"). A board with
  one answer that the hint does not finish belongs to Unreasonable.
- **Before a tier asks the hint, deal thousands of boards and ask it of
  each.** The new check turns away boards the generator used to deal, and a
  player may hold one. A gap of one board in several hundred does not show in
  a sample of several hundred ([`method.md`](./method.md), on a census that
  finds zero).
- **Find the gap by tracing.** Log every elimination the solver makes, then
  ask the hint's engine, at the state where it stalled, whether it still
  holds what the solver just dropped. The first disagreement is the missing
  deduction.
- **Where the solver's own rule stops firing as the player fills squares,
  the hint keeps the solver's run from the clues.** This is for a hint that
  replans from the board at every step over a technique that is not monotone
  and cannot be made so. Find it by the same trace turned round: log every
  fill the solver makes from the clues, and take the first that the solver,
  restarted from the stalled board, no longer makes. When replanning finds
  nothing, the plan takes the next fill of the run from the clues whose
  square is still empty, and reads its evidence again from the board it is
  shown on. Every earlier fill is on the board, so the step is as true there,
  the plan finishes every mistake-free position, and the generator can go on
  asking the solver alone. A rule the hint never had is still a missing rung.
  Exemplar: `deduceHintPlan` in
  [`filling/solver.ts`](../src/games/filling/solver.ts).

### Giving a deductive game an Unreasonable tier

**To deal boards with one answer that the deductions do not reach, write
three things for [`engine/answer-search.ts`](../src/engine/answer-search.ts):
the deduction with a verdict, what to assume where it stops, and what the
deal draws.** The loop, its bound, the contract and the caching are the
engine's. Copy [`pattern/`](../src/games/pattern/). A player meets "trial and
error" only on a tier with that name.

- **`searchAnswers` counts answers to two**, by trial and error over the
  game's own deduction. Its verdicts are one answer, several, none, and out
  of reach once a budget of positions is spent. The game gives it `deduce`,
  which says `solved`, `stuck` or `contradiction` of a position, and
  `assume`, which divides a stuck position by one undecided thing.
- **`dealUnreasonable` keeps a board only where the deduction stops short
  and the search says one.** The game writes no loop for the tier. It gives
  `draw`, optionally `strip`, `deduced` and `answer` (§ "What an Unreasonable
  deal draws and strips").
- **`searchTierContract` is the difficulty contract.** The lower cap is the
  game's deduction finishing the board and its hint finishing it too
  (`hintFinishes`); the upper cap is "the search says one". The game has no
  `finishesByDeduction`, which is an untiered game's.
- **Solve and the mistake check take the answer from the search**, at either
  tier, cached on the board's shared part with `answerCache`.
  `solveFromAnswer` says `MULTIPLE_SOLUTIONS` or `NO_SOLUTION` where the
  search proved it, which is what refuses such a board at load. The cache is
  keyed on something every state of a game holds by reference, so a game
  whose moves clone every array shares the part no move changes.
- **The hint does not change.** It already ends in `DEDUCTION_EXHAUSTED`
  where nothing follows, and the midend lets that through on a tier named
  Unreasonable.
- **The params take `searchTierItem` and the codec `searchTierSegment`**, so
  the tier is always in the full form and never in the shared one, and a
  string from before the tiers reads as Easy.
- **When the game leaves the untiered ledger in `untiered-load.test.ts`,
  read its board there before deleting it**: it may have no answer at all,
  and then it is a different test's board.

### What the search needs of the game's deduction

**Before anything is measured, make the deduction able to say "impossible"
of a position, and check the search against an answer count that has no
search in it.** A search finds a wrong assumption only as a contradiction. A
deduction that reports "no change" on a position nothing fits is harmless
while every board is consistent and wrong under a hypothesis.

Writing the verdict:

- **Give the deduction the verdict first, and plant its absence to see the
  tests notice.** A solver that already says "impossible" needs none written:
  its three results are the search's. The game's live error check may be the
  verdict, where it already condemns a board with squares undecided.
- **Ask the deduction's own "solved" before asking what is open.** An Easy
  board takes exactly one position; where it takes more, the verdict
  disagrees with the solver.
- **Say "impossible" as early as it is true.** A verdict that waits until
  every square of a block is decided is right and slow.
- **A solver that is sound from an empty board may not be from a position.**
  Upstream's solvers were only ever run from the opening. Run the agreement
  test, against the counter with no search in it, on the tier's own boards
  before measuring anything, and fix the fault in the deduction, not in the
  search.
- **A solver's final verdict may forget what its loop found**, such as a
  loop that breaks off on an uncoverable square and then recomputes its
  answer from counts. The search reads the break itself.
- **Write only what can still be impossible.** Where the solver's rungs keep
  an invariant, the verdict need not test it again.
- **Keep an arm the solver's own verdict needs, and delete one only the
  search reads when planting it out changes nothing.** `assume` already
  divides a square with no candidate left into no positions. Test a verdict
  the solver keeps on the solver, since no test of the search can see it.

Pinning it:

- **Pin each part of the verdict by a position count on a fixed, literal
  board.** A part that only prunes changes no answer, so no test of answers
  sees it; it changes how many positions a board takes, which decides which
  boards are dealt. The generator's own boards move with the verdict, so
  plant each part out against literal boards and keep one board per part with
  its exact count. Where planting changes no count, count dealt boards both
  ways to find one that differs, and pin that.
- **Check a board written by hand against the counter** before a test rests
  on what it is supposed to show.
- **The counter shares nothing with the deduction or the search.** It is what
  says the two agree a board has one answer.

The budget and the order:

- **The search budget decides which boards exist.** A board that needs more
  is thrown away when dealing and refused when pasted. Size it from the
  positions dealt boards need, and say where it is defined that lowering it
  refuses boards in saved games.
- **The order `assume` gives its positions in is part of the budget.** A
  position is counted when it is tried, so trying the likelier assumption
  first keeps a board inside the budget, and changing the order changes which
  boards a pasted ID is refused for. Which thing is assumed moves the count
  of a board with one answer; the order of its branches does not, since
  proving one answer visits them all. Plant out both and pin the one that
  moves.
- **Start each position's deduction from the assumed thing** where the
  deduction can, and not from scratch: a position is one assumption on from a
  stop.

### What an Unreasonable deal draws and strips

**Start `draw` from what the Easy generator already makes, and measure which
start and which strip suit the game before copying another game's.**
`dealUnreasonable` takes four things:

- **`draw`**: a candidate, or `null` where this try gave none.
- **`strip`**, where the board shows something a player could do without.
  Take it away a thing at a time (a clue, a given, the order of two letters),
  asking the `one` the engine hands over after each and putting back what it
  refuses. The engine asks within `DEALING_BUDGET` and hands the strip only a
  board that already passes. Left out, a candidate is kept or thrown away as
  drawn.
- **`deduced`**: whether the solver finishes the board. Add the hint only
  where it finishes boards the solver does not: asking it of every candidate
  costs a whole replay on each.
- **`answer`**: the game's `searchAnswers`, with the budget passed through.

Which shape a game is, is the game's to measure:

- **A board kept as drawn.** Where the Easy generator steers its clues so
  that the solver can finish, the tier is the same draw unsteered, kept where
  it is stuck with one answer.
- **A strip.** A generator that strips clues is one strip with two questions:
  the solver solves at Easy, the search proves one answer within the hiding
  budget at Unreasonable. Whether to strip a full board by the search or to
  strip an Easy board further differs by game in three ways, so measure each:
  how long a deal takes, how many squares the hint is left unable to decide,
  and which boards the strip can reach at the smallest sizes. Where the strip
  keeps a symmetry, strip further by the same pairs.
- **A swap, where there is nothing to strip.** Swap two things inside a dealt
  region while the search still proves one answer within the budget, so the
  dealt answer stays an answer as a strip keeps the dealt clues true.
- **A repair.** A generator that mends a board toward one answer does it
  inside `draw`, with `DEALING_BUDGET` for its own searches, and asks the
  search after each round: a board being repaired toward Easy passes the tier
  on its way. Look for the loop that already moves a board toward one answer
  before writing a new one.

Rules for all four:

- **A step that strips runs the board to the search's limit, so it takes a
  budget of its own.** Asked at the full budget, every stripped board comes
  out at the edge of it. `DEALING_BUDGET` is that smaller budget.
- **The hiding budget is the tier's difficulty.** It is where the boards stop
  being a missing rule. On a new game's boards, count what a Check
  (§ "Check, Tactic, Search") finishes at the engine's number before trusting
  it.
- **Run the whole strip.** Stopping at the first step that stops the solver
  deals a missing rule: one look settles far more of those boards. Count what
  a Check finishes at each stopping rule, on 150 boards and not 30.
- **Grade by the hint where the hint knows more than the solver.** A board
  the hint finishes needs no trial and error whatever the solver says, so
  Easy is "the hint finishes it and it has one answer" and an Unreasonable
  deal is one the hint does not finish.
- **A deal that asks the hint asks it from where the solver stopped**, with
  what the solver settled locked first. That is sound the one way a deal
  needs: more facts never rule out less, so a board the hint stops on from
  there it stops on from the start.
- **After a deduction is strengthened, time the largest board again.** The
  first clue whose loss stops the deduction is further down the list, so an
  early stop is rarer.

### Sizing and bounding an Unreasonable tier

**Give the tier its own measurements at every size and option; it does not
inherit Easy's bounds, and a sample of deals refuses nothing.** The rules of
§ "A size that cannot carry a tier" hold here: a size the generator seldom
reaches runs out at the deal's deadline, and a refusal says no board exists.

What to count:

- **How many stuck boards have one answer.** Most have several. The rate
  says whether the tier is worth dealing at a size.
- **The time of a deal at the sizes past the menu.** A draw that fails costs
  up to the whole budget, and the share of draws that fail grows with the
  board.
- **How much of a board the hint will do**, in squares left undecided, at the
  smallest and largest sizes. A player choosing the tier is owed the
  difference.
- **Every shape, not one axis.** What limits an Easy deal is how seldom the
  ladder finishes a fill; what limits an Unreasonable one is the search's
  cost and the share of stuck boards with several answers, so the Easy
  bound's exceptions may reverse. Sweep the shorter side as well as the area,
  every width and not every other one, and the fields beside the size. A thin
  board can cost more than a square one of its area.
- **Easy again.** Measuring the new bound re-measures the old one on shapes
  it never tried, and a game with no size bound has one nobody measured.

How to count:

- **Sweep by a rate with a low cap, not by time to failure.** A cell that
  never deals costs its whole retry cap. Count draws tried for each board
  dealt, capped at a few hundred.
- **Log a line per cell and put a time limit inside the loop.** A sweep that
  reports at its end says nothing when it is killed, and a deal that hangs is
  found only if the sweep says where it is. Sweep the small sizes too: a hang
  in a dealt size is found there.
- **A bound that needs its own sweep is its own change.** Do not read a table
  of refusals off numbers another change turned up.

Refusing a size:

- **Enumerate the smallest sizes.** Where every board of a size can be tried,
  try them, by clue set and not by dealt board. An enumeration proves a
  refusal and is kept as a test, and it shows what the generator cannot reach
  where a board exists.
- **Look for the proof before the enumeration.** A proof refuses a shape at
  any length, where a walk covers the lengths walked.
- **A generator that cannot reach a board is not a size without one.** Count
  what the walk finds under the generator's own constraints as well as in
  all. Where boards exist and the generator reaches none, the size is not
  refused, a pasted board opens, and a deal runs out at its bound.
- **Vary every option before calling a size empty**: a sample with one
  symmetry and one density is one corner of what the size can be dealt as.
- **Do not carry a refusal over from another game.** Enumerate the small
  shapes one by one and refuse what the enumeration says.
- **A rare small board wants more draws, not a refusal.** The deal's deadline
  gives them, since it counts no draws.

Options and the menu:

- **An option the game already had is a second axis, and its label must not
  borrow the tier's words.** An option called "Hard" beside a tier named Easy
  is renamed for what it does ("clues hidden").
- **Where an option removes information, the smallest boards may gain the
  tier they lacked**, and a refusal for a size states which setting it is
  for. Where an option gives information away, it bounds the tier, and the
  refusal names the option.
- **A menu has a length.** Offer the largest sizes, or the sizes where the
  tier is rare, at Easy alone, with the reason at the menu's `tiers`.

### A shallow search is a rule the solver lacks

**Where the tier's boards need a median of a few positions, find the
deduction that would finish them, count what it finishes, and decide whether
it belongs to the solver.** A search that shallow is one square tried each
way.

- **Count with a second implementation, and run it without the rule first.**
  It has to finish exactly the boards the solver does, or the count is of the
  instrument.
- **Take the counted rule apart before wording it.** An instrument that asks
  the whole deduction "does anything break" counts several reasons as one
  rule. Split the count by why each case broke; some of it may be a reason
  the engine already has and reads too narrowly, and some a search.
- **Count what the next rule would finish before writing it**, and leave it
  unwritten where it finishes little.
- **Ask what the new rule costs the hint on the boards it adds**: how many
  need notes written first, and how many steps the longest takes.
- **A deduction that empties most of the tier moves its bound and its
  menu.** The tier's boards are rarer by that factor. Measure the deal again
  at every shape the old bound was taken from.
- **Count the share of Easy the rule would become before widening Easy.**
  Where a generator strips to its solver's limit, nearly every board then
  needs the new rule; keep Easy dealt by the old rule and give the boards
  between a tier of their own (§ "A middle tier below Unreasonable").
- **Keep the stronger look for where the weaker one is silent**, so every
  board the hint finished before is finished by the same steps and no Easy
  deal moves.
- **A deduction that is a Check leaves a shallow tier.** Where the solver
  already tries a value and looks, a trial followed through finishes every
  Unreasonable board; a deeper look is a rung to weigh with the owner.

Exemplar: the rule a number takes where only one run still fits it, in
Crossing's solver and hint.

### A middle tier below Unreasonable

**Give a deduction its own tier where it is its own step for a player and
the boards that need it are a large share.** `searchTiers(2)` is
`Easy · Normal · Unreasonable`, and the two-tier names are `searchTiers(1)`
([`engine/answer-search.ts`](../src/engine/answer-search.ts)). The contract
asks `deductionFinishes(state, cap)` below Unreasonable, and the game grades
a rung a tier there (§ "A tier means exactly its rung"). Exemplar: Mosaic.

- **Count the tier's share before adding it.** Where the boards of the kind
  are a few in a hundred they stay in Easy.
- **Grade by one run where the deduction keeps its stronger idea for last.**
  A stronger step made is then one needed, and the tier is read off the
  firings.
- **The middle deal is the Easy strip asked a second question.** An Easy
  board's clues are tried again while the whole deduction finishes, and the
  board is kept where the weaker idea stops short. Hiding never makes a board
  easier, so the strip needs no check at its end.
- **Do not stop the strip early at a tier a player is to practice on.** An
  early stop that suits Unreasonable leaves a board one step short of Easy.
- **Three tiers at every size is a menu too long.** Put all three on the
  middle sizes and the ends at Easy alone.

### Check, Tactic, Search

**Classify a rung by whether each link of its reasoning writes a mark the
player can make, not by whether a trial was involved or how short the chain
is.** The owner's ruling (2026-10-26): in practice, long forcing is
indistinguishable from backtracking, and a player who wants to try a
supposition already can, by saving, playing it out and loading back. So no
mark for a supposition is ever added.

| | Shape | Tier | Hint |
| --- | --- | --- | --- |
| **Check** | place a value and look: one clue, one count, one neighbor breaks at once | any | narrate directly |
| **Tactic** | a chain whose every link is a fact the game's ordinary marks record | Tricky, Hard, Extreme | ordinary steps, each writing its mark |
| **Search** | run the whole solver from a hypothesis, branch and backtrack, or follow a chain of suppositions no mark records, however short | `Unreasonable` | refuse |

**A supposition rung runs only at Unreasonable**: the Latin forcing chain
runs at `diffRecursive`, and the config has no field to put it lower. Where
moving one would leave its tier with nothing to deal, find the markable
technique that deals the tier first (the next bullets): every such tier so
far was filled by one element's value, weighed.

**Nothing enforces the tier column, so decide a rung's class from this table
when you add or move one, and say so in the change.** `hint-quality.test.ts`
guards the hint column (a Search is never narrated). No test reads a rung and
asks whether its tier is named `Unreasonable`, and for a game with no
`hint()` the rule is unguarded end to end.

- **Check and Search look alike in a solver** (try one value, ask the oracle,
  take the other on invalid), so read what the oracle does: one validator
  call is a Check, a fixpoint or a sub-solve is a Search. A trial whose every
  rejection the player can see without trying anything is a Check
  (`hints-candidates.md` § "Deduce from the notes when the mistake check
  vouches for them"). Exemplar: `sticksTry` in Sticks' solver.
- **A value is whatever one element holds, and may be a shape.** In a game
  of lines a square's value is which of its edges take its lines, so two
  lines placed on one square and looked at once is a Check (owner,
  2026-10-28). A supposed mark that forces one square, which then breaks
  the board, is the same look; most of Path's lookahead walks were that
  long. Weighing every value of one element, each read by a look, and
  keeping what they all share, is a Check too. Exemplars: `findBreaks` and
  `findWeighed` in [`path/solver.ts`](../src/games/path/solver.ts), and
  `weighRegion` in [`map/solver.ts`](../src/games/map/solver.ts), where each
  color of one region is read off its neighbors' dots, and a three-region
  forcing chain turned out to be exactly that.
- **A Tactic is legitimate at a middle tier**: a chain of local rules that
  assumes nothing, where every link is glanceable and the player has a
  notation for the links (`hints-marks.md` § "Give the facts a notation").
  Exemplar: Rome's `loop`, which follows arrows already on the board.
- **"If this cell is a, that one is b" is a supposition**, even where both
  cells' candidates are notes: no mark records the conditional. Exemplar:
  `forcing` in [`engine/latin.ts`](../src/engine/latin.ts), a Search.
- **Nested speculation is Search twice over**, and so is every true
  recursion tier. Exemplars of a Search: `forcingPass` in Undead's solver,
  `solverRecurse` in Bricks' and `deduceForcingChain` in Dominosa's.
- **A bounded walk is still a supposition.** A propagation from a supposed
  state, bounded by deductions or by firings, made Spokes' and Path's middle
  tiers until 2026-10-28. Measured, the walks at their stalls were mostly one
  firing long, and that firing was one element's value (the bullet above).
  Look for that value before bounding a walk.
- **A Check and a Search that refute alike emit the same words**, so no
  narration guard separates them. Make the guarantee structural: assert that
  planning at the top tier gives the same plan as planning at the tier below,
  with a control that shows the equality is not vacuous
  (`spokes-hint.test.ts`).
- **A strategy game's hint is a search and is allowed**: the player is asked
  to accept "this move serves the stated goal", not the search. That is a
  fourth contract for untiered games, a stable subgoal and the next move
  serving it (`hints-search.md` § "Hold a stable subgoal").

**Before writing a hint, confirm the generator cannot emit a board the
deductive solver cannot crack at the shipped tiers.** If it can, gate
generation to deduction only, strengthen the solver so the hard tier
survives, or move the Search boards under a tier named `Unreasonable`.

**Never delete a tier to satisfy the rule, and check first whether the rung
is the tier.** Where a tier has no other distinguishing technique, removing
the rung makes the preset generate nothing. Dropping the label of a tier
that names no boards is not deleting a tier, and is safe when three things
hold:

1. the encoded difficulty character still decodes and round-trips, so no
   game ID or saved game changes meaning;
2. `validateParams` still refuses it with its reason;
3. nothing a player could play is removed: the entry only ever produced an
   error.

Whenever a tier list shrinks:

- **Put the round-trip assertion in the game's own suite.**
  `difficulty-contract.test.ts` iterates the tiers a game declares, so an
  undeclared tier loses its cross-game coverage.
- **Check the list has one definition.** The preset menu, the contract and
  the custom-params dialog read it; it is written once.

### No un-narrated fallback

**A displayed hint step names the technique that forces it; a hint never
emits an unexplained catch-all ("only one arrangement fits") for a deduction
its technique set does not cover** (`engine-hints`, "A hint step always names
a technique, with no un-narrated fallback"). Choose between two ways by
measured cost:

1. **Narrate everything the gate accepts.** Promote the catch-all into an
   honest technique, even a non-local or tedious one. This keeps every
   generated board. Exemplar: the single-line-intersection bottom rung in
   [`pattern/solver.ts`](../src/games/pattern/solver.ts).
2. **Reject at generation.** Accept a board only if the narratable techniques
   solve it to completion. This shrinks the generated set, so measure the
   rejection rate first: a teachable set much weaker than the full solver can
   thin or empty a size or tier, or slow "New Game". Re-grade the tiers
   afterward.

### Strengthening a solver instead of shipping guesswork

**When a game's shipped tiers need guessing, build the missing deductive
rungs and re-grade by which rung a board needs; do not add an Unreasonable
tier on a hunch.** Accept a board only when the ladder solves it uniquely
with zero recursion, verified against a brute-force oracle. Exemplar for a
candidate game that is not on a Latin square:
[`undead/solver.ts`](../src/games/undead/solver.ts).

- **Exact counting** off a global tally that is an equality (`countingPass`):
  a type whose full count is placed is struck everywhere; a type whose
  candidate cells equal its remaining need forces them all; too few candidate
  cells is a contradiction.
- **Depth-1 forcing** (`forcingPass`) hypothesizes one candidate and runs the
  fixpoint, which is a solve from a hypothesis and so a Search (§ "Check,
  Tactic, Search"): the tier that needs it is named Unreasonable and the hint
  refuses there.
- **Cap the ladder at the tier while grading** (`maxTier`). A board the tier
  cannot use is rejected anyway.
- **Count a candidate rung's firings on the boards the ladder stalls on
  before writing its words.** A rung a person would name first may decide
  nothing the others do not: Path's cut (crossing this edge would shut
  squares off) and reach (no number's path can get here) fired on none of
  hundreds of boards at either tier, and a one-edge lookahead finished every
  board with one answer.
- **Measure the recursion-only residual before deciding to ship an
  Unreasonable tier.** It may be zero: every uniquely solvable board cracked
  by the ladder, and the rest non-unique and rejected already.

## Difficulty tiers

A tier is a rung a board needs. The sections below are what a game with a
difficulty item declares, how its generator binds a tier, and what happens
at a size that has no board of one.

### The difficulty contract

**A game with tiers declares `Game.difficulty`, a `DifficultyContract`
([`engine/difficulty.ts`](../src/engine/difficulty.ts)): a `solveAtCap` that
runs its solver from a fresh state with the ladder capped, and answers
`"solved"`, `"unsolved"` or `"impossible"`.** Declaring it enrolls the game
in the cross-game guards (`difficulty-contract.test.ts`); an untiered game
omits it. Exemplar: `difficulty` in
[`skeleton/grid/index.ts`](../src/skeleton/grid/index.ts).

- **The contract holds the solver, not the tier list.** The names, and how
  params hold a tier (`tierOf`, `withTier`), come from the game's
  `difficultyItem` ([mechanics.md](./mechanics.md) § "Difficulty is a
  declared contract"). Do not derive them from the technique ladder; the
  `engine-difficulty` spec refuses it. A technique's `tier` is a number and a
  tier list is names, a ladder is built inside a solve from board state, and
  a tier is often no rung at all.
- **`solveAtCap` is written per game.** Only `newState(p, desc)` is shared;
  the verdict mapping is the game's. `latinVerdict` is the one shared mapping.
- **Build a fresh state in `solveAtCap`.** A reused scratch carries an
  earlier candidate's side effects and under-rejects (the `engine-difficulty`
  requirement on a fresh tier probe).
- **`solveAtCap` runs whenever a board is loaded, not only when one is
  dealt.** The midend grades an ID that has no tier outright, and keeps a
  tier pinned by an ID or a save only if the board solves there
  (`engine-difficulty`, "A pinned tier is kept or raised and never lowered").
  A `solveAtCap` that disagrees with the generator mislabels boards the
  player reopens, and it costs one solve on every reload.

### A tier means exactly its rung

**Accept a board for tier `t` only if it solves at `t` and does not solve at
`t − 1`, through `solvableAtExactlyTier`
([`engine/difficulty.ts`](../src/engine/difficulty.ts)).** It asks the cheap
question first (`t − 1`), which a retrying generator pays for far more often
than the deep solve. It takes a closure and not a `Game`, since a generator
cannot import its own `index.ts` without a cycle; `cappedSolveFor` makes the
closure from a contract. Exemplar:
[`skeleton/grid/generator.ts`](../src/skeleton/grid/generator.ts).

- **A tier that cannot bind is refused, not downgraded** (§ "A size that
  cannot carry a tier").
- **`difficulty-contract.test.ts` checks it cross-game**: it deals a board
  from every preset whose tier the contract can read and requires its lowest
  solving cap to be that tier.
- **Check `solveAtCap` against the generator's acceptance rule line by line,
  and export any bound they share from one place.** The rule is stated twice,
  once in the generator and once in `solveAtCap`, and a game's own tests
  exercise only the first: a `solveAtCap` wider than the tier it names still
  deals correct boards. Exemplar: `EASY_MAX_ARC_PASSES` in
  [`undead/solver.ts`](../src/games/undead/solver.ts), which both readers
  import.
- **Strip each tier from the one below, and a board needs its tier by
  construction.** A board stripped until no clue can go at `t − 1` keeps a
  removal at `t` only where `t − 1` can no longer finish it, so one removal
  at `t` proves the tier; a strip at `t` that removes nothing says the board
  is too easy. Stripping straight at `t` ends minimal for `t` and as often
  solvable at `t − 1`, found out only after the work. Exemplar:
  `newPathDesc` in [`path/generator.ts`](../src/games/path/generator.ts).
- **A grade belongs to a solve that finished.** The runner's grade is the
  highest tier that fired, so on a solve that stalled it says only that the
  solver ran out of facts. Reading it as "too easy" rejects a board for
  lacking clues. Ask "does it solve at `t − 1`?" as `solvableAtExactlyTier`
  does, or check that the solve finished before reading the grade.

### A size that cannot carry a tier

**A generator never settles for a lower tier than it was asked for, and by
default a game writes nothing for a size that lacks a tier**
(`engine-difficulty`, "A generator never settles for a lower tier"). A
generator that finds no board is ended by the deal's deadline (§ "Every retry
loop is bounded"). The midend (`Midend.deal`) keeps the board in play and
returns `dealGaveUp`'s sentence
([`engine/difficulty.ts`](../src/engine/difficulty.ts)), which says the tier
may be rare or absent. Never catch the run-out in the game to deal something
else.

**The three shapes of a downgrade to remove from a port**: a table of sizes
that deals the tier below (`if (w === 3 && diff > NORMAL) diff = NORMAL`), a
count of tries after which the tier drops (`MAXTRIES`), and a tier gate that
small boards skip (`spaces > 6 &&`).

**Do not count a game's sizes in order to write a refusal, and do not size a
bound to one.** Write a refusal only where both hold: the absence has a
reason that fits in a sentence and is checked in a line (a strip, a board of
one region), and a player reaches it from the menu's own sizes or one step
off them. Where no line can be named, as with a fleet given as a list, the
generator runs out and the engine says so.

A refusal that clears that bar (`engine-difficulty`, "An unbindable tier is
refused, not silently downgraded"):

1. **Refuses in `validateParams`, and only when dealing.** The check sits
   behind `full`, and the generator trusts it. A board that arrives with its
   desc is graded by what it needs, whatever its ID says, since boards dealt
   under the old label are in saved games.
2. **Uses `noSuchTier`**, so the sentence is the same in every game: "No 3x3
   puzzle is Tricky." Name the boards as the menu does, and add whatever else
   about them makes the tier absent.
3. **Is said in the size field's `doc`**, which is the help page's Parameters
   section.
4. **Is pinned with `describeAbsentTiers`**
   ([`engine/testing/absent-tiers.ts`](../src/engine/testing/absent-tiers.ts)):
   refused when dealing, accepted with a desc, and in the slow tier the
   generator run out at each cell.
5. **Has the cells beside it pinned with `describeDealtTiers`**, in the same
   file: each deals boards whose lowest solving cap is the tier asked for.
   This is what goes red when a downgrade comes back.

**Name the line in the units the tier follows, which are often not the
size's.** Where the tier follows a count of islands or regions, the
generator and the refusal call one function for that count. Exemplar:
`islandTarget` in Bridges, whose sentence is "No puzzle of 4 islands is
Tricky."

**Rare is not absent: a rare cell is dealt, with nothing written for it**
(`engine-difficulty`, "A rare tier is dealt under the deadline"). The
deadline counts no tries. What decides is seconds a board: a cell found once
in `m` seconds runs the deadline out with chance `e^(-120/m)`, and the app
deals the next board ahead in a second worker
([`deal-ahead.ts`](../src/puzzle/deal-ahead.ts)), so the wait is the first
board's only. Keep a type that takes more than a second or two off the
preset menu, and write nothing else for it.

**A cell too rare for the deadline is left to the deadline too, and never
refused.** The deal's deadline already answers it: a board that turns up in
time is dealt, the player is told when none does, and they can stop the
wait. A line drawn from deal times moves with every solver and every device,
so none is written (§ "A Custom size is not refused for its wait"). A rare
cell may be pinned with `describeDealtTiers(game, cells, { seldom: true })`,
which deals one board a cell in the slow tier; none is owed.

### Measuring whether a size has a tier

**A refusal is a claim of absence, so where one is written or already
exists, rest it on a count: run the generator with the count raised
(`underDealTries`) and count the tries.** This is not a reason to go
counting; § "A size that cannot carry a tier" says when a refusal is written
at all.

- **State the power of the count.** `e^(-tries/n)` is the chance of missing
  a tier found once in `n`. A tier found once in tens of thousands of tries
  comes back empty from most runs of the house count, so a test that ran it
  once passed. Take a count in the hundreds of thousands before writing the
  refusal.
- **Count every tier at a size.** A tier is a rung a board needs, not a
  height it reaches: a size may have Tricky and Hard boards and no Normal
  one. The same holds across a choice field, where each choice loses
  different cells.
- **Time the cells beside a refusal, not only the refused ones.** A refusal
  written from a count of tries stops where the counting stopped. Walk the
  axis the refusal sits on to both ends, in seconds a board, and give a cell
  at least a dozen boards before a line is drawn through it.
- **Count tries only where tries are alike.** Boards over tries is a rate
  when every try draws from the same population. Where a generator changes
  what it tries as tries fail, count deals first, and ask what the later
  tries are still able to find; the fix there may be to start the ramp over,
  and neither a refusal nor more tries.
- **Where a board is drawn in stages, count each stage apart and give the
  later one a short count.** Two counts settle it: how often the first
  stage's result can carry the tier, and how many tries such a result needs.
  Key the count on the drawn thing's shape and not its size, read which
  shapes fail, and refuse only the sizes whose every draw is a failing
  shape. Exemplar: `PATCH_BOARDS` in
  [`loopy/generator.ts`](../src/games/loopy/generator.ts).
- **Grade the board as it will be dealt.** Where a generator's working state
  is not what `newState` builds, the gate measures a neighbor of the board,
  which is safe only if the solver's verdict does not depend on the
  difference (§ "A fixpoint is order-independent only if every rule is
  monotone").

**The instrument is the tier walk**, `scripts/checks/tier-walk.test.ts`: for
every tiered game, every numeric field from its declared minimum to the
menu's largest, every tier, a few deals a cell, each board's lowest solving
cap beside the tier asked. It takes a choice field only as a preset has it,
so the cells beside a refusal are yours to count. It is a report, minutes
long, and not a gate. Run it with
`TIER_WALK_GAMES=group,unequal npx vitest run -c scripts/checks/diff.vitest.config.mts tier-walk`.

- A cell it lists as **below** was dealt under its tier: the defect of
  § "A size that cannot carry a tier".
- A cell that **gave up** found no board in the house count of tries. The
  tier is absent there or rarer than that count, and the app's deadline deals
  a rare one. Nothing is owed for it but a refusal that clears the bar.
- A cell it does not list was dealt at its tier three times, which clears
  little. Raise `TIER_WALK_SEEDS` for a cell that matters.

### A capped solver must be monotone in its cap

**A board solvable at cap `d` solves at every cap above `d`**
(`engine-difficulty`, "A difficulty-capped solver is monotone in its cap at
every tier"). Every technique is sound and a higher cap only adds some, so a
solver that fails at a higher cap has a technique or a check that is wrong.
Find that cause; do not work round it by solving at each cap in turn, which
hides whatever else the wrong read broke ("A non-monotone solver is repaired,
never declared").

- **The consequence is silent.** `findMistakes` re-solves, gets stuck and
  returns `[]`, so Check & Save checks nothing and blesses a wrong board
  (§ "The solvable-game contract").
- **The test is to generate boards at the lowest tier and solve them at the
  highest.** Declaring `Game.difficulty` runs it for every tiered game; do
  not write it by hand.

## Divergence and what it costs

**Matching upstream's C is not a reason to leave a game worse: diverge
wherever it is worth it to the player, and say what replaces the assurance
the byte-match gave.** "It would change every board" is a cost to weigh. The
doctrine is [`doctrine.md`](./doctrine.md) § "Upstream" and the
[`ts-migration`](../openspec/specs/ts-migration/spec.md) spec.

- **A divergence needs a stated player-visible benefit.** Tidiness is not
  one.
- **Say what replaces the oracle**, in the change: normally a property test
  that every generated board is uniquely solvable at exactly its stated
  difficulty.
- **Display code was never held to upstream**: rendering, layout, geometry,
  animation and colors target neat visuals and clean code.

Reading an upstream quirk before paying for it or refusing it:

1. **Divergence is free where the C had no defined behavior.** Where
   upstream aborts, retrying with a fresh desc diverges only on seeds where
   the C crashed.
2. **Price the quirk first.** Preserving one is often a line and a comment,
   or nothing.
3. **Diverge for a player-visible defect.** A solver that deduces falsely
   can generate a board with several answers: fix it and record it. A solver
   merely weaker than intended is fair game when the stronger one makes the
   game better to play, the clearest case being a tier that does not mean
   what it says (§ "A tier means exactly its rung"). Strengthening a solver
   because you can is tidiness.
4. **Diverge where the C's shape does not fit a browser.** Structure is not
   behavior: an exact replacement of a dense quadratic matrix costs no
   fidelity.

## Generators

A generator is synchronous and seeded: every bound throws, none chooses a
board, and a seed that ends with a board ends with the same one. The
sections below are the rules for its loops, its bounds and its use of the
solver.

### Every retry loop is bounded

**A "generate until it works" loop calls a `retryLimit` guard
([`engine/retry-limit.ts`](../src/engine/retry-limit.ts)) once per pass,
given a label and no number.** A generator is synchronous, so an unbounded
loop that never succeeds owns its thread: test timeouts cannot fire.
Exhaustion throws `RetryLimitExceeded` and returns no fallback. Exemplar:
`newSkeletonDesc` in
[`skeleton/grid/generator.ts`](../src/skeleton/grid/generator.ts).

- **The bound is the engine's, and it is two bounds.** When the app deals,
  `generate` ([`engine/deal.ts`](../src/engine/deal.ts)) arms a deadline,
  `DEAL_DEADLINE_MS`, and a guard given no count gives up when it passes. So
  a size with no board is answered after the same wait in every game, and a
  board found once in 100,000 cheap tries is dealt. Called directly, by a
  test or a census, the same guard counts `MAX_REGENERATE` tries and reads no
  clock. A generator states no budget for its deal, and nothing about a game
  is measured to size one.
- **Pass a count only where the number is the algorithm's**: a stage that
  hands over when it is spent (draw another patch once so many boards on
  this one have failed, by catching the run-out), or a maximum the board
  itself sets (at most `w * h + 1` clues). Such a guard counts under a
  deadline as well. The test: would the generator deal a different board, or
  none where it deals one, if the number were ten times as large? For a
  budget, never; leave a budget out.
- **Where the algorithm has a natural recovery, recover into it** and let an
  outer `retryLimit` bound the recovery.
- **A test that deals a rare board calls `dealRare`**
  ([`engine/testing/dealt.ts`](../src/engine/testing/dealt.ts)), which is
  `newDesc` with the count raised for that call. `describeDealtTiers` and the
  cross-game sweeps' `dealt` deal through it. A test never arms a deadline to
  find a board.
- **A bound that runs out throws `RetryLimitExceeded`, whatever counted it.**
  The midend answers that one class with a sentence and keeps the board in
  play; any other error propagates and leaves the player with a deal that
  never ends. Do not end a counting `for` with its own `throw new Error(…)`.

**The gate holds the rule in its fast pass**, in
[`retry-bound.test.ts`](../src/engine/retry-bound.test.ts). It reads every
loop under `src/games/` and `src/engine/` whose header does not count and
whose body draws from the RNG, and requires that the loop call a guard
initialized from `retryLimit` in its own body, or that the test's
`BOUNDED_OTHERWISE` ledger say what ends it. It also refuses a `throw`
standing straight after a loop that draws. What a new generator owes it:

- **A loop that deals a whole board again until one is good takes a guard**,
  however seldom it fails. A generator needs no such loop for a board that
  comes out solved: the engine's `generate` asks the game for the board's
  status and deals again.
- **A loop that uses something up each pass** (a frontier, a counter, free
  cells) takes a ledger line naming what.
- **Rejection sampling for one item** (a free square, an unused color) takes
  a ledger line saying what keeps an acceptable draw on offer, usually a
  `validateParams` bound. Do not give it a guard with no count: called
  directly that gives up at 10,000 draws and would throw on a legal board.
- **A hand-rolled counter inside an open loop needs a ledger line**, and a
  counting `for` header needs nothing.

**A game ID whose board is already solved opens** (`ts-engine`, "A game ID
whose board is already solved opens"). Dealing again is a rule about dealing
only; do not add the refusal to `newState` or `loadDesc`, which would be a
compatibility break.

### Unlucky, impossible, and load-bearing validation

**Measure a generator's failure before designing its recovery: an unlucky
draw is retried, an impossible configuration is refused in
`validateParams`.**

- **Unlucky ⇒ retry**, driven by the same RNG stream so shared game IDs
  survive. The retry takes no number (§ "Every retry loop is bounded"). Only
  a stage that hands over when it is spent has a count, sized from the worst
  measured success rate of a configuration that can generate.
- **Impossible ⇒ refuse in `validateParams`**, where the Custom dialog can
  show a reason, and refuse the precise thing shown: a count of the
  generator's tries that found none (§ "Measuring whether a size has a
  tier"), or a proof. Look across a grid of shapes, not along one dimension:
  the line may follow one width, or the cell count, which a bound on `w` or
  on `h` would not express. Seldom is not impossible: a size whose boards
  take a minute is dealt (§ "A Custom size is not refused for its wait").
- **Both, split by a parameter ⇒ find the boundary and apply both.** A size
  cap alone would forbid sizes that work, and a retry alone leaves the
  impossible range spinning.

**Port a `validateParams` that does real work before anything that depends
on it.** One that allocates, calls a generator helper or builds a board is a
feasibility check, and may be the only thing between the player and a
generator that retries for ever on params nothing fits. No retry budget
replaces it. Exemplar: the fleet placement in Boats' `validateParams`.

**A board cut at random can come out far under its size: draw again, and
keep the largest where nothing is large enough.** Nothing fails there, so
neither a retry on error nor a refusal sees it; the spread of the drawn
thing's size does. Exemplar:
[`loopy/grid-build.ts`](../src/games/loopy/grid-build.ts).

- **State what the size usually gives as arithmetic**, not as a table.
- **Change which description is drawn, never what a description builds.**
  Saved games carry descriptions.
- **Never refuse a size for it.** After a bounded number of draws the
  largest drawn is the board.
- **Deal every tier at every size the rule changes before trusting it**:
  where a tier follows the drawn thing's shape, turning a shape away can
  take a tier with it.

### A draw that fails often is mended, not retried

**Where a generator throws most of its tries away, ask what each is thrown
away for before accepting the rate as bad luck or drawing a size bound.** A
rate that falls with size while the stage after it holds steady is a
property the draw could have had from the start.

Diagnose first:

- **Count the tries each filter turns away, by size.**
- **Look at where a failed try stopped**, not only at how many fail.
- **Run a failed draw again before blaming it.** If the same draw finishes
  as often as a fresh one on a second fill, the draw is not what failed.
- **Sort the failures by what the search says of them before blaming the
  solver.** "One answer, and the deductions stall" asks for a stronger solver
  or a tier. "Several answers" is the board's fault, and no solver mends it.
- **A rate that falls as `r^n` in the number of parts is `n` independent
  small failures.** Mended one at a time the cost grows with `n`; drawing
  whole boards it grows with `r^-n`.

Then one of three mends:

- **Build the property into the draw.** A filter that throws away what a
  draw could have been made to produce is replaced by a draw that produces
  it. Exemplar: the walk in
  [`tracks/generator.ts`](../src/games/tracks/generator.ts), which may not
  leave while a line is bare.
- **Mend the part that failed.** Where a failed draw has a second answer in
  a few neighboring regions, draw those regions again and keep the step if
  nothing new is left unsettled. Exemplar:
  [`palisade/generator.ts`](../src/games/palisade/generator.ts).
- **Place the fill.** Where a draw is filled at random for a solver to pass,
  change the fill where the solver stops. A change that undoes no deduction
  costs no solve: the solver goes on from where it was, and only a change to
  something a deduction read pays for a solve from nothing. Use both moves,
  since the free one alone has no way back and the dear one alone is slow.
  Exemplar: [`separate/generator.ts`](../src/games/separate/generator.ts).
- **Add a clue where the ladder stalls, then take back what it did not
  need.** Where a clue settles what is around it, put one on something the
  stalled ladder left open, and run the ladder again until it finishes;
  then remove clues in a random order wherever it still finishes without
  them. The second half is not optional: Path's boards carried a third more
  numbers than they needed without it. Exemplar: `mend` and `strip` in
  [`path/generator.ts`](../src/games/path/generator.ts).

Rules for any of them:

- **Read the solver for what it can never finish, and build the draw without
  it.**
- **Size a mending move by give-ups and not by the median.** A move too
  small cannot leave a stall and a move too wide is hardly ever kept, so
  widen it while a board stalls and bring it back down.
- **Count every pass of a mending loop against its cap, the ones that try
  nothing included.** A `continue` before the counter is a loop that never
  ends on a board with no move to make.
- **Keep the first draw's use of the RNG.** A draw good as drawn draws
  nothing more, so those seeds deal the board they did, and the share of
  boards that moved checks the change: it should be the share whose first
  draw failed.
- **Making a draw succeed makes each try cost a whole draw, so every filter
  left behind it gets dearer.** Walk the thin shapes as well as the square
  ones, and time the run-out again after the fix.
- **When a search starts over, its cap is the line between a wait and a
  failure.** Count the draws a board takes: a few long ones is a wait and is
  dealt, and a thousand thrown away is a failure and is refused, past the
  unit the count follows.
- **A second answer a move did not touch still stands.** Keep every one the
  search meets, drop those with a value in the cell a move changed, and ask
  the search again only when none is left.
- **A search that met nothing is the dearest one.** It spends its whole
  budget. Let the cheap move go on alone while it gains, and ask again when
  it stops gaining or has nothing to move.
- **Give up a draw that has stopped coming closer.** Count the moves since
  it last reached its best, not the moves in all: a fresh draw comes right
  sooner than one that is going round.
- **Aim at the tier, not under it.** A mend that stops at the first board
  the tier's deductions finish throws away the ones an easier tier also
  finishes. Walk such a board on, keeping it finished at the tier, for as
  many moves as the deal has spent mending: where boards come right
  quickly, a fresh draw is cheaper than a long walk, and where they come
  right slowly, the reverse. Exemplar:
  [`starbattle/generator.ts`](../src/games/starbattle/generator.ts).
- **Try a neighboring game's mend, and say when it does not carry.**
- **Measure and say which boards the change deals.**
- **Time a generator as the browser runs it, not under vitest**, which ran
  Star Battle's about twice as slow as Chrome (2026-10-15). Node on the
  code bundled by `rolldown` came within a third of Chrome, a little
  slower.

### A division into regions is the engine's

**A generator that divides its grid into regions takes the division from
`src/engine/` and supplies only its rule.** Regions of one size come from
`divvyRectangle`. Regions of unequal size come from
[`divide.ts`](../src/engine/divide.ts), which has a walk for each way a game
states what it wants:

| The game knows | The walk | Exemplar |
| --- | --- | --- |
| Which neighboring regions may join | `mergeNeighbors`, with what a region holds and how two holdings join | [`rome/generator.ts`](../src/games/rome/generator.ts) |
| That, and how many regions there are to be | `mergeToCount`, which returns `null` where the rule cannot be met | [`starbattle/generator.ts`](../src/games/starbattle/generator.ts) |
| Where each region starts, or how many there are | `growFromSeeds`, over cells the game places or `scatterSeeds` draws | [`map/generator.ts`](../src/games/map/generator.ts) |
| How large a region may be | `growToSize`, with a size the game draws for each | [`seismic/generator.ts`](../src/games/seismic/generator.ts) |

- **The rule is a value and a function, never a walk.** A merge rule is what
  a region holds (`of`) and what two hold as one, or `null` (`join`). A rule
  that needs the division itself to answer is a sign that the game is
  writing the walk.
- **A walk may follow another**: a rule names the division to start `from`.
  Regions that must each hold a number of placed things are grown one to a
  thing and then joined toward the count.
- **A game keeps a division of its own only where its rule cannot be said
  as one of these, and says so at the division.** Three do: Filling's rule
  obliges a join where these permit one, Galaxies grows a cell and its
  mirror image together, and Keen and Solo's Killer lay dominoes before they
  fold single cells in, because they want pairs and a merge under a largest
  size deals regions at that size.
- **Where the regions are the board's only clue, a division dealt at random
  seldom has one answer, and the engine mends it.** Star Battle's regions
  grown round its stars gave no board its ladder finishes in 300 draws at
  8x8. `mendDivision`
  ([`mend-division.ts`](../src/engine/mend-division.ts)) moves one cell at a
  time between two regions that are there: a cell that breaks a second
  answer the game's search met, or one its ladder left open, kept unless
  more cells are left open. The game supplies the judge, with its ladder
  capped at the tier asked for. Exemplar: `judgeOf` in
  [`starbattle/generator.ts`](../src/games/starbattle/generator.ts).
  `redivide.ts` mends only regions of one size.
- **Moving a division onto a walk here keeps its boards only if the draws
  and their order are kept**, and a move that changes them is a divergence
  like any other (§ "Divergence and what it costs").

### Bound a generator by its tail, not its median

**Before setting or raising a bound, repeat the sizes near it across several
seeds: one seed per size is not a measurement.** The bounds drawn from time
are the preset menu's; a Custom size is refused for memory, never for its
wait (§ "A Custom size is not refused for its wait"). A sweep with zero failures
says every size is reachable; only the tail says whether to offer it, and a
median of a few seconds can hide a worst case several times as long.

- **Optimize first, then bound.** A bound drawn from the slow number forbids
  boards the fixed code deals quickly. Profile a deal before choosing what to
  speed up (`--cpu-prof` on a vitest fork). The first suspect is a port that
  rescans the whole board where upstream kept incremental state: a pure
  function of the board can be made incremental without moving a verdict, so
  no seed's board moves and the frozen differential guards the speed-up.
  Pearl's loop bias was 83% of a deal.
- **Check whether the wall is time or memory.** A retry budget assumes
  failure is recoverable; an out-of-memory in the worker is a crash, so that
  boundary belongs in `validateParams`. Measure at least one size past the
  line and note which way it fails.
- **A retry loop's tail is set by its per-attempt success rate.** With
  success rate `p`, the chance of exhausting `n` tries is about `e^(−np)`. In
  the app `n` is what the deadline has time for; called directly it is
  `MAX_REGENERATE`, which is where a test meets it. Count attempts and
  successes over a few hundred deals at every preset and compute both, and do
  not wait for a failing seed.
- **Write a bound in the unit the cost follows and for the cell it was
  measured at.** The wall differs by tier and by a choice field, so one
  maximum width is wrong for most of what it covers.
- **A few quick deals clear nothing where the solver searches.** A size
  inside the menu's range can hold a deal that never ends on the next seed:
  name the cell and count a dozen (`DEAL_WALK_CELLS`).

**The instrument past the menu is the deal walk**, `npm run deal-walk`
([`scripts/deal-walk.ts`](../scripts/deal-walk.ts)): every game, each menu's
largest size at every tier and then 1.5 to 8 times it, a few deals a cell,
each in a watched process so a deal that never returns is killed and written
down. It writes `metrics/deal-walk.md`. Expect a ladder to pass ten seconds a
board somewhere between 1.5 and 4 times the menu's largest. A cell it lists
is a few deals, enough to find where a ladder leaves a second and not enough
to place a line; count the sizes each side of a bound before writing it.

**The census of a generator you are writing is the same tool**, with the
cells named: `DEAL_WALK_CELLS="8s2dn 9s2dt" DEAL_WALK_SEEDS=20 npm run
deal-walk -- <game>` prints each cell's time, its deals' tries at the
outermost retry loop, and its boards by the easiest tier that finishes each.
The game must be registered. Do not write a throwaway test that throws its
table.

### A Custom size is not refused for its wait

**Refuse a size in `validateParams` only for what no speedup changes.** The
app runs every deal beside the board in play, shows how long the wait has
run, and lets the player stop it
([`deal-ahead.ts`](../src/puzzle/deal-ahead.ts), `Puzzle.stopDeal`); the
page ends a deal at the deadline (`DEAL_DEADLINE_MS`,
[`retry-limit.ts`](../src/engine/retry-limit.ts)), even one whose single
search runs past it, and says no board was found. So a large or rare size is
a wait the player chose and can leave. What a wait does not fix:

- a size no board exists at, shown by a count or a proof (`noSuchTier`);
- a structural limit: memory, an encoding, a level the hint cannot open.

Nothing else is refused: not "a larger one takes too long to deal", not "too
rare to deal", and no bound drawn from a table of deal times or acceptance
rates, whatever its message says. Such a line moves with every solver change
and every device, so the catalog would be measured again for ever. The
preset menu is held to more, since a preset is a wait sprung on whoever
opens the menu: keep a slow type off it, and say so beside the menu, not in
`validateParams`.

**Slow is still worth fixing.** A Custom size that deals in a minute is a
size the generator could deal in seconds. Before a table of times is read as
the generator's limit:

- **A deal that throws is a defect in the code that throws.** A recursion
  that overflows the stack on a large board is rewritten to keep its own
  stack, not bounded. Record a few hundred boards and their hint plans first,
  since the order a rule fires in decides which board a seed deals.
- **Ask what each solver run in a strip is asked**, and skip a run that
  cannot pass.
- **Where draws are thrown away for a second answer, the search has it in
  hand.** `solvedPositions`
  ([`engine/answer-search.ts`](../src/engine/answer-search.ts)) hands the
  answers over; a clue can move where they differ so the dealt answer stands
  and the other does not. Exemplar:
  [`rect/generator.ts`](../src/games/rect/generator.ts).
- **A check that replays the hint rereads the board at every step unless it
  is told not to.** Carry what a step can only shrink, and pin it with a test
  that each step of a plan is the step its board gives when read afresh.
- **Sweep the fields beside the size.**

### Solver-gated generation

**When a generator strips or accepts clues by re-running the solver, the
solver's verdict on every intermediate board decides which boards exist, so
the verdict and its quirks are part of the algorithm.** A change that
strengthens or weakens the solver changes every board. The frozen
differentials ([testing.md](./testing.md) § "The frozen differentials")
catch a refactor that moves a verdict.

- **Do not tidy a preserved quirk; the comment at its definition is the
  contract.** Such a quirk may be a deliberate skip, verbatim dead code, the
  release build's semantics where a diagnostics `#ifdef` had early-outs, or a
  contradiction the shipped build does not report. Exemplars: `mergeSomeCages`
  in [`solo/generator.ts`](../src/games/solo/generator.ts), `fillSquare` in
  [`slant/solver.ts`](../src/games/slant/solver.ts) and the skipped square in
  `learnCriticalSquare` in
  [`filling/solver.ts`](../src/games/filling/solver.ts).
- **The truthiness trap.** Grep a solver-gated generator for `if (solve(`
  and `if (!solve(`. A solver with a multi-valued verdict makes bare
  truthiness a bug: where a code for "ambiguous" is truthy, a strip runs
  straight past uniqueness. Compare against the verdict wanted. Exemplar:
  [`mathrax/generator.ts`](../src/games/mathrax/generator.ts).
- **The dirty scratch.** When a generator hands its solver a reused board,
  ask what state that board is in on entry; a gate that re-solves on what the
  last candidate left behind judges garbage. Exemplar:
  [`spokes/generator.ts`](../src/games/spokes/generator.ts).
- **The unchecked start.** A stripping loop keeps a removal only while the
  board still solves, so it preserves a solvable board and cannot make one.
  Any step that edits the answer after it was built owes a solve before the
  stripping. Exemplar:
  [`bricks/generator.ts`](../src/games/bricks/generator.ts).
- **The mutating validator.** A C-descended `validate` that returns a
  verdict and also writes a flag into the board is a hazard once a later
  whole-cell comparison reads that byte. Where the generator depends on it,
  keep a mutating validate on the generator path and separate pure checks for
  play. Exemplar: [`clusters/solver.ts`](../src/games/clusters/solver.ts).
- **The root's identity.** Some deductions branch on which element the
  union-find's `canonify` returns, and the shared
  [`Dsf`](../src/engine/dsf.ts) matches upstream `dsf.c`'s choice for that.
  The shape is a `canonify` result used as an index and not as an identity to
  compare. Then ask which `dsf.c` the C was written for: code that says "the
  canonical index is the first square" and calls `dsf_canonify` is broken
  upstream, since the smallest element has its own call, `dsf_minimal`.
  `Dsf.withMinimal` answers `minimal(i)`. Exemplar: `checkDsf` in
  [`boats/validate.ts`](../src/games/boats/validate.ts).

### A divergence retires or re-founds its fixture

**Do not keep upstream's behavior reachable so a differential stays green.**
Ship the fix, and retire or re-found the fixture it moves, saying what
replaces it. Upstream being clearly wrong is a reason to fix it.

A frozen fixture holds more than generation, so re-found it as a check over
the same recorded boards: every description still validates, loads and
round-trips through the codec, so an older shared ID stays playable, and the
solver still finds each board uniquely solvable. Generation is then carried
by the game's property test that every generated board is uniquely solvable
at exactly its tier.

### Recover emergent parameters from the fixtures

**When you replace a generator, do not guess the shape of what it produced:
decode the frozen descriptions and measure it.** A distribution that is
emergent in the C, such as region sizes, can be read off a histogram of the
fixtures. Match the measured one and deviate deliberately. Check the fixtures
whenever a rewrite has a free parameter the old output fixed implicitly.

### Reuse the solver's pruning, not just its propagation

**If a constructive generator built on a solver's propagation backtracks far
more than about one node per cell, add the global feasibility test the
solver already implements as its pruning rule.** Forward-checking alone
finds out many levels too late. Exemplar: the "can every region still house
every number it owes" check in Seismic's fill.

## Solve and the generator's aux

**Derive the answer in `solve` from the board, and take the generator's
`aux` only where that is impractical and you have measured that it is.** The
midend keeps `aux` from `newDesc` and passes it to `solve(orig, curr, aux)`
only for a new game or a `#seed` ID. A `:desc` ID or a loaded save has none,
and Solve then reports "not known". If a game takes `aux`, test Solve
through a real `Midend`: the threading lives there, so a direct test of
`solve` can pass while the shipped Solve does nothing. Exemplar: `solve` in
[`skeleton/grid/index.ts`](../src/skeleton/grid/index.ts).

**Solve shows the finished board, or says why not** (`ts-engine`, "Solve
leaves a solved board"). `Midend.solve` refuses a solved or a lost board
itself, and throws when the move `solve` returns leaves a board whose status
is not solved. So a Solve is never a reveal scored as a loss, a route
plotted for the player to walk, or marks on the squares to press. What a
game decides is only whether it can:

- **Where its solver finds no finish from here, it refuses with a
  `SolveFailure`**, such as `NO_SOLUTION_FROM_HERE` for a game whose move
  limit can be overrun.
- **Where a mistake stands in the way, the answer replaces it**, as it
  replaces a wrong digit.

[`solve-finishes.test.ts`](../src/engine/solve-finishes.test.ts) solves
every game from positions played into.

## findMistakes

Check & Save is an answer check in every game. The sections below say when a
game ships `findMistakes`, what the engine refuses at load because of it, and
what the hook compares for each kind of entry.

### The solvable-game contract

**A game with a unique solution ships `findMistakes`.** Check & Save
(`src/puzzle/quick-save-actions.ts`) blocks a save on a wrong entry only
through `game.findMistakes` (`Midend.check`); without the hook it saves a
wrong board without complaint. Re-solve from the fixed clues and return
every player cell that contradicts the unique solution, and `[]` when the
board is not uniquely deducible: never guess. A permutation puzzle with no
notion of a wrong-but-legal state omits the hook.

Exemplar: `findMistakes` in
[`skeleton/grid/index.ts`](../src/skeleton/grid/index.ts), and
[`unruly/render.ts`](../src/games/unruly/render.ts) for drawing what it
returns. The overlay is part of the render diff key
([rendering.md](./rendering.md) § "Overlay sidecars"), and the coupling
between the refusal and the banner is in [hints.md](./hints.md).

### One answer, even when it is hidden

**A game with a mistake check plays only boards with one answer, and the
engine enforces it at load.** On a board with two answers Check & Save would
call a mark that fits the other a mistake. `loadDesc` asks the game's own
`solve` about every board it loads and refuses one the solver proves has
several answers (`DESC_NOT_UNIQUE`) or none (`DESC_CONTRADICTORY`)
([`engine/desc-error.ts`](../src/engine/desc-error.ts)).

- **The game joins by having a `solve` that says `MULTIPLE_SOLUTIONS` or
  `NO_SOLUTION` when it has proved it.** A solver that merely gave up says
  neither; that passes, and the board is then asked whether the solver
  solves it at all (§ "No option switches the generator's checks off").
- **The generator deals only boards the same count calls unique**, held by a
  test against an answer count that has no search in it.

**A game with no mistake check says what it can prove through
`hasNoSolution`, and its `solve` is never asked at load.** Several answers
are no fault there, but a board with none is refused with
`DESC_NO_SOLUTION`.

- **The hook is a proof that costs the same on any board**: a parity, a
  rank, a planarity test, a count. Look for the invariant the moves keep, and
  split "is there an answer" from "which". `solve` is the wrong thing to ask,
  since load runs on every pasted ID and every opened save and a solver that
  searches charges a board it cannot settle its whole budget each time.
- **A proof must be sound and need not be complete.** The hook refuses only
  what it proves. Hold it to the moves themselves: list every board a small
  one reaches and see the proof hold for none. Exemplar:
  [`twiddle-no-solution.test.ts`](../src/games/twiddle/twiddle-no-solution.test.ts).
- **A search game's quick loss check is such a proof**, where it costs
  milliseconds on the largest presets.
- **A game that can be lost answers with what proves it**, a
  `markedDeadEnd`, and the midend refuses a hint with that on a position
  played into ([hints.md](./hints.md) § "Refusal wording comes from one
  module").
- **A new game with no mistake check pins a board with no solution** in
  [`no-solution-load.test.ts`](../src/engine/no-solution-load.test.ts).

**A hidden answer is no reason to skip the check.** A game whose answer is
hidden checks marks against it as any game checks a digit.

- **Check the player's claims, never their probes.** A guess that is how the
  game is played is not read; a flag, a rule-out or a mark claiming something
  about the hidden answer is. Report a wrong rule-out by its slot and not its
  value, as a pencil-mark check reports the cell and not the digit.
- **The generator makes the hidden answer the only one the visible clues
  allow.** Build the board a piece at a time, keeping each piece only where
  the board still has one answer; that beats scattering and redealing, which
  finds few boards and skews a ranged count. Exemplar:
  [`blackbox/answer.ts`](../src/games/blackbox/answer.ts).

### Marks are checked like entries

**Where the player pencils candidates, a blank cell whose marks leave out
its answer is a mistake, as a wrong entry is.** A candidate hint reasons
from those marks. Marks with extra candidates beside the answer are ordinary
mid-solve state, and a cell with no marks says nothing.

Do not write the loop. `entryMistakes` in
[`engine/entry-mistakes.ts`](../src/engine/entry-mistakes.ts) owns it; the
game hands it the answer, its arrays, its `NoteEncoding` and its fixed cells
([engine-catalog.md](./engine-catalog.md) § "`entry-mistakes.ts` — Check &
Save for one value or a set of marks per cell").

### Edge games flag set edges only

**Where the player draws walls, flag the player's edges that contradict the
solution; never "the cell looks invalid", and never a missing edge.** A
missing solution edge is incomplete. Only an edge the player has set that
the solution forbids is a mistake: a box drawn around no clue looks wrong,
but if each wall is a real solution boundary it is partial progress.

Exemplars: [`rect/index.ts`](../src/games/rect/index.ts),
[`tracks/index.ts`](../src/games/tracks/index.ts), and
[`galaxies/index.ts`](../src/games/galaxies/index.ts), which also flags an
interior wall set inside a single region. A game that stores a mark per
`square-edges.ts` edge passes its marks and its answer's lines to
`edgeMistakes` in [`engine/line-drawing.ts`](../src/engine/line-drawing.ts),
which says this rule once: `skeleton/edges/index.ts`.

### Live rule errors and the re-solve are both

**Where the game already draws live rule errors, keep them and also base
`findMistakes` on the re-solve.** Live checks (a broken row count, a
collision) are a strict subset of what the re-solve knows: a locally legal
piece on a square the solution assigns otherwise breaks no rule yet, and a
live-only hook would let Check & Save bless it. Render them so both read.
Exemplar: [`boats/render.ts`](../src/games/boats/render.ts), which recolors a
wrong ship and insets an outline so a wrong water square shows.

### Self-validating games run their rule checker

**Where a game's violations are intrinsic to the grid, `findMistakes` runs
the validity pass that decides won or ongoing and returns the offending
cells, and a game that holds the answer adds the comparison with it.** The
rule pass is one layer and never the whole check: a wrong entry that breaks
no rule yet passes it, and Check & Save then has nothing to point at.

- **Where the player enters one value a cell, the comparison is
  `entryMistakes`** (§ "Marks are checked like entries"), with no `notes`
  for a game that has none.
- **A mark is an entry too.** A clue the player marks complete short of its
  count is the mistake, and the clue is what lights up.
- **Give the answer's mark a look of its own where the live marks are still
  drawn.** A live mark often sits on a clue or a right entry beside the wrong
  one, so the player has to tell which to take back.
- **The shape to look for** is a hint that opens by re-solving and answers
  `CONTRADICTION_UNLOCALIZED`: what it found there belongs in `findMistakes`.

[`wrong-entry-check.test.ts`](../src/engine/wrong-entry-check.test.ts) looks
for the gap in every game by entering things blind and asking whether Check
& Save can name what the answer contradicts. Exemplars: `findMistakes` in
[`bricks/solver.ts`](../src/games/bricks/solver.ts), which keeps the rule
pass's flags and adds one for a cell the answer contradicts, and
[`subsets/solver.ts`](../src/games/subsets/solver.ts).

## The Latin family

**A game on a Latin square builds on
[`engine/latin.ts`](../src/engine/latin.ts): its `solver.ts` is its own clue
deductions (`usersolvers`), a `valid` callback over completed grids, and a
thin driver mapping its difficulty levels onto the `latinSolver` config.**
The engine gives the candidate cube, positional, numeric and set
elimination, forcing chains and guess-and-verify recursion at the searching
level `diffRecursive` (the recursion doubling as the uniqueness check), and
the generator (`matching`, `latinGenerate`, `latinGenerateRect`).
The population is `git grep -l engine/latin.ts src/games`. The hint side
starts at [hints-candidates.md](./hints-candidates.md) § "What every game does".

Exemplars: [`group/solver.ts`](../src/games/group/solver.ts) for the plain
shape, two `usersolvers` and a `valid`;
[`towers/solver.ts`](../src/games/towers/solver.ts) for clue heuristics;
[`unequal/solver.ts`](../src/games/unequal/solver.ts) for two modes off
`ctx.mode`; [`keen/solver.ts`](../src/games/keen/solver.ts) for per-cage
arithmetic; [`salad/solver.ts`](../src/games/salad/solver.ts) for a repeated
symbol.

- **The cube is indexed `(x·o + y)·o + (n−1)`.** Read a slice as a line's
  cell list and `cubeGet(x, y, n)`. Where upstream works in a transposed
  index space with dense flat reads, port the flat reads verbatim with a
  comment: re-deriving them moves solver verdicts. The same holds for a
  generator that reads the cube through a transposed index, and for one that
  shuffles two clue lists in two separate `shuffle` calls: both decide the
  board, so reproduce them
  ([`unequal/generator.ts`](../src/games/unequal/generator.ts)).
- **A clue that constrains a cell without placing a digit uses the `seed`
  hook.** `latinSolver` seeds its cube from the working grid, which covers
  every given digit; `LatinSolverConfig.seed` is where a mark that only rules
  candidates out is applied. It is not re-applied inside the recursion, so it
  is sound only for a game that never recurses: check the recursion setting
  before relying on it.
- **A game with a symbol that repeats in a line declares it; it does not
  fake it.** `LatinSolverConfig.repeats: { times }` makes the last symbol
  repeat, and the generic rungs then reason with its multiplicity:
  positional elimination places it when exactly `times` cells of a line can
  still take it, placing it strikes the line only once the line's count is
  full (recorded as `repeatFull`, apart from `LatinReason`), set elimination
  runs `setGeneral`, and forcing chains never link through it. Read the
  marker array back off the final cube (`cubeOut`). The extension is inert
  when not declared (`latin-repeats.test.ts`), and a game with exactly one
  such symbol per line needs no declaration.
- **Three generator shapes.** Derive every clue from the full square, then
  remove (Towers). Assemble clues greedily onto a blank board, reading the
  solver's remaining-possibility counts through `latinSolver`'s optional
  `cubeOut` (Unequal); omit `cubeOut` on the solve and hint path. Partition
  structurally over a generated square, then solver-gate on exactly the
  target difficulty
  ([`keen/generator.ts`](../src/games/keen/generator.ts)).
- **A cage or region game over the shared `Dsf` precomputes its
  minimal-element map** (`buildMinimal` in
  [`keen/state.ts`](../src/games/keen/state.ts)) and does not grow a
  min-tracking dsf: a single ascending pass after all merges is exact
  whichever root union-by-size picks. First check whether the algorithm needs
  a minimum at all, or only a same-class test, and whether the root's
  identity matters elsewhere (§ "Solver-gated generation");
  [`engine/dsf.ts`](../src/engine/dsf.ts)'s header says which call returns
  what.
- **What a solver does not do can decide boards as much as what it does.**
  Where upstream's shipped build skips a `usersolver` contradiction that sits
  inside `#ifdef STANDALONE_SOLVER`, the port keeps the shipped behavior,
  with a comment at the site
  ([`group/solver.ts`](../src/games/group/solver.ts)).
