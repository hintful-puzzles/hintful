## Next

Archived. For the debrief of `describe-the-whole-catalog` § "0. The
refactor first": 4.1 below.

## 1. What a session reads first

- [x] 1.1 `docs/work-management.md` § "A change's tasks open with what is
      next"; every open change's tasks.md condensed to it.
- [x] 1.2 `scripts/checks/tasks-next.mjs` in the gate, seen to fail on
      every open change before the condensing.

## 2. Tools

- [x] 2.1 `compare-cost --base` and `--quick` (c651a22d4).
- [x] 2.2 `npm run flip -- <game>` (c651a22d4).
- [x] 2.3 `npm run play-smoke -- <game>` (c651a22d4).
- [x] 2.4 `npm run replace`, its refusals naming where an `old` diverges.
- [x] 2.5 `input-answers`' two lists of games, edited by flips, are floors
      over the whole sweep; spelling fails a dead allowance (18 removed).

## 3. Measure

- [x] 3.1 An Edit takes 0.17 s at the median (26,441 since 2026-11-01);
      the 2.9 s counted the model writing the message's later calls.

## 4. Close

- [x] 4.1 For the owner's debrief, configured outside this repository:

  **The mutation guard** (`~/.claude/hooks/block-file-mutation.py`), its
  1,782 refusals in this repository counted from its log on 2026-11-24:
  - its refusal names `<cwd>/scratchpad`, which this repository does not
    have and would put inside the tree; the session's own scratchpad is
    `/private/tmp/claude-<uid>/<cwd, slashes as dashes>/<session_id>/scratchpad`,
    both parts in the hook's payload;
  - for this repository, the refusal of a multi-site edit could name
    `npm run replace` (literal, refuses a match that is not unique);
  - `perl -0pi` passes: the flag pattern `-[a-zA-Z]*i` stops at the digit;
    `-[a-zA-Z0-9]*i` covers it;
  - a search's pattern is scanned as a command: `git grep 'sed -i'` and
    `rg 'git apply'` are refused (22 of the refusals were searches).

  **The handoff cap** (`continue-session`, `maxChain` 20 in
  `pluginConfigs`): at the cap the hook denies the handoff with a toast,
  and the machine stood idle 25 minutes once (0085d1e6). Recommended: a
  push notification at the cap, and a cap sized to the run the owner
  starts (the refactor's seven changes took more than one session each).
- [x] 4.2 Archive, and take the next change from
      `describe-the-whole-catalog` § "0. The refactor first".
