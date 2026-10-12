# range

The Purpose was corrected: it named "its params and description encodings",
"its controls" and "the marks it draws", and now names what the params refuse,
what the two verbs and a shifted arrow do, and the rules and the search.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Range is solved exactly while it has no error | "and a flash plays" cut from scenario "Completing the board is detected"; sentences untouched | `ts-engine`, "The win flash plays on a forward move that solves the board" |
| Rules: Range's move is a list of cell-sets | "`executeMove` SHALL be pure and" cut; that it throws on an out-of-bounds or clue-cell target kept; scenario kept | `ts-engine`, "Applying a move returns a new state" |
| Rules: Range checks mistakes against the solution | the clause "from the search that counts its answers, at either difficulty" cut, and "the search" of the last sentence reworded to "the game's search" so it stands without it; what is returned and the two empty results kept; scenario kept | `engine-difficulty`, "One search answers a board for everything that asks" (`findMistakes` among what asks; `answerOf`, `src/games/range/solver.ts:555`) |
| Params: Range params are a width and a height | replaced by the pointer requirement "Params: A Range params string may leave out its height and its difficulty" (rule 2). The field list and the encoding (`{w}x{h}d{e\|u}`, the difficulty in the full form only) cut; the two missing-field sentences kept. Scenario "Params round-trip" cut to its two missing-field lines as "A string that leaves a field out" | `paramConfig`, `src/games/range/state.ts:117`, and the `paramsCodec` field list, `:128` (`dims`, `searchTierSegment`); `engine-difficulty`, "A game that searches has a tier for each deduction and Unreasonable above them" (`de` and `du`, in the full form only); `src/engine/__snapshots__/params-stability.test.ts.snap` holds `6x9de`/`6x9` and every preset; `src/games/range/range-tier.test.ts:429` ("is written in the full form only") |
| Params: Range's menu offers each size at both difficulties | removed; the `Params` pointer names `presets` | `BOARDS`, `defaultParams` and `presets`, `src/games/range/state.ts:99`, `:106`, `:110`; `engine-params`, "The preset menu is a grid" (each board at every tier, easiest first); the snapshot lists the eight lines |
| Generation: An Unreasonable Range board has one answer that the rules do not reach | retitled "Generation: An Unreasonable Range board is an Easy one stripped further, a symmetric pair at a time". "SHALL keep the board only when the three rules then stop short" and "within a budget of its own, well under the search's" cut; that it starts from an Easy board, what the strip takes and the symmetry kept. Both scenarios kept | `engine-difficulty`, "The engine deals the Unreasonable board of a game that searches" and "A strip is asked within the engine's dealing budget" ("one budget of positions, the same in every game and well under any game's own"); `dealUnreasonable`, `src/games/range/solver.ts:762`, and `stripFurther`, `:729` |
| Generation: A pasted Range board opens at the difficulty it needs | retitled "Generation: A Range board is Easy where the three rules finish it". Kept: what makes a board Easy and what Unreasonable. The loading rule ("whatever lower difficulty its ID states", the two refusals) cut. Scenario "A board with several answers or none is refused" dropped; "A board that needs search opens as Unreasonable" kept | `engine-difficulty`, "A loaded board whose id states no tier takes the lowest tier that solves it" and "A pinned tier is kept or raised and never lowered"; `engine-params`, "A board with a mistake check loads only with exactly one answer". A board with no number and one with a 7 and a 1 in opposite corners are in this spec, "Solver: Range's search assumes the first undecided cell shaded, and then clear", scenario "The search tells one answer from several and from none"; `src/games/range/range-tier.test.ts:356` holds the refusals and `c6h3_6b` |
| Solver: Range's Solve searches where deduction stalls | retitled "Solver: Range's Solve is one move that sets every non-clue cell". Where the answer comes from and the error cut; what the move is kept. Scenario kept | `engine-difficulty`, "Solve from the search shows the one answer or says which it lacks" and "One search answers a board for everything that asks"; `solve`, `src/games/range/index.ts:179` |
| Solver: Range counts a board's answers by a bounded search | retitled "Solver: Range's search assumes the first undecided cell shaded, and then clear". Kept: what the search assumes where the three rules stop. Cut: counting up to two by trial and error, the four verdicts and the budget in positions. Scenarios "A spent budget is neither answer" and "An Easy board takes one position" dropped; the other two kept | `engine-difficulty`, "The engine counts a searching game's answers up to two, within a budget of positions" (its scenarios "The budget runs out with one answer in hand" and "A board the deduction finishes"); `searchAnswers`, `src/games/range/solver.ts:519`; `src/games/range/range-tier.test.ts:139` and `:154` hold the nine positions and the one |
| Solver: Range's rules conclude no less from a board that says more | scenario "A hint asked after a right entry" dropped; sentences and the other two scenarios untouched | `engine-hints`, "A hint finishes a board from a right entry made out of order" |
| Controls: Range marks cells via three-state cycling moves | retitled "Controls: Range's two verbs cycle a cell's three states in opposite directions". "Left-button or select" and "right-button or select2" became the primary and the secondary verb of `targetVerbs`, which the requirement names; the two cycles and the inert clue kept. Scenarios kept | `targetVerbs`, `src/games/range/index.ts:115` (`primary`, `secondary`, `sweep`); `engine-input`, "The engine owns a declaring game's press and select keys" (Enter the left-click verb, Space the right-click verb) and "A drag on from a press repeats the press" |
| Controls: Range's keyboard cursor marks white with shift | "A keyboard cursor SHALL move within the grid, and" cut; the shifted step kept; scenario kept | `squareGrid` in `targetVerbs.geometry`, `src/games/range/index.ts:117`; `engine-input`, "A target and its cursor belong to the geometry" and "One arrow press reveals the cursor and moves it" |
| Hint: Range provides an explained deduction hint | removed, with its scenario. "one narrated `HintStep` per forced cell" joined "Hint: Range's hint takes the clue rule first in each pass" | the `Game` type (`hint`); `engine-hints`, "A hint is deduced from the board in play" (from the player's current marks), "A hint step always names a technique, with no un-narrated fallback" and "The hint walk SHALL cover every preset a game offers" (the plan solves the board); the deductions are this spec's "Hint: A Range hint step states the deduction that forces its cell" |
| Hint: A Range hint is refused only when the rules force no cell | removed, with its scenario | this spec, "Hint: Range's hint stops where its rules do" ("where none is forced it SHALL refuse with the collection's sentence that deduction has run out"); `engine-hints`, "Deduction running out on a sound board SHALL have one wording" and "The midend's two refusals are not a game's to give" |
| Hint: Range's hintKeepTrack follows the hinted cell and value | first sentence ("The game SHALL implement `hintKeepTrack` so the plan advances as the player follows it.") cut; the verdict and the scenario kept | the `Game` type (`hintKeepTrack`); `engine-hints`, "A player move is classified against the stored plan" |
| Hint: Range hint color legend | removed. Its three sentences went; its scenario "A cited black square rings distinct from the forced cell" moves, unchanged, to "Hint: A shaded premise of a Range hint takes a color of its own" | `engine-hints`, "A hint naming several kinds of element colors them by a stable legend", "A hint marks beside the content, never behind it" and "A bound hint step's words SHALL name exactly the marks it draws" (painted from the step's words and nothing else); `hintMarks.roles`, `src/games/range/index.ts:441` |
| Hint: The forced cell and its premises take different marks | removed, with its scenario | `hintMarks.roles`, `src/games/range/index.ts:441` (`ring`: the cell the step decides; `outline`: the cells a clue already sees, the cells around one a shaded square would cut off); `engine-hints`, "A hint marks beside the content, never behind it" (the acted-on cell ringed, the same mark whatever the step places) and "A hint mark is drawn on the cell's border"; the palette, `out[COL_HINT_CELL] = HINT_EVIDENCE`, `src/games/range/render.ts:92` |
| Hint: A shaded premise, a run and a clue each take their own mark | cut to its first sentence, less "SHALL keep its shaded piece"; retitled "Hint: A shaded premise of a Range hint takes a color of its own"; the second and third sentences (the run striped, the clue's number in the hint color) and scenario "A reach step stripes the run short of its target" cut; gains scenario "A cited black square rings distinct from the forced cell" from "Hint: Range hint color legend" | `hintMarks.roles`, `src/games/range/index.ts:441` (`outline`: "a … square beside it, which takes a doubled outline. The clue the step counts from has its number drawn in the hint color"; `stripes`: "the run a clue has to see along, from the clue as far as the ringed cell"); `engine-hints`, "A hint marks beside the content, never behind it" (the content drawn as without the hint); that the run stops short of the forced cell is this spec's "Hint: A Range hint outlines its evidence as an area", scenario "Every hint step shows visible evidence" |
| Hint: Range's hint takes the clue rule first in each pass | first sentence gains "one narrated step for each cell", from "Hint: Range provides an explained deduction hint" | |
| Look: A Range clue sits on the lifted surface of a given | second sentence ("The line between cells and the frame round the grid SHALL be the surface's grid line.") cut; scenario kept | the palette, `out[COL_GRID] = surfaceGrid(defaultBackground)`, `src/games/range/render.ts:79` |

## Kept, and why

- **Params, "a bare number decodes as a square board" and "no difficulty
  letter decodes as Easy".** `dims` and `searchTierSegment` say both; kept as
  what a missing field decodes to, which an old link depends on.
- **Params: Range params are refused outside their bounds**, whole. Both
  refusals are `validateParams`' with their reasons, and "It SHALL refuse no
  size for the time its deal takes" is a promise no declaration makes.
- **Rules, "none where the search did not prove exactly one answer".** "One
  search answers a board for everything that asks" says `findMistakes` reads
  the search and not what it returns where the search proved nothing.
- **Generation: Every Easy Range board is uniquely solvable without search.**
  Reads like the collection's rule by its title; its sentences are the
  symmetry, the clue opposite a black square, and the minimal strip.
- **Solver: Range's search sees a position no answer fits before it is
  full.** The shared search asks the game's deduction to report a
  contradiction; what counts as one here is the game's.
- **Hint: A Range hint outlines its evidence as an area.** The legend's
  `outline` role lists the same three areas; kept for which deduction takes
  which (`markedOf`, `src/games/range/index.ts:311`), which the legend's
  one sentence does not tie.
- **Hint: Range's hint takes the clue rule first in each pass.** `hintRungs`
  lists adjacency first, and the plan takes the clue rule first: the order is
  the loop of `deduceHintPlan`, `src/games/range/solver.ts:389`.
- **Hint, "`COL_HINT_SHADEDREF`, not `COL_HINT`".** The legend says the
  shaded premise's outline is doubled and not that it is a color of its own.
- **Look: Range draws a shaded cell as the collection's shaded piece.** That a
  cell marked not shaded holds the bare cross and no fill is the game's
  choice between the two the collection offers (`engine-colors`, "A board
  colored half and half gives its clear squares a surface").

## Engine requests

- `findMistakes` returns nothing where the search proved no single answer →
  `engine-difficulty`, "One search answers a board for everything that asks".
  The sentence is "It SHALL return … none where the game's search did not
  prove exactly one answer", in "Rules: Range checks mistakes against the
  solution"; the code is each game's `findMistakes` reading
  `answerOf(state).kind` (`src/games/range/index.ts:194`).
- What `HINT_BLACKREF` and `HINT_WHITEREF` cite → `engine-colors`, "The hint
  emphases stay distinguishable in both schemes", which names them only as
  "the two premise references". The sentence is "The doubled outline of a
  cited shaded square … SHALL be drawn in `COL_HINT_SHADEDREF`", in "Hint: A
  shaded premise of a Range hint takes a color of its own"; the palette is
  `out[COL_HINT_SHADEDREF] = HINT_BLACKREF`, `src/games/range/render.ts:95`.

## Found

- **Range refuses a board too large in a sentence of its own**: "Width plus
  height must be at most 128.", `src/games/range/state.ts:150`. It is a limit
  on the sum and not the area, so `engine-params`, "A grid too large for a
  game is refused in one sentence", does not bind it; the spec states it.
- The spec never stated the drag: a press dragged on repeats itself over the
  cells that held what the pressed cell held (`sweep`,
  `src/games/range/index.ts:123`). It is a declaration, and the `Controls`
  requirement names `targetVerbs`.
- "Rules: Range's move is a list of cell-sets" calls the move's values black,
  white and empty, the `Look` requirements shaded and not shaded, and the
  help page shaded and a cross; one requirement ties them ("the state called
  black elsewhere").
- The removed "Hint: Range provides an explained deduction hint" said every
  step is "a legal `executeMove`" and that applying every step solves the
  board; the second is true of an Easy board only.
- `hintRungs` lists `adjacency` before the three clue rungs, and the plan
  tries the clue rule first (`RANGE_RUNGS`, `src/games/range/index.ts:359`).
  Nothing reads the list for order, so it is no defect; a reader of the code
  could take it for the order.

## Review

21 rows read, each against the declaration or the requirement it names, read
whole; 9 corrected in the spec, 1 of them dropped from the table, no sentence
restored.

Changed. Each of these was a copy swapped for a pointer inside a subject that
says plenty of the game's own, and is now a plain removal:

- **"Rules: Range checks mistakes against the solution"**: the sentence
  citing "One search answers a board for everything that asks" went; "the
  search" of the kept sentence is "the game's search".
- **"Generation: An Unreasonable Range board is an Easy one stripped further,
  a symmetric pair at a time"**, **"Generation: A Range board is Easy where
  the three rules finish it"**, **"Solver: Range's Solve is one move that
  sets every non-clue cell"** and **"Solver: Range's search assumes the first
  undecided cell shaded, and then clear"**: each kept its own sentence and
  lost its citations.
- **"Controls: Range's two verbs cycle a cell's three states in opposite
  directions"**: the sentence citing two `engine-input` requirements went.
  The requirement names `targetVerbs`, which is where a reader of `Controls`
  is sent, and the subject states two things of the game's own.
- **"Hint: Range's hint stops where its rules do"**: the added sentence on
  the midend's refusals went, so the requirement is as it stood and has no
  row.
- **"Hint: A shaded premise, a run and a clue each take their own mark"**:
  the pointer requirement that took its place is cut to the one sentence of
  the game's own and titled "Hint: A shaded premise of a Range hint takes a
  color of its own". Its scenario "A reach step stripes the run short of its
  target" went with the sentences it was a case of: the legend's `stripes`
  role has the run and its `outline` role the clue's number, and "Hint: A
  Range hint outlines its evidence as an area" has that the run stops short
  of the forced cell.

The `Params` pointer stays, as Palisade's does.

The engine requests: the first is in the words the other batches file it in,
and a second is added, for what `HINT_BLACKREF` cites, since Range's
`COL_HINT_SHADEDREF` is that role and the kept sentence is the only place
that says a shaded premise takes it.

Checked and found sound:

- Each requirement named for something cut states all of it: "The win flash
  plays on a forward move that solves the board"; "Applying a move returns a
  new state"; "A target and its cursor belong to the geometry" with "One
  arrow press reveals the cursor and moves it"; "A hint finishes a board from
  a right entry made out of order" (an Easy board is a tier with no trial and
  error); "A player move is classified against the stored plan"; "A bound
  hint step's words SHALL name exactly the marks it draws" ("from the step's
  words … and from nothing else"); the search, deal and tier-loading
  requirements as in `mosaic.md` § "Review".
- The declarations and every line citation: `BOARDS`, `defaultParams`,
  `presets`, the two codec segments, the two verbs and the sweep, the three
  legend roles, `COL_HINT_CELL`, `COL_GRID`, and the two tests of positions.
- Every engine title the spec and the ledger cite is exact (31 citations).
