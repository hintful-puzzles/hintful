# Design

Written 2026-11-12 against `1118d723`, from Unruly's `solver.ts` and
`index.ts` hint code, `engine/ladder-runtime.ts` (`compiledRung`,
`ladderWalk`, `Firing`) and `describe/compile.ts` `techniqueFunction`. Each
claim about the code is a reading; task 1.3 measures it.

## Where a term is computed

A compiled technique calls `fire(binding, facts)` inside its binder loops
(`techniqueFunction`'s `fire`), before any fact is made, only where `fire !==
null` (the hint path). The scope `sc` of every binder is live there, so a term
compiled by the same `compileExpr`, with the technique's `tenv` and its
`with`, reads the marks as the premise did. That is the timing a reason
callback has today (`ReasonOf`: "on the marks before any of the firing's
facts is made"), so nothing about when a term is read changes.

So: `fire(binding, facts, terms)`. `terms` is an object literal the compiler
writes, one property per term, typed in the module as `<Id>Terms`. A solve
passes no `fire`, so it pays nothing. A firing carries `{ binding, terms,
facts, arms }` whole, and `Firing.reasons` goes: `Rung.firings` returns the
compiled firing and the engine, not the game, makes whatever per-fact
object a consumer wants.

## The description's additions

On a technique, one optional block, `says`:

```yaml
- id: quota
  for: ...
  conclude: "forall c in cells(L) where not known(c): place(c, flip(d))"
  says:
    terms:                       # name: formula over the binding
      full: d
      line: L
    marks:                       # role: a set of elements, over the binding
      stripes: cells(L)
      outline: "{c in cells(L) where value(c) = d}"
    shown: step                  # step | each | journey | none
```

- **`terms`** are named formulas of any sort the language has. A name is a
  property of `<Id>Terms`.
- **`marks`** are terms whose roles the engine knows (`ring`, `outline`,
  `stripes`, the roles `Game.hintMarks` already declares). Their values are
  sets of elements. The firing's facts are the targets (ring) and need not be
  written. **Evidence is the outline set less the targets**, subtracted by the
  engine (the report: "nearly every game"). A role left out is empty.
  What the walk reads (`ladderWalk`'s `reads`) is the union of the mark sets
  plus the targets, with a `reads:` term only where a game's walk reads
  something no mark shows (none of the three trial games does).
- **`shown`**: `step` is one step for the firing, `each` is one step a fact,
  `journey` is one step a fact where the later ones set `continuesPrevious`
  (Unruly's whole-line fill: today's behavior, so its default), `none` is
  a technique whose strikes a player cannot see and which a step never names.
  The default is `step`, and a technique with one `place` conclusion that does
  not say otherwise needs no `says.shown`.
- A technique with no `says` at all gets no step: it is the engine's `none`.
  That is how today's fire-and-forget techniques stay as they are.

### Named arms

*Withdrawn 2026-11-12: arms are conditions on the binding (§ "Singles,
built"), not names of a conclusion's parts.*

`conclude` stays a formula. Where a technique concludes several things that
read differently, it may be a map from an arm's name to a formula, and means
their `and`:

```yaml
conclude:
  sign: "..."
  other: "..."
```

The compiler writes each arm's facts and records, beside `facts`, one arm
index a fact (`arms: number[]`, in step with `facts`). A string `conclude` is
one arm named for the technique. `<Id>Arm` is the module's union of names.
Nothing else about the language changes: `places`, `compileExpr` and the
soundness check read the conjunction as before.

**The kinds a hint can speak** are then the module's: every `<id>` of a
one-arm technique and every `<id>.<arm>` otherwise. `*_RUNGS` is that list,
the engine hands it to `Game.hintRungs`, and a guard needs no population of
its own (`hint-text.ts`'s sentences are typed by it).

## What a game declares

One adapter, `hintAdapter` on the game, read by the engine to build `hint`,
the plan loop, `hintKeepTrack`, `refreshHintStep` and `hintGesture`:

```ts
hintAdapter: {
  /** The state as the description's marks: Unruly's `marksOf`. */
  marks(state): CellMarks;
  /** A fact as the move that makes it. */
  move(state, fact: { kind, at, n }): Move;
  /** An arm's words, from its typed terms and the marks it shows. */
  say: { [kind]: (f: Spoken<Terms>, m: Marked) => Sentence };
  /** How a move reaches the fact by a gesture (Unruly: left or right button). */
  gesture?: ...;
}
```

- `hint` is the walk of `ladderWalk` over the described ladder with `reads`
  from the marks, one `HintStep` a firing as `shown` says; `highlights` come
  from the engine's marks and the target. `hintKeepTrack` is "the move makes
  every fact of the step, or one of them, or none" from `move`;
  `refreshHintStep` re-renders a step whose facts the player has partly
  made; `hintGesture` is `verbGesture` over `gesture`.
- `say` is what remains of `hint-text.ts` and `narrate`: a function of an
  arm's typed terms and its marks. The words do not change in this change.
  The `Marked` object (`target`, `evidence`, `line`) is the engine's: the
  three roles of Unruly are `ring`, `outline` and `stripes`.
- **Overrides**: a game keeps its own `hint`, `hintKeepTrack` or
  `hintGesture` for a step that is not a deduction or a move that is not the
  facts (Guess's probe, Rect's drag), and says why in a comment. A game with
  an adapter and an override of the same hook is a type error.

## Against the earlier withdrawals

- **State, clone and codec** are not generated: the adapter reads a state
  and never makes one.
- **A definition object compiled into a `Game`** is refused: the adapter is
  not compiled, and the `Game` is still written by the game.
- **Its test**: the adapter is *consumed*. A game without `hintAdapter` and
  without its own `hint` has no hint, and the cross-game hint guards fail it
  (`docs/hints.md`). If the three trial games show `marks` and `move` saying
  nothing a helper would not, the adapter becomes a pair of helpers and this
  design changes. Unruly's `marksOf` already exists, which is the evidence it
  is a real declaration; `move` is its one-line `place` and is the doubt.

## The comparison (task 1.2)

A test walks every hint walk of the three trial games (the same boards the
existing hint tests pin and the hint-quality walk uses) and records each
step's `explanation`, `words` and the marks `stepMarks` gives, to a snapshot
taken at `HEAD` before the game moves. After the move the snapshot must match
byte for byte. It is seen to fail by planting a role swap (outline for
stripes) and a dropped term. A difference is a defect of the change, or a
defect found in the game, said which.

## What the trial found (task 1.3, 2026-11-12)

- **Unruly, built.** `says` on five techniques; `describedHint`
  (`engine/described-hint.ts`) builds `hint`, `hintKeepTrack` and `hintRungs`.
  The step's kind is the technique's id, so `complete` is `lastGap` and
  `quota`, and `nearcomplete` is `lastOne`; the fingerprint holds words and
  marks and not the rung's name for that reason.
- **A defect in the old game, found by the comparison.** A whole-line fill's
  sentence says "all its yellow cells (outlined)", and the old marks outlined
  the cells filled *on the board when the hint was asked*, not the ones earlier
  steps of the same plan fill. A step shown after the player made those steps
  outlined a subset. The engine reads the marks as the firing meets them, so it
  outlines them all. 162 of 617 steps differ so, and nothing else does:
  with the outline cut back to the cells known at the ask, every board's hash
  equals the old one. The snapshot holds the corrected marks.
- **What the walk reads** is the union of the mark sets and the cells the
  firing fills. It equals Unruly's hand-written `reads` on every technique.

### Singles, built (2026-11-12)

- **A step is one fact or one firing.** Unruly's step is a fact (a journey
  of one move each); Singles' is a firing: one step, `{ sets: [...] }` as its
  move, targets in its highlights, `hintKeepTrack` shrinking it in place as the
  player makes some. `engine/described-firing-hint.ts` is that shape, chosen by
  the game (`describedHint` is the other); the shrink (`trackTargets`,
  `words.narrow`) is the engine's. The game gives `target`, `want`, `move`,
  `valueAt`, `execute` and `foreign`. `says.shown` per technique still waits
  for a game that mixes the two.
- **Arms are conditions, not parts of the conclusion**, so the earlier
  "named arms of `conclude`" is withdrawn. Built as `says.arms`: an ordered map
  from a name to `when`, each arm adding `terms` and `marks` to the shared ones.
  The kind is `<id>.<arm>`; `SAYS_KINDS` in the compiled module lists them
  (every game's, so `describedHint` can take it as well), and the sentence of a
  technique narrows on `spoken.arm`. Corner has five (`four`, `apex`, `across`,
  `pairAtS`, `pairAtT`). Whether Unequal's `sign` and Light Up's `square` fit
  is still to be read, when each moves.
- **A mark can depend on the facts**: Singles' hatch is the one line holding
  every cell `sameLine` covers, written as a set expression over the cells'
  state (no `if` needed). The engine subtracts the facts and the strand from the
  outline. `strand` is a fourth `says` role, handed to the sentence and to the
  highlights; it needed no new `MarkRole`, since the words still say `outline`
  and only the highlights draw it apart.
- **What the walk reads is a decision per technique, not per game.** Unruly's
  fills read the whole line they fill, and Singles' `pair` and `sameLine` only
  hatch a line: including stripes in the reads moved two of Singles' walks
  (and excluding it moved Unruly's). So the reads are the outline, the strand
  and the facts, and `says.marks.reads` adds a set where a technique reads
  more (Unruly's four stripes). The earlier "the union of the mark sets" is
  withdrawn.
- **The comparison.** Every hash of Singles' walk is the same as at `HEAD`:
  the four boards a preset the snapshot holds, and a widened run of forty boards
  a preset (80 walks, every corner arm met, `apex` 8 times and `across` twice),
  run against a worktree of `HEAD`. Only the census names changed.
- **Lines.** Singles' hand-written hint went from 400 lines (`index.ts` 248
  out, 49 in; `solver.ts` 152 out, 25 in) to 49 + 25 + 64 of sentence glue
  (`hint-text.ts` is the game's words) and 66 of `says`. Unruly's went from
  ~437 lines out of `index.ts` and `solver.ts` (141 + 145, 21 + 7 in) and 36 of
  `hint-text.ts` to 19 of `says`.

### Boats, built (2026-11-12)

- **The engine took the four things Boats needed**, in `describedFiringHint`:
  `tiers` (start at the board's lowest solving tier, go up only where one has
  nothing to say) and `plan` (a cap on firings); the squares a firing's placing
  techniques decide, read as the marks' diff across the firing and handed on as
  `consequences` (shown and made, not said); `journey` (`legs` over a firing's
  targets one value at a time, `legTargets` of a leg), whose keep-track is
  `trackLeg`, the leg's own squares and no shrink; and `highlights`, for a game
  whose step marks are not `{ targets, strand }` (Boats keeps `evidence`,
  `line`, `w`, `h`, which its renderer reads).
- **The kind is the technique's id**, so Boats' fifteen rungs became its
  techniques': `lineShips` and `lineWater` (and `hidden.forced` and
  `hidden.satisfied`, the arms of one technique, which spoke those two
  sentences), `onlyFit` and `onlyRuns`, and the three trials as themselves.
  Sixteen techniques `say` and three keep a reason callback; the callback
  receives the technique's `says` and returns it with the breach term and the
  cells the breach flags. The trials' breach is not a term: it needs the
  validator, which no formula reaches, and Bridges' `with` would not change that.
- **A defect found in the compiler's cost**: `techniqueGrowth` counted the
  block that reads what a technique says, which runs once a firing on a hint's
  path only, so `onlyFit` and `onlyRuns` read as `n^2.5` for a set no solve
  builds. It no longer counts that block.
- **The comparison.** Every step of 216 boards (the snapshot's 20, and 192
  from 8x8 to 10x12 at Tricky and Hard, hidden numbers on and off; 6,225 steps)
  is the same as at `HEAD` in its words, marks, move and `continuesPrevious`,
  all nineteen kinds met, once each arm of `hidden` and `centerTrial` once.
  What differs is a highlight's `evidence`, which the engine reads as a set
  in board order where the old reason listed squares in the order it found
  them, and with the same square twice (`onlyRunsLeft` over a square in a row's
  run and a column's): 101 of 2,382 steps in the first run. The snapshot holds
  the new order.
- **Lines.** `solver.ts` 1005 to 590, with `BoatsFiring`, `BoatsTechnique`,
  `deduceBoatsPlan` and sixteen reasons gone; `index.ts` 733 to 662 (its
  dispatch, plan and keep-track gone, `legs`, the spec and its comments in);
  `hint-text.ts` +172 (a map from what a firing says to its sentences); the
  description +73 of `says`.
- **A test of the old shape went**: the pins were keyed by the old rungs and
  were scanned again (`centerTrial`, met once in some 4,000 steps, is pinned by
  hand).

### Bridges, built (2026-11-12)

- **An edge flavor, `describedEdgeHint`.** A fact strikes values from an edge,
  and what a firing decided is read off the marks across it: the engine hands
  the game the candidates as the firing found them (`before`) and the marks as
  it left them, and the game makes the move (a line's bridges, cross or limit)
  and the highlights. It owns the walk, the tier it starts at, the plan cap,
  the kind (`<id>` or `<id>.<arm>`) and the call to the technique's sentence; a
  contradiction is the unlocalized refusal. The cell shapes' per-fact target,
  shrink and journey have no edge counterpart: a bridge is drawn a drag at a
  time, so Bridges keeps its own `hintKeepTrack`.
- **`says` over islands, with lines as terms.** `marks` are cells (`outline`
  the islands the argument counts, `reads` the one it is about), and the
  bridges between a group's islands are a term, `links`, the first edge of each
  line, which the game maps to a span through its geometry. The island the
  sentence names is a term, `at`; whether the sentence recolors it, and the
  `self` reading of `tooMany.starved`, are the game's, from the kind and the
  terms. `tooMany` has two arms (`sealed`, `starved`), which the old reasons
  tested in code in the same order, and `starved` is a define.
- **Kinds are the techniques'**: `wouldSealGroup` is `sealing` and
  `tooMany.sealed`, `wouldStarve` is `tooMany.starved`, `wouldCloseLoop` is
  `loop`. The old hint ended a plan where no island needed a bridge, and the
  engine ends it where the ladder has no firing; no technique fires once every
  island is met.
- **A change of behavior**: the walk goes up a tier where the board's own has
  nothing to say, as Singles' and Boats' do, where Bridges' refused.
- **The comparison.** Every step of the snapshot's boards and of widened runs
  is the same as at `HEAD` in its words, marks, move and highlights, but the
  order of a highlight's `islands`, which the engine reads as a set: 30 boards a
  preset (6,522 lines) and 72 parameter sets of 3 boards, 8x8 to 12x12 at every
  tier, loops on and off, `maxb` 1 to 4 (4,644 lines), compared with the
  islands sorted, against a worktree of `HEAD`. Zero lines differ.
- **Lines.** `solver.ts` 679 to 483 (the reasons, `BridgesFiring` and the walk
  gone), `hint.ts` 375 to 348 (`narrate`, `highlightsOf` and the plan loop
  gone), the description +47 of `says`; `described-edge-hint.ts` (189) is the
  engine's.

### Light Up, built (2026-11-12)

- **The first game that mixes the two shapes**: `square`'s three arms
  (`forcedLight`, `clueSatisfied`, `clueSaturated`; `when` is `n < 0`,
  `bulbs(c) = n`, `n >= 0`, so the arm is read off the binding where the old
  reason read the fact's value) are a step a firing, and the two discount sets
  are a step a square. The engine took `says.shown: each` (`SAYS_EACH` in the
  compiled module, `each` on `describedFiringHint`), where the evidence is the
  outline less that square alone, which is what the old plan did.
- **`consequences: false`**: `shine` is a placing technique, so the engine read
  every square a bulb lights as a consequence to cross. The old step made only
  the firing's squares, since the lit squares show it already.
- **The dark square or the clue is the `strand`**, one square drawn apart, which
  the game's `highlights` tells by the square being a wall. A step whose target
  is the dark square has no strand left, the engine having taken the fills out,
  as the old `dark: undefined` did.
- **`refreshHintStep` moved into the engine** (it was Light Up's own, a copy of
  `keepTrack`'s narrowing); Singles takes it too, which it lacked.
- **The comparison.** 216 boards (5x5 to 14x14, all three tiers, 15 to 30%
  walls, two symmetries, two boards each; 3,803 steps) are the same line for
  line at `HEAD` in words, marks, move and highlights, but for the `value` each
  highlighted target now carries (the target's own kind; the lines were compared
  with it cut). All five old kinds were met.
- **Lines.** `solver.ts` 413 to 268 (`LightupHintReason`, `LightupFiring`,
  `premiseOf`, `stepsOf`, `deduceHintPlan` and four reasons gone), `index.ts`
  -127 (`buildHighlights`, `narrate`, the walk's glue, keep-track and refresh
  gone, the spec in), the description +26 of `says`, `hint-text.ts` +36 of
  sentence glue. A test that read the reasons (`deduceHintPlan`'s bleed rule)
  reads steps; one assertion that the discount set holds two squares went, the
  sentences no longer saying "one of them".

### Mosaic, built (2026-11-12)

- **The plainest cell game so far**: `alone` (arms `met`, `needsAll`) and
  `compared` (arms `needsMore`, `sameNeed`) each say their numbers as terms and
  `reads` the block of each number they count (`block(c) + block(b)`). No
  outline, strand or stripes: the sentences draw the block through their own
  `BLOCK` mark, which is words, not highlights.
- **`move(targets, state)`**: Mosaic's `fill` move names a square by its index,
  which needs the board's width. `describedFiringHint`'s `move` takes the state
  (and `narrowedTo` passes it), so a game whose move is not in points needs no
  override.
- **`refreshHintStep` came with it**: Mosaic had none, so a step the player had
  half made and then undone showed stale; the engine's now does.
- **The comparison.** 7 sizes (3x3 to 15x15) x 3 tiers x both `aggressive` x 4
  boards, HEAD against the new tree: 5,583 steps, every line (words, marks,
  move) the same, all four kinds met (2,316, 2,252, 454, 393). The rung names
  are the arms' (`alone.met`) and the highlights are `{targets, strand}` for
  `{cells, mark, w}`, so those two fields were cut from the lines.
- **Lines.** `hint.ts` 128 to 69, `solver.ts` -45 (`MosaicReason`, the reason
  callbacks and `mosaicWalk`'s glue), the description +21 of `says`,
  `hint-text.ts` +25 of sentence glue.

### Clusters, built (2026-11-13)

- **`describedFiringHint` with `shown: each`**: `refute` is one fact a firing
  and its five arms (`selfSurrounded`, `selfReach`, `nearSurrounded`,
  `nearReach`, `dotOvercount`) are the old reason's `starved(r)` and `n = x`
  tests in the same order, the last `when: "true"`; `countFull` and `countShort`
  place a set of squares and `shown: each` makes a step of each, as the old plan
  did. The kinds were `direct` and `count`; they are the arms' and the
  techniques' ids now.
- **The tile a count names is a term** (`aValue`, `aDot`, `bValue`, `bDot`),
  read on the marks as the firing found them, where the old plan read a copy of
  the grid it updated a deduction at a time.
- **The walk reads squares the outline does not**: the old `reads` took each
  square a firing colors and each tile it reads, with its four neighbors, so
  each technique says `reads` as that set (`{x} + adj4(x) + {n} + adj4(n)`;
  `set(m over u in R, m in {u} + adj4(u))` for the squares a count colors).
- **No highlights of its own**: the renderer intersected the words' outline
  marks with `highlights.outlined`, which were the same squares, so it reads the
  marks and `ClustersHintHighlights` is gone. `executeMove` moved into
  `state.ts`, which the hint needs and `index.ts` imports.
- **A change of behavior**: a walk that meets a contradiction after some steps
  shows those steps, where the old plan refused with the unlocalized
  contradiction. The midend asks for a hint only of a board `findMistakes`
  finds nothing wrong with, which a contradiction needs not to be; a first step
  that meets one is the exhaustion refusal now.
- **The comparison.** 8,655 steps over 120 boards (5x5 to 16x16, Easy and
  Normal-or-Unreasonable, 12 a size), HEAD against the new tree: the words, marks
  and move of every line are the same, and all seven kinds met (the least, 11
  `countShort`). The fingerprint's hash holds the highlights, whose shape
  changed, so its snapshot was taken again.
- **Lines.** `index.ts` -114, `solver.ts` -133 (`ClustersReason`, `ClustersDeduction`,
  `deduceHintPlan` and the reasons gone), `hint.ts` 66 and the description +31
  of `says`; `hint-text.ts` -9.

### Star Battle, built (2026-11-13)

- **`describedFiringHint`, a step a firing, no engine change.** Thirteen
  techniques say; `confined` and `banded` have two arms (`lines`, `regions`),
  which are the old reason's `rest`. The kinds were eight (`full`, `exact`,
  `crowded`...); they are the techniques' ids now (fifteen with the arms).
- **A line is a term, a unit's cells are a mark.** A Line technique says
  `L`, and its sentence reads row or column off it (the rows are numbered
  first); a Region technique's sentence says "region". The unit itself is the
  `stripes` mark. The trials' `completes` is three booleans of the
  description (`closesRow`, `closesCol`, `closesRegion`), read before the
  firing, and the squares those units hold are a define (`completing`) that
  `reads` takes.
- **A change of behavior, the one the comparison found**: a square a firing
  decides that its own `confined`/`banded` arm also outlines (a region's
  squares outside the lines, struck) was outlined and ringed; the engine's
  evidence is the outline less the targets, so it is ringed only. A ringed
  square drawn with the evidence tint beneath had nothing more to say.
- **The comparison.** 2,813 steps over 60 boards (5x5 to 12x12, one to three
  stars, all tiers), HEAD against the new tree: every line's words and move
  are the same, and the marks are the same once an outline of a ringed square
  is cut from the HEAD side. All fifteen kinds met (the least, 19
  `starvedLine`).
- **A define added for a `says` re-opens the game's soundness check.** The
  fingerprint reads the description's `define` block, so the four defines
  `says` needed (`closesRow`, `closesCol`, `closesRegion`, `completing`)
  changed every technique's, and the gate's source scan failed until
  `CHECK_GAMES=starbattle npx vitest run -c research/technique-check/vitest.config.ts describe-check`
  was run again. A game's `says` that can be written without a new define
  avoids that cost.
- **Kept**: the game's `hintKeepTrack` wraps the engine's, for the first of
  two clicks (a button's second click is the other's first), which the engine
  cannot know.
- **Lines.** `solver.ts` -207, `hint.ts` -113, `hint-text.ts` +108 (a
  sentence a technique), the description +78 of `says` and defines.

### Bricks, built (2026-11-13), and the per-fact `says` it came with

- **The per-fact `says` is built as designed below**, with three differences.
  The records ride inside the firing's `says` (`says.facts[i]`, typed
  `<Id>SaysFact`), not as a fourth argument of `fire`: the buffer is reset with
  `facts` and copied into `_says`, so `Fire`'s signature and `compiledRung`'s
  `fire` are unchanged, and `reasonOf` takes the fact's ordinal and the default
  `Said` carries `fact`. A fact made by anything but a cell `place` or `strike`
  throws where the technique concludes (`facts.length` and the records are
  counted), so a record cannot fall out of step. `FiringSpoken` gained `facts`
  (the step's squares each with its own terms) and its `outline`, `stripes` and
  `strand` hold the firing's marks with those of the step's squares. A `with`
  now returns whatever its body is (a set for a `says`); a premise that needs a
  truth still checks it.
- **One `shown: each` firing a square, no change of walk.** Bricks' five
  techniques each decide several squares and the old plan made a step of each,
  which `each` does; `three`'s run is its fact's outline
  (`with place(c, 1): run(c)`), and `unsupported` outlines `{p in below(c) where
  clue(hole, p) < 0}`, the squares it could rest on that are on the board.
- **A change of behavior**: the plan's cap (40) counts firings, where the old
  one counted squares, so a board whose walk is past forty squares has its next
  batch begin at a firing's edge. With the cap lifted on both sides all 78
  boards (4x4 to 14x14, both tiers, six each; 4,201 lines) are the same lines
  as at `HEAD`, words, marks and move, and all five kinds are met.
- **Lines.** `git show --stat` for the commit: `index.ts` and `solver.ts` lose
  their hint (`BricksReason`, `ForcedMove`, `readsOf`, `movesOf`, the plan and
  `belowOf`), `hint.ts` 95 and `executeMove`
  moved to `state.ts` (the hint needs it and `index.ts` imports `hint.ts`), the
  description +24 of `says`, `hint-text.ts` +19.

### Range, built (2026-11-13)

- **`describedFiringHint` with `shown: each` on all four techniques.** `capped`
  has two arms (`satisfied`, `overrun`: the old reason's `W === n`), the kinds
  are the techniques' ids and the arms' (`capped.satisfied`). `reach` is the
  per-fact `says`: its stripes are the run from the number to each square
  (`{k} + {q in R where index(q, R) < index(p, R)}`, `p` the `forall` binder) and
  its outline, per square, the squares the number would see past it once the
  squares up to it are clear (the old plan outlined the sight on the grid with
  the move made, which runs on through the target), plus the other arms' at the
  firing.
- **A change of behavior, the one the comparison could not remove**: the walk
  now carries on from every square a firing outlines, where the old one read
  the number or the shaded square only (`readsOf`). With the walk's reads
  narrowed to the old ones (a temporary switch in the engine, not kept) all 60
  boards (4x4 to 12x12, both tiers, 2,087 lines) are the same lines as at
  `HEAD`, words, marks and move, all five kinds met; with the engine's reads, 37
  of 60 boards take a different next firing at some step. The engine's rule
  stays: a game that wants narrower reads than its outline is a question the
  engine has not been asked yet.
- **Lines.** `solver.ts` and `index.ts` lose the reasons, `markedOf`,
  `lineOfSight`, `reachLine`, `nonBlackNeighbors` and the plan; `executeMove`
  moved to `state.ts`; the description +40 of `says`; `hint.ts` 70.
- **Seismic's `cull` is not this**: it strikes candidates (`strike(p, n)`), and
  `describedFiringHint` is a cell game's, a fact a placement. It waits for the
  candidate games' engine shape.
- **Sticks wants a second engine feature first**: a firing's later squares are
  steps that continue the first (`continuesPrevious`), and its sentence for
  them is another (`later`); `each` has neither.

### Sticks, built (2026-11-13), and `shown: legs` it came with

- **`says.shown: legs`** is `each` whose later squares continue the first: the
  compiled module's `SAYS_LEGS` (a subset of `SAYS_EACH`), the engine's `legs`,
  `continuesPrevious` on every step of a firing after its first and `later` on
  `FiringSpoken`, which the sentence reads to say the leg as a continuation.
- **All five techniques say per fact.** The supposed line is the fact's
  (`with place(c, a): stick(k)`: its run, its size, the numbers it joins,
  `reach(k)` and the span), and a block's `overConnected` outlines the lines that
  would run into it per square; `starved`'s open sides need no fact. A firing's
  `reads` mark holds the number or block, which the old walk read and the outline
  need not hold. No `define` was added, so the soundness check is not re-opened.
- **The square in the evidence.** The engine takes a step's own square out of
  its outline. The three length arguments (`tooLong`, `twoClues`) measure a run
  that holds it, so their sentences put it back (`marksOf`'s `kept`);
  `unreachable`'s span never holds it (the supposition shrinks the room), and the
  two block arguments never counted it.
- **Comparison.** 72 boards (4x4 to 8x10, both tiers, eight each; 2,499 lines):
  every one the same lines as at `HEAD`, words, marks, move and which steps
  continue, all five kinds met. The plan cap (40 firings) is the engine's `plan`.
- **A change of behavior**: keep-track is the engine's, so a move that sets the
  hinted square as asked and also other squares is judged by all of them (the old
  one looked at the hinted square alone).
- **Lines.** `index.ts` and `solver.ts` lose the reasons, `narrate`, the plan and
  the helpers that recomputed the supposed lines; `executeMove` moved to
  `state.ts`; the description +45 of `says`; `hint.ts` 80.

### Separate, built (2026-11-13), and the edge family's shape

- **`describedEdgeHint` is the edge family's engine**, with three additions the
  border-grid games need: `step` returns the firing's *legs* (an array; Bridges
  returns one), the engine marking every leg after the first `continuesPrevious`
  and asking the technique's sentence once a leg, with the leg's own `marked`;
  `done(marks, ctx)` ends a plan where the marks already are the answer (the
  ladder may still have no-wall notation to make: the old plan stopped at
  `isSolved`); and `writes` is optional, the walk's default being the two cells
  an edge lies between (a game that left it out had its steps in another order).
- **The border grid's pieces stay the border grid's**: `borderEdgeEdits` was cut
  out of `borderHintJourney` so a game builds a leg's move itself, and
  `borderHintKeepTrack` is the game's `hintKeepTrack` as before. Palisade, which
  shares both, takes the same shape.
- **`says` over regions**: `stripes` is the firing's first group (the edges are
  named from it), `outline` the second, `reads` both; the swap of which is
  striped for a lone square is the sentence's, from the spoken sets. The
  generator's recorder reads the holders off the `Said` binding (`x`, `y`), so no
  reason callback is left.
- **Comparison.** 128 walks (8 sizes, 4x4 to 10x10, four boards, four shares of the
  solution's edges already on the board, every recomputed plan listed, 381,206
  lines, 1,710 continuing legs) the same lines as at `HEAD`, words, marks and move,
  with the plan cap lifted; the fingerprint's snapshot (taken at `HEAD`) matches.
- **A change of behavior**: the plan holds 40 steps (it held to the end).
- **A test changed**: the one arm no hint reaches (an only-way firing of two
  edges) is a no-wall mark on a board whose walls are complete, which a hint
  stops short of, so it reads the ladder's firings.

### Palisade, built (2026-11-13)

- **The shape took Palisade unchanged**, seven techniques that `say`. Where
  Separate names a journey's edges from its striped group, Palisade's anchor
  differs by technique (a clue's square, the first of two groups, a corner), so
  it is a term of its own, `anchor`, a set. The engine's `forcedEdgesOf`
  (`border-grid-hint.ts`) now makes the legs' edges for both, which each game had
  copied; `borderHintJourney` went, with no game left to call it.
- **A technique's `reads` is a decision, as before**: `notTooSmall` and
  `inside` read the region they stripe, which the engine's reads (outline,
  strand, `reads`) do not hold, so they say `reads`. Left out, the walk took a
  different next firing at 4 of the first 25 steps.
- **Comparison.** 792,760 lines over 112 walks (7 sizes 5x5 to 12x15, four boards,
  four shares of the solution's edges on the board, every recomputed plan listed,
  127,853 continuing legs) are the same as at `HEAD`, words, marks and move, with
  the plan cap lifted; the fingerprint's snapshot (taken at `HEAD`) matches.
- **A change of behavior**: the plan holds 40 steps, as Separate's.
- **A test changed**: the one that read the firings' edges walks the ladder and
  reads the `anchor` term.

### Dominosa, built (2026-11-13)

- **Two step kinds in one `step`**: a firing's facts are read for the spot each
  decides, a placed domino (a leg of its own) or a barrier for each spot struck
  that the player has not drawn. The ones already shown are the walk's context
  (`seen`, made afresh for each plan and seeded from the player's barriers), so
  the later legs of a firing say "for the same reason" by their place among the
  barriers actually shown. The numbers a spot shows are the leg's, from the state.
- **Two engine additions**: `walk` may return `null` where the player's own marks
  clash (a hint with nothing to walk from: `DEDUCTION_EXHAUSTED`, as before), and
  an optional `reads(taken, ctx)`, the elements a firing reads beyond the marks it
  says: the old walk continued from the squares of the spots a firing struck, which
  no `says` mark can name for a firing of several. The refusal where
  `answerOf` is not `one` (`PUZZLE_NOT_REASONABLE`) stays the game's, ahead of the
  engine's hint.
- **`says` is an outline**: the square or squares the reason rests on (`{c}`,
  `{y, z}`, `T`, the ends of the domino's spots), and `{}` for `onlySpot` and
  `parity`. No terms, no `define`: the soundness check is not re-opened.
- **Comparison.** 32,555 lines at `HEAD` over 4 presets, 12 boards each, 4 shares
  of the solution's dominoes (and from 35% some barriers drawn), every recomputed
  plan listed, plan cap lifted: the same words, marks, move and continues, but
  15 steps the old walk showed twice. A firing that struck one spot twice had
  both shown (the old filter read the seen set before the loop added to it); a
  barrier is now shown once. The fingerprint's snapshot moved on two boards: one
  that duplicate, one the plan cap.
- **Changes of behavior**: the plan holds 40 steps; a contradiction found mid-walk
  is the unlocalized refusal (the old plan ended there with the steps so far).

### What blocks the rest (2026-11-13, a survey by reading, to be re-checked per game)

The first read of the remaining games found one that is a plain Clusters-shaped
move and the rest each blocked by something the engine lacks. A game that
meets one of these is first a question for the engine (AGENTS.md: a game that
does not fit a convention is a question about the convention).

- **Evidence per placed square.** A `says` reads the `for` binders, a firing's
  binding. Where a technique places several squares and the old reason held
  evidence of each (Bricks' `three`: the run through the square supposed shaded;
  Range's `reach`: the line from the clue to that square, and `cut`'s neighbors
  of its square; Sticks, all five techniques; Seismic's `cull`), one `says`
  cannot state it. Moving the square into the `for` binders changes the firing
  granularity and so the walk (a firing a square instead of a firing a row), and
  a separate guard technique moves where a broken position is found. The
  compiler's `place` site (`compile.ts`, `case "place"`) has the square but not
  the scope the `says` formulas compile in; a per-fact `says` (terms and marks
  read at each `place`, in the conclusion's scope) is the shape to design.
- **Not a cell walk**: edge and line games (Separate, Palisade, Dominosa, Pearl,
  Tracks, Path, Spokes), links (Tents, Galaxies, Signpost, Rect), state the walk
  updates between steps (Slant's merge marks, Net's notes, Magnets' hidden
  firings, Map's removed-color dots), candidate marks (Abcd, Seismic, Undead,
  Crossing; the candidate games already have their own task). Bridges'
  `describedEdgeHint` is the edge precedent.
- **Re-read after Sticks (2026-11-13).** Evidence per placed square is built
  (`says.fact`), and so is a firing's later squares continuing the first
  (`shown: legs`); neither remains a blocker. No game is left that moves with
  the cell engine alone: what is left is the edge, link and state-between-steps
  shapes above, and the candidate games'. The walk's reads hold what a step
  outlines and its facts, so a mark the old walk read and the outline need not
  hold (Sticks' number or block) is a `reads` mark.

- **Star Battle** read as firing-only (13 techniques, stars and crosses), with
  trial rungs whose `ruled`, `completes` and `touches` are derived from the
  square; the first read of what is next. Range and Bricks are one technique
  each away from it (`reach`, `three`).

### The per-fact `says` (a design, 2026-11-13, read against `compile.ts`)

Where a technique places several squares and each has its own evidence (Bricks'
`three`: the run through the square, supposing it shaded; Range's `reach` and
`cut`; Sticks; Seismic's `cull`), the evidence is read where the square is
made, which is inside the conclusion's `forall`, and a `says` is read after it,
in the binders' scope only. The shape:

```yaml
says:
  fact:                      # read at each `place`, in the conclusion's scope
    terms: { ... }           # per square; the square is the binder the `place` names
    marks:
      outline: "with place(c, 1): run(c)"   # a nested `with` is a formula as any
```

- **Compiler.** The `place` site (`compile.ts`, `case "place"`) is where the
  facts are pushed; on a hint's path (`fire !== null`) it also pushes one
  record of the fact's `says`, compiled by `compileExpr` in the site's own
  scope, so the `forall` binder and any `with` around it are live. The record
  rides beside `facts` as `factSays`, in step with it (the earlier `arms` idea,
  which was withdrawn for conditions on the binding, had the same slot), and
  `fire(binding, facts, says, factSays)`. A solve passes no `fire`, so it pays
  nothing; a technique with no `says.fact` is unchanged.
- **The record.** `compiledRung` already makes one reason a fact
  (`reasonOf(binding, fact, ..., says)`); it takes the fact's record as well, so
  `Firing.reasons[i]` holds `{ binding, says, fact }` and the engine reads the
  fact's own where it has one.
- **The engine.** A step that is `shown: each` takes the fact's terms and marks
  in place of the firing's (the outline is still less that square alone); a step
  that is a firing takes the union of the facts' outlines and an array of their
  terms. `FiringSpoken` gains `fact`, the terms of the square a sentence is
  about. `reads` is the union of every fact's marks and the firing's.
- **Why not the `for` binders.** Moving the square into them changes the firing
  granularity, so the walk (a firing a square, not a row), and the `three` guard
  (a position already broken) would have to be a technique of its own. The
  per-fact `says` leaves both as they are.
- **The risk is the cost of a nested `with` a fact**: it runs only on a hint's
  path, a firing at a time, and the soundness fingerprint does not read it (the
  fingerprint reads the `statement`, and `withoutSays` for variations).

### Read off Boats (2026-11-12, `boats/solver.ts` and `index.ts`), before it was built

Sixteen of its nineteen techniques are what `says` already carries (terms,
an evidence set, a hatched line). Four things in Boats are not, and each is a
decision for the engine, not for Boats:

- **A step is a journey of fill legs, with consequences.** One firing is one
  journey: its legs are `fill` rectangles (`legMoves`), and its highlights hold
  the facts' squares *and* the water the never-touch rule drags along
  (`consequences`: the cells the walk's `placing` techniques changed that the
  firing's facts did not name). The engine can compute both generally: the
  consequences are the grid diff across the firing, less the facts, and the
  legs are the game's `move` over the targets. So `describedHint`'s shape wants
  a third mode, a journey of legs over a firing's targets plus consequences, or
  `describedFiringHint` wants `legs`. Per-leg keep-track (`"completed"` per leg,
  no shrink) is Boats' own and stays an override or becomes a `keepTrack: "leg"`.
- **A target's value is a boolean, not a number**: a boat segment or water, and
  `step.rung` for a trial is `refuted`. Both fit `target(at, n)`.
- **Three techniques (`lastWater`, `lastShip`, `centerTrial`) are trials**
  whose sentence names the rule the supposition breaks, found by running the
  validator on a cloned board (`classifyBreach`, "Read the reason off the
  validator"). No formula says that. Choices: those three keep a `compiledRung`
  reason callback beside the other sixteen's `says` (the adapter reads whichever
  the firing recorded), or the breach is a term the *game* supplies, computed
  from the firing's supposed squares (`says.terms` of a `game:` function). The
  first is smaller and honest; the second is the engine's `with` question
  (Risks) and waits for Bridges' `with`.
- **The plan is a cap walk.** `deduceBoatsPlan` starts at the board's own
  tier and escalates while a tier has no firing, and caps the plan at forty
  firings. Escalation is every tiered game's, so it belongs in `describedHint`
  (`tiers: "lowest"`), not in Boats.

`numOf` (a line's number deduced from the fleet where it is not shown) is a
restated definition the description already states as a definition; its terms
should read that, not the game's function.

Bridges is a step further: its facts are edges, and `describedHint` and
`describedFiringHint` are cell games.

## Risks

- `terms` over a technique's `with` need the supposition's marks, which the
  compiler holds in `tenv` and not in the `fire` call's scope. Boats, Bridges
  and Sticks are the ones that need it. If a `with` cannot be read at the call
  site, a term is the compiler emitting its own nested `with` around the
  term's expression, which `compileExpr` already does for a premise.
- A term's cost where `fire !== null` on a plan that walks a whole board:
  terms are read once a firing, not a binding, and measured in 1.3.
- `journey`'s `continuesPrevious` is derived from the fact's group, as
  `deduceHintPlan` does now with `rec.group`.
