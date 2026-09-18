# teach-loopy-the-blocked-corner-pair — findings

## §1 The measurement, and the decision

**Decision (§1.4): proceed with the rung (§2). The fallback in §4 is not taken.**

Instrument: `src/games/loopy/measure-blocked-corner.test.ts`, temporary, deleted with
the change. Corpus of 57 boards — squares at 7×7 and 10×10 × four tiers × five seeds,
plus one board of every other tiling at Hard — **generated once with the pattern
switched off**, so both arms grade the same boards rather than each grading its own.

| | |
|---|---|
| boards that change tier | **0 of 57** |
| boards where the pattern fires at their own tier | 24 of 57 (32 firings) |
| narrow `clueOneShort` steps on the hint path | 398 → 376 |
| of those, replaced by the teachable step | **22** |
| plan firings over the whole corpus | 8225 → 8186 (−39) |

### Why nothing re-graded, and why it still had to be measured

The pattern's conclusions were already **rung-0 reachable**, so no cap's verdict can
move. On the owner's configuration the existing solver settles the same face in three
rung-0 firings: `clueOneShort` draws the two far edges, `dotFull` at the second blocked
dot rules out the edge between, and `clueStarved` draws the last. Grading asks only
whether the board comes out `"solved"` at a cap, which is a fixpoint property, and the
new rung adds no reachable conclusion to that fixpoint.

That made 0 the *expected* answer, not a known one. Firing **order** is observable in
Loopy: the `(thresholdDiff, thresholdIndex)` pair skips rungs whose information
provably cannot have changed, and `loopDeductions` can end a solve early with
`"ambiguous"`, which `gameHasUniqueSoln` counts as unsolved. A rung that fires sooner
reaches `loopDeductions` at a different board. So the argument bounded the risk; only
the measurement closed it.

**The proposal's trace is of the wrong rung.** It routes the owner's board through
`dlineDeductions`, but the board was Easy, where `SolverState.dlines` is `null` and
that rung never runs. The count of three firings and the narrow first step are both
right; the route is rung 0's. This matters because it decides the tier: the technique
belongs at Easy (§2.2), beside the one-dot deduction it strengthens, not at Normal.

### The frozen differential answers §1.2 independently, and harder

`loopy-differential.test.ts` passes unchanged, which is a stronger statement than the
57-board measurement and on a corpus this change did not choose:

- **Every description is byte-identical** across all 18 grid types and all four
  difficulties. The generator gates every clue removal, every board retry and the
  too-easy rejection on `gameHasUniqueSoln`, so an identical desc means the solver's
  verdict on every intermediate board is unchanged — even though its route through
  them is not.
- **Every board still needs the difficulty it was recorded at.** The fixture asserts
  `solveGame(state, diff - 1).status !== "solved"`, which *is* the re-grading
  stopping condition, per grid type and per tier.

Two instruments, chosen independently, agreeing — `AGENTS.md` § "Method", on checking
a finding against something outside the tool that produced it.

### Frequency, against the bar the proposal set in advance

> *"A pattern that fires twice a board is worth a rung; one that fires twice a corpus
> is not."*

0.6 firings per board, on 42% of boards, and 5 of 5 on 10×10 Tricky. Clear of the
floor, short of "twice a board" — the honest reading is that a player meets it
regularly rather than constantly, which is what a technique worth teaching looks like.

**Not square-only, so §2.3's generalization earns itself**: it fires on
Great-Hexagonal, Kites, Floret and Great-Great-Dodecagonal too. The guard it reuses,
`f.order - clue === currentNo + 1`, already *is* `clue = order − 1` stated over the
edges still open, so generalizing past the 3 needed no new arithmetic.

### What the benefit number is, and what it is not

−39 firings out of 8225 is 0.5%, and quoting that would misdescribe the change. The
unit that matters is how often a player meets the technique: **22 narrow steps became
teachable ones**, each collapsing about 2.8 firings into 1. The aggregate is a poor
proxy for a change whose whole value is concentrated where it fires.

## What the app showed (§6.1)

7×7 Easy, `7x7t0de:a32a32a22a2c302122b2b21a3e3323b3b22d`, firing 46 of 88 — the
earliest occurrence found over 450 boards at 4×4, 5×5 and 7×7. The pattern needs
lines already standing at two dots, so it is a mid-plan technique and there is no
board where it leads.

The frame composites correctly: both dots ringed, the clue outlined, the edge
between the dots banded broken, the two edges it draws banded solid.

### The sentence is 239 characters, against a 120 limit

`hint-quality.test.ts` caught it, and it is ledgered in `LONG_NARRATIONS` rather
than shortened. The soft limit is 120 and the hard ceiling 300, so it fits — but it
is long, and the owner should know the number rather than discover it.

Nothing shorter keeps what the wording was chosen for. Two premises (both dots have
a line; joining them leaves the clue one short), the image that teaches the shape
rather than the arithmetic, and both halves of a conclusion that settles a whole
face do not fit in 120 characters; the tightest rewrite preserving all three of the
task's constraints still runs past 200. The override exists for exactly this —
owner, 2026-09-10: *"a character limit as a linter, and a way to override it for a
few particularly complex hints"* — and this step replaces three narrow ones, so
dropping either half of the conclusion would leave the player where they started.

### One wording question for the owner

The board it fired on was **a 2 on a square with one edge already ruled out**, not
the pristine 3 the sentence was written for. The guard is `clue = order − 1` stated
over the edges still *open*, so that case is in scope and is not rare — it was the
first frame looked at.

There the sentence reads: *"…the edge between the dots is out, and the other 2 are
lines."* The face has **three** edges other than the one between the dots; two of
them are lines and the third was already ruled out. So the count is the number of
lines, not the number of "others". The sentence is true — two of the other edges
are lines, and the already-excluded one is drawn faintly so the player can see
which — but the phrase does double duty, and it is exact only when the face is
pristine.

Not changed here. The wording is the owner's and the tasks say it is not a draft to
re-open while implementing, so this is raised rather than rewritten. Three ways out,
if the owner wants one:

1. **Leave it.** True as written, and the marks disambiguate.
2. **Count the open edges instead** — "the other 2 open edges are lines". Exact in
   every case; adds a word.
3. **Drop the count** — "…and the rest are lines". Reads best but is false when one
   of the rest is already ruled out.

### The known positive (§1.3)

Built by hand rather than searched for: a square clued 3 with an external line planted
at each of two adjacent dots. The pattern fires exactly once and leaves the edge
between the two dots ruled out and the other three drawn. A sweep reporting "never
fires" is therefore distinguishable from one looking for the wrong shape.

One correction worth recording: the probe's first version printed the state of
`face.edges[0]` while claiming to report the middle edge, and only coincidentally named
the same edge. The firing count answered §1.3 either way, but the second half of the
line was measuring a neighbor of what it claimed — `AGENTS.md` § "Method", first rule.
