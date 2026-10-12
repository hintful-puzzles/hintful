# palisade: what the cut removes

Before: 31602 bytes, 40 requirements, 61 scenarios.
After: 21596 bytes, 28 requirements, 43 scenarios.

Eleven requirements removed, five cut to one sentence (one of them joined to
another requirement), four trimmed of a sentence or a scenario. The Purpose
now says "what its params refuse, its description encoding" where it said
"its params and description encodings", the params encoding being gone.

| Requirement (title as it stands) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Palisade reddens what the board already contradicts | one scenario cut ("An over-large region reddens its edges") | `border-grid`, "A border-grid game takes the mechanic from the engine and owns no copy", whose third scenario is the same case set in Separate |
| Rules: Palisade checks mistakes against the unique solution | one sentence ("`redraw` SHALL redden each flagged edge.") and the scenario clause that repeats it cut | `ts-engine`, "The midend shows mistakes until the next transition" (the result goes to `redraw`, which draws it highlighted); the edge's color is the palette's `error`, `src/games/palisade/render.ts` `PALETTE` |
| Params: Palisade's parameters are a size and a region size | removed | `paramsCodec` field list in `src/games/palisade/state.ts` (`dims`, `num "n"` with its `whenAbsent: k = w`, `searchTierSegment`) over `paramConfig`; `engine-difficulty`, "A game that searches has a tier for each deduction and Unreasonable above them" (`de`/`du`, the full form only, no letter is Easy); `src/engine/params-stability.test.ts` holds the strings |
| Params: Palisade refuses a region size the grid cannot be divided by | one sentence (the bounds refuse a `w`, `h` or `k` below 1) and one scenario ("A region size of zero is refused by its bound") cut | `bounds: { min: 1 }` on the three fields of `paramConfig`, `src/games/palisade/state.ts`; the refusal's words are built from the bound |
| Params: Palisade's menu offers each board at both difficulties | removed | `BOARDS`, `defaultParams` and `presets` (through `presetGrid`) in `src/games/palisade/state.ts`; `engine-params`, "The preset menu is a grid" |
| Generation: A pasted Palisade board opens at the difficulty it needs | removed | `engine-difficulty`, "A loaded board whose id states no tier takes the lowest tier that solves it" and "A pinned tier is kept or raised and never lowered"; `engine-params`, "A board with a mistake check loads only with exactly one answer"; what Easy means on load is the `difficulty` declaration's `deductionFinishes`, `src/games/palisade/index.ts` |
| Controls: Each button toggles the nearest edge toward its own state | cut to one sentence (an edge holding the other button's state goes straight to the pressed button's) and its scenario; stays a requirement of its own, the only one under `Controls` | `targetVerbs = borderGridVerbs(...)` in `src/games/palisade/index.ts`, whose `primary.does` and `secondary.does` are in `src/engine/border-grid.ts`; `border-grid`, "A border-grid game takes the mechanic from the engine and owns no copy" (nearest-edge hit test, three-state toggle, half-cell cursor) |
| Hint: Palisade offers a deduction-based hint | removed | the `Game` type (`hint`, `hintKeepTrack`); `engine-hints`, "The solver and the hint are two projections of one deduction engine" and "One deduction firing is one journey"; `border-grid`, "Border-grid games share the hint's notation layer" (the game wraps the shared edits in its own move); the plan's order is this spec's "Hint: Palisade's hint runs its deductions in a fixed round" |
| Hint: The hint is seeded from the player's own walls and marks | one sentence cut ("It SHALL then run the six deductions to a fixpoint.") | this spec, "Hint: Palisade's hint runs its deductions in a fixed round" |
| Hint: The hint records every edge the deductions force | removed | this spec's technique requirements ("... settles its edges", "... are all one size", "... share a fate"), which say what each forces and that one firing covers its edges; `engine-hints`, "One deduction firing is one journey" |
| Hint: The solver concludes the same with or without the hint's recorder | removed | `engine-hints`, "The solver and the hint are two projections of one deduction engine" |
| Hint: Each hint leg marks every element its sentence references | removed | the legend, `hintMarks.roles` in `src/games/palisade/index.ts`; `engine-hints`, "A bound hint step's words SHALL name exactly the marks it draws" |
| Hint: The hint refuses when the deductions force no edge | removed | `engine-hints`, "Deduction running out on a sound board SHALL have one wording" and "Deduction runs out only where the tier permits search" |
| Hint: Making the hinted edit completes the step | cut to one sentence (the verdict is side- and button-checked) with its scenario; stays a requirement of its own | `engine-hints`, "A player move is classified against the stored plan"; `border-grid`, "Border-grid games share the hint's notation layer" (the verdict is the engine's; the game's `hintKeepTrack` only hands over to `borderHintKeepTrack`) |
| Hint: The hint paints a firing's edges as one set | removed | the legend's `ring` entry, `src/games/palisade/index.ts`; the palette's `hintEdge`, `src/games/palisade/render.ts` |
| Hint: The hint marks the cells it reasons from inside the cell body | cut to one sentence (for `equivalentEdges` the marked cells are the region, not the clue cell), joined with one scenario to "Hint: Two edges of a Palisade clue that border one region share a fate" | `engine-hints`, "A hint mark is drawn on the cell's border" (names Palisade: inset inside the cell) and "A hint hatches the region its sentence is about"; the legend's `outline` and `stripes` entries; the palette's `hintEvidence` |
| Hint: Palisade's clue layer stays its own | removed | `border-grid`, "Border-grid games share the hint's notation layer" (each game keeps its deduction, its sentences and its move) and "The shared renderer does not know which game is drawing" |
| Hint: Palisade's hint stops where the solver does | removed | `engine-hints`, "A Search is refused and never narrated", "Deduction running out on a sound board SHALL have one wording", "Deduction runs out only where the tier permits search"; that it goes on from what the player then decides is this spec's "Hint: The hint is seeded from the player's own walls and marks" |
| Look: Palisade draws its cells on the collection's quiet surface | cut to one sentence (a clue's cell sits on the lifted surface, the digit in ink) and its scenario; stays a requirement of its own | the palette, `colors` and `PALETTE` in `src/games/palisade/render.ts` (`cellSurface`, `givenSurface`, `INK`, `lineMaybeColor`, `lineNoColor`) |
| Look: A finished region and the solved flash cover the clue cells | cut to one sentence (a finished region fills whole, clue cells included) and its scenario; stays a requirement of its own, since joined to "Look: Palisade shades completed correct regions" that body would be 526 characters | `ts-engine`, "The win flash is one traveling highlight in every game" and "A game gives each element a position, and the route is which position it gives" (the diagonal from the bottom left); `engine-colors`, "A solved flash drawn as a color takes a shared color" |

## Kept against the earlier reader

- **Rules: Palisade reddens what the board already contradicts.** The earlier
  reader would cut it to its last sentence, the clue that is already
  impossible. Its first sentence stays too. `border-grid` names the live error
  model only as "a region over or under size, a wall separating nothing", and
  gives a case for the over-size region alone. It does not say that over-size
  is measured on the squares the no-wall marks join and under-size on a region
  the walls bound, nor that an undersized region reddens its walls. That
  sentence is one list, so it stays whole; the over-size scenario, which
  `border-grid` has, goes. The sentence would read the same with Separate's
  name in it, so its home is `border-grid`, and it leaves here once it is
  there.
- **Hint: Making the hinted edit completes the step**, its second sentence.
  The earlier reader would move it to `border-grid`, which does not say it.
  Until it does, nothing else states that the wrong button on the right edge
  does not complete a step, so it stays here.
- **Look: Palisade draws its cells on the collection's quiet surface.** The
  kept sentence keeps its last clause, "with the digit in ink", which the
  earlier reader's quotation dropped: the digit is drawn by the game's own
  callback, and the palette says only that an ink exists.

Cut where the earlier reader kept, each from a note of theirs: the bounds
sentence and its scenario in "Params: Palisade refuses a region size the grid
cannot be divided by"; "`redraw` SHALL redden each flagged edge" in "Rules:
Palisade checks mistakes against the unique solution"; and "It SHALL then run
the six deductions to a fixpoint" in "Hint: The hint is seeded from the
player's own walls and marks", a second copy inside this spec of the fixed
round.

Removed with a part no requirement elsewhere states in so many words, and
judged covered: "Hint: Palisade's hint stops where the solver does" says the
hint finishes an Unreasonable board once an edge is decided rightly wherever
it stops. `engine-hints`, "A hint finishes a board from a right entry made out
of order", promises that only on a tier with no trial and error. What remains
is that the hint starts from the player's walls and marks, which this spec
keeps; `palisade-tier.test.ts` holds the case.

## What a session loses

- The params string (`{w}x{h}n{k}`, a bare number is a square board in regions of its width): `src/games/palisade/state.ts`, the `paramsCodec` call and the comment above it.
- That a string with no difficulty letter is Easy, and the letter is in the full form only: `openspec/specs/engine-difficulty/spec.md`.
- That a size below 1 is refused, and in what words: `paramConfig` in `src/games/palisade/state.ts`.
- The four boards on the menu and the default: `BOARDS` and `defaultParams` in `src/games/palisade/state.ts`.
- What a pasted board opens as, and what it is refused for: `openspec/specs/engine-difficulty/spec.md` and `openspec/specs/engine-params/spec.md`. Neither names Palisade or gives a Palisade board as a case.
- What the left and the right button do to an edge, and the half-cell cursor: `borderGridVerbs` in `src/engine/border-grid.ts`. The `Controls` subject is left with one sentence about a case of them, and the drag along a line of edges is in neither spec.
- That the hint's plan is the whole chain of forced edges, each leg a two-sided `edges` edit: `openspec/specs/engine-hints/spec.md` and `src/games/palisade/index.ts`.
- When the hint refuses, and that it never searches: `openspec/specs/engine-hints/spec.md`. The `Hint` subject here no longer says when Palisade's hint refuses.
- What each mark of a hint step is (the ring on a firing's edges, the outline, the stripes): `hintMarks.roles` in `src/games/palisade/index.ts`.
- That the marks sit inside the cell body because the border is where walls are: `openspec/specs/engine-hints/spec.md`, "A hint mark is drawn on the cell's border".
- That making the hinted edit completes the step: `borderHintKeepTrack` in the engine. No spec says what the border-grid verdict is; only the wrong-button case is left here.
- That an over-large group of joined squares reddens the edges round it: `openspec/specs/border-grid/spec.md`, in a scenario about Separate.
- That a checked mistake is drawn red on its edge: `openspec/specs/ts-engine/spec.md`.
- The three colors of an edge, and the plain cell surface: `colors` in `src/games/palisade/render.ts`.
- How the win flash crosses the board and what a lit cell keeps: `openspec/specs/ts-engine/spec.md` and `openspec/specs/engine-colors/spec.md`.
