# Ledger: ascent

Base: 176780d0
Spec: openspec/changes/turn-the-specs-into-a-reference/pilot/ascent.by-product.md

Where every rule of Ascent's spec went in the by-product form: a rule stays
only where no test, type, declaration or guide holds it. A row that reads
`held:` points at the section of `pilot/held-by-ascent.md` that names, rule by
rule, the test, type, declaration or guide that holds it.

## Ascent game implements the Game interface

| Rule | Where it went |
| --- | --- |
| The area, the Hexagon's shape and the 2×2 Edges grid | spec: Ascent's size limits |
| Everything else | held: openspec/changes/turn-the-specs-into-a-reference/pilot/held-by-ascent.md "## Requirement: Ascent game implements the Game interface" |

## Ascent descriptions use the upstream run-length encoding

| Rule | Where it went |
| --- | --- |
| A run longer than 26 repeats the maximal letter | spec: A long run in a description repeats the maximal letter |
| Everything else | held: openspec/changes/turn-the-specs-into-a-reference/pilot/held-by-ascent.md "## Requirement: Ascent descriptions use the upstream run-length encoding" |

## Ascent input, movement and completion

| Rule | Where it went |
| --- | --- |
| Placing on a given is rejected, and completion needs every arrow satisfied | spec: A given is fixed, and every arrow must be satisfied |
| The Edges drag, drawing and erasing a path, and the endpoint candidates | spec: Ascent's pointer gestures beyond a click |
| The union has four arms | untrue: `AscentMove` in `src/games/ascent/state.ts` has a fifth, `places` |
| Everything else | held: openspec/changes/turn-the-specs-into-a-reference/pilot/held-by-ascent.md "## Requirement: Ascent input, movement and completion" |

## Ascent grades its difficulty tiers honestly

| Rule | Where it went |
| --- | --- |
| What upstream did, and the counts of boards that fell a tier | history; figure |
| Every rule | held: openspec/changes/turn-the-specs-into-a-reference/pilot/held-by-ascent.md "## Requirement: Ascent grades its difficulty tiers honestly" |

## Ascent acts on a pointer button, not on a pointer coordinate

| Rule | Where it went |
| --- | --- |
| What upstream did, and the scope note | history |
| Every rule | held: openspec/changes/turn-the-specs-into-a-reference/pilot/held-by-ascent.md "## Requirement: Ascent acts on a pointer button, not on a pointer coordinate" |

## Ascent solves with a four-tier deductive solver

| Rule | Where it went |
| --- | --- |
| Backbite, clue removal honoring the options, and the Edges matching | spec: How Ascent's generator builds a board |
| Everything else | held: openspec/changes/turn-the-specs-into-a-reference/pilot/held-by-ascent.md "## Requirement: Ascent solves with a four-tier deductive solver" |

## Ascent's square grids turn and its hexagonal grids do not

| Rule | Where it went |
| --- | --- |
| A square-grid preset is 8×10 | untrue: `BOARDS` in `src/games/ascent/index.ts` holds no such board |
| Everything else | held: openspec/changes/turn-the-specs-into-a-reference/pilot/held-by-ascent.md "## Requirement: Ascent's square grids turn and its hexagonal grids do not" |

## Ascent explains the next number

| Rule | Where it went |
| --- | --- |
| The hint does not read lines the player drew | spec: What Ascent's hint reads and says that no test pins |
| Every step places exactly one number | untrue: a whole-run step places several |
| Everything else | held: openspec/changes/turn-the-specs-into-a-reference/pilot/held-by-ascent.md "## Requirement: Ascent explains the next number" |

## Ascent's solver treats the last number like any other

| Rule | Where it went |
| --- | --- |
| Every rule | held: openspec/changes/turn-the-specs-into-a-reference/pilot/held-by-ascent.md "## Requirement: Ascent's solver treats the last number like any other" |

## Ascent's hint follows a run and names the close rival

| Rule | Where it went |
| --- | --- |
| Every rule | held: openspec/changes/turn-the-specs-into-a-reference/pilot/held-by-ascent.md "## Requirement: Ascent's hint follows a run and names the close rival" |

## Ascent always offers a number beside the one selected

| Rule | Where it went |
| --- | --- |
| The one before is offered when the one after is placed | spec: Ascent's pointer gestures beyond a click |
| Everything else | held: openspec/changes/turn-the-specs-into-a-reference/pilot/held-by-ascent.md "## Requirement: Ascent always offers a number beside the one selected" |

## Ascent's hint places a run with one route in one step

| Rule | Where it went |
| --- | --- |
| The squares no other run reaches are striped when they make the route unique | spec: What Ascent's hint reads and says that no test pins |
| Everything else | held: openspec/changes/turn-the-specs-into-a-reference/pilot/held-by-ascent.md "## Requirement: Ascent's hint places a run with one route in one step" |

## Ascent's hint names only numbers the player can see

| Rule | Where it went |
| --- | --- |
| Every rule | held: openspec/changes/turn-the-specs-into-a-reference/pilot/held-by-ascent.md "## Requirement: Ascent's hint names only numbers the player can see" |

## Ascent's hint reads the arrows' lines in Edges mode

| Rule | Where it went |
| --- | --- |
| The Edges techniques come ahead of the run techniques of their tier, and a `pointers` sentence gives each reason when it fits | spec: What Ascent's hint reads and says that no test pins |
| Everything else | held: openspec/changes/turn-the-specs-into-a-reference/pilot/held-by-ascent.md "## Requirement: Ascent's hint reads the arrows' lines in Edges mode" |

## Ascent's Edges hint names a number's own line by its shape

| Rule | Where it went |
| --- | --- |
| Every rule | held: openspec/changes/turn-the-specs-into-a-reference/pilot/held-by-ascent.md "## Requirement: Ascent's Edges hint names a number's own line by its shape" |

## Ascent's Edges hint says when the arrows fix a run's route

| Rule | Where it went |
| --- | --- |
| Every rule | held: openspec/changes/turn-the-specs-into-a-reference/pilot/held-by-ascent.md "## Requirement: Ascent's Edges hint says when the arrows fix a run's route" |

## Ascent offers a number keypad

| Rule | Where it went |
| --- | --- |
| Every rule | held: openspec/changes/turn-the-specs-into-a-reference/pilot/held-by-ascent.md "## Requirement: Ascent offers a number keypad" |

## Ascent draws its cells on a quiet surface and lifts a given

| Rule | Where it went |
| --- | --- |
| The wall, the player's path, the selection wash and the offered number | spec: The colors of Ascent that no frame under test shows |
| Everything else | held: openspec/changes/turn-the-specs-into-a-reference/pilot/held-by-ascent.md "## Requirement: Ascent draws its cells on a quiet surface and lifts a given" |

## Ascent's rulesets are told apart by a square's neighbors

| Rule | Where it went |
| --- | --- |
| Every rule | held: openspec/changes/turn-the-specs-into-a-reference/pilot/held-by-ascent.md "## Requirement: Ascent's rulesets are told apart by a square's neighbors" |

## A square's corners are cut where the path may step diagonally

| Rule | Where it went |
| --- | --- |
| Every rule | held: openspec/changes/turn-the-specs-into-a-reference/pilot/held-by-ascent.md "## Requirement: A square's corners are cut where the path may step diagonally" |
