# derive-the-draft-label

**Status: implemented, awaiting owner acceptance of the label (tasks 5.3).**
Phase 3 of `envision-the-game-contract`. The classification and the decisions
are `design.md`.

## Why

The owner's direction (2026-09-28) is that a game lacking part of the contract
is a **draft**, labeled so in the catalog and still playable. Draft has to be
computed, never set by a game about itself.

Today an absent `Game` member is ambiguous. It can mean "not done yet", or "this
puzzle has no such thing". Sliding puzzles have no mistake notion, the Latin
games cannot be transposed, and upstream had no solver for Cube, Pegs, Same Game
or Sokoban. So draft computed from absence alone would convict games for their
nature. The reasons exist, but they live in test files, as ledgers such as
`NOT_TURNED`, `KEYPAD_WITHOUT_PENCIL`, `NO_FLAG` and `OPENS_ITS_OWN_REFUSAL`,
which a new game never reads.

## Decided (owner, 2026-09-29)

`notApplicable(reason)` is a first-class section state, and the help shows the
reason. A hint is never not-applicable.

## What changes

1. **`notApplicable(reason)`.** A typed value a `Game` member may hold in place
   of an implementation. It is consumed by the draft computation, by the help
   page, and by the cross-game guards in place of their ledgers.
2. **The section list.** Which members are required, which may be
   `notApplicable`, and which are genuinely optional affordances such as `hover`
   and `reference`.
3. **The draft label.** Computed from the section states and shown in the
   catalog. Delete `catalog-data.ts`'s comment "No `unfinished` flag".
4. **Move each "because" ledger onto its games**, and have its guard read it
   there.
5. **Amend the live specs that give the old rule as the reason:**
   - `build-pipeline`, "Import-graph selection alone is unsound here" ("never a
     manifest");
   - `ts-engine`, "The capability snapshot records the draw state its
     constructor builds" ("an approved vocabulary would be a manifest");
   - `ts-engine`, "A shared mechanic is joined by having it, not by declaring
     it".

   Grep `openspec/specs` for "manifest" again rather than trusting this list.
   Check every `REMOVED` and `MODIFIED` heading with `rg -F -x` before
   archiving.

## Hints to pull in (2026-09-29)

None. A hint is never `notApplicable`, so every hintless game is a draft by
this change's own rule, and they are its test population as they stand: the
label should appear on each of them and on no hinted game. Pulling one in
would only shrink that population (`hintless-games-in-reserve`).

## Tasks, in order

- **Task 0.** For every optional member, classify each absent game as `draft`
  or `notApplicable`, with the reason. **Falsifier:** if a member's absences
  cannot be told apart without reading intent that no reason states, that
  member stays optional and outside the draft computation.
- **Player-visible.** The label's wording and placement on the home screen is
  the owner's to accept in the browser.
