# keep-the-bar-still-on-save

Owner, 2026-10-09: *"clicking on the Check&Save button on mobile (maybe also on
desktop) moves the Hint button slightly - can you please ensure that it stays
in place?"*

## Why

Measured 2026-10-09 in Chrome, on Towers at 390 CSS px wide. A slot on the Bar
is as wide as its caption, and the hint's slot takes the room its neighbors
leave. For the moment Check & save reads "Saved", its slot went from 75.8 px to
44 px and moved 31.8 px, and the hint's slot grew from 93.3 px to 125.1 px, so
the hint's icon and caption moved 16 px and back. A player pressing Hint just
after a save meets a button that is moving.

## What Changes

- **While the control reads "Saved", it keeps the room of "Check & save".** The
  caption it replaces is laid out unseen under it, so the slot is the same
  width and height and no other slot moves. A command entry names the caption
  it stands in for (`CommandEntry.standsInFor`), and the Bar reads that.
- This holds at every window size and where the Bar runs down a side.

Nothing a player has saved or shared changes.

## Capabilities

### Modified Capabilities

- `quick-save`: the save's confirmation keeps the control's size.

## Acceptance

The owner's, who asked for it by name.
