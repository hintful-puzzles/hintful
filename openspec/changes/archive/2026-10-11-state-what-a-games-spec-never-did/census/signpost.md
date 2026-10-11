# signpost

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | one token a cell: an optional number, then a direction letter `a` to `h` | stated | "Signpost descriptions use the upstream per-cell encoding" |
| desc | refusals: an unknown character, a number out of range, the wrong number of tokens | stated | "A malformed Signpost description is refused" |
| desc | refusal: a number given twice | gap | "A Signpost description gives no number twice" (new) |
| desc | what `newState` builds: arrows, givens, and the links between consecutive givens | stated | "A new Signpost board holds the description's arrows and givens" |
| desc | `supersededDesc` | not-owed | The game has none (`facts.json`: `supersededDesc: false`) |
| params | `{w}x{h}`, the `c` letter, `de` and `du`; the bare `{n}`; what the short form leaves out (`c` and the difficulty) | stated | "Signpost's parameters" |
| params | refusals: a side below one, a 1×1 grid for dealing | stated | "Signpost's parameters" |
| params | refusal: an area past 2³¹ − 1 | gap | "Signpost refuses an area past what a signed 32-bit number holds" (new) |
| params | refusal: Unreasonable where no board needs it | stated | "Signpost refuses Unreasonable where no board needs it" |
| params | refusal: Unreasonable past 225 squares or 30 on a side | stated | "Unreasonable Signpost is bounded on its own measurements" |
| pref | `flash-type` | stated | "Signpost exposes the victory-flash preference" |
| control | a left-drag and a right-drag between two squares; what link is made, and what it breaks | gap | "A Signpost drag links the square pressed and the square released on" (new) |
| control | a press on the given last number or the given 1 | gap | "A Signpost drag links the square pressed and the square released on" (new) |
| control | a left-drag and a right-drag off the grid | gap | "A Signpost drag off the grid unlinks" (new) |
| control | the arrow at the pointer during a drag | stated | "An arrow follows a Signpost drag" |
| control | the arrow keys move the cursor | not-owed | `engine-input`: "One arrow press reveals the cursor and moves it"; "A bounded-grid cursor is driven through moveCursor" |
| control | the cursor stops at the edges; the arrow keys carry a drag | gap | "Signpost's keys pick a square up and put it down" (new) |
| control | Enter and Space pick up and put down | gap | "Signpost's keys pick a square up and put it down" (new) |
| control | `x` and Shift+X | gap | "Signpost's keys pick a square up and put it down" (new) |
| control | Shift+X reaches the game as `X` | not-owed | `engine-input`: "A declined key is offered again without its Shift" |
| control | `requestKeys` / the keypad | not-owed | The game has none (`facts.json`: `keypad: null`) |
| control | a move links every number to the next its arrow points at | gap | "Signpost links a number to the next by itself" (new) |
| hint | `follows` | gap | "A Signpost hint asks for no link the board already holds" (new): the rule, which the rung breaks (see Notes); the link itself is "Signpost links a number to the next by itself" (new) |
| hint | `onlyNext` | gap | "Signpost's hint finds the one square that can come next" (new) |
| hint | `onlyBefore` | gap | "Signpost's hint finds the one arrow that can lead in" (new) |
| hint | the order | gap | "Signpost's hint tries the next square, then the arrow in" (new), which leaves `follows` out (see Notes) |
| hint | the marks: the arrow, the ringed square, the striped line, the outlined rivals | gap | "A Signpost hint step marks both ends of its link" (new) |
| hint | the refusal on an Unreasonable board | stated | "Signpost's hint stops where the solver does" |
| hint | the refusal on a board with a wrong link | not-owed | `engine-hints`: "The midend SHALL refuse a hint on a finished or wrong board before asking the game" |
| words | the status bar | not-owed | The game has none (`facts.json`: `statusbar: false`) |
| words | preset titles ("4x4 Easy, free ends") | stated | "Signpost's menu offers each size at both difficulties" |

## Defects

- The Controls section and `interpretMove` agree, read line by line.
- The help lists "Consecutive numbers" first among the ideas the hint teaches
  (`help/games/signpost.md:36`). The step that speaks it
  (`src/games/signpost/hint.ts:108`, `follows`) is only ever shown for a link
  the board has already made (`src/games/signpost/moves.ts:67`), so it teaches
  nothing: the bug under Notes. Here the code is wrong and not the help, so
  no requirement states what the code does.

## Notes

- **A bug, reproduced through the midend 2026-10-11: every "consecutive
  numbers" step a player is shown asks for a link the board already holds.**
  What a player presses and sees, on `4x4cde:1e9cfgddgadcaaabh16a`: press Hint
  and make the link it shows, nine times. The ninth link numbers the third
  square of the second row 14; the square to its left is already 15, the 14's
  arrow points at it, and the board draws the two linked at once. Press Hint a
  tenth time: it marks those two squares and says "The 15 must come right
  after the 14, and the 14's arrow points at it, so the two must be linked."
  Make the link (Enter on the 14, Left, Enter; or let the hint play it): the
  step counts as done and Undo gains a step, and no link, number or color on
  the board changes. Undo then appears to do nothing.
- Why: `executeMove` ends by linking every `k` to `k + 1` where the arrow of
  `k` points at it (`src/games/signpost/moves.ts:67`,
  `checkCompletion(ret, true)`), and `newState` does the same. The hint plans
  on a copy whose links are made without that pass
  (`src/games/signpost/hint.ts:193`), so `follows` (`hint.ts:108`) fires in
  the plan for exactly the pairs the real board links by itself. A plan made
  afresh never opens on one, and a later step of a kept plan always is one
  already held. The repeated link is still a move to the midend, because the
  automatic link is made after the chains are counted and the repeat counts
  them again. Signpost has no `refreshHintStep`, so the midend cannot drop the
  step, which `engine-hints` "A displayed hint step never references
  already-resolved state" asks for.
- How often: on the three boards above, `5x5cde:cgdffd1bhb18gccfdeddab25aabbhg`
  (the 22nd hint, the 21 and the 22) and `5x5cde:degffe1egegb4eccacbbagca25aah`
  (the 19th, the 1 and the 2), each walk's one `follows` step was already
  held. Over forty dealt boards (ten seeds each of `4x4cde`, `5x5cde`,
  `6x6cde` and `5x5de`) walked hint by hint to the end, 85 `follows` steps
  were shown and all 85 were already held; a fresh plan from each position
  on the way opened on `follows` zero times.
- What the delta says of it: "Signpost links a number to the next by itself"
  states the automatic link, which is the intended rule. "A Signpost hint
  asks for no link the board already holds" states the rule the code breaks,
  and its scenario is a fresh plan, where the code keeps it.
  "Signpost's hint tries the next square, then the arrow in" gives the order
  of the two techniques a player can act on; the plan as coded tries
  `follows` before both. No requirement presents `follows` as a technique.
  The fix is the game's: the plan's copy makes the automatic links too and
  the rung goes, or the step is refreshed away. Either satisfies the delta.
  The help's "Consecutive numbers" bullet then wants rewording as something
  the board does.
- The area refusal is a line of the game's own with the engine's sentence;
  see the note in `census/samegame.md`.
- A keyboard pick-up is not refused on the given last number or the given 1
  as a pointer press is: the drag starts and its release makes no link.
- The short encoding leaves `c` out, so `4x4` decodes with free ends; the
  spec states that `c` is in the full encoding only.
