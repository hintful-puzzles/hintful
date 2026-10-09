# Ledger: galaxies

Base: bb004490

Where every rule of the capability went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## Galaxies parameters and presets

| Rule | Where it went |
| --- | --- |
| A width, a height and a difficulty of `Easy` or `Unreasonable`, with the presets 7×7, 10×10 and 15×15 in each | spec: Galaxies parameters and presets |
| Decoding accepts `"7"` as 7×7, `"7x7"`, and a trailing `dn` or `du`, and encoding round-trips | spec: Galaxies parameter strings decode leniently and round-trip |
| The lenient forms and the `n` letter are upstream's | history |
| A width or height below 3, or unreasonably large, is rejected with a human-readable reason | spec: Galaxies refuses a size outside its bounds with a reason |
| Scenario: a preset or a game ID selects a board | spec: Galaxies parameters and presets |
| Scenario: the four strings decode to the expected parameters | spec: Galaxies parameter strings decode leniently and round-trip |

## Galaxies generates uniquely-solvable boards at the requested difficulty

| Rule | Where it went |
| --- | --- |
| For every preset `newDesc` gives a board with one valid association at exactly the requested difficulty, retrying until the grade matches, and never returns an `Ambiguous`, `Impossible` or differently graded board | spec: Galaxies generates uniquely-solvable boards at the requested difficulty |
| Scenario: generated boards are uniquely solvable at the right difficulty | spec: Galaxies generates uniquely-solvable boards at the requested difficulty |

## Galaxies solver and play

| Rule | Where it went |
| --- | --- |
| The solver runs a difficulty-graded deduction chain and, for `Unreasonable`, bounded recursion, and returns one of the five `GalaxiesDiff` verdicts | spec: The Galaxies solver grades by deduction, then bounded recursion |
| The chain is upstream's, by the names `solver_obvious`, lines-opposite, spaces-oneposs, expand-from-dot and extend-exclaves | history |
| `executeMove` is pure for an edge toggle, an association added in a drag, an association removed with its opposite, a dot-hold toggle and the solver's move | spec: Galaxies moves are pure |
| The move types are the letters `E`, `A`/`a`, `U`, `M` and `s` | untrue: a move is a list of ops of kind `edge`, `assoc`, `unassoc` and `hold` with a `solving` flag for the solver's move (`GalaxiesOp` and `GalaxiesMove` in `src/games/galaxies/index.ts`), and no move is a letter string |
| Moving the keyboard cursor redraws without a history entry | spec: Moving the keyboard cursor adds no history |
| `solved-with-help` when the solver was used to get there | spec: Galaxies reports solved from its edges |
| `solved` when every edge-bounded component matches its dot's associations under the symmetry | untrue: `checkComplete` in `src/games/galaxies/state.ts` reads the set edges and the dots only, and a region is valid when it is symmetric about the one dot at its center with no other dot on it and no set edge inside it. No association is read, so the requirement now states the edge condition |
| The association drag is reachable from either mouse button and the keyboard, in either direction | spec: The association drag runs from either button, the keyboard, and either end |
| A left press is resolved by what follows it, a close release toggling an edge and travel past a small slop starting a drag from the press point, which is the association drag unless the press was on an edge's line with no dot under it | spec: A left press is resolved by what follows it |
| A drag from an edge's line toggles every edge passed through its middle that held what the pressed edge held, pressed edge first, turning corners, as one Undo step | spec: A left drag from an edge's line draws walls |
| A press that ends far from where it began commits nothing, the shape pointer cancellation synthesizes, and toggles no edge across the board | spec: A press that ends far from where it began commits nothing |
| Scenario: solving and completion | spec: Galaxies reports solved from its edges |
| Scenario: an unsolvable hand-entered position reports `Impossible` | spec: The Galaxies solver grades by deduction, then bounded recursion |
| Scenario: a release commits the previewed pair as one move and one Undo step, and a release off the board or on an uncommittable tile removes the dragged arrow or else adds no history | spec: A drag's release commits the pair its preview showed |
| Scenario: a release on the source removes the dragged arrow | untrue: `dropDrag` in `src/games/galaxies/index.ts` returns before any op when a classic drag is released on its source tile, so the arrow stays and nothing is committed. The requirement now says a release on the starting tile changes nothing |
| Scenario: the left button distinguishes a click from a drag, first two cases | spec: A left press is resolved by what follows it |
| Scenario: the left button distinguishes a click from a drag, the three walls | spec: A left drag from an edge's line draws walls |
| "exactly as a left click always has" | history |
| Scenario: only a pair reachable by a connected symmetric region avoiding other dots' tiles is offered, by the dot layout alone, and no further than those rules | spec: Only an association some galaxy could contain is offered |
| Scenario: a drag from a plain tile holds the tile and snaps to the nearest legal dot in reach or none, commits tile and partner or nothing, and a press on an arrowed tile still picks the arrow up | spec: A drag from a cell finds its dot |
| Scenario: a bare right click on an empty cell commits nothing | spec: A bare right click on an empty cell does nothing |
| Scenario: the keyboard reaches both drag directions | spec: The association drag runs from either button, the keyboard, and either end |

## Galaxies rendering, animation, and text format

| Rule | Where it went |
| --- | --- |
| Renders the subcell grid, region fills colored by the completion check, dots, set edges, association arrows and the cursor through `GameDrawing`, and associations do not color tiles | spec: Galaxies renders its board through GameDrawing |
| A dot move animates the dot along its shortest path, upstream's `movedot_cb` | untrue: the game has no move that moves a dot (`GalaxiesOp` in `src/games/galaxies/index.ts` has edge, assoc, unassoc and hold), `animLength` returns 0, and upstream's `movedot_cb` is a generator helper |
| Completion triggers a flash | spec: Galaxies flashes on completion |
| The status bar reports the current puzzle's difficulty when known | spec: Galaxies reports its difficulty in the status bar |
| The status bar reports move count and completion state | untrue: `statusbarText` in `src/games/galaxies/index.ts` returns only the difficulty sentence, since the engine took over status-bar wording |
| A plain-text format of the board | spec: Galaxies has a plain-text format |
| Colors derived from the supplied default background, and the outer border painted in the first-draw branch over the midend's ground | spec: Galaxies derives its surfaces from the host background |
| Every color is derived from the default background | untrue: `colors` in `src/games/galaxies/index.ts` derives the surfaces and the grid from the background and pins the dots, the ink, the cursor, the drag, the mistake and the hint colors, as the later requirements of this spec already required. The requirement now says the surfaces |
| The drag previews the snapped target and its partner, each with an arrow in a transient color, the target outlined, and nothing where a release would not commit | spec: An association drag previews discretely |
| Every transient pixel is clipped to a tile and erased by that tile's repaint, with no paint outside the board, no stale frame and no full-board update per pointer move | spec: A transient overlay is clipped to a tile and erased by its repaint |
| Both transient affordances use authored colors, with the reason | spec: The transient affordances use authored colors |
| Candidate dots are ringed and the picked one emphasized, subject to a preference, and the gesture is not gated by it | spec: Candidate dots are ringed during a cell-to-dot drag, by preference |
| Scenario: moves render, completion flashes, the palette comes from the host background | spec: Galaxies flashes on completion; spec: Galaxies derives its surfaces from the host background |
| Scenario: the status bar shows difficulty wording and the board has a text representation | spec: Galaxies reports its difficulty in the status bar; spec: Galaxies has a plain-text format |
| Scenario: no pixel is painted outside what `redraw` declares | spec: A transient overlay is clipped to a tile and erased by its repaint |
| Scenario: the drag preview tracks discretely | spec: An association drag previews discretely |
| Scenario: the drag preview cleans up after itself | spec: A transient overlay is clipped to a tile and erased by its repaint |
| Scenario: the keyboard cursor cleans up after itself | spec: A transient overlay is clipped to a tile and erased by its repaint |
| Scenario: an uncommittable target previews nothing | spec: An association drag previews discretely |
| Scenario: candidate dots are ringed and can be switched off | spec: Candidate dots are ringed during a cell-to-dot drag, by preference |

## Galaxies detects and highlights mistakes

| Rule | Where it went |
| --- | --- |
| Implements `findMistakes`, recovers the unique solution from a cleared copy, and flags wrongly associated tiles and walls set inside one solution region | spec: Galaxies detects mistakes against the unique solution |
| The flag names `F_TILE_ASSOC` and `F_EDGE_SET` | history |
| Both ways the game is played are covered, and wall detection is essential, with its reason | spec: Mistake checking covers walls as well as associations |
| Unassociated tiles and undrawn walls are not flagged, and a board that is not unique flags nothing | spec: What is incomplete is not flagged |
| Flagged tiles and walls take a distinct highlight, drawn while the engine supplies the list and cleared by its lifecycle | spec: Galaxies highlights the mistakes it finds |
| Scenario: a wrong association is flagged | spec: Galaxies detects mistakes against the unique solution; spec: Galaxies highlights the mistakes it finds |
| Scenario: a correct partial board is clean | spec: What is incomplete is not flagged |
| Scenario: a wall inside a single region is flagged, with no arrows at all | spec: Mistake checking covers walls as well as associations; spec: Galaxies highlights the mistakes it finds |
| Scenario: a wall on a true boundary is clean | spec: What is incomplete is not flagged |
| Scenario: a solved board is clean | spec: What is incomplete is not flagged |

## Galaxies is registered in the engine registry

| Rule | Where it went |
| --- | --- |
| `galaxies` is a native TS `Game` in the engine registry, served via the TS midend | spec: Galaxies is registered in the engine registry |
| Scenario: Galaxies loads on the TS engine | spec: Galaxies is registered in the engine registry |

## Galaxies explains its deductions in association vocabulary

| Rule | Where it went |
| --- | --- |
| `hint()` is a recorded projection of the solver, one firing one journey, explaining why and never merely what | spec: Galaxies explains its deductions in association vocabulary |
| A step's action is a move the game has, and a claimed cell brings its partner in the same step, with the symmetry narrated | spec: A hint step's action is a move the game already has |
| The plan carries the deduction through to walls and reaches a solved board from any position asked from | spec: The hint plan finishes the board with walls |
| Evidence is in the hint color legend, dots are named by visible properties, equivalent moves share a color | spec: Hint marks name what the player can see |
| Evidence is highlighted as an area | untrue: no hint role fills a cell. `drawSquare` in `src/games/galaxies/render.ts` outlines the cells a step reasons from and hatches the galaxy the sentence names, and it cites walls and dots as evidence too, so the requirement keeps the legend and names no shape |
| Rule-outs are shown as evidence highlights, not demanded of the player | spec: Hint marks name what the player can see |
| Every rule-out is shown as an evidence highlight | untrue: the sole-owner step marks only the surviving dot and leaves the ruled-out dots unmarked (`marksOf` in `src/games/galaxies/hint.ts`), so the requirement binds a rule-out to evidence only where it is shown |
| The hint's action color is distinct from the drag's | spec: The hint's action color is not the drag's |
| A request on a board with a flagged mistake refuses with the banner and lights the mistakes | spec: A hint refuses on a board with a mistake |
| A stored plan survives the player working ahead | spec: A stored plan survives the player working ahead |
| Every step is a deduction from the board in front of the player, and the hint refuses and says what to do where only a guess remains | spec: The Galaxies hint never guesses |
| An Easy board is carried to solved by deduction, and only an Unreasonable board reaches the refusal | spec: An Easy board is finished by deduction alone; spec: The hint plan finishes the board with walls |
| Galaxies is enrolled in the cross-game hint guards | spec: Galaxies is in the cross-game hint guards |
| The guards' file is `testing/hint-games.ts` | history |
| Scenario: a forced association is taught as one step | spec: Galaxies explains its deductions in association vocabulary; spec: A hint step's action is a move the game already has |
| Scenario: evidence and action in the legend's two colors, neither the drag preview's | spec: The hint's action color is not the drag's |
| Scenario: the plan finishes the board | spec: The hint plan finishes the board with walls |
| Scenario: refusal on a mistaken board | spec: A hint refuses on a board with a mistake |
| Scenario: the plan survives the player committing ahead | spec: A stored plan survives the player working ahead |
| Scenario: deduction running out is said plainly | spec: The Galaxies hint never guesses |
| Scenario: an Easy board is always finished by deduction | spec: An Easy board is finished by deduction alone |

## Galaxies draws its cells on the collection's quiet surface

| Rule | Where it went |
| --- | --- |
| An unfinished cell is the collection's cell surface with the surface grid line, and edges and the border keep their weight and ink | spec: Galaxies draws its cells on the collection's quiet surface |
| A white dot's valid region is the lifted surface, brighter than the cell surface in both schemes, and that is the dot's color for a white dot | spec: A white dot's finished region is the lifted surface |
| A white dot is white and a black dot black in both schemes, each with an ink rim | spec: The dots keep their white and their black in both schemes |
| Scenario: the dots read on a fresh dark board | spec: The dots keep their white and their black in both schemes |
| Scenario: a finished region stands off the cells around it | spec: A white dot's finished region is the lifted surface |
| Scenario: edges are stronger than the grid | spec: Galaxies draws its cells on the collection's quiet surface |
