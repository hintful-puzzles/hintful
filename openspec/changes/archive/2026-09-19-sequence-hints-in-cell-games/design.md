# sequence-hints-in-cell-games — design

## D1. Why the Loopy answer does not transfer

`order-hints-from-the-frontier` § 1.1 measured 737 plan positions and found a median
of one available firing, 63.8% offering exactly one, and 86.1% of the long jumps
forced. Read it before designing anything here — the instrument, the bias analysis and
the stopping condition are all reusable, and the *conclusion* is not.

It does not transfer because it is a fact about the **ladder**, not about hints. Loopy
sweeps a tier to exhaustion over edges and dots, and its rungs largely unlock one
another: a corner note makes a line deducible, the line makes the next dot decidable.
A chain-shaped ladder yields one candidate at a time by construction.

A Latin grid is not chain-shaped. Several regions can each carry an independent hidden
single at the same position, none of them unlocked by the others, and the ladder picks
whichever its scan order reaches first — which is a *scan order*, not a judgment about
where the player is working. That is the configuration where the owner's complaint is
both real and avoidable, and it is unmeasured.

**So §1 repeats the campaign, not the conclusion**, and carries the same stopping
condition stated in advance: *if a position usually offers one firing, ordering buys
nothing and this change stops there.* Writing the condition before the instrument is
what made the earlier stop trustworthy.

## D2. The read-set is already shared, which is the cheap part

Loopy needed a game-specific `LoopyReason` union to get an exact read-set. The Latin
family does not: `engine/latin.ts` and `engine/latin-hint.ts` already define the
vocabulary every one of those games records into, and most of it names its own
premises.

| reason | what it reads | exactness |
|---|---|---|
| `hiddenSingle` | the named `line` + `index` — `hiddenSingleLine()` already returns the cells | exact |
| `single` (naked) | the cell's own units | exact |
| `dup` | the placement `(px, py)` and the line it clears | exact |
| `forcing` | the cells of the `chain` it followed | exact |
| `set` (naked subset) | the unit is **not** named | approximate |
| `repeatFull` | the named `line` + `index` | exact |

So the instrument belongs in `engine/`, written once against the shared union, and it
serves every Latin game rather than one. **The population is the Latin squares
family**, `puzzlesInFamily("latin")`, which `catalog-families.test.ts` bounds by the
users of `engine/latin-hint` and of the shared Latin engine. The family names the
*corpus* the measurement runs over. If §2 goes ahead, what enrolls a game in the
ordering is still that it emits the reasons, never the tag (`AGENTS.md` § "Special
files", on `catalog-data.ts`). The other cell games (Unruly, Singles, Range and the
rest of Shading) record no shared reasons, so the read-set cannot reach them; that
is a limit of the instrument, and the corpus does not pretend otherwise. That is the opposite of Loopy's position and
it is what makes this measurement cheap.

**`set` is the one gap, and it must be handled in the conservative direction.** An
unnamed unit means the read-set is under-known; treat such a firing as reading
*everything* (adjacent to all), so it never counts as an avoidable jump. Under-reading
a premise inflates the candidate count, which is why the earlier campaign called its
own numbers upper bounds — the same bias applies here and points the same way, so the
stop stays conservative and a *proceed* stays earned.

## D3. What "near" means on a grid, and why it is not distance

Loopy's metric was graph distance over edges. A grid tempts coordinate distance, and
that is the wrong unit: two cells in the same row are "near" for deduction purposes
however far apart they sit, and two adjacent cells in different blocks may share no
unit at all. **The relation is shared-unit, not proximity**, which the read-set already
gives — `reads(B) ∩ writes(A) ≠ ∅` needs no metric.

This is `AGENTS.md` § "Method" applied before the fact rather than after: the instrument
must measure the thing (does the next step reason about ground the last step touched?)
and not a neighbor of it (are the cells close together on screen?). A distance-based
instrument here would report a defect on every legitimate row deduction.

## D4. Carried from `order-hints-from-the-frontier`

- **3.4** — an expiring note placed at the *latest* position its explanation still
  describes, closing the 19% residual. The live spec was narrowed to what ships, so
  landing this widens a requirement rather than fixing a contradiction.
- **The unbounded journey** — `firstUse` puts every fact a firing cites onto that
  firing, so hint 112 of the replay is 55 legs. Bound it, or establish that a long
  walked journey reads fine. **Settle this before 3.4**, because 3.4 concentrates
  notes onto their consumers harder and would lengthen exactly these journeys.

## D5. Not the extraction, and what the trigger is

Loopy's `planSteps` — slot by first use, pull ancestors back, group into a journey —
is three general ideas resting on one specific thing: a per-firing **closure of facts
with parents**. Nothing outside `games/loopy/` has one, and `DeductionRecord.reason`
is `unknown`, so no shared code can read a premise.

The trigger for extracting it is a **second game that records derived facts as notes**,
and `apply-markable-facts-rule` is the audit that finds them. When that change gives
one to Slant, the extraction has two real users and rides with it. Extracting first
would produce a one-member abstraction over types only Loopy has — the shape the
scene-graph postmortem records.

Note that D2's finding does **not** change this. A shared *read-set* is not a shared
*fact graph*: the Latin reasons say what a firing read off the board, not which
derived facts it rests on, and it is the second that premise-note placement needs.
