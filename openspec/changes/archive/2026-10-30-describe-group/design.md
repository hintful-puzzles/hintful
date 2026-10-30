# Design

The measurements are `report.md`'s; this is what was decided, and why.

## 1. A product is a cell, named by `cell(x, y)`

Group's techniques read "the cell holding `a·b`", where `a·b` is itself a
value read off the board. The syntax had no way to name a cell by its
coordinates, so the compiler gains `cell(x, y)`, and the description defines
`mul(a, b)` as `cell(b - 1, a - 1)`. A product is a cell, and no
table-specific sort was needed. The compiled code does not check that the
coordinates are on the grid. Group's are, by construction, and a check on
every read would cost what hoisting saves. The checker reads an off-grid
cell as none.

## 2. Normal is two techniques

The hand-written `solverNormal` was associativity, and then the identity's
row and column when associativity found nothing. A rung runs its tier's
techniques in order and stops at the first that fires, so stating them as
two techniques at Normal, associativity first, keeps that order. It also
gives each its own reason and its own soundness verdict. The identity fill
is one firing for the whole row and column, as it was one return.

## 3. A technique that reads no clues is a rung through `uncluedRung`

The library's helper for a technique without clues was private and named
for the library. Group's techniques have the same shape, so it is exported
as `uncluedRung`, and the compiler leaves out the `Clues` interface for a
description with no clue kinds, rather than emitting an empty one.

## 4. The description's tiers are pinned to the difficulty constants

The ladder runs a technique at its tier's index in the description, and the
params encode a tier by `state.ts`'s constant. They are one order held
twice. Deriving the constants from the compiled module would make
`state.ts`, which the params codec and the menu read, import the solver's
module. A test that names each constant's tier is the cheaper way to keep
the two together, and it was seen to fail with two tiers swapped.

## 5. Hoisting

**Where a term may move.** A loop-free term that binds nothing, reads no
candidate and makes no fact moves to the slot of the last name it reads.
That is the earliest place all its inputs exist, and it is at or before
every use. Such a term is then computed whether or not the guard around its
use holds. So none of the reads it may make can throw: an off-grid index
reads as `undefined` or `-1`, and the result is discarded where the guard
fails.

**Why candidates never move.** A solve applies each fact as it concludes it,
so a strike changes candidates under a loop that read them. The per-call
candidate mask already keeps a cell's mask once read, and resets it after a
firing. Moving a read past that reset would be wrong; moving it before the
reset would gain nothing.

**Why `value` and `known` move only where nothing places.** A strike leaves
both unchanged, so in a strike-only technique they are constant for the
whole call. In a technique that places they can change mid-loop. No
statement today reads one across a placement, so the rule costs nothing yet,
and it stays for the statement that will.

**Why a read moves even without leaving a loop.** The gain measured by hand
was partly sharing: `set` read `|T|` three times and `|V|` twice in one
iteration. A read goes to its slot so that later uses find it there.
Arithmetic and comparisons move only when they leave a loop, since V8
already hoists pure arithmetic on locals and moving them gains nothing.

**Its off switch was temporary.** The pass was checked against HEAD by
compiling with it off, confirming the output was HEAD's byte for byte, and
diffing every Latin game's trace. The switch came out once that passed, and
`research/describe/trace-latin.test.ts` stays for the next compiler change.
