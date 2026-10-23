# Path

You have a grid of squares, some of which hold a number. Draw lines running
from square to square through the middles of the squares, never diagonally.
Lines may not cross or branch, so every square without a number takes two
lines, one in and one out. Some boards have walls between squares, drawn as
thick bars, which no line crosses. Every square must be used. What the
numbers ask depends on the game mode, and the Type menu has a section for
each:

{{rulesets}}

The puzzle is solved when every square has its lines and they join the
numbers as the mode asks. Every puzzle has exactly one solution, and none
needs a guess.

## Controls

Drag from square to square to draw a line along the edges you pass. A drag
only adds: passing back over a square it has already drawn through does
nothing, and it carries on once you return to where it reached, so a long
line can be drawn in one stroke. Undo takes a stroke back. A drag along a line you
have drawn and on past its end carries that line on, and a drag that runs
only along lines you have drawn takes them up. A line stops where it would give a square more
lines than it takes, where you have crossed the edge out, or at a wall. You
can also click near the edge between two squares to draw or remove a line
there.

Right-click an edge to cross it out, to mark that you are sure no line goes
there, and keep the button down and drag to cross out every edge you pass.
Right-click it again to clear the cross. A wall cannot be crossed out or
cleared. You never need to cross anything out to finish.

The keyboard can also be used. The arrow keys move a cursor. Press Enter to
start a line, move the cursor along the way you want it (moving back along
it takes a step back), and press Enter again to draw it; Space, Escape,
Backspace or Delete abandons it instead.
Holding Ctrl while pressing an arrow key draws or removes the line in that
direction and moves along it, holding Ctrl and Shift together does the same
without moving, and holding Shift alone crosses out or clears the edge in
that direction.

In {{choice:ruleset:0}}, each pair of numbers has a color, ringing both its
numbers, and a line takes that color once it reaches one of them. Colors
repeat on a board with more pairs than colors, and the numbers tell those
pairs apart. A pair's two discs fill with its color once a line joins them.

In {{choice:ruleset:1}}, the color runs along the line from the 1 to the
highest number: each stretch of line between two numbers takes a color of its
own, in order round the color wheel, and each number is ringed in the color
of the stretch that leaves it, the highest in that of the stretch that
reaches it. A number's disc fills once the line reaches
the numbers either side of it.

In both, a line that reaches no number yet has no color. A line turns red
when it breaks the rules already: when it closes into a loop, or joins two
numbers that may not meet. In {{choice:ruleset:0}} that is two different
numbers, and in {{choice:ruleset:1}} two that are not one apart, such as a
line from the 3 that reaches the 5 before the 4.

## Where the puzzles come from

{{choice:ruleset:0}} is Nikoli's *Numberlink*, also published as *Arukone*,
and played by many as *Flow Free*. Simon Tatham wrote a generator for it but
never a game; this one fills every square, as Flow Free does.
{{choice:ruleset:1}} is LinkedIn's daily puzzle of the same name.

## Hints

**Hint** explains the next step rather than simply making it. It reasons only
from the numbers, the walls and the lines and crosses you have drawn, so it
carries on from wherever you are, as long as none of those is wrong; if one
is, it asks you to fix the highlighted mistakes first.

{{hint-marks}}

An edge beside a square that already has all its lines can never take
another, and neither can an edge whose line would join two numbers that may
not meet, whether the numbers sit beside it or lines lead to them from it.
In {{choice:ruleset:1}}, neither can an edge whose line would close a loop.
The hint counts all of these as closed without asking you to cross them out,
and most steps are then one rule at work: a square with only as many open
edges left as it still needs lines takes a line on each of them.

On Normal boards a step sometimes has to look ahead. It supposes a line on an
edge, or a cross, and follows that rule from it, numbering each square's
edges as it settles them, until a square is left a dead end or cut off, gets
too many lines, a loop closes, or two numbers that may not meet are joined.
Then the edge must be the other way. On a Normal board that takes at most
six numbered steps; on a Tricky board it can take up to twelve.

## Path parameters

{{parameters}}
