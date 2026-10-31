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

- **The word is read off the description, not written in it.** A variation
  that only adds (rules, clues, a partition, units) is a modifier: an added
  rule can only remove answers, so every technique sound before stays sound,
  which is a proof and needs no solver. A variation that replaces a block is
  a ruleset, and its techniques are checked in both worlds. A change only to
  the deal has no variation block. So `word`, and with it "board shape" and
  "generator setting", go from the schema; Solo's X and Killer, which add
  units and a partition, are written as additions.
- **One declaration, the code's.** The engine reads `paramConfig` at run
  time, and no description ships (`build-pipeline`), so the field stays the
  declaration: `rulesetItem` or `modifierItem`. The gate refuses a game
  whose description's variation is read as one word and whose field
  declares the other, by the variation's name (a ruleset's name, a
  modifier's words). A game whose rules are not stated declares its word
  unchecked, and is checked once its description states them. (Filed
  2026-10-31 as the engine building its fields from the description; the
  YAML never reaches the app, so that would have meant compiling a second
  module per game for what the field already says.)
- **The catalog moves**, from the report's table read in two words:
  Solo's Jigsaw, Net's and Netslide's wrapping and Twiddle's rows only become
  rulesets; Ascent's Edges becomes a modifier of Classic; Group's identity
  hidden becomes a setting. Ascent's Orthogonal, Hex and Classic stay
  rulesets, so its Type menu keeps its sections.
- **The checker** checks a description's techniques in every ruleset's
  world as well as every modifier's, so a ruleset's soundness both ways is
  what its verdicts record.

## Open

- **Salad's Letters and Numbers.** The report filed Letters as a modifier of
  Numbers (C10), reading it as Numbers with border clues added. The
  description deals one clue kind a board: border letters (ABC End View) or
  balls (Number Ball), each added to a base with no clues. Read off that
  shape, each is a modifier of a base nobody plays, and the code makes them
  exclude each other; the cut, by vocabulary both ways, makes them two
  games. The guard flags it, and the owner decides.
- **Rectangles' Patches**, filed after the cut ran, is computed when
  Rectangles' rules are stated; until then its word is declared unchecked.

## Impact

Player-visible: Type menu sections for Solo, Net, Netslide and Twiddle;
title words and help lines where a variation changes word; Custom dialog
controls for Ascent, Salad and Group. Game IDs and saved params may change
where a field's encoding does, and that is allowed.

## Acceptance

Every declared variation built from its description; the guard seen to fail
on a planted wrong word; the app run on each game whose word changed.
