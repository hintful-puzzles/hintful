# Design: name-the-rung-a-hint-step-speaks

Implemented together with `keep-the-pin-scan-command`, because a pin for every
rung of every game is only affordable when writing the pins is one command.

## D1. The id rides on the step, not on the sentence

`HintStep.rung`, required, typed by a third parameter
(`HintStep<Move, Highlights, Rung>`).

The proposal left three places open. Read against the code (2026-10-04):

- **On `Sentence`** was the tempting one, since a `Sentence` is already typed
  and already per step. It is the wrong grain in both directions. One
  deduction speaks several sentences (Pegs' trap reads differently when the
  rival is the hinted peg's own jump; a Tents line count has four wordings),
  and in the candidate-walk games no single call writes a step's sentence at
  all: the game supplies a premise and `runCandidatePlan` finishes it with the
  move's ending. A rung on the sentence would have had to be threaded through
  `Premise`, `StrikeWords` and `conclude` to arrive.
- **Derived from a declaration the game already makes** has nothing to derive
  from. `hintMarks` is about marks, and a `describeLadderCensus` rung list is
  the solver's ladder, which is a different population from what the hint
  narrates (a hint narrates reasons, of which a rung may record several).
- **On the step**, the reason is in hand where the step is built, which is one
  to three places a game. The stamp is `rung: reason.kind`.

## D2. The list is a const, the type is derived from it, and both directions compile

`export const FOO_RUNGS = [...] as const` and
`type FooRung = (typeof FOO_RUNGS)[number]`. The game declares
`Game<…, Highlights, FooRung>` and `hintRungs: FOO_RUNGS`.

- A reason kind missing from the list fails at the stamp, because the step is
  typed by the list.
- A rung in the list with no pin fails in the game's test, because
  `describeHintPins` takes `Record<Rung, HintPin>`.

A `Record<Rung, true>` would be exhaustive without a helper, but it makes the
type the source and the runtime list a copy of it; the const is the one thing
written, and it is what the pin harness and the hint-quality walk read.

`Game` takes an eighth type parameter, defaulted to `string`, so every use that
does not care is unchanged. Only `hint` and `hintRungs` are typed by it: the
other hint members take a step whose rung is a `string`, which a narrower step
satisfies.

## D3. What a rung is

The deduction, at the grain the solver or the plan already names it: a reason
union's `kind`s, unrenamed, or the branches of a non-deductive hint. Legs of
one journey share their firing's rung. Two wordings of one deduction are not
two rungs; a test that wants one of them writes a predicate over the step's
fields. A rung is split only where the halves are different reasoning.

This is what the proposal's "several sentences per rung and several rungs per
sentence" came to on Pegs: fifteen pinned sentences are eleven rungs, and the
other distinctions (whose jump the rival is, the shape a package clears) are
fields the step already carries in its marks.

## D4. The candidate walk stamps its own steps

`runCandidatePlan` builds the steps of the candidate games, with the reason of
each leg in hand, so it stamps `reason.kind` itself, and its own steps carry
the engine's ids (`CANDIDATE_RUNGS`: `populate`, `clean`, `note`, `dup`;
`LATIN_RUNGS` adds the singles, `set` and `forcing`). `PlanRung<Reason>` is the
type of a plan's steps, so a game returning them as its own `Rung` fails to
compile when its list lacks a reason kind. A candidate game writes a list and
no stamp.

## D5. A rung's pin is a plan that speaks it; a kind's is a plan that opens with it

Until now a kind was "what a plan opens with", so a deduction that is only ever
a later leg (a placement's cull, the middle jump of a package) could not be
pinned, and the guide carried a paragraph of workarounds. Keyed on an id,
"some step of this plan is rung X" is exact, so that is what a rung pin
asserts, and `PinnedPosition` gains `index`. The scan still prefers a position
where the rung opens the plan. A predicate kind keeps the opening-step
reading, because predicates also read the board the plan is asked from.

`HintKind` no longer accepts a `RegExp`. That is the structural half of "no
test reads a sentence to learn which deduction it is": the type refuses it
where the pins are declared.

## D6. `unreached`, as `describeLadderCensus` has it

A rung no known board fires is listed in `unreached` with its reason, typed so
that it is excused from `pins`. The scan walks the excused rungs too and says
when one fires. Empty is the goal; an entry is a shortfall on show.

## D7. Where the wording is held now

A regex kind asserted two things at once: which deduction, and (by being
anchored) how it reads. The first is the rung. For the second the harness
declares one more test, a snapshot of the sentence said at each pin. A
rewording is then one reviewable diff a game, and the snapshot doubles as the
readable list of what a game's hint says.

## D8. The narration ledger lists rungs

`LONG_NARRATIONS` entries name `rungs` where they named a regex. The lists were
taken from the walk the guard itself makes, by recording the rung of every step
over the limit against the entry its regex matched, so each listed rung is one
that walk hears.

## What was declined

- **A cross-game source scan forbidding `.test(step.explanation)` in tests.**
  It would be a regex over source standing in for the type that already
  refuses the regex where it mattered. The remaining matches on `explanation`
  in tests are wording assertions, which is what they are for.
- **Stamping through the sentence builders** (`so({ rung, … })`). See D1.
- **A description string per rung.** Nothing would consume it.
