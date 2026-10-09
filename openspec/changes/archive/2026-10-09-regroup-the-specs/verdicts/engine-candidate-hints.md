# Verdicts: engine-candidate-hints

## note The cut of "The premise audit checks its own instrument" stands

The requirement is not in the regrouped spec and is not restored. What it said
is how the audit is built: `checkPremise` in `src/engine/firing-replay.ts`
refires the recorded firing from the unmodified state first and files a firing
it cannot make again under `PremiseAudit.unreproduced`, whose doc comment calls
it "a fault in the instrument, not in a premise"; `firing-replay.test.ts` fails
on any such entry. The rule the audit holds is still in the spec ("The engine
audits a premise by replaying its firing"). The guide did not say the specific
behavior, so the `guide` entry below adds it.

## guide `docs/games/hints.md` § "A premise names everything its deduction reads"

- **The audit checks itself before it judges.** For each firing it first runs
  the replay from the recorded state with nothing returned, and a replay that
  does not make the recorded firing again is filed as `unreproduced`: a fault
  in the instrument (a `ReplayAdapter` that does not rerun the technique the
  recording ran), never a finding against the premise. The guard fails on one,
  so a new adapter is proved to reproduce before any premise is tested with it.

## keep `engine-candidate-hints`: Plan continuity is measured over a derived population

The guide (docs/games/hints.md § "Continue from the last step") names the guard
and tells its history, but not the three rules a session changing
`hint-frontier.test.ts` would check against: the population is derived, every
reading the `Ui` offers is walked, and the bound is one step in ten with the
reversed-preference control. The rule is the reason for the guard.

## cut `engine-candidate-hints`: A reading over the continuity bound is named in a ledger

process: docs/games/hints.md § "Continue from the last step" states it whole in its closing sentences: the guard bounds the jumps "under every reading the game offers", and "A reading known to be over the bound sits in the test's `OVER_BOUND` ledger with the change that owns it, and the walk asserts it is still over, so fixing it retires the entry." Read 2026-10-09; the ledger in `src/engine/hint-frontier.test.ts` is empty today.

## keep `engine-candidate-hints`: A game taking the frontier directly is held by a ledger

No guide says it: `OWN_FRONTIER` and "takes the frontier directly" appear only
in `src/engine/hint-frontier.test.ts` (searched `docs/` and `src/`). The
requirement holds the reason, that the cross-game measurement reads a grid and
would drop such a game silently, and a test is not a home for that.

## keep `engine-candidate-hints`: A guard runs the premise audit over every game on the walk

The guide says only that "`firing-replay.test.ts` runs it over every candidate
walk". The requirement adds what the guard must cover (every reading, a board a
leaf preset, a board for an untested rung) and the exact ledger of games that
offer no replay, test no cell or record nothing; a session adding a candidate
game checks its change against these.

## keep `engine-candidate-hints`: A technique that reads more than its conclusion rests on is pinned

The guide (§ "A premise names everything its deduction reads", "What it cannot
see, it says") gives the ledger and the pinned board, but tells "a fix such an
entry could hide is held by a test of its own" only as one Solo incident. The
general rule has no other home.

## keep `engine-candidate-hints`: A shared candidate-elimination hint plan

The sentence "the solvers and the generate and solve paths SHALL NOT change
because of it" is a live constraint, not an assurance from the change that
introduced the walk: no solver or generator imports `candidate-plan.ts` or
`hint-frontier.ts` today (searched `src/`; `src/games/rome/solver.ts` names a
type of it in a comment only), and this sentence is what keeps it so. A hint's
continuity is tempting to improve by reordering a solver's techniques, which
would move grading and generation.

## keep `engine-candidate-hints`: The frontier keys only on the plan's own steps

Same answer as the walk's sentence: "no generator or solver explores in a
different order because of it" is the refusal that keeps the frontier's
preference out of the ladder, and it is what a session tuning continuity would
check against. No guide states it.

## keep `engine-candidate-hints`: Nothing folds under the populate reading

It is in the regrouped spec, so the cut the entry reports was already undone.
It stays: it says what a player on the populate reading sees, and it is not
only scoping, since a populate-reading player can erase a cell's notes and the
fold's other conditions would then hold. `candidate-plan.ts` folds in
`implicitSteps` alone, which is this rule.

## keep `engine-candidate-hints`: A premise that asserts a walk is computed and numbered

Not a restatement of `engine-hints` "A chain's order is declared and drawn as
an ordinal" or "A Tactic's chain is shown on the board". Those govern a chain's
drawing and a Tactic; this one says a recorded strike's premise that asserts a
walk must be the walk found on this board ("computed and checked, not
assumed"), which neither states. Rome's loop premise is the instance
(`src/games/rome/hint.ts`, `order: k + 1` off the solver's recorded walk).
