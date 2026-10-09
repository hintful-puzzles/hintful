# Ledger: engine-helpers

Base: bb004490

Where every rule of the capability went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## The engine provides a shared disjoint-set forest (dsf)

| Rule | Where it went |
| --- | --- |
| The engine provides `Dsf` in `src/engine/dsf.ts` with the six named operations, path compression and union by size | spec: The engine provides a shared disjoint-set forest (dsf) |
| A game that needs union-find imports it from there | spec: The engine provides a shared disjoint-set forest (dsf) |
| The class was promoted from Galaxies' local implementation | history |
| Scenario: a game imports the shared `Dsf`, and no game directory holds a local `dsf.ts` | spec: The engine provides a shared disjoint-set forest (dsf) |
| Scenario: `size` and `equivalent` reflect merges | spec: The engine provides a shared disjoint-set forest (dsf) |

## The engine provides shared grid-coordinate helpers

| Rule | Where it went |
| --- | --- |
| The engine provides `coord` and `fromCoord` in `src/engine/geometry.ts`, the caller supplying the border | spec: The engine provides shared grid-coordinate helpers |
| `fromCoord` is `Math.floor((pixel − border) / tileSize)` directly, correct in the border region with no truncating-division workaround | spec: The engine provides shared grid-coordinate helpers |
| The mapping is upstream's `COORD` and `FROMCOORD`, and per-game copies carried the C idiom | history |
| Most games use half a tile as the border | reason |
| Grid games import the helpers and do not re-derive the mapping locally | spec: A grid game imports the coordinate helpers |
| Every grid game imports them, with no exception | untrue: `src/engine/geometry.ts` names one override, truncation toward zero, taken by a game that says so at its own conversion (`src/games/crossing/render.ts`, `src/games/mathrax/render.ts`, `src/games/blackbox/index.ts`, `src/games/rome/index.ts`), so the requirement now states the override |
| Scenario: a pixel inside a cell maps to that cell, and `coord` gives its top-left pixel | spec: The engine provides shared grid-coordinate helpers |
| Scenario: a border-region pixel maps to a negative index that the caller's bounds check rejects | spec: The engine provides shared grid-coordinate helpers |
| That scenario matches the upstream macro's intent without the truncation workaround | history |

## The engine provides a shared permutation-parity helper

| Rule | Where it went |
| --- | --- |
| The engine provides `permParity` in `src/engine/shuffle.ts`, the parity of the inversions in the first `n` entries | spec: The engine provides a shared permutation-parity helper |
| Parity correction stays local to each game's generator | spec: The engine provides a shared permutation-parity helper |
| Scenario: parity reflects the inversion count | spec: The engine provides a shared permutation-parity helper |

## A shared deduction-fixpoint scaffold

| Rule | Where it went |
| --- | --- |
| The engine provides a reusable runner in `src/engine/` that a game's solver and its hint share, so the loop, the cap and the budget are written once | spec: A shared deduction-fixpoint scaffold |
| The recorder threading is among what the runner writes once | untrue: `runDeductionFixpoint` takes no recorder, and `DeductionTechnique.run` in `src/engine/deduction-fixpoint.ts` says a technique records its firing as a side effect through the game's own recorder and that the runner is oblivious to it |
| A technique declares a stable `id`, a `tier` and a `run` answering above zero, zero or below zero | spec: A technique is a declaration, not a closure |
| Both `id` and `tier` are required, so a ladder states its tiers and names and does not encode them in positions | spec: A technique is a declaration, not a closure |
| The grade is the highest tier among the techniques that fired | spec: The grade and the cap are tiers, never positions |
| An optional maximum tier excludes every technique above it wherever it sits, so a cheap technique after an expensive one still runs | spec: The grade and the cap are tiers, never positions |
| Grading does not depend on a technique's index | spec: The grade and the cap are tiers, never positions |
| A conditionally available technique guards itself inside `run` and returns `0` | spec: A conditionally available technique guards itself in run |
| The runner provides no availability predicate, with its reason | spec: A conditionally available technique guards itself in run |
| A technique that applies only under a board rule or at one exact tier says so in its own `run` | spec: A conditionally available technique guards itself in run |
| The runner accepts an optional early-out meaning there is nothing left for the ladder to do, checked at the top of every iteration | spec: The early-out means there is nothing left for the ladder to do |
| The early-out is not specified as "solved" | spec: The early-out means there is nothing left for the ladder to do |
| A name narrower than its meaning obliges every reader to consult the doc comment | reason |
| The runner accepts an optional recorder that gates every reason allocation | untrue: the runner has no recorder option (`DeductionFixpointOptions` in `src/engine/deduction-fixpoint.ts`), the gating is each technique's own through its game's recorder, and the requirement now says the record is the game's |
| The generation path stays byte-for-byte unchanged and runs unguarded when nothing is recorded, and allocates nothing extra | spec: The record is the game's, and the generation path allocates nothing |
| The runner ticks a step budget once per iteration, on the recording path only, so a fixpoint that does not terminate throws a labeled error while the generator runs unbudgeted | spec: The step budget ticks on the recording path only, and names the runaway technique |
| With a budget present a non-termination is attributed, naming the techniques by firing count | spec: The step budget ticks on the recording path only, and names the runaway technique |
| With no budget the runner counts nothing | untrue: `runDeductionFixpoint` also counts into a tally the caller supplies as `firings`, with or without a budget, and counts nothing only when it has neither (`src/engine/deduction-fixpoint.ts`) |
| The techniques stay per game, and only the loop, cap, budget and attribution are shared | spec: A shared deduction-fixpoint scaffold |
| A game that hand-rolls the loop converges onto the runner without changing techniques, order or verdicts | spec: A shared deduction-fixpoint scaffold |
| A game that does not fit has its reason recorded against the contract, re-derived and not carried forward when the contract changes | spec: A game that does not fit the runner records the promise it breaks |
| A reason that a game did not fit an earlier runner is not evidence about this one | reason |
| A recorded reason names a promise the runner makes that the game must break, and a description of the loop's shape is not one | spec: A game that does not fit the runner records the promise it breaks |
| Adoption requires no new option on the runner, and a game that would need one stays bespoke | spec: A game that does not fit the runner records the promise it breaks |
| A bespoke loop carries three obligations, recorded per game: walkable by a hint, tiers bound to real technique differences, a recording path that fails loud | spec: A bespoke loop carries three obligations |
| A vacuous obligation is recorded as unmet | spec: A bespoke loop carries three obligations |
| Scenario: the generation path reaches the same verdict and grade through the runner | spec: A shared deduction-fixpoint scaffold |
| That scenario's differential or behavioral regression suite stays green | history |
| Scenario: the hint path records each firing with its technique and premise in solver order | spec: The record is the game's, and the generation path allocates nothing |
| Scenario: a fixpoint that does not terminate on the hint path throws a labeled step-budget error and does not hang | spec: The step budget ticks on the recording path only, and names the runaway technique |
| Scenario: two techniques sharing one tier grade alike | spec: The grade and the cap are tiers, never positions |
| Scenario: a cap excludes by tier, not by position | spec: The grade and the cap are tiers, never positions |
| Scenario: a runaway technique is named | spec: The step budget ticks on the recording path only, and names the runaway technique |
| Scenario: the early-out stops a refuted board, not only a solved one | spec: The early-out means there is nothing left for the ladder to do |
| Scenario: a recorded no-go is re-derived when the contract moves | spec: A game that does not fit the runner records the promise it breaks |

## The engine provides a shared loop-finding helper

| Rule | Where it went |
| --- | --- |
| The engine provides `findLoops(nvertices, neighbors)` in `src/engine/findloop.ts`, Tarjan's bridge finding in the non-recursive linked-list form, returning `anyLoop`, `isLoopEdge` and `isBridge` | spec: The engine provides a shared loop-finding helper |
| An edge is a loop edge exactly when it is not a bridge, which is when its removal would not disconnect its component, and `isBridge` reports the vertex counts on either side | spec: The engine provides a shared loop-finding helper |
| It is a port of upstream `findloop.c` | history |
| Games needing loop-error detection consume the helper and do not re-roll it | spec: A game that flags a forbidden loop uses the loop finder |
| Slant consumes it now, and Bridges, Dominosa and Tracks when ported | history |
| Loopy consumes it when ported | untrue: Loopy is ported and does not call `findLoops`, because its rules require a loop and its completion check classifies the components of a `Dsf` instead, with the reason in the comment on `checkCompletion` in `src/games/loopy/state.ts`, so the requirement now binds a game whose rules forbid the loop |
| Scenario: a cycle's edges are loop edges and its tail is not | spec: The engine provides a shared loop-finding helper |
| Scenario: a forest has no loops and every edge is a bridge with its vertex counts | spec: The engine provides a shared loop-finding helper |

## The engine catalog names every shared helper there is

| Rule | Where it went |
| --- | --- |
| The catalog carries an entry for every module under `src/engine/`, so the menu cannot silently shrink | spec: The engine catalog names every shared helper there is |
| A module deliberately without an entry is in a ledger with its reason, and the ledger fails on a module that no longer exists | spec: The engine catalog names every shared helper there is |
| The check runs in the gate's fast prefix ahead of the documentation-only shortcut, and is not a vitest file | spec: The catalog check runs ahead of the documentation-only shortcut |
| Scenario: a new engine module without a catalog entry fails the gate | spec: The engine catalog names every shared helper there is |
| Scenario: a documentation-only commit deleting an entry is still checked | spec: The catalog check runs ahead of the documentation-only shortcut |

## A hot constant's placement is decided by the build, not by the suite

| Rule | Where it went |
| --- | --- |
| A hot loop's constant can be hoisted into a shared module, and a slowdown under vitest does not by itself forbid it | spec: A hot constant's placement is decided by the build, not by the suite |
| A constant kept module-local for speed has a comment recording the measured ratio, its control, and that the cost does not reach a player | spec: A hot constant's placement is decided by the build, not by the suite |
| The measured ratios on Range's generator, the arms, the repetitions and the date | figure; guide: docs/games/testing.md § "Timing anything under vitest: two things to know first" |
| The mechanism: the test transform makes every export a getter, so the loop pays an accessor call per access | reason; guide: docs/games/testing.md § "Timing anything under vitest: two things to know first" |
| The cost does not survive bundling, so it is a fact about the suite | reason; guide: docs/games/testing.md § "Timing anything under vitest: two things to know first" |
| Scenario: the decision is made on what the production build emits, and a local constant's comment carries its measurement | spec: A hot constant's placement is decided by the build, not by the suite |
| Scenario: every arm is warmed, the arms are interleaved in rotating order, and the minimum is reported beside the median | spec: A timing comparison warms every arm and carries a control |
| Scenario: an A/A control arm is timed alongside | spec: A timing comparison warms every arm and carries a control |
| Scenario: a suspiciously tight control is checked by warming the arms, not by loading a second module instance | spec: A timing comparison warms every arm and carries a control |
| The measured ranges of one instance timed twice and of two instances | figure; guide: docs/games/testing.md § "Timing anything under vitest: two things to know first" |

## The engine provides a shared leading-integer parser

| Rule | Where it went |
| --- | --- |
| The engine provides `parseLeadingInt` in `src/engine/decimal.ts`, returning the value of the maximal digit run and the index after it | spec: The engine provides a shared leading-integer parser |
| The value is 0 on an empty run and the index is unchanged, which tells "no number" from "zero" | spec: The engine provides a shared leading-integer parser |
| A game reading a digit run from a param string or a desc calls it, in any of the four spellings | spec: A game reads a digit run with the shared parser |
| A loop that skips digits and another character is not a digit run and is written with the shared `isDigit` | spec: A game reads a digit run with the shared parser |
| Scenario: `"10x7"` decodes in two calls | spec: The engine provides a shared leading-integer parser |
| Scenario: no game declares a copy under any name, and the guard finds one by shape | spec: A game reads a digit run with the shared parser |
| Scenario: a desc codec reads a number with `parseLeadingInt` | spec: A game reads a digit run with the shared parser |
| The desc bytes are unchanged from the hand-rolled scan it replaced | history |
