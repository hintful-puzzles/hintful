# refuse-a-hint-before-the-first-board

**Status: scaffolded, not started (2026-10-07).** Found while checking
`work-down-the-unreached-hint-rungs` in the browser, and filed on the owner's
yes that day.

## Why

On a fresh page load the Hint button is live for a moment before the first
board exists. Pressing it then shows the "Something went wrong" dialog. Seen
on 2026-10-07 in Chrome against the dev server, clicking the button in the
first frame it could be found (about 100 ms after the page committed):

- Tracks 10x10 Hard: `TypeError: Cannot read properties of undefined (reading
  'w')`
- Boats 10x10 Hard and 8x8 Normal: `... (reading 'params')`, from `boardOf` ←
  `status` ← `Midend.statusOf` ← `Midend.computeHintPlan` ← `Midend.hint` ←
  `TsWorkerPuzzle.hint`.

So `Midend.hint` runs with no state. Pressing New game and then Hint at once
did not reproduce it, which says the board in play stays until its
replacement is dealt and only the first load has no board at all. A player on
a slow device, opening a size that takes seconds to deal, has that whole time
to press it. Not measured: which other commands share the window (Check,
Auto-solve, Show solution, Undo), and the `H` key.

## What Changes

No command reaches the midend before it holds a board. Where that is decided
(the controls disabled until the first board, or the midend answering) is for
the change to settle after reading who else can be early.

## Hints to pull in

None.

## What would show it worked

The click above, on the first frame, on the slowest-dealing preset: no dialog,
and the hint is given once the board is there or the button is not yet live.
A test that asks a midend with no board for a hint, and for each other
command found to share the window.
