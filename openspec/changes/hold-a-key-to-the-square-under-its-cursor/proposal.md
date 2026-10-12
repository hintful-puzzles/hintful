# hold-a-key-to-the-square-under-its-cursor

**Status: filed 2026-10-12 by `decouple-the-commit-from-the-whole-suite`,
which found it and did not mend it. Not started. It can start without an
answer from the owner.**

## Why

`src/engine/target-verb.test.ts` is what makes a game's generated Controls
paragraph true: "Enter does what a click does to the square under the cursor".
It checks that by comparing two sets of boards over the whole grid: the boards
a key reaches at every cursor position, and the boards its button reaches at
every point (`boardsReached` in `src/engine/testing/input-probe.ts`).

A set forgets where each board came from. **A key that acts on the square
beside the cursor passes**, because the board it leaves is one a click on that
neighbor also leaves. Planted on 2026-10-12: an erase key acting one square to
the right of the cursor stayed green. (An erase key that marks two squares is
refused, since no single click leaves that board.)

So the sentence the guard exists for, "the square under it", is the part it
does not hold. This is the engine's and not any one game's: every game that
declares `targetVerbs` is checked by the same comparison
(`git grep -l targetVerbs -- 'src/games/*/index.ts'`).

## What changes

The guard compares **per target**. A game's geometry already says both halves:
`cursorTarget(state, ui)` is the target the cursor rests on, and
`pointAt(state, ds, target, ui)` is a point that presses it (the block "a
geometry's pointAt is a point that addresses its target" in the same file
holds that). For every cursor position the walk reaches, the board a key
leaves is the board its button leaves when pressed at that target's point.

The set comparison can then go, or stay only for the key-only verbs whose
pointer route is a cycle and has no single press to pair with.

## What it costs today, and may stop costing

Loopy's case in this guard is 35 s of test time at the hooks' slice, the
dearest single case left in the suite outside the three walks (2026-10-12).
The probe writes a state out as a string to compare boards, and Loopy's state
holds its whole cyclic grid. A paired comparison needs one press per cursor
position and no set of strings, and `hint-resume.test.ts`'s `sameState` shows
the cheaper comparison: what two states share by reference is not walked.
Measure it before and after.

## What to expect

A stricter guard run for the first time over every declaring game may find
real defects: a key arm of a game's own that disagrees with its verb by one
square on some board edge. Each is that game's to fix in this change, since
the guard cannot land red.

## Capabilities

None at filing; the change sets `skip_specs`. If the paired form changes what
`ts-engine` or `testing` requires of `targetVerbs`, the delta is written then.

## Impact

`src/engine/target-verb.test.ts`, `src/engine/testing/input-probe.ts`, and
whichever games the stricter guard convicts.
