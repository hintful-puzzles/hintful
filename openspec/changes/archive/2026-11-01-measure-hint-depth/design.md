# Design: measure-hint-depth

## The declaration

A reference is declared derived by wrapping it: `derived(mark.the(…))` in
`engine/hint-words.ts`. The wrapper takes a narration that is exactly one
reference and returns it with a `derived` field on its `MarkRef`. Every
`mark.*` builder keeps its signature, so a sentence opts in at the reference
and nowhere else. `narrow`, `remarked` and `capitalized` copy the field
along with the rest of the reference.

`derived` says how many facts the reference carries:

- `"fact"` (the default): its elements together carry one fact. Overlap's
  striped squares are one claim, "the 4 covers these wherever it goes",
  however many squares it covers.
- `"each"`: each unit the reference names carries a fact of its own.
  Starve's outlined clues are each "this clue would have no room", one claim
  per clue.

**A step's depth** is `Narration.depth`, the sum over the references the words
still name. A narrowed reference that names nothing counts nothing.

## No extra count for a `follows` part

The proposal counted one more for a `follows` part. That counts overlap
twice. "Wherever the outlined 4 goes, it covers the striped squares, so the 6
can't use them" has one fact the board does not show, the stripes, and its
`follows` is that fact's consequence. Reach is the same shape: "No other clue
can reach the outlined square, so the 6 must cover it". So the fact is
declared on the reference it is about, `follows` adds nothing, and reach's
square is the derived reference. A sentence has no place to keep a fact it
names in neither a reference nor its `follows` part, which is the point of
the declaration.

## What each game declares (task 1)

**Rectangles**: reach's square (fact), overlap's stripes (fact), starve's
starved clues and stranded squares (each), and line's crossers ("only these
can cross", fact), the squares they would take (fact) and the squares they
would miss (each). Fit names only seen things: the clues it would take in.
Depths: fit 0, reach 1, overlap 1, starve 1 per clue or square named, line 2.

**Palisade, an edge game**: most of its facts are counts the board shows.
Two are not. `cluesVersusRegionSize` claims a lower bound over every way to
complete two clues, and `equivalentEdges` claims that two edges share a fate
in every completion. Both are declared on the reference the claim is about:
the clues and the region.

**Towers, a candidate game**: a note the player wrote is on the board, so
`single`, `hiddenSingle`, `set`, `confined` and `wing` read notes and declare
nothing. The clue arms whose claim ranges over every arrangement of a line
are derived: `arrangement`, `lowerBound` and `lineFull`, on the clue's line.
`facing` too: its pinned tallest is a claim over every arrangement of the
line. `fullLine` and `tallestNearest` are seen: the clue's value says the
line's order outright.

## The report

`scripts/checks/hint-depth.test.ts`, run through `npm run diff` like the other
hint reports, writes `metrics/hint-depth.md`. It deals every board each hinted
game's menu offers, two seeds each, and walks each board's plan to the end. A
step's depth is recorded against its rung and the tier of the board it was
spoken on.

**A rung's tier is measured**: the lowest tier on whose boards it is spoken.
No declaration of a rung's tier exists outside a solver's own structures
(Rectangles' `TIER_RUNGS`), and the report needs none.

**What it lists**: for a game with two or more tiers, a step whose depth is no
deeper than the typical step of a lower tier's rungs, or deeper than the
typical step of a higher tier's rungs. "Typical" is a rung's median depth.
Such a step either sits in the wrong tier, or its words rest on a fact they
do not name. The second is the case the proposal asks the report to catch.

**A zero is not silent**: a game that declares no derived reference anywhere
is listed as undeclared, not as shallow.

## Tried against the old `line` sentence (task 3)

Before 2026-10-31, the `line` "misses" case read "…, leaving the outlined
square uncovered". It named the square as seen, since the words said nothing
of why it would stay uncovered. Planted back, over 150 deals of each
Rectangles board (measured 2026-11-01), `line` read `1×699 2×1585`, and the
report listed its 699 depth-1 steps as no deeper than Easy's typical 1. With
today's words `line` reads `2×2099 3×168 …` and is not listed.

**The default sample would have found it too.** About 30% of `line` steps
miss a square (699 of 2,284), and two deals of each board speak 24 `line`
steps, so the plant is listed at the default. `HINT_DEPTH_SEEDS` deals more
for a rarer case.

## What the run over every game listed (measured 2026-11-01)

65,481 steps in 61 games; 3 declare. Each listing, with a recommendation, is
for the owner (task 4):

- **Rectangles' starve at depth 1** (9 of 14 steps at 2 deals; 297 of 1,158
  at 150): "Elsewhere the 6 would leave the outlined square uncovered". A
  stranded square is uncovered because no other clue keeps a fit over it once
  the 6 is placed elsewhere, and the words do not say so: the gap the old
  `line` sentence had. Depth does not see that the claim is made under a
  supposition, "elsewhere", which is what makes starve Normal.
- **Towers' tiers do not follow depth.** Its Tricky rungs, `set` and `wing`,
  read 0, because they read notes the player wrote; its Easy clue rungs,
  `lowerBound`, `lineFull` and `facing`, read 1. A candidate game's step is
  hard for how widely its pattern spans the notes, which seen-or-derived
  does not count.
- **Palisade** has one tier below its search tier, so nothing can be out of
  order; `cluesVersusRegionSize` and `equivalentEdges` read 1, the rest 0.
- **58 games declare nothing**, so the depths say nothing about them yet.

## The owner's answer (2026-11-01)

"Ok, yes, accepted. I would try to apply the measure to all games, but only
if there is a straightforward approach here. If not, I'm ok with you to
abort it."

**Starve now names its fact.** A stranded square reads "the outlined square
no cover", parallel to "the outlined clue no room": nothing is left to cover
it. "With no clue left to cover it" said it at greater length, and with both
reasons the sentence ran to 142 characters, over the 120 a step is held to.

**Declaring every game is declined: there is no straightforward approach.**
The games' sentence files make 445 references, measured 2026-11-01 by
counting `mark.the`, `mark.this`, `mark.as` and `mark.paren` in each
`hint-text.ts`. No rule decides one of them; each is a reading of the
solver's firing. Rectangles' stranded square was seen or derived only by how
`stranded` is computed. The report would also say nothing useful about many
of them. Candidate games are hard by pattern breadth, as Towers shows, and
searching games have no rung to order. The three declaring games stay, as
the report's known positive. A game declares where a tier question about its
rungs comes up (`docs/hints.md` § "Say the fact the board does not show, and
declare it").
