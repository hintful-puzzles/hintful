# bricks

The Purpose was left as it stood: it names nothing the cut removed.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: A Bricks board is complete when its three rules hold | last two sentences ("The game SHALL flash on completion. There SHALL be no interpolated animation.") cut, and "and flashes" from scenario "Satisfying every rule wins"; the rest kept | `ts-engine`, "The win flash plays on a forward move that solves the board"; `animLength: () => 0`, `src/games/bricks/index.ts:563` |
| Rules: Bricks' findMistakes reports a broken rule and a cell the answer contradicts | sentences kept. Scenario "A mistake blocks Check & Save" retitled "A rule violation is reported" and cut of "and the save is blocked"; "and the board is not saved" cut from "A wrong cross that breaks no rule" | `quick-save`, "Check & save gates the checkpoint on a clean board" |
| Params: Bricks parameters are a width, a height and a difficulty | retitled "Params: Bricks refuses a 2×2 at Unreasonable". Kept: the `validateParams` refusal. Cut: the field list, "The engine SHALL refuse a width or height below 2 and an unknown difficulty, from the bounds and choices the game declares", "A game ID SHALL encode the width, height and difficulty and round-trip through decode". The sentence on the difficulty letters moved to "Params: A Bricks params string may leave out its difficulty". Scenarios "A game ID round-trips through the parameters" and "A board one cell wide is refused" dropped; "A 2×2 at the harder tier" kept | `paramConfig`, `src/games/bricks/state.ts:209` (`bounds: { min: 2 }` at `:212`, `difficultyItem` at `:219`); `engine-params`, "Params validity is the engine's check" and "Encode and decode are mutual inverses over the corpus" |
| Params: The undeclared Bricks tier still loads and is never dealt | cut to what is Bricks' own: that a full set carrying the tier is refused with a message that lists the tiers that exist, because this one has no name. Cut: that the letter is kept and round-trips, and that any other set carrying it is accepted. Title kept: its "still loads" is the first scenario's last line. Scenario "The undeclared tier still round-trips through a game ID" dropped; the other two kept | `engine-difficulty`, "A tier with no boards is retired and still loads" (not offered, accepted on load, refused for generation; its scenario "A game ID names a retired tier" is Bricks' `dt`); `difficultyItem(…, { retired: 1 })`, `src/games/bricks/state.ts:219`, and `DIFF_CHARS`, `:66`, in the `choice` of the codec, `:228`; `src/games/bricks/bricks.test.ts` holds `10x8dt` decoding and encoding back |
| Params: A Bricks board is never turned | removed, with its scenario | `notApplicable.transposeParams`, `src/games/bricks/index.ts:536`, whose reason is the requirement's sentence; `engine-params`, "A game may turn its params, says why not, or is a draft" |
| Params: Bricks writes its difficulty after d, in the full encoding only | retitled "Params: A Bricks params string may leave out its difficulty". The encoding (`WxH`, `d` and a letter in the full form only) and the refusal of an unknown letter cut for a sentence that sends the reader to `paramConfig`, the declared codec and `presets` (rule 2); "a string with no `d` SHALL decode as Easy" kept; gains the sentence on the letters from "Params: Bricks parameters are a width, a height and a difficulty", which now says which letter is which tier's. Scenario kept | the `paramsCodec` field list, `src/games/bricks/state.ts:226` (`dims`, `choice "d"` full only); `engine-params`, "A params string is read whole or refused" (a letter the tag does not list); `src/engine/params-stability.test.ts` holds `6x7de`, `6x7dn` and `6x7` |
| Generation: Bricks grades the tiers it does offer | removed, with its scenario | `engine-difficulty`, "A difficulty tier binds the board it generates" (not solvable one tier down, and the gate tests both directions; its first scenario is the dropped one) |
| Generation: The Bricks generator deals only a board with one solution its solver completes | retitled "Generation: The Bricks generator solves the fully numbered board before it removes a number". First sentence (only a board with exactly one solution, which the solver completes at the difficulty asked for) cut; the second kept. Both scenarios kept | `engine-difficulty`, "Every tier promises one solution found at its cap" |
| Controls: Bricks cells cycle by a click or a drag | first sentence reworded: the cycle and which button runs it which way became the subject's one pointer, to `targetVerbs`, for the clicks and the keys, and the drag is said as the game's own, as the scenario has it. "A numbered cell SHALL never be shadeable" and the scenario kept | `targetVerbs`, `src/games/bricks/index.ts:222` (`primary`: "cycle it from empty to shaded, then …, then empty again"; `secondary`: "cycle it the other way") |
| Controls: The Bricks keyboard cursor follows the hexagonal grid | both sentences (a hexagon-aware cursor beside the pointer; Up and Down alternating an orthogonal and a diagonal step) cut for one naming the helper the game's `moveCursor` steps by, which gains the number pad's clause from "Controls: Bricks' keys paint the cell under the cursor"; scenario kept | `engine-input`, "A cursor step on a sheared hexagonal board is the engine's" (Up and Down zigzag); `engine-input`, "Keyboard reachability is a recorded decision for every game"; `shearedHexStep`, called at `src/games/bricks/index.ts:155` |
| Controls: Bricks' keys paint the cell under the cursor | retitled "Controls: Ctrl or Shift with a Bricks move paints the cells the cursor leaves and enters". The keys `1`, `0`, `2`, Backspace and Delete and what each paints cut; the number pad's eight directions cut, and "of its digits only 0 paints" moves to "Controls: The Bricks keyboard cursor follows the hexagonal grid"; the Ctrl and Shift sentence and the scenario kept | `targetVerbs.keyOnly`, `src/games/bricks/index.ts:234`; `engine-input`, "The engine reads a number-pad digit as a direction, once" (8, 2, 4, 6 as the arrows, 7, 9, 1, 3 the diagonals) and "A cursor step on a sheared hexagonal board is the engine's" (which diagonal each is on this board) |
| Solver: The Bricks solver places cells by contradiction | last sentence corrected (see `## Review`): "Every difficulty tier SHALL be solvable by pure deduction; the solver SHALL NOT rely on guessing." became that each cell placed is proved by contradiction at every tier, and that the harder tier's lookahead only refutes a trial | |
| Hint: Bricks provides an explained deduction hint | removed, with its scenario | the `Game` type (`hint`, `hintKeepTrack`); `engine-hints`, "The solver and the hint are two projections of one deduction engine" and "A hint is deduced from the board in play"; the scenario is "The hint walk SHALL cover every preset a game offers" |
| Hint: A Bricks hint plan is recompute-stable | third pass: removed, with its scenario "A hint after a followed step continues the plan" | `engine-hints`, "A recomputed plan continues the plan it replaces" (a `next` found by a scan in a fixed order, and a plan made again beginning with the old one's second firing, of every game on `deduceHintPlan`; Bricks calls it at `src/games/bricks/solver.ts:486`) |
| Hint: The recursive lookahead rung is never narrated | third pass: last sentence ("Where the single-cell rung runs out, the hint SHALL refuse rather than reach for it.") cut; that the rung is not narrated, why, and that the solver keeps it stay, with the scenario | `engine-hints`, "A hint gives every step deduction still forces before it refuses" (refused with `DEDUCTION_EXHAUSTED` where it forces none); `engine-hints`, "A Search is refused and never narrated" |
| Hint: A Bricks hint step explains why the move is forced | first sentence ("Each hint step SHALL explain why the move is forced, not merely which cell to act on.") cut; the rest kept; the scenario's "the forced cell is highlighted as the target, its evidence cells are marked" and "without pre-placing the forced color" cut, leaving the rule the explanation names | `engine-hints`, "A hint step always names a technique, with no un-narrated fallback"; for the scenario, `hintMarks.roles`, `src/games/bricks/index.ts:545`, and `engine-hints`, "Requesting a hint never mutates the board" |
| Hint: A Bricks hint marks the forced cell and its evidence, and places nothing | retitled "Hint: A Bricks hint step is one journey of one cell". The two marks and "The hint SHALL NOT pre-place the forced color." cut; the one-journey sentence and the scenario kept | `hintMarks.roles`, `src/games/bricks/index.ts:545` (ring: the cell the step decides; outline: what it reasons from); `engine-hints`, "Requesting a hint never mutates the board" (only highlighting is added) |

## Kept, and why

- **Params, "a string with no `d` SHALL decode as Easy".** The declaration
  holds it (`choice` leaves `defaultParams`' tier); kept as what a missing
  field decodes to. Bricks is not on `searchTierSegment`, so
  `engine-difficulty` fixes no tier for it.
- **Params, "The difficulty letters SHALL stay upstream's, `n` for
  `Unreasonable` and `t` for the undeclared tier".** `DIFF_CHARS` is the
  declaration and says `ent`; it does not say that the tier a player sees as
  Unreasonable is written `n`, nor that the letters must not follow the names.
- **Params: The undeclared Bricks tier, scenario "The generator refuses rather
  than exhausts its retries".** `engine-difficulty`, "A generator never
  settles for a lower tier", has a generator called at a refused tier exhaust
  its retry bound; Bricks' throws at once
  (`src/games/bricks/generator.ts:123`).
- **Generation: Bricks offers Easy and Unreasonable, and no third tier.** What
  each tier means here, and why the third has no name.
- **Controls, "a drag SHALL paint the cells it crosses in one move".** The
  drag is `interpretMove`'s own arm (`src/games/bricks/index.ts:291`), not the
  model's sweep.
- **Hint: A Bricks hint takes the first empty cell one color breaks a rule
  in.** `hintRungs` lists five reasons in another order (`three`,
  `unsupported`, `overcount`, `strandSupport`, `undercount`); the order tried
  is the body of `nextForcedMove`, `src/games/bricks/solver.ts:445`.
- **Hint: Bricks calls its piece shaded and never by its color.**
  `engine-colors`, "Shaded or not is the pair's first member alone", states
  the case in a scenario ("as "shaded brick""), not as the rule for Bricks.
- **Look: Bricks draws a shaded cell as a piece and a ruled-out one as the
  clear square.** Reads like the collection's look; it says which of the
  shared pieces Bricks takes (the square one, the clear square, the lifted
  given), which is the game's choice.

## Engine requests

None.

## Found

- The spec never states the question the hint asks of the clues before it
  plans: `hint` runs the solver at its deepest rung on the board cleared of
  the player's marks and refuses with `PUZZLE_NOT_REASONABLE` where that does
  not finish (`src/games/bricks/index.ts:430`). `ledger/_engine.md` names it
  as Bricks' own to state.
- The spec never states the hint's keep-track verdict (`hintKeepTrack`,
  `src/games/bricks/index.ts:454`): a paint that gives the target cell the
  forced color completes the step, and anything else drops the plan.
- "Solver: The depth-2 rung stays in the Bricks solver" does not say what
  Solve answers on a board the solver proves impossible: `NO_SOLUTION`
  (`src/games/bricks/index.ts:356`).
- The removed "Params: A Bricks board is never turned" had a scenario ("it is
  dealt at the size chosen") that no other statement repeats in those words;
  it follows from `engine-params`, "A deal turns the chosen params when the
  turned board fits better", which turns only a game with `transposeParams`.

## Review

15 rows read (14 of the writer's and one added), each against the declaration
or the requirement it names, read whole; 7 rows' requirements changed in the
spec, no sentence restored.

Changed:

- **"Solver: The Bricks solver places cells by contradiction"**, last
  sentence. "Every difficulty tier SHALL be solvable by pure deduction" is
  false as the spec uses the words: the harder tier's rung solves the rest of
  the board from a trial (`solverRecurse`, `src/games/bricks/solver.ts:234`),
  which "Generation: Bricks offers Easy and Unreasonable" calls a search. What
  the code does is that every cell placed is proved by contradiction, at
  either rung, and no trial is ever committed (`solver.ts:248` restores the
  grid before forcing the opposite). The sentence now says that.
- **Params**: the clause sending a width below 2 to the declared bounds cut
  from "Params: Bricks refuses a 2×2 at Unreasonable", and the citation of
  the retired-tier requirement cut from "Params: The undeclared Bricks tier
  still loads and is never dealt", which keeps the refusal's wording. The
  subject keeps its one pointer, in "Params: A Bricks params string may leave
  out its difficulty", as Palisade's does: the codec is declared, so the
  ordinary case is said nowhere else.
- **Controls**: three pointers made one. The first requirement keeps the
  subject's pointer to `targetVerbs`, since nothing else in it says what a
  click does. The cursor requirement names the helper its `moveCursor` steps
  by and holds the number pad's clause; the two citations in the Ctrl and
  Shift requirement went.
- **"Hint: A Bricks hint step is one journey of one cell"**: the sentence
  pointing at `hintMarks` cut, and the copied lines of the scenario of "Hint:
  A Bricks hint step explains why the move is forced".

Checked and found sound:

- The retired tier against `engine-difficulty`, "A tier with no boards is
  retired and still loads", whose scenario is Bricks' `dt`;
  `bricks.test.ts:127` holds `10x8dt` both ways and `:516` the refusal's
  sentence; the snapshot holds `6x7dn` and `6x7de`.
- "A difficulty tier binds the board it generates" and "Every tier promises
  one solution found at its cap" against the two Generation cuts;
  `notApplicable.transposeParams` (`index.ts:537`) holds the removed reason.
- The number pad's 0 is a key of the "mark it clear" verb and no direction;
  its other digits but 5 are taken by the move arm first (`index.ts:272`).
- Each subject read alone: none hollow, no dangling antecedent, every title
  fits its body.

## Third pass

What the engine's third round states, removed. 3 rows of the third-round
tables and their reviews name Bricks (the mistake check, as a game that
keeps its sentence; the recomputed plan; the steps before a refusal, added
by the review). This ledger filed no request.

Cut, 2 sentences and 1 scenario, 1 requirement gone:

- **"Hint: A Bricks hint plan is recompute-stable"**, whole, with its
  scenario: `engine-hints`, "A recomputed plan continues the plan it
  replaces".
- **"Where the single-cell rung runs out, the hint SHALL refuse rather than
  reach for it."**, in "Hint: The recursive lookahead rung is never
  narrated": `engine-hints`, "A hint gives every step deduction still forces
  before it refuses".

Kept, 2 clauses:

- "`findMistakes` SHALL report every cell the rule pass flags": `ts-engine`,
  "A mistake check compares with the one answer, hidden or not", leaves a
  broken rule reported besides to the game's spec, and the review names this
  sentence. The spec never said the result is empty without an answer, so
  nothing went.
- The scenario line "where only that rung could progress the hint refuses
  instead": a case of the kept sentence that the rung is never narrated.

`engine-colors`, "A clear square whose middle is taken carries no cross",
names Bricks as a caller of `drawClearSquare` and no sentence of its spec:
"Look: Bricks draws a shaded cell as a piece and a ruled-out one as the clear
square" says which of the shared pieces Bricks takes. Of the brief's section
2 nothing stood in the spec: Generation says what the two tiers mean, and
Params keeps its one pointer, the codec being declared.

Each subject read alone: none hollow, no fragment, every title fits. The
Purpose's "its explained hint and when it refuses" still holds: the hint's
subject keeps the lookahead rung never narrated.
