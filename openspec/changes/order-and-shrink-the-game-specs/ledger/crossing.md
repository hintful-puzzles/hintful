# crossing

The Purpose is unchanged: each thing it names the spec still holds.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Crossing's findMistakes compares the board with the unique solution | title and scenario kept. The clause "from the search that counts its answers, at either difficulty" cut, and no citation stands in its place (second pass); what is flagged and the empty result where no one answer was proved kept | `engine-difficulty`, "One search answers a board for everything that asks" (`findMistakes` among what asks; `answerOf`, `src/games/crossing/solver.ts:309`) |
| Rules: Crossing is complete when every clue is placed exactly once | "and SHALL flash on that completion" cut, and "and flashes" from the scenario | `ts-engine`, "The win flash plays on a forward move that solves the board" |
| Params: Crossing's parameters | replaced by "Params: A Crossing params string may leave out its height and its difficulty" (the pointer, rule 2, with the two missing-field sentences) and "Params: Crossing refuses a board with no side of 4" (the `validateParams` sentence, standing alone). The field list, the lower bound of 2 and the `S`, `de`, `du` letters cut. Scenario "A game ID round-trips through the parameters" and "The difficulty is in the full encoding only" replaced by "A string that leaves a field out", made of their two missing-field lines; "A dimension below the minimum is rejected" kept without its bound line as "Both sides below the minimum" | `paramConfig`, `src/games/crossing/state.ts:94` (`bounds: { min: 2 }` at `:97`), and the `paramsCodec` field list, `:130` (`dims`, `flag "S"` full only, `searchTierSegment`); `engine-difficulty`, "A game that searches has a tier for each deduction and Unreasonable above them" (`d` and the tier's letter, in the full form only); `engine-params`, "Params validity is the engine's check" (the bound's refusal); `src/engine/__snapshots__/params-stability.test.ts.snap` holds `5x5de`/`5x5`, `5x5Sde` and every preset |
| Params: Crossing rejects board sizes it cannot generate | third sentence (no ceiling when a description is supplied) cut whole (second pass: the first sentence already says "when validating for generation"); scenario "An existing large description still loads" dropped | `engine-params`, "A generation-only bound is gated on full" and "Param validation distinguishes generating a board from loading one" (scenario "A generation-only bound does not refuse the descriptive form") |
| Params: Crossing's menu offers each size at the difficulties it is dealt at | removed; the `Params` pointer names `presets` | `BOARDS`, `VARIANTS` and `presets`, `src/games/crossing/state.ts:70`, `:83`, `:116` (the `tiers` option leaves a board past the Unreasonable bound at Easy); `engine-params`, "The preset menu is a grid" and "A board's tiers are one run of lines, and every tier is offered"; the snapshot lists the eleven lines; `src/games/crossing/crossing-tier.test.ts:260` holds "at every size inside the bound, and at none past it" |
| Generation: Crossing's generator keeps every board uniquely solvable | scenario "Every preset produces a uniquely-solvable board" dropped; sentences and the other scenario untouched | `engine-difficulty`, "Every tier promises one solution found at its cap" |
| Generation: An Unreasonable Crossing board has one answer that the solver does not reach | retitled "Generation: An Unreasonable Crossing board keeps the shape an Easy one has". First sentence (kept only where the solver stops short and the search proves one answer) replaced by a pointer to the engine's deal, with what the game supplies to it (the candidates an Easy deal draws); second sentence kept. Scenario "A dealt Unreasonable board needs search and has one answer" cut to its last line and retitled "A dealt Unreasonable board leaves no cell out of a run"; "The smallest boards carry the tier" kept | `engine-difficulty`, "The engine deals the Unreasonable board of a game that searches" ("keep a candidate only where the game's deduction stops short of it and the game's search proves it has one answer"); `dealUnreasonable`, `src/games/crossing/generator.ts:233` |
| Generation: A pasted Crossing board opens at the difficulty it needs | retitled "Generation: A Crossing board is Easy where the solver and the hint both finish it". Kept: what makes a board Easy and what Unreasonable. The loading rule ("whatever lower difficulty its ID states", the two refusals) cut whole (second pass: the pointer that stood for it went too). Scenario "A board with several answers or none is refused" dropped; "A board that needs search opens as Unreasonable" kept | `engine-difficulty`, "A loaded board whose id states no tier takes the lowest tier that solves it" and "A pinned tier is kept or raised and never lowered"; `engine-params`, "A board with a mistake check loads only with exactly one answer". The dropped scenario's two boards are in this spec, "Solver: Crossing's search assumes each candidate digit of an empty cell in turn", scenario "The search tells one answer from several and from none"; `src/games/crossing/crossing-tier.test.ts:300` holds the refusals |
| Solver: Crossing counts a board's answers by a bounded search | retitled "Solver: Crossing's search assumes each candidate digit of an empty cell in turn". Kept: what the search runs over and what it assumes where that stops. Cut: counting up to two, the four verdicts, the budget in positions, and both Solve sentences; the two citations that stood for them went in the second pass. Scenario "A spent budget is neither answer" dropped; the other two kept | `engine-difficulty`, "The engine counts a searching game's answers up to two, within a budget of positions" (its scenario "The budget runs out with one answer in hand") and "Solve from the search shows the one answer or says which it lacks" (a refusal for several, none and a spent budget, so "more than one or none only where the search proved it"); `searchAnswers`, `src/games/crossing/solver.ts:258`, and `solve`, `src/games/crossing/index.ts:355` |
| Controls: Crossing is played by selecting a cell and entering a digit | second sentence gains the capability and title it points at, and the two departures the requirements after it state. Nothing cut | |
| Controls: A digit key enters, and Backspace, Space or 0 clears | "The on-screen keypad SHALL offer the digits 1 to 9." cut, with scenario "The keypad offers the digits" | `requestKeys: digitKeys(9)`, `src/games/crossing/index.ts:782` |
| Controls: Crossing advances the selection along the number being filled | "The behavior SHALL be a preference, enabled by default" now names the preference's key, `auto-advance`; gains scenario "Auto-advance switched off", which moves, unchanged, from "Preferences: Crossing's own preferences are `auto-advance`, `highlight-runs` and `fit-highlight`" | |
| Preferences: The board marking and the list coloring are separate preferences | sentence gains the two keys and "through the selected cell". Scenario kept | |
| Preferences: Crossing's own preferences are `auto-advance`, `highlight-runs` and `fit-highlight` | removed. Its scenario moves, unchanged, to "Controls: Crossing advances the selection along the number being filled"; the three keys and "on by default" are kept in that requirement and in "Preferences: The board marking and the list coloring are separate preferences" | `prefs`, `src/games/crossing/index.ts:785` (each `kw` and its `name`, which says what the switch does); `ts-engine`, "The engine supports per-game user preferences" |
| Hint: Crossing explains its next deduction from the board | removed. Its scenario "A run determined by a single remaining number is offered whole" moves, unchanged, to "Hint: The hint names the technique, not the candidate elimination" | `engine-hints`, "A hint is deduced from the board in play" (a plan from the player's current board) and "A hint step always names a technique, with no un-narrated fallback"; why each move is forced is this spec's technique requirements |
| Hint: The hint replays the solver's deduction | removed, with its scenario | `engine-hints`, "The solver and the hint are two projections of one deduction engine" and "One deduction firing is one journey"; the scenario is "The hint walk SHALL cover every preset a game offers" |
| Hint: The hint names the technique, not the candidate elimination | gains scenario "A run determined by a single remaining number is offered whole" | |
| Hint: Every Crossing hint step is narrated | removed. Its sentence joins "Hint: Crossing's marks are its legend's, on the clue list as on the grid" as "Every step's explanation SHALL name the run its deduction reasons over"; its scenario, which restated it, dropped | this spec; that a step carries an explanation at all is `engine-hints`, "A hint step always names a technique, with no un-narrated fallback" |
| Hint: The hint's evidence includes the listed numbers it reasons over | retitled "Hint: Crossing's marks are its legend's, on the clue list as on the grid". Its sentence went but for what the legend's words do not make a rule: that a role of `hintMarks` marks a number in the clue list as it marks a square. The pointer sentence that opened it ("A step's marks SHALL be the roles `hintMarks` declares, painted from the step's words", with its citation) went in the second pass. Scenario kept | `hintMarks.roles`, `src/games/crossing/index.ts:746` (`outline`: "the numbers in the list that still fit the run, boxed"; `stripes`: "the run the sentence names"); `engine-hints`, "A bound hint step's words SHALL name exactly the marks it draws" |
| Hint: Crossing refuses to hint a board it cannot honestly advise | removed, with its scenario "A note that rules out the right digit is refused rather than reasoned from" (second pass: it had moved to "Hint: Crossing's hint stops where the solver does" under a pointer sentence, and both went) | `engine-hints`, "The midend SHALL refuse a hint on a finished or wrong board before asking the game" (solved; a mistake, shown on the overlay) and "Deduction running out on a sound board SHALL have one wording"; that a note excluding the solution's digit is a mistake is this spec's "Rules: Crossing's findMistakes compares the board with the unique solution" and `ts-engine`, "A candidate note that excludes the answer is a mistake" |
| Hint: Crossing's hint stops where the solver does | "as it does from any position" cut. Nothing else changed | `engine-hints`, "A hint is deduced from the board in play" |
| Look: Selecting a cell shows which clues fit its runs | "Each of the two aids is a preference, on by default." cut | this spec, "Preferences: The board marking and the list coloring are separate preferences" |
| Look: The grid lines are the collection's surface grid line | removed | the palette, `out[COL_GRID] = surfaceGrid(background)`, `src/games/crossing/render.ts:184`; the one color for frame and inner lines is `drawRectOutline(…, COL_GRID)`, `:616` |
| Look: The completion flash sweeps the squares holding digits | retitled "Look: The completion flash lights the squares holding digits and never a wall". "diagonally" and "a lit square SHALL be filled with a flash color and SHALL keep its digit" cut for a citation; which squares are lit, the wall and the hidden selection kept. Scenario kept | `ts-engine`, "A game gives each element a position, and the route is which position it gives" (`sweepStep`, `src/games/crossing/render.ts:943`); `engine-colors`, "A solved flash drawn as a color takes a shared color" (the ground filled, what it holds kept) |

## Kept, and why

- **Params, "one that omits the height decodes as a square board" and "no
  difficulty letter decodes as Easy".** `dims` and `searchTierSegment` say
  both; kept as what a missing field decodes to, which an old link depends on
  (upstream's IDs carry no tier).
- **Rules, "It SHALL return nothing when the search did not prove the board
  has exactly one answer".** "One search answers a board for everything that
  asks" says `findMistakes` reads the search and not what it returns where
  the search proved nothing (see the engine requests).
- **Generation: Crossing's generator keeps every board uniquely solvable.**
  Its first sentence is what Easy means here (the solver's verdict), the rest
  the shape of a board and the difference from upstream's deal.
- **Generation, "Easy where the solver and the hint finish it".**
  `engine-difficulty` says the contract asks "the game's deduction"; that
  Crossing's is the solver and the hint both is `deductionFinishes`,
  `src/games/crossing/index.ts:368`.
- **Controls: A digit key enters…** The key map is `keyDigit`,
  `src/games/crossing/index.ts:114`, a hand-written function.
- **Hint: One deduction is one hint.** `engine-hints`, "One deduction firing
  is one journey", makes a several-move deduction several legs. Crossing makes
  a whole run one step, and gives a run's notes a sentence per leg where the
  shared rule abbreviates.
- **Hint: Crossing's hint looks for a whole run first and a note last.**
  `hintRungs` lists the same six, and nothing reads it for order: the order is
  the plan's own loop in `src/games/crossing/hint-solver.ts`.
- **Hint: A displayed hint gives the board back as soon as the player acts.**
  `uiUpdateClearsHint`, `src/games/crossing/index.ts:775`, is hand-written.
- **Look: Crossing draws flat squares on a quiet surface.** The palette names
  the three surfaces; which square takes which is `redraw`'s.
- **Preferences, the three keys.** No test outside the game holds a
  preference's key, and a stored preference is read back by it.
- **Hint: Crossing's hint stops where the solver does.** As in Palisade: that
  the hint runs no search, and goes on from a digit entered rightly on an
  Unreasonable board, is no shared requirement's (see the engine requests).

## Engine requests

The three are stated, each under the same bold name, in `crossing.md`,
`filling.md` and `signpost.md`; Palisade's spec holds the same three
sentences.

- **`findMistakes` returns nothing where the search proved no single
  answer.** Here: "It SHALL … return nothing when the search did not prove
  the board has exactly one answer", in "Rules: Crossing's findMistakes
  compares the board with the unique solution". Belongs in
  `engine-difficulty`, "One search answers a board for everything that asks",
  which names `findMistakes` among what reads the search and does not say
  what it returns where the verdict is not one answer. No engine code does
  it: each game's `findMistakes` returns early
  (`src/games/crossing/solver.ts:338`).
- **A board counts as Easy where the solver and the hint both finish it.**
  Here: "A board SHALL count as Easy where the solver and the hint finish
  it", in "Generation: A Crossing board is Easy where the solver and the hint
  both finish it". Belongs in `engine-difficulty`, "A game that searches has
  a tier for each deduction and Unreasonable above them", which says the
  contract asks "the game's deduction" and not that the hint is asked with
  the solver. The code is `hintFinishes`, `src/engine/hint-finishes.ts`,
  called from each game's `deductionFinishes`
  (`src/games/crossing/index.ts:368`).
- **The hint never runs the search; on an Unreasonable board it holds only
  what deduction forces from the player's board, and goes on from what the
  player then enters.** Here: "The hint SHALL never run the search. On an
  Unreasonable board its plan SHALL hold the steps its deductions force from
  the player's digits and notes and no others … It SHALL go on from the
  digits the player then enters", in "Hint: Crossing's hint stops where the
  solver does". Belongs in `engine-hints`, beside "A Search is refused and
  never narrated" (a search's survivor is never a step; it does not say the
  hint runs no search, and "A search certifies a position and never teaches
  one" lets a hint run one) and "A hint finishes a board from a right entry
  made out of order" (binds only a tier with no trial and error). The clause
  between them, that the refusal is the collection's sentence, is already
  `engine-hints`, "Deduction running out on a sound board SHALL have one
  wording". No engine code does it; `src/games/crossing/crossing-tier.test.ts:308`
  holds it.

## Found

- **The hint is not the solver with a recorder on.** The removed "Hint: The
  hint replays the solver's deduction" said it was "derived from the same
  deduction engine as the solver". `src/games/crossing/hint-solver.ts` holds
  its own fixpoint and its own reading of the board (notes included), which
  its header says mirrors `solveCrossing`'s loop; `deductionFinishes` asks
  both because they are two.

## Review

24 rows read, each against the declaration or the requirement it names, read
whole; no row corrected in the spec, no sentence restored, no further
sentence cut.

Changed, in the ledger only:

- **The engine requests** are now the three that Filling and Signpost file,
  under the same names and in the same words, so they gather as one. The
  third (the hint that stops where the solver does) was kept in the spec and
  filed by neither heading here; it has a line under "Kept, and why" too.

The three sentences, each read against the requirements said to be nearest:

- "SHALL return nothing when the search did not prove … exactly one answer":
  `engine-difficulty`, "One search answers a board for everything that asks",
  lists `findMistakes` among what reads the search and gives the contract's
  three verdicts, and no verdict of `findMistakes`. Not stated; kept.
- "Easy where the solver and the hint finish it": "A game that searches has a
  tier for each deduction and Unreasonable above them" says "a contract that
  asks the game's deduction", and its third scenario speaks of "its
  deduction" alone. The hint is not named. Not stated; kept.
- "The hint SHALL never run the search …": `engine-hints`, "A Search is
  refused and never narrated", forbids reporting a search's survivor and
  "Deduction runs out only where the tier permits search" says where the
  refusal may show; neither says the hint runs no search or goes on from a
  right entry at Unreasonable, and "A hint finishes a board from a right
  entry made out of order" excludes that tier. One clause of the three
  sentences is a copy ("refuse with the collection's sentence that deduction
  has run out"); it stays as the scenario's antecedent, as in Palisade.

Checked and found sound:

- The 13 engine titles the spec cites resolve, each exactly, and each
  requirement states what its row removed: the win flash, the two
  generation-only requirements and the scenario of the second, the preset
  grid and the run of tiers, the engine's deal against the old "accept only
  when the solver stops short and the search proves one answer", the two
  tier-loading requirements and the two refusals of a board without one
  answer, `searchAnswers`' four verdicts and its budget, `solveFromAnswer`'s
  three refusals, the midend's two refusals and the mistake overlay, the
  sweep's diagonal and the flash's fill that keeps what the square holds.
- The declarations: `bounds: { min: 2 }`, `flag "S"` and `searchTierSegment`
  in the codec, `BOARDS`, `VARIANTS` and the `tiers` option of `presetGrid`,
  `digitKeys(9)`, the three `prefs`, the legend's three roles, `COL_GRID`.
  Every line citation of the writer's, 22 of them, lands on the line named. The snapshot holds the
  default, `5x5de`, and the ten other lines.
- The new sentences against the code: `validateParams` refuses both sides
  below 4 before it reads `full`; `dealUnreasonable` draws with the Easy
  deal's `drawPuzzle`; `hint-solver.ts` calls no search.
- No kept requirement holds a further copy by the three classes. The nearest
  are "Rules: … compares the board with the unique solution" (a wrong note is
  `ts-engine`, "A candidate note that excludes the answer is a mistake",
  which binds a game "where" it reports notes, so that Crossing does is the
  game's) and "Look: Crossing draws flat squares on a quiet surface" (which
  square takes which surface is `redraw`'s).
- Each subject read alone: none hollow, no dangling antecedent, every title
  fits its body.

## Second pass

The brief's "A pointer is for that case only" and its line on a preference's
key, applied. 13 citing sentences read; 8 removed or reworded to the game's
own (the Solver requirement held two), 3 kept as the one pointer of a subject
or concern, 2 kept as what the game supplies to a shared rule.

Removed (each a copy with a citation, in a subject that says plenty of its
own; where it is stated is the row's third cell):

- **Rules**, "It SHALL take the answer from the search, as
  `engine-difficulty`, "One search answers …" says". The engine-request
  sentence after it stands as it did.
- **Params**, "The ceilings SHALL bind generation only, as the collection's
  do (`engine-params`, "A generation-only bound is gated on full")". The
  requirement's first sentence says "when validating for generation", and
  the Params subject has its pointer already.
- **Generation**, "What a pasted game ID opens as SHALL follow from that (…),
  and one with several answers or none SHALL be refused (…)": three
  citations and nothing of the game's. The scenario stays as the case of a
  board that counts as Unreasonable.
- **Solver**, the citation in the first sentence, reworded to the game's own
  ("Crossing's search for a board's answers SHALL run over the solver's
  deductions, assuming …"), and "Solve SHALL be the search's, by "…", and
  Crossing SHALL depart from neither".
- **Preferences**, "They and `auto-advance` are the game's own in its
  `prefs`; its pencil preferences are the engine's". The three keys stay in
  the two requirements that say what each does.
- **Hint**, "A step's marks SHALL be the roles `hintMarks` declares, painted
  from the step's words (`engine-hints`, "A bound hint step's words …")".
  The departure is reworded to stand: "A role of `hintMarks` SHALL mark a
  number in the clue list below the grid as it marks a square".
- **Hint**, "A board with a mistake, a wrong note included, is refused first
  (`engine-hints`, "The midend SHALL refuse a hint on a finished or wrong
  board before asking the game")", with the scenario it carried, "A note that
  rules out the right digit is refused rather than reasoned from": the
  midend's refusal and its overlay, and that a wrong note is a mistake is
  "Rules: Crossing's findMistakes compares the board with the unique
  solution".

Kept as a pointer: the `Params` pointer (`paramConfig`, the codec and
`presets`, one requirement); the `Controls` pointer to `engine-notes`, "The
note-taking cell is one shared mechanic", with its two departures;
"Crossing's Unreasonable boards SHALL be dealt by the engine's deal (…), from
the candidates an Easy deal draws", the one place Generation says how an
Unreasonable board is come by.

Kept as the game's own beside a shared name: "it SHALL refuse with the
collection's sentence that deduction has run out" (inside an engine-request
sentence, left as it is); the flash's "each at the position of its place in
the grid (`ts-engine`, "A game gives each element a position, and the route
is which position it gives")", which is the position Crossing gives; the
surfaces of "Look: Crossing draws flat squares on a quiet surface", which
say which square takes which.

Preferences: the cut removed no key. `auto-advance`, `highlight-runs` and
`fit-highlight` each stand in the spec with "on by default".

Each subject read alone after the edits: `Rules` speaks of "the search" in
its second requirement with no citation, and the search is the Solver
subject's; no fragment, no dangling "it", every title fits its body.
