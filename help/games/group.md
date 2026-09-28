# Group

Fill in the grid with the letters shown to the top and left of it, so
that the full grid is a valid
[Cayley table](http://en.wikipedia.org/wiki/Cayley_table)
for a
[group](http://en.wikipedia.org/wiki/Group_(mathematics)).

If you don't already know what a group is, I don't really recommend
trying to play this game. But if you want to try anyway, the above is
equivalent to saying that the following conditions must be satisfied:

- **Latin square**. Every row and column must contain
  exactly one of each letter.
- **Identity**. There must be some letter *e* such
  that, for all *a*, the letter in row *e* column *a* and
  the one in row *a* column *e* are both *a*. In the
  default mode, this letter is always *e* and its row and column
  are filled in for you; by reconfiguring the game using the Type menu,
  you can select a mode in which you have to work out which letter is
  the identity.
- **Inverses**. For every letter *a*, there must be
  some letter *b* (which may sometimes be the same letter
  as *a*) such that the letters in row *a* column *b* and
  in row *b* column *a* are both the identity letter (as
  defined above).
- **Associativity**. For every combination of
  letters *a*, *b*, and *c*, denote the letter in
  row *a* column *b* by *d*, and the one in row *b*
  column *c* by *e*. Then the letters in row *d*
  column *c* and in row *a* column *e* must be the same.

## Controls

To place a letter, click in a square to select it, then type the
letter on the keyboard. To erase a letter, click to select a square
and then press Backspace.

Right-click in a square and then type a letter to add or remove the
number as a pencil mark, indicating letters that you think
*might* go in that square.

You can rearrange the order of elements in the rows and columns by
dragging the column or row headings back and forth. (The rows and
columns will stay in sync with each other.) Also,
left-clicking *between* two row or column headings will add or
remove a thick line between those two rows and the corresponding pair
of columns (which is useful if you're considering a subgroup and its
cosets).

You can also use the arrow keys to move the selected square around.
Press Enter to toggle between entering letters and entering pencil
marks, and Backspace or Space to clear a square. Press Shift+M to fill
every empty square with all possible pencil marks (a lowercase 'm' is a
letter like any other, on grids large enough to use it).

## Hints

**Hint** explains the next step rather than simply making it. It works
from your own letters and pencil marks, so it carries on from wherever
you are; if a letter you've placed is wrong, or a cell's pencil marks
have crossed out its answer, it asks you to fix the highlighted
mistakes first. It pencils in only as it needs to: a cell
with no marks counts as holding every element its row and column don't
already hold, and the hint writes a cell's marks only when its next
step crosses one out or reasons from them. If you would rather it
filled in every cell's marks first (the same as pressing 'M'), set
**Hints pencil in** to **Every candidate first** in the preferences.

* **A ringed cell** is the one the step is about: the letter to enter
  there, or the pencil marks to cross out, which are shown with a line
  through them.
* **Outlined cells** are the ones the reason rests on: the three
  products an associativity step reads, the cell that gives away (or
  rules out) the identity, or a group of cells that between them already
  account for the letters being crossed out.
* **A striped row or column** is the line the sentence calls "this row"
  or "this column".
* **Numbered cells** are a chain of cells with two elements left each,
  read in order: the sentence says how the chain rules a letter out of
  the ringed cell.

The hint writes products the way the grid shows them: *a·b* is the
letter in row *a*, column *b*. The step that belongs to Group alone is
associativity: once the
grid shows *a·b*, *b·c* and one of (*a·b*)·*c* and *a*·(*b·c*), the
other must be the same letter. When you have to find the identity
yourself, a product like *a·b* = *a* shows that *b* is the identity,
and a product that changes a letter rules its partner out as the
identity; the hint then crosses out that element's *identity marks*,
the pencil mark in each cell of its row and column that would have
made it the identity there.

Rearranging the rows and columns doesn't disturb a hint: its marks
follow the elements to wherever you've dragged them. On an Unreasonable
board, deduction can run out before the grid is full; the hint says so
rather than guessing.

## Group parameters

These parameters are available from the ‘Custom type…’ option on the ‘Type’ menu.

<dl>
	<dt>Grid size</dt>
	<dd>How many elements the group has, which is also the width and height of the grid: from 3 to 26.</dd>
	<dt>Difficulty</dt>
	<dd>Determine the difficulty of the generated puzzle (<a href="../features#difficulty">what the names mean</a>).</dd>
	<dt>Show identity</dt>
	<dd>When enabled, the identity is always <em>e</em>, and its row and column are filled in for you. When disabled, you have to work out which letter is the identity. Easy puzzles and 3×3 grids must show it.</dd>
</dl>
