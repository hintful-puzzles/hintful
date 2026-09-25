# move-seismic-onto-the-candidate-walk — design

Go: Seismic's `buildSteps` is one call to `runCandidatePlan`, and it offers the
"Hints pencil in" choice, starting on the implicit reading.

## D1. The hook is a reach, and it replaces the regions at the cull sites (task 1.1)

The walk asked "what does a placed value rule out?" in four places, not three:
the placement cull (`regionDuplicateMarks`), the obvious clean
(`obviousCandidateMarks`), a note-less cell's implied candidates
(`impliedNotes`), and the fold's check that an earlier fold's placement took a
value from a later cell (`shareRegion`, which the proposal did not list).

All four take one function, `Reach = (i, n) => cells`: the cells an `n` at cell
`i` rules `n` out of. `regionReach(w, regionsOf)` is the default, every cell of
the placed cell's regions, so no game on the walk passes anything new, and
`adaptiveMarkAllMove` keeps its `regionsOf` signature and converts. Rome and
Salad call two of the helpers directly and wrap their `regionsOf` the same way.

A reach **replaces** the regions at those sites rather than sitting beside them,
because a second answer to the same question at the same site is two statements
that can disagree. `regionsOf` keeps the one job that does not depend on a value:
the regions a hidden single is classified in. For Seismic that is its area,
`holdsEvery: true`.

The helpers read the reach **outward from each placed value** (`ruledOut`), where
the region form had read inward from each empty cell. The two agree because
"two equal values may not stand together" is symmetric, which every rule in the
collection is; the outward form costs one reach per placed cell rather than one
per value per empty cell. `candidate-hint.test.ts` pins a value-dependent reach
("rules a value out as far as that value reaches"), and the eight walk games'
own suites passed unedited over the change, snapshots included.

`obviousCleanStep`, the half of `emitObviousCleanStep` Seismic called for its
own marks, lost its only caller and folded back in.

## D2. Seismic's finders are own rungs over the shown candidates (task 1.2)

Seismic records nothing (`record: () => []`), so the walk's recorded strike and
placement rungs never fire. Its three finders are own rungs over
`RungContext.shown`: a whole-area cell (note-free, so it fires in the opening),
a hidden single in an area, and a starved area. Soundness is unchanged: the
notes are vouched for by `findMistakes`, and a note-less cell's implied
candidates always hold its answer. A recorder would have meant threading one
through `solver.ts` for a script the finders already re-derive.

Three things surfaced once the frontier was choosing, each measured against a
baseline of the old plans (every leaf preset, six seeds, a plan every fifth move
along the walk, 1,160 plans):

1. **The rungs fired between the fill and the clean.** `RungContext.populated`
   was documented as "penciled in and cleaned" but under the populate reading
   meant "penciled in". Every other branch already equated it with the setup
   being done, so the field is now `setUp.done()` throughout. Its one other
   reader is Group, whose default reading is implicit, where nothing changed;
   `candidate-reading.test.ts` walks its populate reading and passed.
2. **A starved area competed with singles.** The frontier takes any rung's
   continuing firing, so Normal's technique would have been taught on Easy
   boards. The starve rung fires only on `nothingEarlier`, which is where the
   old plan had it and where a recorded harder deduction sits in every other
   game.
3. **A cell both naked and hidden was narrated as hidden** (50 steps), because
   its hatched area continues more. The shared classifier calls such a cell
   naked, so `hiddenSingles` skips it.

After those, the populate reading's plan takes the same first step at all 1,160
positions, so a player following hint after hint sees the same moves, and where
two whole plans hold the same moves they differ only in the words below. Where the moves differ it is the frontier's
order among available singles, the thing the walk exists to own; total steps
went from 49,877 to 49,110.

**What the words lost and gained.** A strike's ending is now the walk's
conclusion (fold-notes-into-conclusions): "…so cross those out." became "…so we
must cross out those 3s.", and a starve's "…so this cell can't be 3." became
"…so we must cross out this cell's 3." — and under the implicit reading, on a
note-less cell, "…so this cell must be 2" or "…so pencil in only 1 and 4". New
sentences: the note leg, in the words of the clean ("Only 1 and 4 aren't already
in this cell's area or within N cells of it in its row or column, so pencil them
in."), and `regionsFull` ("Every other number is already in …, so it can only be
3.").

## D3. The reading, measured (task 2.3)

Implicit ÷ populate plan length, and the share of blank cells the implicit plan
writes notes into, over every leaf preset at six seeds:

| Preset | Steps | Cells noted |
|---|---|---|
| Easy, both modes, 4x4 to 8x8 | 0.54–0.57 | 0% |
| Normal, 4x4 to 8x8 | 0.79–1.14 (Seismic 7x7 the one above 1.04) | 26–67% |

An Easy board falls entirely to singles the board shows, so the implicit plan
writes no note, and with no notes there is no cull leg after each placement.
On Normal the two are about even. By the collection's rule that makes Seismic
an override: it starts on `implicit`, and says why in `newUi`.

The proposal's worry was that a value-dependent reach is harder to read off a
blank cell than a row or column. The hint answers it where it matters: a cell a
step outlines, reads or strikes gets its notes written first, in words that
state the rule. A hidden single's area is hatched, not read, as everywhere
(each other cell shows the number gone by its own reach).

**The continuity guard, which a switched default must pass.**
`hint-frontier.test.ts` measured Seismic at 0.069 (bound 0.10); the populate
reading measures 0.040.

## D4. The instrument, checked before the finding

`plan-continuity.ts` took a board's width as `√n` and compared a placement's
value with pencil **bit indices**. Seismic's leaf presets are square, so the
first was latent; the second is live for every game whose note `n` is not bit
`n` (Seismic and Salad at `n − 1`, Rome's direction bits). It now reads `w` off
the state, and maps a note bit to its value through the values a strike step's
`marks` name at the bits it clears. A hand-built 3x2 plan in
`hint-frontier.test.ts` pins both, and was seen failing (one jump) on the old
instrument.

| Game (default reading) | Old instrument | New |
|---|---|---|
| Seismic | 0.081 | 0.069 |
| Salad | 0.040 | 0.018 |
| Rome | 0.058 | 0.058 |
| Keen (bit `n`, the control) | 0.036 | 0.036 |

Rome's implicit plan, the subject of `rome-implicit-continuity`, measured 0.137
on the old instrument and 0.135 on the new: the encoding is not its cause, and
that change's proposal now says so.

## What stays

- `seismic-hint.test.ts`'s trial-finder guard survives: at every point the
  populate plan's next step is a starve, the singles are spent and the finder's
  strikes equal what `placeNumber` + `regionsViable` reject.
- New in the same file: every note leg and `regionsFull` single is held to what
  `placeNumber` leaves a note-less cell after every number on the board is
  placed, which is the reach checked against the rule rather than against
  itself.
