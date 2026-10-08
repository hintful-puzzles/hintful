# investigate-a-language-for-puzzle-games

**Status: scaffolded, not started (2026-10-08). For down the line.** Filed on
the owner's word the same day, as a long-term effort. It waits for the owner
to say when, and a session choosing its next change passes over it
(`docs/work-management.md` § "The backlog is being drained").

This is an investigation. It ends with a report and a recommendation, and
builds nothing the app runs.

## Why

The owner's direction (2026-10-08): a structured language of our own for
defining puzzle games, taking what it can from prior art and probably reaching
further, with three aims in order of distance:

1. **Maintainability.** A game stated in one checked form, where today its
   rules are spread over its solver, its validator, its spec and its help page.
2. **Reasoning about the space of puzzle games.** What our games have in
   common and where they differ, stated in terms a program can compare.
3. **Inventing games.** In time, searching that space for new games with
   properties we want, such as "easy to learn, hard to master", derived from
   the structure of a game's deductive rules.

A paper is a possible outcome.

Two findings from a first search make it worth a proper look
(`design.md` § "Prior art"):

- **Every language found describes what a valid solution is, and stops
  there.** A generic solver then searches for one. None describes how a person
  deduces the next move, which techniques a difficulty tier allows, or the
  words that explain a step.
- **That missing layer is what this collection already has in code.** A logic
  game here has one deduction engine whose named techniques both decide which
  boards are dealt at a tier and narrate the hint
  (`docs/games/solver-and-generator.md` § "One engine, two projections"). No
  prior work found has that for dozens of games.

## What it has to reckon with first

**This repository has tried to declare its games before, and withdrew most of
it.** Between August and September 2026 a framework vision proposed that a
game be a set of declarations compiled into the app. Two parts shipped as
helpers a game calls. The gesture table, the board model, the definition
adapter and the tile renderer were each withdrawn with a postmortem
(`ls openspec/postmortems/`), and `retire-the-framework-vision` closed the
vision, saying no withdrawn direction was to be reopened. `engine-difficulty`
still refuses, with three reasons, to derive a tier list from a technique
ladder.

Those attempts asked whether declarations could build the app, and measured
the code saved. This asks whether a game can be described precisely enough to
analyze and compare, which they did not test. The first aim, maintainability,
is the one that overlaps them. The investigation reads every postmortem before
it claims anything for that aim, and says for each whether its finding binds
here.

## What Changes

Nothing in the app, the engine or the specs. The change produces, in its own
directory:

- **A reading of the prior art in full**, each system tried against the same
  few of our games (`tasks.md` § 1).
- **A reading of our own withdrawals** and of what the tree already declares
  about a game (§ 2).
- **Three small experiments**, none of which needs a language to exist first
  (§ 3): what the technique ladders we have already say about a game's
  learning curve; how many of our games a first vocabulary can state; and
  whether a technique can be stated so that a solver checks it is sound.
- **A report for the owner** (§ 4): whether to build a language, what it would
  describe, what would consume it, what a paper would claim, and the next
  change if there is one.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. The change sets `skip_specs`.

## Impact

- This change's directory only, until the report. Experiment code, if any is
  kept, lives in the repository under a path the report proposes.
- No dependency is added to the app. A solver used for an experiment is a
  development tool and is not bundled.

## Acceptance

The owner's: the report, and their decision on its recommendation.
