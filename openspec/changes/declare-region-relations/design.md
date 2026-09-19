# declare-region-relations — design

## One list, one flag

Of the four combinations of "holds every value" and "forbids repeats", only
three exist: holding every value once implies no repeats. So a game does not
declare two properties per region. `regionsOf` returns the regions a value may
not repeat in, each a `CellRegion` carrying `holdsEvery: boolean`, and the
consumers derive what they read:

- the culls (the walk's dup strike and obvious clean, Mark-all, auto-pencil)
  read every region;
- the classifier (`placementInRegions`, behind `classifyPlacementInRegions` and
  `availablePlacements`) skips a region whose `holdsEvery` is `false`.

The filtering sits inside the classifier rather than in the plan, so no caller
can hand it a partial region: the plan, Group's own `availablePlacements` call
and any future one all get it.

`CandidatePlan.cullRegionsOf` is removed. With one declaration there is nothing
for it to override.

## The type refuses a cage declared whole

`WholeRegion<R> = R & { holdsEvery: true }` is what the classifier hands back.
For Solo's union, which tags only its whole regions with a `SoloRegion`,
that intersection is the tagged arm, so `singleReason` reads the tag without a
check. Declaring the cage `holdsEvery: true` without a tag is a type error,
which is a stronger guard than a test. Verified by flipping it: `tsgo` refuses.

## Keen's cage is not declared as "neither"

The proposal said Keen's cages would be declared as neither. That declaration
would be a statement nothing consumes, which is the manifest shape AGENTS.md
§ "Convention over configuration" refuses. A region with neither property is
simply not in `regionsOf`, which is what the requirement's Keen scenario
already pins, and `CellRegion`'s doc comment says so.

## What guards it

- `latin-hint.test.ts`: a region flagged `false` is never a hidden single's
  region, and the same cells flagged `true` are (so the test is not vacuous).
- `solo-hint.test.ts` "solo killer cages forbid repeats": planted with the cage
  cast to `holdsEvery: true`, four tests fail (the hint reads an untagged
  region); planted with the cage dropped from the list, three fail. Both
  restored green.
