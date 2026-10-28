# Design

## Context

`retire-hint-ordinals` D4 rules that a chain is fair only if every link
writes a mark the player can make, and D7 kept a supposition rung that alone
defines its tier until a markable technique fills it. Map's Tricky rung,
`forcingChain`, was the last such rung (`teach-what-if-walks-with-marks` D10).
Measured 2026-10-28 at `33208bda`.

## D1. What Tricky's boards need without the chain (task 1.1)

Map's Easy and Normal rungs, run to a stall on Tricky boards dealt at HEAD
(40 at 15x20 of 30 regions, 15 at 25x30 of 75), leave a forcing chain the
next step every time. Its shortest firing at each stall is three regions
long in 30 of 40 and 6 of 15, four in 7 and 5, longer in the rest.

A three-region chain is a region with two colors, say yellow or pink, whose
neighbors are dotted yellow and teal and pink and teal. Whichever color the
middle region takes, one neighbor is left teal alone, so a region touching
both cannot be teal. Each case is one color placed and its neighbors' dots
read, nothing propagated beyond them: Path's weighed square
(`teach-what-if-walks-with-marks` D3), on a graph.

A clique rule (three mutually touching regions whose dots together are three
colors rule those out of a region touching all three) was measured first, and
finished 1 of 40 boards.

## D2. The rung: weigh every color of one region (task 1.2, 2.1)

`weighRegion` (`map/solver.ts`) takes a blank region, the middle one, and a
color `x`. For each other color the middle region can take, it looks for a
neighbor dotted with exactly that color and `x`; where every color has one,
a region touching all those ends cannot be `x`, provided it touches the
middle region too where the middle region could be `x` itself. Over 85
firings on those boards it took two shapes only: a two-color middle region
(60, the three-region chain) and a three-color one that could be `x` (25).
These are Sudoku's XY-wing and XYZ-wing, with "touches" for "sees".

It is a Check in the sense `solver-and-generator.md` § "Check, Tactic,
Search" gives for Path: every value of one element weighed, each by a look,
keeping what they all share. The words name the middle region and the ends
and leave the ways to the dots, which the premise legs write first:
"Whatever the middle region is, an end beside this region is violet, so it
can't be violet." Over 1,311 weighing steps on dealt boards the longest is
120 characters; "beside" becomes "by" in the four that would run over.

No other game has a wing (`git grep -i wing -- src` finds none). The Latin
games are where it would transfer: their notes are dots, "sees" is sharing a
row, column or box, and their Hard tiers lost the forcing chain on
2026-10-27 with nothing markable in its place. That is the engine's, filed
as `offer-the-wing-to-latin-games`. Map's rung reads only a graph's
adjacency and four-bit masks, so lifting it into the engine is a move, not a
rewrite, and is that change's to make once a second game consumes it.

Finishing, Easy, Normal and the weighing, of HEAD's Tricky boards: 29 of 40
at 15x20 and 5 of 15 at 25x30; with the two-color shape alone, 24 of 40.

## D3. Dealing, before and after (task 2.1)

Median / max ms, 12 boards a cell (8 at 25x30), HEAD then now:

| Cell | Tricky | Unreasonable |
| --- | --- | --- |
| 15x20, 30 regions | 17 / 57 → 20 / 87 | 21 / 54 → 21 / 123 |
| 25x30, 75 regions | 12 / 39 → 11 / 25 | 17 / 26 → 18 / 40 |
| 8x8, 12 regions | 68 / 540 → 149 / 357 | 130 / 457 → 133 / 360 |

`tier-walk` over Map, HEAD and after: the same 51 cells refused, none
dealt before and refused now; the "gave up" counts of the few-region and
three-wide cells move by one or two deals either way.

## D4. The chain retires (task 2.2)

Map's Unreasonable is guess and verify, which proves every board the chain
did, so `forcingChain` goes rather than moving: at Unreasonable it would only
speed a search the dealing times above do not need sped. Its scratch, its
hint and its sentence go with it.

**A board a player already has keeps its ID.** Of HEAD's Tricky boards, 34
of 100 at 15x20, 19 of 40 at 25x30 and 17 of 40 at 8x8 of 12 regions need a
chain the weighing does not reach. They open as Unreasonable, as the Latin
games' old Hard boards did (`retire-hint-ordinals` D7), and their hint stops
where the chain was with the trial-and-error refusal. Their saves and links
still open.

The frozen C fixtures dealt at Tricky and above keep only their solver half:
the rungs a tier runs decide which clues its board keeps, so the desc of a
Tricky or Unreasonable fixture no longer matches, and its board is held to
having one answer.

## D5. The absent cells (task 2.2)

`tierRefusal` calls some cells absent on counts made with the chain. The
weighing reaches boards the chain did not (its three-color shape), and
Unreasonable now holds what the chain alone solved, so the Tricky and
Unreasonable cells of each family were counted again.

Maps built with no board found, at Tricky and at Unreasonable each: 4,000,000
at 3x3 of 6 regions, 4x4 of 7, 5x5 of 7, 4x4 of 8, 5x5 of 8, 2x6 of 9 and 3x3
of 9; 1,000,000 at 10x10 of 7, 10x10 of 8, 2x20 of 30 and 4x4 of 16. The same
counter finds a 6x6 Tricky board of 11 regions once in about 19,000 maps, so
a cell found that seldom would not have survived these. Every refusal stands.

## D6. What retires with the exception (task 3.0)

With no supposition rung below Unreasonable left, `engine-hints`' exception
for one, "A Tactic's chain is shown on the board", "A Tactic's narration
names the ends, the links and the rule" (both about a chain a tier keeps), and
the clause in `engine-difficulty`'s "Only a tier named Unreasonable requires
Search" retire, with `hints-marks.md` § "Show the what-if walk statically"
and the guides' lines that cite them. "A rung is classified by the bound it
guarantees" goes too: it called a bounded walk a Tactic, and D4 of
`retire-hint-ordinals` made a bounded walk of suppositions a Search; a rung
is classified by whether its links are marks, which "A hypothesis is
classified as Check, Tactic or Search" states. That requirement now says a
weighing is a Check.
