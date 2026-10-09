# Verdicts: signpost

## keep `signpost`: Signpost reports mistakes for Check & Save

The ambiguous-board sentence is reachable, so it is not `collection`. A
Signpost desc the solver leaves stuck does load: `solverVerdict` in
`src/engine/desc-error.ts` asks a game with no difficulty contract only through
`finishesByDeduction`, treats its absence as yes, and Signpost declares
neither; `answerVerdict` refuses only `NO_SOLUTION` and `MULTIPLE_SOLUTIONS`,
and Signpost's `solve` answers a stuck board with `PUZZLE_NOT_REASONABLE`. So
`findMistakes` returning nothing on such a board is what a player gets, and
the sentence and its scenario stay. The other doubt about this requirement,
that a wrong link out of a given showed nothing red, no longer holds:
`render.ts` has `F_MISTAKE`, which colors a given's number, and the
requirement's second scenario says so.

## keep `signpost`: Signpost generates solver-gated boards reproducibly

No shared requirement states that a seed deals one board, and the app still
deals from a `params#seed` ID (`app-shell` "A seed ID still deals a game"), so
more than this game's test relies on it. It stays until a shared requirement
exists; `verdicts/spokes.md` carries the note.

## keep `signpost`: An arrow follows a Signpost drag

It is what the player sees during the game's main gesture, and a rule about a
control's look does not wait on the controls being specified. That the spec
states no controls is a gap to fill (the note below), not a reason to remove
the one piece of the drag it does state.

## keep `signpost`: Signpost solves by forced-link deduction

The three-way verdict is read outside `solver.ts` as a rule. `solve` in
`src/games/signpost/index.ts` answers an impossible board with `NO_SOLUTION`
and a stuck one with `PUZZLE_NOT_REASONABLE`, and `loadDesc` refuses a desc on
the first and loads it on the second, so which of the two the solver reports
decides whether a hand-typed board opens.

## note Signpost's controls and its hint have no requirement

The spec states no control and nothing of the hint, and both are on the list of
what a spec holds. They exist and are documented for the player:
`help/games/signpost.md` gives the controls (left-drag to the square that
follows, right-drag to the one that precedes, a drag off the grid to break
links, Enter and Space with the cursor), and `src/games/signpost/hint.ts`,
`hint-text.ts`, `hint-marks.ts` and the `hintMarks`, `hintRungs`,
`hintKeepTrack` and `hintGesture` entries of `index.ts` are the hint. Writing
them is a change of its own, from the code and the help page; this pass adds
nothing.

## note An untiered game without finishesByDeduction loads a board its solver cannot finish

`engine-params` "A board loads only if the game's own solver solves it" says
the engine refuses such a desc "whoever wrote it", and
`docs/games/solver-and-generator.md` says an untiered deductive game declares
`Game.finishesByDeduction`. Four games do (Net, Mines, Range, Rectangles).
Signpost, Crossing and Sticks have a mistake check, no difficulty contract and
no `finishesByDeduction`, and `solverVerdict` reads the missing hook as "yes",
so a hand-typed board their solver leaves stuck loads, its mistake check
reports nothing and its hint has nothing to say. I read this off
`src/engine/desc-error.ts` and each game's `solve`; I did not run it. Either
the three games owe the hook (a compatibility question only for descs no
generator of ours or upstream's writes), or the shared requirement owes the
words "for a game that declares how". Nothing guards it: no test asks which
untiered games lack the hook.
