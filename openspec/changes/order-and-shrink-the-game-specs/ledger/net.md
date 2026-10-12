# net

The Purpose was left as it stood: it names nothing the cut removed.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Jumble is deterministic on replay | last sentence ("The keypad SHALL offer a Jumble key, making the same move as `J`.") and scenario "The Jumble key jumbles" cut | `requestKeys`, `src/games/net/index.ts:847` (`{ label: "Jumble", button: KEY_JUMBLE }`, the code `J` sends); `engine-input`, "Every on-screen key a game offers reaches that game" |
| Rules: Net flags wrong locks and notes | "Net SHALL implement `findMistakes`" and the clause "taking the board's one answer from the search that counts its answers, at either difficulty" reworded out; what is flagged, what is not, the empty result where no one answer was proved and how a flag is drawn kept; both scenarios kept | the `Game` type (`findMistakes`); `engine-difficulty`, "One search answers a board for everything that asks" (`findMistakes` among what asks; `answerOf`, `src/games/net/solver.ts:430`, read at `src/games/net/mistakes.ts:28`) |
| Params: Net's menu offers each size at the difficulties it deals | removed, with its scenario | `BOARDS` and `VARIANTS`, `src/games/net/index.ts:129` and `:136`, `presets`, `:785` (the `tiers` option leaves 5×5 at Easy alone), `defaultParams`, `src/games/net/state.ts:64`; `engine-params`, "The preset menu is a grid" (each board at the tiers it is offered at, then one board for what is neither a size nor a tier) and "A board's tiers are one run of lines, and every tier is offered"; why 5×5 has no Unreasonable line is this spec's "Params: Net refuses Unreasonable without wrapping where it is too rare"; `src/engine/params-stability.test.ts` lists the ten lines |
| Generation: Every Easy Net board is uniquely solvable without guessing | scenario "A generated board is hinted to the end" dropped; the sentences and the other scenario kept | `engine-hints`, "The hint walk SHALL cover every preset a game offers" (following hints solves a dealt board, at every preset) |
| Generation: A pasted Net board opens at the difficulty it needs | retitled "Generation: A Net board is Easy where the hint finishes it". Kept: what makes a board Easy and what Unreasonable. The loading rule (that a board arriving as a game ID opens at that tier "whatever lower difficulty its ID states", and the two refusals) cut. Scenario "A board with several answers or none is refused" dropped; the other two kept | `engine-difficulty`, "A loaded board whose id states no tier takes the lowest tier that solves it" and "A pinned tier is kept or raised and never lowered"; `engine-params`, "A board with a mistake check loads only with exactly one answer". The dropped scenario's two boards are in this spec, "Solver: Net's search assumes each turning of the tile with the fewest left", scenario "The search tells one answer from several and from none"; `src/games/net/net-tier.test.ts` ("a pasted Net board") holds the refusals |
| Solver: Net counts a board's answers by a bounded search | retitled "Solver: Net's search assumes each turning of the tile with the fewest left". Kept: that the search is trial and error over the solver, what it assumes where that stops, and that Solve on a dealt board takes the network it was drawn as. Cut: counting up to two, the four verdicts, the budget in positions and "Solve SHALL take the answer from it at either difficulty". Scenario "An Easy board takes one position" dropped; "A spent budget is neither answer" kept whole and retitled "The search does not read how the tiles are turned"; the other two kept | `engine-difficulty`, "The engine counts a searching game's answers up to two, within a budget of positions" (its scenario "A board the deduction finishes" is the dropped one) and "Solve from the search shows the one answer or says which it lacks"; `searchAnswers`, `src/games/net/solver.ts:381`, and `solve`, `src/games/net/index.ts:672` |
| Controls: Tiles rotate and lock | retitled "Controls: A tap in the middle of a tile in notes mode locks it". First sentence and the `s` clause (which button or key turns which way, and locks) cut; the notes-mode tap, why the lock is there, and "A locked tile SHALL NOT rotate" kept; "of either button" said in the sentence, as the scenario has it. Scenario kept | `targetVerbs`, `src/games/net/index.ts:303` (`primary` with `A`, `secondary` with `D`, the key-only half turn with `F` and lock with `S`); `engine-input`, "The engine owns a declaring game's press and select keys" |
| Controls: The pointer notes the side a tap lands nearest | the clause "or a held finger" cut | `engine-input`, "A game reads one pointer with two buttons" ("a right-click or a long press is `RIGHT_BUTTON`") |
| Controls: Net's view controls and jumble have pointer routes | first sentence reworded: the collection's rule that every keyboard action has a pointer route cut, and the sentence now names the three routes (the keypad's two keys, the margin drag). Second sentence and the scenario kept | `engine-input`, "Every action is reachable with the two buttons alone"; `requestKeys`, `src/games/net/index.ts:847` |
| Preferences: Net's one preference keeps loop highlighting to locked squares | the name "Highlight loops involving unlocked squares" cut; the key `unlocked-loops`, the default and what the preference changes kept | `prefs`, `src/games/net/index.ts:711` (`name`); `ts-engine`, "The engine supports per-game user preferences" |
| Hint: Net's hint reasons from notes, locks and walls | "Net SHALL provide an explained `hint` that reasons" reworded to "Net's hint SHALL reason"; nothing else | `engine-hints`, "The engine supports an ephemeral Hint System"; the `Game` type (`hint`) |
| Look: The completion flash spreads from the source along the wires | second sentence ("A lit tile's ground SHALL be filled with a flash color, locked or not, and the tile SHALL keep its wires.") cut, and the last sentence given "a flash color included" so the rings' claim still covers a lit tile. Scenarios "The ripple reaches an unlocked tile" and "The ripple reaches a locked tile" dropped; "A neighbor the wires do not join" kept | `engine-colors`, "A solved flash drawn as a color takes a shared color" (the ground of a tile filled and keeping what it holds; no surface lifted or swapped; its scenario "A board that lifts its cells"); `COL_FLASH` and `COL_FLASH_LEAD`, `src/games/net/render.ts:99`, chosen ahead of `COL_LOCKED` at `:309` |

## Kept, and why

- **Params: Net's params and their encoding**, whole. `encodeParams` and
  `decodeParams` are written out (`src/games/net/state.ts:78`, `:85`), so the
  letters and their order are no declaration. "Easy as `de` or Unreasonable as
  `du`, only in the full encoding" is `searchTierSegment`'s, which
  `engine-difficulty`, "A game that searches has a tier for each deduction and
  Unreasonable above them", states; it stays as the place of the segment in a
  string the game writes by hand. "An ID with no difficulty letter SHALL
  decode as Easy" stays as what a missing field decodes to.
- **Params, "one of more than 1,000,000 squares".** `engine-params`, "A grid
  too large for a game is refused in one sentence", leaves the ceiling to the
  game.
- **Rules, "SHALL flag nothing where the search did not prove exactly one
  answer".** "One search answers a board for everything that asks" says
  `findMistakes` reads the search and not what it returns where the search
  proved nothing.
- **Generation: An Unreasonable Net board has one answer that the hint does
  not reach.** `engine-difficulty`, "The engine deals the Unreasonable board
  of a game that searches", says a candidate is kept where the game's
  deduction stops short and its search proves one answer. What Net supplies is
  the requirement: the candidate is the first network the solver cannot
  settle, and the deduction is the solver and then the hint's engine from the
  tiles the solver settled (`src/games/net/generator.ts:99`).
- **Solver, scenario "The search does not read how the tiles are turned".**
  Its first two lines repeat the engine's budget scenario. Its third is Net's
  own: the tiles are both the board as dealt and what every move changes, and
  the search starts each from all its turnings (`allTurnings`,
  `src/games/net/solver.ts:386`), keyed on the walls.
- **Controls: The Source key arms a tap that moves the source.** `requestKeys`
  declares the key and no more; `C`, the mode and its two ways out are
  `interpretMove`'s.
- **Hint: Net's hint takes the easiest step first.** `hintRungs` lists four
  rungs in the same order, and nothing reads it for order: the choice is
  `nextStep`'s rank over six grades, `src/games/net/deduce.ts:446`.
- **Hint: Net's hint stops where its deductions do.** As Palisade's: that the
  hint goes on from a right lock on an Unreasonable board is promised by no
  shared requirement.
- **Look: Net draws its tiles on a quiet surface and lifts a locked one.**
  Net's renderer is its own, so which surface a tile takes is a choice in
  `redraw` and no palette entry a shared painter reads.
- **Look, "its distance from the source in tiles along the connections,
  through the wrap ... and never through a barrier".** `ts-engine`, "A game
  gives each element a position, and the route is which position it gives",
  says "its distance from the source" and not how Net measures it.

## Engine requests

- `findMistakes` returns nothing where the search proved no single answer →
  `engine-difficulty`, "One search answers a board for everything that asks".
  The sentence is "Where the search did not prove exactly one answer it SHALL
  flag nothing", in "Rules: Net flags wrong locks and notes"; the code is each
  game's `findMistakes` reading `answerOf` (`src/games/net/mistakes.ts:30`).
- The description format of "Description: Net descriptions are a hex digit a
  tile, with its barriers" is `parseWireDesc` and `encodeWireDesc` of
  `src/engine/wires.ts`, which Netslide calls too: see `netslide.md`.

## Found

- The Purpose says "Its boards are uniquely solvable without guessing", which
  is true of an Easy board only; an Unreasonable one needs trial and error
  ("Generation: An Unreasonable Net board has one answer that the hint does
  not reach").
- The spec never states the hint's keep-track verdict, which is the game's own
  (`netHintKeepTrack`, `src/games/net/hint.ts:288`): a turn that leaves the
  tile short of the step's wiring is on track and the step asks for the rest
  of the turn, a lock completes only on a tile showing the step's wiring, and
  a note only as the step's note.
- The spec never states what `decodeUi` does with a saved origin or source
  that is off the grid: it takes any integer (`src/games/net/index.ts:727`).
- The dropped scenarios "The ripple reaches an unlocked tile" and "... a
  locked tile" said the ground returns "once the highlight has left it"; no
  shared requirement says that in those words, and it follows from `Flash.win`
  answering no tone for a position the highlight has passed.

## Review

12 rows read, each against the declaration or the requirement it names, read
whole; 6 rows' requirements changed in the spec, no sentence restored but the
preference's key.

Changed:

- **Five pointers undone into plain removals**, each a copy swapped for a
  citation of the same length inside a subject that says plenty of its own:
  "as `engine-difficulty`, "One search answers …" says" in "Rules: Net flags
  wrong locks and notes"; the loading rule's two citations in "Generation: A
  Net board is Easy where the hint finishes it" (its two scenarios still give
  what a pasted board opens as); both citations in the Solver requirement,
  which now says the search is trial and error over the solver and what it
  assumes; the `targetVerbs` sentence of "Controls: A tap in the middle of a
  tile in notes mode locks it" ("outside notes mode both buttons rotate"
  stays); and the citation and the Jumble key's clause in "Controls: Net's
  view controls and jumble have pointer routes".
- **The preference's key `unlocked-loops` restored.** No test pins the
  string (`grep` over `src` finds it in `index.ts` alone), and a stored
  preference depends on it.
- The engine request for `findMistakes` reworded to the line the other
  ledgers carry.

Checked and found sound:

- The engine titles the rows name are exact and each states what went: the
  preset grid and the run of tiers against `BOARDS`, `VARIANTS` and the
  `tiers` option; the hint walk; the three search requirements against the
  old Solver sentence clause by clause; the two tier-loading requirements and
  the one-answer refusal; the two buttons; the flash color, which names a
  tile and forbids a lifted or swapped surface.
- No engine capability names `wires.ts`, `parseWireDesc`, `computeActive` or
  `wireDistance` (`grep` over `openspec/specs`: only `net` and `netslide`),
  so the tile mask, the description, the flood and the flash distance stay,
  and the request stands. `engine-difficulty`, "One search answers a board
  for everything that asks", does not say what `findMistakes` returns where
  the search proved nothing: the sentence stays.
- The codec is hand-written (`state.ts:78`, `:85`); every line citation in
  the table opens on what it names; `net-tier.test.ts` has "a pasted Net
  board".
- Each subject read alone: none hollow, no dangling antecedent, every title
  fits its body.
