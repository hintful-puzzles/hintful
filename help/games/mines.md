# Mines

Try to expose every square in the grid that is not one of the hidden
mines, without opening any square that is a mine.

The first square you open is guaranteed to be safe, and (by default)
you are guaranteed to be able to solve the whole grid by deduction
rather than guesswork. (Deductions may require you to think about
the total number of mines.)

If you think you've found a grid which can't be solved without
guessing, **think harder!** Mines was written in 2005, and since it
was written, I've had over 50 reports claiming that a grid had two
solutions, or required guessing at a safe square to
open. *None* of those reports turned out to be a real bug in
the game generation.

## Controls

{{controls}}

Every opened square is marked with the number of mines in the
surrounding 8 squares, if there are any; if not, all the surrounding
squares are automatically opened.

## Mines parameters

{{parameters}}
