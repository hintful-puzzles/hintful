# blackbox

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: `[w, h, x, y, …]` a byte each, obfuscated, in hex | stated | "Black Box descriptions are obfuscated ball-layout bitmaps" |
| desc | what the parser refuses: a wrong length, a header that is not the board's size, a ball outside the arena | stated | "A damaged Black Box description is refused" |
| desc | what the parser refuses: a ball count outside the params' range, two balls on one square, a character that is not a lowercase hex digit | gap | "A Black Box description holds each ball once, and as many as the params allow" (new) |
| desc | a board with several answers | stated | "A board with several answers does not load" |
| desc | `supersededDesc` | not-owed | The game has none (`facts.json`: `supersededDesc: false`) |
| params | the letters `w`, `h`, `m`, `M`; a letter it does not know; the short form, which leaves nothing out | stated | "Black Box params are a size and a ball range" |
| params | refusal: `w` or `h` under 2 or over 255, `minballs` under 1, above `maxballs`, or not under the area | stated | "Black Box refuses params that cannot be played" |
| params | refusal: `maxballs` above the ball limit, when dealing | stated | "Only a deal is bound by the ball limit" |
| params | the Custom dialog's `no-of-balls` field, `N` or `N-M` | stated | "The type summary names the size and the ball count" |
| pref | (none) | not-owed | The game has none (`facts.json`: `prefs: []`) |
| control | primary on an edge square: fire, or show again a laser already fired | gap | "A primary press on the edge fires a laser, or shows again one already fired" (new) |
| control | primary on a square inside: toggle a guessed ball, and none on a locked square | stated | "A ball toggle updates the guess count, and a locked cell takes none" |
| control | the corner button: when it is there, what a press does, the cursor on it | gap | "The corner button checks the guess while the ball count allows it" (new) |
| control | secondary on a square inside, and on an edge square | gap | "A secondary press marks a square known, or its whole row or column from the edge" (new); what a line lock then does is "A line lock follows the majority of its cells" |
| control | the drag (`sweep`) | gap | "A Black Box drag repeats a ball or a mark inside the box and fires nothing" (new) |
| control | where the keyboard cursor walks | gap | "The corner button checks the guess while the ball count allows it" (new) |
| control | Enter and Space at the cursor | not-owed | `engine-input`: "The engine owns a declaring game's press and select keys" |
| control | `requestKeys` / the keypad | not-owed | The game has none (`facts.json`: `keypad: null`) |
| hint | rung `ray` | stated | "A fired laser settles the first unsettled square on its path"; "A settled square is shown by a mark, in one step" |
| hint | rung `fire` | stated | "When nothing more settles, the hint asks for a laser" |
| hint | rung `layout` | stated | "With every laser fired, the hint offers a layout it searched for" |
| hint | rungs `hidden`, `done` | stated | "The hint ends by placing unreached balls and asking for a check" |
| hint | the order | stated | Each of the four requirements above opens with the condition that the one before it has nothing: "When no fired laser settles another square", "When every laser is fired and none settles a square", "Once every laser's path is settled" |
| hint | what it reads, and that it only adds marks | stated | "Black Box's hint SHALL reason only from the lasers fired"; "The hint's steps only add marks" |
| words | the status bar: its four sentences and the error count | gap | "Black Box's status bar counts the balls marked and says when to check" (new); that a reveal leaves only the error count is "Black Box verifies guesses, and a reveal is a win" |
| words | the type summary | stated | "The type summary names the size and the ball count" |

## Defects

- **The help says a click on a fired beam "shows its path again"; the code
  shows no path.** `help/games/blackbox.md:14` and `:15` against
  `src/games/blackbox/render.ts:310`: the press sets `ui.flashLaserno`
  (`src/games/blackbox/index.ts:217`), and `redraw` draws the laser's result
  (`H`, `R` or its number) in the flash color at the square pressed and, for a
  laser that came out, at its other end. Nothing is drawn across the box. The
  requirement states what the code does.

## Notes

- The help's Controls paragraph is built from `targetVerbs` (`{{controls}}`),
  so the two verbs' words cannot drift from the code. Rendered 2026-10-11 it
  gives the click (a beam from the edge, a ball inside), the right-click (a
  square known, or its row or column from the edge), the drag ("do the same
  to every square you pass over that looked the same as the first"), the
  arrows, Enter and Space. Each has a row above. The paragraph's drag sentence
  is the engine's and says nothing of the edge: a drag fires no second laser,
  which the new drag requirement states.
- The defect was confirmed by running the press and reading `redraw`
  (2026-10-11): a second press on a fired laser makes no move, holds
  `ui.flashLaser` at 1 until the release (2, timed, when a key made it), and
  the one thing `redraw` does with it is choose the flash color for the text
  of that laser's square and of its exit's.
- After a check that fails with the pointer while the hidden cursor is parked
  on the corner, the cursor is left on a square that is no longer a target;
  Up or Left then does nothing, and Right or Down walks it off. Not a rule
  worth a requirement, and nothing a player is stopped by.
