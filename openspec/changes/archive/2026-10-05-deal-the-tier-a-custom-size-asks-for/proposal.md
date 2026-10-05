# deal-the-tier-a-custom-size-asks-for

Found by `review-preset-counts-across-the-catalog` while filling menus out to
every tier.

## Why

A board's tier is a promise about what it takes to solve, and
`difficulty-contract.test.ts` holds every *preset* to it: the lowest cap its
dealt board solves at is the tier it claims. Nothing held a Custom size to
it, and on some sizes the generator handed back a board below the tier asked
for, under the tier's name.

The scaffold measured five cells in two games, three deals each: Group 6x6 at
Tricky and Hard and 8x8 at Hard, and Unequal's Adjacent 5x5 and 6x6 at Hard.

## What was found

**The cause is upstream's, written three ways.** A table of sizes that deals
the tier below (Group, Keen, Towers, Tracks, Dominosa, Pearl, Solo, and as a
ternary in Singles and Tents); a count of tries after which the tier drops
(Unequal, Map, Boats); and a tier gate that small boards skip (Bridges,
Bricks). The `ts-migration` spec already names the rule they break, "An
unbindable tier is refused, not silently downgraded", and records such games
as deviations to converge.

**Upstream's tables were mostly right, and wrong in both directions.** With
each downgrade removed and the generator run with nothing to stop it:

- **Group.** Of the sixteen cells its table names from 3x3 to 8x8, eleven had
  no board in up to 1,080,000 tries. Two deal at once: a 4x4 and a 5x5 hiding
  the identity, at Tricky. Three are rare, the identity shown: a 6x6 at Tricky
  is found once in 48,000 tries (ten seconds a board, 28 at worst over eight),
  an 8x8 at Hard once in 6,400 (nine seconds, 17 at worst over ten), and a 6x6
  at Hard gave none in 290,000. And a 5x5 at Hard, which the table lacked,
  had none in 840,000, so upstream's generator never ends there.
- **Unequal.** The tier was never absent where it dropped: its rarest cell,
  a 3x3 at Hard, takes 119 tries at the median and 877 at worst over twenty
  deals, a hundredth of a second. A 3x3 at Tricky and at Unreasonable had
  none in 400,000.
- **Singles.** Its rule (under 4 either way is Easy) was too broad: only 2x2,
  2x3, 3x2 and 3x3 had no Normal board in 50,000 tries each, and a 2x4 or a
  3x12 deals one at once.
- **Keen, Towers, Tracks, Dominosa, Tents, Solo.** The table held: none in
  50,000 tries a cell, 250,000 for Solo and a million for Dominosa.
- **Pearl.** The line was dead: `validateParams` already refuses a 5x5 above
  Easy.

**A run of the retry bound cannot tell rare from absent.** A test that ran
Group's generator out once at 6x6 Tricky passed, because a 10,000-try bound
comes back empty four times in five on a tier found once in 48,000. The count
that found it was 380,000.

## What Changes

- **A generator deals the tier asked for or runs out.** The downgrades are
  gone from Group, Unequal, Keen, Towers, Tracks, Dominosa, Singles, Tents,
  Solo and Pearl. Unequal keeps retrying, under the house bound.
- **A size with no board at a tier is refused when a board is to be dealt**,
  in one sentence across games (`noSuchTier` in `engine/difficulty.ts`: "No
  3x3 puzzle is Tricky."), and said in the size field's help. A board that
  arrives with its desc still loads.
- **Group's three rare cells are refused too**, by the owner's decision, in a
  sentence that says rare: "Tricky 6x6 puzzles that show their identity are
  too rare to deal." The spec delta allows that where a retry takes seconds.
- **Boards that upstream's tables hid now deal**: Group 4x4 and 5x5 at Tricky
  with the identity hidden, and Singles boards under 4 one way and 4 or more
  the other, at Normal.
- **Unequal's menu** offers Adjacent 5x5 and 6x6 at Hard again. They were cut
  for coming out a tier low, which was this defect.
- **`describeAbsentTiers`** (`engine/testing/absent-tiers.ts`) pins a game's
  refused cells: refused when dealing, accepted with a desc, and in the slow
  tier the generator run out at each, with the power of that stated.
- **The tier walk** (`scripts/checks/tier-walk.test.ts`): every tiered game,
  every numeric field from its minimum to the menu's largest, every tier, each
  board's lowest solving cap beside the tier asked. A report, not a gate.

## What it does not settle

The walk over every tiered game lists cells this change did not fix, each
measured and filed:

- `settle-the-cells-the-tier-walk-still-lists`: Map, Bridges, Bricks and
  Boats still deal below the tier asked at some sizes, and ten games have
  cells where the generator gives up and throws.
- `load-the-two-wide-bricks-boards-the-app-deals`: the walk found Bricks
  boards two squares wide that their own ID refuses to load.
- `keep-a-board-ready-for-the-next-deal`: the owner's idea for making a slow
  deal cost once, which would reopen Group's three rare cells.

**No shared declaration for an absent tier was built.** The predicate is the
game's and so are the words for its boards (Group's depend on whether the
identity shows), `validateParams(p, full)` is already what the engine
consumes, and the population is found by behavior: the walk reads which cells
are refused only when dealing. What was shared is the sentence and the test.

## Compatibility

A params string that dealt a mislabeled board now refuses to deal. A saved or
shared board carries its desc and still loads, graded by what it needs. A
remembered Custom type that is now refused falls back to the first preset
with the toast the app already shows for a type it cannot restore.

The two Group fixtures recorded at a tier their size lacks (`4d1`, `5d2`) are
dealt in the differential at the tier upstream dealt them at. No other
fixture of the ten games moved.

## Hints to pull in

None.
