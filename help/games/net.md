# Net

Rotate the grid squares so that they all join up into a single
connected network with no loops.

Squares connected to the middle square are lit up. Aim to light up
every square in the grid (not just the endpoint blobs).

When this gets too easy, try the setting that changes the rules. A
board's name in the Type menu says when it is on:

{{modifiers}}

## Controls

{{controls}}

To move which square the network is lit from, press the **Source** key
on the keypad and then tap the square, or press Ctrl and an arrow key.
On a wrapping grid, drag in the margin around the grid, or press Shift
and an arrow key, to scroll the whole grid. The **Jumble** key, or J,
jumbles every unlocked square to a random rotation.

## Notes

You will often know what crosses the side between two squares before you
know which way either of them turns: a corner piece on the edge of the grid
points inward whichever way it turns, and two dead ends can never face each
other. **Notes** lets you write that down. Press the **Marks** key on the
keypad, or **P**, to turn notes mode on, the same way as in every other
puzzle that takes notes; a small pencil shows at the top right of the board
while it is on, and pressing it again turns it off.

In notes mode, click near the side two squares share to note that **a wire
crosses it** (a short pencil stub across the side), or right-click (on a
touch screen, a long press) to note that **no wire does** (a pencil ×).
Doing the same again takes the note off. Click the middle of a square
instead to **lock** it, or to unlock it again; outside notes mode, S does
the same at the cursor. Either can be dragged: keep the button down and
the sides, or the middles, you pass over get the same. From the keyboard, press **Enter**
or **Space** on one square, move to the square beside it, and press
**Enter** to note a wire between them or **Space** to note none; **Escape**
lets go of the first square. A side with a wall on it needs no note.

A note or a lock that turns out to be wrong shows in red when you check the
board.

## Hints

**Hint** explains the next step rather than simply making it. It reasons
only from your locks, your notes and the walls: a square you have turned
but not locked counts as unknown, however it is turned. So lock a square
once you are sure of it, and the hint carries on from there. If a lock or a
note is wrong, it asks you to fix the highlighted mistakes first.

Each step either **notes a side** or **turns a square and locks it**. The
hint calls a square with one wire a **dead end**, two in a line a
**straight**, two at a right angle a **corner**, and three a **T**; a
**note** is one of your side notes, and a **lock** a locked square.

{{hint-marks}}

The ideas it teaches:

* **Fit the sides you know.** A square can only turn to ways that carry a
  wire across every side noted as crossed, none across a wall or a side
  noted as empty, and match each locked square beside it. When only one way
  is left, lock it; when every way left agrees about a side, note it.
* **No loops.** A way of turning that would join two squares the known wires
  already join would close a loop.
* **Nothing sealed off.** A way of turning that would close a group of
  squares off, with no wire left to lead anywhere else, cannot be right
  unless the group is the whole grid: two dead ends facing each other are
  the smallest case. The wire need not be drawn yet. A way of turning
  that leads only into squares where the wire must stop, however they turn
  without closing a loop, seals them off just the same.

When a square has to turn before it can be locked, the hint turns it and
then locks it, as one step.

## Net parameters

{{parameters}}
