# loopy

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the clue string: a digit or `A`-`Z` per clue, `a`-`z` per run of unclued faces | stated | "Loopy descriptions use the upstream run-length encoding" |
| desc | the grid part and its `_` separator | gap | "A Loopy description's grid part ends at the first underscore" (new) |
| desc | refusal: too short, too long, an unknown character | stated | "Loopy validates a description against the grid's face count" |
| desc | refusal: a grid part the tiling does not take, a missing one, a patch with no face left | gap | "A Loopy description's grid part ends at the first underscore" (new) |
| desc | `supersededDesc` | not-owed | Loopy has none (`facts.json`: `supersededDesc` false) |
| params | the size, `<w>x<h>` (Width, Height) and the lone-size form | gap | "Loopy's params are a size, t with a grid index, and d with a tier letter" (new) |
| params | the `t` segment (Grid type) | gap | "Loopy's params are a size, t with a grid index, and d with a tier letter" (new); the index's meaning is stated in "Loopy's grid ordering is the wire format" |
| params | the `d` segment and its letters `e` `n` `t` `h` (Difficulty), left out of the short form | gap | "Loopy's params are a size, t with a grid index, and d with a tier letter" (new) |
| params | refusal: a side under the tiling's `amin`, both under its `omin` | stated | "Loopy enforces each tiling's minimum size" |
| params | refusal: Penrose (kite/dart) narrower than 4 | stated | "Loopy enforces each tiling's minimum size" |
| params | refusal: Normal on the three-rhomb Penrose (rhombs) sizes | stated | "Where no patch reaches its size, Loopy deals the largest drawn" |
| params | refusal: a size not positive or too large to build | not-owed | `grid`: "Grid parameter validation", which Loopy's `validateParams` passes on, as "Loopy enforces each tiling's minimum size" says |
| pref | `draw-faint-lines` | gap | "Loopy offers auto-follow and faint-line preferences" (modified) |
| pref | `auto-follow`: its key, choices and default | gap | "Loopy offers auto-follow and faint-line preferences" (modified) |
| pref | `auto-follow`: how far a click is extended under each setting | gap | "Auto-follow goes on while one edge leads on in the clicked edge's state" (new) |
| pref | `auto-rule-out`: its key and default | gap | "Loopy offers auto-follow and faint-line preferences" (modified); what it does is stated in "Loopy rules out the edges counting has settled" |
| pref | the pencil preferences (`sticky-pencil-mode`, `pencil-keep-highlight`, `hint-notes`), which Loopy does not offer | gap | "Loopy offers auto-follow and faint-line preferences" (modified) |
| control | left button or tap on an edge | stated | "Each button sets its own state and clears a decided edge" |
| control | right button or long press on an edge | stated | "Each button sets its own state and clears a decided edge" |
| control | a drag outside notes mode | gap | "A drag outside notes mode repeats the press along the edges it passes" (new) |
| control | the hover highlight | stated | "Loopy shows which lines are joined to the one under the pointer" |
| control | arrow keys | stated | "A plain arrow walks Loopy's cursor along an edge" |
| control | Shift+arrow | stated | "A Shift+arrow aims Loopy's cursor without moving it" |
| control | Enter, Space, the erase key outside notes mode | stated | "Enter, Space and the erase key act on Loopy's chosen edge" |
| control | Escape, and a click hiding the cursor | stated | "Enter, Space and the erase key act on Loopy's chosen edge"; "The keyboard notes corners and pairs at the cursor" |
| control | the Marks key and P toggling notes mode | not-owed | `engine-notes`: "An offered Marks key is never inert"; "Loopy notes corners and pairs" names the mode as `ui.pencilMode` |
| control | a tap in a corner, notes mode | stated | "A tap cycles a corner note and a drag cycles a pair note" |
| control | a drag from edge to edge, notes mode | stated | "A tap cycles a corner note and a drag cycles a pair note" |
| control | the right button or a held finger, notes mode | stated | "Each button cycles a note its own way" |
| control | Enter, the erase key, Space and Escape, notes mode | stated | "The keyboard notes corners and pairs at the cursor" |
| control | a notes-mode key with the cursor hidden or no edge chosen; Space on the pinned edge; which way a keyboard pair cycles | gap | "A notes-mode key with no edge chosen only shows the cursor" (new) |
| control | the on-screen keypad | not-owed | Loopy has no `requestKeys` (`facts.json`: `keypad` null); `engine-notes`: "The engine gives every note-taking game its Marks key" |
| hint | `clueFull` | gap | "A clue's count settles its open edges" (new) |
| hint | `clueStarved` | gap | "A clue's count settles its open edges" (new) |
| hint | `clueOneShort` | gap | "A clue's count settles its open edges" (new) |
| hint | `clueBlockedPair` | stated | "Loopy settles a blocked corner pair in one deduction"; "The hint narrates a blocked pair as one step" |
| hint | `deadEnd` | gap | "A dot's count settles its open edges" (new) |
| hint | `lineContinues` | gap | "A dot's count settles its open edges" (new) |
| hint | `dotFull` | gap | "A dot's count settles its open edges" (new) |
| hint | `clueBound` | gap | "From Normal, a clue's other edges decide an edge" (new) |
| hint | `corner` | gap | "A noted corner settles its edges against its dot's lines" (new) |
| hint | `cornerExit` | gap | "A noted corner settles its edges against its dot's lines" (new) |
| hint | `matchingPair` | gap | "At Hard, a noted pair settles an edge" (new) |
| hint | `parity` | gap | "At Hard, a noted pair settles an edge" (new) |
| hint | `related` | gap | "At Hard, a noted pair settles an edge" (new) |
| hint | `earlyLoop` | gap | "An edge that would close a loop is settled by what the loop leaves out" (new) |
| hint | `closesLoop` | gap | "An edge that would close a loop is settled by what the loop leaves out" (new) |
| hint | `cornerAtDot` | gap | "The hint notes a corner from its dot, from a clue, or from the corner across" (new) |
| hint | `cornerFromClue` | gap | "The hint notes a corner from its dot, from a clue, or from the corner across" (new) |
| hint | `cornerAcross` | gap | "The hint notes a corner from its dot, from a clue, or from the corner across" (new) |
| hint | `cornerOppositeExit` | gap | "The hint notes a corner from its dot, from a clue, or from the corner across" (new) |
| hint | `cornerFromPair` | gap | "A corner of exactly one line and a pair of opposites are noted from each other" (new) |
| hint | `pairAtClue` | gap | "The hint notes a pair from a count that leaves two edges, or four with a pair among them" (new) |
| hint | `pairAtDot` | gap | "The hint notes a pair from a count that leaves two edges, or four with a pair among them" (new) |
| hint | `pairAtCorner` | gap | "A corner of exactly one line and a pair of opposites are noted from each other" (new) |
| hint | `pairAcrossClue` | gap | "The hint notes a pair from a count that leaves two edges, or four with a pair among them" (new) |
| hint | `pairAcrossDot` | gap | "The hint notes a pair from a count that leaves two edges, or four with a pair among them" (new) |
| hint | `pairChain` | gap | "The hint notes a pair from a count that leaves two edges, or four with a pair among them" (new); the one-link-at-a-time rule is stated in "A hint step cites only notes on the board, and at most two pairs" |
| hint | the order: tier by tier | stated | "The hint plan is the solver's own rungs, easiest tier first" |
| hint | the order within a tier, and which tier has which technique | gap | "Within a tier the hint counts first and closes loops last" (new) |
| hint | where a note step sits in the plan | not-owed | `engine-hints`: "A note a hint asks for is placed beside the step that uses it", "A note is never offered with a false explanation" |
| hint | Loopy's own sentence on where a note step sits said otherwise | gap | "A fact a hinted line rests on is first placed as a note" (corrected) |
| hint | what a step marks | stated | "A hint step marks what it sets and what its sentence names" |
| hint | what move follows a step (`hintKeepTrack`) | gap | "A move that takes a hint step with the aids on still follows it" (new) |
| hint | refusal on a wrong mark | stated | "Loopy checks notes against its solution"; `engine-hints`: "The midend SHALL refuse a hint on a finished or wrong board before asking the game" |
| hint | refusal when no line follows, or the marks contradict | not-owed | `engine-hints`: "The refusals distinguish the situations a player must tell apart" |
| words | the status bar | not-owed | Loopy has no `statusbarText` (`facts.json`: `statusbar` false) |
| words | preset titles, `{w}x{h}` then the tiling then the tier | stated | "Loopy's presets draw tall, read width first, and turn where the tiling allows" |
| words | the "More..." submenu title | gap | "A submenu titled More... holds the presets of further tilings" (new) |

## Defects

- The help says of a keyboard pair "walk to another edge and press **Space**
  again to note the pair, and keep pressing on a pair to cycle it"
  (`help/games/loopy.md:72-73`). The code releases the pin when it notes the
  pair, so the next Space pins the edge the cursor is on and cycles nothing;
  the pair cycles only when Space is then pressed on the other edge
  (`src/games/loopy/index.ts:427-434`). "A notes-mode key with no edge chosen
  only shows the cursor" states what the code does.

## Notes

- The Hats description quoted in "A Loopy description's grid part ends at the
  first underscore" is not in `facts.json` and no test of Loopy holds a
  description with a grid part as a literal. It was dealt for this census by
  `newDesc(decodeParams("9x11t16dh"), randomNew("facts-loopy"))`, the Hats
  preset of `facts.json` under its seed, and loaded back through `newState`
  (56 faces, grid description `1,1,10,10,4,H`). The Squares description is
  `facts.json`'s.
- `decodeParams("7x7t18de")` yields a grid index past `LOOPY_GRIDS`, and
  Loopy's own `validateParams` then throws ("Cannot destructure property
  'amin'") instead of refusing. The engine refuses a choice outside its list
  before it calls the game's `validateParams` (`src/engine/game.ts:189-190`),
  so a player does not reach the throw; a caller of the game's function alone
  does.
- Loopy's tier letters are `e` `n` `t` `h`, so `h` is Hard here, where Keen's
  `h` is Tricky. The letters are each game's own; nothing in `engine-params`
  or `engine-difficulty` gives a tier a letter, so every tiered game's spec
  owes its own table.
- The existing "Loopy offers auto-follow and faint-line preferences" names the
  two preferences without their `kw`, and "Loopy rules out the edges counting
  has settled" names the third without its. A new requirement beside them
  said twice that the two exist, so the keys, the defaults and the absence of
  the pencil preferences are a `MODIFIED` entry of the first, which keeps its
  sentence and its scenario word for word. "Loopy rules out the edges
  counting has settled" is left as it is: its body has no room for the key,
  and the modified requirement names `auto-rule-out` as the third of `prefs`.
- "A fact a hinted line rests on is first placed as a note" says a note step
  is placed "at the point in the plan where the fact was found". The code
  places it as late as its sentence stays true, beside the line that uses it
  where the board allows (`planSteps` in `src/games/loopy/hint.ts`), which is
  what `engine-hints` "A note a hint asks for is placed beside the step that
  uses it" and "A note is never offered with a false explanation" require.
  The Loopy sentence contradicts those two and the code, so a `MODIFIED`
  entry restates the requirement without the clause.
- The scenario sentences of the hint requirements were read off
  `src/games/loopy/hint-text.ts`. On 2026-10-11 `hint()` was followed to the
  end of 63 dealt boards (Squares at each tier, and Hard boards of
  Triangular, Honeycomb, Snub-Square, Cairo, Octagonal, Kites, Floret and
  Dodecagonal): every board was finished, and every quoted sentence was
  spoken word for word but two. `closesLoop` and `related` fired on none of
  the 63, because a count settles the last edge, or the paired edge, first.
  Their two sentences were produced on built positions: three sides of an
  inner square drawn on a 7x7 Squares board with no clue, and a ruled-out
  edge noted as the opposite of a far one on the same board. 63 boards
  finding none says the two are rare, not that they are dead.
- The two bound-count scenarios hold: the count's sentence cites a corner
  whenever a corner note changed the count (`boundWitness` in
  `src/games/loopy/solver.ts`), and both sentences were spoken on dealt
  boards.
- The drag scenario said the edges branching off at the dots a drag passes
  "are left as they were". With `auto-rule-out` on, the default, the dots'
  second lines rule them out in the same move; run through a `Midend` both
  ways, the drag itself takes none of them. The scenario now says both.
- The Hats description reproduces from the seed named above and loads; with
  its grid part removed, and the Squares description with `_` put before it,
  are both refused with "This game ID isn't laid out the way this puzzle's
  game IDs are."
