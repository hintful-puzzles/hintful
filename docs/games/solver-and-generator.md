# Solver & Generator Guide

How a game's deduction engine, difficulty tiers, generator, `solve()` and
`findMistakes` fit together. This file is the followable *how*; the normative
*what* lives in the specs — chiefly the
[`engine-difficulty`](../../openspec/specs/engine-difficulty/spec.md) requirements
**"Narratable-deduction generation policy"**, **"A difficulty-capped solver is
monotone in its cap"**, **"A difficulty tier binds the board it generates"**
and **"An unbindable tier is refused, not silently downgraded"**, and the
[`engine-hints`](../../openspec/specs/engine-hints/spec.md) requirement **"A hint
step always names a technique, with no un-narrated fallback"**.

Related guides: [hints.md](./hints.md) (narration and plan mechanics),
[testing.md](./testing.md) (the frozen differentials and what a red one
means), [engine-catalog.md](./engine-catalog.md) (the shared helpers named
here, one entry each), [mechanics.md](./mechanics.md) (where the hooks sit on
the `Game` interface).

---

## One engine, two projections

**A logic game has one deduction engine, consumed twice: the generator/grader
runs it with the recorder off, and the hint runs the same engine with the
recorder on.** This is the narratable-deduction doctrine
(`adopt-narratable-deduction-engine`), and it is the load-bearing idea of this
whole guide: the techniques that decide which boards *exist* are the same
techniques the hint narrates, so the hint can always name the technique that
forces a move — because no board was ever accepted on the strength of a
technique the hint cannot explain.

Consequences, each expanded below:

- Generation is **guess-free** at every shipped tier (see
  [Guess-free generation](#guess-free-generation)).
- Difficulty is graded by **which technique rung a board needs**, and a tier
  means exactly that rung (see [Difficulty tiers](#difficulty-tiers)).
- A hint never emits an un-narrated catch-all (see hints.md; the standing bar
  is restated under
  [No un-narrated fallback](#no-un-narrated-fallback)).
- `findMistakes` and `solve()` reuse the same solver rather than growing a
  second opinion (see [findMistakes](#findmistakes)).

## The deduction fixpoint

**New logic games build their solver/hint loop on
[`engine/deduction-fixpoint.ts`](../../src/engine/deduction-fixpoint.ts)
(`runDeductionFixpoint`) rather than hand-rolling it.** The loop is an ordered
ladder of techniques, easiest first, that restarts from the top the moment any
technique fires ("return after first firing", which keeps one firing = one hint
group), stops when nothing fires or the ladder has settled, and reports the
highest *tier* that fired as the grade. The runner owns:

- the **technique contract** — a technique is a declaration,
  `{ id, tier, run }`: a stable greppable name, the difficulty tier it belongs
  to, and a `run` that applies it once and returns `> 0` (fired), `0` (nothing
  to do), `< 0` (contradiction proved). **Both `id` and `tier` are required** —
  a ladder states its tiers rather than encoding them in array positions, and
  states its names rather than leaving a reader to count;
- the **grade** — the highest `tier` that fired, never a position. Several
  techniques may share a tier (Unruly's five sit on three), and grading is
  blind to where in the array they sit;
- the **`maxTier` grading cap** — while grading a tier, don't pay for techniques
  the tier can't use (this alone cut Undead's 7×7 Normal generation ~6×). It
  *excludes by tier, wherever the technique sits*, so a cheap technique placed
  after an expensive one still runs under a low cap; a ladder whose tiers are
  not monotonically increasing is therefore legal;
- the **recording-path step budget** — pass a
  [`stepBudget`](../../src/engine/step-budget.ts) on the hint call and omit it
  on the generator call, so a technique that reports progress without changing
  the board fails loud on the hint path and the generator path stays
  byte-for-byte unchanged (see hints.md on the budget guard). **The failure
  names the culprit**: the thrown error appends the techniques by firing count,
  most-fired first, so the runaway one is identified without bisecting the
  ladder. Counting happens only where a budget does or the caller passes its
  own `firings` tally, so the generator path allocates nothing;
- the optional **`settled` early-out** — *"stop, there is nothing left for the
  ladder to do"*. Deliberately broader than "solved", which is what it was
  called until it had five callers and meant solved for two of them: Undead
  stops on a *contradiction*, Clusters on complete-or-invalid, Spokes also on
  its own tier's action budget. Only Filling and Pattern mean solved;
- the `beforeTechnique` hook (used by `latinSolverTop` to bump the firing-group
  id so one firing's records share a `group`).

**A conditionally-available technique guards itself in `run` and returns `0`.**
Unruly set the precedent — its `unique` variant is a rule of the board, not a
rung-ordering question — and Spokes needs it for a look-ahead that runs at
*exactly* Tricky rather than Tricky-and-above. **The runner has no `when`
predicate and will not grow one**: it would be indistinguishable from returning
`0` and would exist only to document, which is how a runner becomes a
configuration language.

### A fixpoint is order-independent only if every rule is monotone

Running the ladder until nothing fires does not by itself make the verdict a
function of the board. It does so when every rule is **monotone**: a rule that
fires on some position still fires, or has nothing left to say, on every
position with more decided. One rule that stops applying as the board fills is
enough for two visiting orders to end in different places, and the grade then
depends on how the state was built.

Bridges had one. An island's room along a span was the least of the span's
capacity, what the island still needed, and the span's limit less the bridges
on it, so the bridges came off the limit and not off the capacity. A 7 beside
a 4, a 2 and a 2 had room for exactly the six it needed while one bridge was
drawn, and room for five against a need of four once the corner 2 had filled
first; "room for exactly what it needs" then never fired again. The generator
grows its islands in placement order and a player's board lists them in
reading order, so about one sparse board in a hundred at three and four
bridges a line was dealt as Tricky and solved at Easy once loaded.

**The quantity to read is the rule's slack as the board fills.** If drawing a
bridge can raise it, the rule is not monotone. Bridges' was the sum of each
span's room less what the island needs, which rose with every bridge drawn on
a span that had capacity to spare.

**The instrument is a shuffle**: rebuild a board with its population listed in
another order and compare the verdict at every cap
(`bridges.test.ts`, "the grade does not depend on island order"). Pin the
boards that split as descs; a census over dealt boards beside them saw the
defect at one size in five of 150 deals each, so it cannot be the guard alone.

Converged call sites to read as exemplars, easiest first:

| Read this for | Where |
| --- | --- |
| the clearest ladder in the tree — five techniques, three tiers, one `maxTier` | [`unruly/solver.ts`](../../src/games/unruly/solver.ts) (`solveGame`) |
| two tiers, plus a second untiered ladder in the same file | [`magnets/solver.ts`](../../src/games/magnets/solver.ts) |
| an untiered ladder — every technique on tier 0, the grade unused, so the ladder is an *order* not a grading | [`filling/solver.ts`](../../src/games/filling/solver.ts) (`FillingSolver.run`) |
| a ladder built per difficulty level, so `tier` *is* the level | [`engine/latin.ts`](../../src/engine/latin.ts) (`latinSolverTop`, and through it the Latin family) |
| `settled` used for a **contradiction** rather than a solve | [`undead/solver.ts`](../../src/games/undead/solver.ts) (`recordUndeadDeductions`) |
| `settled` carrying a three-valued verdict out through a closure | [`clusters/solver.ts`](../../src/games/clusters/solver.ts) (`solveGame`) |
| a non-firing technique in position 0 used as a per-iteration pre-pass, and a flag mapped onto the `-1` arm | [`singles/solver.ts`](../../src/games/singles/solver.ts) (`solveSpecific`) |
| a ladder that is **not** a tier prefix, a clamped cap, and an accumulator threaded through `settled` | [`spokes/solver.ts`](../../src/games/spokes/solver.ts) (`spokesSolve`) |
| a hint-only recording ladder | [`pattern/solver.ts`](../../src/games/pattern/solver.ts) |
| a rung whose availability is **non-monotone in the cap** (runs at Tricky, *not* at Hard) — no `tier` can say that, so it guards itself | [`ascent/solver.ts`](../../src/games/ascent/solver.ts) (`ascentLadder`) |
| a per-iteration **prologue** carried by `settled` rather than by a never-firing rung | [`subsets/solver.ts`](../../src/games/subsets/solver.ts) (`subsetsSolveGame`) |
| a rung that **sweeps a whole population before reporting** — legal, because the runner's "return after first firing" is about the *ladder* | [`bridges/solver.ts`](../../src/games/bridges/solver.ts) (`Solver.ladder`) |
| a recorder threaded through the rungs, untouched by adoption, so an explained hint survives it | [`galaxies/solver.ts`](../../src/games/galaxies/solver.ts) (`galaxiesLadder`) |
| Tricky deductions upstream folds into Easy sweeps, each split into a rung of its own, and a rung whose tier sits *below* Easy because the generator caps there | [`tents/solver.ts`](../../src/games/tents/solver.ts) (`tentsLadder`) |
| a terminal rung that ends the ladder through `settled`, and a rung that rebuilds shared state the rung before it just built | [`pearl/solver.ts`](../../src/games/pearl/solver.ts) (`pearlLadder`) |
| a rung that exists only because the player's **notation** needs it: it writes the edge walls a merge leaves implied (upstream ORs a disconnect matrix silently), touches nothing the generator reads, and so moves no board and shows only in the census; and a sweep split per firing on the recording path because its disconnects are order-independent | [`separate/solver.ts`](../../src/games/separate/solver.ts) (`separateLadder`) |
| **two grades with a cap each**, so the runner's one grade and `maxTier` go unused: the ladder holds only the rungs both caps admit and each rung raises its own scale; and rungs that work shared state out afresh (cages reduced by their filled cells, partial cages cached by filled-cell count) so any one can run alone | [`solo/solver.ts`](../../src/games/solo/solver.ts) (`SolverUsage.ladder`) |

### Proving an adoption: the fixtures are not enough

**A byte-match differential certifies only the rungs it fires, and cannot tell
you which those are.** Tracks' passed its adoption of this runner and could not
have failed it: deleting one of its eight rungs outright — from the new ladder
*or* the hand-written loop it replaced — left all 39 of its tests green, because
that rung fires on no board its generator produces (measured: 324 solves, every
other rung firing, that one zero).

So an adoption is proved in two halves, one temporary and one permanent.

- **While adopting, compare against the loop being replaced**: the two must
  agree on verdict, grade **and full board state** (so a ladder reaching the
  same answer by different deductions fails), at **every cap** (the cap is what
  selects rungs), over a corpus the census below shows reaches every rung. Then
  **delete the old loop in the same change**. It is reference code once the
  comparison has passed, and git keeps it (owner, 2026-09-28: *"delete any old
  code that's just used for reference; that's what git is for"*). Thirteen
  adoptions kept theirs as permanent oracles until `retire-the-ladder-oracles`
  removed them.
- **What stays is the firing census** —
  [`engine/testing/ladder-census.ts`](../../src/engine/testing/ladder-census.ts)
  — walking a corpus at every cap and asserting which rungs fired. A rung the
  corpus cannot reach is recorded with its reason, and checked against the C
  first, because an unreachable deduction is exactly the shape a porting bug
  takes. From then on the frozen differential, where a game has one, is what
  says a refactor moved a board. **A census cannot see a mis-tiered or
  reordered rung**, because the rung still fires; the differential can, and
  Solo's did for both when planted after its oracle went (a mis-tier turned five
  fixtures red, a reorder one). A game with no differential has only the
  census, so plant a mis-tier before relying on it.

**Size the corpus by planting, once per upper-tier rung.** Fifteen Magnets
boards passed every equivalence check and then stayed green with
`advancedfull` mis-tiered to Easy, while the byte-match caught the same plant
on one fixture in twenty: a mis-tiered rung shows only at a cap that excludes
it, on a board where it is the first rung of its tier to fire from the lower
tier's stall, and no board in the corpus was one
(`certify-the-magnets-ladder`). The cap walk is the mechanism; only a plant
per Tricky rung tells you the boards reach it. And an `unreached` entry can be
**structural** rather than a corpus shortfall — Magnets' `neither` is
foreclosed by the primitive beneath it, in the C exactly as in the port
([`magnets-ladder.test.ts`](../../src/games/magnets/magnets-ladder.test.ts)
argues it) — in which case "empty is the goal" is a diagnosis, not a target.

**On a ladder whose every rung only removes candidates, the census is the half
that bites.** Such a ladder reaches the same fixpoint in any order, and the
corpus is dealt by a generator gated on the very solver under test, so a plant
that weakens a rung changes the corpus along with the verdicts. ABCD is the case:
silencing its runs rung left all 24 board comparisons green, because the
weakened solver dealt only boards it could finish, and only the census (and 11
of the differential's 18 fixtures) went red
([`abcd-ladder.test.ts`](../../src/games/abcd/abcd-ladder.test.ts)). Plant a
rung before trusting the board comparison to see it.

**A rung can fire often and still not be needed, and then only the census sees
it.** Tents' diagonal-pair elimination fires on most Tricky boards (on 34 of
40 at 10x10), but other rungs reach the same conclusion on all but about one
Tricky board in fifty. Silencing it left every board comparison and the whole
frozen differential green; only the census went red
([`tents-ladder.test.ts`](../../src/games/tents/tents-ladder.test.ts)). So a
rung's firing count tells you it runs, not that anything depends on it. To
find out whether a board depends on it, solve with the rung silenced and see
whether the board still finishes.

**Give a Tricky deduction its own rung when upstream folds it into an Easy
sweep.** Upstream Tents runs the diagonal pair inside its tree sweep and the
neighboring-line reading inside its line count, each behind a difficulty test.
As one rung each, a Tricky firing is counted against an Easy name, and a
census cannot say whether the Tricky half is ever reached. Split out, each is a
rung with a Tricky `tier` that runs after the Easy rungs have stalled. That
changes when it runs, not what the ladder concludes on a ladder of sound,
monotone rungs, and the board comparison at every cap proved it. Have the split
rung write only what the Tricky half deduces. If it also wrote what the Easy
rung would find, those writes would be counted against the Tricky rung too.

**The census costs the adopting game one optional parameter**, forwarded straight
to `runDeductionFixpoint`'s `firings` sink; the runner does the counting. That is
the whole of it — if you find yourself wrapping the ladder in a closure to
observe firings, the runner already does it
(`return-the-firing-tally-from-the-runner` deleted seven such wrappers). The
parameter is production surface a test supplies, deliberately: a rung's
reachability cannot be observed from the game's own results, which is this
section's premise.

### What the runner does not carry: the record

**The runner carries the loop — the ordered pass, the cap, the restart, the
grade, the budget — and not the record.** A technique's `run` returns a number
and the runner is oblivious to what the firing recorded; each hinting game
threads its own recorder through its rungs. That cost scales with the
**premises** the rungs hold, not with the rungs, and adopting the runner does not
reduce it (measured by `add-tracks-hint`).

**That is why a technique is not split into `find` / `apply` / `narrate`**, the
recurring proposal for making a technique that fires without narrating fail to
compile. It splits at the rung, and narration splits *below* the rung: one Tracks
rung, `update-flags`, holds five local rules, so a `find` returning one firing
would either break it into five techniques — changing what a tier means, and the
grade with it — or leave the per-premise early return exactly where it is
([`hints.md`](./hints.md) § "A rung is not a premise, so return per premise").
Towers was the first game to need that return and Tracks the second. If there is
a move left at this end, it is *grade these premises together, narrate them
apart*.

**A proposal for the split has to say what it buys beyond the hint walk**, which
already delivers its promise behaviorally: `hint-resume.test.ts` walks each
game's own hints to a solved board — every preset, in the slow tier — so a
firing nothing can narrate fails the walk. A compile-time guarantee is genuinely
stronger, since it holds for the board nobody generated; the open question
(recorded 2026-09-09) is whether that margin is worth changing the contract every
technique implements. The standard of evidence is the one that withdrew the
gesture table
([postmortem](../../openspec/postmortems/2026-09-05-gesture-table-withdrawal.md)):
its benefit had already shipped, derived from behavior, and the declaration
would only have re-declared it.

### Where the fixpoint does not fit

**The ladder *shape* is near-universal; the bookkeeping wrapped around it is
per-game — and that bookkeeping is often what decides which puzzles exist. A
solver whose loop *looks* like this one is not evidence that it *is* this
one; the differential is.** This module's own header used to overclaim ("the
one loop every logic game hand-rolled") and the claim did real damage: it
turned "does this game fit?" into "why has this game not been adopted yet?"
and produced two separate handoffs asserting Loopy fits when it does not.

**A no-go is re-derived when the contract changes, never carried forward** — and
this rule has now paid for itself twice, both times against a list written here:

- `declare-deduction-techniques` gave a technique its own `tier`, and **Unruly**
  stopped being a no-go (it had been listed as "grades by difficulty constant,
  not rung index").
- `re-derive-the-fixpoint-no-gos` then read the five remaining solvers instead
  of their recorded reasons, and **three of them had never needed anything
  added**. Singles, Clusters and Spokes all adopted with no new option on the
  runner. The reasons had been written against a runner that graded by array
  position, and were then read as facts about the games.

**So the test for a reason is: does it name a promise this runner makes that the
game must break?** A reason that describes a loop's *syntax* — "drains a queue",
"three-valued early-out", "grades by a constant" — is a description of C-shaped
code and is not evidence. Two survive that test:

| Game | The promise it breaks |
| --- | --- |
| **Loopy** | *A pass attempts every technique at or below the cap* — the central promise, the one that makes one firing = one hint step and grading honest. Each Loopy firing reports the cheapest rung that could use the new information, and the next pass skips techniques below it. It **transcribes mechanically** (three closures over a mutable pair), and that is the argument against: today the protocol is four lines in one place labeled load-bearing for which boards generate; transcribed, it satisfies the interface while hiding inside it. |
| **Lightup** | *Return after first firing.* There is no ladder: its two techniques are interleaved **per cell** inside one grid scan whose order is load-bearing, and the pass sweeps the whole grid before restarting. Wrapping the fused scan in a single technique buys indirection and no shared behavior — a one-rung ladder has no tier, no cap and nothing to restart. |

Do not "adopt" one of these onto the runner to tidy the codebase: a
refactor that changes any solver verdict changes which boards exist, and the
frozen differentials will say so (see
[Solver-gated generation](#solver-gated-generation)).

**Tell** that a no-go has genuinely dissolved rather than merely looking
dissolvable: the adoption needs **no new option on the runner**, and the game's
byte-match differential passes untouched. That is the test Unruly, Singles,
Clusters and Spokes met, and the two above do not.

**Tell** that you need the hatch and not a redesign: you can name the promise
your loop must break, and it is one of the two in the table. **Tell** that you
don't: your loop merely *looks* different. A cost accumulated across firings, a
flag standing in for a `-1` return, a pre-pass at the top of each iteration, a
verdict richer than a boolean — each reads as structural and each has adopted,
because a technique can hold state and guard itself (the exemplar table above
names where). Spokes' accumulator was once listed as a hatch case and turned out
to be an early-out, not a grade. So did ABCD's "sweeps the whole ladder before
restarting": its loop runs its first two techniques in one pass, but the first
only retires lines and places nothing, so trying it again before the second, as
the runner does, finds nothing, and the two walks are the same
(`add-abcd-hint`). The hint-assessment audit's class B, "sweeps the whole
ladder before restarting", was that one label on three games, and it was wrong
for all three. Tents' loop restarts after every sweep that fires. Pearl's
seemed to run its Tricky rung in the same pass as an earlier stage that had
fired, but the `continue` that suggested it sits in an Easy-only branch that is
only reached when nothing has fired. It was dead code, and the stage before it
had already restarted (`certify-the-tents-and-pearl-ladders`). **Read the loop,
not the reason somebody recorded for it**, and when a `continue` looks as if it
decides the walk, check whether anything can reach it.

#### What a bespoke loop still owes

A bespoke loop is part of the design, not a failure of it. Three obligations,
stated per game rather than assumed, and normative here — `engine-helpers`,
"A bespoke loop carries three obligations".

| Obligation | Loopy | Lightup |
| --- | --- | --- |
| **Narratability survives** — every accepted board is walkable to completion by a hint | met — the hint runs the solver's own rungs with a recorder, trying the tiers easiest first (`nextFiring`), Loopy is enrolled in every cross-game hint guard, and `loopy-hint.test.ts` walks every tiling at Hard to solved | met — `deduceHintPlan` walks the same `dosolve` with a recorder, and Lightup is enrolled in every cross-game hint guard |
| **Grading stays honest** — tiers bind to real technique differences | met — `dlineDeductions` unlocks at Normal, `linedsfDeductions` at Hard, and generation is capped at the requested tier | met via `flagsFromDifficulty` |
| **Budgets apply** — non-termination fails loud | met — `nextFiring` ticks the hint plan's `stepBudget` once per rung call, on the recording path only | met — `solveSub` ticks a `stepBudget` on the recorder path only |

## Guess-free generation

**An explained hint can exist only if the board is solvable by pure deduction
— so guess-freedom is a *generation* policy, not merely a hint policy**
(owner decision, 2026-06-24; normative home: the `engine-difficulty`
**Narratable-deduction generation policy** requirement). A hint that falls
back on the known solution or a backtracking search isn't teaching a *why*;
it's revealing the answer.

- **Every difficulty tier a logic puzzle ships MUST be solvable by its
  deductive solver with zero guessing**, enforced at generation time: a board
  is accepted only if the deductive solver (no recursion/backtracking) solves
  it uniquely. Exemplars:
  [`range/solver.ts`](../../src/games/range/solver.ts) (keeps a board "only
  if uniquely solvable without any guessing") and
  [`unequal/generator.ts`](../../src/games/unequal/generator.ts) (caps
  assembly below the recursive level).
- **The one sanctioned exception is a tier explicitly named "Unreasonable".**
  An Unreasonable preset MAY require guess-and-backtrack, and its hint is
  correspondingly allowed to be non-deductive on those boards
  ([`towers/index.ts`](../../src/games/towers/index.ts),
  [`keen/index.ts`](../../src/games/keen/index.ts)). No other tier name
  (Easy/Normal/Hard/Tricky/Extreme/…) may require guessing.
- **Movement / objective games are out of scope.** Fifteen, Sixteen, Flood and
  Untangle are always solvable and carry no deductive "why"; their hints are
  imperative/heuristic by design (hints.md § "Non-deductive (heuristic) hints"),
  and Untangle's narrated objective with a solution fallback is the sanctioned
  non-deductive form.

### No option switches the generator's checks off

**The only way a board may need trial and error is a tier named Unreasonable,
and no board may be unsolvable.** Upstream offers a checkbox in five games that
deals a board nothing has checked (Mines' and Same Game's "Ensure solubility",
Net's and Rectangles' "Ensure unique solution", Pearl's "Allow unsoluble"), and
a tier in a sixth that does the same (Dominosa's "Ambiguous"). A
port does not carry such an option: the generator always applies its checks,
and the params codec reads past the letter upstream writes for it, so an ID
that asks for an unchecked board deals a checked one. The reason is not only
the hint. A board with several answers has no mistake check (§ "One answer,
even when it is hidden"), and most boards dealt unchecked have several: with
the box off, the hint ran out on 103 of 150 Rectangles 4×4 boards and 67 of 80
Pearl 6×6 boards (measured 2026-10-04).

**Loading holds a board to the same promise.** `loadDesc` refuses a board the
game's own solver cannot solve:

- a tiered game is asked through its difficulty contract, and the board loads
  when some cap solves it, whatever tier its ID states. Unreasonable is a cap
  like any other, so a board that needs trial and error loads exactly in a game
  with such a tier. A board no cap solves is refused with
  `DESC_NO_SINGLE_ANSWER` where the game has that tier and `DESC_NOT_DEDUCIBLE`
  where it does not, since only there is trial and error what is wrong;
- an untiered game answers `Game.finishesByDeduction(state)`, and
  `registerGame` throws for one that leaves it out, since a missing answer
  used to read as yes and Palisade opened a board with no clues on it.

**An untiered game gives one of two answers.** Where nothing is deduced (a
sliding puzzle, a search, a guessing game), `nothingToDeduce`
(`engine/hint-finishes.ts`). `untiered-load.test.ts` holds that answer to the
game's code: it is given exactly by the games whose hint cannot end in
`DEDUCTION_EXHAUSTED`. Where the game deduces and still has no tiers, a test
of its own, and Mines is the one such game: its answer is hidden, so a board
its deductions do not finish has several layouts that fit what is showing and
no search proves it has one. Every other deductive game has tiers, at the
least Easy and Unreasonable (§ "Giving a deductive game an Unreasonable
tier").

**A deductive game's lowest tier asks the hint as well as the solver**
(`hintFinishes`, or the game's own walk of its hint engine): the hint, played
from the opening a whole plan at a time, ends on a solved board. It asks the
thing a player meets, and it is cheap: under 30 ms on the largest preset of
each of eight games measured, against a deal of up to 1.8 s (2026-10-10).

**Before a tier asks the hint, deal thousands of boards and ask it of each.**
It turns away a board the hint cannot finish, so a generator that asks only
the solver will have dealt boards it turns away, and a player may hold one.
Filling was the case: its solver finished one dealt board in about 480 that
its hint did not, which 762 boards did not show and 6,688 did, and it took the
hint's walk only once its hint kept the solver's run (below).

**The hint's refusals are what that walk reads**, so a hint that meets a board
it cannot finish returns a refusal and does not throw.

Upstream's own generator fails this in one place: its Mathrax Recursive tier
accepts a board with several answers, and all three such fixtures are refused
(`upstream-descs.test.ts`).

**The lowest tier has to ask the hint, because a solver can be more than the
hint knows, and a hint more than the solver.** Net's and Rectangles'
generators deal as Easy only boards their *hint* finishes (`finishes`,
`rungsFinish`), and a solver can settle a board its hint cannot, so a board
upstream dealt with its checks on can load here and still stop the hint. The
fix that needs no break is the doctrine above: one deduction engine, so the
hint knows what the solver does. `close-the-solver-hint-gap-in-net-and-rect`
took that route and measured it on boards the solver settles (2026-10-04).
Net's hint left 150 of 1,510 unfinished and now leaves none of 23,100, once
its seal rule followed a wire through tiles not settled yet. Rectangles' left
20 of 2,260 and now leaves 3, once a line recorded a placement that is ruled
out; the three need placements ruled out that no line can record. That
recording also took Rectangles' hint past its solver: it finishes boards the
solver stops on. So Net's Easy is the solver's verdict and the hint's, and
Rectangles' is the hint's with one answer proved by the search. A board with
one answer that the hint does not finish opens as Unreasonable in both: about
one Rectangles ID in 750 that upstream's generator writes, and no Net ID
found.

**Find the gap by tracing, and size the sample before calling it closed.** Log
every elimination the solver makes, then ask the hint's engine, at the state
where it stalled, whether it still holds what the solver just dropped: the
first disagreement is the missing deduction. And a first sample of 1,510 Net
boards read as a clean zero while one board in about 700 still stalled, which
only 22,600 showed ([`method.md`](../method.md), on a census that finds zero).

**Where the solver's own rule is what stops firing, the hint keeps the
solver's run from the clues.** Filling's hint replans from the board at every
step, and its candidate elimination is not monotone: a square filled away from
the rest of its region reads as a region of one with a long reach, and brings
its number back as a candidate where the clues alone had ruled it out. The
trace is the same one turned round: log every fill the solver makes from the
clues, and take the first that the solver, restarted from the stalled board,
no longer makes. No rule was missing, so there was none to add, and the
technique cannot be made monotone without knowing which region a lone square
belongs to. So when replanning finds nothing, the plan takes the next fill of
the run from the clues whose square is still empty
(`deduceHintPlan` in [`filling/solver.ts`](../../src/games/filling/solver.ts)).
Every fill before it is on the board, so the board is a correct superset of
the one it was deduced on and the step is as true there; its evidence is read
again from the board it is shown on. That is a guarantee and not a census: the
run from the clues fills every square, so the plan finishes every mistake-free
position, the player's own included, and the generator can go on asking the
solver alone. Reach for it only where the stalled step is the solver's own
deduction. A rule the hint never had is still a missing rung.

### Giving a deductive game an Unreasonable tier

**A game whose deductions finish every board it deals can deal a second kind:
a board with one answer that they do not reach** (owner, 2026-10-10, so that a
player meets "trial and error" only where they asked for it). Pattern was the
first, and [`pattern/`](../../src/games/pattern/) is the copy to follow. What
is the same in every such game is `engine/answer-search.ts`, and the game
writes three things for it: its deduction with a verdict, what to assume where
that stops, and a generator. What the tier is made of:

- **A search that counts answers to two**, by trial and error over the game's
  own deduction (`searchAnswers`). Its four verdicts are one answer, several,
  none, and out of reach once a budget of positions is spent. The deduction
  alone cannot stand in for it: stopping short, it has shown neither a second
  answer nor none. The game gives it `deduce`, which says solved, stuck or
  contradiction of a position, and `assume`, which divides a stuck one by one
  undecided thing: a square each way in Pattern, a cell's letters in a game
  with more than two.
- **A generator that keeps a board only where the deduction stops short and
  the search says one.**
- **The contract** (`searchTierContract`): the lower cap is the game's
  deduction finishing the board and its hint finishing it too
  (`hintFinishes`), and the upper cap is "the search says one". The game has
  no `finishesByDeduction`, which is an untiered game's.
- **Solve and the mistake check take the answer from the search**, at either
  tier, cached on the board's shared part (`answerCache`). Solve
  (`solveFromAnswer`) says `MULTIPLE_SOLUTIONS` or `NO_SOLUTION` where the
  search proved it, which is what refuses such a board at load.
- **The hint does not change.** It already ends in `DEDUCTION_EXHAUSTED` where
  nothing follows, and the midend lets that through on a tier named
  Unreasonable.
- **The params** take `searchTierItem` and the codec `searchTierSegment`, so
  the tier is always in the full form and never in the shared one, and a
  string from before the tiers reads as Easy.
- **The order `assume` gives its positions in is part of the budget.** A
  position is counted when it is tried, so trying the likelier assumption
  first is what keeps a board inside the budget, and changing the order
  changes which boards a pasted ID is refused for.

What Pattern taught, each a thing to measure before the next game:

- **Ask whether the deduction can say "impossible" at all.** A search finds a
  wrong assumption only as a contradiction. Pattern's line solver had no such
  verdict: on a line nothing fits it deduced nothing and reported no change,
  which is harmless while every board is consistent and fatal under a
  hypothesis. Give it the verdict first, and plant its absence to see the
  tests notice.
- **Count how many stuck boards have one answer.** Most have several. Of the
  pictures Pattern's lines left undecided, 8 of 206 had one answer at 10x10
  and 165 of 1,813 at 30x30. The rate says whether the tier is worth dealing
  at a size.
- **Enumerate the smallest sizes for the refusal.** Where every board of a
  size can be tried, try them: no Pattern picture up to 3x3 needs search and
  has one answer, which is a proof and is kept as a test, where a count of
  tries would have been a sample.
- **Count against an answer count with no search in it.** The test's counter
  shares nothing with the deduction or the search, and is what says the two
  agree a board has one answer.
- **The search budget decides which boards exist**, since a board that needs
  more is thrown away when dealing and refused when pasted. Size it from the
  positions dealt boards need, in positions, and say where it is defined that
  lowering it refuses boards in saved games.
- **Time the sizes past the menu.** A draw that fails costs up to the whole
  budget, and the share of draws that fail grows with the board. Pattern deals
  in about 10 ms at every preset, a second at 40x40 and tens of seconds at
  50x50.
- **Say how much of a board the hint will do.** The lines leave a median of 21
  squares of 100 undecided on a 10x10 and 651 of 900 on a 30x30. Neither is a
  defect, and a player choosing the tier at a size is owed the difference.

What ABCD, the second, added:

- **A step that strips a board runs it to the search's limit, so it takes a
  budget of its own.** ABCD hides clues while the board keeps one answer.
  Asked of the search at its full budget, every board came out at the edge of
  it: a median of 1,728 positions of 2,000 on a 6x6, where a board with every
  clue showing needs 9. Hiding now asks within 30. Any generator that removes
  clues, givens or walls "while still unique" has this shape.
- **An option the game already had is a second axis, and its label must not
  borrow the tier's words.** ABCD called its hidden clues "Hard" and their
  absence "Easy". With a tier named Easy that reads "Easy Easy", so the
  option's label became "clues hidden" in the tail, said only when on.
- **Where the option removes information, the smallest boards gain the tier
  they lacked.** No ABCD board of up to nine squares is Unreasonable with
  every clue showing, and every such size is with clues hidden. A refusal for
  a size states which.
- **The tier wants its own size bound, and the Easy bound's exceptions may
  reverse.** What limits an Easy deal is how seldom the ladder finishes a
  fill. What limits an Unreasonable one is the search's cost and the share of
  stuck boards with several answers. ABCD's thin boards are the quick ones at
  Easy and the slow ones at Unreasonable with many letters.
- **Finding no board can be an ordinary answer here.** Between the sizes
  proved empty and the ones that deal at once are sizes nobody has
  enumerated, and there the deal's deadline answers
  (§ "Every retry loop is bounded"). The generator states no bound for it.
- **Read the ledger's board before deleting it.** Like Pattern's, ABCD's
  board in `untiered-load.test.ts` had no answer at all.

What Crossing, the third, added:

- **Ask what one more deduction would finish of the boards the tier deals.**
  Crossing's search needs a median of three positions: one square of two
  digits, tried each way. A search that shallow is a rule the solver lacks.
  A second implementation with one rule added (a number that still fits only
  one run goes there) finished 247 of 300 such boards at 5x5 and 208 of 248 at
  11x11. The tier is still dealt, the help says what to look for before
  trying a digit, and the rung is its own change. Run the second
  implementation without the rule first: it has to finish exactly the boards
  the solver does, or the count is of the instrument.
- **The tier is rarer than Easy by a steady factor, so it takes the Easy
  bound's shape and a smaller number.** An Unreasonable Crossing board is
  about five times rarer than an Easy one at every shape measured, since a
  draw has to survive the same rejections first.
- **Measuring the new bound re-measures the old one, on shapes the old one
  never tried.** Crossing's Easy bound was an area, taken from near-square
  boards. Thin boards inside it never dealt (2x60, 3x75, 4x56), and its
  rarest admitted board was accepted once in 14,000 draws against a retry cap
  of 10,000. Sweep the shorter side as well as the area, and size the retry
  cap from the rarest board the bound admits.
- **A dead position may already be handled by `assume`.** Crossing's solver
  could not say "impossible" of a square with no digit left, and the search
  was right without it: that square is the one with the fewest candidates,
  and it divides into no positions. Give the solver the verdict anyway, and
  test the verdict on the solver, since no test of the search can see it.

What Filling, the fourth, added:

- **A generator that strips clues is one strip with two questions.** Filling
  hides clues from a full board while something still holds: the solver
  solves at Easy, the search proves one answer within the hiding budget at
  Unreasonable. Stripping an Easy board further was tried first and is worse:
  it threw away half its boards at 7x9 and could not reach the 2x2 with a
  lone 1, which the Easy strip never leaves standing.
- **The hiding budget is the tier's difficulty, and what a Check finishes
  sets it.** At 10 positions a number that breaks the rule the moment it is
  written settled 24 of 66 dealt boards, which is a deduction the solver
  lacks. At 30 it settled 3, and a one-level trial settled 63. Take the
  budget where the boards stop being a missing rule.
- **A game with no size bound has one nobody measured.** Filling's fill is
  thrown away whole on a clash, and it ran its retry cap out one deal in
  twenty at 20x20 and every time at 25x25, at Easy, since the port. Count
  draws by area and by shape before trusting "any size".
- **Plant out each arm of the new verdict.** One of Filling's three, an
  empty square no number fits, changed no test when removed: `assume`
  already divides it into nothing. Where only the search reads the verdict,
  delete such an arm.
- **Enumerate clue sets, not dealt boards, for the smallest sizes.** It
  proves a refusal (no 1x3 or 1x4 board has the tier) and it shows what the
  generator cannot reach where a board exists.

What Mosaic, the fifth, added:

- **Which board the strip starts from is decided by what the hint is left
  with.** Filling strips a full board by the search. Mosaic stripped that way
  mostly has no number its rule can start from, and the rule left a median
  of 90 squares of 100 undecided. It starts from an Easy board, which leaves
  58. Measure both before copying either.
- **An option that trades clues for speed stops the strip early at the new
  tier.** Without aggressive generation Mosaic hides until the first clue
  whose loss stops the rule, so the board keeps its numbers and a 100x100
  one still deals in a third of a second. With it, the tier has an area
  bound of its own and the refusal names the option.
- **A deduction that waits for a determined position needs its early form.**
  Mosaic's rule called a block contradictory only once every square of it
  was decided. The search is right either way and slower; the verdict is
  seen by giving the search one position.
- **Sweep the shorter side at Easy even where the bound is an area.**
  Mosaic's only bound was 10,000 squares, and no board three to nineteen
  across is dealt past a length inside it (3x40, 8x100 and 12x300 gave none
  in thousands of pictures). The bound is a table by shorter side.

What Palisade, the sixth, added:

- **Ask the deduction's own "solved" before asking what is open.** Palisade's
  solver calls a board solved once the walls are a whole division, with
  squares of one region still to be joined. A verdict that looked for
  undecided edges first called those boards stuck, and an Easy board took
  five positions where it takes one. Count the positions an Easy board
  takes: it is one, or the verdict disagrees with the solver.
- **Pin each part of the verdict by a position count on a fixed board.** A
  part that only prunes changes no answer, so no test of answers sees it.
  It changes how many positions a board takes, and that decides which
  boards are dealt. Plant each part out against a list of literal boards,
  since the generator's own boards move with the verdict, and keep one
  board per part with its exact count.
- **A bound that needs its own sweep is its own change.** Palisade dealt no
  board past a number of regions that depended on the region size and the
  shape, and had no bound. A table read off the numbers this change turned up
  would have refused boards that deal, and the change that took them up drew
  no bound at all (§ "Unlucky, impossible, and load-bearing validation").

What Separate, the seventh, added:

- **A board with nothing to strip is swapped.** Separate's board is all
  letters. Its Unreasonable board is an Easy one with pairs of letters
  swapped inside a dealt region, each while the search still proves one
  answer within the budget. A swap inside a region keeps the dealt division
  an answer, as a strip keeps the dealt clues true.
- **Stopping at the first step that stops the solver deals a missing rule.**
  That was tried for the hint's sake: it leaves 27 edges of 60 undecided
  where the whole pass leaves 44. One join and a look settles a quarter of
  those boards, against 3 in 100 after the whole pass. Count what a Check
  finishes at each stopping rule, on 150 boards and not 30: at 30 the two
  could not be told apart.
- **Where the solver keeps an invariant, the verdict is one part.**
  Separate's first rung walls every pair that shares a letter before
  anything is joined, so a region is never too big and never holds a letter
  twice. All that is left to call impossible is a region with nowhere to
  grow, and without it a 6x6 board takes 659 positions for 11.
- **Look for the proof before the enumeration.** No board in two letters has
  the tier at any size: its regions are a perfect matching of As to Bs, and a
  matching that is the only one always has a square with one partner left.
  The test still tries every fill of the small boards, and the refusal
  covers the sizes no test could.
- **Check a board written by hand against the counter.** Four rows of ABCD
  was to be the board with several answers and the solver finishes it; a
  second try had one answer too.
- **Sweep by a rate with a low cap, not by time to failure.** A cell that
  never deals costs its whole retry cap, minutes at a large size, and a run
  that reports at its end said nothing in twenty. Counting divisions tried
  for each board dealt, capped at 300, swept thirty-three shapes in one
  short run. It found that Separate dealt only a handful of sizes at either
  tier, which was the generator's doing and is mended (§ "Unlucky,
  impossible, and load-bearing validation").

What Signpost, the eighth, added:

- **A solver that is sound from an empty board may not be from a position.**
  Upstream's solver was only ever run on a board with no link made. Run from
  a position with chains on it, its numbering took a blank square inside a
  chain for a given number and forced links from that, and 3 to 9 in 100 of
  the boards the search called unique had two answers. Nothing in the search
  could see it: every Easy board still took one position. The counter with no
  search in it saw it on the first run. Run that agreement test on the
  tier's own boards before measuring anything, since every number taken
  before the fix had to be taken again.
- **Fix the deduction, not the search.** The fault was one branch of the
  numbering, mended where it was. The Easy boards for every recorded seed
  are the same, which the differential shows, and no Easy board in 4,000
  had a second answer before the fix.
- **A solver with "impossible" already needs no verdict written.** Its three
  results are the search's three.
- **Where a move clones every array, share the part no move changes.** The
  answer is kept per board, keyed on something every state of a game holds
  by reference. Signpost copied its arrows on each move and had nothing to
  key on; its states now share them.
- **A strip can carry the tier.** Lines of one square do in Signpost, since
  an arrow skips squares: 1x6 is its smallest Unreasonable board, where a
  2x4 has none. Enumerate the small shapes one by one and refuse what the
  enumeration says, not a rule about strips carried over from another game.
- **A thin board can cost more than a square one of its area.** An arrow on
  a long line has more squares to lead to: 1x225 takes 6.3 s where 15x15
  takes 0.9. The bound is an area and a longer side.

What Sticks, the ninth, added:

- **Which strip is faster is the game's, so time both.** Signpost strips an
  Easy board further and Sticks strips the full clues by the search, each
  because the other way was measured slower in that game: five times slower
  in Sticks (7.6 s against 1.5 at 10x10), twice in Signpost the other way
  round. The hint was left about the same either way in both.
- **A sample refuses nothing.** No 2x3 or 2x4 Sticks board was dealt in
  120,000 fills, and a refusal was written for both. The test that holds a
  refusal to running the generator out dealt a 4x2 board at once with another
  symmetry, and walking every 2x3 board found some with the tier. Only 2x2
  has none, and only 2x2 is refused. A size the generator seldom reaches
  gives up in a second, which is an answer; a refusal says no board exists.
- **Vary every option before calling a size empty.** The sample had one
  symmetry and one share of blocks, which is one corner of what a size can
  be dealt as.
- **A hand-written board is wrong until the counter has seen it.** Three of
  this change's literal boards were: a row of ABCD in Separate, a 4 beside a
  1 here whose line could run the other way, a 2x2 board counted as four
  fills that has eight.
- **A deduction that is a Check leaves a shallow tier.** Sticks' solver
  already tries a line and looks. Its Unreasonable boards need a median of
  three to five positions, and one trial that is followed through finishes
  every one. A trial that only looks one square further finishes three in
  ten, which is a rung to weigh and is noted for the owner.

What Net, the tenth, added:

- **A generator that repairs a board toward Easy passes the tier on its
  way.** Net has nothing to strip and nothing to swap: it draws a network and
  rewires the part the solver could not settle until it can. Keeping a
  network as first drawn where it is stuck with one answer, Pattern's way,
  finds one draw in 50 to 300, since a network the solver stops on nearly
  always has several answers. Asking the search after each round of rewiring
  deals in 2 to 50 ms at every menu size. Look for the loop that already
  moves a board toward one answer before writing a new one.
- **Sweep with a line logged per cell, and a time limit inside the loop.**
  The first sweep reported at its end and was killed with nothing to show.
  The second logged a line a shape and stopped on its seventh: an Easy 2x5
  deal that never returned. A deal that hangs is found by the sweep only if
  the sweep says where it is.
- **A hang in a dealt size is found by sweeping the small ones.** The loop
  finder never came back from a graph with two edges between one pair, which
  Net's shuffle hands it on a board two wide: about one 2x5 deal in
  thirteen, at Easy, since the port, and upstream's C has the same shape.
  The fix is in `engine/findloop.ts`, where every game that reads a loop
  shares it.
- **A claim about the solver in the handover is a thing to test.** The notes
  for this game said the solver might call a looped grid solved. Of every
  grid of the four tile kinds up to 3x3, each of the 2,195 it settles is a
  network. The search still checks, since "solved" has to mean checked, and
  its comment says no board was found to need it.
- **Plant out the order as well as the choice.** A line that sorted each
  tile's turnings, so that the positions a board takes would not depend on
  how it is turned, changed no test when removed, and rightly: proving one
  answer visits every branch, so their order cannot move the count. Which
  tile is assumed does, and the pin sees that.
- **An option that gives information away bounds the tier.** Net's walls
  tell the solver what crosses a side. With every wall drawn it settles every
  board, and past three in ten an Unreasonable deal is slow or gives up. The
  generator's own retry loop around "the walls settled it" ran 10,000 deals
  before giving up, five minutes; it now shares one bound with the draws.
- **The slow shapes need not be the thin ones.** On a wrapping board the
  ones with an even shorter side are slow: four wide stops dealing past 30
  long and six wide past 80, where three, five and seven wide deal in
  milliseconds. A sweep of the shorter side that skipped every other width
  would have read one of two wrong bounds.

What Range, the eleventh, added:

- **The game's live error check may be the search's "impossible".** Range's
  three rules only fill squares and never say a position is wrong. Its
  checker, which reddens a number that can no longer see its count while
  the player works, already says it of a board with squares still
  undecided. The search calls that a contradiction, and no verdict was
  written.
- **Pin the early verdict on a board that waits for it.** Planting it out,
  so that a position is judged only once full, changed no test: the board
  the position pin was taken on takes nine positions either way. Forty dealt
  boards a size were counted both ways to find one that differs (three
  positions against five on a 4x4, 13 against 231 on a 9x13), and that 4x4
  is the pin.
- **A generator that cannot reach a board is not a size without one.** The
  generator ran its bound out on 3x3 every time. Walking every set of clues
  found 176 boards of it with the tier, none with the symmetric clues the
  generator keeps. The size is not refused, a pasted one opens, and a deal
  gives up in a second. Count what the walk finds by the generator's own
  constraint as well as in all.
- **A strip can have a proof where the walk only has lengths.** A shaded
  square anywhere but an end of a strip cuts it in two, so every number
  sees the same run, and the rules settle every strip with one answer. That
  refuses a strip of any length, where the walk covers three.
- **Where the strip keeps a symmetry, strip further by the same pairs.**
  Range hides its clues in pairs turned half way round, and an Unreasonable
  board keeps that by hiding further pairs. Hiding from the full board by
  the search was slower here and left the hint less (124 squares of 176
  undecided against 90), the other way round from Sticks.

What Rectangles, the twelfth, added:

- **Ask which of the solver and the hint knows more, and grade by the
  hint.** Rectangles' hint rules placements out that its solver does not,
  since it was taught to in order to close the gap the other way. Dealing
  boards "the solver stops on", the hint finished two to eight in ten of
  them. A board the hint finishes needs no trial and error whatever the
  solver says of it, so Easy is "the hint finishes it and it has one
  answer", and an Unreasonable deal is one the hint does not finish. A board
  the solver finishes and the hint does not opens as Unreasonable, where it
  was refused.
- **A solver's verdict may forget what its loop found.** Upstream's
  recomputes its answer from how many placements each number has left, after
  a loop that breaks off on meeting a square no rectangle can cover. From
  the opening that is harmless. Under an assumption it calls a position
  with no answer ambiguous or solved. The search reads the break itself, and
  planting that out fails the count's agreement at once.
- **Where the generator steers its clues, the tier is the same draw
  unsteered.** Rectangles' solver chooses where each number sits so that it
  can finish. Dropping each number on a square of its rectangle at random
  and keeping the stuck boards with one answer deals in 17 ms at 7x7 and
  0.65 s at 19x19. Moving the numbers of an Easy board, Separate's way, was
  two to four times slower.
- **A menu has a length.** Seven sizes at two tiers is two lines more than
  a section holds. The two largest are on it at Easy alone, with the reason
  where `presetGrid` asks for it.
- **A rare small board wants more draws, not a refusal.** A 3x5 board has
  the tier once in 6,500 draws and a 4x4 has it and was not dealt in 10,000.
  The deal's deadline gives it them, since it counts no draws.

### Check, Tactic, Search

**The line** (owner, 2026-08-12, `audit-guessing-tier-names` design D9): a rung
is classified by **whether its reasoning is a bounded run of individually
glanceable steps** — *not* by whether a trial or a search was involved.

| | shape | tier | hint |
| --- | --- | --- | --- |
| **Check** | place a value and *look*: one clue, one count, one neighbor breaks immediately | any | narrate directly |
| **Tactic** | a **bounded** chain of forced consequences to a named endpoint | Tricky / Hard / Extreme | narrate as a multi-leg walk |
| **Search** | run the whole solver from a hypothesis, or branch and backtrack | **`Unreasonable`** | refuse |

> **The `tier` column is a SHALL that nothing enforces — check it by hand.**
> `hint-quality.test.ts` guards the *hint* column (a Search must never be
> narrated) and its header states what that cannot see; nothing anywhere reads a
> rung and asks whether the tier holding it is named `Unreasonable`, because
> "this rung is a Search" is a judgment about the code, not a property a test can
> read off it. For a game with no `hint()` the rule is therefore unguarded end to
> end. So when you add or move a rung, decide its class from this table
> deliberately and say so in the change — that decision is the whole enforcement
> mechanism.

- **Check** — Sticks' `sticksTry` (one tentative orientation, one validator
  call, no fixpoint) is the exemplar; so is Galaxies' "only one dot could own
  this cell", and Bricks' and Clusters' single-cell rungs. So is Seismic's
  `attempt`, which trials a candidate and asks every area whether it can still
  house its numbers — but whose every possible rejection is one area left with no
  home for the placed number, which the player can see without trialing anything
  (`hints.md` § "Deduce from the notes when the mistake check vouches for them").
- **Tactic** — `latin.ts`'s `forcing` (measured 3–12 implication links, median
  4–5), Clusters' lookahead (median 2–3 forced cells), Map's forcing-chain BFS.
  Legitimate at a middle tier; see `hints.md` § "The forcing boundary" for what
  its narration owes the player. Loopy's Tricky and Hard rungs are Tactics of a
  different kind: they never assume anything, but derive corners and pairs of
  edges, each one a local rule applied to a clue or a dot, and a line can rest on a
  chain of them (measured on Hard: median 2, p99 about 20, at most 28). Every link
  is glanceable, so the player notes corners and pairs in notes mode and the hint
  walks the chain one note per step (`add-loopy-notation`; `hints.md` § "Give the
  facts a notation (Loopy)").
- **Search** — Undead's `forcingPass` and Bricks' `solverRecurse` (both run a
  whole fixpoint / sub-solve from the hypothesis), Dominosa's
  `deduceForcingChain`, Spokes' **unbounded** look-ahead, every true recursion
  tier, and Galaxies' deleted rung — `refuteAssoc` ran the whole deduction
  fixpoint and could settle dozens of cells. *Nested* speculation (assume A,
  then within that assume B) is Search twice over.

**Classify by the bound a rung *guarantees*, not the depth it typically
reaches** — and read the **call**, not the function.

Spokes is the worked example, and it is the reason this paragraph exists. It
calls **one** function, `spokesSolverAttempt`, at two tiers, and the only
difference is the sub-tier argument: `DIFF_LIMITED` at Tricky, which stops the
sub-solve at `ACTION_LIMIT`, and `DIFF_EASY` at the top tier, which does not stop
it at all. Measured over 30 boards per configuration, they are **identical at the
median** — 2 deductions each — and the tails are not remotely alike: the bounded
one reaches at most 9, the unbounded one has a p90 of 11 and a **maximum of 35
hubs on a 36-hub grid**, i.e. it finishes the puzzle from the hypothesis. One is
a Tactic and one is a Search, and no amount of looking at typical boards would
have told you which was which.

Three consequences worth carrying:

- **A game's sweep must read each call site, not each rung's name.** The
  collection-wide sweep in `audit-guessing-tier-names` §2c filed Spokes as one
  entry shipping "at Tricky *and* Hard" — the function was read, the argument
  was not, and that mis-filing survived until the tier had to be renamed.
- **Where a rung is gated on a numeric bound, that constant is load-bearing for
  a tier's *name*.** Say so where it is defined, or the next reader retunes it
  as a performance dial and silently turns a middle tier into a search. See
  `ACTION_LIMIT` in `spokes/solver.ts`.
- **Two strengths of one rung emit the same words**, so a narration guard cannot
  separate them — the guarantee that the hint reaches only the permitted one has
  to be structural. Spokes asserts that planning at the top tier gives the same
  plan as planning at Tricky, with a control proving the equality is not vacuous
  (`spokes-hint.test.ts`).

**Two traps this replaces a blunter rule to avoid.**

*The earlier rule was "does the rejected trial propagate?", and it was wrong in
both directions.* It condemned thirteen rungs across thirteen games — six in
default preset menus — and half of them are perfectly followable chains. It also
missed that **a strategy game's hint is a search too**: Fifteen's is A\* over
slide moves, and nobody objects, because what the player is asked to accept is
*"this move serves the stated goal"*, not the search. That is a fourth,
orthogonal contract (**Strategy**: a stable subgoal plus the next move serving
it, justified by a monotone potential — `hints.md` § "Hold a stable subgoal"),
and it applies to untiered games: Fifteen, Sixteen, Inertia, Flood, Untangle.

*Check and Search look identical in a solver* — `try one value, ask the oracle,
take the other on INVALID` — so read what the oracle **does**: one validator call
is a Check, a fixpoint or a sub-solve is a Search.

**Practical consequence before writing a hint:** confirm the generator can't emit
a board the deductive solver can't crack at the shipped tiers. If it can, you
have three moves: gate generation to deduction-only, strengthen the deductive
solver so the hard tier survives, or move the Search boards under an
explicitly-named `Unreasonable` tier. **Never delete a tier to satisfy the rule**
— and check first whether the rung *is* the tier: Map's `Hard` has no other
distinguishing technique, so emptying it made the preset generate nothing at all
(10,000 retries, no error).

**A tier that names no boards is not a tier, and dropping its label is not
deleting a tier.** Bricks shipped `Easy · Normal · Tricky` where `Tricky` was the
same rung one level deeper, provably decided nothing, and had been refused at
generation for a whole change already — so once `Normal` had to become
`Unreasonable`, the readable ladder was `Easy · Unreasonable` and the third name
simply went. The three things that make that safe rather than destructive:

1. the encoded difficulty character still **decodes and round-trips**, so no
   game ID or saved game changes meaning;
2. `validateParams` still refuses it **with its reason**, so a player who arrives
   with such an ID is told why;
3. nothing a player could previously *play* is removed — the entry only ever
   produced an error.

Two things to do whenever a tier list shrinks:

- **Re-establish the guard you just dropped.** `difficulty-contract.test.ts`
  iterates the tiers a game *declares*, so an undeclared tier silently loses its
  cross-game coverage. Put the round-trip assertion in the game's own suite.
- **Check the list has one definition.** Bricks' difficulty contract and its
  custom-params dialog each hand-copied it, so the rename would have shipped a
  menu and a dialog that disagreed — the same defect Unequal had. A tier list is
  read by the preset menu, the contract and the dialog; it is written once.

### No un-narrated fallback

**A displayed hint step must name the technique that forces it; a game's hint
must never emit an unexplained catch-all** (e.g. *"only one arrangement
fits"*) for a deduction its technique set doesn't cover. The two compliant
ways to guarantee that, chosen per game **by measured cost**:

1. **Narrate everything the gate accepts** — promote any catch-all into an
   honest technique, even a non-local or tedious one (Filling narrates its
   global candidate-elimination honestly; Pattern's old generic `forced`
   fallback was promoted into a named single-line-intersection bottom rung,
   `remove-pattern-hint-fallback`). Keeps every generated board — and any
   byte-match differential — intact.
2. **Reject at generation** — accept a board only if the narratable
   techniques solve it to completion; retry away the rare board that needs an
   un-narratable deduction. This shrinks the generated set, so **measure the
   rejection rate first** (a teachable set materially weaker than the full
   solver can thin or empty a size/tier or slow "New Game") — and **re-grade
   the tiers** after the flip.

### Strengthening a solver instead of shipping guesswork

**When a game's shipped tiers turn out to need guessing, the usual right move
is to build the missing deductive rungs, then re-grade** — not to add an
Unreasonable tier on a hunch. The worked example is Undead
(`strengthen-undead-deduction`), which originally graded by *how much brute
force a board needs* and now ships a genuine ladder; it generalizes to any
non-Latin candidate game:

- **Exact counting** (Hall-type deductions off a global tally that is an
  equality): a type whose full count is placed is struck everywhere; a type
  whose candidate cells equal its remaining need forces them all; too few
  candidate cells is a contradiction
  ([`undead/solver.ts`](../../src/games/undead/solver.ts) `countingPass`).
- **Depth-1 forcing** (`forcingPass`): hypothesize one candidate, run the
  arc-consistency + counting fixpoint, eliminate on contradiction — deduction,
  per the line above, because the inner fixpoint never forces.

Then re-grade by which rung is needed, and accept a board only when the
deductive ladder solves it uniquely with zero recursion — verified
independently against the brute-force oracle. Two lessons that transfer:

- **Cap the ladder at the tier while grading** (`maxTier`): forcing is the
  expensive technique and a board the tier can't use is rejected anyway.
- **Measure the recursion-only residual before deciding to ship an
  Unreasonable tier.** Undead's came out exactly zero — every
  uniquely-solvable board is cracked by the ladder, and the boards the ladder
  can't solve are precisely the non-unique ones the uniqueness oracle rejects
  anyway. The data may say the ladder already suffices.

## Difficulty tiers

### The difficulty contract

**A game with tiers declares
[`Game.difficulty`](../../src/engine/difficulty.ts) — a
`DifficultyContract`: a `solveAtCap` that runs its solver from a fresh state
with the ladder capped.** Declaring it enrolls the game in the cross-game guards
(`difficulty-contract.test.ts`) the moment the field exists; an untiered game
omits it, exactly as a game without a solver omits `solve`. Read the module
header of `difficulty.ts` for why the verdict is the discriminated
`"solved" | "unsolved" | "impossible"` rather than the solvers' private
integers.

**The contract holds the solver, not the tier list.** The names, and how params
hold a tier (`tierOf`/`withTier`), come from the game's difficulty item
(`difficultyItem`) — see
[mechanics](./mechanics.md) § "Difficulty is a declared contract".

**Don't try to derive them from the technique ladder.** The framework fiction
proposed it and `declare-deduction-techniques` looks like the lever, but three
things independently defeat it, and the `engine-difficulty` spec refuses it so the
survey is not repeated: `DeductionTechnique.tier` is a *number* while a tier list
is *names*; `runDeductionFixpoint` **receives** `maxTier`, and every ladder in
the collection is an array literal built inside a solve from board state, so
there is nothing to ask at module load; and a tier is often not a rung at all —
five latin games put their top tier on `latinSolverRecurse` outside the fixpoint,
and Undead's only shared-runner ladder is its hint recorder, two techniques on tier 0 against three
offered tiers.

**`solveAtCap` stays per-game, and that was measured.** Across all 29 adapters
the only shared step is `newState(p, desc)`; the cap passes straight through to
the game's own solver and the verdict mapping is the per-game knowledge the
discriminated verdict exists to hold. The one genuinely shared mapping,
`latinVerdict`, is already extracted.

**Freshness of `solveAtCap` is load-bearing.** Reusing a live scratch is how
`grade-difficulty-tiers-honestly`'s first Ascent gate under-rejected — a
retained field deliberately weakened that solver and left side effects behind
for the next caller. A tier probe runs on state uncontaminated by earlier
candidates (the `engine-difficulty` requirement of that name).

**`solveAtCap` also runs whenever a board is loaded, not only while one is
dealt.** The midend checks a loaded board's tier against it (`engine-difficulty`,
"A pinned tier is kept or raised and never lowered" and the requirement before
it): an id without a tier (upstream's
game IDs omit it) is graded outright, and a tier pinned by an id or a save is
kept only if the board solves there,
because a build that once mislabeled a board wrote the wrong pin into the
player's autosave and remembered board. So a `solveAtCap` that disagrees with
the generator mislabels boards the player reopens, not just the boards it deals,
and it costs one solve on every reload.

### A tier means exactly its rung

**The generator-acceptance rule that makes a tier mean what it says: a board
is accepted for tier `t` only if it solves at `t` and does *not* solve at
`t − 1`.** That rule is written once, as
[`solvableAtExactlyTier`](../../src/engine/difficulty.ts) — use it instead of
re-spelling it (`grade-difficulty-tiers-honestly` had to spell it out four
separate times because there was nowhere to put it). Notes:

- **It asks the cheap question first** (solve at `t − 1` before `t`), which a
  retrying generator pays for far more often than the deep solve —
  `add-clusters-difficulty-tiers` measured this making the whole generator
  *faster than before it had tiers* (10×10 Tricky worst case 25.0 s → 10.9 s).
- **It takes a closure, not a `Game`** — a generator cannot import its own
  `index.ts` without a cycle, but it can always close over its solver
  (`cappedSolveFor` when you do hold a contract).
- **A tier that cannot bind is refused, not silently downgraded** — the
  `engine-difficulty` requirement of that name; two tiers were *removed* rather
  than left generating boards of a different difficulty than their label.
- **It is now checked cross-game.** `difficulty-contract.test.ts` deals a board
  from every preset whose tier the contract can read and requires its lowest
  solving cap to *be* that tier (`assert-that-tiers-bind`). Until then nothing
  compared the two numbers — the monotonicity test computed the lowest cap and
  used it only as a floor.

**Tell: the rule has two spellings, and a game's own tests only exercise one.**
A generator states tier acceptance in its own terms (`gradeMatchesTier`,
`solvableAtExactlyTier`, a hand-written `ret !== diff`); the game's
`DifficultyContract.solveAtCap` states it *again* for every cross-game consumer.
Nothing inside a game makes the two meet, so a `solveAtCap` that is **wider**
than the tier it names is invisible — the game deals correct boards and every
test it owns passes.

Undead is the worked example. Its Easy is arc-consistency **within
`EASY_MAX_ARC_PASSES` (3)**; a board needing more passes is Normal even though it
never leaves the arc rung. `gradeMatchesTier` had that bound and `solveAtCap` did
not, so all three of its Normal presets reported as Easy-solvable and the
collection's difficulty guards graded Undead against an Easy that was not
Undead's. The constant now lives beside the rungs in `solver.ts` and both readers
import it — **one spelling, because a second copy is what the defect was.**

So when you write a `solveAtCap`, check it against the generator's acceptance
rule line by line, and put any bound they share in one exported place.

**A grade belongs to a solve that finished.** The runner's grade is the highest
tier that *fired*, so on a solve that stalled it only says the solver ran out of
facts before needing more. Reading it as "too easy" rejects a board for lacking
clues. Tracks' generator did exactly that to its bare boards: it inherited the
mistake from upstream's 2020 one-solve speed-up, which also turned "solves one
tier down" into "stalls without the top rung firing". On 15x15 Hard, 95% of the
paths that reached clue-laying were rejected that way, and about one deal in
fifteen exhausted `retryLimit` (`deal-every-tracks-board`). Ask "does it solve at
`t − 1`?" as `solvableAtExactlyTier` does, or check `ret > 0` before reading the
grade.

### A size that cannot carry a tier

**A generator never settles for a lower tier than it was asked for.** Where a
size has no board that needs the tier, `validateParams` refuses the pair when
a board is to be dealt, and the generator trusts that (`engine-difficulty` spec,
"An unbindable tier is refused, not silently downgraded"). Upstream wrote the
other answer three ways, and each has been found here: a table of sizes that
deals the tier below (`if (w === 3 && diff > NORMAL) diff = NORMAL`), a count
of tries after which the tier drops (`MAXTRIES`), and a tier gate that small
boards skip (`spaces > 6 &&`). All three hand the player a board under a label
it does not need.

**Do not count a game's sizes in order to write a refusal, and do not size a
bound to one** (owner, 2026-10-10). A generator that finds no board is ended
by the deal's deadline, and the engine tells the player so after the same
wait in every game, with no line in the game ("Where no line can be named",
below; § "Every retry loop is bounded" for the deadline). That is the
default answer for a size that lacks a tier, and it costs nothing a game. A
refusal is written only where both hold: the absence has a reason that fits
in a sentence and is checked in a line (a strip, a board of one region), and
a player reaches it from the menu's own sizes or one step off them. A census
of a game's Custom corner, a table of the shapes it found, the tests that pin
the table and the change that files the cells beside it are per-game work the
player does not see, and the rules below are for the refusals that clear that
bar or exist already. Rectangles is the measured case: which stretched boards
carry Unreasonable turns on which areas can be drawn two ways on that board,
a 3x3 base carries it stretched to 6x6 and to neither 6x7 nor 5x5, and an
hour's count ended in no rule and the engine's sentence.

The followable form, for a refusal that clears it:

1. **Refuse only when dealing.** The check sits behind `full`, since boards
   dealt under the old label are in saved games and shared IDs, and a board
   that arrives with its desc is graded by what it needs, whatever its ID says.
2. **Say it with [`noSuchTier`](../../src/engine/difficulty.ts)**, so the
   sentence is the same in every game: *"No 3x3 puzzle is Tricky."* Name the
   boards as the menu does, and add whatever else about them makes the tier
   absent (Group: *"that shows its identity"*, where hiding it brings the tier
   back).
3. **Say it in the size field's `doc`**, which is the help page's Parameters
   section.
4. **Pin the cells** with
   [`describeAbsentTiers`](../../src/engine/testing/absent-tiers.ts): refused
   when dealing, accepted with a desc, and in the slow tier the generator run
   out at each.
5. **Pin the cells beside them** with `describeDealtTiers`, in the same file:
   each deals boards whose lowest solving cap is the tier asked for. It is
   what goes red when a downgrade comes back, and it was seen red with Map's
   fifty-try drop planted.

**A refusal is a claim of absence, so where one is written it rests on a
count: run the generator with the count raised (`underDealTries`), and count
the tries.** This and the paragraphs after it are for a refusal that clears
the bar above, or exists already; they are not a reason to go counting. Group
is why. Upstream's table
named sixteen cells from 3x3 to 8x8. Run out, eleven had no board in up to a
million tries; two dealt a board at once (a 4x4 and a 5x5 hiding the identity,
at Tricky); three were rare; and a 5x5 at Hard, which the table lacked, had
none either, so upstream's generator never ended there. A 6x6 at Tricky showing its identity is found
once in 48,000 tries, so a run of the 10,000-try bound comes back empty four
times in five, and a test that ran it once passed. The count that found it was
380,000. Take a count that large before writing the refusal, and state the
power of whatever keeps it true: `e^(-tries/n)` is the chance of missing a
tier found once in `n`.

**Rare is not absent: it is dealt, with nothing written for it, and given a
different sentence only where a refusal already says so.** The spec has a rare
tier dealt under the deadline, and the deadline counts no tries, so a rare cell
needs no line in its game however many tries a board takes: Unequal's rarest
takes 119 and a hundredth of a second, Group's 6x6 at Tricky showing its
identity 48,000 and ten seconds. What decides is seconds a board. A cell found
once in `m` seconds runs the deadline out with chance `e^(-120/m)`,
and the app deals the next board ahead in a second worker and keeps it
([`deal-ahead.ts`](../../src/puzzle/deal-ahead.ts)), so the wait is the first
board's only. Keep a type that takes more than a second or two off the preset
menu, and write nothing else for it.

**The rare cells refused before the deadline keep their refusals, and a new
game writes none.** Where a game refuses a cell that has boards, the sentence
is `tooRareToDeal`: *"Hard 6x6 puzzles that show their identity are too rare
to deal."* Never `noSuchTier` for one of these: the board may exist. Those
were drawn at half a minute a board on average. Under it a cell was dealt:
Keen with multiplication alone at 4 to 26 seconds, Map's maps of 8 to 10
regions at 1 to 18, Salad's 6x6 and 7x7 Numbers boards of two symbols at
about 15. Over it the cell was refused and the wait written beside the
refusal: Keen's 9x9 at 50 seconds, Spokes two squares wide at 25 seconds to
four minutes, Light Up's turned 4x4 at a minute and more. A cell of a new
game that takes that long is left to the deadline, like one with no board:
it is dealt when a board turns up within the two minutes, and the player is
told when none does. A rare cell
may be pinned with `describeDealtTiers(game, cells, { seldom: true })`, which
deals one board a cell in the slow tier; none is owed.

**Time the cells beside a refusal, not only the refused ones.** A refusal
written from a count of tries stops where the counting stopped, and the cells
past it go on being dealt whatever they cost. Spokes refused a 2x5 and a 2x6
and dealt a 2x7 at 100 seconds a board; Salad refused a 5x5 Numbers board of
two symbols at 34 seconds and dealt an 8x8 at 75 and a 9x9 at five minutes.
The other way round, Map refused every map of 8 regions at Normal for a rate
that is a second at 6x6, and the boards it could not carry were the ones under
five squares wide, which no count had separated. So walk the axis the refusal
sits on to both ends, in seconds a board, and give a cell at least a dozen
boards before a line is drawn through it: two boards in 100 seconds place
nothing.

**Name the line in the units the tier follows, which are often not the
size's.** Bridges' tiers follow the number of islands, so a 10x10 at 5% and a
5x5 at 20% are one population: `islandTarget(p)` is the one function its
generator and its refusal both call, and the sentence is *"No puzzle of 4
islands is Tricky."* Map's follow the number of regions. A refusal written
against width and height there would have been a table with no end.

**Why the bound is a deadline and not a count a game sizes.** A try on a
sparse board is microseconds, so 10,000 tries give up in a twentieth of a
second on a tier that is half a second away: a 10x10 Bridges of five islands
at Tricky is found once in about 100,000. Each game answered that with a
budget in its own unit of work, sized from a measurement of its own, and the
budgets disagreed about the one thing a player meets, which is the wait:
measured 2026-10-10 at sizes with no board, giving up took 0.05 seconds in
Filling, 18 in Bridges, and six minutes in Salad. The deadline
is that wait, stated once.

**A tier is a rung a board needs, not a height it reaches, so count every
tier at a size.** A 3x3 Ascent on the Rectangle grid has Tricky and Hard
boards and no Normal one, and a 2x3 has only Tricky. "Nothing above Normal
here" is a guess about nesting that the generator does not share. The same
holds across a choice field: Ascent's four grids lose different cells, and
Light Up's 3x3 loses a tier to each symmetry, because its center square is
its own mirror image.

**Count tries only where tries are alike.** Raising the count
(`underDealTries`) and counting boards over tries measures a rate when every try draws from the same
population. Light Up's generator adds black squares each time twenty tries
fail, so its tries are not alike: a deal found its 4x4 Unreasonable in the
first climb or, as it was written, sat at 90% black for the rest of the deal
and found nothing. Counted over many tries that read as "absent"; counted by
deals it was one deal in ten. Where a generator changes what it tries, count
deals first, and ask what the later tries are still able to find. There the
fix was neither a refusal nor more tries: the ramp starts over at the top.

**Where a board is drawn in stages, count each stage apart and give the
later one a short count.** This is the count a generator does state
(§ "Every retry loop is bounded"). Loopy on an aperiodic tiling draws a patch and then boards
on it, and the tier follows the patch's shape: three rhombs around a point
carry Easy, Tricky and Hard and never Normal. "None in 500,000 boards" there
was none in fifty patches, and one size up it was a patch in twenty that
could. Two counts settle it, how often a patch can carry the tier and how
many boards such a patch needs, and they came out far apart: a patch that can
needs under 500, and one that cannot had been given 10,000 before the next was
drawn. So the deal went from ten patches of 10,000 boards to two hundred of
500 ([`loopy/generator.ts`](../../src/games/loopy/generator.ts)), the same
run-out, and only the sizes whose every patch is the one shape are refused.
Key the count on the drawn thing's shape and not its size, and read which
shapes fail: it was four of them, across two tilings.

**Where no line can be named, the generator runs out and the engine says
so.** Boats takes a fleet as a list, and which fleets lack a tier has no line
through it: one boat never has one, two single boats on a 3x3 do not, two on
an 8x8 do. A generator that finds no board before the deadline is answered by
the midend (`Midend.deal`), which keeps the board in play and returns
[`dealGaveUp`](../../src/engine/difficulty.ts)'s sentence for the app to
show; it says the tier may be rare or absent, since a run-out cannot tell. So
refuse what you have counted and can name, and let the rest run out. Never
catch the run-out in the game to deal something else.

**Grade the board as it will be dealt.** Where a generator's working state is
not what `newState` builds, the gate measures a neighbor of the board. Bridges
grades the state its generator grew, whose islands sit in the order they were
placed, and that is safe only because its solver's verdict does not depend on
the order: § "A fixpoint is order-independent only if every rule is monotone".

**The instrument is the tier walk**, `scripts/checks/tier-walk.test.ts`: every
tiered game, every numeric field from its declared minimum (or from 1) to the
menu's largest, every tier, a few deals a cell, each board's lowest solving cap
beside the tier asked. It steps the fields together and each alone on the
menu's shapes, and takes a choice field only as a preset has it: so it deals a
3x3 and a 3x7 and never a 3x4, and never an Ascent grid or a Light Up symmetry
that no preset uses. The cells beside a refusal are yours to count. `difficulty-contract.test.ts` holds the presets to that and
deliberately not a tier written onto a small size; the walk is the half it
leaves out. It is a report, minutes long, and not a gate:

    TIER_WALK_GAMES=group,unequal npx vitest run \
      -c scripts/checks/diff.vitest.config.mts tier-walk

A cell it lists as **below** is this section's defect. One that **gave up**
found no board in the house count of tries, since the walk calls the generator
directly: the tier is absent there, or rarer than that count, and the app's
deadline deals a rare one. Nothing is owed for it but the refusal that clears
this section's bar. A cell it does not list was dealt at its tier three times, which
convicts nothing and clears little: raise `TIER_WALK_SEEDS` for a cell that
matters.

### Cap-monotonicity, and the game that broke it

**A difficulty-capped solver must be monotone in its cap: a board solvable at
cap `d` solves at every cap above `d`** (normative:
`engine-difficulty` § "A difficulty-capped solver is monotone in its cap").
Every technique is sound and a higher cap only adds some, so a solver that
fails at a higher cap has a technique or a check that is wrong, and that is
where to look.

- **The consequence is severe and silent**: `findMistakes` re-solves, gets
  stuck, returns `[]` — the game still offers mistake-checking while Check &
  Save checks nothing and blesses a wrong board (the exact failure the
  [solvable-game contract](#the-solvable-game-contract) exists to prevent).
- **Find the cause; do not solve at each cap in turn.** Boats was ported with
  a check that called a board contradictory once its largest boats were all
  placed, at Normal and above. It was read as upstream's own behavior, and
  Boats asked each cap in ascending order and declared itself non-monotone for
  as long as the byte-match oracle made a repair expensive. The cause was one
  read: upstream took a boat's first square from the union-find's root, which
  `dsf.c` had stopped guaranteeing before the port (§ "Solver-gated
  generation", on root identity). The workaround also hid that the same read
  left a whole technique unable to fire, and its hint rung excused as rare.
- **Tell:** generate boards at the *lowest* tier and solve them at the
  *highest*; if that ever fails you have this bug, and a port that only tests
  "solves at its own difficulty" will never see it. You no longer write that
  check by hand — declaring `Game.difficulty` runs it for every tiered game
  at once.

### No tier promises ambiguity

**Every tier's boards have one answer, and the game's solver finds it at that
tier's cap.** Upstream's Dominosa has a fifth menu entry, "Ambiguous", whose
generator skips the uniqueness search; it is not offered here, for the reason
no game offers a checkbox that does the same (§ "No option switches the
generator's checks off"). A port that meets such a tier drops it and reads past
its letter in the params codec.

## Divergence and what it costs

**Byte-parity with upstream was a porting tool, and the owner released it on
2026-08-01**: *"it was only a temporary one for the porting, but now that
we've finished porting, I'm very happy to diverge in favor of a better play
experience, wherever it's worth it."* Matching the C is no longer a reason
not to improve a game, and "it would change every board" is a cost to weigh,
not an objection that ends the discussion. Display code was never in scope at
all (owner, 2026-07-04): rendering, layout, geometry, animation and colors
target neat visuals and clean code, and deliberate visual improvements are
the point of the fork. The doctrine is
[`doctrine.md`](../doctrine.md) § "Upstream" and the
[`ts-migration`](../../openspec/specs/ts-migration/spec.md) spec; the
followable form is this section.

Two rules govern every divergence decision:

- **"Wherever it's worth it" is the whole test.** A divergence still needs a
  stated player-visible benefit; tidiness is still not one.
- **Say what replaces the oracle.** The byte-match was the strongest
  assurance available; dropping it leaves a hole that is filled deliberately —
  normally "every generated board is uniquely solvable at exactly its stated
  difficulty" as a property test, stated in the change
  (`replace-seismic-region-generator` and the Mathrax Recursive divergence
  are the copies to follow).

And four decision rules, learned on `add-loopy-ts-port`, for reading a quirk
before paying or refusing it:

1. **Divergence is free where C had no defined behavior.** Upstream aborts
   on a degenerate Penrose patch (`dsf_new(0)`); retrying with a fresh desc
   diverges only on seeds where C crashed, so there is nothing to match —
   take it.
2. **Price the quirk before paying or refusing.** "Bug-compatibility" sounds
   expensive and usually isn't: one preserved quirk cost a single line plus a
   comment, another cost literally nothing (TS's `%` truncates exactly like
   C's). Don't narrate a sacrifice you aren't making.
3. **Diverge for a genuine player-visible defect, not for tidiness.** A
   solver that deduces *falsely* can generate a non-unique puzzle — fix it
   and record it. Since the 2026-08-01 release, a merely *weaker*-than-
   intended solver is also fair game **when the stronger one makes the game
   better to play** — the clearest case being a difficulty tier that does not
   mean what it says (see § "A tier means exactly its rung"). Strengthening a
   solver *because you can* remains tidiness.
4. **Diverge where the C shape doesn't fit a browser.** `gridTrimVigorously`'s
   C original used a dense `O(numDots²)` matrix — ~576 MB at 50×50. Structure
   is not behavior: an exact replacement costs no fidelity at all, and the
   trap would have been transcribing it faithfully *because* it was the C's
   shape.

## Generators

### Every retry loop is bounded

**A "generate until it works" loop takes a
[`retryLimit`](../../src/engine/retry-limit.ts) guard.** Generators are
synchronous, so an unbounded loop that never succeeds owns its thread
outright — test timeouts can't fire and vitest workers orphan to init.
Exhaustion **throws** (`RetryLimitExceeded`) rather than returning a
fallback, so no seed that used to converge can quietly produce a different
board. Where the algorithm has a natural recovery path, prefer recovering
into it and let an outer `retryLimit` bound the recovery (Net's `shuffle`
reshuffles on a stalled tie rather than throwing). Read the module header —
it also explains why the bound is a guard call, not a `for…of` iterator.

**Give the guard a label and no number.** The bound is the engine's, and it
is two bounds. When the app deals, [`generate`](../../src/engine/deal.ts) arms
a deadline, `DEAL_DEADLINE_MS`, and a guard given no count gives up when it
passes, however many tries that was: so a size with no board is answered
after the same wait in every game, and a board found once in 100,000 tries is
dealt where a try is cheap. Called directly, by a test or a census, the same
guard counts `MAX_REGENERATE` tries and reads no clock, so its answer does not
depend on how busy the machine is. A generator therefore states no budget for
its deal, and nothing about a game is measured to size one. Neither bound can
choose a board: both throw, and a seed that ends with a board ends with the
same one under either.

**Pass a count only where the number is the algorithm's.** There are two
kinds. A stage that hands over when it is spent: Loopy draws another patch
once `PATCH_BOARDS` boards on this one have failed, by catching the run-out,
so the count is what moves the deal on. And a maximum the board itself sets:
Boats seeds at most `w * h + 1` clues. Such a guard counts under a deadline as
well. A number that says how rare a board is, or how long giving up should
take, is a budget: leave it out. The test for which you have: would the
generator deal a different board, or none where it deals one, if the number
were ten times as large? For a budget, never.

**A test that deals a rare board asks for the tries, in one place.**
[`dealRare`](../../src/engine/testing/dealt.ts) is `newDesc` with the count
raised for that call, and `describeDealtTiers` and the boards the cross-game
sweeps share (`dealt`) deal through it, so a cell whose board is past the
house count is pinned with no number in the game. A test of your own that
runs out at 10,000 tries on a board the app deals calls `dealRare`. A test
never arms a deadline to find a board.

**The gate holds you to it, in its fast pass.**
[`retry-bound.test.ts`](../../src/engine/retry-bound.test.ts) reads every
loop under `src/games/` and `src/engine/` whose header does not count
(`while`, `do…while`, a `for` missing its condition or its step) and whose
body draws from the RNG, and requires one of two answers: the loop calls a
`retryLimit` guard once per pass, or the test's `BOUNDED_OTHERWISE` ledger
says what ends it. So a new generator meets three cases:

- **It deals a whole board again until one is good** ⇒ a guard. "It nearly
  always works" is the case the rule is for, and the reject-a-solved-shuffle
  loops (Fifteen, Flood, Flip, Twiddle) take one like any other. A new
  generator needs no such loop for a board that comes solved: the engine's
  deal ([`generate`](../../src/engine/deal.ts)) asks the game for the board's
  status and deals again, for every game.
- **It uses something up each pass** (a frontier, a counter, free cells) ⇒ a
  ledger line naming what.
- **It is rejection sampling for one item** (a free square, an unused color)
  ⇒ a ledger line saying what keeps an acceptable draw on offer, usually a
  `validateParams` bound. Do *not* reach for a guard with no count here:
  called directly it gives up at 10,000 draws, a board with one free square
  in 1,600 refuses that many running about once in 500 deals, and the guard
  would throw on a legal board.

The guard is the scan's own vocabulary: it looks for a call to a variable
initialized from `retryLimit`, in the loop's own body, so a hand-rolled
counter inside an open loop needs a ledger line and a counting `for` header
needs nothing.

**A bound that runs out throws `RetryLimitExceeded`, whatever counted it.**
The midend answers that one class with a sentence and keeps the board in play
(§ "A size that cannot carry a tier"); any other error is a fault and
propagates, which leaves the player with a deal that never ends. A counting
`for` that ends in its own `throw new Error(…)` is the shape, and the same
test refuses it: a `throw` standing straight after a loop that draws.

### Unlucky, impossible, and load-bearing validation

**A `validateParams` that does real work is load-bearing — port it before
anything that depends on it.** Param validation is usually a few bound
checks, so it is tempting to leave for last — but Boats' last check *places
the entire fleet* with the RNG-free first-fit, and it is the only thing
standing between the player and an infinite loop: generation retries fleet
placement unboundedly, so an unfittable fleet (the default 3,2,1 fleet in
5×4 — measured) spins for ever. No retry budget is the right answer there;
the *feasibility check* is. **Tell:** a `validate_params` that allocates,
calls a generator helper, or builds a board.

**Measure a "rare failure" before you design the recovery for it.** A
generator failing on some inputs invites the reflex "retry, it's just an
unlucky seed" — check, because the two failure modes need opposite fixes:

- *Unlucky* ⇒ **retry**, bounded, driven by the same RNG stream so
  determinism and shared game IDs survive.
- *Impossible* ⇒ **reject in `validateParams`**, where the Custom dialog can
  show a reason — and reject the *precise thing you measured* (Loopy: a
  Penrose kite/dart **width-3** bound, because 200 draws per configuration
  showed width 3 never succeeds at any height while every neighboring shape
  succeeds about half the time — an `amin` bump would also have forbidden
  the sizes that work).

The retry itself takes no number: the deal's deadline bounds it
(§ "Every retry loop is bounded"). Only a stage that hands over when it is
spent has a count, and that one is sized from the **worst measured success
rate of a generable configuration**: Loopy's patch draw succeeds one time in
48 at its rarest, so 400 draws miss one deal in 4,000.

**A board cut at random can come out far under its size, and that is a third
case: draw again, and keep the largest where nothing is large enough.** A
Penrose patch is cut from a random place, and one 5x5 in four was three rhombs
in a box that otherwise held five to eleven. Nothing fails there, since the
three rhombs are a legal board, so neither a retry on error nor a refusal sees
it; the spread of the drawn thing's size does. Four things made the fix small
([`loopy/grid-build.ts`](../../src/games/loopy/grid-build.ts)):

- **Say what the size usually gives as arithmetic, not as a table.** The
  medians fit the box less a border, `(w - 2)(h - 2)`, on both Penrose
  tilings and within a fifth on Hats and Spectres, and the line is half of
  that.
- **Change which description is drawn, never what one builds.** The trimmer's
  tie-break is what picks three rhombs over five, and it cannot move: saved
  games carry descriptions.
- **Never refuse a size for it.** A rhombs box three wide holds six faces at
  most however long it is, so a threshold alone would have ended those deals.
  After a bounded number of draws the largest drawn is the board.
- **Deal every tier at every size the rule changes before trusting it.** The
  tier follows the patch's shape (§ "A size that cannot carry a tier"), so
  turning a shape away can take a tier with it. Here it took none, and that
  was a count and not a guess.

**One game can be both failure modes, split by a parameter — measure the
boundary and apply both fixes.** Seismic's upstream region grower collapses
with board size (1/22 at 16 cells, 1/200,000 at 49, zero in 200,000 attempts
at 56+). A size cap alone would forbid shipped presets; retry-only leaves a
10×10 spinning for minutes. So it takes both: `MAX_CELLS` in
`validateParams` for the range that provably cannot generate, and a retry
under the engine's bound for the rest. **Sweep
a grid of shapes, not a single dimension**: the ceiling tracked *cell
count*, which neither a `w` bound nor an `h` bound would have expressed.
Exemplar: [`seismic/state.ts`](../../src/games/seismic/state.ts)
(`MAX_CELLS`, measurement table in its doc comment).

**A filter that throws away what a draw could have been made to produce is a
fourth case, and its fix is neither a retry nor a refusal: build it in.**
Tracks drew a free random walk and threw away every one that left a row or
column without track, and then every one whose clues had two 1s together. The
walk is about 25 squares long at any size, so the first filter kept one walk
in 13 at 8x8 and one in 100,000 at 60x8, and the second kept none of the
tracks of a 200x8. Lifting the bound showed nothing else failing: clue-laying
took one to three tracks a board at every size. Two things to take from
[`tracks/generator.ts`](../../src/games/tracks/generator.ts):

- **Ask what each try is thrown away for before accepting the rate.**
  Count the tries each filter turns away, by size. A rate that falls with size
  while the stage after it holds steady is a property the draw could have had
  from the start. Here the walk may not leave while a line is bare and never
  steps where the free squares no longer reach every bare line, which finishes
  two times in three from 5x5 to 50x50; and a forbidden 1 is bent out of a
  finished track.
- **Making a draw succeed makes each try cost a whole draw, so every filter
  left behind it gets dearer.** With only the walk fixed, a 200x8 went from
  running out in a second to grinding through 10,000 whole tracks before
  saying no. Walk the thin shapes as well as the square ones, and time the
  run-out again after the fix.

It changes which boards are dealt, and that is a thing to measure and say:
the tracks of a 15x15 went from 83 squares to 100.

**Where what fails a draw is a small part of it, mend the part.** Palisade
divided the grid at random and kept a division only if the solver solved it
with every clue showing. One in 18 was kept at 6x6 in threes and none in a
thousand at 9x9, and a rate that falls with every region added reads as a size
bound. It was not one: a failed division has a second answer under its own
clues, in a few neighboring regions that can be cut another way. The generator
now divides the regions round a wall the solver did not place again, and keeps
the step if no more walls are left unplaced
([`palisade/generator.ts`](../../src/games/palisade/generator.ts)). Every size
deals, 30x30 in threes among them, and no size is refused. What to take:

- **Sort the failures by what the search says of them before blaming the
  solver.** "One answer, and the deductions stall" asks for a stronger solver
  or a tier. "Several answers" is the board's own fault, and no solver mends
  it. Palisade's were all the second kind at threes, three in four at fours
  and four in ten at tens, and mending the division served both.
- **A rate that falls as `r^n` in the number of parts is `n` independent
  small failures.** Mend them one at a time and the cost grows with `n`, where
  drawing whole boards grows with `r^-n`.
- **The size of the move is the thing to measure, by give-ups and not by the
  median.** At 6x6 in threes, dividing two regions again gave up on 94 boards
  in 100 and three on 7. Four gave up on none of 2,000 there and on 5 of
  1,000 at 9x9. A move too
  small cannot leave a stall whose only other cut has the same clues, and a
  move too wide is hardly ever kept, so the width goes up while a board stalls
  and comes back down.
- **Count every pass of a mending loop against its cap, the ones that try
  nothing included.** A `continue` before the counter is a loop that never
  ends on a board with no move to make.
- **Keep the first draw's use of the RNG.** A division good as drawn draws
  nothing more, so those seeds deal the board they did, and the share of
  boards that moved is a check on the change: it should be the share whose
  first draw failed.

**Where a draw is filled at random for a solver to pass, place the fill.**
Separate filled a division with letters at random, kept the letters a
deduction had read and filled the rest again. One division in 200 was
finished at 6x6 in fours and none in 400 at 8x8, and the proposal was a
size bound. The generator now swaps two letters where the solver stops, so that
an edge it left open is walled
([`separate/generator.ts`](../../src/games/separate/generator.ts)), and
20x20 in twos deals in under a second. What to take:

- **Look at where a failed try stopped, and not only at how many fail.** A
  division thrown away had four letters in five fixed and next to nothing
  joined: the fill had been spent on deductions that led nowhere. That is a
  search with no way back, and neither bad luck nor a size.
- **Run a failed draw again before blaming it.** The same divisions filled
  ten more times finished as often as fresh ones, so the division was not
  what failed and drawing another did nothing.
- **Read the solver for what it can never finish, and build the draw without
  it.** Separate's only join is of a component to the one square it can grow
  into, so a region with a ring of squares is never finished, whatever its
  letters. A random division has one in most regions of six or more. That
  part of the draw was a rate, and is now a property.
- **A change that undoes no deduction costs no solve.** A deduction depends
  only on the letters it read. Swapping two it has not read lets the solver
  go on from where it was, and only a swap of read letters pays for a solve
  from nothing. The free move alone has no way back and the dear one alone
  is slow; together they deal what neither does.
- **When the search starts over, its cap is the line between a wait and a
  failure.** Every large size dealt given two minutes, so there was no wall
  to find. The divisions a board took said which kind of slow it was: ten at
  20x21 in sixes, whose minute goes on solving a large board, and a thousand
  at 10x12 in tens, whose minute goes on boards thrown away. The first is a
  wait and is dealt. The second is refused, past the unit the count follows
  (squares times letters squared), with the cap sized to the rarest size
  under it.
- **Try the neighbor's mend, and say when it does not carry.** Palisade's
  re-division at a stall was tried here and bought nothing: its failure is a
  fault in a few regions, and a stalled fill is not.

### Bound a generator by its tail, not its median

**One seed per size is not a measurement.** Seismic's size bound was first
set from single-seed timings; nine seeds per size showed medians of ~5–6 s
hiding an 18.3 s worst case, and the preset was withdrawn. Note the trap
precisely: an exhaustive sweep of every accepted configuration had *zero
failures*, so every size was genuinely reachable. Reachability answers "does
this work?"; only the tail answers "should we offer this?", and a bound
exists to settle the second question. Whenever a bound is being set or
raised, repeat the sizes near it across several seeds first. Two corollaries:

- **Optimize first, then bound.** Slide's tail at its largest upstream preset
  measured 22.8 s before its visited-set hashing fix and 1.8 s after — a
  bound drawn from the first number would have forbidden a board upstream
  ships ([`slide/solver.ts`](../../src/games/slide/solver.ts)).
- **Check whether the wall is time or memory.** Slide's curve doesn't end in
  a slow generation: at 54 cells the BFS exhausts the heap. A retry budget
  assumes failure is recoverable; an OOM in the worker is a crash, so that
  boundary belongs in `validateParams`. Measure at least one size past where
  you draw the line, and note which way it fails.
- **A retry loop's tail is set by its per-attempt success rate.** Attempts are
  independent, so the count is geometric: with success rate `p`, the chance of
  exhausting `n` tries is about `e^(−np)`. In the app `n` is what the deadline
  has time for, and called directly it is `MAX_REGENERATE`, which is where a
  test meets it. Count attempts and successes over a few hundred deals at
  every preset and compute both, rather than waiting for a failing seed.
  Tracks' 15x15 Hard measured `p ≈ 1/3,500` when 10,000 tries were all a deal
  had. That predicts 5.7% of deals failing, and 7 of 100 and 11 of 200 were
  observed. Every other preset measured below `10^−15`.

**The instrument past the menu is the deal walk**, `npm run deal-walk`
([`scripts/deal-walk.ts`](../../scripts/deal-walk.ts)): every game, each
menu's largest size at every tier and then 1.5 to 8 times it, a few deals a
cell, each in a watched process so that a deal which never returns is killed
and written down. It writes `metrics/deal-walk.md`. Three things it has shown,
which a new generator should expect of itself:

- **Few games are quick at every size their dialog takes.** Run across the
  collection on 2026-10-06 it found some whose deal stayed quick out to eight
  times the menu (the shuffles, Mines, Map, Guess and Cube among them) and,
  in most of the others, a ladder that passed ten seconds a board or gave no
  answer in a minute between 1.5 and 4 times the menu's largest. None ran out
  of memory first.
- **The walls differ by tier, by a choice field and by more than size.** Boats
  at Easy is quick at 80x80 and at Normal takes 26 seconds at 30x30; Loopy's
  line is in a different place on each tiling. A bound written as one maximum
  width is wrong for most of what it covers, so write it in the unit the cost
  follows and for the cell it was measured at.
- **A size inside the menu's range can hold a deal that never ends.**
  Mathrax's 9x9 at its top tier was dealt quickly three times by the tier walk
  and gave no answer in ten minutes on the next seed. A few quick deals clear
  nothing where the solver searches: name the cell and count a dozen
  (`DEAL_WALK_CELLS`, in the script's header).

A cell the walk lists is a few deals, enough to find where a ladder leaves a
second and not enough to place a line. Before a bound is written, count the
sizes each side of it.

**A Custom size is not refused for its wait.** The app runs every deal beside
the board in play and the player can stop it
([`deal-ahead.ts`](../../src/puzzle/deal-ahead.ts), `Puzzle.stopDeal`), so a
large size is a wait they chose and can leave, and the line a table of
refusals would need is in a different place at every tier, on every machine.
A size bound in `validateParams` is for what a wait does not fix:

- a deal that takes the worker down, since memory is not a wait;
- a size no board exists at, or whose generator fails more often than it
  finds (Seismic's fill past 64 cells);
- a deal whose time goes on boards it then throws away, so that what arrives
  at the end is not what was searched for (Sokoban past 1,200 squares deals
  the level its hint cannot open).

A tier's own bound is held to the same rule: "a larger one takes too long to
deal" is a wait, and Range's Unreasonable bound went when every deal past it
was measured to return the board asked for. Two things to do before a table
of times is read as a bound
([`range/solver.ts`](../../src/games/range/solver.ts)):

- **A deal that throws is a defect in the code that throws.** Range's
  connectedness walk made a call a square and overflowed the stack on a 64x64
  board, dealt or pasted. A bound would have sat under a stack whose depth
  differs by engine; the walk keeps its own. Record a few hundred boards and
  their hint plans first, since the order a rule fires in decides which board
  a seed deals.
- **Ask what each solver run in a strip is asked.** Range's strip met both
  squares of a symmetric pair, and at the second ran the solver on a pair
  already gone, a run that could not pass. Passing over it moved no board and
  made an Easy deal 2.4 times as fast.
- **Where draws are thrown away for a second answer, the search has it in
  hand.** Rectangles' Unreasonable deal threw four draws in five away for
  having several answers, and took 4,000 draws for a 30x30 board against a cap
  of 10,000. A second answer differs from the dealt one somewhere, and there
  a clue can move so that the dealt answer stands and the other does not:
  `solvedPositions` hands the answers over. A board then took a few hundred
  draws at every size ([`rect/generator.ts`](../../src/games/rect/generator.ts)).
- **A check that replays the hint rereads the board at every step unless it
  is told not to.** Rectangles' was half of a large deal: every step read
  every clue's every shape again, though a step only draws lines and so only
  takes fits away. Carry what a step can only shrink, and pin it with a test
  that each step of a plan is the step its board gives when read afresh.
- **Sweep the fields beside the size.** Rectangles' expansion factor held a
  deal that never returned (a board one wide) and a block of small shapes
  that give up at Unreasonable, none of which a sweep of sizes meets.

The preset menu is held to more than this: a preset is a wait sprung on
whoever opens the menu. A generator that never ends is still a defect at any
size, since a player who stops it has learned nothing about whether to ask
again.

### Solver-gated generation

**When a generator strips or accepts clues by re-running the solver, the
solver's verdict on every intermediate board decides which boards exist. The
verdict — including its quirks — is therefore part of the algorithm, and a
"fix" that strengthens or weakens the solver changes every board.** During
the C era this was byte-match discipline; post-C it is the *maintenance*
discipline for the same code: the 48 frozen differentials
([testing.md](./testing.md)) are the net that catches a refactor moving a
verdict. The lessons that stay live:

- **Preserved quirks are load-bearing; the code says so where it matters.**
  Filling's solver deliberately skips a square only its canonical cell can
  reach; Solo's killer-cage merger is verbatim-preserved *dead code* (its
  missing `npairs++` means no cages are ever merged — "fixing" it diverged
  the first board); Slant ports the release build's semantics, not the
  early-outs that only existed under a diagnostics `#ifdef`. Each carries a
  loud comment at the definition. Do not tidy these; the comment is the
  contract. Exemplars:
  [`filling/solver.ts`](../../src/games/filling/solver.ts),
  [`solo/generator.ts`](../../src/games/solo/generator.ts) `mergeSomeCages`,
  [`slant/solver.ts`](../../src/games/slant/solver.ts) `fillSquare`.
- **Tell — the truthiness trap:** grep a solver-gated generator for
  `if (solve(` / `if (!solve(` before trusting it. A solver that returns a
  multi-valued verdict makes bare truthiness a bug: Mathrax's verdict `2`
  means *ambiguous*, which is truthy, so its top tier stripped straight past
  uniqueness and shipped boards with several solutions — a genuine
  player-visible defect (`findMistakes` refuses a board with no unique
  answer, so Check & Save silently degraded across the tier). The fix was
  two comparisons, provably inert on the tiers whose verdict set excludes
  the ambiguous code ([`mathrax/generator.ts`](../../src/games/mathrax/generator.ts)).
- **Tell — the dirty scratch:** when a generator hands its solver a *reused*
  board, ask what state that board is in on entry — the answer is part of the
  algorithm. Spokes' acceptance gate re-solved on whatever the last
  candidate's solve left behind (often a finished board), so 31–45% of
  attempts were judged on garbage and "Hard" mostly wasn't
  ([`spokes/generator.ts`](../../src/games/spokes/generator.ts)).
- **Tell — the unchecked start:** a stripping loop keeps a removal only while
  the board still solves, so it preserves a solvable board and cannot make
  one. Ask what proves the board it *starts* from solves. Bricks re-founds its
  answer first, turning every square its Easy solve left undecided into a
  clue, and on a board two wide that could leave a brick resting on nothing:
  the loop then reverted every removal and wrote out a board with no solution,
  which its own game ID refused
  ([`bricks/generator.ts`](../../src/games/bricks/generator.ts)). Any step
  that edits the answer after it was built owes a solve before the stripping.
- **Tell — the mutating validator:** any C-descended `validate`/`check` that
  both returns a verdict *and* writes a flag back into the board is a hazard
  the moment a later full-byte comparison reads that byte. Clusters'
  generator depends on a leaked error bit surviving into a whole-cell
  compare; the port keeps a *mutating* validate on the generator path and
  separate pure checks for play, so persisted state and the renderer stay
  clean ([`clusters/solver.ts`](../../src/games/clusters/solver.ts)).
- **Some deductions branch on the canonical-DSF-root *identity*.** The shared
  [`Dsf`](../../src/engine/dsf.ts) matches upstream `dsf.c`'s root choice for
  exactly this. A game that uses the dsf only for connectivity won't notice;
  one that reads `canonify(i)` as an *element* (an index into something)
  does. Tell: a loop bounded by a canonify result used as an index value
  rather than as an identity to compare. **Then ask which `dsf.c` the C was
  written for.** The root was the class's smallest element until upstream
  moved to union-by-size and gave the smallest its own call, `dsf_minimal`;
  code that says "the canonical index is the first square" and still calls
  `dsf_canonify` is broken upstream, and a faithful port of it is broken the
  same way. `Dsf.withMinimal` answers `minimal(i)`
  ([`boats/validate.ts`](../../src/games/boats/validate.ts) `checkDsf`).

### A divergence retires or re-founds its fixture

**Do not keep upstream's behavior reachable so a differential stays green.**
Matching upstream's C output is not a requirement anywhere (owner, 2026-09-13:
*"it was just something we cared about during the port, but it's not a concern
anymore"*). Ship the fix, and retire or re-found the fixture it moves, saying
what replaces it.

Re-founding is usually cheaper than it sounds, because a frozen fixture holds
more than generation. `delete-retained-upstream-paths` removed eight options that
kept upstream's generator reachable for a byte-match, and turned each
differential into a check over the same recorded boards: every description still
validates, loads and round-trips through the codec — so an older shared ID stays
playable — and the solver still finds each board uniquely solvable. Generation is
then carried by the game's property test that every generated board is uniquely
solvable at exactly its tier. The doctrine boundary the first of those options
came from still stands: *upstream being clearly wrong is a reason to fix it*
(owner).

### Recover emergent parameters from the fixtures

**When you replace a generator, the thing you must not guess is the shape of
what it produced — and the frozen fixtures may already encode it.** Seismic's
region-size distribution is emergent in the C source (unreadable from the
code), but decoding the frozen descriptions and histogramming recovered it
(mean region 2.62, never above 6). That turns "invent a distribution" into
"match a measured one, and deviate deliberately". Whenever a rewrite has a
free parameter the old output implicitly fixed, check whether the fixtures
answer it.

### Reuse the solver's pruning, not just its propagation

**If a constructive generator built on a solver's propagation is backtracking
far more than ~1 node per cell, the missing piece is usually a global
feasibility test the solver already implements.** Seismic's fill used the
solver's placement propagator but not its "can every region still house
every number it owes?" check; adding it as the pruning rule cut one
configuration from 2,731 ms to 211 ms. Forward-checking alone finds out many
levels too late.

## Solve and the generator's aux

**A `solve()` that needs the generator's `aux` only works on a freshly
generated game.** The midend retains `aux` from `newDesc` and passes it to
`solve(orig, curr, aux)` — but only for a new game or a `#seed` id; a `:desc`
id or a loaded save has no aux, so Solve correctly reports "not known",
faithful to upstream. Most games re-derive the solution in `solve` and ignore
`aux`; reach for `aux` only when re-derivation is impractical, and check that
it really is — Untangle leaned on `aux` for its layout until a resumed game's
Solve and hint both failed, and a layout computed from the edges turned out to
take tens of milliseconds. If you take `aux`, **test Solve through a real
`Midend`**, not just the game's `solve` directly — the threading lives in the
midend, so a direct unit test can pass while the shipped Solve is a no-op.

**Solve shows the finished board, or says why not — and the engine holds
every game to it** (`ts-engine` § "Solve leaves a solved board"; owner,
2026-10-02: *"consistent with how this gets applied across games
(preferably by the engine deciding)"*). `Midend.solve` refuses a solved or a
lost board itself, and throws when the move `solve` returns leaves a board
whose status is not solved. So a Solve is never a reveal scored as a loss, a
route plotted for the player to walk, or marks on the squares to press:
upstream's Black Box, Guess, Inertia, Slide and Flip each did one of those,
and here each plays its answer to the finished board instead. **What a game
decides is only whether it can:** where its solver finds no finish from here
it refuses with a `SolveFailure` (Flood, whose greedy finish can overrun the
move limit once moves are spent, says `NO_SOLUTION_FROM_HERE`), and where a
mistake stands in the way, the answer replaces it as it replaces a wrong digit
(Mines shows the finished board over an opened mine).
[`solve-finishes.test.ts`](../../src/engine/solve-finishes.test.ts) solves
every game from positions played into, which is how Flood was found.

## findMistakes

### The solvable-game contract

**A game with a unique solution MUST ship `findMistakes` — Check & Save
depends on it.** The shell's Check & Save control
(`src/puzzle/quick-save-actions.ts`) blocks a save on a wrong entry only
through `game.findMistakes` (`Midend.check`); the hint behind it refuses only a
position it calls a dead end. A uniquely-solvable game without the hook
degrades the control to a save that **saves a wrong board without complaint** (shipped in
Unruly's first cut; caught on owner smoke-test). So for any game with a
unique solution, `findMistakes(state)` is part of "done": re-solve from the
fixed clues and return every player cell that contradicts the unique solution
(`[]` when the board isn't uniquely deducible — never guess). A permutation
puzzle with no notion of a wrong-but-legal state correctly omits the hook.
Exemplar: [`unruly/solver.ts`](../../src/games/unruly/solver.ts)
`findMistakes` + [`unruly/render.ts`](../../src/games/unruly/render.ts); the
overlay must be in the render diff key
([rendering.md](./rendering.md) § "Overlay sidecars"), and the refusal/banner
coupling is in [hints.md](./hints.md).

### One answer, even when it is hidden

**A game with a mistake check plays only boards with one answer, and the
engine enforces it.** Check & Save saves only a board that agrees with the
answer, so a saved board can always be finished; on a board with two answers it
would call a mark that fits the other a mistake. So `loadDesc` asks the game's
own `solve` about every board it loads, and refuses one the solver proves has
several answers (`DESC_NOT_UNIQUE`) or none (`DESC_CONTRADICTORY`), whoever wrote
the desc ([`engine/desc-error.ts`](../../src/engine/desc-error.ts)). A game joins
by having a `solve` that says `MULTIPLE_SOLUTIONS` or `NO_SOLUTION` when it has
proved it; a solver that merely gave up says neither, and that verdict passes
(the board is then asked whether the solver solves it at all, § "No option
switches the generator's checks off"). The generator's half is the game's:
deal only boards the same count calls unique, and hold it with a test against an
answer count that has no search in it.

**A game with no mistake check says what it can prove through
`hasNoSolution`, and its `solve` is never asked at load.** Several answers are
no fault there (Untangle has many), but a board with none is one nobody can
finish, and `loadDesc` refuses it with `DESC_NO_SOLUTION`. The hook is a
proof that costs the same on any board: a parity (Fifteen, Sixteen), a rank
(Flip), a planarity test (Untangle), a count (Cube). **`solve` is the wrong
thing to ask, because it answers more than the question**: load runs on every
pasted ID and every opened save, and a solver that searches charges a board
it cannot settle its whole budget each time (Pegs and Sokoban took seconds,
Netslide's rebuilding of an answer did not finish a fixture sweep in ten
minutes, and Flip's shortest answer doubles with every free square after the
elimination has already said whether there is one). So look for the invariant
the moves keep, and split "is there an answer" from "which". A new game with
no mistake check pins a board with no solution in
[`no-solution-load.test.ts`](../../src/engine/no-solution-load.test.ts), which
holds the list of games that still let one through, each with its board.

**A hidden answer is no reason to skip the check.** Black Box's balls,
Mines' mines and Guess's code are hidden, and all three check marks against them
as every other game checks a digit: a guess with no ball, a known mark on a ball,
a flag with no mine, a slot whose rule-outs include its own color. **Check the
player's claims, never their probes**: a Guess row that is not the code is how
the game is played, so the check never reads one, and it reports a wrong
rule-out by slot rather than by color, as a pencil-mark check reports the cell
and not the digit. Check & Save is an answer check in every game; a player who wants to use
it to probe can do so anywhere. What a hidden-answer game owes instead is a
generator that makes the answer the only one the visible clues allow: Black
Box's verify accepts any balls that send every laser where the real ones do, and
its upstream generator scattered balls at random, so it now builds a board a
ball at a time, keeping each ball only where the board still has one answer
([`blackbox/answer.ts`](../../src/games/blackbox/answer.ts)). Building beat
scattering and redealing by a wide margin: on 8×8 with 16 balls, redealing found
no board in 2,000 tries where building found one in 0.2 s, and on a ranged preset
redealing skewed the count toward its fewest balls.

### Marks are checked like entries

**Where the player pencils candidates, a blank cell whose marks leave out its
answer is a mistake, exactly as a wrong entry is** — and a candidate hint
depends on it, because it reasons from those marks. Marks carrying extra
candidates beside the answer are ordinary mid-solve state, and a cell with no
marks says nothing. Don't write this loop: `entryMistakes` in
[`engine/entry-mistakes.ts`](../../src/engine/entry-mistakes.ts) owns it, and
the game hands it the answer, its arrays, its `NoteEncoding` and its fixed
cells ([engine-catalog.md](./engine-catalog.md) § "`entry-mistakes.ts` — Check
& Save for one value or a set of marks per cell"). Group once checked entries
only, and its hint narrated from a mark set that had already crossed out the
answer.

### Edge games flag set edges only

**Where the player draws walls, flag the player's edges that contradict the
solution — never "the cell looks invalid", and never a missing edge.** A
*missing* solution edge is merely incomplete; only an edge the player has
**set** that the solution forbids is a definite mistake. A 2×2 box drawn
around no number *looks* wrong, but if each wall is a real solution boundary
it is legitimate partial progress. Exemplars:
[`rect/index.ts`](../../src/games/rect/index.ts),
[`tracks/index.ts`](../../src/games/tracks/index.ts),
[`galaxies/index.ts`](../../src/games/galaxies/index.ts) (which also flags
the second way that game is played: an interior wall set inside a single
galaxy).

### Live rule errors and the re-solve are both

**When the game already draws live rule errors, ship both layers — they are
not alternatives.** Live checks (a broken row count, a collision) are a
strict subset of what the re-solve knows, and the gap is the dangerous one: a
locally-legal piece on a square the unique solution assigns otherwise breaks
no rule yet, and a live-only hook would let Check & Save bless it. Keep the
live errors (free, immediate) *and* base `findMistakes` on the re-solve —
and render them so both read (Boats recolors a wrong ship red and insets an
outline, which is what makes a wrong *water* square visible at all).
Exemplar: [`boats/render.ts`](../../src/games/boats/render.ts).

### Self-validating games run their rule checker

**Some games' violations are intrinsic to the current grid: there
`findMistakes` runs the same validity pass that decides won/ongoing and
returns the offending cells, rather than re-solving.** This is weaker than a
re-solve — a wrong-but-not-yet-rule-breaking cell won't be caught — but it is
the right choice when the game already displays those same marks live, so
Check & Save flags exactly what the board shows and both share one validity
function. Exemplars: [`bricks/solver.ts`](../../src/games/bricks/solver.ts)
`findMistakes` + [`bricks/render.ts`](../../src/games/bricks/render.ts),
[`subsets/index.ts`](../../src/games/subsets/index.ts). Contrast Galaxies,
whose mistakes are only meaningful against a re-solve.

## The Latin family

**Eleven games ride [`engine/latin.ts`](../../src/engine/latin.ts): the
generic `latin_solver` framework (candidate cube, positional/numeric and set
elimination, forcing chains, guess-and-verify recursion as the uniqueness
check) plus the RNG-faithful generator (`matching` / `latinGenerate` /
`latinGenerateRect`).** A Latin game's `solver.ts` is its own clue deductions
(`usersolvers`), a `valid` callback over completed grids, and a thin driver
mapping its difficulty levels onto the config. Towers was the first consumer;
Group is the proof of convergence — two `usersolvers` + a `valid` and zero
framework changes. Exemplars, each showing a different wrinkle:
[`towers/solver.ts`](../../src/games/towers/solver.ts) (clue heuristics),
[`unequal/solver.ts`](../../src/games/unequal/solver.ts) (two modes off
`ctx.mode`), [`keen/solver.ts`](../../src/games/keen/solver.ts) (per-cage
arithmetic in the transposed cube space),
[`group/solver.ts`](../../src/games/group/solver.ts),
[`salad/solver.ts`](../../src/games/salad/solver.ts).

Working rules, each earned:

- **The cube is indexed `(x·o + y)·o + (n−1)`.** Deductions reading a slice
  are usually cleanest as a line's cell list + `cubeGet(x,y,n)` — *but* when
  upstream's solver works in a transposed index space with dense flat reads
  (Keen), porting the flat reads verbatim with a comment is the lower-risk
  faithful choice; re-deriving them is error-prone and moves solver verdicts.
- **Tell — the transposed read in a generator:** Unequal's greedy clue
  assembly reads the candidate cube through a flat index that is a
  *transposition* of the cube's layout. It is deliberate; "fixing" it to the
  tidy accessor changes the greedy choice and hence the board
  ([`unequal/generator.ts`](../../src/games/unequal/generator.ts)). The same
  generator's second trap rides along: the numeric and inequality clue codes
  are shuffled in **two separate `shuffle` calls, in that order** — folding
  them into one tidy shuffle changes the draw sequence and the desc.
  Reproduce both.
- **A clue that constrains a cell without placing a digit needs the `seed`
  hook.** `latinSolver` seeds its cube from the working grid, which covers
  every given *digit* — but a constraint like Salad's ball/cross marks rules
  candidates out while placing nothing. `LatinSolverConfig.seed` is the gap
  upstream applies those in. It is deliberately **not** re-applied inside the
  recursion (faithful to the C) — sound only for a game that never recurses,
  so check your recursion setting before relying on it.
- **A pseudo-Latin game declares its repeated symbol; it does not fake it.**
  Salad's empty square appears `order − nums` times per line, and the cube is
  told so — `LatinSolverConfig.repeats: { times }` makes the **last** symbol
  (`o − times + 1`, Salad's `holeSymbol(nums) = nums + 1`) repeat. From there
  the generic rungs reason about it with its multiplicity: positional
  elimination places it when exactly `times` cells of a line can still take it,
  placing it strikes the line only once the line's count is full (recorded as
  `repeatFull`, kept apart from `LatinReason` so the Latin-square games' exhaustive
  narrations are not asked about a case they cannot meet), set elimination runs
  the multiplicity-aware `setGeneral`, and forcing chains never link through it.
  A **cross** is the hole symbol placed, a **ball** the hole symbol struck, and
  the marker array is read back off the final cube (`cubeOut`) —
  [`salad/solver.ts`](../../src/games/salad/solver.ts) is the consumer. Two
  things to know before touching it: **the extension is inert when not
  declared** (`symbols = o`, every multiplicity 1, every path reduces to the C's
  — the family's byte-match differentials are the proof, and
  `latin-repeats.test.ts` pins the shape), and a consumer with exactly *one*
  empty per line (`nums = order − 1`) needs no declaration at all, because a
  once-per-line symbol is just a symbol. Upstream's alternative — a full square
  whose surplus symbols are reinterpreted as holes, with a translation layer
  between the two views — is what `add-latin-repeats-support` retired; its
  author had called it "fairly messy" and asked for exactly this.
- **Three generator shapes in the family.** (1) Towers *derives* every clue
  from the full square, then removes. (2) Unequal (and Solo) greedily
  *assemble* clues onto a blank board, reading the solver's
  remaining-possibility counts — which is why `latinSolver` takes an optional
  `cubeOut` that receives the final candidate cube; omit it on the solve/hint
  path. (3) Keen *partitions* structurally (cages over a generated square),
  then solver-gates on exactly the target difficulty
  ([`keen/generator.ts`](../../src/games/keen/generator.ts)).
- **A cage/region game over the shared `Dsf` precomputes its minimal-element
  map** (`buildMinimal` in [`keen/state.ts`](../../src/games/keen/state.ts))
  rather than growing a min-tracking dsf variant: the minimal element is
  membership-determined, so a single ascending pass after all merges is exact
  regardless of which root union-by-size picks. But first check whether the
  algorithm needs a *minimum* at all — Rome's design assumed `dsf_minimal`
  changed what `canonify` returns (it does not; it is a separate array), and
  the correction cut both ways: the scan it planned to port was just a
  same-class test, while the root's *identity* turned out to be
  verdict-relevant elsewhere. When in doubt, reread
  [`engine/dsf.ts`](../../src/engine/dsf.ts)'s header.
- **History (C era):** a `usersolver`'s contradiction `return -1` sometimes
  sat inside `#ifdef STANDALONE_SOLVER`, so the shipped build silently
  skipped the impossible placement — the ports preserve the shipped
  behavior, with comments at the sites (Group; `git log` the port change for
  the full account). The generalization stays useful: what a solver *doesn't*
  do can be as load-bearing as what it does.

The shared hint-side machinery for this family (the recorder, reason
narration, populate/cleanup steps) is hints.md's subject — start at
[hints.md](./hints.md) § "Candidate-elimination games".
