# Proposal

## Why

The owner cannot recall a chain ordinal ever adding to a hint's explanation
(2026-10-26), and two of their screenshots show the cost:

- **Rome 4×4 Easy.** "The numbered arrows from the square to the right lead
  back to this square, so this square must point down." Two arrows carry a 1
  and a 2. The arrows already show the trail, and the 2 sits under the ring of
  the square it is meant to be beside.
- **Path 7×9 Normal, on a phone.** "A cross on this edge would force the
  numbered edges and leave the outlined square a dead end, so it must be a
  line." The forced edges are thin green lines with 1 to 5 scattered beside
  them, crowded against the clue discs. The owner calls it "an already
  extremely difficult hint".

The order a chain is numbered in is the order the search found its links, and
an arrow was refused because about a third of links do not force the next
(see `openspec/specs/engine-hints`, "A chain's order is declared and drawn as
an ordinal"). So the numbers do not give a sequence the player can follow link
by link. They are also the one mark a player cannot make on their own board,
against `docs/doctrine.md`'s rule that a hint relies only on marks the player
can make.

The owner also asked this change to look for **a better way to communicate
forcing**, especially for the Path example, rather than only deleting the
numbers.

## What Changes

- **Retire the chain ordinal from the engine.** That means `drawHintOrdinal`
  (`engine/hint-ordinal.ts`), the `order` a chain link declares
  (`OrderedCell`, `engine/overlay-sidecar.ts`), the ordinal in an edge
  hint's square, the pinned chain positions (`engine/testing/hint-chain-pins.ts`)
  and the guards that read them.
- **Every game that numbers a chain stops.** That covers the seven
  Latin-square games through the shared chain sentence (Solo, Keen, Towers,
  Unequal, Group, Mathrax, Salad), plus Clusters, Rome, Path and Map. Its
  sentence names the chain without numbers ("the outlined chain", "the
  outlined arrows"). Where a sentence cited a number to pick out a link ("Cell
  1 … cell 5"), the link becomes its own reference ("one end", "its other
  end"). Each reference already has its own pill, color and leader.
- **Map** stops hiding its own region numbers while a chain shows. Its chain
  journey, which "dots each numbered region", is re-worded without ordinals.
- **Forcing is taught only through marks the player can make** (owner,
  2026-10-26). A chain whose every link writes an ordinary mark becomes
  ordinary steps. A chain of suppositions is backtracking: it moves to
  Unreasonable, off the lower tiers in both the hint and the generator. No
  supposition marks are added, since saving and loading already serve that.
  Each chain kind is classified first (design D4, D5).
- Help pages and guides that describe a numbered chain are updated. No save,
  game-ID or preference format changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `engine-hints`: the ordinal requirements are removed, and the tie and
  edge-mark requirements stop naming an ordinal.
- `engine-candidate-hints`: a walk premise is computed and outlined, not
  numbered.
- `help-pages`: the shared marks explanation no longer lists what carries an
  ordinal.
- `rome`: a walk in a Rome hint is outlined, not numbered.
- `path`: a lookahead step stops numbering its forced edges.
- `map`, and any game whose chain rung moves to Unreasonable: deltas written
  once the classification settles them (tasks.md).

## Impact

- **Engine:** `hint-ordinal.ts`, `overlay-sidecar.ts`, `edge-hint.ts`,
  `latin-hint.ts`, `hint-text.ts` (`forcingChainPremise`), and the
  `hint-quality` and `hint-ordinal` guards.
- **Games:** the renderers and sentences of the eleven games above, and their
  hint snapshots.
- **Docs:** `docs/hints-marks.md`'s section on numbering a chain (removed),
  `docs/hints.md` § "Bind the words to the marks", `docs/testing.md`, and
  `docs/engine-catalog.md`.
