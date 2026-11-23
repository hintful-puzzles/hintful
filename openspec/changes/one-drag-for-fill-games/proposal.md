## Why

A born fill game drags in one of two ways, `play.stroke: line` or
`sweep`, and the two differ on two questions at once: whether the left
button drags at all, and whether a drag keeps to one row or column. Games
alike in what a player does get different drags as a result (reviewed
2026-11-23, from the code):

| | Left drag | Right drag | Path |
|---|---|---|---|
| Boats (`line`) | its first square only | water along the line | one row or column |
| Pattern (`sweep`) | every square becomes what the first became | the same | free |
| Tracks (hand-written) | marks squares along the line | the same | one row or column |
| Boats before its flip, upstream's Pattern | what the first became | the same | one row or column |

Boats took Tents' `line` stroke when it was born, which suits Tents (two
tents never touch, so a row of them is never right) and not Boats, whose
boats are runs of squares: the flip lost the left drag the hand-written
game had. Boats also draws the player's water as a plain blue wash (the
`sea` painter), where every other born game draws a ruled-out square with
the engine's cross (`cross`, or `clear` with a surface of its own).

The owner (2026-11-23): games of a kind should share their affordances,
and a change that makes play a little worse is fine when the engine is
simpler for it; significantly worse is not.

## What Changes

- **One drag for every fill game**: either button; every square the drag
  passes that held what the pressed square held becomes what the pressed
  square became. One option, `straight`, keeps the drag to the row or
  column it starts along. `stroke: line | sweep` goes.
- **Which games are straight**: those whose clues are on rows and columns
  (Boats, Pattern, Tents, Kakurasu, and Tracks when it is born); a game of
  regions or areas keeps the free path (Norinori, Star Battle, Clusters,
  Mosaic and the rest). The implementer settles each game by that rule and
  records it.
- **Player-visible, pre-approved as consistency**:
  - Boats' left drag lays a run of boat segments again.
  - Tents' and Kakurasu's left drag places along the line (Tents' a line
    of tents, never right, rarely made by accident).
  - Pattern's drag keeps to one row or column, as upstream's did.
- **Boats' water is drawn with the engine's cross**, as `clear` draws it,
  on a surface of its own; the waves stay on water the puzzle gives.
- Each changed game's help and controls spec follow.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `described-fill-game`: one drag model, with `straight`.
- `boats`: its drag and its water's look.
- `pattern`, `tents`, `kakurasu`: their drags, and any other game whose
  controls requirement names a drag the new model changes.

## Impact

`src/engine/fill/play.ts` (the strokes), `src/engine/input/target-verb.ts`
(the sweep, if `straight` lives there), `src/describe/description.schema.json`
and `compile-fill.ts` (`play.stroke`), `src/engine/render/pieces/fleet.ts`
and `stock.ts` (the water), every born description's `play:`, help pages,
and Tracks' notes for when it is born.
