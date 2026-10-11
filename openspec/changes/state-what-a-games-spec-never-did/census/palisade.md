# palisade

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: a digit `0`-`4` a clue, a letter a run of clueless squares | stated | "Palisade descriptions are run-length clue grids" |
| desc | what the parser refuses | stated | "Palisade descriptions are run-length clue grids" |
| desc | the board a description opens | stated | "A new Palisade board holds its clues and only the rim walls" |
| desc | `supersededDesc` | not-owed | The game has none (`facts.json`: `supersededDesc: false`) |
| params | `{w}x{h}n{k}` and the `d` letter with `e` and `u` | stated | "Palisade's parameters are a size and a region size" |
| params | what the short form leaves out: the difficulty | stated | "Palisade's parameters are a size and a region size" |
| params | a bare number: a square grid in regions of its width | stated | "Palisade's parameters are a size and a region size" |
| params | refusal: `k` not dividing `w·h`, `k = w·h`, `k = 2` on a board wider and taller than 1 | stated | "Palisade refuses a region size the grid cannot be divided by" |
| params | refusal: width times height too large | not-owed | `engine-params`: "A grid too large for a game is refused in one sentence" |
| params | refusal: a `w`, `h` or `k` below 1 | stated | "Palisade refuses a region size the grid cannot be divided by" |
| params | refusal: Unreasonable on a strip or in regions of one | stated | "Palisade refuses Unreasonable where no board needs it" |
| pref | (none) | not-owed | The game has none (`facts.json`: `prefs: []`) |
| control | left click: wall or unknown; right click: no-wall mark or unknown | stated | "Each button toggles the nearest edge toward its own state" |
| control | the half-grid cursor, and select on the edge it rests on | stated | "Each button toggles the nearest edge toward its own state" |
| control | a drag along a line of edges | not-owed | `engine-input`: "A sweep honors its declared limits and skips no target" (the sweep is the shared border-grid declaration's, and the game adds nothing to it) |
| control | the rim takes no edit | stated | "The grid rim cannot be edited" |
| control | `requestKeys` / the keypad | not-owed | The game has none (`facts.json`: `keypad: null`) |
| hint | rung `cluesVersusRegionSize`: two clues side by side | gap | "Two Palisade clues side by side are walled apart where their region would be the wrong size" (new) |
| hint | rung `numberExhausted`: a clue that is full, or needs every edge left | gap | "A Palisade clue that is full, or needs every edge left, settles its edges" (new); the full half was a clause of "The hint records every edge the deductions force", and the wording of both a clause of "A multi-edge firing says why its edges are forced together" |
| hint | rungs `notTooBig` and `notTooSmall`: regions are all one size | gap | "Palisade regions are all one size, in the hint as on the board" (new); each was a scenario only, of "A hint sentence is advice that has not been applied" and "The hint marks the cells it reasons from inside the cell body" |
| hint | rung `noDanglingEdges`: a wall at a corner | gap | "A Palisade wall does not stop at a corner" (new) |
| hint | rung `equivalentEdges`: two edges into one region | gap | "Two edges of a Palisade clue that border one region share a fate" (new); what it says is "A multi-edge firing says why its edges are forced together" |
| hint | the order the six are tried in | gap | "Palisade's hint runs its deductions in a fixed round" (new); "Palisade offers a deduction-based hint" says the plan is in discovery order and not what that order is |
| hint | what the plan starts from | stated | "The hint is seeded from the player's own walls and marks" |
| hint | the voice of a sentence, and a firing of several edges | stated | "A hint sentence is advice that has not been applied"; "A multi-edge firing says why its edges are forced together" |
| hint | the marks | stated | "Each hint leg marks every element its sentence references"; "The hint paints a firing's edges as one set"; "The hint marks the cells it reasons from inside the cell body" |
| hint | the refusal where nothing is forced | stated | "Palisade's hint stops where the solver does"; "The hint refuses when the deductions force no edge" |
| words | the status bar | gap | "The Palisade status bar gives the region size" (new) |
| words | the preset titles | not-owed | `engine-params`: "One describer labels every params set" |

## Defects

None. `help/games/palisade.md:36-58` names five ideas, which are the six
deductions of `src/games/palisade/solver.ts:174-395` with the two about a
region's size under one heading.

## Notes

- **The spec named the six deductions and stated two of them.** "The hint is
  seeded from the player's own walls and marks" says "the six deductions";
  three requirements use `equivalentEdges`, `numberExhausted`, `notTooBig`
  and `notTooSmall` as names; the two-clue rule and the corner rule appeared
  nowhere but as "a clue pair" and "the four squares at a corner" in a list of
  marks. The six new requirements are where each is said.
- **The help lists its ideas "from the plainest up" in an order that is not
  the order they are tried in.** `help/games/palisade.md:46-52` puts "Two
  clues side by side" fourth; `src/games/palisade/solver.ts:399` runs it
  first, once. The help does not claim to give the order tried, so this is
  not a defect, and the two-clue idea is the hardest to follow of the five.
- **A bug: a region rule joins without a step, and later sentences count
  the join.** Where an undersized region has several undecided edges all
  into one other region, `src/games/palisade/solver.ts:288-297` joins the two
  and records no edge. "The hint records every edge the deductions force"
  says as much (a no-wall is recorded where the growth target "is reached by
  exactly one undecided edge"), so the behavior is the spec's. But a later
  step then states a size the board does not show. Measured 2026-10-11 by
  the writer: over the plans of 60 dealt Easy boards (twelve seeds each of
  `5x5n5`, `6x8n6`, `8x10n8`, `6x6n3`, `6x6n4`), each step played before the
  next was read, 134 of the 1964 steps whose sentence gives a region's size
  ("has 4 of its 5 cells", "would make 9 cells") gave one that the no-wall
  marks then on the board do not add up to. The instrument compares the
  number in the sentence with the squares the board's no-wall marks join, so
  it counts only sentences that name a size. `engine-hints`'s "A hint relies
  only on marks the player can make" is the rule at stake. Recommendation:
  record such a join as one firing that marks every undecided edge between
  the two regions as open.
- **The same, reproduced by the reviewer through the midend, 2026-10-11.**
  Each board was opened with `newGameFromId`, and the plan followed with
  `hint()` and `executeHint()` a step at a time, the displayed step
  (`activeHintStep()`) read against the board as it stood before the step
  was played. A region's size on the board was counted afresh, as the
  squares joined by a no-wall mark on either square's side of an edge, and
  not with the game's own `buildDsf`. That is the measure the help gives
  ("a group of squares your own 'no wall' marks already join",
  `help/games/palisade.md:30-32`) and the one the hint is seeded from. Where
  the instrument agrees it shows it reads the sentence rightly: on
  `5x5n5:23d2e2c2e232` and `5x5n5:a2a1a2b2e1e33`, the two boards the
  scenarios quote, all 15 and all 19 sized steps match.
  - Over 60 dealt Easy boards of the reviewer's own seeds (twelve each of
    the five params above), 123 of 1924 sized steps did not match, on 28 of
    the 60 boards. Every board still finished.
  - On `5x5n5:2j2a3d1c333`, 2 of 17 sized steps do not match. Step 34 of 37
    says "This region has 4 of its 5 cells and just one way left to grow, so
    this edge can't be a wall.", rings the edge between column 2 and column
    3 of row 1 (counted from zero), and stripes the squares (1,1), (2,1),
    (1,2) and (2,2). The board then shows no-wall marks joining (1,1) to
    (1,2) and (1,2) to (2,2), a region of three, and no mark on any side of
    (2,1): a wall above it and its other three edges undecided. The
    three-square region's only two undecided edges both lead to (2,1), which
    is the join made with no step. Step 37 then says "Joining these two
    regions would make 9 cells" of an edge whose two sides the board shows
    as regions of 2 and of 4.
  - The delta states the rule and not this: "Palisade regions are all one
    size, in the hint as on the board" has a region grow through its one
    undecided edge, and says a size a step gives is one the board shows. The
    code breaks its last clause in the cases above.
- The existing requirements name rungs by their ids (`equivalentEdges`,
  `notTooBig`), which the brief says a spec does not do. They were left as
  they are: rewording them is a change to requirements this pass was not
  given.
