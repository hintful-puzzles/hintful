# singles

The Purpose's list is corrected: "its params and description formats", "what
its two difficulty tiers mean and what the generator promises" and "its own
legend of marks" named what the spec no longer holds, or never held, and now
read as what its params refuse and its description format, its solver's
techniques and the test its generator adds, and its own colors of marks.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Params: Singles params are a size and a difficulty | retitled "Params: A Singles params string is its declared codec's". Its one sentence (the three fields, `{w}x{h}d{c}` when full, `e` and `k`, `{w}x{h}` otherwise) replaced by one that sends the reader to the declaration and says the game departs nowhere (rule 2). Scenario "Params round-trip" kept: it is the one place `k` is tied to Normal | the fields: `paramConfig`, `src/games/singles/state.ts:103`-`114`; the encoding: `paramsCodec(defaultParams, [dims(paramConfig), choice(paramConfig, "d", "difficulty", DIFF_CHARS, { full: true })])`, `state.ts:126`, with `DIFF_CHARS = "ek"`, `state.ts:33`; `engine-params`, "A game declares its params encoding once, and both codec halves are derived". The `singles` entry of `src/engine/__snapshots__/params-stability.test.ts.snap` holds `8x8dk` and `8x8`; `src/games/singles/singles.test.ts:53` |
| Params: Singles params are refused outside their bounds | title kept. Sentence 2 ("A difficulty letter the encoding does not know SHALL be refused") cut; sentence 1 and both scenarios untouched | `engine-params`, "A params string is read whole or refused" (a letter after a tag that the tag does not list) |
| Params: Normal is refused on a Singles grid under 4 squares both ways | title kept. "The difficulty SHALL NOT be downgraded to Easy" cut; the size under which Normal is refused and the sentence that a grid 4 long either way is dealt as asked kept. Both scenarios kept | `engine-difficulty`, "An unbindable tier is refused, not silently downgraded" (refused through validation, for generation only, and no neighboring tier substituted) |
| Description: Singles descriptions are fixed-length number grids | title kept. The alphabet (digits for 0 to 9, `a`–`z` for 10 to 35, `A`–`Z` for 36 to 61) replaced by a citation; the scan order, one character a cell, and both refusals kept. Scenario kept | `engine-params`, "The engine provides the two desc value alphabets" (`n2c`/`c2n` over `0`–`9`, `a`–`z`, `A`–`Z`, 62 values, in an order that does not change); the game's calls: `c2n`, `state.ts:159`, and `n2c`, `state.ts:174` |
| Generation: Singles generates unique, difficulty-graded boards | retitled "Generation: Singles tests a board one level below with the sneaky deduction". "SHALL deal a board with exactly one solution", "solvable at the requested difficulty", "not solvable one … level below" and "regenerating otherwise" replaced by one clause that names the two shared requirements; the sneaky deduction in the test one level below kept, as the game's addition. Scenario kept | `engine-difficulty`, "Every tier promises one solution found at its cap" and "A difficulty tier binds the board it generates"; regenerating: `engine-difficulty`, "A generator never settles for a lower tier" |
| Controls: Singles toggle moves | title kept. "`interpretMove` SHALL map a left-click / `CURSOR_SELECT`" and "a right-click / `CURSOR_SELECT2`" reworded to "the left-click verb of Singles' `targetVerbs`" and "the right-click verb", which is where a reader finds which input applies which. What each verb does to a cell, clearing included, kept. Scenario kept | `targetVerbs.primary` and `.secondary`, `src/games/singles/index.ts:136`-`140`; `engine-input`, "The engine owns a declaring game's press and select keys" |
| Preferences: Singles show-black-numbers preference | retitled "Preferences: Singles' show-black-numbers preference defaults to off". Of sentence 1, "a single boolean preference" and its label cut; the keyword kept, as what a stored preference depends on; "SHALL default to off" kept. Scenario kept | `prefs` (`name`, `type: "boolean"`), `index.ts:545`-`555`; `ts-engine`, "The engine supports per-game user preferences" |
| Hint: Singles provides an explained deduction hint | removed, with its scenario | a plan of narrated steps: `engine-hints`, "The engine supports an ephemeral Hint System" and "A hint step always names a technique, with no un-narrated fallback"; the plan advances as it is followed: `engine-hints`, "A player move is classified against the stored plan"; from the player's current marks, in deduction order: `engine-hints`, "A hint is deduced from the board in play", and this spec's "Hint: Singles' hint takes the number patterns once and the joining rules last" ("Its plan SHALL open with what the player's own shaded and circled squares force"); "the remaining solution" and the scenario's last clause: `engine-hints`, "A hint finishes a board from a right entry made out of order" |
| Hint: A Singles hint outlines its evidence | retitled "Hint: Every Singles step shows the evidence it rests on". Sentence 1 (`redraw` outlines the step's evidence at the cell's edge) cut; sentence 2 kept, and is the whole of it. Scenario kept | `hintMarks.roles.outline`, `index.ts:521`-`528`; `engine-hints`, "The engine SHALL own the hint mark roles and the words for them" and "A hint mark is drawn on the cell's border"; the cell's edge is also this spec's "Look: Singles edge marks land beside the piece and the ring" |
| Hint: Distinct premise roles in a Singles hint take distinct colors | title kept. Sentence 1 (premise cells in distinct roles are rendered in distinct colors) cut, its reason ("so the highlight does not imply cells share a role they do not") moved onto sentence 2; the corner deduction's two roles and the disjointness kept. Scenario kept | `engine-hints`, "A hint naming several kinds of element colors them by a stable legend" (the kinds a narration names are told apart, each in one color) |
| Hint: Singles hint roles are bands and stripes, never fills | title kept. Sentence 1 (`redraw` distinguishes the element types by a stable color legend) and sentence 3 (the legend is consistent across deductions) cut; sentence 2 kept, without "under the cell's content" (third pass). Scenario kept | `engine-hints`, "A hint naming several kinds of element colors them by a stable legend" (each kind takes one highlight color in all that game's hints; its second scenario is the shaded-square premise); where the stripes lie is `engine-hints`, "A hatch lies over the square's ground and under what it holds" (`dr.drawHatch` before the cell's content, `src/games/singles/render.ts:197`) |
| Hint: Singles hint tracking follows a step cell by cell | removed (third pass), with its scenario "Following the hint advances the plan", which restated it | `engine-hints`, "A step asking for several elements is followed one element at a time"; `trackTargets`, called from `hintKeepTrack`, `src/games/singles/index.ts:453` |
| Hint: A decided premise in a Singles hint takes the color of its state | third pass. Title and both scenarios kept. "a cited shaded premise SHALL be banded `COL_HINT_BLACKREF` and a cited circled premise `COL_HINT_WHITEREF`" and "The band's color SHALL be chosen from the cell's own decided state" cut to one clause that names the game's two slots and its mark, a band; that the forced cell is another color and that the piece or ring stays drawn kept | `engine-colors`, "The two premise references each cite one state of a cell" (`HINT_BLACKREF` for a cell cited for being shaded, `HINT_WHITEREF` for one cited for being circled); the slots are `out[COL_HINT_BLACKREF] = HINT_BLACKREF` and `out[COL_HINT_WHITEREF] = HINT_WHITEREF`, `src/games/singles/render.ts:100`-`101` |
| Hint: The forced cell, the number premises and the corner have their own colors | title kept. "and drawn without the forced mark: the narration says whether to shade or circle" reworded out of sentence 1, and the paragraph rewrapped. All three scenarios kept; "A cell a hint says to shade is drawn empty" is now the game's case of the legend's sentence | `hintMarks.roles.ring` ("It is drawn empty: the sentence says whether to shade it or circle it."), `index.ts:523` |
| Look: Singles completion flash | title kept. "The completion flash SHALL sweep every cell of the board." cut, and the next sentence reworded to stand ("The ground of a cell the completion flash is on"). Scenario kept | `ts-engine`, "The win flash is one traveling highlight in every game" (it lights every element once) and "A game gives each element a position, and the route is which position it gives"; the game's call is `flash.win(sweepStep(x, y))`, `src/games/singles/render.ts:316` |

## Kept, and why

- **Rules: Singles mistake-checking.** `ts-engine`, "A mistake check compares
  with the one answer, hidden or not" does not say the answer is the solve
  from the numbers alone, which cells are compared (a black where the answer
  is white, a circle where it is black), or that an undecided cell is never
  reported.
- **Params: Singles params are refused outside their bounds**, sentence 1. The
  numbers are the items' `bounds` (`state.ts:106`); the reason for 61 is the
  requirement, and it does not stand without them.
- **Params: Normal is refused …**, "A grid 4 or longer either way SHALL be
  generated at the difficulty asked for." The boundary is the game's, and
  differs from upstream's (under 4 in either direction).
- **Solver: Singles deductive solver.** The techniques and which are Normal's
  are what a tier means; three are a declared ladder (`runDeductionFixpoint`,
  `src/games/singles/solver.ts:768`) and four run once before it, by hand.
- **Controls: Singles' keyboard cursor wraps at the grid's edges.** The wrap
  is `wrap: true` on the geometry (`index.ts:125`), a flag the engine
  consumes; no shared requirement says a `targetVerbs` game's cursor stops or
  wraps, and the help page says it by hand too.
- **Hint: A deduction that forces two Singles cells is one step.**
  `engine-hints`, "One deduction firing is one journey" asks for a journey of
  legs; Singles makes one step that sets both cells, which is the departure.
- **Hint: Distinct premise roles … (its last two sentences), The forced cell, the number premises and
  the corner …, A decided premise … takes the color of its state.** The
  legend says a shaded premise, a circled one and the corner each have "a
  color of its own"; which palette slot each takes and that the three roles
  are disjoint are `redraw`'s, written by hand.
- **Hint: Singles hint roles are bands and stripes, never fills.**
  `engine-hints`, "A hint marks beside the content, never behind it" says
  evidence with content is outlined; that in Singles every role is a band or
  stripes, the ring's included, since every cell carries a number, is the
  game's.
- **Hint: Singles' hint takes the number patterns once and the joining rules
  last.** The order is `solveSpecific`'s (`solver.ts:740`): four passes by
  hand, then a ladder of three; `hintRungs` lists ten reason kinds in another
  order.
- **Look: Singles draws pieces on a quiet surface.** As Clusters':
  `engine-colors`, "The engine owns what a board of pieces looks like" says a
  game takes these by reference.

## Engine requests

- Answered: `engine-hints`, "A step asking for several elements is followed
  one element at a time"; the requirement is removed. As filed:
  "`hintKeepTrack` SHALL report `"completed"` when the player's move sets
  exactly the hinted cell(s) to the hinted value, `"onTrack"` (shrinking a
  multi-cell step in place to the cells still outstanding) when the move fills
  a strict subset of a multi-cell step's cells with the hinted value and
  nothing else, and `"off"` otherwise.", the whole of "Hint: Singles hint
  tracking follows a step cell by cell". It is the verdict rule of
  `trackTargets` in `src/engine/hint-track.ts:40`, which Singles, Light Up,
  Tents, Filling, Mosaic, Pattern and Tracks call, and no capability states
  it. Belongs
  in `engine-hints`, beside "A completed verdict vouches for the rest of the
  plan". Light Up and Tents state it of themselves in nearly these words
  (`lightup.md`, `tents.md`): the strongest kind of request.
- Answered: `engine-hints`, "A hatch lies over the square's ground and under
  what it holds"; the clause is cut. As filed:
  "stripes under the cell's content", in "Hint: Singles hint roles are bands
  and stripes, never fills" (and Unruly's "Hint: The named line is hatched
  under its pieces"). Belongs in `engine-hints`, "A hint hatches the one line
  its sentence names", which says the line is hatched and not that the hatch
  lies under what the cells hold. `GameDrawing.drawHatch`, called before the
  cell's content in each game's `redraw` (`src/games/singles/render.ts:195`-`197`).

## Found

- **The spec does not say what a params string with no `d` decodes to.** It is
  Easy (`defaultParams`, `state.ts:86`; `choice` leaves an absent field as the
  default has it), and `engine-params`, "A params string is read whole or
  refused" hands the tier back to the game's spec. An old link depends on it;
  `singles.test.ts:61` holds `decodeParams("6")` as 6×6 Easy.
- **"Params: Singles params are refused outside their bounds" has no scenario
  for its own title's upper bound on width**, and its first scenario ("a
  non-null error string") gives no sentence. Left.
- **"Solver: Singles deductive solver" names techniques by private function
  names** (`singlesep`, `doubles`, `offsetpair`, `allblackbutone`,
  `removesplits`), which the form rule forbids in a spec. Untouched, so the
  cut did not introduce it; `spec-form.mjs` passes it.
- **"Rules: Singles mistake-checking" does not say what `findMistakes`
  returns where the numbers do not solve**: nothing (`index.ts:215`). Such a
  board does not load (`engine-params`, "A board loads only if the game's own
  solver solves it").
- **The spec never states the drag** (`targetVerbs.sweep`, `index.ts:141`);
  declared, so nothing is owed.
- **The cut is small because the spec is.** Two thirds of it is the hint's
  techniques, sentences and colors and the look, none of which a declaration
  or a shared requirement states.
- **No test holds the preference keyword `show-black-nums`** (found in
  review). `src/games/singles/index.ts:547` is its one occurrence under
  `src/`; a stored preference is read back by it. The spec keeps it.

## Review

13 rows read, each against the declaration or the requirement it names, read
whole; 5 rows corrected.

Changed:

- **Params: Normal is refused on a Singles grid under 4 squares both ways.**
  ", as the collection refuses a tier no board requires (`engine-difficulty`,
  …)" cut: a copy with a citation. "Generating at Normal" carries that the
  refusal binds a deal only.
- **Controls: Singles toggle moves.** The sentence that only sent the reader
  to `targetVerbs` and `engine-input` cut; the two toggles now name "the
  left-click verb of Singles' `targetVerbs`" themselves.
- **Preferences: Singles' show-black-numbers preference defaults to off.**
  "SHALL be the one its `prefs` declaration gives" cut, and the keyword
  restored: it was the spec's one statement of a key a stored preference
  depends on, and no test holds it.
- **Hint: Every Singles step shows the evidence it rests on.** "What the
  ring, the outline and the stripes … SHALL be the legend's (`hintMarks`)"
  cut. The subject says what each mark is on and in which color three
  requirements on, so the pointer told a reader nothing.
- Engine requests: `trackTargets` is at `hint-track.ts:40`, and Pearl does
  not call it (seven games do).

Checked and found sound:

- The declarations: `paramConfig` with `bounds: { min: 2, max: MAX_DIM }` and
  the codec (`state.ts:103`-`129`), `DIFF_CHARS = "ek"`, the two verbs and
  `wrap: true` (`index.ts:122`-`141`), the legend (`index.ts:520`-`528`).
- Every cited engine title is exact, and each requirement states all of what
  its row removed.
- The kept pointers: `Params` would say only its refusals without one;
  `Description`'s names `n2c`, the alphabet the format is written in;
  `Generation` would keep only the sneaky deduction, a corner case.
- The two engine requests: no capability states the verdict rule of
  `trackTargets`, or where a line's hatch lies (see `unruly.md`, § "Review").
- "No 3x3 puzzle is Normal." is `noSuchTier`'s sentence for `3x3dk`
  (`state.ts:121`; `singles.test.ts:32`), and `8x8dk` is the snapshot's.
- Each subject read alone: none hollow, no dangling antecedent, every title
  fits its body.

## Third pass

Three rows of the engine tables name Singles: the step followed one element
at a time, the hatch, and the two premise references. The geometry row names
its wrap as staying, and "Not written" its cursor on completion, which the
spec does not state.

- **Hint**, "Hint: Singles hint tracking follows a step cell by cell":
  removed whole, with its scenario.
- **Hint**, "Hint: Singles hint roles are bands and stripes, never fills":
  "under the cell's content" cut.
- **Hint**, "Hint: A decided premise in a Singles hint takes the color of its
  state": which reference cites which state, and that the band's color is
  chosen from the cell's state, cut.

Sentences cut: 2 (one a requirement of one sentence), and 2 clauses; 1
scenario dropped. Clauses kept: the slot names `COL_HINT_BLACKREF` and
`COL_HINT_WHITEREF` and that the mark is a band (the review keeps each
game's slot name and mark shape); that the forced cell is another color and
the piece or ring stays drawn; both scenarios of that requirement, which say
which of Singles' techniques cites a shaded square and which a circled one;
"Controls: Singles' keyboard cursor wraps at the grid's edges" (the game's
`wrap`, by the review).

Section 2 of the brief, two sentences kept, each the one pointer of an owed
subject that would otherwise say nothing of its ordinary case:

- "with no departure from the codec grammar", in "Params: A Singles params
  string is its declared codec's": the other two `Params` requirements speak
  only of what is refused.
- "What a Singles board dealt at a tier promises SHALL be the collection's
  (…), with one addition: …", in "Generation: Singles tests a board one
  level below with the sneaky deduction": it is the whole of `Generation`,
  and without the pointer the subject would hold a corner case alone. What
  the tiers' techniques are is said under `Solver`, not there.

The spec has no pasted-ID sentence. "Rules: Singles mistake-checking" does
not state the empty result, so the mistake row cut nothing.

Each subject read alone: `Hint` says nothing of how a partly followed step
is tracked, which is the engine's; no fragment, every title fits its body.
