# Design: add-pegs-hint

## D1. What was measured (task 0.1)

Positions were reached from every preset by 0–16 random jumps, eight seeds
each, and searched (2026-10-02, on the development machine under load ~15, so
read the milliseconds as upper bounds and the ratios as the result).

- **A plain depth-first search with a memo of lost positions is too weak.** At
  two million positions (about four seconds) it could not solve the *opening*
  position of 7×9 Cross, 9×9 Cross or 9×9 Random, and move ordering only
  changed which boards it got lucky on: one ordering solved a board in 1,000
  positions that another had not solved in 2,000,000. Restarts over a portfolio
  of orderings sharing the memo helped finding and did nothing for proving.
- **A beam search finds solutions.** Each level keeps the 300 most compact
  positions, counted as the sides of pegs that face no peg. It solved every
  preset's opening in at most ~100 ms, 9×9 Cross included, and across the 432
  measured positions **every solution any method found, the beam found** (300
  wide, or 3,000 as a second try). The depth-first search never found one the
  beam missed. So the beam finds and the depth-first search only proves loss.
- **Proving loss is where the reach ends.** Positions random play leaves on the
  33-hole and larger boards often need more than a million positions to prove
  lost. This is the honest `SEARCH_OUT_OF_REACH` the proposal anticipated.
- **"A peg nothing can ever reach"** (`PegsBoard.frozen`) is sound and cheap:
  let every peg stay put while new ones appear wherever two in a line could
  jump in, and a peg none of whose neighbors that closure reaches can never be
  jumped or jump. On positions reached by play it fires only late (the k=15–16
  rows), so it is a refusal and a per-step warning, not the hint's opener. As a
  prune inside the depth-first search it saved about 10%.
- **The rule of three never refuses a position reached by play.** Jumps
  preserve the position class and every start the generator deals is soluble,
  so a reached position's class always admits a finish. Argued from the code,
  not from a sample, so no power argument is owed.
- **Along hint paths** (the beam's own solution from three seeds per preset,
  1,000 steps in all): the hinted jump was *proved* the only jump that can
  still finish with one peg on 86 steps (each rival searched to exhaustion
  within 20,000 positions), some rival jump would leave a peg frozen on 88, and
  the same peg jumped again next on 87.

**Falsifier outcome:** two claims fire on roughly a tenth of steps each, which
is more than a handful but a minority. So the hint is a search with honest
refusals, narrating the consequence it can check, and the two claims where
they hold.

## D2. The solver (`solver.ts`)

`findFinish(state)`: beam 300, then beam 3,000, then the depth-first search
with the frozen-peg prune and a budget of 300,000 positions. It returns a
solution, a proof of loss, or out-of-reach. Every jump removes a peg, so a plan
recomputed after any move cannot cycle: the peg count is the potential, and
`hint-resume.test.ts`'s recompute walk has nothing to catch beyond reach.

The memo keys are exact (pegs packed sixteen to a character, or a number up to
48 holes), never a hash, because a collision would make the hint call a
soluble position lost.

## D3. Solve

`solve(orig, curr)` searches from `curr` first. If that position is lost or
out of reach, it searches from `orig`, the dealt board, which every generator
makes soluble and the beam solves at once. That keeps `SEARCH_OUT_OF_REACH`'s
advice ("take the answer from Show solution") true for Pegs. The move is
`{ type: "solve", finish }`, the grid index of the last peg: the solved board
is fully determined by it, as Flood's Solve snaps to the finished board. A
board no search finishes from says `NO_SOLUTION` if the depth-first search
proved it, else `PUZZLE_NOT_REASONABLE`, which only a typed game ID can reach.

## D4. The hint (first cut, rejected for its wording)

**Owner review, 2026-10-02: the wording is rejected; the rings are accepted.**
*"Our guiding light should be for the hints to teach the players how to reason
about the game, and play effectively on their own; and none of these phrasings
really do this."* The owner liked the direction of **only** and **strands**,
because they contrast a good jump with one that makes a finish impossible, and
asked for everything to focus on that contrast. D6 is the redesign; this
section records what shipped first.

Refusals, in order:

1. Pegs frozen (`frozen`) while more than one peg is left: a puzzle-specific
   sentence through `puzzleHintRefusal` saying how many are cut off, the one
   thing Pegs can prove at a glance and the thing to undo.
2. The search proved the position lost: `NO_SOLUTION_FROM_HERE`.
3. Out of reach: `SEARCH_OUT_OF_REACH`.

A plan is the found line of jumps, one step per jump, in the imperative house
(the move is recommended, not forced). The jumping peg and the hole it lands in
are ringed (kinds `PEG` and `HOLE`), and each step's sentence is chosen from
what was checked, in this order:

- **only**: every rival jump was searched to exhaustion and loses. The step
  says this is the only jump that can still leave one peg. Proofs share a
  budget per plan, so a plan never costs more than a bounded search however
  long it is, and a claim is made only where the proof finished.
- **strands**: some rival jump would leave a peg frozen. The step outlines that
  peg and says another jump would cut it off.
- **again**: the same peg jumped in the previous step. The step continues that
  peg's run (`continuesPrevious`), one journey for one peg's chain of jumps.
- **plain**: the jump, and how many pegs it leaves.

`hintKeepTrack` completes on the step's own jump and drops the plan on any
other. `hintGesture` drags the peg to the hole, through `interpretMove`'s own
press and release.

## D5. Rendering

The hint marks ride the per-tile cache as two more flags on the cached value: a
ring in `HINT_ACTION` around the ringed peg and hole, and one in
`HINT_EVIDENCE` around an outlined peg. Both sit in the margin outside the peg,
so they stay visible on the peg's own blue. The owner accepted these
(2026-10-02: *"The rings look great to me"*).

## D6. The redesign: teach the good jump against the losing one

Owner-approved direction (2026-10-02), from two explorations of that day.

### What was measured

All nine presets, three seeds, every third move, on the hint's own path and
on a "plausible player" who picks random jumps that still finish: 598
positions, 4,347 legal jumps. Each jump was classed GOOD (a finish found after
it), BAD (a frozen peg after it, or proved lost) or UNKNOWN (out of reach).
Load average 6.5–9, so the times are upper bounds.

- **Traps are a middle- and late-game thing.** Early positions almost never
  have a BAD jump (most have every jump GOOD). Middle positions have one in
  37–100% of cases, late ones in 61–100%.
- **A reason the player can see is rare, and late.** Of 1,000 BAD jumps, 10%
  leave a peg frozen at once and 19% leave one frozen within two more jumps
  whatever is played (sound, and under a millisecond per position). By phase:
  none early, 3% in the middle, 43% late. The other 81% are lost only by
  search.
- **"A lonely peg" is not a reason.** A peg with no peg one or two cells away
  in a line covered 72% of BAD jumps but also followed 28% of GOOD ones, so it
  is unsound and must not be said.
- **Classifying every jump costs too much early and mid on the large boards.**
  Median per position: 0.4–2.5 s on 9×9 (up to ~12 s; a 30k proof budget cuts
  the worst case to ~5 s but makes over a third of 9×9 Cross's middle jumps
  UNKNOWN). Late positions cost at most ~60 ms. The beam passes failing on lost
  rivals are the likely cost, not yet timed apart.
- **What players reason with** (survey): frozen and straggler pegs, Bell's
  packages and purges (short patterns that clear a block, such as a row of
  three with a catalyst peg that ends where it began), clearing one region at a
  time, compactness. Position classes and pagoda functions cannot be checked by
  eye, so they can only ever back a verdict, never a premise.

### The design

1. **Lead with a reason the player can see, where there is one.** A rival jump
   that cuts a peg off, at once or within two jumps, is named as the trap: the
   victim peg outlined, the rival's path striped, the suggested jump ringed.
   "Within two jumps whatever you play" has to be shown so a player can follow
   it; work out the depiction before using it.
2. **Show every good jump, where it discriminates.** Arrows (a new `JUMP` mark
   kind keyed by its two ends, since one peg can have a good jump and a losing
   one) on every jump a finish was found after, with the suggested one ringed.
   Drawn only when at least one rival is BAD. "Only these can finish" is said
   only when no jump is UNKNOWN; otherwise the words claim nothing about the
   undrawn ones. Classified for the displayed step only, within a work budget,
   so cost is per request rather than per plan.
3. **The middle game teaches packages, if the plans fall into them.** Measure
   first how often the beam's plans decompose into known packages; if rarely,
   consider a package-aware search. A package is one journey of several jumps.
4. **The opening says so.** Where every jump can still finish, say that, and
   suggest a region to start clearing.
5. **Drop** "N pegs left" and the bare "Keep going".

The binding rules hold throughout: every sentence built with `phrase` and
references, at most 120 characters, no em-dashes, the help page's Hints section
rewritten with the new marks.

## D7. The redesign as built (tasks §4)

Measured 2026-10-02 at load average 6–9 with swap nearly full, so read the
milliseconds as upper bounds and the ratios as the result.

### Packages (task 4.1)

Plans from the dealt board of every preset, three seeds, searched for the
named shapes first: of 859 plan jumps, **276 (32%)** lie in a package: 38 rows
or columns of three and 27 blocks of two by three. The L never appeared. Of the
859 positions along those plans, 61 (7%) have a plan that *opens* with a
package, which is what a request can offer, and following it covers three or six
jumps. That is often enough to teach, so a package is narrated (D6 item 3), and
a package-aware search is not needed to make them appear. An earlier count that
took the longest pure-removal window first reported 66% of jumps in *some*
window, but in dozens of shapes no player would name; that count is not the
one to quote.

A package is detected on the plan, not searched for: three or six jumps from
the plan's head whose net effect only empties a line of three or a 2×3 block.
"Every other peg ends where it began" is then true by construction, which is
what the first leg says. The help's description of how a row is cleared (a
spare peg jumps across the line's end and back) was read off the pinned row
and column journeys, and the help says "can", not "always".

### The rivals' cost (task 4.2)

Each rival was classified in stages on the hint's own path and on a wandering
player's, for 9×9 Cross, 9×9 Random and 7×7 Cross:

- **Early** (all rivals finish): the 300-wide beam settles every rival,
  200–350 ms for 9×9 Cross's four or six rivals and 1–1.7 s for 9×9 Random's
  sixteen.
- **Middle** (about 20–38 pegs): the 3,000-wide beam took 1.5–4 s per position
  (20 s at worst) and converted at most two rivals; the proof at 30,000
  positions settled almost none. Most middle rivals are unsettled whatever the
  budget, so spending more buys nothing.
- **Late** (17 pegs or fewer): everything settles within 2,000–30,000 positions,
  in well under half a second.

So a rival is judged by a 30-wide beam, then a 300-wide one, then a proof of at
most 10,000 positions (`judge`), all drawing on one allowance of 400,000
positions per request, counted rather than timed so the same position always
gets the same answer. The 3,000-wide beam is not used on rivals. Read out
loud over whole games, a request's worst case was 300 ms on 9×9 Cross and
290 ms on 9×9 Random, outside the plan search's own out-of-reach refusals.

A request plans one step, or one package's journey, and the next request plans
from wherever the player is. That is what "classified for the displayed step
only" asks, and it keeps every claim about the rivals about the board on
display. The cross-game walks call the hint more often as a result. Timed for
Pegs alone under comparable load, against HEAD: the resume walk went from 23.8 s
to 11.6 s (the old plan-wide proofs are gone), the binding and gesture walks
from about 2 s to 7 s each, and the CI-only readability walk from 9 s to 36 s.

### Traps (task 4.4)

On positions with fewer than 20 pegs, across eight presets, 85 rivals cut a
peg off at once, 18 within one more jump whatever is played (10 of them
leaving the same peg cut off after every reply), and 33 within two. 69 of 193
positions had at least one.

The step shows the first two kinds. "After the striped jump, any jump you make
next cuts off the outlined peg" can be checked on the board by trying each
reply, and the hint says it only where one peg is cut off after every reply. The
two-jump case is a tree a player cannot follow by eye, so it is not narrated.
A cut-off at once is preferred over one a move later, then the rival nearest
the offered jump.

### What each step says

In order: a trap; a package; then, from the judged rivals, *only* (every rival
lost), *only it and the arrows* (all settled, some finish), *the arrows can
also finish; some others cannot* (some lost, some unsettled), *every jump here
can still finish* (all finish), or the plain step, which says only that the
board can still finish after it. The jump that leaves one peg says so.
The plain step is common in the middle of the larger boards, and it is honest
there: most rivals are unsettled at any budget. "N pegs left" and "Keep going"
are gone.

The opening's region (D6 item 4) is the package where the plan opens with one.
Otherwise no region is named, because nothing measured gives a region the
player could check.

### Marks

`JUMP` is a mark kind keyed by both ends. An arrow (outline) runs from the
edge of the jumping peg over the peg it takes to the edge of the hole; stripes
on a `JUMP` hatch its three squares, and stripes on a package shape hatch the
pegs it clears. A jump spans three tiles, so each tile is clipped to its own
square and carries the jumps through it in its cache key, and every tile a
mark crosses repaints its own piece (docs/games/rendering.md § "A tile paints
only its own box, and tiles that share pixels repaint together").

### Elsewhere

Two owner requests from the same review are their own changes:
`let-a-refusal-point-at-its-cause` (Check & Save refuses a doomed position,
engine-owned) and `let-the-engine-own-what-solve-shows` (Solve leaves the
finished board in every game; Pegs' one-peg snap already does).
