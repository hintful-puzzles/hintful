# Ledger: loopy

Base: bb004490

Where every rule of the capability went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## Loopy game implements the Game interface

| Rule | Where it went |
| --- | --- |
| `src/games/loopy/` implements `Game` and is registered | spec: Loopy game implements the Game interface |
| Every grid type is supported | spec: Loopy game implements the Game interface |
| The grid types number 18 | figure; held: src/games/loopy/params.ts "export const LOOPY_GRIDS" |
| Loopy's own ordering is distinct from `GRIDGEN_LIST`'s, both survive, with an explicit mapping | spec: Loopy's grid ordering is the wire format |
| The index is frozen into saved game IDs, so entries are not reordered or inserted | spec: Loopy's grid ordering is the wire format |
| Entries MAY be appended to the ordering | spec: Loopy's grid ordering is the wire format |
| Minimum sizes by `amin` and `omin` are Loopy's, and the geometry layer has only maximum-size guards | spec: Loopy enforces each tiling's minimum size |
| The geometry layer leaves minimum sizes out deliberately | reason |
| Scenario: every grid type produces a playable board | spec: Loopy game implements the Game interface |
| Scenario: a game ID round-trips through Loopy's own grid ordering | spec: Loopy's grid ordering is the wire format |

## Loopy descriptions use the upstream run-length encoding

| Rule | Where it went |
| --- | --- |
| One entry per face, a clue as a digit or an upper-case letter, a run of unclued faces as a lower-case letter, long runs split | spec: Loopy descriptions use the upstream run-length encoding |
| A grid description, a separator, then the clue string | spec: Loopy descriptions use the upstream run-length encoding |
| A wrong entry count is rejected, too short told from too long, and unknown characters are rejected | spec: Loopy validates a description against the grid's face count |
| Validation need not detect a geometrically impossible or unsolvable description | spec: Loopy validates a description against the grid's face count |
| Scenario: a generated description round-trips | spec: Loopy descriptions use the upstream run-length encoding |
| Scenario: a description of the wrong length is rejected | spec: Loopy validates a description against the grid's face count |

## Loopy generation recovers from a degenerate grid patch

| Rule | Where it went |
| --- | --- |
| A patch with no landlocked dots is discarded and a fresh description drawn, within a bound | spec: Loopy generation recovers from a degenerate grid patch |
| The minimum sizes are not raised for it, since it depends on the draw and not the size | spec: Loopy generation recovers from a degenerate grid patch |
| Retrying is deterministic, so a seed gives the same board | spec: Loopy generation recovers from a degenerate grid patch |
| So shared game IDs remain reproducible | reason |
| Exhausting the bound raises an error and returns no fallback board | spec: Loopy generation recovers from a degenerate grid patch |
| Scenario: a degenerate patch yields a playable board | spec: Loopy generation recovers from a degenerate grid patch |
| Scenario: generation remains reproducible across retries | spec: Loopy generation recovers from a degenerate grid patch |

## Loopy is playable from the keyboard alone

| Rule | Where it went |
| --- | --- |
| The keyboard can select any edge and set it to any of its three states, on every tiling including the aperiodic ones | spec: Loopy is playable from the keyboard alone |
| The cursor is a dot, a plain arrow walks it along the nearest edge within 90 degrees, and the edge walked becomes the chosen edge | spec: A plain arrow walks Loopy's cursor along an edge |
| Ties break in opposite rotational senses for opposite arrows, which makes the triangular grid walkable | spec: A plain arrow walks Loopy's cursor along an edge |
| An edge tied at one end is the mirror tie for the opposite arrow at the other end | spec: A plain arrow walks Loopy's cursor along an edge |
| A Shift+arrow aims without moving, the first press the nearest edge and a repeat the next one round, wrapping, within `degree` presses | spec: A Shift+arrow aims Loopy's cursor without moving it |
| Coverage is proven mechanically over every preset in two halves, with the Penrose kite/dart residue pinned | spec: Loopy's keyboard coverage is proven over every preset |
| Outside notes mode Enter and Space are the left and right buttons on the chosen edge and the erase key clears it, and in notes mode they note | spec: Enter, Space and the erase key act on Loopy's chosen edge |
| A select does not move the cursor, so a loop is one arrow and one Enter per edge and Enter again undraws | spec: Enter, Space and the erase key act on Loopy's chosen edge |
| A pointer press hides the cursor, and Escape hides it too | spec: Enter, Space and the erase key act on Loopy's chosen edge |
| The keyboard reaches an edge through the code a click uses, so auto-follow applies identically | spec: The keyboard sets an edge through the code a click uses |
| A parallel path would be a second input model and the two would drift | spec: The keyboard sets an edge through the code a click uses |
| The cursor is drawn from grid geometry, a disc under the dot and a halo under the edge, in the cursor color, each beneath the mark it highlights | spec: Loopy's cursor is drawn from grid geometry |
| The cursor is under `ui.cursor` in a Loopy-specific shape, not the grid-cell shape | spec: Loopy's cursor is held under ui.cursor in its own shape |
| An arrow press chooses an edge rather than moving the cursor | untrue: a plain arrow moves the cursor one dot (`moveCursor` in `src/games/loopy/index.ts`, `walkEdge` in `src/games/loopy/cursor.ts`) and only a Shift+arrow chooses an edge without moving it, as the requirement's own second paragraph said, so the shape's reason now names the Shift+arrow |
| This is the collection's first cursor that is not a cell | history |
| The cross-game cursor guard does not see it, and Loopy's own test guards it | spec: Loopy's cursor is held under ui.cursor in its own shape |
| The guarding test is `loopy-keyboard.test.ts` | history |
| Scenario: a keyboard-only player completes a board | spec: Loopy is playable from the keyboard alone |
| Scenario: every edge is walkable, or aimable where the walk cannot reach | spec: Loopy's keyboard coverage is proven over every preset |
| The unwalkable edges on Penrose kite/dart number at most nine | figure |
| Scenario: auto-follow applies to a keyboard selection | spec: The keyboard sets an edge through the code a click uses |
| Scenario: Enter marks the edge behind you and stays put | spec: Enter, Space and the erase key act on Loopy's chosen edge |
| Scenario: Loopy leaves the keyboard-exemption list | spec: Loopy is playable from the keyboard alone |
| Loopy was once on the exemption list | history |

## Loopy pointer and keyboard input, and rendering

| Rule | Where it went |
| --- | --- |
| Played with mouse, touch or keyboard, the pointer by nearest-edge hit testing and the keyboard by the cursor, both through the same code | spec: Loopy pointer and keyboard input, and rendering |
| A click sets an absolute state, so replaying a move is idempotent | spec: Loopy pointer and keyboard input, and rendering |
| Left sets an undecided edge to a line and right to a cross, either clears a decided edge, finger and mouse alike, and notes mode notes instead | spec: Each button sets its own state and clears a decided edge |
| An auto-follow preference of three settings, and a preference for faint excluded lines | spec: Loopy offers auto-follow and faint-line preferences |
| Edges in a fixed color order with mistakes on top, clues at the incenter, every closed loop but the largest highlighted, a flash on completion | spec: Loopy draws edges in a fixed color order with clues at the incenter |
| Clue positions are recomputed when the tile size changes | spec: Loopy draws edges in a fixed color order with clues at the incenter |
| Scenario: a click sets the edge nearest the pointer | spec: Loopy pointer and keyboard input, and rendering |
| Scenario: a keyboard select sets the chosen edge | spec: Loopy pointer and keyboard input, and rendering |
| Scenario: completing a single loop wins | spec: Loopy draws edges in a fixed color order with clues at the incenter |
| Scenario: clue positions survive a resize | spec: Loopy draws edges in a fixed color order with clues at the incenter |

## Loopy grades boards with a four-tier deductive solver

| Rule | Where it went |
| --- | --- |
| Four tiers as deduction rungs run to a fixpoint, with no backtracking or guessing at any tier | spec: Loopy grades boards with a four-tier deductive solver |
| Tricky is not a rung of its own and unlocks inferences within the dline rung | spec: Loopy grades boards with a four-tier deductive solver |
| A dline is indexed the same from the dot and from the face, verified for every grid type, since a mismatch weakens the solver silently | spec: The dline index is the same from the dot and from the face |
| Scenario: the solver grades a board at the intended difficulty | spec: Loopy grades boards with a four-tier deductive solver |
| Scenario: the dline index is consistent from both directions | spec: The dline index is the same from the dot and from the face |

## Loopy checks the board against its solution

| Rule | Where it went |
| --- | --- |
| `findMistakes` reports every line the loop does not use and every ruled-out edge it does | spec: Loopy checks the board against its solution |
| The solution is solved from the clues alone at the top tier, and a board with no provably unique solution reports none | spec: Loopy checks the board against its solution |
| The rule highlighting of `checkCompletion`, of a dot with three lines or a loop that is not the only one, without knowing the answer, is distinct and remains | spec: Loopy checks the board against its solution |
| A mistaken line is drawn in the mistake color and a mistakenly ruled-out edge as a cross in it, faint lines or not | spec: Loopy draws a mistaken edge in the mistake color |
| Scenario: a line the loop does not use is a mistake | spec: Loopy checks the board against its solution |
| Scenario: a ruled-out edge the loop needs is a mistake | spec: Loopy draws a mistaken edge in the mistake color |

## Loopy rules out the edges counting has settled

| Rule | Where it went |
| --- | --- |
| A preference that extends a line-drawing move to exclude the edges at a dot with two lines and of a face whose clue is met | spec: Loopy rules out the edges counting has settled |
| The exclusions are part of the drawing move, so one undo restores the board | spec: The ruled-out edges are part of the drawing move |
| Only a drawn line triggers it, and excluding or erasing extends nothing, and no excluded edge settles a further one | spec: Only a drawn line rules out further edges |
| An edge the player has already set is not changed | spec: The ruled-out edges are part of the drawing move |
| The preference defaults on, a divergence from aids-default-off, justified where an aid discards nothing and removes no decision | spec: Loopy rules out the edges counting has settled |
| Both facts are exact counts, so the player has been spared bookkeeping and told nothing | reason |
| The preference exists because a player may prefer to keep their own board | reason |
| Scenario: a dot's second line rules out its other edges | spec: The ruled-out edges are part of the drawing move |
| Scenario: a satisfied clue rules out its other edges | spec: Loopy rules out the edges counting has settled |
| Scenario: excluding an edge settles nothing further | spec: Only a drawn line rules out further edges |
| Scenario: the preference off leaves the move alone | spec: Loopy rules out the edges counting has settled |

## Loopy shows which lines are joined to the one under the pointer

| Rule | Where it went |
| --- | --- |
| The run of drawn lines under the mouse pointer is highlighted, an edge with no line highlights nothing, and leaving the board clears it | spec: Loopy shows which lines are joined to the one under the pointer |
| So that whether two ends are one run is answered without tracing the board | reason |
| The highlight is derived from the board and the pointer alone, never from a per-segment identity | spec: The hover highlight is derived from the board and the pointer alone |
| Segment identity changes when runs join, and keying on the pointer means the picture changes only when the player moves it | reason |
| A hover makes no move, alters no history and changes no later move, and nothing depends on it | spec: A hover makes no move and nothing depends on it |
| It is a second reader of the completion check's connectivity, not a second notion of it | spec: The hover highlight is derived from the board and the pointer alone |
| The highlight of every closed loop but the largest is unaffected | spec: Loopy shows which lines are joined to the one under the pointer |
| Scenario: hovering a line lights its run and no other | spec: Loopy shows which lines are joined to the one under the pointer |
| Scenario: the pointer leaves | spec: Loopy shows which lines are joined to the one under the pointer |
| Scenario: an edge with no line on it | spec: Loopy shows which lines are joined to the one under the pointer |
| Scenario: a hover that changes nothing repaints nothing | spec: A hover makes no move and nothing depends on it |

## Loopy notes corners and pairs

| Rule | Where it went |
| --- | --- |
| The player notes corners and pairs, on every tiling, with pointer, touch and keyboard | spec: Loopy notes corners and pairs |
| Notes are state and absolute-set moves, covered by undo and replayed by a save, and a save of line moves alone still loads | spec: Loopy's notes are state, set by absolute moves |
| Notes mode is `ui.pencilMode`, off on a new game, toggled by the shared toggle, shown by the shared glyph, and input is unchanged with it off | spec: Notes mode is the collection's pencil mode |
| The gutter is wide enough for a corner note on a rim dot | spec: Loopy's gutter fits a corner note on a rim dot |
| Half of a board's corners are at its rim, and the gutter that fitted the cursor clipped all of them | figure; history |
| A tap cycles the corner it lands in, with the angle read off the corner's face | spec: A tap cycles a corner note and a drag cycles a pair note |
| A drag between edges cycles their pair whatever button class it arrives as, and a release off the board notes nothing | spec: A tap cycles a corner note and a drag cycles a pair note |
| The left button cycles each note one way, the right button and a held finger the other, each through none | spec: Each button cycles a note its own way |
| Enter cycles the corner after the chosen edge, outlined in the cursor color, the erase key clears it, Space pins and pairs, Escape releases a pin first | spec: The keyboard notes corners and pairs at the cursor |
| A corner note is a band in the pencil color, filled or outlined, and a pair note a connector marked `=` or `≠` | spec: Loopy draws a corner note as a band and a pair note as a connector |
| Scenario: a tap in a face's corner notes that corner | spec: A tap cycles a corner note and a drag cycles a pair note |
| Scenario: a drag from one edge to another notes their pair | spec: A tap cycles a corner note and a drag cycles a pair note |
| Scenario: Enter notes the corner a tap would | spec: The keyboard notes corners and pairs at the cursor |
| Scenario: notes survive a save | spec: Loopy's notes are state, set by absolute moves |

## Loopy checks notes against its solution

| Rule | Where it went |
| --- | --- |
| `findMistakes` reports every corner and pair note the solution breaks, and none without a provably unique solution | spec: Loopy checks notes against its solution |
| A mistaken note is drawn in the mistake color, and the hint refuses while one stands | spec: Loopy checks notes against its solution |
| Scenario: a wrong note is a mistake | spec: Loopy checks notes against its solution |

## Loopy explains the next deduction from notes the player can make

| Rule | Where it went |
| --- | --- |
| A hint is refused by the midend when the board is solved or has a mistake, and otherwise is an ordered plan whose steps say why | spec: Loopy explains the next deduction from notes the player can make |
| The plan takes the player's lines, ruled-out edges and notes as facts | spec: Loopy explains the next deduction from notes the player can make |
| The plan is the solver's rungs with a recorder, one firing one step, easiest tier first whatever the board's tier | spec: The hint plan is the solver's own rungs, easiest tier first |
| The generator builds no recorder, so no generated board changes | spec: The hint plan is the solver's own rungs, easiest tier first |
| Every fact a line rests on is first placed as a note by a step of its own, and a fact no line rests on is not placed | spec: A fact a hinted line rests on is first placed as a note |
| A step cites only notes on the board and at most two pairs, a chain placed a link at a time | spec: A hint step cites only notes on the board, and at most two pairs |
| A placed note is drawn in the action color and cited notes in the evidence color | spec: A hint step marks what it sets and what its sentence names |
| A step bands the edges it sets, solid or broken, outlines the clues and rings the dot its sentence names | spec: A hint step marks what it sets and what its sentence names |
| Scenario: a clue decides a corner and its dot settles the edges | spec: A fact a hinted line rests on is first placed as a note |
| Scenario: a chain of pairs is noted a link at a time | spec: A hint step cites only notes on the board, and at most two pairs |
| Scenario: a step cites only notes on the board | spec: A hint step cites only notes on the board, and at most two pairs |
| Scenario: following the plan finishes the board on every tiling | spec: Loopy explains the next deduction from notes the player can make |
| Scenario: a wrong mark refuses the hint | spec: Loopy explains the next deduction from notes the player can make |

## Loopy settles a blocked corner pair in one deduction

| Rule | Where it went |
| --- | --- |
| At the easiest tier, a clue needing all but one open edge with two adjacent dots each carrying a line falls in one firing | spec: Loopy settles a blocked corner pair in one deduction |
| The deduction is stated over the clue, not a digit or a tiling, on the same guard as the one-dot deduction | spec: The blocked-pair deduction is stated over the clue |
| Its conclusions are already reachable by the tier's rungs, so no board is regraded and no description changes | spec: The blocked-pair deduction regrades no board |
| A strengthening that is not conclusion-preserving is measured against a corpus graded both ways first | spec: The blocked-pair deduction regrades no board |
| The hint narrates it as one step ringing both dots, outlining the clue and banding every edge | spec: The hint narrates a blocked pair as one step |
| The excluded edge is named by its two dots and not by a direction, and the sentence describes no path round the clue | spec: The hint narrates a blocked pair as one step |
| Scenario: two blocked dots settle the whole clue at once | spec: Loopy settles a blocked corner pair in one deduction |
| Scenario: the same deduction on a face that is not a square | spec: The blocked-pair deduction is stated over the clue |
| Scenario: teaching the solver the pattern regrades no board | spec: The blocked-pair deduction regrades no board |

## Loopy's presets draw tall, read width first, and turn where the tiling allows

| Rule | Where it went |
| --- | --- |
| Every preset draws no wider than tall | spec: Loopy's presets draw tall, read width first, and turn where the tiling allows |
| A tiling that turns keeps upstream's size, turned where it was landscape | spec: Loopy's presets draw tall, read width first, and turn where the tiling allows |
| A tiling that cannot turn takes a taller size of its own that keeps about upstream's drawn area | spec: A tiling that cannot turn takes a preset size of its own |
| Every tiling that cannot turn takes such a size | untrue: the Honeycomb 10x10 and Floret 5x5 presets in `PRESETS_MORE` (`src/games/loopy/params.ts`) are of tilings that do not turn and keep a square size, so the rule is stated for a preset that upstream draws landscape, as that file's comment has it |
| Those sizes are Triangular 9×14, Kites 4×6, Dodecagonal 3×6 and Hats 9×11 | spec: A tiling that cannot turn takes a preset size of its own |
| Great-Hexagonal 4×5, Kagome 3×6, Great-Dodecagonal 3×6, Great-Great-Dodecagonal 3×5 and Compass-Dodecagonal 4×5 are presets too | untrue: `PRESETS_TOP` and `PRESETS_MORE` in `src/games/loopy/params.ts` hold no preset of those five tilings, which its comment leaves to the Custom dialog, and Compass-Dodecagonal's row says it turns, so the list keeps the four that are presets |
| Preset titles print the width first | spec: Loopy's presets draw tall, read width first, and turn where the tiling allows |
| Upstream's titles print the height first | history |
| Each row of `LOOPY_GRIDS` states `turns`, `transposeParams` turns exactly those, and which tilings turn and which do not | spec: Each row of LOOPY_GRIDS states whether its tiling turns |
| Scenario: titles read width first | spec: Loopy's presets draw tall, read width first, and turn where the tiling allows |
| Scenario: a hexagonal tiling is dealt as chosen | spec: Each row of LOOPY_GRIDS states whether its tiling turns |

## Loopy draws an aperiodic patch again when it is far under its size

| Rule | Where it went |
| --- | --- |
| A patch with half or fewer of the usual faces is not dealt while a larger one can be drawn, with a bounded number of draws | spec: Loopy draws an aperiodic patch again when it is far under its size |
| The usual count is a function of width and height alone, the same for every aperiodic tiling, not a table | spec: Loopy draws an aperiodic patch again when it is far under its size |
| Where no patch reaches that, the largest drawn is dealt, and no size is refused and no deal gives up for small patches | spec: Where no patch reaches its size, Loopy deals the largest drawn |
| The redraw changes only which description is drawn, the grid a description builds does not change, and the draws come from the deal's own stream | spec: A redraw changes only which description is drawn |
| Scenario: a size that usually fills its box is not dealt three faces | spec: Loopy draws an aperiodic patch again when it is far under its size |
| One 5x5 patch in four is three rhombs and the rest have five to eleven | figure |
| Scenario: a size no patch fills deals the largest patch drawn | spec: Where no patch reaches its size, Loopy deals the largest drawn |
| Every 3x14 patch has three faces or six, and the board has six | figure |
| Scenario: a size whose every patch is three faces deals them | spec: Where no patch reaches its size, Loopy deals the largest drawn |
