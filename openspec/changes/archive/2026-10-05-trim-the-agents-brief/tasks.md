## 1. Confirm the ground

- [x] 1.1 Repeat the loading probe on the session's ordinary model: a
      path-scoped rules file and a nested `AGENTS.md`, each with a marker
      word, one read under each. Verify: the result is written into
      design.md § Context.
- [x] 1.2 Run `/doctor prompt-audit` on `AGENTS.md` and keep its proposed
      cuts as input to 2.1. Verify: the list is saved in this change.
      Saved as `prompt-audit.md`, from a headless run. Its five stale
      statements are the "stale" rows of `sort.md`.
- [x] 1.3 Record the baseline: lines, words and bytes of `AGENTS.md`, the
      list of owner directives in it, and the list of section names cited
      from other files with their counts. In `baseline.md` and
      `directives.md`.

## 2. Sort

- [x] 2.1 Classify every paragraph of `AGENTS.md` in a table in this change
      (`sort.md`). The verification was done by a fresh-context subagent, not
      by a sentence-by-sentence read of every row: it compared 22 "there"
      rows and the "tree" and "hist" rows against their named sources, and
      its findings are folded into the guides (see 3.1).
- [x] 2.2 The owner declined to read it (2026-10-05): *"I'm not an agent, and
      thus not the intended target audience. Instead, please have a
      subagent(s) with fresh context read it … once you're happy, I'm happy.
      This doesn't need to be perfect, just better than it was."* Two
      subagents read it: one cold-read the draft as its only brief, one
      audited `sort.md` for lost rules. The seven cuts in `directives.md`
      stand, unconfirmed by the owner.

## 3. Move

- [x] 3.1 New guides `docs/method.md`, `docs/doctrine.md`,
      `docs/work-management.md`, `docs/help-pages.md`; additions to
      `docs/games/testing.md`, `hints.md`, `input.md`, `mechanics.md` and
      `README.md`; the header of `src/project-identity.ts`; the new
      `AGENTS.md`, 175 lines. The draft that became it is not kept beside
      it. The normative sweep of D8 is the second subagent's audit, not a
      word-by-word sweep.
- [x] 3.2 `directives.md` is the walk. There is no `cuts.md`; the cut list is
      a section of `directives.md`.
- [x] 3.3 Repointed: 64 citations by a script keyed on the section name, 39
      by exact replacement. The diff in `src/` is comment lines naming a
      guide, plus the `project-identity.ts` header. Left as they are: the
      open changes' unsectioned mentions, and one scenario in `repo-layout`
      ("Player-visible work still waits") that names "Acceptance bar".
- [x] 3.4 `openspec/config.yaml` names `AGENTS.md`, the three repo-wide guides
      and the map. Not verified with `openspec instructions`.
- [x] 3.5 `docs/games/README.md` lists the four guides. The engine catalog
      lists engine modules, not guides, and is unchanged.

## 4. Hold

- [x] 4.1 `REMOVED` plus `ADDED`, carrying its five scenarios (not four). The
      heading matches the live spec as a whole line.
- [x] 4.2 `scripts/checks/brief-size.mjs`, in the fast prefix. Seen red on the
      899-line file and with `CLAUDE.md` moved away, then green.
- [x] 4.3 Three fresh headless sessions, one run each. The openspec task read
      `docs/work-management.md` before writing. The test task (add a
      generation test to Flip) read only Flip's own files. The hint task
      timed out and left no transcript. The sessions were not read-only as
      intended and edited the tree; their edits were reverted.
- [ ] 4.4 Not done, deliberately. One run of one small task is thin evidence
      for adding a Claude-only file, and the owner asked for as little of that
      as possible. The scenario "a session reads the guide before it edits"
      is dropped from the delta, since the probe does not support it.

## 5. Close

- [x] 5.1 Step 1b-iii-a of `scripts/gate.sh`.
- [x] 5.2 Deltas re-read against the tree.
- [x] 5.3 Archived on the owner's word quoted at 2.2.
