## 1. One list of cheap checks

- [ ] 1.1 Read `scripts/gate.sh`'s fast prefix and list which steps cost
      seconds and read no test; time each on this machine under load.
- [ ] 1.2 Move that list to one place the gate and the new command both run;
      the gate keeps its fail-fast order and output.
- [ ] 1.3 See the refactor change nothing: plant one failure of each kind and
      confirm the gate refuses it exactly as before.

## 2. The keep-going command

- [ ] 2.1 Add the command (an npm script): runs every check on the list,
      continues past a failure, ends with every refusal and its reproducer.
- [ ] 2.2 Apply the mechanical fixes (biome `--write`, `spec-subjects --fix`)
      to files `git status` shows, and print what changed.
- [ ] 2.3 Plant four failures of different checks at once and see all four
      reported in one run.

## 3. Wire it in

- [ ] 3.1 `npm run game <id>` runs the command scoped to the working tree's
      changes instead of biome over `src/games/<id>`.
- [ ] 3.2 After an archive, the command reports merged requirements over the
      limit and reorders subjects; try it on a scratch archive.
- [ ] 3.3 Update `docs/testing.md` § "A game's verdict in one command",
      `docs/work-management.md` § "Before archiving", and the build-pipeline
      spec delta.
