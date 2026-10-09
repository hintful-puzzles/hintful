# Verdicts: slant

## keep `slant`: The hint's recorder leaves the generator's solve unchanged

A session changing the solver for the hint does check against it. Recording
and seeding are options of `slantSolve` (`record`, `seedFrom`, `seedAlike` in
`src/games/slant/solver.ts`) on the one solver the generator calls, and the
requirement about reproducible generation says nothing of them: a seed passed
by default would still deal the same board twice, and a wrong one. `engine-hints`
"The solver and the hint are two projections of one deduction engine" says the
generator runs with the recorder off and does not mention a seed.

## keep `slant`: Slant solves with a graded deductive solver

That Solve and the mistake check use the one solver is a decision, not a
detail: it is why a board Solve finishes is never one Check & Save calls
wrong. No shared requirement says a game's `solve` and `findMistakes` must
share a solver, so the sentence has no other home.

## keep `slant`: A clue is drawn on a lifted disc

A test is not a home. That a clue on the outer border of the point grid is
drawn at all is what a player would notice broken, and the ring of tiles is
where a session looks when it is not: `src/games/slant/render.ts` diffs a
`(w+2)×(h+2)` grid for that reason, and a renderer rewritten over `w×h` tiles
would drop every border clue.

## note the two tile-cache requirements cut as `how` stay cut

"Every hint bit is part of what the tile cache compares" and "The drawstate
diffs a packed word for every tile and the ring" are in no regrouped spec. The
hint half is held for every game: `engine-drawing` "The warm-frame comparison
answers for what it reached" fails a hinted game that is never shown its hint,
and "The comparison shows a hint and walks its plan to the end" paints each
step on a warm draw state. The mistake half is not held by the shared run,
which counts mistake frames and does not require them. It is stated for every
game with a tile cache by `docs/games/rendering.md` § "Prove the overlay
repaints", and Slant's own test does it
(`src/games/slant/slant.test.ts`, "repaints a mistake overlay onto an
unchanged tile"). Nothing to restore.

## note Slant's spec need not say when its hint gives up

`slantHint` returns `DEDUCTION_EXHAUSTED` when no firing is found. Slant has a
difficulty contract with no tier that permits search, so `engine-params` "A
board loads only if the game's own solver solves it" keeps out any board the
ladder cannot finish, and `engine-hints` "Deduction runs out only where the
tier permits search" fails the walk if the refusal is ever reached. The arm is
a guard and not a behavior a player meets, so the spec is right to be silent.
