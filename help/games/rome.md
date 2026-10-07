# Rome

You're given a grid that has been divided into areas, containing arrows and one or more goals (represented by circles). Your goal is to fill every empty space with an arrow pointing up, down, left or right while following these rules:

1. Every outlined area contains different arrows.
2. Following the arrows must lead to one of the circled goals.

## Controls

Click and hold a square, then drag in one of the four directions to place an arrow. Or tap a square to select it and press one of the four arrow buttons below the grid, which is the same thing without the drag; the Clear button empties the selected square.

Right-click and drag to place a pencil mark, or press the Marks button below the grid to make ordinary drags — and the arrow buttons — leave marks until you press it again. A right-click without a drag does the same as the Marks button and selects the square, as it does in the other note-taking puzzles. The selected square is shaded while the buttons enter arrows, and shows a small triangle in its corner while they enter marks. A pencil appears in the top right corner while it is on. A mark records an arrow you think a square could still hold, so Mark all fills every square with the arrows the grid's edges leave open, and pressing it again crosses off the ones each square's own area has already used. Check & Save treats a square whose marks have ruled out its answer as a mistake, in the same way it treats a wrong arrow.

Squares whose arrows already lead to a goal are shaded, so you can see how much of the grid is settled. A second preference shades squares caught in a loop instead, which can never reach a goal; it is off by default. Both are in the game's preferences.

The keyboard can also be used. Move the cursor with the arrow keys, and press Enter followed with an arrow key to place an arrow. Use Space to add pencil marks. A question mark shows in the square while it waits for the arrow key. Alternatively, use the arrows on the numpad to enter arrows directly.

## Where the puzzle comes from

This type was invented by [Nikoli](https://www.nikoli.co.jp/), who name it *Roma*.

More information: http://www.janko.at/Raetsel/Nikoli/Roma.htm

## Hints

**Hint** explains the next step rather than simply making it. It works from your arrows and your pencil marks, so as long as no arrow is wrong and no square's marks have crossed out its answer, it carries on from wherever you are; otherwise it asks you to fix the highlighted mistakes first. A square with no marks counts as holding every arrow its area hasn't used yet that doesn't point off the board, and the hint pencils marks in only when a step needs them. If you would rather it start from a fully marked grid, set **Hints pencil in** to **Every candidate first** in the preferences: it then begins by pressing Mark all twice, just as you would.

{{hint-marks}}

A few ideas are worth learning by name:

* **One of each.** Once an area has an arrow, no other square in it can point that way. An area of four squares must hold all four arrows, so an arrow with only one square left to go in goes there.
* **No loops.** An arrow pointing at a square whose arrows lead back here would go round in a circle and never reach a goal, so it is ruled out. The shortest loop is two neighbors pointing at each other. If the square to the left, in the same area, can only point left or right, this square can't point left into it: the area can't hold two left arrows, so that square would have to point right, straight back.
* **A pair.** Two squares of an area that must take the same two arrows between them leave those arrows to no other square of the area.

## Rome parameters

{{parameters}}

