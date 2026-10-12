# pegs

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Params: Pegs refuses a board its type cannot make | title kept. Sentence 2 ("A board that arrives with its description SHALL NOT be refused for any of these.") cut to "and only then" in sentence 1. Sentence 3's "either way" spelled out, since the sentence it leaned on went. Both scenarios untouched | `engine-params`, "Param validation distinguishes generating a board from loading one" (a `<params>:<desc>` ID is checked with `full: false`, so a generation-only bound does not refuse it). The game's gates: `validateParams`, `src/games/pegs/state.ts:107` |
| Solver: Pegs' Solve finishes from the player's position, or else from the dealt board | "Pegs SHALL provide `solve`, whose move leaves…" reworded to "Pegs' Solve move SHALL leave…"; nothing else | that the game has a Solve: `solve` on the `Game`, `src/games/pegs/index.ts:253`; `ts-engine`, "Solve, the status bar and text export follow from the game's methods" |
| Controls: Pegs discards a drag or an armed jump when the board changes under it | retitled "Controls: Pegs disarms a keyboard jump when the board changes under it". The dragged peg cut from the sentence, which now speaks of the armed jump alone. Scenario untouched | `engine-input`, "A board change from outside the input ends the gesture in flight" (every game, "whatever the game holds the gesture in") and "An ended gesture leaves the Ui as before its press". The game's own clearing: `changedState`, `index.ts:240` |
| Hint: Pegs' hint offers the first jump of a line that leaves one peg | title kept. "Pegs SHALL provide a `hint` that searches … and offers" reworded to "Pegs' hint SHALL search … and offer"; "ringing the peg that jumps and the hole it lands in" cut. Second sentence and scenario untouched | `hintMarks.roles.ring` ("the jump to make: the peg that jumps, and the hole it lands in."), `src/games/pegs/hint-text.ts:47`; `engine-hints`, "A bound hint step's words SHALL name exactly the marks it draws" |

## Kept, and why

- **Params: Pegs params are a size and a board-type word.** A hand-written
  codec (`encodeParams` and `decodeParams`, `state.ts:92`-`105`); that a
  string with no word is a Cross is what an old link depends on.
- **Params: Pegs refuses…**, "A grid of more than 10,000 cells". `engine-params`,
  "A grid too large for a game is refused in one sentence" leaves where the
  ceiling sits to the game.
- **Solver: Pegs' Solve finishes from the player's position, or else from the
  dealt board**, its second and third sentences. No capability states
  `solveBySearch` (see Engine requests).
- **Controls: Pegs' cursor keeps to the board's cells**, "Select on a hidden
  cursor SHALL only show it" and "A pointer press on a peg SHALL hide the
  cursor". `engine-input`, "The engine owns a declaring game's press and
  select keys" binds a game that declares `targetVerbs`; Pegs declares none,
  and both are arms of its `interpretMove`.
- **Hint: Pegs' hint refuses a position it cannot finish from**, second
  sentence. `engine-hints`, "A hint that plans by searching SHALL refuse
  honestly past its reach" states the out-of-reach half only (see Engine
  requests).
- **Hint: Pegs' hint clears a shape as one journey.** When Pegs makes a
  journey is the game's; `engine-hints`, "One deduction firing is one journey"
  says what one is.
- **Look: Pegs' marks sit beside the peg and never recolor it.**
  `engine-hints`, "A hint marks beside the content, never behind it" and "A
  hint mark is drawn on the cell's border" give the rule; where each mark goes
  on a round piece (the margin, the face under the peg, an arrow over it) is
  "the glyph a role takes on a kind", which the engine leaves to the game.
- **Look: The Pegs win flash lights a playable cell**, "from the bottom left to
  the top right". `ts-engine`, "A game gives each element a position, and the
  route is which position it gives" lists four routes; the clause is the only
  statement of which one this board takes.
- **Look: Pegs draws its pegs as pieces on a quiet board.** `engine-colors`,
  "The engine owns what a board of pieces looks like" says a game takes these
  by reference; that Pegs does is the requirement.

## Engine requests

- **Solve by search tries the player's position, then the board as dealt.**
  "It SHALL search from the player's position first and, when that position
  is lost or past the search's reach, from the dealt board. It SHALL refuse
  with `NO_SOLUTION` only when the search proved the dealt board has no
  finish, and with `PUZZLE_NOT_REASONABLE` otherwise.", in "Solver: Pegs'
  Solve finishes from the player's position, or else from the dealt board".
  What the engine requirement would say: a game that solves by a budgeted
  search finishes from the line found from the player's position, else from
  the line found from the board as dealt; where neither has a line, Solve
  fails with `NO_SOLUTION` if the search proved the dealt board has none and
  with `PUZZLE_NOT_REASONABLE` otherwise. Belongs in `ts-engine`, beside
  "Solve leaves a solved board". `solveBySearch`,
  `src/engine/search-outcome.ts:58`. Stated of themselves by `pegs` and
  `sokoban`, the two games that call it; Sokoban's spec does not state the
  two failures.
- **A searching hint's two refusals.** "Otherwise it SHALL refuse with
  `NO_SOLUTION_FROM_HERE` when the search proved no line finishes, and with
  `SEARCH_OUT_OF_REACH` when the search could not settle the position.", in
  "Hint: Pegs' hint refuses a position it cannot finish from". What the
  engine requirement would say: a hint whose search proved that no line
  finishes refuses with `NO_SOLUTION_FROM_HERE`, and one whose search ran out
  with `SEARCH_OUT_OF_REACH`. Belongs in `engine-hints`, beside "A hint that
  plans by searching SHALL refuse honestly past its reach", which states the
  second only. `searchRefusal`, `src/engine/search-outcome.ts:35`. Stated of
  themselves by `pegs` and `sokoban`, the two games that call it.

## Found

- **"Rules: Pegs is won when one peg remains" holds what a Random board
  promises** (built backwards from one peg, touches all four edges), which is
  the generator's. Pegs has no tiers and owes no `Generation` subject; the
  Purpose says "what a Random board promises" and a reader looks for it under
  a subject the spec does not have.
- **The spec does not say what keeps a hint's step.** `hintKeepTrack`
  (`src/games/pegs/hint.ts:266`) is hand-written and no `Hint` requirement
  states which jump completes a step or drops the plan.
- **The Custom dialog admits a side of 1** (`bounds: { min: 1 }`,
  `index.ts`), and only `validateParams` with `full` refuses 3 or less, so
  the dialog's bound says less than the refusal. Deliberate, by
  `engine-params`, "A generation-only bound is gated on full"; the spec states
  the refusal and not the bound.

## Review

Four rows read, each against the code line and the engine requirement it
names; three corrected. The 15 untouched requirements read sentence by
sentence against the three classes; none cut. The writer's spec was larger
than the one it began from; it is now smaller.

- **Corrected: "Params: Pegs refuses a board its type cannot make".** "and
  only then (`engine-params`, "Param validation distinguishes generating a
  board from loading one")" is now "and only then": the qualifier is the
  game's own gate on `full` (`state.ts:108`-`121`), and the citation was
  longer than the sentence it replaced.
- **Corrected: "Controls: Pegs disarms a keyboard jump when the board changes
  under it".** The added sentence "A peg held by the pointer is put down as
  every game's gesture is (`engine-input`, …)" was the cut clause with a
  citation, in a subject that says plenty of the game's own. Removed.
  `engine-input`, "A board change from outside the input ends the gesture in
  flight" states all of it ("for every game, whatever the game holds the
  gesture in").
- **Corrected: "Hint: Pegs' hint offers the first jump of a line that leaves
  one peg".** "marked as the legend says (`hintMarks`)" removed. The tie of
  the ring to the peg and the hole is still in the subject: "Hint: Pegs' hint
  says the last jump finishes…" names the jump "by the peg and the hole it
  rings".
- **Sound: "Pegs' Solve move SHALL leave…".** `solve` hands `solveBySearch`
  the line's last landing (`index.ts:253`-`257`).
- **The two engine requests stand**, for the reasons in `sokoban.md`
  § "Review", and the two ledgers now word them alike.
