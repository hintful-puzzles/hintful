## Decisions

**Index against working tree: refuse, do not stash.** Testing the index
exactly would mean `git stash --keep-index` around the gate, which rewrites
the author's working tree and has lost work in other projects when a hook is
interrupted. A refusal costs nothing: before the prefix, compare each staged
path's index blob with its working-tree file; if any differ, stop and list
them, saying to stage or restore them. An untracked file the commit does not
name is not a difference. Weigh one exception: a partial stage made on
purpose (`git add -p`) is refused too, and the author can still commit it
with the difference set aside.

**Why `capability-surface` was missed: find out first.** Candidates, to be
told apart by running `node scripts/checks/select-tests.ts` against the
paths d62d12921 staged:

- the snapshot test reads games through a channel `reach.ts` does not walk,
  so no plan selects it for a game path;
- it is selected `narrow`, but its cases are not titled per game, so a
  narrowed run executes none of them;
- it was selected and the agent's own scoped run, not the hook, is what
  missed it (then the hook was right and only the doc needs a line).

The fix follows the cause. Whatever it is, see the hook refuse a planted
`Game` capability removal in a game-only commit before trusting it.

**The two engine guards.** `move-judge-games` and `wrong-entry-check`
refused Wordguess only on an engine commit. If `derive-guard-ledgers` lands
first, their tables may be gone; check again then.

## Risks

- Running more per-game work on a game commit lengthens it. Measure the
  commit's time before and after on a game-only commit, under load.
