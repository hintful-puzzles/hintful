# Sokoban

Push each barrel (brown circle) into a target (gray circle). Barrels can
be pushed up, down, left or right, but not into another barrel or the wall.

## Controls

Tap or click any square you can reach to walk there, the shortest
way round. Walking never pushes a barrel.

To push, drag a barrel the way you want it to go, and you walk round
behind it first; or press on your character and drag toward a barrel
beside you. An arrow, and a ghost barrel on the square it ends on,
show where the barrel will stop: one square
further for each square you drag, as far as it can go before a wall
or another barrel. A barrel you can't get behind shows no arrow. Let
go to push. Drag back to where you started before letting go to
change your mind.

With a keyboard, use the arrow keys or the numeric keypad. Each press
takes one step, and walking into a barrel pushes it. The digit keys
work like the numeric keypad even without one: 8 is up, 2 down, 4
left and 6 right, and 7, 9, 1 and 3 step diagonally. A diagonal step
only walks, and only past a corner with room to go round it.

## Hints

**Hint** shows the next push rather than making it. No push in Sokoban
is forced by logic, so the hint searches for a line of pushes that gets
every barrel onto a target and shows you one push from it: the barrel
rings, and so does the square it goes into. Played by the hint, the
push walks you round to the barrel first.

{{hint-marks}}

You can never pull a barrel, so the pushes to watch for are the ones you
can't take back. A barrel pushed into a **corner** can never come out. A
barrel pushed against a wall can only slide along it, and if no target
lies that way it can never reach one. Two barrels side by side against a
wall, or four in a square, can never move again. Any of these off a
target means the puzzle can no longer be finished.

So the first thing the hint looks for is another way to push the same
barrel that would leave it, or a barrel beside it, stuck like that. It
stripes that push and shows one that keeps the barrel free.

Otherwise, when the search has checked the barrel's other pushes, the
hint says what it found: it draws an arrow on each way the barrel can
still be pushed and finish, the suggested one among them, and says when
no other way can. When nothing it checked is worth saying, it says
what the push does that you can see: that it puts the barrel on a
target, or that it lets you out when barrels have shut you into a
small part of the board.

The hint refuses when there is nothing to search for: if a barrel off
its target is already stuck, it outlines that barrel and asks you to
undo, and it asks the same when the search proves no line of pushes from
here can finish. A position can also be too tangled for the search to
settle, and the hint says so; *Show solution…* then shows the finished
board, from the board as it was dealt if not from yours. Every board is
dealt so that the hint can see it through from the start.

**Check & save** asks the same question, since Sokoban has no single
answer to check your pushes against: it won't save a position the hint
would ask you to undo from, and outlines the stuck barrel.

## Sokoban parameters

{{parameters}}
