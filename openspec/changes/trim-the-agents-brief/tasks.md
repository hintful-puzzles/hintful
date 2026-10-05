## 1. Confirm the ground

- [ ] 1.1 Repeat the loading probe on the session's ordinary model: a
      path-scoped rules file, a nested `AGENTS.md`, and a nested `CLAUDE.md`
      symlink, each with a marker word, one read under each. Verify: the
      result is written into design.md § Context, and D2 is revisited if the
      rules file does not load.
- [ ] 1.2 Run `/doctor prompt-audit` on `AGENTS.md` and keep its proposed
      cuts as input to 2.1. Verify: the list is saved in this change.
- [ ] 1.3 Record the baseline: lines, words and bytes of `AGENTS.md`, the
      number of owner quotations in it, and the list of section names cited
      from other files with their counts.

## 2. Sort

- [ ] 2.1 Classify every paragraph of `AGENTS.md` as root, a named scoped
      file, a named guide, or cut, in a table in this change. Verify: the
      table's paragraphs sum to the file, and the root column fits the bound
      before any file is edited.
- [ ] 2.2 The owner reads the root column. This is the acceptance step for
      what stays in every session; do not build on it unread.

## 3. Move

- [ ] 3.1 Write the scoped files and the guide additions, then the new
      `AGENTS.md` with its map. Verify by shape (design D7): every removed
      line is in a destination or in `cuts.md`, and the normative sweep of
      `cuts.md` has been read hit by hit.
- [ ] 3.2 Every owner quotation counted in 1.3 is found in a file that loads
      when it applies. Verify: the count matches, by search for the quoted
      words.
- [ ] 3.3 Check that an openspec skill run reads a file under `openspec/`
      before it writes a delta. If it does not, the delta hazards keep a line
      in the root file.
- [ ] 3.4 Repoint every citation of an `AGENTS.md` section, in `src/`,
      `scripts/`, `docs/`, `openspec/specs/` and the open changes. Verify:
      each old section name, searched as a string, appears only in the
      archive.
- [ ] 3.5 `openspec/config.yaml`'s `context:` block names what a planner must
      read. Verify: `openspec instructions proposal` for a scratch change
      shows it.

## 4. Hold

- [ ] 4.1 Write the `repo-layout` delta for "Agent-facing documentation is
      one AGENTS.md and no tool generates a second" as `REMOVED` plus `ADDED`
      under a new name, carrying its four scenarios. It waits until here
      because its text has to describe the layout 3.1 produced. Check the
      `REMOVED` heading against the live spec as a whole line.
- [ ] 4.2 The size check, in the gate's fast prefix. Verify: seen red with a
      line added past the bound and with a scoped file removed, then green.
- [ ] 4.3 `scripts/gate.sh`'s documentation-only pattern and
      `scripts/checks/change-citations.mjs`'s roots take in `.claude/rules/`.
      Verify: a commit touching only a scoped file takes the shortcut, and a
      dead change id planted in one fails.
- [ ] 4.4 The loading probes of design D8, one per scoped file and one for
      the root. Verify: every probe answers from the file it should.

## 5. Close

- [ ] 5.1 `AGENTS.md` § "Git" lists the new gate step, if that list is still
      in the root file, or the scoped file that took it does.
- [ ] 5.2 Re-read both deltas against the tree, commit, push.
- [ ] 5.3 Archive once the owner has accepted the root file.
