# ascent

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: the padded grid row-major, numbers in decimal, runs of empty squares in lowercase and of walls in uppercase, the Edges arrows as numbers on the border ring | stated | "Ascent descriptions use the upstream run-length encoding" |
| desc | the separator's character `_`, what a run letter counts, the range of a number | gap | "An Ascent description parts two numbers with _ and counts a run from a" (new) |
| desc | what the parser refuses: too few or too many squares, a number above the cell count | stated | "A description is validated against the physical grid" |
| desc | `supersededDesc` | not-owed | The game has none (`facts.json`: `supersededDesc: false`) |
| params | `WxH` | not-owed | `engine-params`: "The engine provides a shared dimension param parser" |
| params | `m` and the mode letters `O`, `R`, `H`, `C`, `E`; a string that names no mode | stated | "Ascent's rulesets are told apart by a square's neighbors" |
| params | the `E` flag, `d` with `e` / `n` / `t` / `h`, the `S` flag, and what the short form leaves out | gap | "Ascent's full encoding adds hidden ends, the tier and symmetry after the mode letter" (new) |
| params | refusal: width and height from 2 to 50, area under 1000, a Hexagon's odd height and width, a 2×2 in Edges | stated | "Ascent's parameters" |
| params | refusal: what a ruleset does not offer (a shape, symmetry or Easy in Edges) | stated | "Each ruleset declares what it offers" |
| params | refusal: a tier no board of a small size has | gap | "Ascent refuses a tier that no board of a small size has" (new) |
| pref | `numpad` | gap | "Ascent's keys click at the cursor, and the number pad types or moves" (new) |
| pref | `auto-advance-runs` | gap | "Ascent's auto-advance preference moves the selection past numbers already placed" (new) |
| control | click a number, then a square beside it; click an empty square and type; drag from an arrow in Edges | stated | "Ascent places a number three ways" |
| control | which number a selected one offers, and the right-click that cycles the two beside it | stated | "Ascent always offers a number beside the one selected" |
| control | a second and a third tap on the selected number | stated | "A second tap on the selected number offers the one before" |
| control | a second and a third tap on the square a tap just filled | gap | "A tap on the square a tap just filled offers the number before, then empties it" (new) |
| control | a right-click on a square with two candidates: the order, and the squares that have two | gap | "A right-click on an Ascent square with two candidate numbers cycles through them" (new) |
| control | left-drag draws a path; right-click and right-drag erase a number or a line | stated | "Ascent draws and erases a path" |
| control | a number on a given | stated | "A number cannot be placed on a given" |
| control | what confirms a typed number: Enter, an arrow, a click | stated | "The UI_UPDATE tail of interpretMove is kept" |
| control | Enter, Space and Backspace at the cursor; the number pad's diagonals; Up and Down on a hexagonal board | gap | "Ascent's keys click at the cursor, and the number pad types or moves" (new) |
| control | the plain arrows on a square board | stated | "Ascent places a number three ways" |
| control | `requestKeys`: the digits and Clear | stated | "Ascent offers a number keypad" |
| hint | rung `touch` | stated | "Ascent's hint techniques stay within the board's tier" |
| hint | rung `reach` | stated | "Ascent's hint techniques stay within the board's tier" |
| hint | rung `deadEnd` | stated | "Ascent's hint techniques stay within the board's tier" |
| hint | rungs `only`, `onlyBeside`: a square only one run, and one number of it, can reach | stated | "Ascent's hint techniques stay within the board's tier"; "A square only one run can reach names the close rival"; "Several close rivals give way to the counts, or to the run's reach" |
| hint | rungs `route`, `routeOnly`, `routeBeside`: the same readings along routes | stated | "Ascent's hint techniques stay within the board's tier" |
| hint | rung `lines` | stated | "Ascent's hint reads the arrows' lines in Edges mode"; "A lines step names every premise it needs" |
| hint | rung `pointers` | stated | "Ascent's Edges hint asks which arrow pointing at a square still fits"; "A pointers step names the numbers it rules out" |
| hint | rung `wholeRun` | stated | "Ascent's hint places a run with one route in one step"; "A whole-run step draws its route and shrinks as it is followed"; "Ascent's Edges hint says when the arrows fix a run's route" |
| hint | the order, and the tier each technique has in each mode (what tells `onlyBeside` from `only` and `routeBeside` from `routeOnly`) | gap | "Ascent's hint asks its techniques in the order of their tiers" (new) |
| hint | where the two Edges techniques (`lines`, `pointers`) come in that order | gap | "On an Edges board Ascent's hint asks the arrows before the runs of their tier" (new) |
| hint | following a run | stated | "Ascent's hint follows a run" |
| hint | the words and the marks | stated | "A hint step says why in one sentence and marks what it reads"; "Ascent's hint names only numbers the player can see"; "Ascent's Edges hint names a number's own line by its shape" |
| hint | when it refuses | stated | "Ascent explains the next number" |
| words | the status bar | not-owed | The game has none (`facts.json`: `statusbar: false`) |
| words | the label: "Size N" for a Hexagon, "hidden ends", "shown ends", "symmetric" | gap | "An Ascent label names a Hexagon by its size and says only the departures" (new) |
| words | the menu's sections | stated | "The Type menu has a section for each ruleset" |

## Defects

None. The help's Controls section and the code agree on every gesture it
names; it does not name Space or Backspace at the cursor, the number pad's
diagonals, or either preference.

## Notes

- **A bug: a mode letter the game does not know is not refused.**
  `decodeParams` sets `mode` to one past the last on an unknown letter
  (`src/games/ascent/index.ts:321`), and nothing checks it. Run 2026-10-11:
  `6x7mXde` decodes with `mode` 6, passes the engine's params check both for
  dealing and for loading, and encodes as `6x7mundefinedde`. An unknown
  difficulty letter is refused ("Difficulty must be one of Easy, Normal,
  Tricky, Hard."), because the difficulty is a declared choice; the mode is
  not held the same way. No requirement is written for it, and "Ascent's full
  encoding adds hidden ends, the tier and symmetry after the mode letter"
  speaks only of a string whose mode letter is one of the five.
  - *How a player meets it.* Only through a typed or pasted game ID, or a
    link, whose letter after `m` is none of `O`, `R`, `H`, `C`, `E`: a typo, a
    lowercase letter (`6x7modh`), or a string that ends at the `m`. No menu
    or dialog writes one.
  - *What they get.* A Classic board, since every reading of the mode that is
    not Orthogonal, hexagonal or Edges falls to Classic's eight neighbors: the
    board is dealt, or loads from its description, plays, and is labeled
    "Classic: 6x7 Hard". The game ID the app then writes holds
    `mundefined`, and that ID does not come back whole: `6x7mundefineddh`
    decodes as Easy, because the `u` is taken as the unknown letter and the
    `n` after it stops the reading before the `d`. So a link shared from such
    a board opens the same squares with the difficulty reading Easy.
  - *The fix it suggests.* Refuse an unknown mode letter where an unknown
    difficulty letter is refused, by declaring the mode as the choice it is.
    That would refuse an ID that loads today, so it is a compatibility
    question for the owner.
- **A bug: under "Move cursor" the number pad's diagonals also type their
  digit.** With the `numpad` preference at "Move cursor", 8, 2, 4 and 6 are
  turned into arrows before anything reads them, and 7, 9, 1 and 3 are not:
  each moves the cursor diagonally and then reaches the typing arm
  (`src/games/ascent/ui.ts:840`), where `digitOf` reads a number-pad digit as
  its digit. Run 2026-10-11 on a Classic board: the number pad's 9 moved the
  cursor from (1,2) to (2,1) and left the number 9 being typed in the square
  it landed on; a 3 after it moved again and made the
  pending number 93; a 7 that landed on a filled square moved the cursor and
  answered that the key was declined. "Ascent's keys click at the cursor, and
  the number pad types or moves" states the rule (a diagonal moves), and its
  scenario presses 8, which works. No test of the game presses a number-pad
  diagonal under that preference.
- "Ascent's hint techniques stay within the board's tier" ends "No step SHALL
  use a technique above the board's tier". The plan has no cap
  (`src/games/ascent/hint.ts`, "No tier cap"): it asks the easiest technique
  first, and on a board dealt at a tier an easier technique is always there to
  answer. The sentence holds as an outcome on dealt boards and is not a rule
  the code applies.
- "Ascent places a number three ways" says a number "of any length" is typed.
  The code stops at three digits (`src/games/ascent/ui.ts:850`), and drops a
  typed number above the board's last (`ui.ts:904`). No board reaches 1000
  squares, so nothing a player can do is refused; the requirement's words are
  looser than the code and not contradicted by it.
- A string with `S` and the Edges mode decodes with symmetry on, is refused
  for dealing by the engine ("Symmetrical clues must be off for Edges."), loads
  with a description, and is written back without the `S`.
