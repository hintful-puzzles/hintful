# name-the-rung-a-hint-step-speaks

**Status: scaffolded, not started (2026-10-04).** A follow-up from
`move-the-hint-scans-onto-the-harness`.

## Why

A hint step says which deduction it is only in prose. So everything that
needs to know reads the prose, or runs the solver again to ask:

- A pin's kind is a regex over `step.explanation`, or a predicate that calls
  the game's solver on the pinned board and compares `reason.kind`. The query
  for the second is `git grep -l -E "\(_?\w*, state\) =>" -- 'src/games/*/*.test.ts'`.
- `hint-quality.test.ts`'s `LONG_NARRATIONS` matches its listings by regex.
- `hint-ordinal.test.ts` finds a chain by reading any array in the
  highlights that carries `order`.
- A `hintUntil` predicate matches a phrase, and `docs/games/hints.md` warns
  that a loose one stops on the wrong frame.

Owner, 2026-10-04: *"we really should avoid regexes as much as possible in
favor of passing the actual object references or types, or at the very least
id's."*

A regex over a sentence is the name-keyed scan `AGENTS.md` § "Method" warns
about, aimed at our own output: a rewording silently empties it, and nothing
can say which sentences have no pin. Tents got the second half by hand, with
a `Record` over its reason kinds that fails to compile when a reason has no
pin. That is the shape to give every game.

## What is already crossing the boundary

Checked 2026-10-04, re-check before designing:

- `HintStep` carries `move`, `explanation`, `words?: Sentence`, `highlights`
  and `continuesPrevious`. It carries no id of the deduction.
- `words` is built by `phrase` in the games that are bound
  (`engine/hint-words.ts`), with a `Form` and a `Relation`. So a structured
  object about the sentence already rides on the step, and a rung id may
  belong on it and not beside it.
- Nearly every game's hint or solver code already has a reason object with a
  `kind` at the point the step is built. Count them by reading, not by grep:
  the grep found the literal in 52 game directories and cannot tell a rung id
  from any other discriminated union.

## What Changes

A step names the rung that produced it, as a value of a type the game
declares, and the consumers key on that:

- `describeHintPins` takes kinds by rung id where the kind is a rung, so a
  rung without a pin does not compile and a rewording moves no pin.
- The narration ledger lists a rung, not a regex.
- `hintUntil` and the render scenarios stop on a rung.
- `describeLadderCensus` and the pins use one vocabulary for the same rung.

Kinds that are about a step's shape (several cells, a continuation leg) stay
predicates over the step; they read fields, not prose.

## The decision to make first

Whether the id rides on `Sentence` (it is already per step and already
typed), on `HintStep` itself, or is derived from a declaration the game
already makes (`hintMarks`, the ladder's rung list). Ask what consumes it
before adding a field: `AGENTS.md` § "One source of truth".

## Hints to pull in

One game whose sentences are several per rung and several rungs per sentence,
since that is what breaks a one-to-one id. Pegs (fifteen sentences over a
handful of solver verdicts) and Galaxies (ten sentences, a ladder) are the
two to read first.

## What would show it worked

No test under `src/games/` or `src/engine/` matches a hint's sentence with a
regex to learn which deduction it is, a game adding a rung fails to compile
until it has a pin, and rewording a sentence changes only the tests that
assert the wording.
