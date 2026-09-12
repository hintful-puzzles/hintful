# Retire the C-parity requirements

**Owner directive, 2026-09-13**: *"Please remove that requirement about the C
compatibility from anywhere it appears - it was just something we cared about
during the port, but it's not a concern anymore."*

## Why

During the port, many specs required the TypeScript code to reproduce upstream's
C output: descriptions byte-identical to the C build, solver verdicts identical
to the C solver, upstream's random-draw and emission order, rendering "to full
parity with the C build", and a game's byte-match differential staying green as
its acceptance criterion. The owner released byte-parity as a constraint on
2026-08-01, which made divergence permitted; the requirements stayed, so a spec still
*obliged* what the project no longer wants, and `AGENTS.md` still advised
keeping upstream's behavior reachable as a test oracle.

## What Changes

- Spec deltas remove every obligation to match upstream's C output, restating the
  behavior that survives (technique ladders, generation invariants, what is
  drawn). A requirement that was wholly parity is removed; one whose heading
  asserted parity is removed and re-added under a heading about what it does.
- `AGENTS.md` and the `docs/games/` guides stop advising that parity be preserved.

## What stays, and why it is not C compatibility

- **This app's own game IDs and saves.** A seeded game ID a player shared depends
  on the random module's output staying the same across *our* builds, and a
  description depends on its codec. Those are stated as stability of this app,
  no longer as agreement with `random.c`.
- **Upstream credited as the origin** of a rule, an encoding or a technique.
- **The upstream MIT notices**, byte-identical as a license obligation.
- **The frozen differential tests.** They stay as a refactoring net — a change to
  a solver's verdict changes which boards exist, and they notice. What changes is
  their standing: a deliberate divergence retires or re-founds a fixture, and no
  requirement asks that a divergence keep upstream's path reachable for them.

## Impact

- `openspec/specs/*` via deltas; `AGENTS.md`; `docs/games/`.
- No code, no test, no board, no player data.
