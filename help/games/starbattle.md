# Star Battle

You have a square grid divided into regions by heavy lines. Place stars so that every row, every column and every region holds the same number of them, and no two stars touch, not even at a corner.

Every puzzle has exactly one solution, and none needs a guess.

## Controls

{{controls}}

A cross is your own note that a square holds no star. You need not cross anything out to finish: the puzzle is solved as soon as the stars are all in place. A star turns red when it touches another, or when its row, column or region holds too many.

## Where the puzzle comes from

Star Battle was invented by Hans Eendebak for the 2003 World Puzzle Championship. With one star to each row, column and region it is also known as *Queens*, and with two as *Two Not Touch*.

## Hints

**Hint** explains the next step rather than simply making it. Each step decides one or more squares from the regions and from the stars and crosses you have already placed, so it carries on from wherever you are.

{{hint-marks}}

A hint calls a square *open* while it holds neither a star nor a cross, so its first steps are often the crosses a star you placed gives: the squares touching it, and the rest of a row, column or region that has all its stars.

The steps after those, easiest first:

- A row, column or region with exactly as many open squares as it still needs stars has a star in each. One that would not have room for its stars without a certain square has a star there. Stars cannot touch, so two open squares that touch, even at a corner, have room for only one.
- A region whose open squares all lie in one row or column must put its stars there, so when that row or column needs no more than those, its other squares are empty. The same holds the other way round, for a row or column whose open squares all lie in one region.
- A star that would touch so many open squares of a row, column or region that too few are left for the stars it needs cannot be there.
- On Normal boards, several rows or columns side by side are counted together: when the regions lying wholly inside them need as many stars as those rows do, the rows' other squares are empty, and when the regions reaching into them need no more than the rows do, those regions' squares outside the rows are empty.
- On Tricky boards, a star is tried in a square where it would complete its own row, column or region. If the squares that rules out leave another row, column or region without room for its stars, the square is empty.

If a square you marked is wrong, the hint asks you to fix the highlighted mistakes first.

## Star Battle parameters

{{parameters}}
