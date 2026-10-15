# Hints for a game solved by search or by a heuristic

Open this guide for a game with no deduction ladder: one that declares no
`Game.difficulty` contract, or whose `hint` plans by a search or by an
objective (`git grep -l 'rival-judging\|search-outcome\|slide-planner'
src/games`, and the move puzzles beside them). A game whose hint replays its
solver's rungs skips it. The words, the plan mechanics and the refusals every
hint shares are in [`hints.md`](./hints.md), the marks in
[`hints-marks.md`](./hints-marks.md); the requirements are in
[`engine-hints`](../openspec/specs/engine-hints/spec.md) and the game's own
spec.

## What every game does

The skeleton is a deduction game, so the file to read beside these steps is
[`src/games/pegs/hint.ts`](../src/games/pegs/hint.ts) with its `solver.ts`
and `index.ts`.

1. Decide what the hint can measure or prove about a move that the player can
   check. Every sentence is one of those claims (§ "Narrate a measurement or a
   proof").
2. Put the search in the game's `solver.ts`, budgeted in positions and never
   in time, returning a `SearchOutcome`
   ([`engine/search-outcome.ts`](../src/engine/search-outcome.ts)): a line
   that finishes, a proof that none does, or out of reach. Two searches where
   one cannot both find and prove (§ "Find with one search, prove with
   another").
3. Name the non-negative integer every hinted move lowers, before writing any
   narration, and run `src/engine/hint-resume.test.ts` on the game
   (§ "Recompute-stable plans").
4. In `hint`, refuse through `searchRefusal` where the search found no line.
   Otherwise offer the plan's first move, or a short plan.
5. Judge the move's rivals with `judgeRivals`
   ([`engine/rival-judging.ts`](../src/engine/rival-judging.ts)) and say only
   the claim it returns, with the relation it returns (§ "Judge the rivals of
   a searched move").
6. Derive the goal a run of moves serves once, from the plan, and carry it on
   the steps (§ "Hold a stable subgoal").
7. Solve through `solveBySearch`, from the player's position and else from
   the dealt board. Depend on `aux` for neither Solve nor the hint
   (§ "Recover the answer from the board").
8. Have the generator deal only a board the hint's search finishes from its
   opening (§ "Deal only what the search can finish").
9. Print one whole plan and read it as a player (§ "Read one plan out loud").

## Sections

| Section | Read it when |
| --- | --- |
| Narrate a measurement or a proof | your game has no forced move and you are deciding what a step can say |
| Narrate an objective the player can count | your hint picks the move that most improves a number on the board |
| Judging an idea for a heuristic plan | you have an idea to make a heuristic plan shorter or better |
| Moves that commute: fix an order | your game's moves can be made in any order, so none is forced |
| Hold a stable subgoal | several moves in a row serve one goal the step names or marks |
| Recompute-stable plans | your plan is recomputed after a move, which is every search or heuristic hint |
| Steer a search by one measure | your search is guided by a heuristic, gated on one, or stuck in its local minimum |
| Find with one search, prove with another | one search cannot both find a finishing line and prove a position lost |
| Judge the rivals of a searched move | your step sets the move it offers against the other moves from the position |
| A move puzzle teaches order | your game pushes or places pieces and which goes first is the hard part |
| Deal only what the search can finish | your generator deals boards the hint must search from the opening |
| Read one plan out loud | you have a plan that solves the board and have not read its sentences in order |
| Sliding-permutation games | your game slides whole lines of a grid, or plans with `slide-planner.ts` |
| Recover the answer from the board | your hint or Solve reads `aux`, or falls back on the solution |
| A hidden answer: marks for what is proved, a count for the guess | your game hides its answer and the next move is a guess |
| A hidden answer: one tracer, and a test that the hint cannot peek | your hint reasons from evidence the player gathered about a hidden state |

## Narrate a measurement or a proof

Before writing a line, ask what you can measure or prove about this move
that the player can check, and narrate that. A game with no forced move
still has a number that changes or a consequence that can be proved; an
empty `explanation` is never the answer.

Organize the narration as verified claims, one branch per claim the code
checks on the board the step is shown on: forced (every other move loses),
collecting (what the move takes and what stops it), stranding (taking it now
loses something for good), positioning (what the move sets up). Say out loud
the thing beginners get wrong about the rules.

Find the one thing your game can prove and lead with it. A proof that works
in one direction only is safe to lean on because when it speaks it is right,
and the same proof gives an honest refusal: say what is lost and that the
move to make is undo.

Exemplar: [`inertia/hint.ts`](../src/games/inertia/hint.ts), whose proof is
`unreachableGems` in its `solver.ts`; for a measurement,
[`untangle/hint.ts`](../src/games/untangle/hint.ts).

## Narrate an objective the player can count

Pick the move that most improves a scalar the player can count, and say the
count before and after in one sentence. Exemplar:
[`untangle/hint.ts`](../src/games/untangle/hint.ts).

- Write every count as a numeral, so one sentence holds one notation.
- Search in floats for speed, then recount the chosen move exactly with the
  board's own test, the way round the board applies it. A count the board
  would draw differently is a false sentence.
- Claim no more than was searched. A grid search is not exhaustive, so the
  sentence never says "the best move".
- Show the number on the board: mark each thing the move removes and the
  piece it moves, so the player can count what the sentence counted.
- Narrate a fallback move by what the player can see. A move toward the
  solved layout cannot say so, since the player has never seen that layout;
  it says what the move does to the count and, where the next move improves
  it, by how much.
- Search the whole board, not a handful of hand-picked spots, and run the
  expensive checks only on the best tier of candidates.
- Keep a suggested spot clear of other pieces and the frame by fractions of
  the typical spacing, so it looks alike at every size. Where no roomy spot
  helps, search again slightly tighter before falling back: a cramped move
  with a visible reason beats a rearrangement with none.
- Make a secondary objective a tie-break among equal gains, not a second
  pass, since the puzzle ends the moment the primary reaches zero. Count the
  frame as crowding, or "roomiest" always means against the frame.
- Never refuse on a solvable board. Where greedy play runs out, walk toward
  the solution (§ "Recover the answer from the board").
- Freeze what is placed. A piece exactly on its solved place is never moved,
  and the solution's symmetry is chosen on each request as the one with the
  most pieces in place. Then every step improves the count or places one
  more piece, and a recomputed hint cannot loop.
- Where looking one move ahead thrashes near the end, plan the finish as one
  multi-leg journey: lift the few pieces causing the trouble and place each
  where it conflicts with nothing
  ([`untangle/endgame.ts`](../src/games/untangle/endgame.ts)). The journey
  keeps the freeze rule. Count its budget in work, not time, so a hint is
  the same on every machine.
- Cap the plan (Untangle's is six steps) and end it early once the next
  request might find something better. Every step is a fresh measurement and
  the midend recomputes when a plan runs out.
- Declare no `hintKeepTrack`. Without one every move the player makes is
  `"off"`: any deviation drops the plan and the next request measures again.
- Carry the suggestion as the step's highlight and draw the move from piece
  to destination in the hint color. Read the source from live state, so an
  executed hint shows the line shrink to nothing.
- Fold the hint's signature into the redraw's early-out. A displayed hint
  moves no piece, so a renderer that returns early on "nothing moved" skips
  it.
- A game that animates its moves needs no hint animation: an executed step
  rides that pipeline and the midend stretches it to `HINT_ANIM_S`.

## Judging an idea for a heuristic plan

A heuristic plan is better or worse, not right or wrong, so measure an idea
for one before building on it.

- Reproduce the baseline first, on a fixed population: named seeds, both a
  generated start and a scrambled one, each walked to solved by applying
  whole plans as the app does, counting moves. If the current code does not
  reproduce the recorded figure, nothing measured against it means anything.
  Know the noise: on eight 25-point Untangle boards, half a move in the
  average was noise (measured 2026-09-26).
- Probe under every constraint the plan ships with: clearance and
  presentation rules, the termination rule (§ "Recompute-stable plans") and
  the per-request work budget. Put them in the probe from the start, or
  measure how much each one filters and report it. A probe without one
  measures a different idea.
- Check a theorem's hypotheses on the boards the generator makes. A signal
  that is a proof only under a hypothesis generated boards often fail may
  rank candidates; it decides nothing until you have measured how often the
  hypothesis holds.

When an idea fails these tests, withdraw it with a postmortem in
`openspec/postmortems/` that says what would reopen it, and fix any comment
or doc that states the disproved cause.

## Moves that commute: fix an order

Where a game's moves commute, so that nothing forces any one of them, fix an
order and most of the solver's set becomes a deduction. Work through the
squares in reading order and never return to one: a square only one
remaining move can still fix forces that move. The plan stays the solver's
shortest set; only the order and the words are the hint's. Exemplar:
[`flip/hint.ts`](../src/games/flip/hint.ts).

- State the claim so it holds on every ruleset: "the last square that flips
  it", not "the square below".
- Say the order on the step when the claim is false without it ("row by
  row"). A definition the sentence leans on and never gives is a missing
  premise; naming the convention is not restating the rules.
- Put the method in the help, once: why an order makes a move forced
  ([`hints.md`](./hints.md) § "Rules belong in the help").
- Where the order decides nothing, do not pretend. Offer the move with the
  `oneOf` relation and a fact the player can count ("The whole board can be
  lit in 5 presses, and no fewer. One of them: press this square."). Never
  explain why the method is silent: that sentence is about the method, not
  the board.
- Say the last move is the last.
- Mark everything the move changes. Evidence takes one role and side effects
  another, and the sentence names both; an unmarked change reads as a
  mistake.
- Argue stability from the solver, then walk it: show that making a move of
  the chosen answer leaves the rest of it chosen, and add no tie-break the
  argument does not need.

## Hold a stable subgoal

Narrate every move by the goal it serves, and hold that goal across the run
of moves that serves it: derive it once, from the plan, and carry it. A goal
re-derived per step flips between goals from one step to the next.

Use the sentence's `aim` part ([`hints.md`](./hints.md) § "A sentence has
parts") and the shared `HINT_SETTING_UP`
([`engine/hint-text.ts`](../src/engine/hint-text.ts)) so the games read as
one voice. Where the game has no name for the goal, mark it on the board and
say "the marked gem". A mark drawn on a tile goes in that tile's diff key,
even where the game's other overlays ride a sprite repainted every frame
([`rendering.md`](./rendering.md) § "The tile cache and the diff key").

Exemplars: `narrateFifteenStep` in
[`fifteen/index.ts`](../src/games/fifteen/index.ts);
[`inertia/hint.ts`](../src/games/inertia/hint.ts) for an unnamed goal.

## Recompute-stable plans

A plan is recomputed from scratch whenever the player goes their own way, so
a correct plan is not enough: its first move must make progress that the
next plan, computed one move on, does not undo. Give the hint a monotone
potential, a non-negative integer every hinted move provably lowers.

- Look first for a move that always shrinks something. Where every move
  removes a piece, any recomputed plan terminates and no more work is needed
  ([`pegs/hint.ts`](../src/games/pegs/hint.ts)).
- Otherwise go for the nearest goal, so each move shortens the distance to a
  still-valid goal by one. Where the greedy choice is unsafe, filter the
  candidates by a safety check (play the leg out and solve again) and keep
  the monotonicity ([`inertia/hint.ts`](../src/games/inertia/hint.ts),
  `nextLeg`).
- Where the game has no natural potential, the potential is the true
  distance to the goal, and only a search that returns a genuinely shortest
  plan has it (§ "Sliding-permutation games").
- A best-first search is not shortest, so the line found after a move need
  not be the rest of the line found before it. Offer a move only if the line
  the search finds after it is shorter than the one it finds now, else the
  first rival whose line is. The search must be deterministic and its budget
  only truncate, so a line's length is a function of the position
  ([`sokoban/hint.ts`](../src/games/sokoban/hint.ts)).
- A potential holds only where some move lowers it, so count the positions
  where none does. A search that is not shortest has no potential a local
  rule can complete: call the result "measured", not proved.
- Do not carry the plan to hide an instability. `hintKeepTrack` keeps a plan
  while the player follows it, and the cycle appears the moment they do not.
- A tour heuristic recomputed from adjacent positions can disagree with
  itself about what to fetch first. Never narrate one as the plan.

The guard is `src/engine/hint-resume.test.ts`: ask, apply the first step,
throw the plan away, ask again, to solved. It runs for every game with a
`hint`, so run it on yours before polishing any narration. A test that
follows whole plans is how the midend plays a followed hint, and cannot see
a cycle, because following the plan is the one path that never recomputes.

Check which boards that walk takes for your game. They come from
`gatePresets` (`src/engine/testing/hint-games.ts`): one preset for each
value of each `paramConfig` item whose value differs between the game's
presets, the smallest preset that offers it. A game with no difficulty tiers
still has an axis (size, usually), and a size that is no `paramConfig` item,
or is the same in every preset, is not walked. The largest value of a
numeric axis is walked too, but not in the commit and push hooks, and for a
game that calls `planSlides` only in the slow tier, which walks every preset
(`npm run test:slow -- src/engine/hint-resume.test.ts`). So where the hint's
hard case grows with the board, run the slow tier on the game whenever its
search changes, and keep a test in the game that walks a full-size board on
every commit. A game that can refuse with `SEARCH_OUT_OF_REACH` names that
test in the guard's `SEARCH_REACH` ledger.

## Steer a search by one measure

Where a plan is steered by a measure of the board, use exactly one measure,
on every board. The walk applies a first move and recomputes, so two
measures that take turns ping-pong as surely as two plans do.

- A cheap measure that correlates with "nearly finished" is not a potential,
  and using it as a gate on a better search is the same error. A shortest
  plan walks uphill in every such measure on its way home, so the gate shuts
  mid-descent and the heuristic walks the board back.
- A sharper measure written as a last resort, used only where the ordinary
  one is helpless, is two measures. Make the sharper one the only one.
- Sharpening a measure moves every gate that reads it. A gate on "the
  fallback found nothing better than standing still" is a statement about
  the measure, so a sharper measure can stop it opening and replace a
  complete plan with a partial one. Make the sharper measure differ from the
  blunt one only where nothing else can help.
- Escape a local minimum by counting the structure the measure is blind to,
  not by searching deeper: each further ply multiplies the cost by the
  branching factor.
- The term that escapes is the game's own knowledge and stays in the game.
  A game sharing the planner whose pieces are interchangeable cannot use
  another's ([`doctrine.md`](./doctrine.md)).
- A distance measure is recomputed against the board it measures, never
  against a target frozen earlier (§ "Sliding-permutation games").

Exemplar: the tangle term in
[`sixteen/index.ts`](../src/games/sixteen/index.ts), `TANGLE_COST` and
`TANGLES_IN_REACH`.

## Find with one search, prove with another

A hint that searches may need two searches good at different things, and
only a measurement says so. A beam search finds a finishing line where a
depth-first search with a memo of lost positions does not, but a beam can
never say a position is lost. So the beam finds, and a budgeted exhaustive
search only proves loss; that proof is what lets the hint refuse with
`NO_SOLUTION_FROM_HERE`, and with `SEARCH_OUT_OF_REACH` past the budget
(`searchRefusal`,
[`engine/search-outcome.ts`](../src/engine/search-outcome.ts)). Exemplar:
[`pegs/solver.ts`](../src/games/pegs/solver.ts).

- A search that is exhaustive never runs out of reach, so its hint does not
  call `searchRefusal`: calling it is what enrolls a game in
  `hint-resume.test.ts`'s ledger of hints with a reach. A lost position is
  `hasNoSolution`'s to refuse, before the hint is asked
  ([`numgame/hint.ts`](../src/games/numgame/hint.ts)).
- Narrate each claim only where its proof finished. "Only it and the marked
  moves can still finish" needs every rival settled; where some were not,
  the words claim nothing about them.
- Share one allowance, counted in positions and never in time, between the
  searches of one request, so the same board always gets the same sentence.
- Use a cheap sound check twice: as a refusal of a lost position at a
  glance, and run on each rival to find the piece a careless move would cut
  off. The reason a player can see leads, ahead of anything only a search
  knows.
- Read the plan for shapes a player can name, found by their net effect on
  the plan and not searched for, and narrate each as one journey.
- Measure where the budget buys nothing, then say something visible. Where
  rivals stay unsettled at many times the allowance, do not spend more and
  do not say "from there the board can still finish", which is true of every
  move the hint offers. Say a fact on the board, in its own word, kept apart
  from the word for a proof and never worded as a verdict.
- Link each part of the sentence to the next: a danger is answered by a move
  that answers it ("so … instead", "one way to save it"). "A is bad. Instead,
  do B" with no stated link fails. Where the board makes the move obvious,
  leave it to the marks.

## Judge the rivals of a searched move

A search hint teaches by setting the move it offers against its rivals, the
other moves from the same position; narrating the offered move alone
teaches nothing. Pass the rivals, one allowance counted in positions, and a
judge that settles one rival (`"finishes"`, `"lost"` or `"unknown"`) to
`judgeRivals` ([`engine/rival-judging.ts`](../src/engine/rival-judging.ts)).
It returns the verdicts and the `RivalClaim` they allow, with the relation
the sentence must use; `searchVerdict` turns a `SearchOutcome` into a
verdict. The judge, the search behind it, the traps the step leads with and
what to say on an `unsettled` claim stay the game's.

- Plan one step per request and judge the rivals on the board on display.
- Choose the rivals the step is about before the words: the population sets
  what "only" means, and the sentence says it ("No other push of this barrel
  can still finish"). On a crowded board the rivals are the offered piece's
  other moves, the choice the player faces, not every move there is.
- Give a rival's search the budget its question needs, and stop when it is
  answered. A budget below what the thing being proved costs is a miss that
  still pays in full; where any shorter line would do, stop at the first.
- Look at where the search stalls before naming the cure: read its trace. In
  a game with many pieces most moves are beside the point, so order the
  search by distance from the pieces and goals still out of place.
- Where the move needs a walk first, the step's move is the whole of it
  (walk, then push, as `executeMove` applies it), its gesture is the one a
  player makes, and `hintKeepTrack` answers `"onTrack"` to a walk that
  changes nothing the step said.

Exemplars: [`sokoban/hint.ts`](../src/games/sokoban/hint.ts) and
[`pegs/hint.ts`](../src/games/pegs/hint.ts), which search;
`git grep -l rival-judging src/games` for those whose rivals a deduction or
a rule settles.

## A move puzzle teaches order

In a game of pushing or placing pieces, which move comes next is rarely the
hard part and which piece goes first is. Say so with claims the hint can
check without searching the whole board
([`sokoban/hint.ts`](../src/games/sokoban/hint.ts)):

- a goal that filling another first would wall off: take the other as a wall
  and ask whether anything can still reach this one;
- a piece that keeps another from any goal: search the moves of that one
  piece with the rest standing still, three times, before the move, with the
  mover lifted off, and after it. "No way before, a way after" alone fires
  on every move that merely lets the player out;
- a run of one piece to its goal, told as one journey.

## Deal only what the search can finish

A refusal from the opening is a hint that never helps. Where some generated
boards are past the hint's search from their first move, have the generator
deal the first board the search finishes within a smaller trial budget. Run
that check on the board as dealt, after every step that turns the generated
level into the desc, never on a roomier intermediate. Exemplar:
[`sokoban/generator.ts`](../src/games/sokoban/generator.ts).

## Read one plan out loud

Print a whole plan and read it as a player would, a step after the one
before. A test that the plan solves the board is blind to a sentence that
promises what the next step does not do. A promise about what comes next is
a claim about the plan's own next move, never about "some move exists".
Check the finishing move's sentence too: it must not read as setting up.

## Sliding-permutation games

A game on a toroidal grid whose move slides a whole line plans with
[`engine/slide-planner.ts`](../src/engine/slide-planner.ts), `planSlides`.
It owns the A\*, the exact bidirectional search (`exactSearch`), the deep
search (`deepSearch`) and the partial-plan return. The game supplies its
board, its finished board, its legal moves, a `heuristic(board)` and the
budgets, and never decides when the exact search runs. Exemplar:
[`netslide/hint.ts`](../src/games/netslide/hint.ts).

- Hand the planner the board the player sees, one integer a cell, not
  labeled pieces. With identical pieces a target that tells them apart can
  be unreachable while the finished picture is two moves away.
- Compute the heuristic against the board in front of it. A home assigned to
  each piece once and frozen makes the search wander and the narration lie;
  where pieces are identical, match them to cells per node.
- Read each piece's destination off the plan for the narration: simulate the
  plan, and a piece's home is where it ends up.
- The exact search runs on every board. It is what crosses an endgame the
  heuristic cannot see past (two pieces in each other's cells read as nearly
  finished and are many moves away), and a shortest plan is what stops a
  recomputed plan cycling. Do not gate it on any measure of the board or on
  the heuristic being helpless, and do not split it into a small search with
  a bigger one in reserve: the search that opens a descent must be the one
  that finishes it.
- Pick the smallest `exactSearch` budget that still crosses the game's worst
  endgame, not the largest affordable. Every extra state is spent in full on
  every board out of reach.
- Where the endgame lies past what a search that stores its boards can
  reach, configure `deepSearch`: it spends time once in place of memory. It
  is gated, and safe only because it reaches exactly one ply further than
  the ungated search, which finishes whatever it opens. Never two.
- A change inside the planner keeps four properties of the exact search:
  finish the level and take the cheapest meet, so the path is shortest;
  enforce the budget inside a level; prune commuting same-axis moves to one
  order; compare a stored hash in the signedness it was stored in. The
  comments at each site say why.
- Test it both ways. A followed-plan test (`netslide-hint.test.ts`) is how
  the midend plays; the strict walk of `hint-resume.test.ts` is the only one
  that sees a cycle (§ "Recompute-stable plans").

## Recover the answer from the board

Do not depend on `aux` for the hint or for Solve. It is absent for a resumed
save and for a shared game ID, which are the games a player comes back to
stuck, and "solution not known" on a board the player is looking at is not
acceptable. Derive the answer from the board wherever that can be done,
prefer `aux` only where the generator's answer is tidier, and verify every
derived answer with the game's own exact test before a player sees it. Hint
and Solve share the one answer.

- Walking the player to the solution is a legitimate fallback where a local
  objective stalls at a local minimum.
- Derive the answer only from what no move changes, and never order the
  enumeration by the current board ("the finished grid nearest to where the
  pieces are now"). Then it is the same answer for the whole game, and
  stable by construction.
- Check that the answer is reachable, and check the reachability test
  against brute force: enumerate a small board's whole reachable set and
  assert the predicate agrees. Do not trust a parity rule you reasoned out.
- Search the most constrained cell first.

Exemplars: [`untangle/solution.ts`](../src/games/untangle/solution.ts) over
[`planar.ts`](../src/games/untangle/planar.ts);
[`netslide/reconstruct.ts`](../src/games/netslide/reconstruct.ts), with
`isReachable`.

## A hidden answer: marks for what is proved, a count for the guess

Where the answer is hidden, some facts about it are forced and the next
move almost never is. Keep the two halves apart in the plan, each to its own
standard of proof. Exemplar: [`guess/hint.ts`](../src/games/guess/hint.ts).

- The forced half is marks, placed as moves in a notation the player has
  ([`hints-marks.md`](./hints-marks.md) § "Give the facts a
  notation"). Each sentence is a necessity, and a brute force over the whole
  answer space holds every rule to it.
- The unforced half is a probe whose sentence counts and does not argue: the
  guess fits everything so far, how many answers still fit, the most it can
  leave. No "because", no "best", nothing a player could not recount.
- Measure the strategy before narrating it, by an exhaustive walk over every
  answer. A hint-followed game that loses is a hint that lied by omission,
  and only that walk sees the worst case.
- A plan with no tier can never refuse, so check that it never has to. Take
  a census of the rules that fire ([`hints.md`](./hints.md) § "Census the
  reasons, not only the rungs"); a rule that never fires is another rule in
  disguise.
- The hint derives its own marks and skips what the board already shows. It
  cannot rest on the player's marks, since a mistake check against the
  answer would leak it (contrast
  [`hints-candidates.md`](./hints-candidates.md) § "Deduce from the notes
  when the mistake check vouches for them").
- When a renderer change alters the shape of a hint mark, grep the game's
  `hint-text.ts` for the old shape's word in the same change. No test sees a
  sentence naming a shape the board no longer draws.

## A hidden answer: one tracer, and a test that the hint cannot peek

A hint over hidden information reads only what the player has revealed, and
a test proves it. Exemplar:
[`blackbox/hint.ts`](../src/games/blackbox/hint.ts).

- Use one tracer for the truth and for partial knowledge: the physics takes
  a function saying what a square holds, which may answer "not known", and
  a trace that consults an unknown square stops there and names it. The
  game and the hint run the same code (`traceLaser`).
- A deduction is then a Check, one sentence long: set the unknown square
  each way and trace again, and if one way contradicts what was observed the
  square is the other. Only the first unknown on a path can be settled this
  way. Claim nothing the tracer does not show; an undisturbed path does not
  prove its neighbors empty.
- Word a claim about a path so it is true from either end.
- Prove the hint cannot peek: change the hidden state wherever every
  observation stays the same and require the same plan, at every position
  along the hint's own path, with a floor on how many of those positions
  exercised each kind of step. Comparing at one fixed position passes a
  planted peek (`blackbox-hint.test.ts`).
- A layout found by trying is not a deduction and is not narrated as one. It
  offers what fits every observation and names the squares it sets; past its
  budget the hint refuses with `SEARCH_OUT_OF_REACH`.
