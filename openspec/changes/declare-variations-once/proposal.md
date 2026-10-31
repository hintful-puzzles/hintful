# declare-variations-once

**Status: filed on the owner's word (2026-10-31)**, in
`compute-the-cut-by-technique-transfer` (`report.md` § "The owner's decision
(2026-10-31)"): commit to the computed cut in two words, "simplify simplify
simplify", with compatibility not binding while the app is in beta.

## Why

A variation's kind is written twice. A game's `paramConfig` declares it with
`rulesetItem` or `modifierItem`, which build the Custom dialog's field, the
words in a params label, the Type menu's sections and the help page's list.
A description's `variations` block gives it a `word` from four, which
nothing reads (2026-10-31: no consumer under `src/describe` or `src/engine`),
so the two already disagree: Solo's Jigsaw is a board shape in
`solo.description.yaml` and a modifier in `solo/index.ts`. At the catalog's
planned growth, every new variation is one more chance to disagree.

The cut computed which way a variation's techniques carry, and that is what
the two words now mean:

- **Ruleset**: the plain game's techniques stay sound in the variation and
  the variation's in the plain game. Rulesets of a game exclude each other
  and are the Type menu's sections, as now.
- **Modifier**: adds a rule. The plain game's techniques stay sound with it,
  and not back. Modifiers combine, as now.
- A change only to how boards are dealt is a **setting**, as size is, and no
  variation. A variation that keeps neither direction is **another game**.

## What Changes

- **The words.** The description's `word` is `ruleset` or `modifier`; "board
  shape" and "generator setting" go from the schema, the loader's types and
  the docs.
- **One declaration.** A game's variations are stated in its description,
  and the engine's ruleset and modifier fields are built from it, so the
  code cannot file a variation differently. What a field still needs that a
  rule does not say (its params key, its codec, what it leaves of other
  fields) stays with the game, keyed by the variation's name so a variation
  without it is a type error.
- **The catalog moves**, from the report's table read in two words:
  Solo's Jigsaw, Net's and Netslide's wrapping and Twiddle's rows only become
  rulesets; Ascent's Edges and Salad's Letters become modifiers; Group's
  identity hidden becomes a setting. Ascent's Orthogonal, Hex and Classic
  stay rulesets, so its Type menu keeps its sections.
- **The guard.** For a game whose techniques are stated, the checker computes
  each variation's word, recorded as `soundness.json` records verdicts, and
  the gate refuses a declared word with no verdict or one that disagrees.
  Rectangles' Patches, filed after the cut ran, is the first pair to compute.

## Open

- **How a game without stated techniques declares its variations.** The
  word is declared and unchecked until its techniques are stated; whether a
  description holding only help and variations is enough, or the
  declaration waits, is for the session to settle by trying it on one such
  game (Net).
- **Salad's Letters as a modifier.** Letters is Numbers with border clues
  added. The checkbox's name and title words are player-visible; the session
  proposes them.

## Impact

Player-visible: Type menu sections for Solo, Net, Netslide and Twiddle;
title words and help lines where a variation changes word; Custom dialog
controls for Ascent, Salad and Group. Game IDs and saved params may change
where a field's encoding does, and that is allowed.

## Acceptance

Every declared variation built from its description; the guard seen to fail
on a planted wrong word; the app run on each game whose word changed.
