# measure-the-search-planners-sweeps

**Status: scaffolded, not started (2026-10-04).** A follow-up from
`move-the-hint-scans-onto-the-harness`.

## Why

That change moved every position scan onto pins and saved 64 s of summed
test time on the hint-touching files, 57.7 s of it in one file. What is left
is not scans. Measured 2026-10-04 on those 110 files, load average 6 to 9
and about 21 GB into swap, so upper bounds whose ratio is the usable part:
180 s in all, of which six files are about 90 s.

| file | test time |
| --- | --- |
| `untangle/untangle-hint.test.ts` | 23 s |
| `spokes/spokes-hint.test.ts` | 17 s |
| `netslide/netslide-hint.test.ts` | 15 s |
| `solo/solo-hint.test.ts` | 14 s |
| `sixteen/sixteen.test.ts` | 11 s |
| `netslide/netslide-reconstruct.test.ts` | 10 s |

Each is a property sweep on a game whose hint plans by searching or whose
boards are costly to deal: "solves every board it is followed on", "finishes
any board on any preset". One Untangle test was about 19 s by itself.

These are not porting-era tests and they are not vacuous, so nothing here is
proposed for deletion. The question is the one `AGENTS.md` § "Test
discipline" asks of any test: what would this catch in a refactor that no
cheaper test would, and is the configuration it walks the cheapest that
catches it.

## What Changes

Nothing until measured. For each sweep: what it asserts, what a planted
defect in the planner does to it and to the cheaper tests beside it
(`docs/test-strength.md` § 2), and whether `hint-resume.test.ts` already
walks the same boards. Then one of: leave it and say why at the site, walk
fewer or smaller boards with the remaining coverage stated, or move the
widest configuration to the slow tier with its targeted invocation.

Time it on an idle machine and record free memory and swap beside the load
(`AGENTS.md` § "Test discipline"): the figures above were taken under
paging.

## Hints to pull in

None.

## What would show it worked

Each of the six files has a sentence at its costliest test saying what it
alone catches, and the summed time is lower by a measured amount or is
unchanged with the reason recorded.
