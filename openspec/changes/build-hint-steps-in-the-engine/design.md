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
