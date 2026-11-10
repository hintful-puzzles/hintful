# name-compiled-code-per-function

**Status: filed on the owner's word (2026-11-09)**, for follow-ups that
help the whole catalog, from `recheck-only-what-a-binding-used`.

## Why

A bulk edit is verified by the shape of its diff (`docs/method.md`), and the
compiled modules are the largest bulk edit the engine makes. The compiler
numbers its fresh names (`Out.fresh`) once a module, so a name taken in one
function renumbers every function after it. `c2db4312` changed about twenty
lines of logic per game, but its compiled diff was 2,037 lines added and
2,036 removed. Filling's `isAnswer`, which the change does not touch, was
renumbered whole. A reviewer cannot see in such a diff which functions
changed, and neither can an agent checking its own work.

## What Changes

- **Fresh names are numbered per function**, from a counter each emitted
  function starts afresh, so a function's text moves only when its own
  code does. A name that is the module's own (a kept term's `edgeHolds`
  function) keeps a counter of the module's. Where a name must not collide
  across functions in one module, the session finds out why and says so.
- **The labels that `rechecked` writes** (`R1:`) already follow a binder's
  depth for the same reason; the session checks that nothing else numbers
  across functions.

## Acceptance

- Recompiling every description with no change to the compiler after this
  one leaves the modules byte-identical; a change to one technique's code
  changes that function's text alone, shown on a planted edit.
- Every described game's boards and verdicts are unchanged
  (`scripts/checks/deal-compare.test.ts`, against the commit before).
