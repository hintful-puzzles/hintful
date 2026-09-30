# declare-drag-games-click-half

**Status: done (2026-09-30); the falsifier fired on none of the nine
(`design.md`).** Follows
`sweep-target-verb-input`, whose `design.md` § "Mines, Black Box, Loopy: the
release question, answered" is the finding this starts from.

## Why

Every member of the input survey now declares `Game.targetVerbs`, and the
model got its Controls paragraph and its keys-equal-buttons guard for each.
Nine drag games agree on Enter anyway (`derive-target-verb-input` Task 0):
Boats, Bricks, Clusters, Pattern, Spokes, Sticks, Tents, Tracks and Galaxies.
Each still hand-writes the cursor, Enter/Space and select branch its click
half shares with the members, and states the convention in help prose.

The question the sweep was asked — does declaring their click half need the
model to own resolve-on-release? — has its answer: **no**. Mines already
depresses on the press and acts on the release, and it declares its verbs: its
release arm calls the same verb functions (`openAt`, `chordAt`) the model calls
for keys. A drag game's click is the release of a zero-length drag, which is
the same shape.

## What changes

For each of the nine, in turn:

- Declare `targetVerbs` with the verbs a single-cell click applies.
- Route the keys (arrows, Enter, Space, verb letters) through
  `interpretTargetVerbs`; keep the press/drag/release arms, and make the
  release of a drag that never left its cell call the declared verb rather
  than its own copy of the transform.
- The help writes `{{controls}}`; the drag's paragraph stays the page's own.

Read one game first: Tents (2026-09-30) keeps its keyboard link-arming (`L`),
its Shift/Ctrl-arrow painting and its drag in arms, and its select keys map to
`T`/`N`/`B` placements a key-only verb or a verb's `keys` would express. Its
release applies `dragXform` per cell, so a one-cell release must apply exactly
the primary or secondary verb for the guard to pass.

## Falsifier

If more than about a third of the nine need the one-cell release to do
something no verb function can (a drag state the verb cannot see), stop and
record why: the drag games keep `interpretMove` whole and only their help
prose is shared.
