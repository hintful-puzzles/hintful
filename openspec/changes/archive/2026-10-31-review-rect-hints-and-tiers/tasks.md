# Tasks

- [x] 1.1 Walk the hint on dealt Patches and Rectangles boards at each menu size, and collect every rung's sentences; measure each rung's share at each tier
- [x] 1.2 Bring the owner the reworded sentences and the proposed tiers (which rungs each allows), with those numbers
- [x] 1.3 The owner's answer recorded, and the rest of this list written from it. Answered 2026-10-31: `Easy · Normal · Unreasonable` as `design.md` § "Proposed tiers" has them; a plain clue is "the ? clue"; the mechanical measure is filed as an engine change of its own

## 2. Tiers

- [x] 2.1 `rungsFinish` takes the tier whose rungs it may use (`TIER_RUNGS`): Easy's end at `overlap`, Normal's at `line`
- [x] 2.2 Rectangles' tiers are `searchTiers(2)`, and the contract grades Easy and Normal by the capped rungs; the tier item's doc says what each tier asks
- [x] 2.3 Each tier is stripped from the one below and kept where the tier below no longer finishes it; a Rectangles Normal board is drawn until it needs starve or line
- [x] 2.4 The hint's rungs are a technique a tier, so a plan takes no Normal step while an Easy one fires
- [x] 2.5 The menu: a ruleset's tiers are its own (`skips`, the menu guard's run judged within a ruleset, the owner's word in `design.md`); Rectangles at Easy and Unreasonable, Patches 7×7 at every tier, 6×8 Easy and Normal, 9×12 Normal; Group's 8×8 gains Unreasonable
- [x] 2.6 The spec deltas, `rect` and `engine-params`; pinned boards re-checked for the tier they now open as; the C differential deals each recorded board at the tier it needs
- [x] 2.7 Tier tests: dealt Patches boards at every tier, the Easy plan's rungs, both menu sections; each new guard seen to fail on a planted defect

## 3. Sentences

- [x] 3.1 A plain clue is "the ? clue"; `line`'s two reasons, the `fit` leave-out, `overlap` and `starve` reworded; a second clue that reads like the first is "the other"
- [x] 3.2 Hint tests and snapshots updated to the words; length checked against the limit

## 4. The measure

- [x] 4.1 Filed as `measure-hint-depth`

## 5. Finish

- [x] 5.1 Run the app at 390×844: the menu's two sections; a 7×7 Patches Normal board hinted to the end, a starve step among its sentences; a 9×12 Patches Normal board's line step, "Only the outlined ? clue can cross this edge, and it would miss the outlined square only it reaches, so the edge is a line."
- [x] 5.2 The help page says which ideas each tier needs, and the tier item says the three tiers
- [x] 5.3 Gate, commit, push
- [x] 5.4 The owner's acceptance in the running app ("Accepted", 2026-10-31), then archive
