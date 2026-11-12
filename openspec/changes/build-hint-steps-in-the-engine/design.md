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
