# keep-the-precommit-well-under-ten-minutes

**Status: scaffolded, not started (2026-10-07).** Filed on the owner's word,
the same day: the per-commit gate "used to be ~10 a few days ago", and it is
to be brought back "well under 10 mins if we can".

## Why

A gated commit costs the session that makes it its whole wall time, and no
source may be edited while it runs (the gate tests the working tree). Measured
on 2026-10-07, on this machine, three full runs of the same suite:

| Run | `vitest` wall | Summed test time | Beside it |
| --- | --- | --- | --- |
| 14:06 | 818 s | 1,573 s | little |
| 14:22 | 1,177 s | 1,849 s | a contact sheet, a browser, typechecks |
| 14:43 | 954 s | 1,826 s | a browser, reads |

- Locally the suite has two workers (`maxWorkers`, cores over
  `CONCURRENT_REPOS`), and wall time is close to summed test time over two. So
  ten minutes of wall is about 1,200 s of summed test time, and the suite holds
  about 1,570 s of it on the quietest run measured.
- `src/engine/hint-quality.test.ts` took 459 s of wall by itself in the 14:06
  run, more than a quarter of the suite. It was last touched that morning by
  `07ff51a3` ("the search planners' sweeps are measured"). That is a lead and
  not a finding: nobody has measured it before and after.
- CI shows the growth independently. Green runs took 14 to 16 minutes early on
  2026-10-06 and 22 to 25 minutes from that evening on
  (`gh run list --json conclusion,createdAt,updatedAt`).
- **The machine is not quiet and will not be** (owner, 2026-10-07): other
  sessions run beside the gate, and the figure to design for is the loaded
  one. A measurement here says what was running beside it.

No per-file ranking exists yet. Take one first (`vitest run --reporter=json`,
or the durations a verbose run prints), on the hook's own selection and on the
whole suite, before deciding anything.

## The direction the owner gave

- **A heavy test that is not extremely cost-effective leaves the per-commit
  gate.** It runs in CI, which is asynchronous, and ad hoc in a session that
  touches the code it guards. The mechanism exists for one assertion
  (`PRECOMMIT_HOOK_RUN` in `src/engine/testing/slow.ts`, under the four
  conditions in the `build-pipeline` spec); this change decides whether the
  same shape carries whole files and sweeps, and what a session touching
  related code is told to run.
- **The default per-commit gate is kept as small as it can be**, the aim being
  well under ten minutes on this machine as it is.
- **The bar is what a test catches that a cheaper one would not**
  (`docs/test-strength.md`). A sweep over many boards owes the count of what
  it has ever caught, and the cheapest pinned input that would catch the same.

## The second half: the engine, and its specification

The owner's suggestion, to take in the same session: use it to refactor the
engine, since breaking a large thing into smaller pieces tends to show what in
it is testable cheaply.

- `openspec/specs/ts-engine/spec.md` is one capability of several thousand
  lines and a couple of hundred requirements (`wc -l`; `grep -c '^###
  Requirement'`). Nobody reads it whole, and a requirement is found by
  searching for a word one already knows. Splitting it by subject (color,
  hints, input, the midend, the save format, params) is the first candidate.
- `src/engine/midend.ts` is the largest module in the engine (`wc -l
  src/engine/*.ts | sort -n`). What it would split into, and whether the parts
  have tests that need a whole midend today only because there is nothing
  smaller to hold, is to be found out and not assumed.

Whether the two halves are one change or two is the picking-up session's call
once it has the ranking: they share a session on the owner's suggestion, and a
change is one coherent unit of work.

## What Changes

To be designed from the per-file ranking.

## Acceptance

The owner's: the per-commit gate's wall time on this machine, measured as it
is found, with what was running beside it.
