# tents

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: `_` and `a`–`z` for the trees, the tree past the end, then the numbers, columns before rows | stated | "Tents descriptions use the upstream run-length encoding" |
| desc | what `newState` refuses: an invalid character, a wrong grid area, a missing or malformed number | stated | "Tents descriptions use the upstream run-length encoding" |
| desc | what `newState` refuses: a number above the length of its line, a `z` with no blank square after it | gap | "A Tents number is at most the length of its line" (new) |
| params | `{w}x{h}`, a bare `{n}`, the `d` letter (`e`, `t`), and the short form | stated | "Tents' parameters" |
| params | what a string with no `d`, or with a letter that names no tier, decodes as | gap | "Tents params that name no difficulty are Easy" (new) |
| params | Width and Height at least 4 | stated | "Tents' parameters" |
| params | refusal when dealing: a 4×4 above Easy | stated | "Tents' parameters" |
| params | refusal: a width times height past what a number holds | gap | "Tents refuses a grid whose area cannot be counted" (new) |
| control | left-click and right-click on a square | stated | "Tents places tents and grass by click and drag" |
| control | a right-drag along a row or column | stated | "Tents places tents and grass by click and drag" |
| control | a left drag between a tree and the square beside it | stated | "A drag between a tree and the square beside it is the link gesture" |
| control | Enter and Space at the cursor | stated | "Tents takes a cursor and direct keys" |
| control | the keys `T`, `N` and `B` | stated | "Tents takes a cursor and direct keys" |
| control | Shift or Ctrl with an arrow | stated | "Tents takes a cursor and direct keys" |
| control | `L` and an arrow | stated | "L and an arrow make the link from the keyboard" |
| control | a bare arrow reveals and moves the cursor; a press parks it | not-owed | `engine-input`: "One arrow press reveals the cursor and moves it", "The engine owns a declaring game's press and select keys" |
| control | the keypad | not-owed | the game has no `requestKeys` |
| hint | `noTree`, `treesDone`, `nextToTent`, `treeSingle` | stated | "Tents explains the next deduction" |
| hint | `treeDiagonal` | stated | "Tents explains the next deduction", "Tents' Normal rungs are rungs of their own" (the square is made a non-tent) |
| hint | `lineCount` | stated | "Tents explains the next deduction", "Tents' line count reads every placement of a line's tents" |
| hint | `lineNeighbors` | gap | "A Tents line's remaining tents grass the squares beside it that each placement touches" (new) |
| hint | `tentLink`, `treeLink` | stated | "The Tents hint draws a link for a pairing its rungs need", "Tents' link rung sits beneath Easy, and its Easy rungs at Easy" (a tent's one unattached tree; a tree's tent on its single candidate square) |
| hint | the order the techniques are tried in | gap | "The Tents hint tries the squares beside a tree before it counts a line" (new) |
| hint | which links count as on the board | stated | "A Tents hint step rests only on what the player can see" |
| hint | what a step says and marks | stated | "A Tents hint step says why and marks what it uses" |
| hint | a step partly made | stated | "Tents' hintKeepTrack judges a move by what it changes" |
| hint | when it refuses | not-owed | `engine-hints`: "Deduction running out on a sound board SHALL have one wording", "The midend SHALL refuse a hint on a finished or wrong board before asking the game" |
| words | the status bar | not-owed | the game has no `statusbarText` |
| words | the preset titles | not-owed | `engine-params`: "One describer labels every params set" |

## Defects

None.

## Notes

- Tents declares no preference (`prefs` is absent), so there is no `pref`
  row.
- The `z` half of "A Tents number is at most the length of its line" has no
  scenario, for want of a real description with a `z` in it: a `z` needs 25
  blank squares in a row with more to follow, and none came from the first
  preset in `facts.json` nor from `newDesc(decodeParams(p),
  randomNew("facts-tents"))` at `8x8dt`, `10x10de`, `10x10dt`, `15x15de` and
  `15x15dt`, and no test of the game holds one. The sentence was read against
  `parseDesc` (`src/games/tents/state.ts`, the `ch === "z"` arm).
- The scenario of that requirement first said that the description with an 8
  for its first column "is read". `newState` does read it; the board is then
  refused on loading ("The clues in this game ID contradict each other."),
  and the scenario now says both.
- The count over the lines alongside (`lineNeighbors`) was marked `stated`
  on "Tents explains the next deduction", which names it "over the lines
  beside it", and "Tents' line count reads every placement of a line's
  tents", which has it "read the same placements for what they do to the two
  lines alongside". Neither says what it concludes, so it is a `gap` with a
  requirement of its own. Its scenario's board is the `8x8dt` deal above, not
  one in `facts.json`.
- "Tents explains the next deduction" lists the seven square-deciding
  techniques in the order the hint tries them, and does not say it is an
  order. The new requirement says so, and where the two kinds of link step
  fall in it.
- A params string with a difficulty letter the game does not know (`8x8dq`)
  decodes to the default and is not refused. That is the codec's `choice`
  segment, the same in every game that uses one (Sticks, Tracks and Towers in
  this batch), and `engine-params` "The codec grammar is a prefix, tagged
  segments, flags and letters" could say it once. What the default is stays
  each game's.
- `validateParams` refuses `w > Number.MAX_SAFE_INTEGER / h` in the engine's
  sentence `AREA_TOO_LARGE` (`src/engine/params.ts:202`). Tracks has the same
  line. The sentence is the engine's and no engine capability states when a
  game owes the check, so the rule could be stated once there; each game's
  requirement here states what its own `validateParams` does.
- Upstream's decoder also reads `!` and `-` in the grid part (a tent or a
  non-tent placed before play). No encoder here writes them and `newState`
  refuses them as an invalid character, which "Tents descriptions use the
  upstream run-length encoding" covers without naming them. Under `AGENTS.md`
  a description upstream's generator writes must load; upstream's generator
  does not write these either, so nothing it deals is refused.
