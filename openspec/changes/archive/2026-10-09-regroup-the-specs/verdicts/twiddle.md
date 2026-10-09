# Verdicts: twiddle

## cut `twiddle`: Twiddle has no mistake check and no hint

declared: the mistake-check half is `notApplicable.findMistakes` in `src/games/twiddle/index.ts`, a sentence the engine reads and the help page shows (`ts-engine`, "A not-applicable reason is a fact about the puzzle"). The hint half is not a decision but the present state: the same `ts-engine` requirement says a hint is never not applicable, "A game's contract sections are implemented, not applicable, or absent, and an absent one makes it a draft" makes Twiddle a draft for lacking one, and `openspec/changes/hintless-games-in-reserve/proposal.md` names Twiddle among the games still owed a hint. A SHALL NOT here would forbid the work that change holds. The scenario only inspects the game object.

## cut `twiddle`: Twiddle's presets hold one orientable board

collection: `engine-params`, "A checkbox rule modifier has one line of the menu", says it of every game, and Twiddle declares `orientable` with `modifierItem` as a checkbox (`src/games/twiddle/index.ts`) and is in no per-size ledger, so it is covered with no departure. The rule was decided with the owner for the whole catalog (`openspec/changes/archive/2026-10-05-review-preset-counts-across-the-catalog/proposal.md`, "A rule modifier has one line"; its `menus.md` row for Twiddle gives that as the reason). Which board is the orientable one is the `presets` table in `state.ts`.

## keep `twiddle`: Twiddle draws a recessed border and beveled numbered tiles

`engine-drawing`, "A game draws its beveled frame through the recessed-border
helper", covers how the border is drawn, not that Twiddle has one, and the
tile half is the game's own look: the orientation triangle is the only way a
player reads which way up a tile is in orientable mode, and no other
requirement mentions it. A render test shows what is drawn and not that it
was meant.

## edit `twiddle`: A click rotates the block centered on it

`dir +1` is the move's field, and a player sees a direction. The game's own
verb words say which (`targetVerbs` in `src/games/twiddle/index.ts`: the
primary button "rotate it anticlockwise" applies `dir 1`, the secondary
"rotate it clockwise" applies `dir -1`), so the requirement says both.

from: rotate `dir +1` and a right-click `dir −1`.
to: rotate anticlockwise (`dir +1`) and a right-click clockwise (`dir −1`).

## edit `twiddle`: Letter and numpad keys rotate fixed blocks

The same gloss, once, where the requirement first gives a direction; the
click requirement fixes what `dir +1` and `dir −1` look like.

from: The letters `a`, `b`, `c` and `d` SHALL each rotate one corner block `dir +1`,
to: The letters `a`, `b`, `c` and `d` SHALL each rotate one corner block anticlockwise (`dir +1`),

## note `twiddle` has no requirement for its description format

The prune found none to keep and this pass may not add one. The format, from
`parseDesc` and `encodeDesc` in `src/games/twiddle/state.ts`: the tiles'
numbers in row-major order, separated by commas, or, when orientation
matters, each followed by one of `u`, `l`, `d`, `r` for its orientation with
no comma. The numbers are `1..w·h` once each, or with `rowsonly` each of
`1..h` once per column; a number out of range or repeated too often is
refused. A description format is a promise to saved games and shared links,
so a follow-up should add the requirement.

## note `twiddle` "Letter and numpad keys rotate fixed blocks" does not say which corner a letter turns

Only its first scenario says `a` is the top-left block. The code
(`fixedBlockKey`): `a` and numpad 7 top-left, `b` and 9 top-right, `c` and 1
bottom-left, `d` and 3 bottom-right. A follow-up that adds the description
format could complete this in the same pass.
