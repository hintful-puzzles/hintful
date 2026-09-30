# declare-drag-games-click-half — design

Started 2026-09-30 at `6fd21bb9`. Every figure is history the moment it is
written.

## The falsifier: nought of nine

The proposal would have stopped if more than about a third of the nine needed
the one-cell release to do something no verb function could express. None did.
In every game the question "which verb does this release apply?" was already
settled before the release reached the transform, by what the press recorded:

- **Tents, Clusters, Sticks, Boats, Bricks, Pattern**: the pressing button.
  Tents already kept it (`dragButton`); Clusters and Boats gained the field,
  because their release had read only the fill the press chose, not the button.
- **Tracks**: where the press landed (`clickx`/`clicky`), which is the geometry's
  `pointerTarget` on the press point.
- **Galaxies**: whether the press traveled, which its `pressPending` test
  decides before the release asks for a verb.
- **Spokes**: a press outside a hub's dead zone already aims at a neighbor, so
  every release — dragged or not — is the verb on the dot it aims at. It needed
  no one-cell case at all.

So the drag games keep their press, drag and release arms, and the release of
a drag that never left its target calls the declared verb, as Mines' release
calls `openAt`. The model grew no release hook, as `sweep-target-verb-input`
predicted.

## One transform per click, not two

Where a drag preview shows what the release will do, the preview and the verb
read one function: Tents' `clickTent`/`clickGrass`, Boats' `clickFill`, Bricks'
`cycleColor`, Pattern's `clickBlack`/`clickWhite`, Sticks' `cycleLine`,
Spokes' `aimedSpoke`. Before, each game wrote the click's transform once for the
pointer and again for Enter/Space, and a preview could show a square the
release would not make.

## Keys the model now spells

`letterKey`, `digitKey` and `ERASE_KEYS` in `target-verb.ts`. Net, Light Up and
Tents each wrote "a letter in both cases" by hand; Slant, Loopy, Subsets and
Unruly wrote Backspace and Delete two different ways; and three drag games want
"1, or 0 or 2". The digit case is the one a game *cannot* write for itself:
`decimal.test.ts` refuses a game source spelling a digit's code, so one fork
left Clusters' and Sticks' digits as an undeclared arm to stay legal while
another wrote `0x30 + d` into Bricks, which the scan would have refused at the
gate. `digitKey` settles both: the digits are verbs, the Controls paragraph
names them, and the guard holds them to their `cycle` route.

## Behavior that changes for players

All nine:

- A click parks the hidden cursor on what it clicked, so the keyboard carries on
  from there (Galaxies parks on the release, since its press is not yet known
  to be a click).
- The first Enter or Space (or verb key) on a hidden cursor only shows it.
- An arrow against the edge of the grid no longer repaints.

And per game:

- **Tents:** T, N and B on a square already in that state do nothing, rather
  than recording a move that changes nothing.
- **Boats:** Enter on a boat segment turns it to water, as a click does (it used
  to empty the square).
- **Bricks:** a press on a bound cell outside the hexagon does nothing; a click
  now moves the cursor at all.
- **Clusters, Sticks, Bricks:** the digit keys are named in the help.
- **Sticks:** the thin strip of border above and left of the grid no longer
  counts as row or column 0 (upstream's truncating division did).
- **Pattern:** Enter on a fixed square no longer records an empty move.
- **Spokes:** Enter on a hub's center does nothing (it repainted).
- **Help:** each of the nine pages carries the generated Controls paragraph,
  and Boats' and Bricks' now describe their drag and Ctrl/Shift strokes, which
  the old pages never mentioned.
