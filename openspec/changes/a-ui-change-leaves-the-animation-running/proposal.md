## Why

The owner solved an Ascent board entirely by hand and saw no win animation,
though the same game shows it when the last move is a hint's (2026-10-12).

Reproduced the same day in Chrome on `6x7mOde:a42_5_6_11e10c1g22d30_21d31h`,
every square but the last filled by hand, frames taken through the two
seconds after the winning input:

| The last move | The highlight |
| --- | --- |
| a number typed, committed by tapping another square | none; "Solved!" is up at once |
| a tap on a number, then on the empty square beside it | none |
| a number typed, committed by a press that is held down | plays |
| a number typed, then Enter or an arrow key | plays |
| Hint, then Apply the hint | plays |

It is lost exactly where a pointer release follows the press that wins. The
press makes the move, and the midend arms the highlight. The release changes
only Ascent's `Ui`, which is a legitimate answer, and the midend ended every
animation and flash on any input that changed only the `Ui`
(`Midend.uiUpdated`, and the same in `processHover` and `selectReference`).

So the defect is the engine's and every game has it in some measure: a cursor
key or a tap that only moves a highlight, inside the two seconds, cut the win
short anywhere, and in Loopy so would moving the mouse. A probe of a click and
a short drag at about 150 points on each game's default board (2026-10-12)
found a move's animation armed and then cleared within the same gesture in
Ascent (198 of 198 drags that moved), Black Box (135 of 135 clicks, 270 of 270
drags) and Tracks (13 of 139 drags), and in no other game. That is a floor: it
sampled no keys, no right button and no gesture that needs a selection first,
which is how it missed Ascent's own tap.

Upstream's midend does not do this: on a `UI_UPDATE` it redraws and leaves
the animation alone. The clear was ours, and no spec or guide gave a reason
for it.

## What Changes

- An input that changes only the `Ui` no longer ends an animation or a flash
  in flight: `UI_UPDATE` from `interpretMove`, a hover, and a change of
  reference. The next timer frame paints the new `Ui`.
- Everything that changes the position still ends it as before: a move, undo,
  redo, a canceled press, a new or restarted board.
- No game is edited.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `engine-drawing`: a requirement is added for what leaves an animation
  running.

## Impact

- `src/engine/midend.ts`: three calls removed.
- Black Box and Tracks, which the probe above named, change in nothing a
  player sees: Tracks has no `animLength`, and Black Box's is nonzero only for
  a laser fired from the keyboard cursor, so what the probe saw armed and
  cleared there had no length.
- A game's `redraw` can be handed a `Ui` that changed while a move animates.
  Upstream's games are written for that, and it is checked in the app on the
  games that animate a move.
