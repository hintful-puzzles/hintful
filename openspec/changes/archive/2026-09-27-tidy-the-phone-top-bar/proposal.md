# tidy-the-phone-top-bar

## Why

Once the solve timer was added, the phone's top bar no longer fitted on one row.
The owner's screenshot (2026-09-27, about 400 CSS px wide, larger text than the
default) showed the game's name cut down to "As…". It also showed the "Size 7
Hexagon Hard" chip spilling out of its box and under the move counter's
history icon: the chip box was allowed to shrink (`min-width: 0`) while the
chip itself could not wrap, and nothing clipped it.

The move counter was the widest item in the row. On a phone its number says
little that Undo and Redo beside the board don't already say, and the More
sheet's "Your position" group already has it, together with the timeline and
checkpoints.

## What changes

- The top bar holds back, the game's name, the type chips and the timer. The
  move counter is gone from it; on a phone it lives in More.
- When space runs out, the chips give way rather than the name. The name keeps
  its width (capped at 45% of the row), and the chip row clips, ending its last
  chip with an ellipsis. The timer sits at the end of the row and never shrinks.
- **The `show-timeline` command is retired.** The only thing that ever sent it
  was the counter button, which opens its own dropdown anyway because it is that
  dropdown's trigger. Inside the sheet, the command was harmful: a command
  chosen from the sheet closes it, which closed the timeline with it. Tapping
  the counter there only appeared to work because the command then opened the
  top bar's copy of the timeline. With that copy gone, the tap showed nothing.
- A choice made in a menu inside the sheet (a checkpoint picked from the
  timeline) now closes the sheet, as choosing a command from it does.

Verified in Chromium at 320, 360 and 412 px, and at 320 px with 125% root text,
a long name and a 1:02:03 time: nothing overflows the row, and the chip clips to
"Si…". The timeline opens from the sheet and from the desktop rail, and picking
Start closes the sheet.
