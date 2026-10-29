# build-a-game-from-its-description

**Status: filed on the owner's word (2026-10-29).** Follows the language
investigation, archived as `2026-10-29-investigate-a-language-for-puzzle-games`
(`report.md` § "The owner's decision" and § "Correction"). It can start
before `compute-the-cut-by-technique-transfer` ends, on games whose
descriptions the cut does not touch, though it builds on a language not yet
committed to.

## Why

The owner: if the structured description could build parts of a game, "or
otherwise have the structured description help implement and maintain the
game and its deductions, that would be a strong reason to go ahead, and to
exclude games that don't fit well".

This repository withdrew four declarative directions in 2026-09 (the gesture
table, the board model, the definition adapter, the tile loop;
`openspec/postmortems/`). Each declared how a game is **implemented**, and
each said nothing a helper the game calls did not, so there was nothing to
build from. None had what exists now: a description of a game's **rules and
techniques** with an executable meaning, in which experiment C checked
techniques sound against the rules by a solver. That is the changed
circumstance, and the owner's direction is that a rejected direction is
revisited where circumstances have changed. Each postmortem is to be read
for whether its finding still binds, and why.

## What to explore

The details are this change's own (the owner, 2026-10-29). The candidates the
investigation saw, most promising first:

- **The answer check from the rules**: `status()` and `findMistakes`
  evaluated from the description, compared with the hand-written ones on the
  boards the gate deals. Checking a finished answer needs no solver.
- **The solver's ladder from the stated techniques**: the techniques as
  data the deduction fixpoint runs, so that the grader and the hint read one
  statement. It bears on `engine-difficulty`'s refusal to derive tiers from a
  ladder, whose three conditions include "a ladder can be declared without a
  board".
- **The help page's rules and the spec's `Rules:` requirements**, held to
  the description, so the four statements of a game's rules today become one.

Input and rendering came out per-game in every withdrawal, and are not a
first target; nothing rules them out either.

**Two directions from the owner.** Something akin to C#'s or Java's XML
dependency-injection configuration, written and maintained with tooling and
agents rather than by hand, which the owner would not want to write
themselves. And **JSON or YAML with a strong schema** in place of the
investigation's exploratory notation, for parsing and editing; formulas
inside need an expression syntax the schema names.

**A first family**: the Latin games share one engine
(`git grep -l engine/latin -- src/games`), and their descriptions and
techniques were written in experiment B (`collection/latin-and-numbers.md`).

## What Changes

Nothing a player sees. Exploration code, and if it pays, a report proposing
what to adopt, with what each postmortem now says about it.

## Acceptance

The owner's: the report, and their decision on adopting any of it.
