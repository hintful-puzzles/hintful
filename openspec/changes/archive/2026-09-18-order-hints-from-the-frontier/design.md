# order-hints-from-the-frontier — design

> **D1–D4 and the ordering half of D6 were stopped by measurement and are kept as the
> record, not as a plan.** The rule they work toward is sound; the board does not
> offer the choices it needs. A plan position has a median of one available firing,
> and 86.1% of the jumps are forced (`findings.md` § 1.1). Read them for why the rule
> was framed that way and what was ruled out on the path — D4's warning about the
> generator's exploration order still binds anything that revisits this.
>
> **D5 is the part that shipped**, and D2's "read it off the board, never off history"
> still governs it.

## D1. Every step is on a path to visible progress

The owner's first framing (2026-09-16) was an image — deductions near *"the edge of
the fog of war"* — carrying one preference that survives everything below: *"if we
really need to apply a difficult deduction, let's do that sooner rather than later,
but if we can replace a single difficult deduction with a chain of easier ones, let's
do that instead."* And, on being shown difficulty read as the primary key: *"No,
that's not what I meant. I don't want seemingly useless easy ones away from the
action. What I want is for you to prioritize work that directly expands the
horizon."*

Asked whether a plan should stay on one front, and what a board's opening should look
like, the owner settled both (2026-09-16):

> at the start, everything is the horizon, so I'm happy with a quick sweep of all the
> easy and most horizon-expanding deductions, until a clear frontier emerges, and
> then we move to focus on it.

> I think it's ok to jump between fronts, and I do that often myself. The only thing
> that I really want to prevent is … individual deductions that don't help advance
> everything - I want deductions to "tell a story", where each deduction either
> directly expands the front, or acts to advance a chain of deductions that would
> eventually expand the front, or start a new front.

**The criterion is contribution, and the measurement says how to enforce it.** The
owner's three clauses — a step expands a front, advances a chain that will, or opens
a new one — state the intent exactly, but they do not discriminate between firings.
Section 1 measured why: *every* line firing settles an edge, so "expands something"
is true of all of them, and a firing either touches determined ground or does not, so
clauses 1 and 3 between them admit everything. An admissibility test built on those
clauses is vacuous, and the first instrument built on one duly reported 92.5% healthy
(`findings.md`).

What the measurement *can* see is the symptom actually reported: **14.4% of steps
land four or more hops from the previous step**, with a tail of 14–17 hops, which on
a 10×10 board is a traverse. So the operational form of "tell a story" is
**continuity with an availability caveat**:

- offer the next step within reach of what the plan's recent steps determined;
- leave that neighborhood only when nothing there fires — never because something
  elsewhere was found first;
- among the steps at hand, take the cheapest reasoning.

That is enforceable, and it carries the intent faithfully: a step continuing from the
last one *is* advancing the same chain, and a step that leaves while work remained
beside it is the jumping-around being complained of. Opening a new region stays
allowed, because that is what a solve does once a region is exhausted, and
alternating between fronts stays allowed with it.

"Replace a single difficult deduction with a chain of easier ones" lives in the third
bullet, and "if we really need a difficult deduction, do it sooner rather than later"
falls out of it: a hard step is reached exactly when nothing easier fires where the
player is working.

**This inverts what Loopy does today, and that is the substance of the change.**
`nextFiring` sweeps the cheapest tier to exhaustion and escalates only when nothing
cheaper fires *anywhere on the board*; under this rule it must escalate when nothing
cheaper fires *at the frontier*. So the tier sweep becomes the tiebreak within the
frontier set rather than the primary key — a behavioral change to hint planning, not
a sort order laid over the existing one.

**"Advances a chain" is computable exactly for Loopy, which is what makes it the
exemplar.** Within one plan build the whole plan is known, so a firing can be tested
against the steps that follow it — and Loopy's premises are machine-readable rather
than prose. `LoopyReason` (`record.ts`) is a discriminated union, and eleven of its
thirteen kinds name the board elements the firing read: `face`, `dot`, `edge`, `from`,
`pair`, `witness.edges`. A face or a dot yields its edges directly (`GridFace.edges`,
`GridDot.edges`), and `firingRoots` with `closure` gives the note facts underneath. So
a firing's **read-set over edges** is derivable, its write-set is its `ops`, and "A
feeds B" is `writes(A) ∩ reads(B) ≠ ∅` — exact, with no proxy to calibrate.

**Two reason kinds are genuinely global.** `earlyLoop` and `closesLoop` read the whole
line configuration rather than a neighborhood, so they are adjacent to everything.
They are excluded from the metric rather than given a spurious read-set, and counted
separately wherever the rule is measured.

**This was read out of `record.ts`, not assumed.** The first draft of this section
claimed the recorder kept only a firing's writes and a prose reason, which is false,
and the difference is most of the change's cost: an exact test needs no measurement
campaign to earn trust. What holds one level up is that `DeductionRecord.reason` is
`unknown`, so nothing *shared* can read a premise — which is precisely why the engine
takes the predicate from the game (D3).

**The opening needs no phase of its own.** With nothing determined, every firing
either starts a front or feeds one, so the admissible set is nearly everything and the
tiebreak — cheapest, most productive — does the work. That is what the owner asked
for ("a quick sweep … until a clear frontier emerges"), and a phase flag would be one
more thing to get wrong.

## D2. The frontier is read off the board, never off history

"Where the player is working" has two candidate definitions and only one of them is
safe:

- **The board's determined/undetermined boundary** — an undetermined element
  adjacent to a determined one. A function of the position.
- **The player's recent moves** — a function of *how* the position was reached. Two
  identical boards would then get different hints.

The second is disqualified, and not only on taste: the plan is recomputed from
scratch whenever the player goes their own way (`docs/games/hints.md` §
"Recompute-stable plans"), and a preference that depends on history is exactly the
alternating-measure ping-pong that section records as a 400-move non-convergence.

Within one plan build, ordering may key on the plan's own earlier firings, because
`deduceHintPlan` builds the whole plan in a single pass from the board — so that is
still a pure function of the position. It may **never** key on the midend's
displayed step.

## D3. Who measures contribution

The engine owns the *ordering*; the game owns the *metric* — what counts as the
frontier, and whether one firing's writes feed another's — because a Loopy edge and a
Solo cell do not share a notion of adjacency. Loopy reasons over edges and dots on an
arbitrary tiling; for the Latin family "beside" is a shared unit rather than a
coordinate distance.

This is an input a mechanism consumes, not a manifest a guard reads
(`AGENTS.md` § "Convention over configuration"), so it is healthy: a game that
supplies no metric keeps today's order, and nothing has to be declared *about* a
game anywhere.

**Open:** whether the metric is a distance per firing or the cheaper pair of
predicates the rule actually needs — "does this touch the frontier" and "does this
feed that". The rule is stated in terms of the predicates, so the burden is on
distance to justify itself. Settle it by measurement on Loopy Hard, where plans run to
180 firings, before generalizing.

## D4. Exploration order is load-bearing, so enumeration never touches the solve path

This is the hard constraint of the change, and it is stronger than cost. Loopy's
solver says so itself (`src/games/loopy/solver.ts`, the rung-loop comment):

> re-running cheap rungs that provably cannot use the new information. That is a
> speed optimization, but because the generator is solver-gated it is
> **load-bearing for which puzzles exist**: a solver that explores in a different
> order accepts a different set of boards. So the loop is ported exactly rather than
> adapted to the shared shape.

So reordering is not a tuning knob on a shared routine: **the generator's solver must
keep exploring exactly as it does today**, or the catalog of boards changes under
every player. The enumerating mode is therefore reachable only when a plan is being
built for a *hint*, it probes rungs on cloned boards rather than by changing the
scan, and the solve path keeps first-firing-wins byte for byte.

Two things follow that are easy to get wrong:

- A probe must not leave state behind. The rungs mutate as they detect, so asking
  "would this rung fire?" needs its own copy of the board.
- Generation cost stays a measured number (task 1.3), because cloning per probe is
  cheap only if it never reaches generation.

**Loopy already enforces the separation, which makes this cheaper than it sounds.**
`nextFiring` throws `"loopy solver: nextFiring off the hint path"` when no recorder
is attached (`src/games/loopy/solver.ts:1524-1526`), so the generator provably never
reaches it: an enumerating hook built around `nextFiring` inherits that guarantee
rather than having to re-establish it. What must stay untouched is the rung table
itself, whose own comment says *"The ordering is part of the solver's behavior, not a
presentation choice"* (`solver.ts:1328-1335`) — enumeration **probes** the rungs on
copies, it never reorders them.

## D5. A note belongs beside the firing that cites it

Loopy computes, for every planned firing, the closure of note-facts it rests on, and
already refuses to place a note no later firing uses. What it does not do is place
the note *near* its consumer: `planSteps` groups by `tickOf`, the plan position where
the fact was **found**, and its own comment says so — "a step placing each note it
and the later firings rest on **that was found ahead of it**".

Grouping moves to the earliest firing whose closure contains the fact, and the
measurement says that is worth doing: a note waits a median of 15 firings today, p90
87, worst case 143 (`findings.md`).

**But "delaying a note can never make it unjustified" is true of the fact and false of
the sentence**, which is the trap this section first walked into. The fact
accumulates; the *narration* quotes the board. Read out of `hint-text.ts`, Loopy's
note sentences split cleanly:

- **Monotone premises stay true.** *"The ringed dot already has a line"*, *"this 1's
  other edges are ruled out"*, *"this 1 takes one line"*. A line once drawn stays
  drawn, a ruled-out edge stays ruled out, and a clue never changes.
- **Expiring premises do not.** *"**Only these two** of this 3's edges are still open,
  and it needs 2 more"* (`pairAtClue`, `pairAtDot`, and the *"four open edges"* of
  `pairAcrossClue`/`pairAcrossDot`). The open set only shrinks, so a sentence naming
  exactly which edges are open can be false by the time its consumer fires — and
  `placePair` recomputes `needed` and `dotLines` from the `before` it is handed, so
  the numbers move with it.

**The split does not follow the fact kind**, which a partial read made it look like it
did. `cornerFromClue` has an expiring branch — *"this 3's other edges already give it
2"* counts drawn lines, which only grows — while `pairAtCorner` and `pairChain` are
monotone, citing only marks already on the board. One case is a genuine trap for
review: *"can give it 2 at most"* looks like a live count but states an **upper
bound**, and the true maximum only falls, so the sentence stays true as it loosens.
`findings.md` § "Which note sentences survive being deferred" classifies all of them,
and task 3.3 branches on the sentence, never on `fact.kind`.

`planSteps` rests on the invariant the recorder states — *"the board is unchanged
between a fact and the firing it was found ahead of"* — so deferring a note is
precisely what breaks it.

**So the regrouping splits by premise, not by fact kind.** A note whose sentence makes
only monotone claims moves to its consumer. A note whose sentence names which edges
are still open is placed at the latest step where that claim still holds, which bounds
its lag without letting it lie. The owner's own example, a corner note on a `1`, is in
the monotone half — so the reported defect is fixable in the safe direction.

**And "joins its consumer's journey" is not free here.** No Loopy step sets
`continuesPrevious`; `push` does not even take it, although the engine and a dozen
other games use it. Today every note Loopy places is a journey of its own, so bundling
a note with the deduction it serves is a *second* change beside the regrouping, and it
is player-visible: it changes how many Hint presses one deduction costs and how
auto-hint paces them. It is also exactly what the complaint asks for — a note and its
consumer arriving together is what makes the pair read as one story rather than as two
unrelated hints. One journey may need several note legs, because `chainPair` pushes a
note per link from inside a note placement.

## D6. The guard, and what it must not be

`hint-resume.test.ts` asserts that a game's hints reach a solution within a move
budget. It would stay green through a completely incoherent order, so it is not the
guard for this.

The guard asserts the rule on a real plan, and its two halves differ in what they
need:

- **The note guard.** Every note step is followed, within its journey, by the step
  whose closure contains it. No comparator, no enumeration, exact against today's
  data — which is why it is written first, alongside the regrouping it checks.
- **The continuity guard.** For each consecutive pair, either the step is within
  reach of the previous one, or no step within reach was available. That second
  clause is what makes it honest, and it is why this guard cannot be written before
  the enumeration hook of 2.1 exists.

Both must be seen to fail under a plant: the note guard by delaying a note past its
consumer, the continuity guard by reversing the comparator.

**A bare distance assertion with no availability clause would be worse than nothing.**
14.4% of today's steps already jump, an unknown share of those jumps are forced by
the board, and a guard that fails on a forced jump is a guard that gets switched off
rather than fixed.
