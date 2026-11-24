## Why

The 2026-11-24 review of the migration sessions (see
`the-commit-catches-what-ci-would`'s proposal) found each session rebuilding
the same procedures by hand, and losing its context to reading:

- **About half the implementation sessions compacted mid-task**, and every
  session that flipped a game. Each began by reading its whole change:
  `born-candidate-note-family`'s tasks.md reached 41 KB and its design.md
  30 KB, most of it finished steps. The 20-handoff cap left the machine idle
  25 minutes once (0085d1e6).
- **A baseline was built by hand at least five times**: `git worktree add`,
  a linked `node_modules`, scratch tests copied into both trees.
  `compare-cost` takes the baseline as a directory and about ten minutes a
  game, so it was cut short (6f044cc0 shipped a 3.1× Mosaic deal
  regression) or run at a family's end (Adjacent's 420 ms against 110 ms,
  found after three more flips).
- **Each flip rediscovered its checklist**: lower `game-lines`' ceiling,
  find references to deleted files, re-record the snapshots, edit the
  hand-kept exemption lists, move tests to `cases.yaml`.
- **Each flip re-scripted its browser check**, hitting the same traps: the
  hint button's three labels, the disabled button at the finish, a sentence
  in shadow DOM, a 404 for `precache-size.json`.
- **116 shell commands refused by the mutation guard**, nearly all a
  multi-site replace written as a heredoc or `sed -i`, and the guard's
  message points at the repo's own `scratchpad/`.
- **An Edit took 2.9 s on average** over 5,950 edits (4.8 h), which may be
  a hook's or the LSP's latency, not the edit's.

## What Changes

- **A change's tasks.md opens with what is next**: a short header naming the
  next task and the open questions, finished steps condensed to a line and
  their reasoning in commits; a check bounds the header.
- **`compare-cost --base <commit>`** builds and removes its own baseline,
  and a quick mode (one board a menu entry, one round) for every flip, the
  full run kept for a family's figures.
- **`npm run flip -- <game>`** reports what a flip has left: the ceiling,
  references to the game's deleted modules (research files excluded), stale
  guide paths, snapshots to re-record, hand-kept lists that name the game.
- **`npm run play-smoke -- <game>`**: deal, input, notes, a hint walk to the
  solve, light and dark screenshots, through `playwright-cli`.
- **`npm run replace`**: a multi-file literal replace that refuses a
  non-unique match, for the edits agents now try as heredocs.
- **The Edit latency measured** and its cause fixed or recorded.
- **The hand-kept lists the flip edits are derived** where the doctrine
  says a list of games will rot (mistake-overlay shortfalls, input-answers
  exemptions, the guides' lists of born games).

## Capabilities

### Modified Capabilities

- `testing`: a flip's leftovers are reported by one command; a cost
  comparison builds its own baseline.

## Impact

`scripts/`, `package.json`, `docs/work-management.md`, `docs/testing.md`,
`docs/method.md`, the guards with hand-kept lists. The mutation guard and
the handoff cap are configured outside this repository (the owner's
`~/.claude`); a proposed change to them goes to the owner, not into the
tree. No player-visible change.
