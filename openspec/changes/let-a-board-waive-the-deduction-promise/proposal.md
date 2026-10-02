# let-a-board-waive-the-deduction-promise

**Status: scaffolded, not started (2026-10-02).** Found by
`reach-every-declared-mark`, while pinning a board for Rect's last rung.

## Why

When a hint returns `DEDUCTION_EXHAUSTED`, `Midend.computeHintPlan` asks
`permitsSearch` whether the board was ever promised to solve by deduction.
Only a tier named Unreasonable releases that promise. Anywhere else the midend
throws, and the player sees the crash dialog (`e68777a9`).

Some games make the promise with a checkbox instead of a tier. Rect's and
Net's "Ensure unique solution", Mines' "Ensure solubility" and Pearl's
`allow-unsoluble` all deal boards that deduction may not finish when the box
is unticked. Asked for a hint at that point, the app crashes. Reproduced
2026-10-02 on Rect: the midend throws `rect: the hint ran out of deduction at
move 4, but the game has no tier that allows trial and error
(4x4a:b4a2a2a2b2a2_2a)`. Mines, Net and Pearl are suspected from the same code
path and not yet reproduced. The sweep `e68777a9` relied on walked presets
only, and none of these boxes is unticked in any preset.

The refusal's sentence is also wrong for these boards. It says "This board's
difficulty allows positions that need trial and error", but the cause here is
an option, and three of these games have no difficulty at all.

## What Changes

- The board's params can release the deduction promise, through a
  declaration the engine consumes. One option is a field on the `paramConfig`
  item that makes the promise. `permitsSearch` reads that declaration
  alongside the tier.
- A refusal sentence that names the option rather than a difficulty. Its
  wording is player-visible, so it goes to the owner.
- Reproduce Mines, Net and Pearl, and pin a board for each that the walk
  reaches.
- Pin `4x4a:b4a2a2a2b2a2_2a` in `warm-repaint.test.ts`'s `PINNED.rect`, and
  remove Rect's `ring|line` entry from its `UNREACHED`. Rect's line rung fired
  on 3 of 315 deals with uniqueness off, and on none of 6 000 deals with it on.

## Hints to pull in

None.
