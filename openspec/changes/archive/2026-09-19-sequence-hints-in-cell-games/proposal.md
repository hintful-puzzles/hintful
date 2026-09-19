# sequence-hints-in-cell-games

## Why

`order-hints-from-the-frontier` set out to fix hint sequencing collection-wide and
withdrew the ordering half on a measurement: a plan position offers a **median of one
firing**, and **86.1% of the jumps were forced** — no nearer deduction existed. That
stop was correct and is not being reopened for Loopy.

**But it is a fact about Loopy, and the goal is all games** (owner, 2026-09-18: *"I
really want this sequencing to be a mechanism that works well on all games"*). Loopy's
ladder is a narrow easiest-first tier sweep over edges and dots, and its rungs tend to
unlock one another, which is exactly the shape that yields one candidate at a time. A
Latin-family position is not obviously like that: a partly-filled Solo or Towers grid
can carry several independent hidden singles in different regions at once, and that is
precisely the configuration where "it jumped to the other side of the board" is both
real **and** avoidable.

So the question the earlier change answered for Loopy is *open* for cell games, and it
has to be answered the same way — measured first, with a stopping condition stated
before the instrument is built.

Two smaller things ride along, both already understood:

- **3.4, carried over.** An expiring note is currently left where the solver found it;
  placing it at the *latest* position its explanation still describes would close the
  19% residual. It waits on the 55-leg question below, because it concentrates notes
  onto their consumers harder.
- **The journey with no ceiling.** `firstUse` puts every fact a firing cites onto that
  firing, so a firing citing 54 previously-uncited facts opens a 55-leg journey (hint
  112 of the replay in `order-hints-from-the-frontier/findings.md`). A journey is
  walked rather than dumped, so it is a long read rather than a wall of moves, but
  nothing bounds it.

## What this is not

**Not the extraction of Loopy's premise-note placement into the engine, and that is
deliberate.** `planSteps` rests on a per-firing **closure of facts with parents and
premises** (`games/loopy/record.ts`), and **nothing else in the tree has one** —
`DeductionRecord.reason` is `unknown` by design, so no shared code can read a premise
at all. Extracting it today would build an abstraction with exactly one possible
member, over types only Loopy has, which is what the scene-graph postmortem is for.

**The trigger is a second game that records derived facts as notes**, and
`apply-markable-facts-rule` is the audit that finds them (Slant's equivalence step is
already flagged there). When that change gives a second game notes, the extraction has
two real users and rides along with it. Until then the honest shared surface is what
already exists: `continuesPrevious` and `Midend.hintJourney`, which sixteen games use.

## What changes

Gated on §1's measurement, in this order:

- **Measure candidates per plan position for a cell-game family**, with the same
  stopping condition the Loopy campaign carried: *if a position usually offers one
  firing, ordering buys nothing and this change stops.*
- **If choice exists**, the engine gains the candidate-enumeration hook and comparator
  that `order-hints-from-the-frontier` designed (D1–D4 there, kept as the record), with
  the game supplying the metric and the engine supplying the ordering.
- **Bound a journey**, or establish that an unbounded one reads fine.
- **Widen the note-placement requirement** to "the latest position its explanation still
  describes" when 3.4 lands; it currently states only what ships.

## What this does not do

- **Not the generator.** Enumeration stays confined to the hint path. Loopy's rung loop
  comment is explicit that exploration order is load-bearing for *which puzzles exist*,
  and the same caution applies to any solver-gated cell game.
- **Not phrasing.** Still downstream, and still undiagnosed.
