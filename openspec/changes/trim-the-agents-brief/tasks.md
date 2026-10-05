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

- [ ] 2.1 Classify every paragraph of `AGENTS.md` in a table in this change,
      asking design D2's questions in order: deleted because the tree states
      it (naming the file or command that does), deleted as a third-party
      tool's behavior, deleted as history (naming the rule it supported and
      where that rule ends up), root, `README.md`, or a named guide. Verify:
      the table's paragraphs sum to the file, every named source exists and
      says what the paragraph said, and the root column fits the bound before
      any file is edited.
      The table is `sort.md` and the root column is written out as
      `root-draft.md`, 171 lines and 9,809 bytes. Two parts of the verify are
      not done, and `sort.md` § "Not yet done" says so: a "there" row rests
      on one search of the guide, and the normative sweep is 3.1's.
- [ ] 2.2 The owner reads the root column and the list of owner directives
      with each one's disposition. This is the acceptance step; do not build
      on it unread. What to read: `root-draft.md`, then `directives.md`,
      whose § "Cut, for the owner to confirm" has seven items.

## 3. Move

- [ ] 3.1 Write the guide additions and the new guides, move into a code
      comment any reason whose fact was deleted and which belongs beside the
      code, then write the new `AGENTS.md` with its map, its instruction to
      read the source for facts, and its one agent-specific section. Verify
      (design D8): every row of the 2.1 table marked kept has a sentence in
      its destination, and the normative sweep of every deleted paragraph has
      been read hit by hit.
- [ ] 3.2 Every owner directive listed in 1.3 is a rule in the root file or
      in the guide the map sends a session to, or is in `cuts.md` with the
      owner's agreement from 2.2. Verify: the list is walked, one line each.
- [ ] 3.3 Repoint every citation of an `AGENTS.md` section, in `src/`,
      `scripts/`, `docs/`, `openspec/specs/` and the open changes. Verify:
      each old section name, searched as a string, appears only in the
      archive.
- [ ] 3.4 `openspec/config.yaml`'s `context:` block names what a planner
      must read, which is no longer one file. Verify: `openspec instructions
      proposal` for a scratch change shows it.
- [ ] 3.5 `docs/games/engine-catalog.md` and `docs/games/README.md` list the
      new guides where they list the others.

## 4. Hold

- [ ] 4.1 Write the `repo-layout` delta for "Agent-facing documentation is
      one AGENTS.md and no tool generates a second" as `REMOVED` plus `ADDED`
      under a new name, carrying its four scenarios. It waits until here
      because its text has to describe the layout 3.1 produced. Check the
      `REMOVED` heading against the live spec as a whole line.
- [ ] 4.2 The size check, in the gate's fast prefix. Verify: seen red with a
      line added past the bound and with the `CLAUDE.md` link broken, then
      green.
- [ ] 4.3 The reading probes of design D6: fresh headless sessions asked for
      a small change in a game, in a test and in an openspec delta. Verify
      from each transcript whether the mapped guide was read before the first
      edit, and record the result in this change.
- [ ] 4.4 Only for a part of the tree that failed 4.3: one path-scoped file
      under `.claude/rules/` naming its guide, with no rule text. Verify: the
      probe passes with it, and the size check counts it.

## 5. Close

- [ ] 5.1 The new gate step carries its reason as a comment in
      `scripts/gate.sh`, as the other steps do.
- [ ] 5.2 Re-read both deltas against the tree, commit, push.
- [ ] 5.3 Archive once the owner has accepted the root file.
