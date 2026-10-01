# derive-completion-from-the-position: design

## Task 0: the populations, and the falsifier

Taken 2026-10-01 at `34790801` by reading every game's source by shape (a
completion record under any name: `completed`, `solved`, `reveal`, a move count,
a clue counter), not by grepping `completed`.

### 1. Writes: latched or recomputed

| Behavior | Games |
|---|---|
| **Latched, and a solved board accepts moves that break it** (the population the owner's decision changes) | 43: ABCD, Ascent, Bricks, Bridges, Clusters, Crossing, Dominosa, Filling, Galaxies, Group, Rome, Salad; Keen, Light Up, Loopy, Magnets, Map, Mathrax, Net, Pattern, Pearl, Range, Rect; Seismic, Signpost, Singles, Slant, Solo, Spokes, Sticks, Subsets, Tents, Towers, Undead, Unequal, Unruly; Fifteen, Sixteen, Netslide, Slide, Twiddle, Sokoban, Flip |
| **Recomputed, breakable**: a broken solved board already reads unsolved | 5: Boats, Palisade, Separate, Tracks (as upstream), Untangle (upstream latches; nothing records why the port diverged) |
| **A finished board takes no move that could break it**: latch and recompute agree | 9: Flood, Same Game, Inertia, Black Box, Mosaic, Mines, Guess, Pegs, Cube |

The proposal named four recomputing games. There are five breakable ones, and
two of the four it named (Flood, Same Game) cannot be broken at all.

**`newState`** hard-codes "unsolved" in every game except Slide, Mosaic,
Untangle, Inertia (it counts the gems) and Palisade (and Palisade only for the trivial `k === w*h` board). A
game ID typed in already solved therefore reads "ongoing" at move 0 in Fifteen,
Sixteen, Netslide, Twiddle and Net, and could in any other game whose desc can
carry a finished board.

**The solve move** is written three ways: `completed = true` without checking
(ABCD, Filling, Group, Salad, Keen, Palisade, Pattern, Range, Separate, Solo,
Towers, Undead, Unequal, Unruly), `completed = check(next)` (Crossing, Rome,
Boats, Mathrax, Seismic), or a fall-through to the ordinary check (the rest).
**The cheat flag** is set unconditionally on Solve in most games, but only when
the solve finished the board in Boats, Rome, Mathrax, Seismic, Spokes, Sticks
and Subsets. Bridges spells it `solved`. Pegs, Sokoban, Cube and Same Game have
no Solve.

### 2. Reads outside `status`, `flashLength` and `statusbarText`

- **The predicate answers them** (is the board finished now): `interpretMove`
  guards (Mosaic, Mines, Guess, Black Box, Inertia), `executeMove` guards
  (Flood, Cube's paint swap), redraw (Flood, Same Game, Guess, Black Box),
  hint planners on scratch states (Ascent, Rect), hint refusals (Fifteen,
  Sixteen, Netslide, Flood, Guess, Inertia).
- **A "became solved" transition**: `changedState` hiding the cursor (ABCD,
  Ascent, Light Up, Magnets, Signpost, Singles); Dominosa clears its hover in
  `flashLength`. The engine sees the transition, so these are engine facts.
- **"The solver was used"**: Net's status bar hides its Active counter on
  `cheated || completed`.
- **First-solved history**: Flip stops counting moves once solved.

### 3. The flash

The trigger is always a status transition the engine sees, except for:

- **Outcomes that are not statuses**: Same Game's stuck board, and the deaths
  in Inertia and Mines. Status stays "ongoing" (as upstream; Mines holds the
  timer with `timerHolds`).
- **Black Box flashes on Solve**, which `winFlash` suppresses (as upstream).
- **Two outcomes**: Flood (won and lost).

What is about the board is the **duration**: it scales with board size in
Ascent, Net, Netslide, Flood and Flip, Galaxies triples it, and Map reads it
from a preference.

### 4. Status-bar words that are not `completionStatus`

- **The game's own phrases**: Guess ("Solved in N guesses."), Flood ("FAILED!"),
  Same Game ("Cannot move!"), Inertia and Mines ("DEAD!", "Deaths: N"), Black
  Box, Mosaic ("Clues left"), Galaxies (difficulty), Net, Rect, Palisade
  ("Region size"), Separate ("letters per region"), Salad (its symbol range).
- **History**: the frozen "Moves: N" in Fifteen, Sixteen, Netslide, Slide,
  Twiddle, Cube and Flip, and "Moves since auto-solve" in Fifteen, Sixteen,
  Netslide and Twiddle. Fifteen counts tiles and Slide merges repeated drags,
  so neither counter is the history index. **The engine fact is therefore the
  state at first-solved and at solver-used, not a move number**; the game reads
  its own counter off that state.
- **No completion words at all**: Salad, Separate and Palisade never say
  `COMPLETED!`.

### Falsifier: it does not fire

No game's won or lost needs the history of how it was reached. Three facts
look like history and are not: each is visible on the board and stays in the
state as part of the position.

- **Black Box's `reveal`**: the arena is open.
- **Guess's revealed answer**: the answer row is shown.
- **Mines' layout and first click**: already part of the position through
  `supersededDesc`.

Inertia's death is a ball on a mine, so it is a position too. The shape stands.

### What the census found wrong today

- **Loopy's `checkCompletion` writes `lineErrors` into the state**, so it
  cannot be called from a pure `status` as it stands.
- **Mosaic's solve move sets its clue counter to 0 without counting.**
- **Galaxies' `statusbarText` writes its cached difficulty into the state.**
- **Inertia's dead ball and Same Game's stuck board run the timer**, where
  Mines' identical death holds it.
- **Sixteen's Solve keeps the move count**, where Fifteen, Netslide and Twiddle
  reset it to 1.

All five are fixed by the migration: Loopy, Rome, Bridges, Seismic, Magnets,
Mathrax, Tracks and Undead ask a side-effect-free form of a check that marks
errors; Mosaic counts its clues from the board; Galaxies caches its difficulty
outside the state; Inertia and Same Game declare `timerHolds`; Sixteen is now
the rule rather than the exception.

## Decisions taken in the migration

**The engine says the completion words.** The midend prefixes `COMPLETED!`,
`Auto-solved.` or `Auto-solver used.` to whatever `statusbarText` returns, from
the board's status now and its own `cheated`. It has to: "the solver was used"
is no longer in any state, so no game could say it. Salad, Separate, Palisade
and Galaxies, whose bars never said the words, now do.

**Solve is one move, and no count restarts or freezes.** Fifteen, Netslide and
Twiddle reset their count to 1 on Solve so the bar could say "Moves since
auto-solve"; Fifteen, Sixteen, Twiddle, Netslide, Slide, Cube and Flip froze it
at the solve. Both were how a latched game kept its count honest. Under "solved
now" the count is the state's own, and the engine's "Auto-solved." /
"Auto-solver used." says what "since auto-solve" said. The phrase goes.

**Black Box drops "CORRECT!"** and Mines its own solved branch, so the engine's
`COMPLETED!` is not said twice. Guess keeps "Solved in N guesses.", which says
more than the engine's word does, so a win reads "COMPLETED! Solved in N
guesses."

**`flashLength` keeps the outcomes the status does not show**: Flood's defeat,
Same Game's stuck board, the deaths in Inertia and Mines, and Black Box's reveal
(which flashes on Solve too, as upstream). One consequence is that Solve on a
Flood board already past its limit now plays the defeat blink, where the old
cheat flag suppressed it; the board is lost, and the blink says so.

**A stuck Same Game board and a dead Inertia ball hold the clock**, as a Mines
death does: nobody is playing a board whose only move is undo.

**Dominosa's hover clear moved to `changedState`**, on the transition into
solved, which is where ABCD, Light Up, Magnets, Signpost and Singles already
reacted to one; a side effect in a duration hook was the shape to retire.

**The guard asks the one thing a latch cannot do.** Its first cut asked "a
board with a mistake on it is not solved", which is false: Loopy's and Net's
`findMistakes` flag a wrong *note*, and a wrong note does not unsolve a board.
The kept form walks the game's own input (clicks, keys, drags) from the solved
board until a position is not solved; a game whose input cannot get there is a
ledger entry with its reason, and the name-keyed structural half covers those.
A planted latch in Keen and a planted `completed` on Fifteen each turned it red.
The Marks key is left out of the walk, because it turns every later key into a
note: with it, Undead's walk never placed a monster.

## Mines' hint

Pulled in from `hintless-games-in-reserve` (proposal § "Hints to pull in").
Files: `mines/deduce.ts` (the rungs), `mines/hint.ts` (the plan, keep-track and
refresh), `mines/hint-text.ts` (every sentence), `mines/render.ts` (the marks).

**The premise is the opened numbers, never a flag.** Mines has no
`findMistakes` (it would give the mines away), so the midend never refuses
over a wrong flag, and a hint that built on flags would teach from a guess. A
flag counts once a deduction proves a mine under it. A flag on a square a
deduction proves safe gets a step of its own, "…so the flag on the ringed
square must come off", with the open as the journey's next leg; the help
page's Hints section says the same. Every mine a sentence cites was proved,
and flagged by an earlier step of the plan if the player had not flagged it.

**The ladder, measured against the certifier.** Mines has no tiers, so
`hint-resume.test.ts` accepts no refusal on any preset, and the board is only
promised solvable by upstream's set solver (`minesolve`), which chains derived
sets without limit. Measured by following the ladder from a center first click
on 980 boards (300 each of 9×9 with 10 and with 35 mines, 200 of 16×16 with 40,
80 each of 16×16 and 16×30 with 99, 20 of 16×30 with 170), rung by rung:

| Ladder | Boards where it stalled while `minesolve` finished |
|---|---|
| one number; two numbers, wing case only | 8/60, 22/60, 24/60, 17/20, 17/20 (first 60 or 20 seeds) |
| + the subset case of two numbers | 5/60, 8/60, 9/60, 2/20, 5/20 |
| + counting the mines left over disjoint numbers | 8 in 720 (all but one needed a region; one a count over more than 12 numbers) |
| + a number nested in another (regions), against numbers, regions and in counts | 0 in 980 |

Every firing that used a region used one level of nesting, so a region is never
nested in another. A region against another region was needed by one board
(9×9 with 35 mines, seed `m264` of the measurement), so it is allowed, with the
second region named in words rather than a second set of stripes. A count adds
at most 5 members from at most 40 candidates: no board needed more than 5, and
the cap is what keeps a stuck board dealt without "Ensure solubility" (where
the hint refuses with `DEDUCTION_EXHAUSTED`) from searching every subset; its
worst single call measured 0.9 s, once, before refusing.

How often each rung fired across the 980 boards, of about 63,700 firings: one
number 95.2%, two numbers 4.4%, a count of the mines left 0.4%, a region 15
times in all.

**What it says before the board exists.** The generator lays no mine in the
first square opened or beside it (`minegen`), so the first step opens the
center and says so. After an undo back to the start the layout survives, and
its first square is drawn with a cross: the step opens that one.

**A dead board** (status ongoing, `timerHolds`) refuses through
`puzzleHintRefusal` in Mines' words ("You opened a mine. Undo that move to
carry on from just before it."), since no collection kind names a death.

**Length.** Two-number and nested sentences run past 120 characters, because
both numbers, their needs and the shared squares are each a premise; three
`LONG_NARRATIONS` entries say so. The region prefix and a count of several
numbers have no entry, because the narration walk never reaches them over 120.

**The marks.** A ring on the border for what the step decides, an outline for
the numbers and proven mines it reasons from, and stripes under the glyph for
the one set of squares it treats as a whole. They are packed into the tile
cache's key, so a hint appearing or clearing repaints exactly its tiles.
