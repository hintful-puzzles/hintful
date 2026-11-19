# add-word-dictionary

**Status: asked for by the owner (2026-11-19)**, who decided its two open
questions: Wordguess's answer row goes, save compatibility being no concern
for a game a few hours live; and opening a reference counts as help in every
game that has one, Dominosa included, by one engine mechanism.

## Why

Wordtrail's hint reasons from the words that still fit through a letter, a
set the player cannot see: past two words its sentence names none ("Every
word that still fits through the outlined letter agrees on this edge"), and
the owner found it confusing. Wordguess's answer row of a-to-z marks mostly
repeats what the scores' colors already show. What a word game does want is
a dictionary to consult, as Dominosa's domino list is consulted: kept on a
panel of its own, so a player who wants none of it never sees it, and
counted as help.

## What Changes

- **The reference aid is generalized for any inventory.** A `ReferenceModel`
  carries its own title, a line of instructions, and sections each with an
  optional heading, and an item may be ruled out as well as outstanding,
  placed or in conflict. Dominosa's panel reads as before.
- **Opening a reference counts as help.** The engine marks the board helped
  when it hands the panel the reference, in every game: Dominosa's time now
  reads "with help" once its panel has been open.
- **A hint step may name reference items**, which an open panel marks in the
  hint's color, so the words a step reasons from can be found in the list.
- **Wordtrail gets a dictionary**: each listed length's words that some trail
  on the board spells, marked drawn, still fitting or ruled out by the
  player's lines and crosses. Tapping a word spotlights the letters of its
  trails that still fit.
- **Wordtrail's hint names its words** wherever the sentence has room, and
  otherwise counts them; either way it marks them in the dictionary.
- **Wordguess gets a dictionary**: the common words that fit every score, or
  every word of the list once no common word does. Tapping a word writes it
  into the working row.
- **BREAKING (Wordguess): the answer row, Marks mode and the hint's ruling
  out go.** The hint is the counted guess alone. A save holding answer-row
  marks no longer loads (owner, 2026-11-19: no concern), and Check & save
  has no marks to check in Wordguess.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `ts-engine`: the reference-aid contract (title, sections, ruled-out
  status, a step's reference items) and fetching it counting as help.
- `app-shell`: the panel renders sections, the model's title and
  instructions, ruled-out and hinted items.
- `wordtrail`: the dictionary, and the hint's wording past two words.
- `wordguess`: the dictionary; the answer row, Marks mode and the hint's
  deduction half removed.

## Impact

- Engine: `src/engine/types.ts` (`ReferenceModel`, `ReferenceItem`),
  `src/engine/game.ts` (`HintStep`), `src/engine/midend.ts`,
  `src/engine/described-edge-hint.ts`, the worker surface.
- App: `src/components/reference-panel.ts`,
  `src/puzzle/components/game-controls.ts`.
- Games: Dominosa's `reference()`; Wordtrail's index, solver, hint, render
  and description; most of Wordguess.
- Docs: `docs/mechanics.md` § "The reference aid", the two games' help.
