# add-mathrax-hint — design

## 1. The deduction, and why it could not be narrated as recorded

Mathrax's solver is **one** user-solver body (`applyOptions`) wired at three
difficulty rungs. For each cell it intersects the candidate set with the options
of the up to four clues at that cell's corners, then commits whatever the
intersection leaves. The eliminations are therefore forced by *several clues at
once*, and there is no clue a step could honestly name.

**D1. Attribute per clue and return after one, on the recording path only.**
Each surviving elimination is charged to the first incident clue whose options
exclude it, and the body returns as soon as one clue fires — so one
`solver.group`, which is what a hint step is built from, is one clue acting on
one cell. Unequal's `solverLinks` already does this for one `>` sign; the
comment there is the precedent.

The cell's own commit gate is untouched: Easy and Normal still wait on the
*intersection* across every incident clue before committing anything. So this is
a finer attribution of exactly the same eliminations, not a stronger solver —
which matters because the generator is solver-gated, so a stronger recording
path would change which boards exist. Asserted directly rather than argued:
`mathrax-hint.test.ts` "solves identically with and without a recorder" runs 48
(board, cap) pairs both ways and compares the verdict and the written-back grid.

**D2. One clue reason arm, not three.** The obvious shape was an arm per
situation — partner confirmed, partner still open, `E`/`O`. Two of those are not
facts about the deduction at all, they are facts about **the working board at
the moment the step is shown**, which is precisely what
`docs/games/hints.md` § "Re-derive a placement's why" says never to take from
the record. So the reason carries only `{ clue, cx, cy }` and `narrate` reads
the partner off the working grid: "this cell and the 3 across it add to 7" when
a 3 is written there, "nothing open across the 7+ clue adds with 1 or 2 to make
7" otherwise. `E`/`O` splits on `clueType`, which the packed clue already
carries.

The rule generalizes past singles, and the guide now says so: **any sentence
that describes another cell states what the board shows, not what the cube
knew.** The guard is a walk taking `steps[0]` — the step built against exactly
the board that state shows — and checking the named digit really is there.

**D3. The evidence is the clue's cells, because a clue is not on a cell.**
Mathrax's clues sit on interior grid *intersections*. `CandidateHighlights` has
`area`, `targets` and `marks`, all cell-indexed, and adding a fourth role for
one game's geometry is the wrong trade when the cells already identify the clue:
an arithmetic clue's diagonal pair and an `E`/`O` clue's block of four each meet
at exactly one intersection. The pair deliberately draws as **two rings** and
not one contour — the cells share no edge, and `outlineSides` joining them would
outline board the clue does not constrain.

**D4. Auto-pencil joins Mathrax with the family's wording.** The plan's
`autoClean` reads `ui.autoPencil`, so the pref is not optional for a candidate
game; Mathrax gains `autoPencilPref` with Keen's and Unequal's sentence verbatim
and an optional `autoElim` on its `set` move, baked at `interpretMove` time. A
saved move log without the field replays as before, so no player's data moves.

**D5. `clueLabel` moved from `render.ts` to `state.ts`.** The narration names a
clue by what the player sees, so the renderer and the sentence must print it the
same way; one exported function, read by both.

## 2. Measurements

**The hint completes every board it is given.** Every leaf preset shape × 3
seeds (18 boards, 5×5 Easy/Normal/Tricky, 6×6 Tricky, 7×7 and 9×9 Normal),
taking `steps[0]` and recomputing: 18/18 solved, 45–196 steps, no refusal and no
throw.

**Every technique arm is live.** Recorded reason kinds over 16 boards at Normal
and Tricky: `clue` 15,595, `single` 16,333, `dup` 37,317, `set` 582, `forcing`
10. The forcing chain is rare but real, which is why the chain ordinal is drawn
(and why `mathrax` joins `hint-quality.test.ts`'s `LONG_NARRATIONS` chain entry).

**Narration length.** Longest Mathrax-authored sentence measured over that walk:
**113** characters ("The 4÷ clue means this cell and the 1 across it divide to
give 4, so we must cross out 1, 2, 3, 5, 6, 7, 8 and 9"), under the 120 the
cross-game guard holds. The two templates were costed against their worst case —
a two-digit clue number at order 9 with eight struck values — before being
written, which is what kept the "nothing open across…" arm from landing at 121.

**One recorded baseline moved, intentionally.**
`src/capability-surface.test.ts`'s snapshot grew six lines, all in Mathrax's
block: `hint`, `hintKeepTrack` and `refreshHintStep` on the game, `hint` and
`marks` on the draw state, `autoPencil` on the `Ui`. Re-baselined and read line
by line — that is the whole diff, which is what says the sweep grew a game
rather than quietly shrinking one.

**The new guards were proved to fail.** Four planted defects, each turning the
intended cases red and nothing else: dropping the one-clue-per-firing return
(3 red), narrating the paired sentence unconditionally (1), shading the block of
four for an arithmetic clue (4, including both render scenarios), and letting
the recording path ignore the Normal commit gate (1, the with/without-recorder
case).

## 3. What running the app caught that no test did

The hint marks leaked. `HintMarks` with `outer: 0` relies on the cell's own
repaint to erase its band, and Mathrax traces its cell outline a pixel above the
rect it clips to — so the band's top row belonged to no tile, nothing ever
repainted it, and every step the hint moved on from left a stray colored line
across the board. A tier-2.5 recording captures one frame, and a leak is about
the frame *after*, so the whole suite was green through it. Written up in
`docs/games/rendering.md` § "A mark band with `outer: 0` must lie inside the
tile's *clip*, not on its outline".

## 4. Findings on the kit (task 1.3)

What Mathrax had to write that is not about Mathrax. Measured against the tree
on 2026-09-19, not recalled.

**F1. Two fields say only "this is a plain Latin square", and one of them cannot
be answered any other way.** Four games write
`regionsOf: (x, y) => rowColRegions(x, y, w)` verbatim; six write
`singleReason: singleReasonOf`. The second is not a decision at all — a plan
whose `regionsOf` returns `RowColRegion` has no other function of that type to
pass, so the question is answered by the answer to the first one. Add the games
that also write the hidden-single placement area
(`reason.kind === "hiddenSingle" ? hiddenSingleLine(...) : []`, verbatim in
Unequal and Mathrax, inside Keen's and Towers' own `placementArea`) and the
row/column family is re-answering three questions per game. A
`runLatinCandidatePlan` preset that fills them, leaving `record`, `placeWords`
and `strikeWords`, is the shape. Of Mathrax's fourteen-line call, three lines
are Mathrax's.

**F2. `strikeWords` is handed marks and has to dig the acted-on cell back out of
them.** Unequal and Mathrax both compute `{ x: marks[0].x, y: marks[0].y }` to
build the evidence area. The walk has already computed that cell — `cellsOf`
gives the step its `targets` — so it can pass it. And "`marks[0]` is *the* cell"
is true only because `strikeAxis` keeps a firing inside one cell; a game whose
axis lets a firing span cells would quietly name the wrong one, with nothing to
notice. This is the same defect class `candidate-plan-kit` removed from `reads`:
a fact stated twice, in two places, with nothing holding them equal.

**F3. The setup vocabulary is a bundle three games spell identically, and its
third word is derivable.** `populateText("number")` +
`cleanObviousText("number", "standing", "row or column")` is verbatim in Keen,
Unequal and Mathrax. The region phrase is not a decision: Solo, the one game
that could not type the answer, **derives** it from the regions it declares
(`cleanObviousText("number", "placed", joinOr(noRepeatRegionNames(state)))`).
Three games typed what the plan already knows. The placement verb is a genuine
difference and stays a parameter — Towers' towers *stand* where Solo's digits
are *placed*.

**F4. The three `Game.hint` wrappers — a no-go, recorded with its reason.** Six
games write a one-line `candidateHint(state, ui ?? null, findMistakes,
buildSteps)`; eight write `keepCandidateHintTrack`/`refreshCandidateHintStep`
wrappers differing only in how the state names its notes, its grid and its order
(`state.params.o`, `state.order`, `state.cr`, `state.w`). Those are accessors,
not decisions, so the shape is tempting — but folding them away means a game
declaring three accessors to save three three-line wrappers, and the declaration
would be a statement *about* the game rather than a value a mechanism consumes
(`AGENTS.md` § "Two things wear the word 'declaration'"). Declined; the
duplication is a rename away from being fixed by a rename, and costs nothing
while it sits.

F1–F3 are scaffolded as `share-the-latin-candidate-plan`.
