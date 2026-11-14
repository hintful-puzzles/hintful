# redraw-a-followed-step

Filed 2026-11-14 from `edge-adapters-declare-their-evidence`, as the engine's
finding: seen in Tents, and the code it runs through is shared by every game
whose step asks for several things.

## What the work found

`engine-hints` says an `"onTrack"` move keeps the current step, as the game
adjusted it, displayed where it was displayed before the move, and that the
game shrinks the step's move, marks and words to what is left. Tents does
shrink them (`keepTrackBy` narrows the words' rings in place), and the midend
keeps `hintDisplayed` for the same step. The frame does not follow.

In Chrome, through `npm run dev` (2026-11-14, on `HEAD` `7d3f9fcae` and on the
tree after `ab7e8329f`, the same both times):

1. Tents 8x8 Easy, a new game. Hint, then Explain the hint: "No tree is beside
   the ringed squares, so every ringed square must be grass", a dozen or more
   squares ringed.
2. Right-click one ringed square. It turns to grass, and two seconds later the
   board still rings it, the sentence is still shown, and the Hint control
   reads "Hint" (`disarmHintApply`, deliberate).
3. Hint, then Explain the hint: the step is shown shrunk, without that square.

So the step was shrunk, but what the player sees after the move is the step
as it was before it, until they ask again. A ring on a square already made
asks for a move that is done.

Also seen, not yet pinned down: twice out of four tries, the first right-click
on the board after Explain the hint changed nothing, and the second did. It may
be how `playwright-cli` delivers the button; check it by hand before working
on it.

## What this change does

Find why the frame after an `"onTrack"` move is not the adjusted step (the
midend's `drawnHintStep`, the status bar's `activeHintExplanation`, or the
app's own copy of the displayed step), and make it follow the step. One fix
for every game: a cross-game guard plays part of a multi-target step and
checks that the drawn marks are the narrowed step's.
