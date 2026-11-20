## 1. The layout

- [ ] 1.1 Re-measure the engine; propose the directories from its import
      graph and concerns, and the layering between them. Record the
      proposal here before moving anything.
- [ ] 1.2 Check what keys on engine paths (gate scoping, the commit hook's
      test selection, the probe, guides) so a move does not silently narrow
      what runs.

## 2. Move

- [ ] 2.1 Move one concern per commit with a codemod; verify by the diff's
      shape. Run `feedback-probe.mjs --verify` after each.
- [ ] 2.2 Retire the barrel.
- [ ] 2.3 Move the cross-game guards into their own directory.
- [ ] 2.4 Add the layering guard; plant a forbidden import and see it fail.

## 3. Finish

- [ ] 3.1 Rewrite `docs/engine-catalog.md`'s placement rule and trim what the
      layout now says. Commit, push, archive.
