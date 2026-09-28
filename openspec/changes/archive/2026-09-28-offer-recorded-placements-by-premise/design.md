# offer-recorded-placements-by-premise — design

## D1. One walk of the recording, one rule

The recording differs from the player's board by the marks the board has yet
to show: a live strike, and an unmade placement's cell with its cull
(`towers-implicit-strike-window`, and `reach` for the cull). Whether a
recorded firing is true on the board depends only on whether it reads one of
those, never on whether it strikes or places. So `availableFirings` walks the
recording once and vouches for both with one predicate:

- nothing of the kind comes before it, or
- its premise is non-empty and holds none of them.

**The old placement rule is a special case, so no plan can end sooner.** The
old rule offered the first unmade placement when every other rung was empty.
Nothing unmade precedes the first unmade placement, and every other rung being
empty means no live teachable strike precedes it either (the first such strike
is always offered). So the new rule vouches for it through its first clause.
The new rule offers a superset; `stuck` can fire no sooner.

## D2. A placement's premise leaves out what it places

A strike's premise stays its steps' whole `area ∪ hatch ∪ reads ∪ targets`,
unchanged. A placement overwrites its cell, so the notes there are not
premise: a facing-clue placement hatches its whole sight line, target
included, and a live strike on the target would otherwise hold back a
placement that does not read it. `CandidateWalk.evidence` subtracts every cell
the firing's steps act on. A placement narrated as a single needs no vouching
at all: whether the board shows it is `availablePlacements`' own question.

## D3. Group reads the walk's placements, choosing only when

What Group decides is genuinely Group's: its deductions are placements, so the
ones available lead the strikes, and before the notes are set up the singles
the board shows lead too. What it no longer decides is *whether* a recorded
placement is available. `RungContext.placements()` gives it the walk's list, so
`leads` is a filter on `recorded || !populated`.

Considered and declined: a plan option (`placementsLead`) moving the walk's
placement rung ahead of the strikes. It would add a knob to spare Group three
lines, and Group's "singles too, but only before populate" would still need a
rung.

`RungContext` gains a firing type parameter, defaulted, so the one game that
names it (Group) says `RungContext<HintOp, Legs>`; `CandidateRung` supplies it.

## D4. What is checked

- Unit tests for placement vouching (first unmade; later one clear of the
  pending cull; one reading a live strike), each seen red with vouching
  switched off; a probe case plants the same.
- The affected games' suites and the frontier guard pass with no snapshot
  change.
- Group in the app: a single, two associativity placements back to back, then
  a three-leg journey, rendered correctly.
