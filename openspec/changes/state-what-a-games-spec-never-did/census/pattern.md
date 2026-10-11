# pattern

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: column clues then row clues, `/` between lines, `.` between runs | stated | "Pattern descriptions are slash-separated clue lists" |
| desc | the `,` suffix of immutable squares | stated | "A Pattern description's suffix of immutable clue squares is read" |
| desc | what the parser refuses | stated | "A malformed Pattern description is refused" |
| desc | `supersededDesc` | not-owed | The game has none (`facts.json`: `supersededDesc: false`) |
| params | `{w}x{h}` and the `d` letter with `e` and `u` | stated | "Pattern's parameters are a size and a difficulty" |
| params | what the short form leaves out: the difficulty | stated | "Pattern's parameters are a size and a difficulty" |
| params | a bare `{w}` being square | stated | "Pattern's parameters are a size and a difficulty" |
| params | refusal: a side below 1, an area too large | stated | "Pattern's parameters are a size and a difficulty" |
| params | refusal: Unreasonable on a strip or up to 3×3 | stated | "Pattern refuses Unreasonable at a size none of whose boards needs it" |
| pref | (none) | not-owed | The game has none (`facts.json`: `prefs: []`) |
| control | a press cycles the square, the right button the other way | stated | "A Pattern press cycles the pressed cell and begins a drag" |
| control | a drag along a row or column, and an erasing drag over a rectangle | stated | "Pattern accepts drag-fill rectangle and cursor input" |
| control | a paint drag leaves placed marks | stated | "A multi-cell paint drag leaves placed marks" |
| control | Enter and Space at the cursor | stated | "Pattern's keyboard paints and cycles as the pointer does" |
| control | Ctrl, Shift and both with an arrow | stated | "Pattern's keyboard paints and cycles as the pointer does" |
| control | the arrows move and reveal the cursor | not-owed | `engine-input`: "One arrow press reveals the cursor and moves it" |
| control | `requestKeys` / the keypad | not-owed | The game has none (`facts.json`: `keypad: null`) |
| hint | rungs `overlap`, `unreachable` and `lineEmpty`: what each concludes and from what | gap | "A Pattern run's overlap is shaded, and a cell no run reaches is clear" (new); "Pattern provides an explained, deductive hint" names the three and does not say what follows from each |
| hint | rung `intersection`: every fit of the line agrees | stated | "The single-line intersection is Pattern's bottom rung" |
| hint | the order: which line, which technique on it | gap | "Pattern's hint takes the first line a named technique decides" (new); that the intersection comes last is "The single-line intersection is Pattern's bottom rung" |
| hint | one deduction is one step of several cells | stated | "One Pattern line deduction is one multi-cell step" |
| hint | the voice of a sentence | stated | "Pattern's narration leads with the indication and concludes by necessity" |
| hint | the marks | stated | "Pattern hint color legend"; "Pattern's hint premises follow the element-type legend" |
| hint | the refusal where no line forces a cell | stated | "A Pattern hint never reveals the solution or searches" |
| words | the status bar | not-owed | The game has none (`facts.json`: `statusbar: false`) |
| words | the preset titles | not-owed | `engine-params`: "One describer labels every params set" |

## Defects

None. `help/games/pattern.md:35-41` names three ideas, overlap, out of reach
and every fit agreeing, as `src/games/pattern/solver.ts:624-752` has them.

## Notes

- **The help does not name the line with no clues.** The hint has a sentence
  of its own for it (`src/games/pattern/solver.ts:632-643`, rung
  `lineEmpty`); `help/games/pattern.md:35-41` lists three ideas and leaves it
  to "Out of reach", which it is a case of. Not a disagreement. A dealt board
  can have such a line: a row or column with nothing shaded.
- "One Pattern line deduction is one multi-cell step" says a deduction that
  forces several cells is one step. The step is one unbroken stretch of one
  run's overlap, so a run whose overlap is already shaded in the middle
  gives two steps, one each side
  (`src/games/pattern/solver.ts:650-663`, `:690-701`). The new requirement
  says "one unbroken stretch"; the existing one reads as more than that.
- The area bound is `Number.MAX_SAFE_INTEGER`
  (`src/games/pattern/state.ts:173`), far past any board that could be dealt or
  drawn; "unreasonably large" in the spec is the engine's sentence and no
  working limit.
