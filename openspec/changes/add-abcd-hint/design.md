# add-abcd-hint — design

## What the proposal assumed, and what reading the code found

The proposal picked ABCD for three pressures. Two of them dissolved when the
code was read rather than the classification.

1. **"Class B: sweeps the whole ladder before restarting."** False for ABCD.
   Upstream's loop runs techniques 1 and 2 in one pass and tries 3 only when
   neither fired. Technique 1 retires lines and places nothing, so running it
   again straight after itself finds nothing, and the runner's
   restart-at-first-firing walk is the same walk. ABCD adopted
   `runDeductionFixpoint` with no new runner option and its C differential
   untouched, which is the "no-go has genuinely dissolved" tell in
   `docs/games/solver-and-generator.md`. `pearl` and `tents` were not read;
   whether their loops are really class B is for their own changes to derive,
   and this result says not to inherit the label.
2. **"A hint plan needs an order the solver does not have."** The plan already
   owns ordering: each rung returns every firing it can take, and the
   `HintFrontier` chooses among them. A sweeping technique owes the hint only a
   finder that yields one line's firing at a time. No ordering rule was added
   anywhere, in the walk or the game, so there is nothing for `pearl` or `tents`
   to share on this axis.
3. **"A candidate cube, not a bitmask: `NoteEncoding` does not abstract where a
   note lives."** True that it does not, and it should not: the cube was `n`
   contiguous flags per cell (the game already had a `notesOf` locator), which is
   memory layout, not a fact about the puzzle. The proposal's own test (*can we
   say what a game would legitimately want to do differently?*) answers no. ABCD
   now stores one bitmask per cell, which deleted the named exception in
   `mark-all.test.ts` (a slot-arity ledger and a second narrowing branch) and the
   ABCD caveat in `adaptiveMarkAll`'s doc.

## Decisions

**D1. Seismic's shape: parallel finders reading the notes, no recorder.**
`findMistakes` now also reports an empty cell whose notes have crossed out its
answer, so wherever the hint runs the notes are sound, and the rungs read the
candidates the walk shows. The recording projection is therefore zero lines;
the two finders (`satisfiedLines`, `packedLines`) are the whole deduction side.
Technique 2 is the walk's naked singles, and `placeLetter`'s neighbor rule-out is
the walk's `reach`.

**D2. The runs arithmetic is one function.** `runsForce` computes a line's runs,
the most they fit and the forced positions; the solver's rung and the hint's
finder both call it. The claim the sentence makes is checked against brute-force
enumeration of every arrangement for every open pattern up to length 9.

**D3. Runs waits for every other rung** (`nothingEarlier`), as the solver tries
it only when the cheap techniques are spent.

**D4. The grid stores letter `i` as `i + 1`, 0 for empty.** The shared walk and
`candidate-reading.test.ts` both read 0 as blank; ABCD's `-1` made the guard read
every placed A as blank. Moves keep naming letters by index, including the
`solve` move's grid, because the move log is what a save replays: no save
changes. The solver and generator store the same way; the C differential passes
unedited, which is the proof nothing they produce moved.

**D5. The walk writes notes for a cell a later leg places in.** A runs journey
outlines a whole line and places in several of its cells, so its first step rests
on cells the firing has not yet filled. The walk skipped any cell the firing
placed in; it now skips only for the placing leg and those after it (`ts-engine`
delta). Every other game's reading guard is unchanged by it.

**D6. `populate` stays ABCD's default reading.** Measured over every preset plus a
diagonal and a thin board, six seeds each: the implicit plan is 1.03 to 1.40
times as long as the populate plan (7x7 three letters 1.03 and the 3x9 thin board
1.06 at the short end; 5x5 four letters 1.40 at the long one). The convention
holds; no override.

## Cost, in the series' terms

- Game production lines for the hint: `hint.ts` 342 and `hint-text.ts` 101
  (295 and 68 non-comment), plus the hint half of `render.ts` (the overlay
  sidecar, hint marks, hatch and clue coloring).
- Of those, the recording projection: **0**. The finders are about 60 lines.
- Engine: one clause of the implicit reading's note-leg rule
  (`candidate-plan.ts`), and a cross-game test simplified.
- Not near `SEARCH_PLANNING_GAMES`: the plan is deductive and the hint test file
  runs in about a second.
