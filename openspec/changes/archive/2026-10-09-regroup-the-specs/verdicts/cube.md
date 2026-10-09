# Verdicts: cube

## cut `cube`: Cube has a status bar and neither a solver nor a text format

type: which hooks the game object carries is what `cubeGame` in `src/games/cube/index.ts` says, and the scenario only inspects it. The "SHALL NOT provide `solve`" and "no hint" are not decisions: `ts-engine`, "A game's contract sections are implemented, not applicable, or absent, and an absent one makes it a draft", makes Cube a draft for exactly those absences, "A not-applicable reason is a fact about the puzzle" forbids a hint ever being not applicable, and `openspec/changes/hintless-games-in-reserve/proposal.md` names Cube among the games still owed a hint. The mistake-check half is the declared `notApplicable.findMistakes` sentence, which the help page shows. That completion is reported in the status bar is kept by "Cube has no win flash".

## keep `cube`: Cube draws the solid in projection and animates a roll

The shear and the culling are what the player sees, not the algorithm: the
solid is drawn as a three-dimensional body seen from one side, with the faces
turned away not drawn, and it tips over an edge during a roll. No other
requirement says how the solid looks in projection, and a session changing
`render.ts` would check against it.

## keep `cube`: Cube draws the solid as the one object on the board

It is the game's own look, written by the change that gave the boards their
identity (`openspec/changes/archive/2026-10-08-give-the-boards-a-visual-identity/`),
and `src/games/cube/render.ts` does it (`COL_SOLID` is `givenSurface`,
`COL_PAINT` is `MOVED`). Whether it is an exception to the steered-figure rule
is the note below; that does not make this requirement doubtful.

## note `engine-colors` "The figure the player steers takes the cursor's color" does not say what Cube does

Cube's solid is the figure the player steers, and its plain faces are the
lifted surface, not the cursor role. The tree shows the two were written two
days apart by one line of work (`docs/games/rendering.md`, the bullet "The
pair's hues are the board's content beyond two states", names Cube's paint as
`MOVED` and says "the figure they steer is `CURSOR`'s green"; the Cube
requirement followed on 2026-10-08) and nothing records Cube as an exception.
My reading, not a recorded decision: the solid's faces have to show which of
them carry paint, so the face cannot itself be a hue. Whoever settles
`engine-colors` should either narrow that requirement to a figure that carries
nothing on itself or name Cube as the exception; and by `engine-colors`, "A
departure from a shared role is stated at the assignment", the `COL_SOLID`
assignment in `src/games/cube/render.ts` owes a line of reason, which it does
not have (no cross-game check finds it, because the slot is not named for a
cursor).

## note `cube` has no requirement for its description format, its controls or its params limits

The prune found none to keep and this pass may not add one. What the code
does, for a follow-up: the description is the painted-square mask in uppercase
hexadecimal, four squares a digit with the first square in the high bit and
the unused low bits of the last digit clear, then a comma and the start
square's index (`parseDesc` in `src/games/cube/state.ts`). `validateParams`
refuses a square grid with a side under 2, a triangular grid with both numbers
0, a grid with too few squares of some class to hold the painted squares, and
a grid without one square to spare for the solid. The one move requirement
says which rolls exist but not which key or click makes each.
