## 1. One list of cheap checks

- [x] 1.1 Read `scripts/gate.sh`'s fast prefix and list which steps cost
      seconds and read no test; time each on this machine under load.
      (`npm run fast-checks` prints each step's seconds: the whole prefix
      and the source-scan pass took 36 s under load on 2026-11-19, the
      dearest the scan pass at 9 s.)
- [x] 1.2 Move that list to one place the gate and the new command both run;
      the gate keeps its fail-fast order and output. (Decided: the list
      stays in `scripts/gate.sh`, which `build-pipeline` already names as
      its one place; each step runs through `step`, and GATE_KEEP_GOING
      makes it keep going. A refusal now ends with one line naming the
      command, which is how a session learns it exists.)
- [x] 1.3 See the refactor change nothing: plant one failure of each kind and
      confirm the gate refuses it exactly as before.

## 2. The keep-going command

- [x] 2.1 Add the command (an npm script): runs every check on the list,
      continues past a failure, ends with every refusal and its reproducer.
- [x] 2.2 Apply the mechanical fixes (biome `--write`, `spec-subjects --fix`)
      to files `git status` shows, and print what changed.
- [x] 2.3 Plant four failures of different checks at once and see all four
      reported in one run. (Five plants: biome formatting was fixed and
      named; spelling, engine-catalog, unused-exports, absence-spelling,
      openspec validate and spec-form refused in one run.)

## 3. Wire it in

- [x] 3.1 `npm run game <id>` runs the command scoped to the working tree's
      changes instead of biome over `src/games/<id>`.
- [x] 3.2 After an archive, the command reports merged requirements over the
      limit and reorders subjects; try it on a scratch archive. (spec-form
      now names a long requirement by file, line and title. No npm wrapper
      for `openspec archive`: agents archive through the skill, and the
      docs send them to `npm run fast-checks` after it.)
- [x] 3.3 Update `docs/testing.md` § "A game's verdict in one command",
      `docs/work-management.md` § "Before archiving", and the build-pipeline
      spec delta.
