# order-hints-from-the-frontier — design

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

**So the criterion is contribution, not distance.** A step is admissible when it is
one of three things:

1. it **expands a front** outright;
2. it **advances a chain** that a later step turns into an expansion;
3. it **starts a new front**.

What is inadmissible is an **orphan** — a deduction nothing in the plan builds on and
which expands nothing itself. Distance was only ever a proxy for this, and a poor
one: a remote firing that opens a new region is welcome, while a nearby firing that
leads nowhere is the defect. Jumping between fronts is explicitly allowed.

Ordering within the admissible set: expansions first, then chains by how soon they
pay off, with the cheapest reasoning among equals — which is where "replace a single
difficult deduction with a chain of easier ones" lives, and where "if we really need
a difficult deduction, do it sooner rather than later" falls out, since a hard firing
is offered exactly when nothing easier is contributing.

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

Grouping moves to the earliest firing whose closure contains the fact. Facts only
accumulate, so a note derivable at discovery is still derivable later: delaying a
note can never make it unjustified, while advancing one could. The move is in the
safe direction.

## D6. The guard, and what it must not be

`hint-resume.test.ts` asserts that a game's hints reach a solution within a move
budget. It would stay green through a completely incoherent order, so it is not the
guard for this.

The sequencing guard asserts the *rule* on a real plan, and the rule has two halves
that fail differently:

- **No orphans.** Every step either determines something at a front or is depended on
  by a later step. This is the half the owner reacted to, it needs no comparator, and
  on a note step it is exact — which makes it the one to write first.
- **Ordering among the admissible.** For each consecutive pair, no available step both
  contributed more directly and needed cheaper reasoning.

Both must be seen to fail under a plant — the first by injecting a firing nothing
uses, the second by reversing the comparator. A guard for the second alone would stay
green through the exact defect that started this change.
