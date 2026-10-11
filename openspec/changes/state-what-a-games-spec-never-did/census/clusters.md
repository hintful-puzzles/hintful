# clusters

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: one letter a dot, its offset the blanks before it, its case the color, `z`/`Z` a skip of twenty-five | stated | "Clusters descriptions use the upstream run-length dot encoding" |
| desc | what the parser refuses: too short, too long, another character | stated | "Clusters descriptions use the upstream run-length dot encoding" |
| desc | what the parser refuses: an uppercase closing letter, a skip in the other case from its dot | gap | "A Clusters description closes in lowercase and keeps a skip in its dot's case" (new) |
| desc | `supersededDesc` | not-owed | The game has none (`facts.json`: `supersededDesc: false`) |
| params | `{w}x{h}`, a bare number being square | stated | "Clusters' parameters are a width, a height and a difficulty" |
| params | the `d` letter and the tier letters `e`, `t` | gap | "Clusters writes its difficulty as `de` or `dt`" (new) |
| params | what the short form leaves out: the difficulty | gap | "Clusters writes its difficulty as `de` or `dt`" (new); that an ID without one decodes to Easy is "Clusters' parameters are a width, a height and a difficulty" |
| params | a tier letter the game does not know | stated | "Clusters' parameters are a width, a height and a difficulty" |
| params | refusal: area of 10000 or more, area under 2, a board within 2×2 | stated | "Clusters refuses a board size that has no puzzle" |
| params | refusal: Normal on a board under twelve squares or one square wide | stated | "Clusters refuses to generate Normal on a board too small for it" |
| pref | (none) | not-owed | The game has none (`facts.json`: `prefs: []`) |
| control | left click: blue, then red, then clear; right click: red, then blue, then clear | stated | "Clusters is painted by click, drag and keyboard cursor" |
| control | a drag paints every square it passes the color the press gave the first | stated | "Clusters is painted by click, drag and keyboard cursor" |
| control | a given dot is never overwritten | stated | "Clusters is painted by click, drag and keyboard cursor" |
| control | Enter and Space at the cursor, and the first select key only showing it | not-owed | `engine-input`: "The engine owns a declaring game's press and select keys" |
| control | the plain arrows move and reveal the cursor | not-owed | `engine-input`: "One arrow press reveals the cursor and moves it" |
| control | `1`, `0` or `2`, Backspace or Delete at the cursor | gap | "Clusters' number keys set the cursor's square outright" (new) |
| control | Shift, Ctrl and both with an arrow | gap | "An arrow with Shift or Ctrl paints the squares the cursor leaves and enters" (new) |
| control | `requestKeys` / the keypad | not-owed | The game has none (`facts.json`: `keypad: null`) |
| hint | rung `direct`: the other color breaks a rule at once (sealed off, a dot's second neighbor, cannot touch two) | stated | "A Clusters hint step names the rule the other color would break" |
| hint | rung `chain`: the other color breaks a rule after the squares it forces | stated | "A lookahead deduction is one step showing its whole forcing chain" |
| hint | the order: `direct` wherever it fires, `chain` only where it stalls, the shortest chain first | stated | "A lookahead stall takes the shortest forcing chain"; "Clusters provides an explained deduction hint" |
| hint | the marks: the ringed target, the outlined tile, the numbered what-if pieces | stated | "A Clusters hint shows its reasoning on the board"; "A lookahead deduction is one step showing its whole forcing chain" |
| hint | the refusals | stated | "A Clusters hint is refused where it cannot deduce" |
| words | the status bar | not-owed | The game has none (`facts.json`: `statusbar: false`) |
| words | the preset titles | not-owed | `engine-params`: "One describer labels every params set" |

## Defects

None. `help/games/clusters.md:13` gives Shift the second color and Ctrl the
first, as `src/games/clusters/index.ts:255` does.

## Notes

- **A modified arrow acts on a hidden cursor, against `engine-input`.**
  `src/games/clusters/index.ts:244-268` moves the cursor, shows it and paints
  in one press, whether or not the cursor was showing: on `DceclHbAacAg` with
  a fresh `Ui`, Shift with Right answers a `paint` of squares 0 and 1 (run
  2026-10-11). `engine-input`'s "One arrow press reveals the cursor and moves
  it" says an arrow that is itself an action "SHALL NOT be required to act on
  a first press on a hidden cursor ... it reveals instead", and its scenario
  leaves the board unchanged "in a game that reveals before acting". Clusters
  is not such a game: it paints where the player could not see the cursor
  was. The new requirement states what the code does, the hidden case
  included. Which of the two gives way is the engine's to settle once for
  every game with a marking arrow; if Clusters is changed to reveal first,
  the requirement's last sentence and its "first press" scenario change with
  it.
- **The closing-letter and skip-case rules are `engine/dot-runs.ts`'s**, which
  Unruly's givens share letter for letter. No capability states that
  grammar, so each of the two games' specs has to: an `engine-params`
  requirement beside "The engine provides the two desc value alphabets" would
  state it once.
- The spec calls the two colors blue and red, upstream's names, and the help
  page and the hint call them by the palette's pair (`{{pair:0}}`,
  `{{pair:1}}`). Blue is the pair's first member, the left button's. The new
  requirements keep the spec's words.
- `validateParams` itself answers null for an unknown tier letter (`7x7dx`
  decodes to a tier past the last and passes it, run 2026-10-11); the refusal
  the spec promises is the engine's check of the field
  (`engine-params`: "Params validity is the engine's check").
