# place-beside-a-lone-number

## Why

Owner playtest, 2026-09-27: on a Hexagon Hard board, selecting the clue 26 and
clicking an empty square beside it placed nothing. Neither 25 nor 27 was on the
board, and upstream's `ui_seek` then chose no direction, so it offered the
selected number itself: every square beside a number with neither neighbor
placed refused the click. The owner's bar: whatever square you are on, you can
always place a number next to it.

## What changes

- A selected number with neither neighbor placed offers the next number. A
  right-click on the empty square beside it already cycles the one before and
  the one after (`candidatesFor`), so both stay reachable.
- A drag starting from such a number now places numbers along the drag, the
  game's main gesture, where it used to draw path lines; lines are still drawn
  starting from an empty square. The help says both.
