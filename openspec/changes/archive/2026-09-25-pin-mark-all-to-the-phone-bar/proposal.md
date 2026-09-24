# pin-mark-all-to-the-phone-bar

Owner request from the device pass (`test-touch-on-a-real-device`, 2026-09-24),
playing Solo on a phone: *"I want the 'Update all pencil marks' button to always
be there on the bottom toolbar, in every game that has it, seeing how useful it
is."*

## Why

On a phone the command was two taps away, inside the More sheet (`puzzle-rail`
in its `sheet` variant). In a game that has it, it is one of the most-used
actions: it turns a board of placed digits into a board of candidates to reason
from.

## What changes

- **A sixth slot in the phone bar, only when `canMarkAll`**, between Hint and
  Check & save. It keeps its row in the More sheet too, because the bar is a
  promotion out of that sheet.
- **A short caption.** The owner said the rail's wording would need to be
  shorter: **Fill marks** / **Update marks**, the same two states as the rail's
  "Fill all pencil marks" / "Update all pencil marks", keyed on
  `hasPencilMarks`.
- **Captions wrap before they overflow.** Every caption was `nowrap`, and the
  bar's buttons carried `min-width: 44px`, which replaced flexbox's own floor of
  the longest word. A button could therefore shrink below its label. With five
  slots this was already a defect: at 360px, "Apply the hint" ran over Redo. A
  sixth slot would have spread it to 412px. Now a caption wraps to two lines
  inside the 54px row, the 44px tap floor sits on the caption instead, and the
  hint shrinks at a quarter of its neighbors' rate so the small captions go to
  two lines first. The ratio uses a shrink factor of 4 on the others rather than
  a factor below 1 on the hint: per the flexbox spec, when the unfrozen items'
  factors sum to less than 1, only that fraction of the overflow is absorbed,
  and the bar overran 320px that way.
- **The spec's "bar is a subset of the sheet" scenario gets a test.** The
  `app-shell` scenario "A command is in the phone bar but not in the surface"
  and the doc comment in `puzzle-command-homes.test.ts` both said it was
  checked, but no test did it. This change grows the bar, so it adds that
  test, and one pinning mark-all to the bar exactly when `canMarkAll`.

## Options considered

1. **A sixth slot with a short caption (taken).**
2. Mark-all takes Redo's slot and Redo moves into More. Rejected: Undo and Redo
   as a pair is the one arrangement every player already knows.
3. A key beside the keypad's Marks key. The owner was open to this; rejected on
   the merits. The keypad is a preference (`showPuzzleKeyboard`), so turning it
   off would remove the command from the phone entirely. The keypad also shows
   on desktop, where mark-all already has its rail row, so that would be a
   second home. And the keypad's keys come from the game (`requestKeys`), so
   an app-level command would have to be spliced into a game-owned list.

Population: the games with `canMarkAll`, which the flag reads directly. No
list.

## Measured

Solo, Chromium, at rest and with the hint armed ("Apply the hint" + "Update
marks", the widest pair): no horizontal overflow at 320, 360, 390 or 412px,
bar height unchanged at 58px. The hint's label stays on one line in five-slot
games from 360px up. At 360px with six slots it takes two lines, and at 320px
three.
