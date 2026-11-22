## Context

The pilots built `engine/fill/` game by game. Kakurasu and Tents came first
(`a-game-from-its-description-alone`), then Unruly, Mosaic and Norinori
(`born-unruly-norinori-and-mosaic`). The engine now has:
- clue lists and a dealt partition;
- the `dots`, `digits` and `walls` ID segments;
- the click cycle, dealt cells and modifiers;
- `build`, `scatter`, `dominoes` and `grow` deals, with `hide`;
- a search tier;
- numbers on cells, region walls and fills, and the `domino` painter.

The second pilot's figures and the owner's judgment are in its archive
(`design.md` § "The figures (3.1)").

This change moves the rest of the plain-cell family. Each game's
description already holds its rules, clues, techniques and hint words,
since every game's ladder is described. What a flip adds is the part a born
game declares: `catalog:`, `play:`, `deal:` and `id:`, plus whatever the
engine lacks to draw and deal the game.

## Goals / Non-Goals

**Goals:**
- The eleven games of the proposal born from their descriptions, each its
  own commit, the hand-written game playing on until its flip.
- Each gap closed in the engine or the compiler, addressed to a concept and
  never to a game.
- Upstream game IDs keep loading.

**Non-Goals:**
- Map, the candidate family, and edge or link answers.
- A new figures pass as a gate. The owner judged the pilot a success; each
  flip still records its lines and capabilities, and a deal or walk
  regression a player could feel is fixed in its flip.

## Decisions

### 1. The gap list first, then the order

Task 1.1 reads each game's description, `index.ts`, ID grammar and render
against what `fillGame` declares, and writes the gap list here. The order
then puts the games that need least first, so each later game finds more
of its needs built. Likely early: Star Battle (Norinori's partition and
walls) and Singles, Range and Light Up (numbers on cells, as Mosaic's).
Likely late: Magnets (a partition of two-cell tiles, three values) and
Undead (monsters seen through mirrors).

### 2. A game keeps how it plays

As in the pilots, a born game plays as the hand-written one does, except
where making it consistent with the other born games is better. That
consistency was pre-approved on 2026-11-21. Each such difference is listed
in its flip's task.

### 3. IDs keep loading; saves are the owner's call

A change that would refuse a desc upstream's generator writes is a
compatibility break, so every game's `id:` must read upstream's grammar.
Saves of the hand-written games hold their own moves, which a born game
does not read. The pilots broke them with the owner's approval. Task 1.2
asks once for the whole family, with the cost.

## Risks / Trade-offs

- **Some games may not fit the shape.** A clue on a line drawn outside the
  grid (Pattern's runs), monsters seen along paths (Undead) and tiles
  (Magnets) may each need a capability bigger than any so far. The doctrine
  says to question the convention first. Where a game truly cannot fit,
  its task records why and the game stays hand-written, rather than
  bending its logic.
- **Size.** Eleven games is one change by family, as the owner asked. A
  session that ends part-way records the open flips in tasks.md, and the
  next session continues them.

## Open Questions

- Do the eleven games' saves break (task 1.2)? Asked when the gap list is
  written, so the cost can be stated per game.
