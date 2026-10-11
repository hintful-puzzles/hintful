# dominosa

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: the clue numbers row-major, a digit or `[NN]` | stated | "Dominosa descriptions carry the clue grid" |
| desc | what the parser refuses: too short, too long, a number past `n`, a missing `]`, numbers that are not one full set | stated | "Dominosa descriptions carry the clue grid" |
| desc | what the parser refuses: a bracketed number under 10, a character that is no digit and no bracket | gap | "A Dominosa description brackets only a number of 10 or more" (new) |
| desc | `supersededDesc` | not-owed | The game has none (`facts.json`: `supersededDesc: false`) |
| params | the leading number `n` | stated | "Dominosa params are the highest number, a tier and the tall flag" |
| params | the `t` letter (`tall`), and a string without it | stated | "Dominosa params are the highest number, a tier and the tall flag" |
| params | the `d` letter and the tier letters `t`, `b`, `h`, `e` | stated | "Dominosa params are the highest number, a tier and the tall flag"; "The fourth Dominosa tier is named Unreasonable and keeps its character" |
| params | `da` and upstream's bare `a` | stated | "An id asking for an unchecked board names no tier" |
| params | what the short form leaves out: the difficulty | stated | "Dominosa params are the highest number, a tier and the tall flag" |
| params | refusal: `n` below 1, `n` so large the area overflows | stated | "Dominosa refuses params outside its bounds" |
| params | refusal: a tier above Easy at `n = 1`, above Normal at `n = 2` | stated | "Dominosa refuses params outside its bounds" |
| pref | (none) | not-owed | The game has none (`facts.json`: `prefs: []`) |
| control | left-click or Enter between two numbers: place or remove a domino, replacing what it overlaps and clearing the lines round it | stated | "Dominosa input places dominoes and barrier edges" |
| control | right-click or Space between two free squares: place or remove a line | stated | "Dominosa input places dominoes and barrier edges" |
| control | right-click on a number, or a digit key: the two-slot highlight | stated | "A right-click on a number or a digit key toggles a value highlight" |
| control | the arrows walk the half-grid | stated | "The Dominosa keyboard cursor walks the half-grid" |
| control | a drag repeats the press on each pair it passes | not-owed | `engine-input`: "A drag on from a press repeats the press" |
| control | the first select key on a hidden cursor only shows it | not-owed | `engine-input`: "The engine owns a declaring game's press and select keys" |
| control | the reference panel: pick a domino to box its spots, and a board tap puts it away | stated | "Dominosa provides a domino reference with pair-occurrence highlight"; "Any pointer tap on the board dismisses the spotlight" |
| control | `requestKeys` / the keypad | not-owed | The game has none (`facts.json`: `keypad: null`) |
| hint | rung `onlySpot` ("has only one spot left where it fits") | stated | "A placement step places a domino that has one spot left" |
| hint | rung `squareOnly` ("has only one neighbor left to pair with") | stated | "A placement step places a domino that has one spot left" |
| hint | rung `squareSingleDomino` ("can only be part of the … domino") | gap | "A square that takes one domino rules that domino out elsewhere" (new) |
| hint | rung `mustOverlap` ("Every remaining spot … overlaps this pair") | gap | "A spot that overlaps every spot of a domino is ruled out" (new) |
| hint | rung `localDuplicate` ("would force a second …") | gap | "A spot that would force a domino twice is ruled out" (new) |
| hint | rung `localDuplicate2` ("needing one and the same domino") | gap | "A spot that would force a domino twice is ruled out" (new) |
| hint | rung `parity` ("odd-sized regions, which dominoes can't fill") | stated | "What the parity and forcing-chain deductions conclude"; "A barrier step draws the edge a technique rules out" |
| hint | rung `set`, without doubles ("can only hold one set of dominoes") | gap | "Set analysis rules a group's dominoes out of every other spot" (new) |
| hint | rung `set`, with doubles | gap | "Set analysis with doubles lets the double cover two of the group" (new) |
| hint | the order the techniques are tried in, and that no tier caps them | gap | "Dominosa's hint tries its techniques in one order" (new) |
| hint | the words of a firing's later lines | gap | "A later line of one firing does not repeat its reason" (new) |
| hint | one firing's lines are one journey, and a line already drawn is skipped | stated | "Barriers ruled out by one firing form one journey" |
| hint | the forcing chain is never narrated | stated | "The forcing chain grades boards and is never narrated" |
| hint | the marks | stated | "Dominosa renders the hint distinctly" |
| hint | the refusal on a board with several answers | stated | "A hint is refused on an ambiguous board" |
| hint | the refusal where deduction runs out | not-owed | `engine-hints`: "Deduction running out on a sound board SHALL have one wording" |
| words | the status bar | not-owed | The game has none (`facts.json`: `statusbar: false`) |
| words | the preset titles ("Order 6 Tricky") | not-owed | `engine-params`: "One describer labels every params set" |

## Defects

- **The hint does not reason from the player's lines.**
  `help/games/dominosa.md:24` says the hint "reasons from the dominoes you
  have placed and the lines you have drawn between numbers ... as long as
  none of them is wrong". `src/games/dominosa/solver.ts:778-786` seeds the
  hint's solver from the dominoes only, on purpose ("a wrong one must never
  break the hint"), and `src/games/dominosa/index.ts:409-414` reads the lines
  only to leave out a step whose line is already drawn. A line the player
  drew that the deductions do not reach is not used, and `findMistakes`
  flags no line. The spec agrees with the code ("seeded from the placed
  dominoes"; "a barrier the player has already drawn SHALL be skipped for
  display").
- **"Every remaining spot overlaps" is wider than the help says.**
  `help/games/dominosa.md:35` gives the case where every spot left for a
  domino "covers the same square". `src/games/dominosa/solver.ts:341-372`
  rules out any spot that overlaps all of them, which they need share no
  square for: two spots end to end are both overlapped by the spot between
  them. The new requirement states the code and gives that case.

## Notes

- **The spec names hooks and palette entries the tree no longer has under
  those names.** "Dominosa descriptions carry the clue grid" says
  `validateDesc` rejects; the game has no such hook, the refusals being
  `newState`'s through `readDesc` (`src/games/dominosa/state.ts:167-193`).
  "Dominosa renders the hint distinctly" and "Filling hint color legend" name
  `COL_HINT_CELL`. Neither was touched: the behavior each states is what the
  code does.
- **A bracketed number under 10 is refused** (`r.int(10, n)`,
  `src/games/dominosa/state.ts:176-178`): `[0]0012113233302132120` for `3t`
  is refused as out of range, and a letter in a number's place as a character
  that cannot be there (run 2026-10-11). The description requirement in the
  tree says a number of 10 or more is written in brackets and lists neither
  refusal, so each now has a requirement: a session checking a parser change
  against the spec would not have found them.
- **`encodeParams` writes `dundefined` for a tier it does not know**: `6tdx`
  decodes to a tier past the last and encodes in full as `6tdundefined` (run
  2026-10-11). The params are refused (`engine-params`: "Params validity is
  the engine's check") before anything shows the string, so no player sees
  it; Clusters' codec writes `d?` for the same case.
- **The order's Easy scenario was run**: eight boards dealt at `3tdt` and
  eight at `6tdt`, each hinted from its start, gave steps of the first two
  techniques only (304 steps); the later techniques all appeared on boards
  dealt at `6tdb`, `6tdh` and `6tde`, odd regions on `6tde` alone of the
  twenty-two.
- **A third number is not highlighted** while both slots are full
  (`src/games/dominosa/index.ts:99-106`), and a digit above `n` is declined.
  "A right-click on a number or a digit key toggles a value highlight" says
  "one of two" slots and no more. The help's "up to two numbers can be
  highlighted at once" is the same. Counted as stated.
- The set-analysis requirements were written from
  `src/games/dominosa/solver.ts:474-590` with no board to quote, and the
  review held their three cases (no pair the double could cover; one domino
  fewer than squares; as many as squares) against the `ruleOutNondoubles` /
  `minNusedForDouble` branches there: they agree. The size limit at `:553`
  (`ndominoes <= 1 || ndominoes >= nsq - 1`) binds the groups with doubles
  too, which the second requirement did not say and now does. Their
  scenarios are composed positions and were not run; the technique itself
  gave 110 steps on the fourteen boards dealt at `6tdh` and `6tde`.
- **A scenario's condition that could not fail was removed.** "Two squares
  forced to share a domino" said "no 0–3 spot covers both 0s", which no spot
  of a 0–3 domino can. The clause in the requirement ("none of them covering
  both") is the code's (`solver.ts:429-432`) and bites only where the two
  squares are neighbors showing the domino's two numbers.
