# envision-the-game-contract

**Status: scaffolded, not started. A vision change, deliberately not
over-specified.** Owner-requested 2026-09-28. Its session explores what is
possible and ends by **scaffolding independent changes**, one per concern or
phase, in an order; it implements little or nothing itself.

## The direction (owner, 2026-09-28)

This project is an intentional rewrite of Simon Tatham's collection — disparate
games written by many authors at different points in the engine's life — into a
single coherent whole on a much more opinionated, framework-like engine. The
engine should hold a **detailed contract of what a game provides**: its
functionality, its parameters, its text, the words its hints use for their
marks. The contract is checked by **types and by validation functions**, and a
game that lacks part of it is a **draft**.

Recorded answers:

- **Draft is a label in the catalog.** Games are now often implemented in a
  single session, so a draft is usually already playable; the label says it is
  not yet complete, and nothing is hidden.
- **A hintless game is a draft.** The goal is every game hinted by the end of
  October 2026 (AGENTS.md § "Hint quality bar").
- **Hint narration: lean towards typed slots** — a sentence template whose mark
  and value references are typed — over full sentence structures. The session
  decides.
- **Staging:** this one vision change, then separate changes per concern.

## Why now: what 2026-09-28 found

`cover-hints-in-help-and-guard-tile-flags` wrote a Hints and a parameters
section for every game from the game's own code, and built a guard comparing
every warm frame with a fresh paint. The defects it found fall into classes a
contract could make impossible rather than merely detectable:

- **A hint's words and its marks are two channels the engine cannot relate.**
  `HintStep.explanation` is a `string` and `highlights` is `unknown`; at the
  time, 31 games hand-typed their mark words ("striped", "outlined", "ringed").
  Boats called a column striped and drew rings; Solo said "highlighted" for
  outlines; Spokes drew a rule-out exactly as a finished mark. If a sentence
  referred to a mark through a typed slot, and the engine owned both how each
  mark role is drawn and the word for it, these could not be written.
- **Help text described controls and parameters the code disagreed with**
  (Magnets' click cycle, Signpost's right-drag, Crossing's and Undead's pencil
  marks, a menu item every page misnamed). Those are exactly the parts a
  contract declares; generated from the declaration, they cannot drift. The
  parameters guard added that day checks that prose *mentions* each Custom
  dialog field — the weak form of generating it.
- **Fourteen games had repaint defects** — an input missing from a tile's key, a
  tile painting outside its own box, pixels shared by two tiles repainted by
  one. `explore-the-tile-loop-inversion` was withdrawn partly because it found
  "no live defect of the class"; this is new evidence about that, from a
  broader instrument (`engine/testing/repaint-differential.ts`).

## Principles the design should hold to

- **One source of truth: every element of the contract is consumed by the
  engine or verified against behavior.** The engine builds from it (the dialog,
  the codec, the help section, the drawn mark, the dispatched input) or runs a
  validator that checks it. A field that only a check reads, sitting beside the
  code it describes, is the one shape that has failed here (AGENTS.md
  § "Convention over configuration").
- **Types where they can carry it, validation functions where they cannot.**
  Some obligations are semantic — a deduction is valid, a plan survives
  recomputing, a generated board is unique at its stated difficulty. The
  contract can still name them and the engine run their validators.
- **A game that does not fit a shared shape is a reason to reexamine the
  shape** (owner, 2026-09-28). The catalog is to grow significantly over the
  coming year, and what looks like an exception now is reasonably likely to be
  the first of a new category. So a misfit first asks whether the shape can be
  made more flexible — a parameter, a variant, a family of shapes — and only
  when it genuinely cannot does the game take a typed override, saying why.
  Game-specific logic is never contorted to fit. The gesture-table exploration
  found 14 clean, 14 hatched and 29 partial fits for input; read the 29 as
  evidence about the shape, not only about the games.
- **Draft is computed, and visible.** A contract section is implemented or an
  explicit draft placeholder; the catalog label is derived from those, never a
  flag a game sets about itself.
- **Performance is a real constraint.** The scene-graph pilot was rolled back
  because animation was visibly slow. Anything that moves painting behind the
  engine has to be timed in a browser before it is adopted.

## What the session should look into (candidates, not a plan)

- **Hint narration and marks**: typed slots bound to mark roles the engine
  draws and names; the step validated so every slot refers to a mark it carries.
  This month's hints are the pressure, so it comes first if it holds up.
- **Help generated from the contract**: parameters from per-field docs declared
  beside `paramConfig`; controls from declared input where input is declared;
  the Hints section's list of marks from the mark roles. Rules prose stays
  hand-written.
- **Rendering**: an engine-owned tile loop where a painter sees only its tile's
  view and is clipped to a declared footprint, and tiles that share pixels are
  known to the engine.
- **Input**: declared where the shape is shared, with keyboard and touch
  equivalents derived; the games that fit only partly are first a question of
  how flexible the shapes can be, and a typed override only for what remains.
- **Text elements**: refusal messages, status text, error strings — which of
  them belong in the contract.
- **Completeness and the draft label**: how a game is defined (a builder,
  typed sections, draft placeholders), and how today's derived guards become
  consumers of the contract instead of each deriving its own population.
- **Migration**: 57 games move in some order; the contract must be adoptable a
  game at a time, with the old and new shapes coexisting.

## Before starting

- **Read the withdrawn directions as evidence, not as verdicts.** Five
  postmortems in `openspec/postmortems/` withdrew parts of an earlier framework
  vision (scene graph, gesture table, board model, game-definition adapter,
  tile-loop inversion); its document, `docs/framework-rdd/`, is in git history.
  Each was judged against the goals of its day — the migration window, byte
  parity, whether a live defect existed. Re-read each for what it *measured*,
  keep the measurements, and re-ask the question under the goal above. The
  adapter's settling criterion ("did a declaration need to know about any other
  declaration?") answers differently once cross-checking hint words, marks and
  help is the point.
- **Two live specs give the old rule as a reason**, and still describe today's
  mechanism accurately: `build-pipeline` (test selection: guards find their
  population "never [from] a manifest", "a rule this project holds
  deliberately") and `ts-engine` (the capability snapshot refuses an approved
  vocabulary as "a manifest"). AGENTS.md was reworded on 2026-09-28; these are
  amended by whichever scaffolded change replaces the mechanism they describe,
  not by hand before then. Grep the specs for the word again rather than
  trusting this list.
- **Take numbers fresh**: every count in this proposal is dated 2026-09-28.
- **Output**: a written vision (in this change's `design.md`) and the scaffolded
  changes that follow from it, each with its own falsifier where it makes a
  claim about cost or benefit.

## Steering, until this lands

For any session working meanwhile: prefer declarations the engine consumes; do
not add a new list that only a check reads; and when writing a hint, keep its
mark words and its marks easy to bind together later (one function per mark
reference, say) rather than spread through string literals.
