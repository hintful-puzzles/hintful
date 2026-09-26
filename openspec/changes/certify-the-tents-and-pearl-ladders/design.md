# certify-the-tents-and-pearl-ladders — design

## Pearl was never a hatch candidate

The proposal left open whether Pearl's Tricky pass is restart-equivalent. It
is, and reading the loop to the end settles it. The `if (doneSomething)
continue;` inside the Easy-only branch is dead code: the clue stage directly
before it ends with its own `continue` at loop level, so the shortcut stage is
reached only when nothing has fired. The first two stages do share a pass, but
the first leaves nothing for itself to find straight after, which is ABCD's
case. The harness confirms it: same verdict and same workspace on every board
at both caps. So Pearl gets no row in the hatch table.

## The rung boundaries

Tents follows upstream's sweeps with two exceptions. Upstream runs the tree
diagonal-pair elimination inside its tree sweep, and the neighboring-line
reading inside its line count, each behind `diff >= DIFF_TRICKY`. Each is now
a Tricky rung of its own, placed where upstream ran it (`tree-diagonal-pair`
after `tree-single`, `line-neighbors` after `line-count`). `line-neighbors`
writes only the neighboring lines, so what the line itself agrees on is always
counted against `line-count`. As one mixed rung, a census could not tell
whether the Tricky half is ever reached. The tent↔tree link sits at tier
`DIFF_EASY - 1`, because the generator's "not solvable one level down" check
for an Easy board caps there.

Pearl's rungs are upstream's stages. The first two are separate rungs
(`shapes-from-edges`, `edges-from-shapes`). Loop detection is a rung,
`closed-loop`, that fires once when a loop has closed and then stops the
ladder through `settled`. `shortcut-loop` rebuilds the loop pieces itself
rather than reading the previous rung's, so neither rung depends on having run
immediately after the other.

Each game keeps upstream's loop as the oracle (`tentsSolveLegacy`,
`pearlWorkspaceLegacy`). Both frozen differentials pass unedited.

## What the plants showed

Measured 2026-09-26, load average around 4 to 10.

Every rung silenced, and every Tricky rung declared at Easy, turns something
red. One result stands apart. **Silencing `tree-diagonal-pair` was caught by
the census alone**: all 24 Tents board comparisons and the whole frozen
differential stayed green. The rung fires on most Tricky boards (18, 34 and 38
of 40 at 8x8, 10x10 and 15x15). Solving with it silenced still finishes all
but 6 of 300 Tricky boards (1, 0 and 5 of 100 per size). `line-neighbors` is
the opposite: without it, 265 of those 300 boards do not finish.

The Pearl census over 20 boards per preset (6x6 and 8x8, both tiers):
`shapes-from-edges` and `edges-from-shapes` fire on every board, in near-equal
numbers, because each feeds the other. `pearl-clues` fires on every board.
`closed-loop` fires exactly once per board. `shortcut-loop` fires on every
Tricky board.

## What this tells the two hint changes

- **Tents.** `tent-link` writes only links, and nothing the player can see
  changes when it fires. That is the link question `add-tents-hint` has to
  answer, and it is the first rung on the ladder. The line count is two rungs
  (`line-count`, `line-neighbors`), so the "one journey per line" narration
  applies to both. `tree-diagonal-pair` is a narration choice rather than a
  necessity on nearly every board.
- **Pearl.** `shapes-from-edges` writes only shape sets. On its own it is
  bookkeeping, readable off the square's four edges. `pearl-clues` and
  `shortcut-loop` also strike shapes directly, and those strikes are what the
  shape-set question (rule 6) is about. `closed-loop` is a terminal and has
  nothing to narrate beyond "the loop is closed".
