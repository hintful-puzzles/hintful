# add-loopy-notation

## Why

**A hint relies only on marks the player can make** (owner, 2026-09-15;
`AGENTS.md` § "Hint quality bar", rule 6). A hint exists to teach the player to
solve the next board alone, so every fact a step rests on must be one the player
can put on the board themselves.

`add-loopy-hint` broke that rule on Tricky and Hard boards. From Normal, Loopy's
solver reasons about **corners** (two edges meeting at a dot around one face,
known to carry at least one line or at most one) and **pairs** (two edges known
to match, or to be opposites). Loopy gives players no way to mark either, so the
hint drew them itself, as wedges and connectors numbered in the order found. The
owner withdrew that before it shipped: both commits are local (`7e873f01`,
`6c0650cb`).

Easy and Normal hints are unaffected: their premises are lines, ruled-out edges,
and counts at clues and dots, all on the board already.

## What changes

- **Players can mark corners.** Any corner of a face at a dot can be marked
  "at least one line here", "at most one line here", or both (exactly one), and
  cleared. Every tiling, with pointer, touch and keyboard.
- **Players can mark pairs.** Two edges sharing a face or a dot can be marked as
  matching or as opposites, and cleared. The neighbor restriction is read off the
  solver, not chosen: every relation `record.ts` records joins two edges sharing a
  face or a dot, and the one rule that relates distant edges (the edge dsf's
  propagation) fires on no board in `loopy-hint.test.ts`'s corpus.
- **The hint makes those marks as moves.** A Tricky or Hard fact becomes a step of
  its own, one sentence resting on marks already on the board, and the drawn,
  numbered chains are removed. A composed relation (A matches B, B matches C,
  where A and C share a face) is a step placing the pair A–C.
- **Check & save vouches for the notes.** A corner or pair mark that contradicts
  the solution is a mistake, and the hint refuses on it, so the plan may take the
  player's notes as facts, as Seismic does with its pencil marks.
- **The help teaches the marks**, and `loopy-hint`'s requirement is modified to
  describe steps that place notes rather than draw them.
- **`ts-engine` gains the rule as a Hint System requirement**, so it binds every
  game rather than living only in prose.

## Design questions to settle in `design.md`

- **Input.** How a corner is aimed at on an arbitrary tiling (a click inside a face
  near a dot is the obvious candidate, beside edge-nearest hit testing that already
  claims most of the face), how a pair is drawn (a drag from one edge to its
  neighbor), what touch and a held finger do, and how the keyboard cursor reaches
  both. `docs/games/input.md`'s touch and drag sections are the constraints.
- **Save compatibility.** New move kinds only add, so existing saves replay; say so
  and test it.
- **Plan length.** Every hidden fact becomes a step. Measure the Hard plans' length
  and the resume walk's cost before and after.
- **Whether a player is ever asked to mark a fact the next step does not use.** The
  recorder keeps facts that later firings never cite; the plan should place only
  the facts some line conclusion rests on.

## What this does not do

- It does not change which boards exist. The generator never builds a recorder.
- It does not add face shading (inside/outside). That notation expresses Hard's
  parity but not Tricky's corners, and the owner chose corner and pair marks.
