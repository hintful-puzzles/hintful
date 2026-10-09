# Verdicts: bricks

## reword `bricks`: The Bricks board is a hexagon stored as a padded parallelogram

Dropped "This geometry SHALL be bespoke and SHALL NOT depend on the shared grid tiling engine", which says which module the board is built with. Nothing in the tree records it as a refusal: no comment in `src/games/bricks/state.ts` gives a reason, and `docs/games/mechanics.md` § "Padded rectangles and sheared draws" presents the padded board as a way to build one. The stored shape stays, because the description's cell order and the cursor's two kinds of step are stated against it.

### Requirement: The Bricks board is a hexagon stored as a padded parallelogram

The board SHALL be a hexagon stored as a padded parallelogram: the actual grid
width SHALL be the parameter width plus the ceiling of half the height minus one,
with the two triangular corners masked as boundary cells, leaving exactly
width-by-height playable cells. Neighbors SHALL be the fixed six-direction hex
step set.

#### Scenario: A board six wide and seven high

- **WHEN** a board of width 6 and height 7 is built
- **THEN** its grid is nine cells wide
- **AND** forty-two of its cells are playable

## keep `bricks`: Bricks reports rule violations through findMistakes

It says what Check & Save does in this game today, which is true of the code (`findMistakes` in `src/games/bricks/solver.ts` runs the validity pass and does not re-solve), and a requirement about a control stays while the control behaves so. That the behavior departs from the shared rule is a matter for the code, in the note below.

## keep `bricks`: A Bricks hint plan is recompute-stable

`engine-hints` "Hint mechanics are engine-owned and cross-game guarded" says the engine provides how a plan stays stable across recompute. It does not say what a game's own deduction owes for that. This does: Bricks scans in one order, so a plan recomputed after a followed step begins with the old plan's second step. A player sees it as a hint that does not jump about.

## keep `bricks`: Bricks provides an explained deduction hint

The clause naming the two projections cites the shared rule as the reason and is not the requirement. What the requirement holds is Bricks' own: the hint is computed from the game's contradiction solver, from the player's current position.

## reword `bricks`: The Bricks generator deals only a board with one solution its solver completes

Dropped "Generation from a given seed SHALL be reproducible" and its scenario. Nothing a player has depends on it: the app hands out boards and never seeds (`AGENTS.md`, "What the project is for"). What does depend on it is the tests, and `testing` "The test suite is deterministic under parallel load" requires generator tests to be seed-deterministic for every game; `random` "The random module's output is stable across builds" holds the stream. The same sentence was cut from Clusters in the pruning. The rest is unchanged.

### Requirement: The Bricks generator deals only a board with one solution its solver completes

The generator SHALL write out only a board with exactly one solution, which its
solver completes at the difficulty asked for. Before it removes any number it
SHALL solve the fully numbered board, and SHALL start again when that solve does
not complete: the numbering made after the Easy solve can take away the brick
another brick rests on, and removing numbers cannot repair a board that does not
solve.

#### Scenario: A board two squares wide loads from its own ID

- **WHEN** a board is dealt at a width of two and a height of four or more, at
  either difficulty
- **THEN** the solver completes it at that difficulty
- **AND** loading the board's game ID is accepted

#### Scenario: A board at the smallest height loads from its own ID

- **WHEN** a board is dealt at a height of two
- **THEN** loading the board's game ID is accepted

## keep `bricks`: A Bricks board is never turned

The wording matches the vocabulary. `ts-engine` "A game's contract sections are implemented, not applicable, or absent, and an absent one makes it a draft" and `engine-params` "A game may turn its params, says why not, or is a draft" both say a game that does not turn gives its reason in `notApplicable`, and `src/games/bricks/index.ts` declares `notApplicable.transposeParams` with this reason.

## reword `bricks`: A Bricks hint is refused on a solved, mistaken or contradicted board

Dropped the solved-board and rule-violation refusals. They are `engine-hints` "The midend SHALL refuse a hint on a finished or wrong board before asking the game", which gives both before the game's `hint` is asked and forbids a game to write either; `hint` in `src/games/bricks/index.ts` writes neither. Kept the one refusal that is Bricks' own, the board that contradicts its solution with no rule yet broken (`CONTRADICTION_UNLOCALIZED`), and retitled to what is left.

### Requirement: A Bricks hint is refused on a board that contradicts its solution without breaking a rule

A hint SHALL be refused, with an explanatory banner, when the player's placed
cells contradict the unique solution without yet breaking a local rule, which
`findMistakes` does not report. The banner SHALL say a placed cell must be
wrong, and the hint SHALL NOT deduce onward from a doomed position.

#### Scenario: A hint is refused on a wrong-but-legal board

- **WHEN** a hint is requested on a board whose placed cells contradict the
  unique solution without yet breaking a local rule
- **THEN** no move is hinted and an explanatory banner is shown, which states
  that a placed cell must be wrong

## keep `bricks`: The undeclared Bricks tier still loads and is never dealt

`engine-difficulty` "A tier with no boards is retired and still loads" gives the mechanism and names Bricks' `dt` as its example. This holds what that does not: the difficulty letter is kept and round-trips, which is a promise to game IDs and saves; the refusal's words, which can list only the tiers that exist; and that the generator fails at once at that tier.

## note Bricks' and Clusters' mistake checks are rule validators, against the shared rule

`ts-engine` "A mistake check compares with the one answer, hidden or not" says a game's `findMistakes` SHALL compare the player's marks with the board's one answer, and `docs/games/solver-and-generator.md` § "The solvable-game contract" says to re-solve and compare. Bricks' `findMistakes` (`src/games/bricks/solver.ts`) and Clusters' report only cells that break a rule as the board stands, and each game's `hint` makes the re-solve itself and refuses with `CONTRADICTION_UNLOCALIZED`. `docs/games/hints.md` § "Refusal wording comes from one module" describes that second check as the accepted shape for a rule validator and names Bricks, Bridges, Clusters, Subsets and Loopy.

The reviewer checked what a player gets, and Check & Save does not save such a board: `Midend.check()` asks the hint when `findMistakes` is empty, that refusal counts as a dead end, and `checkAndSave` shows "Not saved" with the sentence (`bricks-hint.test.ts` asserts `midend.check()` is `dead-end` on a wrong-but-legal mark, and `clusters-hint.test.ts` builds the same position). What differs from a game whose check re-solves is that the wrong cell is not marked. So the answer check holds through two steps where the shared requirement describes one, and the two games' requirements describe what they do.

## note The 2×2 refusal is in the spec now

The fifth doubt was that the spec did not record the refusal of a 2×2 board at `Unreasonable`. "Bricks parameters are a width, a height and a difficulty" states it, with the scenario "A 2×2 at the harder tier" and the sentence the player reads. Nothing to settle.
