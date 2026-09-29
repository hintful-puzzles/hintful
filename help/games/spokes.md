# Spokes

You are given a grid filled with hubs with numbers on them. Your objective is to draw lines between them while following these rules:

1. You can only draw a line starting from a hub's point. If there is no point visible, you cannot draw a line.
2. Only one line can be drawn between two hubs.
3. The number indicates the amount of lines starting from a hub.
4. Lines cannot cross each other.
5. All hubs must form a single connected group.

The inventor of this puzzle type is unknown.

## Controls

To draw a line, left-click and drag from one hub to another. You can mark a dot as unused by dragging between hubs with the right mouse button.

You can also use the keyboard. Use the arrow keys to move the cursor on top of a dot, then press Enter to draw a line or Space to mark it.

Because a diagonal line visibly blocks the other diagonal of the same square, drawing one rules its crossing out for you, and erasing the line takes that mark away again. While the line stands, the crossing can't be toggled by hand.

A hub is grayed out once it carries as many lines as its number asks for. That's a visual reminder only — the hub stays fully editable — and it can be switched off in the game's preferences.

## Hints

**Hint** explains the next step rather than simply making it. It reasons
only from the numbers, your lines and the dots you have marked as unused,
so it carries on from wherever you are, as long as none of those is
wrong; if one is, it asks you to fix the highlighted mistakes first.

{{hint-marks}}

In the hint's words, a *spoke* is one of a hub's dots, the start of a line
it could draw, and a *free* spoke is one that is neither a line yet nor
ruled out. When one deduction settles several spokes at once, the hint
walks through them one at a time as a single step.

Most steps are the rules at work. A hub with just as many free spokes as
it still needs lines must use them all; a hub that already has all its
lines can use none of the rest; and a line joining two 1-hubs would leave
that pair cut off from everything else. When those run out, which on
**Normal** boards they do, the hint tries a spoke the other way and shows
where that goes wrong within a few moves: it would give
the outlined hub more lines than its number, force the diagonals of the
outlined hubs to cross, or strand the outlined hubs in a group of their own.

Every hint is a deduction you could have made from what is on the board.
On an **Unreasonable** board there may come a point where no deduction is
left and the only way on is to try something and see whether it works —
that is what [the difficulty name means](../features#difficulty). The hint
says so rather than guessing for you: save your position, try it, and
undo if it breaks.

## Spokes parameters

These parameters are available from the ‘Custom type…’ option on the ‘Type’ menu.

<dl>
	<dt>Width, Height</dt>
	<dd>Size of the grid in squares.</dd>
	<dt>Difficulty</dt>
	<dd>Determine the difficulty of the generated puzzle. Higher difficulties require more complex reasoning.</dd>
</dl>

