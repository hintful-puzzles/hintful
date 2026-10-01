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

## Hints

**Hint** explains the next step rather than simply making it. Each step flags squares that must be mines, opens squares that must be safe, or takes a flag off a square the numbers prove safe. The hint reasons only from the numbers you have opened, never from your flags, since a flag is your guess until the numbers prove a mine under it: a mine it mentions is one the numbers prove, and flagged by an earlier step if you had not flagged it already. An *unopened* square, in its words, is one that is neither opened nor proved.

{{hint-marks}}

A few ideas are worth learning by name:

* **A number that is full** already touches all its mines, so its other unopened squares are safe; **a number with just enough room** has exactly as many unopened squares as mines still to place, so they are all mines.
* **Two numbers that share squares.** If one needs more mines than the shared squares can give it, because the other number allows only so many there, its own squares must hold the rest.
* **A number inside another.** When every unopened square around one number also touches a second, the second's other squares hold exactly the difference between what the two need.
* **Counting the mines left.** Near the end, numbers whose squares do not overlap may account for every mine still to find, so every other unopened square is safe.

The first step of a new board opens a square in the middle: no mine is ever laid in the first square you open or beside it. On a board dealt without "Ensure solubility" the hint may stop and say that nothing further follows by deduction.

## Mines parameters

{{parameters}}
