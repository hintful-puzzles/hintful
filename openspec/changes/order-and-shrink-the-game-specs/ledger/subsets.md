# subsets

The Purpose is unchanged: each thing it names the spec still holds.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Subsets is solved when every set is placed once and every clue holds | "and flashes" cut from its scenario, retitled "Completing the grid wins"; sentences untouched | `ts-engine`, "The win flash plays on a forward move that solves the board" |
| Params: Subsets' parameters | retitled "Params: Subsets accepts only the 4×4 board over four letters". Kept: what the parameters are and the one board validation accepts. "There SHALL be one preset per tier" joined "Params: A Subsets preset is titled by its board and its tier". Cut: that a game ID encodes the four and round-trips, that each tier encodes to a distinct ID, and that a difficulty character naming no tier is refused. Scenarios "A game ID round-trips through the parameters" and "An unrecognized difficulty character is rejected" dropped; "Unsupported parameters are rejected" kept | this spec, "Params: Subsets params are written `4x4n4` and a difficulty letter" (the four pieces, `e` and `t`); `engine-params`, "Encode and decode are mutual inverses over the corpus" and "A params string is read whole or refused" ("A letter after a tag that the tag does not list … SHALL each be refused, and none SHALL be read as a default"; its scenario "A difficulty letter the game does not have"); `paramsLetter` in `decodeParams`, `src/games/subsets/state.ts:197`; `src/games/subsets/subsets.test.ts:153` and `:161` hold the round trip and the distinct IDs |
| Params: A Subsets preset is titled by its board and its tier | first sentence gains "one preset for each tier", from "Params: Subsets' parameters" | |
| Generation: A board above the lowest tier is not solved by the tier below | retitled "Generation: A Subsets candidate the tier below solves is redrawn whole". "the generator SHALL also reject a candidate board that the tier below already solves" reworded to the condition of the sentence after it ("Where a candidate board above the lowest tier is one the tier below already solves"); that it redraws a wholly fresh board, and why, kept. Scenario kept | `engine-difficulty`, "A difficulty tier binds the board it generates" (not solvable one tier down); `src/games/subsets/generator.ts:99` |
| Controls: Subsets is played by toggling letter slots | retitled "Controls: Subsets' verbs cycle one letter slot, and a given slot does not change". "A left-click or select", "a right-click or secondary select" and "Backspace" became the primary, secondary and key-only verbs of `targetVerbs`, which the requirement names; the cycles, which tie the spec's unknown, known and cleared to the verbs, and the given slot kept. Scenario kept | `targetVerbs`, `src/games/subsets/index.ts:367` (`primary` `:375`, `secondary` `:391`, `keyOnly` with `ERASE_KEYS` `:397`, `sweep` `:383`); `engine-input`, "The engine owns a declaring game's press and select keys" and "A drag on from a press repeats the press" |
| Hint: Subsets provides an explained hint | removed. Scenario "A hidden single is shown with its placement spotlight" moves, unchanged, to "Hint: The Subsets hint reads the horseshoes before it counts sets"; "A hint narrates an arrow deduction" and "A mistaken board is refused honestly" dropped | the `Game` type (`hint`); `engine-hints`, "A hint is deduced from the board in play" and "A hint step always names a technique, with no un-narrated fallback"; that the plan rests on marks and rule-outs is this spec's "Hint: A hint step rests only on what the board shows"; the refusal is `engine-hints`, "The midend SHALL refuse a hint on a finished or wrong board before asking the game" (the mistakes put on the overlay). The arrow deduction is this spec's "Hint: The Subsets hint carries a letter across a horseshoe" |
| Hint: The Subsets hint carries a letter across a horseshoe | "The step SHALL ring the letter it decides and outline the cell across the horseshoe, and" cut; that several letters from one horseshoe are one journey kept. Scenario kept | `hintMarks.roles`, `src/games/subsets/index.ts:733` (`ring`: "the one letter position it marks present or clears"; `outline`: "the neighbor across a horseshoe") |
| Hint: The Subsets hint reads the horseshoes before it counts sets | gains scenario "A hidden single is shown with its placement spotlight" | |
| Look: What Subsets draws | retitled "Look: Subsets draws its letter slots, its horseshoes and a tally of every set". Cut: "The board SHALL be formattable as text", "and a completion flash", "There SHALL be no move animation". Scenario kept | the `Game` type (`textFormat`, `src/games/subsets/index.ts:745`); `animLength: () => 0`, `:753`; the flash is this spec's "Look: The Subsets completion flash fills a cell's slots together" and `ts-engine`, "The win flash is one traveling highlight in every game" |
| Look: A slot's surface says who decided its cell | the clause "with the collection's surface grid line between the slots of a cell" cut; scenario kept | the palette, `out[COL_GRID] = surfaceGrid(background)`, `src/games/subsets/render.ts:127` |
| Look: The Subsets completion flash fills a cell's slots together | "SHALL sweep the cells diagonally" and "Every slot of a lit cell SHALL be filled with a flash color and keep its letter or cross … whether the player filled it or the puzzle gave it" cut; that the position is the cell's and not the slot's, so a cell lights as one piece, kept. Scenario kept | `ts-engine`, "A game gives each element a position, and the route is which position it gives" (`sweepStep`, `src/games/subsets/render.ts:342`); `engine-colors`, "A solved flash drawn as a color takes a shared color" (the ground filled, what it holds kept; its scenario "A board that lifts its cells") |

## Kept, and why

- **Params, "Parameters SHALL be a width, a height, a universe size `n` and a
  difficulty tier".** `paramConfig` declares the tier alone, so nothing else
  says what the other three pieces of a params string are.
- **Params: The Custom dialog offers the tier alone.** It is the field list of
  `paramConfig`, and it is a departure with its reason: the params hold three
  values the dialog has no field for.
- **Params: Subsets params are written `4x4n4` and a difficulty letter** and
  **A Subsets preset is titled by its board and its tier.** `encodeParams`,
  `decodeParams` and `presets` are written out by hand
  (`src/games/subsets/state.ts:160` to `:202`), titles included.
- **Generation: The higher tier adds the mirror half of the advanced arrow
  rule.** What the tier means; its scenario is the collection's guarantee and
  is the one case the requirement has.
- **Solver: The solver takes an explicit difficulty cap.** "`solve`,
  `findMistakes` and `hint` SHALL run at the top tier whatever tier the board
  states" reads like a rule of the collection and no engine capability states
  it (see the engine requests).
- **Hint: The hint narrates every deduction the solver may use.**
  `engine-hints`, "A game narrates every deduction or rejects the board at
  generation", offers two strategies; this says which is Subsets'.
- **Hint: The Subsets hint reads the horseshoes before it counts sets.**
  `hintRungs` lists the kinds, and nothing reads it for order: the order is
  the recorder's own loop in `src/games/subsets/solver.ts`.
- **Hint: Touching the reference aid dismisses a displayed hint.**
  `uiUpdateClearsHint`, `src/games/subsets/index.ts:703`, is a function of
  the game's own.
- **Look: Subsets tells a slot's state by a letter, a cross or nothing** and
  **A used-up entry takes the used-up clue color.** The palette names the
  colors; which state or entry takes which is `redraw`'s.

## Engine requests

- Solve and the mistake check solve once at the top cap, whatever tier the
  board states → `engine-difficulty`, beside "A difficulty-capped solver is
  monotone in its cap at every tier", which says a board solved at one cap
  solves at every cap above and not what a consumer of an unknown tier asks.
  The sentence is "`solve`, `findMistakes` and `hint` SHALL run at the top
  tier whatever tier the board states", in "Solver: The solver takes an
  explicit difficulty cap" (Subsets says it of the hint as well); here the
  top tier is the default cap of the helper `solve` and `findMistakes` call
  and of the recorder (`maxdiff: number = DIFF_NORMAL`,
  `src/games/subsets/solver.ts:471` and `:1080`).

## Found

- **"Hint: A Subsets hint refuses a letter the answer does not have" is of
  `hint` called directly.** Through the app a wrong letter is a mistake
  ("Rules: Subsets flags mistakes for Check & Save"), so the midend refuses
  first, with its own sentence and the mistake overlay, and `hint` is not
  asked; the removed scenario "A mistaken board is refused honestly" described
  that. The game's `CONTRADICTION_UNLOCALIZED` (`src/games/subsets/index.ts:598`)
  is reached by a player only where the mistake check finds nothing and the
  deduction still contradicts.
- "Controls: The keyboard cursor walks the letter slots" and the six
  reference-aid requirements say "left-click", "tap" and "press" for one
  input; the cut left them, since each is an arm of `interpretMove`.
- "Controls: Subsets offers a two-way placement reference aid" is filed under
  `Controls` and states what the aid judges from, not an input.
- The spec never said a drag repeats a press over slots holding the same
  state (`sweep`, `src/games/subsets/index.ts:383`). It is a declaration, and
  the `Controls` requirement names `targetVerbs`.
- The key-only verb's `does` string says "leave the number under the cursor
  undecided" of a letter slot (`src/games/subsets/index.ts:399`); the help
  page's generated Controls paragraph carries it. **Verified true in
  review**: the string is at that line, the verb's target is a letter slot
  (`setSlot(() => "unknown")`, `:401`), and the other two verbs' strings say
  "it" and "that cell's set". The slots hold the letters A to D and no
  number. A player reads it in the help page's Controls list.

Verified in review, of the first item above: **true**. On a board the
top-tier solver completes, `findMistakes` reports every letter marked or
crossed out against the solution (`src/games/subsets/solver.ts:432`-`:447`),
so the midend refuses with "Fix the highlighted mistakes first; a hint can't
deduce from a wrong board." and never asks `hint`. Every dealt board is such
a board. `hint`'s own refusal (`src/games/subsets/index.ts:598`, where the
plan's status is invalid) reaches a player only on a board the solver leaves
unfinished, which a pasted description can be: there `findMistakes` has no
solution to compare with. So the scenario "A letter marked where the answer
has none" of "Hint: A Subsets hint refuses a letter the answer does not
have" gives the sentence `hint` returns when called directly; in the app the
player on that board reads the midend's sentence and sees the B highlighted.
The requirement was left as it stood.

## Review

11 rows read, each against the declaration or the requirement it names, read
whole; 3 corrected in the spec, no sentence restored.

Changed. Each of these was a copy swapped for a pointer inside a subject that
says plenty of the game's own, and is now a plain removal:

- **"Generation: A Subsets candidate the tier below solves is redrawn
  whole"**: the sentence citing "A difficulty tier binds the board it
  generates", which had no SHALL, is now the condition of the kept sentence.
- **"Controls: Subsets' verbs cycle one letter slot, and a given slot does
  not change"**: the sentence citing two `engine-input` requirements went.
  The requirement names `targetVerbs`, and gives the secondary verb's cycle
  in full as it stood.
- **"Look: The Subsets completion flash fills a cell's slots together"**: the
  sentence citing the route and the shared flash color went.

The engine request is in the words Boats' is filed in.

Checked and found sound:

- The engine request: as `boats.md` § "Review". No engine requirement says
  what cap Solve, the mistake check or the hint asks at.
- The cut params sentences. The codec is written out by hand, and its own
  requirement stays. "A params string is read whole or refused" binds "every
  game's `decodeParams`" and refuses "a letter after a tag that the tag does
  not list", which is the cut refusal of an unknown difficulty character
  (`paramsLetter`, `src/games/subsets/state.ts:197`); the round trip is
  "Encode and decode are mutual inverses over the corpus".
- The declarations and every line citation: the three verbs and the sweep,
  the legend's `ring` and `outline`, `textFormat`, `animLength`, `COL_GRID`,
  `sweepStep` of the cell.
- Every engine title the spec and the ledger cite is exact (13 citations).
- `Found`: the two player-facing items are verified above.
