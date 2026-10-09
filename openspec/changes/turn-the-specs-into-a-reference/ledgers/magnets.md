# Ledger: magnets

Base: bb004490

Where every rule of Magnets' spec went in the reference form: every rule kept,
stated once, a requirement held to the tool's 500 characters.

## Magnets game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `magnets` game implements `Game`, and what the puzzle asks: magnet or neutral dominoes, no like poles adjacent, each row and column at its clue counts | spec: Magnets game implements the Game interface |
| The type arguments the `Game` is instantiated with | held: src/games/magnets/index.ts "export const magnetsGame: Game<" |
| Some dominoes are fixed singleton squares, permanently neutral | spec: Magnets game implements the Game interface |
| Params are `w`, `h`, `diff` (Easy or Normal) and `stripclues`, encoded `{w}x{h}` with the full-form `d{e/t}` and `S` suffixes, and a square shorthand `{n}` | spec: Magnets' parameters |
| The presets are 5×6, 7×8 and 9×10, each turned taller than wide, a 9×10 Easy board among them | spec: Magnets' presets are drawn taller than wide |
| "Upstream's 8 presets" | history |
| `validateParams` enforces `w ≥ 2` and `h ≥ 2` | untrue: `validateParams` in `src/games/magnets/state.ts` does not check it, the engine's `paramsError` refuses it from the bounds `paramConfig` declares, 2 to `DESC_ALPHABET_SIZE - 1` |
| `validateParams` enforces the area bound | untrue: no area is checked anywhere in `src/games/magnets/state.ts`, each side is instead bounded above at `DESC_ALPHABET_SIZE - 1`, which is 61, by the declared bounds |
| The per-difficulty minimum size: Easy needs a side of 3, Normal a side of 5 | spec: Magnets' parameters |
| The game provides `solve` and `textFormat` | spec: Magnets game implements the Game interface |
| Scenario: params round-trip | spec: Magnets' parameters |
| Scenario: invalid params are rejected | spec: Magnets' parameters |

## Magnets descriptions carry the clues and domino layout

| Rule | Where it went |
| --- | --- |
| The desc's four comma-separated count runs and its row-major string of domino letters | spec: Magnets descriptions carry the clues and domino layout |
| `newState` parses it into a partner map and count targets shared across all states, derives each neutral target and marks singletons neutral | spec: A Magnets description is read into a layout every state shares |
| A short desc, a character out of range, an inconsistent domino and a count over its line's size are rejected | spec: A malformed Magnets description is refused |
| It is `validateDesc` that rejects them | untrue: the game has no `validateDesc`, the parse inside `newState` in `src/games/magnets/state.ts` refuses, and the engine's `validateDesc` in `src/engine/desc-error.ts` reports that one reading |
| Scenario: a description round-trips | spec: Magnets descriptions carry the clues and domino layout |
| Scenario: a malformed description is rejected | spec: A malformed Magnets description is refused |

## Magnets input cycles domino contents and toggles clue aids

| Rule | Where it went |
| --- | --- |
| The left-click and `CURSOR_SELECT` cycle, the right-click and `CURSOR_SELECT2` cycle, and what each refuses to start from | spec: Magnets input cycles domino contents and toggles clue aids |
| A left-click on a clue number toggles its "done" gray, kept in state and never affecting the win | spec: Magnets input cycles domino contents and toggles clue aids |
| Cursor keys move a keyboard cursor, and a singleton square takes no click or cursor action | spec: A Magnets singleton square takes no input |
| Scenario: the magnet cycle sets both domino ends | spec: Magnets input cycles domino contents and toggles clue aids |
| Scenario: clue-done toggle does not affect completion | spec: Magnets input cycles domino contents and toggles clue aids |

## Magnets flags mistakes against the unique solution

| Rule | Where it went |
| --- | --- |
| `findMistakes` re-solves and returns every set cell that contradicts the solution and every `?` on a domino neutral in it | spec: Magnets flags mistakes against the unique solution |
| The `?` is checked because the hint reads it as a fact | spec: Magnets flags mistakes against the unique solution |
| "A mark the hint reasons from has to be one the mistake check vouches for" | reason |
| Empty cells and a `?` on a magnet are never flagged, and a board not uniquely solvable yields none | spec: Magnets flags mistakes against the unique solution |
| The flagged cells are overlaid distinctly from the always-on live error highlighting of touching poles and miscounted clues, in red | spec: A Magnets mistake is drawn apart from the live errors |
| An under-committed clue count is shown in red | untrue: `getCountColor` in `src/games/magnets/render.ts` reddens a short count only once its line has no undecided square left, and an exceeded count at once |
| "Per upstream `check_completion`" | history |
| Scenario: a wrong placement is flagged | spec: Magnets flags mistakes against the unique solution |
| Scenario: a `?` on a neutral domino is flagged | spec: Magnets flags mistakes against the unique solution |

## Magnets grades boards with a tiered deductive solver

| Rule | Where it went |
| --- | --- |
| The solver returns impossible, ambiguous or solved at each difficulty | spec: Magnets grades boards with a tiered deductive solver |
| The verdicts' numeric codes | held: src/games/magnets/solver.ts "Return codes: −1 impossible," |
| The Easy tier's five deductions | spec: The deductions of Magnets' Easy tier |
| The Normal tier's four further passes | spec: The deductions of Magnets' Normal tier |
| A deduction is propagated across a domino to its partner | spec: Magnets grades boards with a tiered deductive solver |
| Scenario: a generated board is uniquely solvable at its difficulty | spec: Magnets grades boards with a tiered deductive solver |

## Magnets renders under the web geometry

| Rule | Where it went |
| --- | --- |
| Rounded-corner dominoes, the magnet symbols, the neutral cross and the blue `?` | spec: What Magnets draws in a square |
| "Per upstream `draw_tile_col`" and the name `NARROW_BORDERS` | history |
| Singleton squares are drawn black | untrue: `drawTileCol` in `src/games/magnets/render.ts` returns before filling when a square is its own partner, so a singleton is the bare background `drawTile` painted |
| The clue counts on all four borders, which side holds which, and the corner symbols | spec: Magnets renders under the web geometry |
| No border beyond a canvas of `(w+2) × (h+2)` tiles | spec: Magnets renders under the web geometry |
| The mistake overlay's color is appended past the base palette | spec: Every Magnets overlay is in the render diff key |
| Every per-cell and per-clue overlay is part of the render diff key | spec: Every Magnets overlay is in the render diff key |
| Scenario: a mistake overlay repaints on a later frame | spec: Every Magnets overlay is in the render diff key |

## Magnets offers an explained hint

| Rule | Where it went |
| --- | --- |
| `hint` is the recording projection of the graded solver, one firing at a time, each narrated with its premise | spec: Magnets offers an explained hint |
| It starts from the player's placed dominoes and `?` marks, and refuses on a solved board or one with mistakes | spec: Magnets offers an explained hint |
| A placing firing is one journey of placement legs, and a cannot-be-neutral firing one journey of `?` legs | spec: A Magnets firing the player can write is one journey of legs |
| A firing that only rules + or − out of a square advances the plan unshown, and the three board facts that say it already | spec: A Magnets firing the board already says is not shown |
| A later step citing such a fact names it in those terms | spec: A Magnets firing the board already says is not shown |
| A press on the way holds the leg and the press that lands it completes it | spec: Following a Magnets leg through its press cycle keeps the plan |
| Scenario: the hint finishes the board | spec: Magnets offers an explained hint |
| Scenario: a hidden fact is one the board shows | spec: A Magnets firing the board already says is not shown |
| Scenario: placing a − through its cycle keeps the plan | spec: Following a Magnets leg through its press cycle keeps the plan |

## A Magnets count premise shows why the rest of its line is ruled out

| Rule | Where it went |
| --- | --- |
| A count premise names in board terms why each other empty square of its line cannot take the pole, a met line named by where it lies from the counted one | spec: A Magnets count premise shows why the rest of its line is ruled out |
| Its evidence is the ruled-out squares and what rules each out, not the rest of the line, and its targets only the squares taking the pole | spec: A Magnets count premise marks what rules each square out |
| A domino along the line says its far end's reason in its own leg, off the board with earlier legs placed, and no earlier leg rings it | spec: A domino along a counted Magnets line gives its far end's reason in its own leg |
| Scenario: the owner's playtest board, what its first step says | spec: A Magnets count premise shows why the rest of its line is ruled out |
| Scenario: the owner's playtest board, what its first step outlines and marks | spec: A Magnets count premise marks what rules each square out |
| The scenario's title, "The owner's playtest board" | history |
| Scenario: a leg forced by the leg before it | spec: A domino along a counted Magnets line gives its far end's reason in its own leg |

## A Magnets hint hatches the line its sentence names

| Rule | Where it went |
| --- | --- |
| A step naming a row or column hatches that line with its squares and both clue slots, and no other | spec: A Magnets hint hatches the line its sentence names |
| A met line cited only as a reason is marked by its clue digit in the evidence color, never an outline | spec: A met Magnets line cited as a reason is marked by its clue digit |
| The outlines of a step naming a row or column each join a square only to its own domino's other half | spec: A met Magnets line cited as a reason is marked by its clue digit |
| A domino step's sentence gives each pole the reason that rules it out at that end | spec: A Magnets domino step gives each pole its own reason |
| Scenario: a count premise hatches its own column only | spec: A Magnets hint hatches the line its sentence names; spec: A met Magnets line cited as a reason is marked by its clue digit |
| Scenario: one end of a domino, both facts read through its partner | spec: A Magnets domino step gives each pole its own reason |

## Magnets calls its pieces tiles when a player reads about them

| Rule | Where it went |
| --- | --- |
| Hint sentences and the help page say tile, magnet, neutral tile, ends or squares and marked magnet, and never domino | spec: Magnets calls its pieces tiles when a player reads about them |
| The code's names for the layout are outside the rule | spec: Magnets calls its pieces tiles when a player reads about them |
| Scenario: no sentence says domino | spec: Magnets calls its pieces tiles when a player reads about them |
| Scenario: the help page says tile | spec: Magnets calls its pieces tiles when a player reads about them |

## An undecided Magnets domino is the collection's cell surface

| Rule | Where it went |
| --- | --- |
| An undecided domino is filled with the cell surface, and a decided one told by its color, never a step of gray | spec: An undecided Magnets domino is the collection's cell surface |
| The pole colors, the neutral color and the `?` mark keep their colors, which the game names | spec: An undecided Magnets domino is the collection's cell surface |
| Scenario: an undecided domino is surface | spec: An undecided Magnets domino is the collection's cell surface |
| Scenario: a decided domino carries the color | spec: An undecided Magnets domino is the collection's cell surface |
