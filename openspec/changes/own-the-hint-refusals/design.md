# own-the-hint-refusals — design

Measured 2026-10-01 at `f5e9c48b`, before any edit.

## Task 0: the populations, and the falsifier

**The hinted games** were taken from the registry (`HINT_GAMES`, every game
declaring `hint`): 48. Each one's first refusal, read by shape (the call or the
`{ ok: false, error }` before any reasoning, in the game and in the engine
builder it calls):

| Opening | Games |
|---|---|
| `commonHintRefusal(completed, findMistakes(…).length)` | 20 games directly, 4 through a `mistakes` parameter wired in `index.ts` (Loopy, Rect, Slant, Signpost), 3 inline as `?? xHint(state)` (Ascent, Pearl, Tents), Mosaic with `status(state) === "solved"` |
| through `candidateHint`, which called the same helper | 11 (ABCD, Crossing, Group, Keen, Mathrax, Rome, Salad, Seismic, Solo, Towers, Unequal) |
| the pair written out | Bricks, Clusters |
| `commonHintRefusal(solved !== 0, 0)` | Guess |
| a solved check of its own, no mistakes concept | Fifteen, Sixteen, Netslide, Flood, Inertia, Untangle |

Every hinted game with `findMistakes` refused on mistakes, and every one without
it did not (a scratch census over `sectionState(game, "findMistakes")` against
the game's source). So the midend can own **both** halves of the opening, not
only the finished-board half the proposal named: the second half was the same
fact (`findMistakes` is the game's, and the midend already ran it on every
refusal to keep the highlight's promise).

**The falsifier, checked two ways.** A scratch run dealt one board per hinted
game, asked the hint, solved it through the midend and asked again; every game
whose hint refused as solved had a status saying solved, with one exception
below. Then the six games with their own solved check were read against their
status:

- **Fifteen, Sixteen, Netslide fire it.** Each counts a board solved from the
  move that sorts it (`completed` is a move count, 0 while unsolved), so a game
  ID typed already sorted, or the rare generated board the random-slide shuffle
  leaves sorted, is finished at move 0 while its status says ongoing. They keep
  their own check. Making the status say solved would change each game's
  sentinel and every test built on it, for a board no generator aims at; not
  worth it.
- **Guess fires it the other way.** Its check was `solved !== 0`, which includes
  a lost game: after Solve, or out of guesses, the hint said "This board is
  already solved." on a board whose status is lost. That sentence was false.
- **Flood** checked `completed`, which past the move limit is a lost status, and
  said the same.
- **Inertia** (`gems === 0`) and **Untangle** (`completed`) match their status
  exactly, so their checks went.

**And the census found a defect outside the refusals.** Map's `executeMove`
returned before its completion check on a solve move, so Show solution left a
full board whose status was ongoing; asking for a hint then would have made the
midend throw (deduction exhausted on a tier that does not permit search).
Upstream's `execute_move` checks completion after both. Fixed: a solve move
completes the board like any other.

**Slide's Solve check was redundant.** `own-the-player-facing-messages` kept it
on the grounds that a typed desc with the main block home is not solved by
status; but `newState` sets `completed` to 0 in exactly that case, and the
status is `completed >= 0`. It went, and Slide's test now asserts the status.

## The opening: the midend's

`Midend.computeHintPlan` refuses `ALREADY_SOLVED` on a solved status, then
`FIX_MISTAKES_FIRST` when `findMistakes` reports anything (setting the overlay
first, which is the promise the sentence makes), and only then asks `hint`.
`commonHintRefusal` is deleted, `candidateHint` lost its `findMistakes`
parameter, and four games lost a `mistakes` parameter whose only use was the
helper. Bridges', Magnets' and Tracks' `hint` wrappers became pass-throughs and
went.

Cost is unchanged: games ran `findMistakes` inside every hint; the midend now
runs it once in their place. The old post-refusal `findMistakes` call is gone,
since the only refusal promising a highlight is now the midend's own.

**What a lost status means is the game's.** The midend does not refuse on
`"lost"`, because Flood's lost board plays on and its hint still leads home. The
two hinted games with a lost board that takes no more moves say so with a new
kind, `GAME_OVER`, which is a kind and not an escape because there are two of
them.

**The coverage the opening used to give, made explicit.** A game's hint asking
`findMistakes` meant `hint-resume.test.ts`'s walk failed if `findMistakes`
flagged a sound board, or a hint led into a mistake. With the hint no longer
asking, the walk asks `findMistakes` itself at every position, which states the
check instead of borrowing it. `mistake-invariant.test.ts`'s note on its
indirect coverage was rewritten to point there.

## The type: a union with a branded escape

`HintRefusal` is the union of the literal types of `ALREADY_SOLVED`,
`CONTRADICTION_UNLOCALIZED`, `DEDUCTION_EXHAUSTED`, `NO_MOVE_WORTH_MAKING`,
`SEARCH_OUT_OF_REACH`, `PUZZLE_NOT_REASONABLE`, `GAME_OVER`, and Solve's
`NO_SOLUTION_FROM_HERE` and `SOLUTION_UNKNOWN`, plus `PuzzleHintRefusal`, a
string branded by `puzzleHintRefusal`. `FIX_MISTAKES_FIRST` is deliberately not
in it: only the midend can keep its promise.

**Why the escape, with one game using it.** The proposal's test was whether a
second game needs it. None does today, but the alternative was to force
Inertia's two sentences into kinds: "The ball is dead" generalizes to "no move
can be played", losing the word that names the situation, and Inertia is the
non-deductive exemplar ("an exemplar hint never loses a word to an
abstraction"); and "The ball can no longer reach the 2 gems" names the gems, so
it is a template a union of literals cannot hold. So the shape is
`desc-error.ts`'s: a union of kinds plus one named escape, whose test fails a
sentence two games pass.

**A copy of a kind's text still compiles**, since it has the kind's literal
type, but it cannot drift: rewording the constant changes the type, and the copy
stops compiling. So the old sweep's "inlined copy" check has no work left, and
`hint-refusal.test.ts` now reads only `puzzleHintRefusal` calls: one game per
sentence, no kind spelled out, every argument readable (a literal or a
template). `hint-refusal-opening.test.ts` is retired with the helper it guarded.

**Six hint builders declared their own result type** with `error: string`
(Ascent, Bridges, Magnets, Pearl, Tents, Tracks); the type found all six, and
each now says `HintRefusal`.

## The probe corpus

`candidate-hint.ts`'s case planting "a hint deduces from a board with known
mistakes" anchored on the deleted helper call. The defect moved with the
refusal, so the case moved to `midend.ts`, with a second for the finished-board
refusal; `midend.test.ts` covers both.
