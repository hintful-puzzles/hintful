## 1. Measure

- [ ] 1.1 Re-take the suite's CPU and the guards' share from the latest
      green Gate run's log, and each guard's cost per game. Record with the
      query and the run id.

## 2. Shard

- [ ] 2.1 A matrix of `vitest --shard=i/n` jobs in `gate.yml`; the fast
      checks, build and research guards run once. Keep one verdict a run
      (`ci-status.mjs` reads it).
- [ ] 2.2 The cost report sums the shards; the budgets say what they bound
      on a sharded run. Record the figures chosen and why, and update the
      spec if it states them.
- [ ] 2.3 See the budget fail on a planted dear file before trusting it.

## 3. The dearest guards

- [ ] 3.1 Profile each of the six; cut a board or round only where another
      already covers what it would catch. Plant the guard's defect again
      after each cut.

## 4. Finish

- [ ] 4.1 `docs/testing.md` § "What runs when" and `gate.yml`'s comment say
      how it runs now. Commit, push, watch one CI run to green, archive.
