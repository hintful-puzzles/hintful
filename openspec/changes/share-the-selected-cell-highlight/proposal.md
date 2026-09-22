# share-the-selected-cell-highlight

**Status: in progress** — the picture is shared across the eleven; Rome and
Map are next (`tasks.md`). Owner-requested, 2026-09-21: the selected
cell should look and behave the same everywhere — full cell in ordinary mode, a
top-left triangle in notes mode, right-click to toggle — and that should be
engine functionality rather than something each game re-draws.

## What is already shared, and what is not

**The pointer half is engine-owned and has been since
`unify-the-note-taking-cell`.** `engine/note-taking-cell.ts` carries
`pressNoteTakingCell`, which moves the highlight to the pressed cell, shows it
only where the current mode could write, handles the repeat-press put-away, and
**already makes the right button toggle notes** — the sticky toggle when the
game offers the preference, upstream's per-cell pencil select otherwise.
Eleven games are on it, derived by reference rather than declared: abcd,
crossing, group, keen, mathrax, salad, seismic, solo, towers, undead, unequal.

**The render half is not shared at all**, and `docs/games/engine-catalog.md`
says so in as many words: that entry is titled *"the pointer half"*. So each
game hand-draws the same picture. Read side by side (2026-09-21), Solo, Keen
and Undead contain the identical geometry — a full-cell rect in `COL_HIGHLIGHT`
when the highlight is on and notes mode is off, and otherwise a three-point
polygon from the cell's top-left corner with legs of **half a tile**:

```
[ {cx, cy}, {cx + ts/2, cy}, {cx, cy + ts/2} ]
```

Fifteen games' `render.ts` files reference both `COL_HIGHLIGHT` and
`pencilMode`. That is the shape `AGENTS.md` names: *N games sharing a defect
means the layer below them is wrong* — and here they do not even share a
defect, they share a drawing, which is the cheaper version of the same
argument.

## The circle in Map — is there a good reason?

**Partly, and not for this job.** It is upstream's dual-purpose sprite, and the
two purposes are not equally good:

- **While dragging** it is the floating color you are *carrying*, radius `ts/2`,
  and it has to cross cell boundaries mid-gesture — which is exactly the case
  `docs/games/rendering.md` § "A cursor is usually a cache key, not a blitter"
  says a real blitter is for. That half earns its keep.
- **As the selection** it is the same sprite at radius `ts/4`, filled with the
  color of the region under it. On a **blank** region that fill is the board
  background, so it degenerates to an empty ring marking a *point* — it says
  where you tapped, not which region is selected.

So it is not meaningless, but it is the wrong instrument, and
`give-map-element-keys` made that worse by giving every key press something to
act on: the ring is now the only thing saying where a color will land. That
change moved it to the centroid of the triangle it names on a divided cell,
which is a patch on the right problem with the wrong tool.

## What makes this a change rather than a chore

Three things, and the third is the one that decides the shape:

1. **Map's selection is a *region*, not a cell.** A region is an arbitrary
   polyomino of half-cell triangles. A cell-shaped highlight mechanic has
   nothing to say about it — the same wall `add-map-hint` hits with
   `hint-mark.ts`. Either the shared renderer takes a *shape the game supplies*
   rather than a cell, or Map gets the mechanic's **behavior** with its own
   drawing, and the change has to say which and why.
2. **Map's right button is already a gesture.** A right-drag from a color onto
   a blank region toggles a pencil bit — a real, documented input, not a spare
   button. This is the owner's own "unless it's genuinely intentionally used
   for something else" caveat, and Map is the case that proves it exists.
   **The exemption must be derived, not rostered**: `AGENTS.md` is explicit
   that an exemption list rots exactly as quietly as the membership list it
   replaces, and the repo already derives "does this game consume the secondary
   button" for `ignoresSecondaryButton`.
3. **Solo and the other ten already behave correctly**, so for them this is a
   pure de-duplication with no player-visible change — which is the part that
   must be *proved* rather than assumed. A shared renderer that shifts a
   highlight by a pixel in eleven games is a regression in eleven games.

## What this is not

Not a re-litigation of the mechanic. `pressNoteTakingCell`'s rules were argued
once and are guarded; this change moves the picture to where the behavior
already lives, and extends the pair to games that have neither.
