# add-loopy-notation — design

The owner chose a notes-mode toggle over direct hit zones and over face shading
(2026-09-15). Everything below serves one rule: every fact a Loopy hint step rests
on is something the player can see or mark (`AGENTS.md` § "Hint quality bar",
rule 6).

## D1. What the notation says

Two kinds of note, and nothing else, because they are the two kinds of fact the
solver derives beyond lines:

- **A corner** is a dline: two edges adjacent around a dot, which is also one angle
  of a face, or of the outside of the board. It carries *at least one line*, *at
  most one line*, or both (*exactly one*).
- **A pair** is any two distinct edges. It says the two *match* (both lines or
  neither) or are *opposites* (exactly one is a line). Every relation `record.ts`
  records joins two edges sharing a face or a dot, but a parity step can rest on a
  chain of up to 13 of them, and the chain's middle links join edges that are not
  neighbors. The owner chose (2026-09-15) to let a pair link any two edges, so a
  chain is built one link at a time: A–B and B–C are on the board, and the next
  step marks A–C in one sentence.

## D2. State and moves

- `corners: Uint8Array`, one entry per dline (`2 × numEdges`), indexed exactly as
  `dlines.ts` indexes the solver's dline bits and using the same two bits
  (1 at least one, 2 at most one). The hint seeds the solver straight from it.
  The name is deliberately not `pencil`: these are not candidate sets, and `marks`
  is a retired spelling for a typed array (`note-vocabulary.test.ts`).
- `pairs: readonly LoopyPair[]`, `{ a, b, opposite }` with `a < b`, kept sorted, so
  two states with the same notes compare equal.
- Moves are **absolute sets**, like `set`: `{ kind: "corner", dline, bits }` and
  `{ kind: "pair", a, b, relation: "none" | "match" | "opposite" }`. Re-applying
  one is idempotent, which the hint's keep-track relies on.
- **Saves:** the move union only grows, and a save replays its log, so every
  existing save loads unchanged. `loopy-notes.test.ts` loads a log of lines alone,
  the only move kinds a save written before notes can hold, and round-trips one
  with notes.
- **Undo:** notes are ordinary moves, so undo covers them.

## D3. The mode

- **`ui.pencilMode`**, the collection's word for a note-taking mode. It is Ui
  state, not saved, and off on a new game.
- **Toggled by the collection's Marks key**, `pencilModeKey` from `key-labels.ts`,
  last on the keypad — and by the app's bare `P`, which sends the same
  `PENCIL_MODE_BUTTON`. Loopy's right button and a held finger already rule an edge
  out, so the pencil games' "secondary button toggles the mode" is not available
  here; rather than give Loopy a key of its own, the key is now every pencil game's
  (owner, 2026-09-15: *"I'm not ok with this game being unique… use the exact same
  notes UX as all the other games use, and extend/standardize it as needed"*). The
  eleven cell games keep their right-click and their Enter toggle, both of which
  now run through `toggleNoteTakingMode`, and gain the key and the letter.
- **An indicator** whenever the mode is on: the shared pencil glyph
  (`drawPencilGlyph`), at `pencilIndicatorBox` — the canvas's top-right, which is
  the engine's answer for every game rather than Loopy's own (owner, 2026-09-16:
  *"I want the pencil icon to be managed by the engine and appear in the same
  place"*). Loopy's gutter is widened to hold it, which the notes needed anyway:
  a corner note on a rim dot reaches nearly half an edge, and the gutter that
  fitted the keyboard cursor clipped every one of them. Loopy repaints every frame,
  so it draws the glyph outright rather than through `repaintPencilIndicator`,
  whose cache would skip the glyph the background has just painted over.
- **Every other pencil game moved with it**, since "the same place" is a claim
  about the collection and not about Loopy: five already had that corner, four
  grow a right margin of `pencilIndicatorReach` — the glyph plus the gap at each
  edge, which is the figure a game reserves, because one reserving the glyph
  alone is short by an inset at both — Towers gives up the tile-cache bit it used
  while the position was still its own to choose, and Group gains the indicator
  it never had. What the guard judges is where the pixels land, not which helper
  was called: a game that computed the same corner by hand would pass, which is
  right, because the requirement is about the player's eye.

## D4. Pointer and touch, in notes mode

With the mode off, input is exactly today's.

- **A tap cycles a corner.** The tap resolves to the nearest dot and to the angle
  around that dot it falls in, which is one dline. Which of the two angles between
  a dline's edges is meant is read off the face the dline belongs to (or no face,
  for the outside), because a dot's edge order runs clockwise on screen on most
  tilings and anticlockwise on floret and both Penrose tilings, and hats and
  spectres have corners wider than a half turn (`findings.md`). Left cycles
  none → at least one → at most one → exactly one → none; right, or a held finger,
  cycles the other way; middle clears.
- **A drag cycles a pair.** Pressing near an edge and releasing near a different
  edge cycles that pair: none → match → opposite → none, the other way for the
  right button. A release off the board does nothing, which is also what a canceled
  press comes to. A press counts as a drag once it moves half a tile from where it
  went down, and stays one if it comes back; below that, the release is a tap. While
  dragging, a connector follows the pointer from the first edge.
- The drag continues off the button class, so a finger that paused before dragging
  (and so arrived as the right button) still cycles a pair (`input.md` § "A touch
  hold arrives as the right button"). The press is claimed at once, since only the
  release can tell a tap from a drag (`input.md` § "A button with two meanings
  resolves on the release").

## D5. Keyboard, in notes mode

The cursor is unchanged: a dot and a chosen edge, walked and aimed as today.

- **Enter cycles the corner that follows the chosen edge in the dot's edge order**,
  and Backspace clears it. Every corner follows exactly one of its edges at its dot,
  and aiming reaches every edge at a dot, so every corner is reachable. The corner
  Enter would act on is outlined in the cursor color while the mode is on, which is
  what makes the order's direction irrelevant to the player.
- **Space pins the chosen edge, and Space on a second edge cycles the pair** between
  them, then clears the pin; Space on the pinned edge lets go of it. Walking and
  aiming reach every edge, so every pair is reachable. Escape clears a pin before it
  hides the cursor. The pinned edge has a pencil-colored halo.
- `loopy-notes.test.ts` asserts every dline of every tiling is the one Enter notes
  from one of its edges. Pairs need no sweep of their own, since a pair is two edges
  and every edge is already proven reachable.

## D6. Rendering

- A player's corner is a band across its angle, clear of the dot and short of the
  edges' midpoints, in the pencil color (`pencilColor`): filled for at least one
  line, outlined for at most one, both for exactly one.
- A player's pair is a connector between the two edges' midpoints, marked `=` or
  `≠`, in the pencil color.
- A hint step placing a note draws that note's shape in the hint's action color
  (`docs/games/hints.md` § "Echo the move's shape in the hint color"); the notes it
  reasons from are the player's own, redrawn in the evidence color.

## D7. Mistakes

A corner or pair note that contradicts the unique solution is a mistake: *at least
one* where the solution has neither edge, *at most one* where it has both, a match
where the solution differs, an opposite where it agrees. So the hint may read the
player's notes as facts, as it reads lines. A mistaken note is drawn in the mistake
color.

## D8. The hint

- The solver is seeded from the player's lines **and notes**: a corner note sets its
  dline bits and a pair note merges its relation, each recorded as a fact whose
  premise is "on the board" (`seedNotes`).
- Every fact in some line firing's closure that the board does not already show
  becomes **a step placing that note**, narrated by the fact's own premise (one clue
  count, one dot, one corner across the dot, one pair). It is placed **at the plan
  position where the fact was found**, not just before the line that uses it: a
  fact's sentence counts lines, and lines drawn in between would make the count on
  screen disagree with the sentence. The recorder stamps each fact with that
  position (`tickOf`). The line step then cites the notes.
- A corner its dot's own line decides is placed as a note too, rather than cited by
  the dot in words, so every line step cites a corner the same way. Its two bits
  come from one premise, so one step places both.
- Facts no line firing rests on are never placed, so a player is never asked to mark
  something no later step uses.
- A pair derived by chaining pairs is placed one link at a time: from A–B and B–C
  on the board, a step marks A–C, citing exactly those two and the edge they share.
  No step cites more than two pairs.
- Keep-track: a note step completes once the note holds what it places, and tracks a
  tap on the same note, since a tap cycles through the other states on the way.
- The drawn, numbered chains and their ledger entry are removed.

## Measured

The first measurement (today's recorder, one plan per board, notes placed just
before their use) found Tricky and Hard plans grow by roughly a quarter to two
fifths, with at most 25 notes before one line and pair chains of up to 13. The
shipped planner's numbers, three seeds per configuration, are in `findings.md`:
the count of notes is unchanged, and runs before one line reach 35 on the
triangular grid because notes now arrive where they were found.

**The fallback, if the notation proves unmanageable in play** (owner, 2026-09-15):
the tier that needs it becomes `Unreasonable`, and its hint refuses rather than
teaching what the player cannot record. On today's numbers that would be Hard, whose
pair chains are the notation's heaviest use; Tricky needs corners only.
