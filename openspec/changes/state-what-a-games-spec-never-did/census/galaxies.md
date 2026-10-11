# galaxies

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: run-length letters over the places a dot can be | gap | "Galaxies descriptions run-length encode the dots" (new) |
| desc | what `newState` refuses | gap | "Galaxies descriptions run-length encode the dots" (new) |
| params | `WxH`, and a bare `W` as a square | stated | "Galaxies parameter strings decode leniently and round-trip" |
| params | the `d` segment, `n` Easy and `u` Unreasonable | stated | "Galaxies parameter strings decode leniently and round-trip" |
| params | what the short form leaves out (the `d` segment) | gap | "Galaxies' short params form is the size alone" (new) |
| params | refusal: a width or height outside 3 to 100 | gap | "Galaxies refuses a size it cannot deal" (new) |
| params | refusal: a 3×3 at Unreasonable, when dealing | gap | "Galaxies refuses a size it cannot deal" (new) |
| pref | `galaxies-show-drag-candidates` | stated | "Candidate dots are ringed during a cell-to-dot drag, by preference" |
| control | a left click on an edge | stated | "A left press is resolved by what follows it" |
| control | an edge that takes no line because a dot is in the way | gap | "A line cannot be drawn through a dot" (new) |
| control | a left drag along edges | stated | "A left drag from an edge's line draws walls" |
| control | a drag from a dot to a square, either button | stated | "The association drag runs from either button, the keyboard, and either end" |
| control | a drag from an empty square to a dot | stated | "A drag from a cell finds its dot" |
| control | picking up an arrow, dropping it off the board | stated | "A drag's release commits the pair its preview showed" |
| control | a right click with no drag | stated | "A bare right click on an empty cell does nothing" |
| control | a press that ends far from where it began, a canceled press | stated | "A press that ends far from where it began commits nothing" |
| control | Enter or Space on a dot, an arrow or a square, the arrows steering the drag | stated | "The association drag runs from either button, the keyboard, and either end" |
| control | where the arrows take the cursor, and Enter or Space on an edge or a corner | gap | "The keyboard cursor steps by half a square" (new) |
| hint | `dotTile`: a dot's own squares | gap | "The hint gives a dot the squares it sits on and the squares walled in with it" (new) |
| hint | `enclosed`: every way out leads into one galaxy | gap | "The hint gives a dot the squares it sits on and the squares walled in with it" (new) |
| hint | `soleOwner`: only one dot could own the square | gap | "The hint settles a square only one dot can own" (new) |
| hint | `onlyReach`: only one galaxy reaches the square | gap | "The hint settles a square only one dot can own" (new) |
| hint | `exclave`: a cut-off piece's one way back | gap | "The hint takes a cut-off piece back to its dot through its one free square" (new) |
| hint | `separate`: a wall between squares of different dots | gap | "The hint draws a wall between two galaxies and mirrors a wall through a dot" (new) |
| hint | `mirrorWall`: a wall mirrored through a dot | gap | "The hint draws a wall between two galaxies and mirrors a wall through a dot" (new) |
| hint | the order the deductions are tried in | gap | "The Galaxies hint tries its deductions in one order" (new) |
| hint | the partner comes in the same step and is ringed once | stated | "A hint step's action is a move the game already has" |
| hint | the refusal where deduction runs out | stated | "The Galaxies hint never guesses" |
| hint | a step the player has made ahead of the plan | stated | "A stored plan survives the player working ahead" |
| words | the status bar: `Difficulty Easy.` | stated | "Galaxies reports its difficulty in the status bar" |
| words | the preset titles | not-owed | `engine-params`: "A board's tiers are one run of lines, and every tier is offered" |

## Defects

- **The keyboard cannot pick up a dot that sits on an edge.**
  `help/games/galaxies.md:31` says "The keyboard can drag too: on a dot, an
  arrow or an empty square, Enter or Space starts the drag". In
  `src/games/galaxies/index.ts:760` the keyboard's drag is taken only where
  `edgeGeometry.cursorTarget` is `null`, and `cursorTarget`
  (`src/games/galaxies/index.ts:307`) answers every edge inside the border, a
  dot on it or not. So Enter on such a dot goes to the edge's verb, which
  refuses a line through a dot, and nothing happens. Reproduced by the
  reviewer on `kebizmfzgbfvfu` under `7x7dn`, through the midend: from a
  fresh board the player presses Right, Right, Down, which puts the cursor on
  the dot on the edge under the second square of the top row, the place
  (3,2), and then Enter. Nothing changes: no drag opens, no line is drawn,
  nothing can be undone, and the midend reports the key as not taken. Space
  does the same. All three of that board's edge dots, at (3,2), (5,2) and
  (4,13), behave so, where its seven dots inside a square and its two on
  corners, at (6,6) and (12,8), each open the drag. The player's way round is
  the other direction: Right, Right, Enter on the square above, Down onto the
  dot, Enter, which sets the arrows. The tree's "The association drag runs from
  either button, the keyboard, and either end" promises the drag "from a dot
  out to a cell" from the keyboard, and that is what such a dot lacks. No
  requirement of the delta states it: "A line cannot be drawn through a dot"
  speaks of a click on such an edge, and "The keyboard cursor steps by half a
  square" of Enter on an edge that holds no dot.
- **The hint's sentence and the help give a reason for "only one dot could
  own a square" that is false of most boards it is said on.**
  `help/games/galaxies.md:49` says every other dot "would need the square
  opposite it to be off the board or on top of another dot", and the step
  says `Any other dot mirrors this cell off the board or onto a dot`
  (`src/games/galaxies/hint-text.ts:132`). The firing
  (`src/games/galaxies/hint.ts:136`) counts the dots that pass
  `okToAddAssocWithOpposite` (`src/games/galaxies/moves.ts:100`), which also
  drops a dot the square cannot be reached from through squares no other dot
  stands on, and a square or partner inside a finished region. Measured by
  the reviewer over 400 dealt boards (100 each of `7x7dn`, `7x7du`,
  `10x10dn`, `10x10du`), following the hint from the fresh board and reading
  the first step of each plan, 33,265 steps of which 4,049 were this one: in
  2,544 some other dot was dropped though its mirror of the square is on the
  board and on no square a dot sits on or touches, and in 3,765 if "onto a
  dot" is read as a dot in the middle of the mirror square. One board:
  `7x7dn:dikpfzjxgexcv`, after following 17 hints, gives the third square of
  the second column, at (3,5), to the dot below it at (3,7); the dot on the
  edge at (8,9) mirrors that square onto the bottom-right square, which is
  on the board and holds no dot, and is dropped only because no connected
  galaxy about it reaches so far. The new requirement states the test, and
  its scenario quotes the sentence only where the sentence is true.

## Notes

- Both defects are bugs to file against the game. The first: the keyboard
  branch should look for a dot under the cursor before asking whether the
  cursor is on an edge. The second is the hint's words: of the dots the
  measurement saw dropped for neither of the sentence's two reasons, 3,337
  were dropped for reach alone and 1,217 for a finished region, so a true
  sentence has to say that no galaxy about the other dots stretches to the
  square, and the help's paragraph with it.
- The hint scenarios the writer read from the code were each seen on a dealt
  board in that run, with the words the delta quotes: a dot's own squares
  for a dot on an edge and on a corner, the wall between squares that "point
  at" and that "go with" different dots, a walled-in square with two, three
  and four ways out, the cut-off piece, and the mirrored wall against a wall
  and against the board's edge. "The only way out", a walled-in square with
  one, did not come up in 33,265 steps and is read from
  `src/games/galaxies/hint-text.ts`. The cut-off piece's free squares are
  counted without regard to walls (`solverExtendExclaves` in
  `src/games/galaxies/solver.ts`), and the scenario was corrected to say so.
- The generator sets no black dot, so a capital letter is in a hand-typed
  description only; the black-dot letters are read from `parseDesc` in
  `src/games/galaxies/state.ts` and run by altering one letter.
- The status bar can also read `Difficulty Unreasonable.`, and for a board
  the solver cannot grade, `Impossible`, `Ambiguous` or `Unfinished`
  (`DIFF_NAMES` in `src/games/galaxies/index.ts`). The spec's "when it is
  known" does not list them; a board that loads has one answer, so the last
  three were not reached.
