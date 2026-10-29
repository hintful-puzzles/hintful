# Experiment A: what the ladders say, with no language

Task 3.2, run 2026-10-29. For every game with a hint and a difficulty item,
boards were dealt at each tier and the hint was followed to the end; each step
recorded its rung and the size of its premise. Nothing in the app changed.

## Method

- **Population**: `HINT_GAMES` with a difficulty item, 44 games. The 15 games
  with a hint and no tiers (the planning games, Mines, Black Box, Guess,
  Untangle and the rest) are outside it by construction.
- **Boards**: at each tier, the first leaf preset of the menu at that tier (or
  the first leaf moved to it), four seeds (`exp-a-0` to `exp-a-3`). The
  presets are the menu's small sizes, so these are a player's first boards at
  each tier, not its hardest.
- **The walk**: `hint()` with no `aux`, take the plan's first step, play it,
  ask again, to a solved board or a refusal; 3,000 steps and 60 seconds a walk
  at most. Every walk below Unreasonable reached a solved board. Unreasonable
  was refused on every board but two of Dominosa's, which the hint finished.
- **Premise**: the elements the step's words mark in the roles it reasons from
  (`outline` and `stripes`). A step that reads only the square it decides (a
  naked single) marks none; it is counted as one.
- **Gaps**: Group at Hard, 6×6, could not be dealt (`RetryLimitExceeded`, a
  cell `dealsPromptly` already knows is rare). The instrument was a scratch
  test and is not kept; its loop is `testing/hint-positions.ts`'s
  `scanHintPositions`, with the premise read off `HintStep.words.refs`.

**What the instrument cannot see.** A rung is the hint's name for a step,
and a technique is the solver's. The two coincide in most games and not in
all: Unruly's solver has five techniques on three tiers
(`three-in-a-row` and `single-gap` Trivial, `complete-count` and
`unique-rows` Easy, `near-complete` Normal) and its hint four rungs, and the
hint takes `complete` wherever it applies, including on boards the grader
solved without it. A hint walk is one route through a board; the grader's
is another. The census the engine already has (`describeLadderCensus`,
reading the runner's `firings`) sees the grader's route, and needs a
per-game hook to read.

## Summary

| Game | Tiers walked | Rungs at the first tier | Rungs in all | A tier the rungs cannot see | Largest premise |
| --- | --- | --- | --- | --- | --- |
| Loopy | 4 | 7 | 23 | | 56 |
| Unequal | 4 | 1 | 9 | | 10 |
| Solo | 5 | 1 | 8 | | 9 |
| Dominosa | 3 (+2 Unreasonable) | 2 | 8 | | 6 |
| Rome | 3 | 4 | 8 | | 12 |
| Boats | 4 | 4 | 9 | | 10 |
| Tracks | 3 | 5 | 9 | | 27 |
| Group | 3 | 1 | 7 | | 8 |
| Mathrax | 3 | 2 | 7 | | 5 |
| Keen | 4 | 5 | 7 | Normal | 12 |
| Ascent | 4 | 2 | 7 | Normal | 37 |
| Seismic | 2 | 3 | 7 | | 5 |
| Star Battle | 3 | 5 | 7 | | 14 |
| Salad | 2 | 10 | 12 | | 15 |
| Towers | 3 | 9 | 11 | | 6 |
| Singles | 2 | 7 | 9 | | 5 |
| Tents | 2 | 7 | 8 | | 9 |
| Bridges | 3 | 2 | 5 | | 15 |
| Light Up | 2 | 3 | 5 | | 10 |
| Magnets | 2 | 4 | 5 | | 9 |
| Pearl | 2 | 4 | 5 | | 28 |
| Slant | 2 | 4 | 5 | | 14 |
| Mosaic | 2 | 2 | 4 | | 2 |
| Spokes | 2 | 3 | 4 | | 9 |
| Map | 3 | 1 | 3 | | 3 |
| Path | 3 | 1 | 3 | | 8 |
| Unruly | 3 | 2 | 3 | Normal | 8 |
| Clusters | 2 | 1 | 2 | | 2 |
| Undead | 2 | 5 | 5 | Normal | 9 |
| Subsets | 2 | 5 | 5 | Normal | 10 |
| Numgame | 4 | 3 | 3 | Normal, Tricky, Hard | 1 |
| ABCD, Bricks, Crossing, Filling, Galaxies, Net, Palisade, Pattern, Range, Rect, Separate, Signpost, Sticks | 1 deductive tier | 2 to 6 | the same | | 2 to 14 |

## What it shows

**The traces separate the tiers, where the rungs are the techniques.** In
38 of the 44 games, every tier above the first fires a rung the tiers below
it did not, and in most of them on every board dealt (the per-game tables
below say on how many). In six the tier above the first fires nothing new:
Keen, Ascent, Unruly, Undead and Subsets at Normal, and Numgame above Easy.
Unruly was read (above): its Normal tier is one solver technique that its
hint's rungs fold into a rung the Easy boards also fire. Numgame is no
deduction game; its tiers are sizes of arithmetic. The other four were not
read, and are the same shape until shown otherwise. So **a tier is a set of
techniques only where the hint's rungs and the solver's techniques are one
vocabulary**, which the doctrine of one engine and two projections asks for
and the tree does not yet give in six games. A language whose technique is
one identity for the grader and the narrator closes that gap by
construction.

**A step's premise is small, and its largest says where the game is global.**
The mean premise is between 1 and 5 elements in every game. The largest
premises are in the games whose rules are about a whole structure: Loopy
(56), Ascent (37), Pearl (28), Tracks (27), Bridges and Salad (15). Those are
the connectivity and single-loop rules the prior art finds hardest to state
(`design.md` § "Prior art"), seen from the other side: the rule that is hard
to state is the one whose deduction reads far.

**The ladders have three shapes**, which is the first structural reading of
"easy to learn, hard to master" (question 5):

- **Steep**: few rungs at the first tier and many added after it. Loopy
  (7 to 23), Unequal (1 to 9), Solo (1 to 8), Group (1 to 7), Dominosa (2 to
  8), Mathrax (2 to 7). The premise grows too: Solo's mean goes from 1.0 at
  Easy to 3.0 at Hard. This is the shape the phrase describes.
- **Front-loaded**: most rungs at the first tier, few after. Salad (10 to 12),
  Towers (9 to 11), Singles (7 to 9), Tents (7 to 8). A player meets the whole
  method at once.
- **Flat**: one deductive tier. Thirteen games: ABCD, Bricks, Crossing,
  Filling, Galaxies, Net, Palisade, Pattern, Range, Rect, Separate, Signpost
  and Sticks. Their ladders have 2 to 6 rungs, all needed from the first board.

Whether a player would call the steep games easy to learn and hard to master
is not something a trace can say (question 5): this project collects no play
data.

**The traces separate the games by their own rungs, and not by the family's.**
Rung ids are per game, so two games share only what one engine names: the
Latin family's `regionsFull`, `hiddenSingle`, `single`, `set`, `wing`,
`note` and `clean`. On those the first tier does not separate games. Solo,
Unequal and Group at Easy are the same trace, `regionsFull` alone, and
Unequal's own `greater` and `lesser` arrive at Normal. So the cut between
games cannot be read off a game's first tier. It needs the ladder whole,
which is how `taxonomy.md` § "What the techniques share" measured it.

**What the traces support for the theory.** A tier is a set of techniques,
dealt by the distribution (a tier is a generator setting, as the taxonomy
files it). The family is what the shared engine's rungs cover. The game is
what its own rungs add. And where a game's ladder is flat, the theory can
say less about its learning curve than about any other game's.

## Per game

Each row is one tier: boards walked, mean steps to solve, rungs fired, the
rungs no lower tier fired with their firings, on how many boards one of those
fired, and the premise's mean and maximum.

| Game, tier | Boards | Steps | Rungs | New rungs | Boards | Premise |
| --- | --- | --- | --- | --- | --- | --- |
| ABCD Easy | 4 | 37 | 5 | `populate` 4, `satisfied` 48, `single` 57, `clean` 33, `packed` 7 | | 2.5 / 5 |
| Ascent Easy | 4 | 14 | 2 | `touch` 34, `wholeRun` 22 | | 1.6 / 8 |
| Ascent Normal | 4 | 15 | 2 | none | 0/4 | 1.5 / 3 |
| Ascent Tricky | 4 | 10 | 3 | `reach` 1 | 1/4 | 2.9 / 8 |
| Ascent Hard | 4 | 12 | 7 | `only` 7, `routeOnly` 1, `route` 1, `routeBeside` 1 | 4/4 | 3.1 / 37 |
| Boats Easy | 4 | 18 | 4 | `givenClue` 7, `neverTouch` 33, `lineSatisfied` 15, `lineForced` 18 | | 3.3 / 6 |
| Boats Normal | 4 | 20 | 6 | `onlyRunsLeft` 3, `growTooLong` 1 | 4/4 | 3.0 / 6 |
| Boats Tricky | 4 | 22 | 8 | `sharedDiagonal` 6, `runTooShort` 1 | 4/4 | 3.6 / 6 |
| Boats Hard | 4 | 19 | 6 | `refuted` 7 | 4/4 | 4.8 / 10 |
| Bricks Easy | 4 | 31 | 5 | `undercount` 44, `strandSupport` 33, `unsupported` 25, `overcount` 14, `three` 9 | | 1.2 / 2 |
| Bridges Easy | 4 | 8 | 2 | `exactSpace` 24, `everyNeighbor` 6 | | 1.4 / 4 |
| Bridges Normal | 4 | 12 | 4 | `wouldSealGroup` 2, `needsThisWay` 5 | 4/4 | 1.7 / 6 |
| Bridges Tricky | 4 | 13 | 5 | `wouldStarve` 2 | 2/4 | 2.4 / 15 |
| Clusters Easy | 4 | 35 | 1 | `direct` 139 | | 1.0 / 1 |
| Clusters Normal | 4 | 36 | 2 | `count` 5 | 4/4 | 1.0 / 2 |
| Crossing Easy | 4 | 8 | 2 | `onlyNumber` 31, `crossRuns` 1 | | 3.4 / 12 |
| Dominosa Easy | 4 | 10 | 2 | `onlySpot` 38, `squareOnly` 2 | | 1.0 / 1 |
| Dominosa Normal | 4 | 19 | 6 | `squareSingleDomino` 5, `mustOverlap` 3, `localDuplicate` 4, `parity` 3 | 4/4 | 1.1 / 5 |
| Dominosa Tricky | 4 | 38 | 7 | `set` 22 | 4/4 | 1.4 / 6 |
| Dominosa Unreasonable | 2 | 50 | 7 | `localDuplicate2` 1 | 1/2 | 1.9 / 5 |
| Filling Easy | 4 | 23 | 3 | `growth` 91, `lonely` 1, `blocked` 1 | | 2.1 / 8 |
| Galaxies Easy | 4 | 58 | 5 | `dotTile` 27, `separate` 151, `soleOwner` 42, `onlyReach` 9, `enclosed` 1 | | 3.4 / 14 |
| Group Easy | 4 | 18 | 1 | `regionsFull` 70 | | 1.0 / 1 |
| Group Normal | 4 | 21 | 3 | `hiddenSingle` 2, `associativity` 25 | 4/4 | 1.7 / 6 |
| Group Tricky | 4 | 53 | 7 | `note` 36, `set` 8, `clean` 1, `single` 1 | 4/4 | 3.1 / 8 |
| Keen Easy | 4 | 39 | 5 | `populate` 4, `cage` 51, `hiddenSingle` 9, `clean` 37, `single` 55 | | 1.5 / 4 |
| Keen Normal | 4 | 100 | 5 | none | 0/4 | 1.9 / 6 |
| Keen Tricky | 4 | 108 | 6 | `cageLine` 20 | 4/4 | 1.9 / 6 |
| Keen Hard | 4 | 119 | 7 | `set` 22 | 4/4 | 2.3 / 12 |
| Light Up Easy | 4 | 9 | 3 | `clueSaturated` 12, `clueSatisfied` 9, `forcedLight` 14 | | 2.4 / 10 |
| Light Up Normal | 4 | 12 | 5 | `discountClue` 3, `discountUnlit` 3 | 4/4 | 2.7 / 10 |
| Loopy Easy | 4 | 87 | 7 | `clueFull` 54, `deadEnd` 38, `clueStarved` 38, `lineContinues` 110, `clueOneShort` 27, `dotFull` 71, `earlyLoop` 11 | | 1.6 / 43 |
| Loopy Normal | 4 | 90 | 9 | `cornerAtDot` 7, `clueBound` 10 | 4/4 | 1.6 / 27 |
| Loopy Tricky | 4 | 124 | 15 | `cornerFromClue` 79, `cornerAcross` 22, `corner` 21, `cornerOppositeExit` 7, `cornerExit` 14, `clueBlockedPair` 2 | 4/4 | 1.8 / 56 |
| Loopy Hard | 4 | 124 | 23 | `pairAtDot` 6, `pairAcrossClue` 7, `pairAcrossDot` 4, `matchingPair` 1, `pairAtClue` 2, `pairAtCorner` 9, `pairChain` 10, `parity` 5 | 4/4 | 1.6 / 56 |
| Magnets Easy | 4 | 26 | 4 | `lineFull` 44, `force` 44, `lineExact` 14, `oddGap` 2 | | 2.9 / 9 |
| Magnets Normal | 4 | 25 | 5 | `oneNeutralLeft` 5 | 2/4 | 3.0 / 8 |
| Map Easy | 4 | 16 | 1 | `onlyColorLeft` 66 | | 1.0 / 1 |
| Map Normal | 4 | 21 | 2 | `sharedPair` 19 | 4/4 | 1.1 / 2 |
| Map Tricky | 4 | 24 | 3 | `weighRegion` 18 | 4/4 | 1.3 / 3 |
| Mathrax Easy | 4 | 23 | 2 | `clue` 30, `regionsFull` 62 | | 1.3 / 2 |
| Mathrax Normal | 4 | 29 | 5 | `note` 8, `single` 9, `clean` 4 | 4/4 | 1.3 / 2 |
| Mathrax Tricky | 4 | 52 | 7 | `hiddenSingle` 7, `set` 3 | 3/4 | 1.5 / 5 |
| Mosaic Easy | 4 | 3 | 2 | `needsAll` 7, `met` 5 | | 1.0 / 1 |
| Mosaic Normal | 4 | 34 | 4 | `needsMore` 14, `sameNeed` 10 | 4/4 | 1.2 / 2 |
| Net Easy | 4 | 46 | 2 | `side` 180, `loop` 2 | | 1.8 / 4 |
| Numgame Easy | 4 | 2 | 3 | `starts` 2, `last` 4, `onlyStart` 2 | | 1.0 / 1 |
| Numgame Normal, Tricky, Hard | 12 | 3 to 5 | 3 | none | 0/4 each | 1.0 / 1 |
| Palisade Easy | 4 | 36 | 6 | `numberExhausted` 54, `notTooBig` 54, `notTooSmall` 23, `equivalentEdges` 6, `noDanglingEdges` 5, `cluesVersusRegionSize` 3 | | 3.4 / 9 |
| Path Easy | 4 | 27 | 1 | `forced` 107 | | 1.0 / 1 |
| Path Normal | 4 | 28 | 2 | `breaks` 10 | 4/4 | 1.1 / 8 |
| Path Tricky | 4 | 54 | 3 | `weighed` 6 | 4/4 | 1.2 / 6 |
| Pattern Easy | 4 | 63 | 2 | `overlap` 128, `unreachable` 123 | | 2.7 / 10 |
| Pearl Easy | 4 | 26 | 4 | `square` 90, `whiteTurnsOpposite` 9, `blackCannotRunOn` 6, `whiteCannotTurn` 1 | | 1.0 / 2 |
| Pearl Normal | 4 | 29 | 5 | `closesEarly` 5 | 4/4 | 1.8 / 28 |
| Range Easy | 4 | 41 | 4 | `reach` 104, `overrun` 14, `satisfied` 30, `adjacency` 17 | | 5.4 / 14 |
| Rect Easy | 4 | 10 | 2 | `fit` 37, `reach` 4 | | 2.3 / 7 |
| Rome Easy | 4 | 15 | 4 | `regionsFull` 11, `loop` 36, `single` 12, `clean` 1 | | 1.8 / 10 |
| Rome Normal | 4 | 17 | 5 | `reach` 12 | 4/4 | 1.9 / 11 |
| Rome Tricky | 4 | 20 | 8 | `onlyHome` 3, `opposite` 5, `note` 2 | 4/4 | 1.9 / 12 |
| Salad Easy | 4 | 46 | 10 | `populate` 4, `borderNear` 21, `borderFar` 18, `crossNaked` 12, `countHolesDone` 44, `circleXNote` 12, `single` 44, `clean` 21, `countLettersDone` 4, `hiddenSingle` 4 | | 2.3 / 6 |
| Salad Normal | 4 | 74 | 12 | `set` 17, `xNoteGone` 2 | 4/4 | 3.1 / 15 |
| Seismic Easy | 4 | 13 | 3 | `regionsFull` 45, `singleton` 2, `hidden` 4 | | 1.2 / 4 |
| Seismic Normal | 4 | 21 | 6 | `note` 13, `starve` 7, `single` 14, `clean` 11 | 4/4 | 1.4 / 5 |
| Separate Easy | 4 | 22 | 3 | `sharedLetter` 35, `onlyWay` 38, `walledApart` 13 | | 2.7 / 6 |
| Signpost Easy | 4 | 14 | 2 | `onlyNext` 43, `onlyBefore` 11 | | 1.8 / 3 |
| Singles Easy | 4 | 14 | 7 | `sandwich` 5, `sameLine` 24, `adjBlack` 25, `corner2` 1, `offset` 1, `boxedIn` 1, `corner3` 1 | | 2.5 / 5 |
| Singles Normal | 4 | 19 | 8 | `split` 6, `pair` 1 | 4/4 | 2.6 / 5 |
| Slant Easy | 4 | 26 | 4 | `clue-fill` 47, `clue-empty` 47, `mark-clue` 3, `loop` 6 | | 3.0 / 14 |
| Slant Normal | 4 | 28 | 5 | `mark-v` 1 | 1/4 | 3.1 / 11 |
| Solo Easy | 4 | 24 | 1 | `regionsFull` 98 | | 1.0 / 1 |
| Solo Normal | 4 | 26 | 2 | `hiddenSingle` 16 | 2/4 | 1.8 / 6 |
| Solo Tricky | 4 | 28 | 6 | `note` 9, `intersect` 5, `single` 9, `clean` 2 | 4/4 | 1.5 / 6 |
| Solo Hard | 4 | 70 | 7 | `set` 13 | 4/4 | 3.0 / 9 |
| Solo Extreme | 4 | 69 | 8 | `wing` 4 | 4/4 | 3.0 / 9 |
| Spokes Easy | 4 | 31 | 3 | `saturation` 76, `exhaustion` 42, `twoOnes` 7 | | 1.1 / 2 |
| Spokes Normal | 4 | 35 | 4 | `breaks` 24 | 4/4 | 1.3 / 9 |
| Star Battle Easy | 4 | 16 | 5 | `confined` 12, `crowded` 4, `exact` 20, `around` 9, `full` 17 | | 4.7 / 9 |
| Star Battle Normal | 4 | 18 | 6 | `banded` 4 | 4/4 | 4.9 / 14 |
| Star Battle Tricky | 4 | 21 | 7 | `starved` 5 | 4/4 | 5.2 / 14 |
| Sticks Easy | 4 | 20 | 5 | `unreachable` 32, `starved` 14, `tooLong` 21, `overConnected` 7, `twoClues` 6 | | 1.8 / 5 |
| Subsets Easy | 4 | 46 | 5 | `arrowMask` 28, `arrowKnown` 25, `hiddenSingle` 52, `collapse` 63, `ruleOut` 17 | | 2.7 / 8 |
| Subsets Normal | 4 | 54 | 5 | none | 0/4 | 3.1 / 10 |
| Tents Easy | 4 | 22 | 7 | `noTree` 4, `lineCount` 25, `treesDone` 11, `nextToTent` 19, `treeSingle` 26, `treeDiagonal` 4, `tentLink` 1 | | 3.5 / 9 |
| Tents Normal | 4 | 26 | 8 | `lineNeighbors` 4 | 3/4 | 3.5 / 9 |
| Towers Easy | 4 | 30 | 9 | `fullLine` 7, `populate` 4, `clean` 28, `lowerBound` 10, `facing` 4, `hiddenSingle` 3, `single` 41, `lineFull` 12, `tallestNearest` 9 | | 2.9 / 6 |
| Towers Normal | 4 | 36 | 8 | `arrangement` 18 | 4/4 | 2.6 / 6 |
| Towers Tricky | 4 | 31 | 10 | `wing` 5 | 4/4 | 2.5 / 6 |
| Tracks Easy | 4 | 38 | 5 | `bothSidesLeft` 83, `clueFull` 30, `onlyOneSideLeft` 14, `wouldCloseLoop` 8, `clueExact` 19 | | 3.6 / 22 |
| Tracks Normal | 4 | 42 | 7 | `sharedFate` 11, `looseEndSpans` 2 | 4/4 | 4.0 / 22 |
| Tracks Tricky | 4 | 62 | 9 | `crossingParity` 4, `wouldStrandTrack` 1 | 3/4 | 4.7 / 27 |
| Undead Easy | 4 | 19 | 5 | `populate` 4, `sightline` 31, `single` 31, `total` 4, `onlyCells` 6 | | 2.6 / 9 |
| Undead Normal | 4 | 26 | 5 | none | 0/4 | 2.8 / 7 |
| Unequal Easy | 4 | 11 | 1 | `regionsFull` 44 | | 1.0 / 1 |
| Unequal Normal | 4 | 54 | 7 | `greater` 36, `note` 24, `lesser` 41, `hiddenSingle` 32, `single` 34, `clean` 26 | 4/4 | 1.9 / 5 |
| Unequal Tricky | 4 | 62 | 8 | `set` 14 | 4/4 | 1.6 / 5 |
| Unequal Hard | 4 | 65 | 9 | `wing` 2 | 2/4 | 1.8 / 10 |
| Unruly Easy | 4 | 26 | 2 | `threes` 74, `complete` 28 | | 3.1 / 6 |
| Unruly Normal | 4 | 26 | 2 | none | 0/4 | 3.4 / 6 |
| Unruly Tricky | 4 | 48 | 3 | `nearcomplete` 17 | 4/4 | 4.2 / 8 |

Where "Boards" is below 4/4, the new rung fired on fewer boards than were
dealt at the tier: the hint found another route through the rest, which is
the gap between a hint walk and the grader's route described under "Method".
