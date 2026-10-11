# net

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: a hex digit a tile, `v` and `h` for its barriers | gap | "Net descriptions are a hex digit a tile, with its barriers" (new) |
| desc | what the parser refuses | gap | "Net descriptions are a hex digit a tile, with its barriers" (new) |
| desc | a wrapping board walled all round plays as one that does not wrap | stated | "The source and origin are movable Ui state" |
| desc | `supersededDesc` | not-owed | The game has none (`facts.json`: `supersededDesc: false`) |
| params | `{w}x{h}`, the `w` letter, the `b` segment, the `d` letter with `e` and `u` | stated | "Net's params and their encoding" |
| params | what the short form leaves out: `b` and the difficulty | stated | "Net's params and their encoding" |
| params | upstream's `a` letter, skipped | stated | "Net's params and their encoding" |
| params | a bare `{w}` being square | not-owed | `engine-params`: "The engine provides a shared dimension param parser" (see Notes: the game parses the prefix itself) |
| params | refusal: a wrapping board with a side of 2, when dealing | stated | "Net's params and their encoding" |
| params | refusal: a 1×1 grid, more than a million squares | gap | "Net refuses a single square and a grid past a million squares" (new) |
| params | refusal: a side below 1, a barrier probability outside 0 to 1 | not-owed | `engine-params`: "Params validity is the engine's check" (the fields' declared bounds) |
| params | refusal: Unreasonable where no board needs it | stated | "Net refuses Unreasonable where no board needs it" |
| params | refusal: Unreasonable past its measured bounds | stated | "Unreasonable Net is bounded on its own measurements" |
| params | refusal: Unreasonable without wrapping where too rare | stated | "Net refuses Unreasonable without wrapping where it is too rare" |
| pref | `unlocked-loops` | gap | "Net's one preference keeps loop highlighting to locked squares" (new) |
| control | left click or `A`, right click or `D`, `F`, `S` | stated | "Tiles rotate and lock" |
| control | a click off a tile, in the gutter or on a locked tile | stated | "A Net click off a tile or on a locked tile makes no move, and a turn back is a move" |
| control | Enter and Space at the cursor outside notes mode, and the first select key only showing it | not-owed | `engine-input`: "The engine owns a declaring game's press and select keys" |
| control | the half turn by two taps | not-owed | `engine-input`: "A pointer route is a repeat, a cycle or a notes-mode press" |
| control | the arrows, which wrap at every edge | gap | "Net's cursor wraps round the grid" (new) |
| control | Ctrl+arrow, Shift+arrow | stated | "The source and origin are movable Ui state" |
| control | the Marks key and `P` | not-owed | `engine-notes`: "The engine gives every note-taking game its Marks key" |
| control | notes mode: a tap by a side, a tap in the middle | stated | "The pointer notes the side a tap lands nearest"; "Tiles rotate and lock" |
| control | notes mode: a drag | gap | "A notes-mode drag repeats its note or its lock" (new) |
| control | notes mode: select, select on a neighbor, Escape | stated | "The keyboard notes the side between two tiles" |
| control | a wall takes no note | stated | "Net takes side notes" |
| control | the Source key and `C`, the tap after it, Escape | stated | "The Source key arms a tap that moves the source" |
| control | the Jumble key and `J` | stated | "Jumble is deterministic on replay" |
| control | a margin drag on a wrapping grid | stated | "A margin drag scrolls a wrapping grid" |
| hint | what a step adds: a note or a lock | stated | "Net's hint reasons from notes, locks and walls" |
| hint | rung `side`: a known side contradicted | stated | "A way of turning is ruled out for four reasons only" |
| hint | rung `loop`: a loop through known wires | stated | "A way of turning is ruled out for four reasons only" |
| hint | rung `sealed`: a group sealed off, and how far a wire is followed | stated | "Net's hint follows a wire through tiles not settled yet"; "A hint says when a wire only leads into open tiles" |
| hint | rung `neighbor`: a tile beside it left no way | stated | "A turning that leaves the tile beside it no way is ruled out" |
| hint | the order the steps are taken in | gap | "Net's hint takes the easiest step first" (new); two parts of it were stated, in "A hint says when a wire only leads into open tiles" and "A turning that leaves the tile beside it no way is ruled out" |
| hint | a lock that needs a turn | stated | "A hint's lock is one journey of the turn and the lock" |
| hint | the refusal where nothing is forced | stated | "Net's hint stops where its deductions do" |
| words | the status bar: the count | gap | "Net's status bar counts the squares lit" (new) |
| words | the status bar: Source mode's sentence | gap | "Net's status bar counts the squares lit" (new); that it says something is "The Source key arms a tap that moves the source" |
| words | the preset titles | not-owed | `engine-params`: "One describer labels every params set" |

## Defects

None. `help/games/net.md:18-22` gives the source, the scroll and the jumble
as `src/games/net/index.ts:587-667` has them, and `help/games/net.md:34-43`
the notes-mode presses, drags and keys as `src/games/net/index.ts:391`
(`noteVerbs`) and `:439` (`noteInput`) have them.

## Notes

- **The desc codec is `engine/wires.ts`'s, shared with Netslide**, whose spec
  already states it ("Netslide descriptions encode wires and barriers"). No
  engine capability states it, so both games' specs do; the Net requirement
  adds what Netslide's leaves out, that `v` comes before `h` and that both
  digits are lowercase. One requirement in an engine capability would serve
  both.
- **`decodeParams` parses its `{w}x{h}` prefix itself**
  (`src/games/net/state.ts:85-95`), against `engine-params`'s "The engine
  provides a shared dimension param parser". The behavior is the same.
- **Net's arrows wrap on a grid that does not** (run 2026-10-11: Left from
  0,0 on a 5×5 lands on 4,0). `engine-input`'s "A target and its cursor
  belong to the geometry" leaves the arrows to the game, so this is a rule of
  Net's own and is stated; whether it is wanted on a bounded grid is the
  owner's to say.
- **The saved `Ui` is `O{x},{y};C{x},{y}`**, the origin and the source
  (`src/games/net/index.ts:724-728`). "The source and origin are movable Ui
  state" says they survive a save and not how they are written; the brief's
  kinds have no row for a save field, so none was written.
- The barrier probability is kept in single precision and written as C's
  `%g` (`src/games/net/state.ts:76`, `:106`), which is why a board's ID
  names the same board again. The spec's `b{prob}` does not say so.
- "Net's hint stops where its deductions do" calls the reasons "its four
  reasons"; the order requirement keeps the six steps of difficulty the code
  ranks them in (`src/games/net/deduce.ts:411-421`), two of the four reasons
  each having an easier and a harder form.
