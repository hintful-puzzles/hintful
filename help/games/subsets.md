# Subsets

You are given a grid and a list of sets. Place every set into the grid exactly once. Some sets are given.

1. A horseshoe symbol ⊃ points from a superset to a subset. In other words, the set on the open end must contain every letter in the set on the closed rounded end.
2. All possible horseshoe symbols are given. This means that each set must contain a letter that doesn't appear in the adjacent set, if there is no symbol between them.

This puzzle type was invented by Inaba Naoki under the name *サブセットリンク*, released as a [Java Applet](http://inabapuzzle.com/honkaku/subset.html) with a puzzle generator.

## Controls

Every letter has a fixed position in each set. Left-click a cell to add the letter in that position, or right-click a cell to rule out the letter in that position.

To play with a keyboard, use the arrow keys to move the cursor. Press Enter to place a letter, and press Space to rule out a letter.

### Where can this go?

The tally band beside the grid works in both directions. Click a set in the tally and every cell it could still legally go in is spotlighted; if it's already placed, the cell it lives in is shown in a different color. Going the other way, the inspect badge above a cell — or simply moving the keyboard cursor onto it — highlights every set that cell could still hold.

The answers come from what's visible on the board: the cell's own marks and rule-outs, the horseshoes to its decided neighbors, and the rule that each set appears once. The horseshoes rule out two sets on their own: the empty set sits inside every set, so it can only go in a cell that every neighbor's horseshoe points into, and the full set only in a cell whose horseshoes all point out. Nothing is read off the solution, so the aid can't do the deducing for you.

### Ruling a set out of a cell

Some deductions are about whole sets rather than letters: "{A,C} can't go in this cell". To record one, focus the cell (tap its inspect badge), then tap the set in the tally. It is struck through, and drops out of the sets the aid lists for that cell. Tap it again to take it back. While a cell is in focus, tapping the tally rules sets out of it; to spotlight a set instead, tap the badge again to let go of the cell first.

With a keyboard, move the cursor down past the bottom row of the grid into the tally, keeping the cell you were on in focus. The arrow keys move between sets, Enter or Space rules one out, Backspace takes a rule-out back, and moving up from the tally's top row returns to the grid.

Check & Save treats a set ruled out of the cell it belongs in as a mistake.

## Hints

**Hint** explains the next step rather than simply making it, one letter or one ruled-out set at a time. It reasons only from the horseshoes, the given sets and your own letters and rule-outs, so it carries on from wherever you are, as long as none of those is wrong. If one breaks a rule, it asks you to fix the highlighted mistakes first; if one is wrong without breaking any rule yet, it says your entries contradict each other, and you can undo or clear the ones you are unsure of.

In its words, to *mark* a letter *present* is to add it (left-click its position, or Enter), and to *clear* a letter is to rule it out (right-click, or Space).

{{hint-marks}}

While a hint is on show, the tally strikes through the sets already ruled out of the cell the step is about, just as it does for a cell in focus.

The hint rules sets out too, when a deduction needs it, and says why. The usual reason is a horseshoe: the set at its open end must be strictly bigger than the set at its closed end. So a set can't go at the open end if none of the sets that can still go at the closed end fits inside it with room to spare, and a set can't go at the closed end if none of the sets that can still go at the open end holds it and more.

## Subsets parameters

Every puzzle is played on a 4×4 grid over a four-letter universe. That is the one size where the sixteen possible sets exactly fill the sixteen cells — the bijection the puzzle is built on — so the board never changes size. The one thing you can choose is how hard the deductions have to work.

{{parameters}}

### Difficulty

*Easy* puzzles can be solved by reading the horseshoes forwards: a set placed on the closed end of a horseshoe tells you letters the open end must contain, and a letter ruled out of the open end is ruled out of the closed end too.

*Normal* puzzles also need the argument run backwards. Because a horseshoe forces the closed end to be a **strictly smaller** set than the open end — two cells can never hold the same set, since each set is placed exactly once — a candidate for the closed end is only viable if some candidate for the open end still contains it. Rule out the last set that could sit on the open end above it, and the closed end loses that option, even though nothing about it changed directly.
