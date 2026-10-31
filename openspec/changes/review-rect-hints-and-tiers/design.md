# Design: review-rect-hints-and-tiers

## What the walk found (measured 2026-10-31)

Eight Easy deals at each menu size, the hint's plan walked to the end.

**Rectangles barely uses past `reach`.** Fit and reach are 95–100% of steps at
every size. Of 56 boards, 54 finish with fit and reach alone; one needs
overlap, and one needs starve. No step was a line.

**Every Patches board needs more than `reach`.** Of 24 boards, 2 need nothing
past overlap, 8 need starve and 14 need line. Steps: fit 25–42%, reach
31–37%, overlap 3–7%, starve 9–21%, line 8–18%, with the dearer rungs growing
with the board. The strip hides 60–70% of sizes.

**The strip capped at `overlap` deals Patches boards as fast** (4 ms a board
at 7×7, 23 ms at 9×12) and leaves more on them: 40–49% of clues keep their
size, where the full ladder leaves 33–42%. Most such boards (17 of 24) finish
at reach, so Easy would be fit and reach with an overlap now and then.

**What makes a step hard is not what its sentence costs.** Two measures,
neither of which tracks it:

- *The sentence*: words, marks and premise elements are flat across rungs.
  Reach has the longest sentence (22 words) and is the easiest step.
- *The placements its claim ranges over*: reach ranges over the most (a
  median of 300 placements on Patches), because a `?` clue has many shapes,
  but a player judges "no other clue can reach it" by sight, not by
  enumerating.

What does order the rungs is **how many facts a step leans on that the board
does not show**, each one a claim about every placement of some clue:

| Rung | Facts not on the board | Count |
| --- | --- | --- |
| fit | none: every other placement is out at sight | 0 |
| reach | no other clue reaches the square | 1 |
| overlap | the other clue covers the striped squares wherever it goes | 1 |
| starve | for each other fit, some clue has no room, or some square no cover | 1 per fit, nested |
| line, takes | only these clues cross the edge; the owner always covers the square | 2 |
| line, misses | only these clues cross the edge; only that clue reaches the square | 2 |

The `line` "misses" sentence leaves its second fact unsaid. "Leaving the
outlined square uncovered" is true only because no other clue reaches that
square, and the words do not say so. That gap is what made the owner's
example read strangely.

## Proposed tiers

`Easy · Normal · Unreasonable`, through `searchTiers(2)`, like Mosaic:

- **Easy**: fit, reach, overlap. One fact not on the board at most, and never
  nested.
- **Normal**: adds starve and line.
- **Unreasonable**: unchanged.

On Rectangles, a Normal board is about 1 in 30, so the menu offers it on
Patches only (§ "A middle tier below Unreasonable": "Count the tier's share
before adding it"), and Custom deals it on both. An Easy board dealt before
this change that needs starve or line is relabeled Normal when it is opened,
since a pinned tier is kept or raised; nothing fails to open.

**The menu, decided with the owner.** The menu guard required every tier in
each ruleset and a board's tiers as one run, which Rectangles' sizes at Easy
and Unreasonable cannot be once Normal exists. The owner's word: "I just
don't want to enforce consistency across rulesets, which can be very
different from one another". So a ruleset's tiers are its own: a board's run
is of the tiers its ruleset's lines offer (`skips` in `PresetBoards`), and
"every tier is on the menu" is asked of the menu as a whole. Rectangles keeps
its twelve lines; Patches has the six left, 7×7 at every tier, 6×8 at Easy
and Normal, and 9×12 at Normal. Group's 8×8 gains Unreasonable, which the old
rule kept off for standing a tier apart from its run.

**How the hint keeps to a tier.** The rungs are two techniques, Easy's and
Normal's, so the engine's ceiling on a continuing plan takes no Normal step
while an Easy one fires. Measured over 420 Easy boards, one technique for
all five rungs never did either; the split makes it hold by construction.
Measured over eight deals at each size and tier, a Normal board takes 9–215
ms to deal at a median, and 378 ms at most, at 15×19.

## Proposed sentences

`clueName` gives a plain clue with no size as `?`, which reads as a stray
symbol in a sentence. Proposed: `? clue`, parallel to `tall clue`, which
costs 5 characters where "question mark" costs 13 and pushes most sentences
past the 120-character limit.

| Rung | Now | Proposed |
| --- | --- | --- |
| line, misses | Only the outlined ? can cross this edge, leaving the outlined square uncovered, so it must be a line. | Only the outlined ? clue can cross this edge, and it would miss the outlined square only it reaches, so the edge is a line. |
| line, takes | Only the outlined ? can cross this edge, taking the striped square the 6 always covers, so it must be a line. | Only the outlined ? clue can cross this edge, and it would take the striped square the 6 always covers, so the edge is a line. |
| fit, leaves out | …or leave out some of its drawn rectangle, so only this rectangle fits. | …or leave out part of the rectangle drawn round it, so only this rectangle fits. |
| overlap | …so the wide clue can't use them: it fits only this rectangle. | …so the wide clue can't use them and fits only this rectangle. |
| starve | Elsewhere the ? leaves the outlined clue no room… | Elsewhere the ? clue would leave the outlined clue no room… |

"So it must be a line" becomes "so the edge is a line", because "it" was
read as the clue. Reach is unchanged.

As built, the overlap sentence keeps its "follows" part, which the engine
writes with a colon: "…so the wide clue can't use them: this rectangle is all
it has left." Where two clues a sentence names read alike ("the outlined 18
… the 18"), the second is "the other 18".

## A mechanical measure of a hint's difficulty

The count above can be the engine's. A reference would declare whether the
fact it marks is seen on the board or derived: "the striped squares the 6
always covers" is derived, and "the outlined clue" is seen. A step's depth
would then be the derived references it names, plus one for a `follows`, and
a cross-game report could list, per game and rung, the depth of the sentences
it speaks. It would catch two things no guard now does: a rung whose tier
sits out of order with its depth, and a sentence that rests on a derived fact
it never names, as `line`'s "misses" does. Because it changes `hint-words.ts`
for every game, it would be filed as an engine change of its own.
