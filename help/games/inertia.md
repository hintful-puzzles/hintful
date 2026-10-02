# Inertia

Slide the ball around the grid picking up the gems. Every time the
ball moves, it will keep sliding until it either hits a wall, or
stops on a stop square (the broken circles). Try to collect every
gem without running into any of the mines.

If you hit a mine and explode, you can Undo and continue playing; the
game will track how many times you died.

## Controls

Use the numeric keypad to slide the ball horizontally, vertically or
diagonally. Alternatively, click on the grid to make the ball move
towards where you clicked.

You can also press on the ball itself and drag out the way you want it
to go: an arrow on the ball shows the direction, and letting go sends
it. Let go on the ball to call the slide off. This works with a finger
as well.

The arrow keys slide the ball horizontally and vertically, and the
digit keys work like the numeric keypad even without one: 8 is up, 9
up and right, 6 right, and so on round. After *Show solution…*, Enter
or Space makes the next move of the solution.

## Hints

**Hint** shows the next slide rather than simply making it. Nothing in
Inertia is forced by logic, so the hint goes for the gem the fewest
slides away that the ball can take without leaving any other gem out of
reach, and tells you what each slide does on the way.

{{hint-marks}}

The thing the hint keeps reminding you of is the rule that catches
everyone out: **you don't choose where you stop.** A slide that collects
says what brings the ball to a halt — a wall, or a stop square. When a
slide could grab the outlined gem but would leave the ball somewhere it
can never reach other gems from, the hint says so and goes another way.
When the ball has only one way to go, because walls block the rest or
every other way runs onto a mine, it says that too.

Using the hint is not the same as using *Show solution…*: only the
solution marks the game as auto-solved.

The hint refuses when there is nothing it can do from here: if the ball
is dead, or has already left a gem where it can never be reached, it
asks you to undo back to a position where it can, and circles the gems
it can no longer reach.

**Check & save** asks the hint the same thing, and won't save a position
it would ask you to undo from.

## Inertia parameters

{{parameters}}
