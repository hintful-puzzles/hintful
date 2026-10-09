# Purposes

The Purpose of each new capability, and of each capability that lost or gained
a subject. A move is a delta and a Purpose is not, so these are put into the
specs when the change is archived.

## `help-pages`

The help the app serves: where its pages live, the one skeleton a game's page
follows and what is generated into it from the game, how a page names a
control, a choice or a hint mark, and what the site-level pages owe a player
about the features this fork adds. `src/help-coverage.test.ts` holds most of
these, and how to write a page is `docs/help-pages.md`.

## `testing`

How behavior is tested here: the in-process tiers and the render harness, the
rules that keep the suite deterministic under load and its workers from
outliving it, the rule against mocking a module, how a test's strength is
audited and probed, what an assertion must be able to catch, the frozen C
fixtures and what they still guarantee, the capability snapshot, the harness
that pins a hint test's positions, and the boards a cross-game sweep walks
and how many of them on a commit. What the gate runs, and
what it may defer, is `build-pipeline`; how to write a test is
`docs/games/testing.md` and how to judge one is `docs/test-strength.md`.

## `dealing`

How the app gets a board to play: the board dealt ahead of a New game and
kept, which types keep how many, when a kept board is played or abandoned, the
deal a player waits for and can stop, and where the app shows the engine's
sentence when a deal finds no board. What a generator promises of the board
it deals, and what the engine answers when it gives up, are
`engine-difficulty`.

## `error-reporting`

What the app sends when it crashes, and when: nothing without the player's
consent, enforced where every request leaves; what turning reporting on is
allowed to change in the build; that the public DSN is restricted at the
reporting service; and how reporting is checked on the deployed origin. What the privacy notes say of it is `project-identity`.

## `border-grid`

The edge-marking mechanic Palisade and Separate share: that a game takes its
input, its look and its hint notation from the engine's border-grid modules
and owns no copy, and that the shared renderer knows neither game. What each
button does to an edge, and the clue layer that stays each game's own, are
stated in `palisade` and `separate`.

## `repo-layout`

How this repository is organized and kept honest: where code, help, docs and
tooling live, the script that scaffolds a game, the developer guides under
`docs/` and the agent brief, design-fiction documents, the form a spec's
requirement takes, and the checks and audits that hold module layering, an
open change's paths, bulk edits, comments, spelling and citations to what
they claim. It
is the contract for working in the tree. How behavior is tested is `testing`,
what the served help must cover is `help-pages`, and how a change is accepted
and archived is `docs/work-management.md`.

## `ts-migration`

The rules the port from upstream's C to native TypeScript left standing:
upstream's C as a readable reference and not a byte-oracle, a clean save
format with stable game IDs, and acceptance by exercising a game and not by a
green suite, with touch accepted on a device. What a tier and a generator
promise is `engine-difficulty`, and a params encoding's stability is
`engine-params`.

## `ts-engine`

The core of the puzzle engine every game runs on: what a `Game` owes the
`Midend` and the midend owes it, the registry, the save format, preferences, a
board's history with its restarts and the board a new one replaced, status and
timer, Solve and mistake-checking, the reference aid, the one spelling of
absence, and the rule that a game joins a shared mechanic by having it.

The shared layer's subjects each have a capability of their own beside this
one: `engine-hints` and `engine-candidate-hints`, `engine-input`,
`engine-params`, `engine-difficulty`, `engine-notes`, `engine-colors`,
`engine-drawing` and `engine-helpers`. A requirement about one of those
subjects belongs there, and this capability holds what is about no one of them.
How the app deals a board ahead of a New game is `dealing`, and the boards a
cross-game sweep walks are `testing`'s.

## `build-pipeline`

How this repository decides that a tree is fit to commit, publish and run, and
what that decision is allowed to cost: the gate that `scripts/gate.sh` defines
and that the pre-commit hook and CI both run; the rule that no correctness
check is dropped or weakened to buy speed, and the scopings by role permitted
instead; what the hook may select, narrow or defer to the push, and what a
deferral must leave covered; the guards the gate carries of its own; the
metrics harness, which is not a gate; the compiler-strictness decisions; the
build's independence from any native toolchain, and what the build asserts of
its own output; and the deploy, which publishes the gate's own artifact and is
verified against the deployed origin. What any single test asserts belongs to
the capability that test serves, how tests are written and judged is
`testing`, and what a crash report sends is `error-reporting`.

## `app-shell`

The app's chrome around the puzzles: the puzzle screen's panels and commands,
its keyboard and focus handling, the press-and-release stream it delivers to a
game, the board and params it restores and reports, the reference panel, where
a refused Solve is shown, and the home screen's navigation.

## `engine-helpers`

The shared algorithmic helpers a game would otherwise copy, and the catalog
that names them: the disjoint-set forest, loop finding, grid coordinates, the
small parsers and the decimal-character helpers, the contract of the deduction
fixpoint that a solver and its hint share, and the rules for the scope a
shared helper claims and which games adopt it.

## `engine-drawing`

Drawing: which shapes a game draws through the shared helpers, the hint's
line hatch among them, the draw state a game is handed, the sidecar a
per-cell overlay reaches the render cache through, how the midend sizes and
repaints a board and lays the ground under it, and the guard that a warm frame
matches a fresh paint.

## `engine-candidate-hints`

The hint plan shared by the candidate-elimination games: the entry and the
walk that turn a solver's recorded firings into steps and stamp each with its
rung, the order the frontier takes them in, the regions and the two readings
of an unmarked cell the walk works over, the Latin family's shared narration,
and the premise each recorded firing names, with the guards that hold it.

## `flip`

Flip, the puzzle of lighting every square by pressing squares, where each press
also flips a fixed pattern of neighbors, in two rulesets. Its boards are
generated solvable and not already solved, its solver finds a shortest set of
presses, and its hint presses that answer in reading order, saying what forces
each press.

## `engine-difficulty`

Difficulty tiers and what a generator promises of a board: the contract a
tiered game declares, what a tier promises and that a dealt board is bound to
it, that a capped solver is monotone in its cap and probes on clean state,
the collection-wide scale its tier names come from, the policy that a logic
game deals only boards its hint can narrate, the bounds on a generator's
loops and what the engine answers when one runs out, and the tier the midend
gives a loaded board and holds a hint to. Why each rule is as it is, and how to follow it, is in
`docs/games/solver-and-generator.md`.
