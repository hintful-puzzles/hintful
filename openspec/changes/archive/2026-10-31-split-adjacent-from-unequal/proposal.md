# split-adjacent-from-unequal

**Status: filed on the owner's word (2026-10-31)**, in
`compute-the-cut-by-technique-transfer` (`report.md` § "The owner's decision
(2026-10-31)").

## Why

Unequal offers Adjacent as a ruleset. The cut computed them as two games:
neither keeps the other's techniques, by vocabulary both ways (C11), since
each has a clue the other lacks. Their descriptions are already two
(`unequal.description.yaml`, `adjacent.description.yaml`), and their ladders
are compiled apart. As a game of its own, Adjacent has a catalog tile and is
found by name.

## What Changes

- Adjacent becomes a game of its own, sharing Unequal's code where the two
  share it, with its own help page and catalog entry.
- Unequal loses its ruleset field.
- Compatibility does not bind (the owner, 2026-10-31): Adjacent's old links,
  saves and favorites need not open. A route alias from Unequal's Adjacent
  params is kept only if it costs little.

## Acceptance

Both games played in the app, from the catalog, with hints.
