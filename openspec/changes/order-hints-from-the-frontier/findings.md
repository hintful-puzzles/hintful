# order-hints-from-the-frontier — findings

Section 1's measurements. Taken 2026-09-16 on Loopy plans built by
`deduceLoopyPlan`, over a fixed corpus: three 10×10 Hard squares boards (the
owner's configuration), two 7×7 Tricky and one 7×7 Normal, seeded
`frontier-<name>-<seed>` so the boards reproduce.

## Method

**Read-sets are exact, not a proxy.** `LoopyReason` is a discriminated union whose
eleven local kinds name the board elements the firing read (`face`, `dot`, `edge`,
`from`, `pair`, `witness.edges`); a face or dot yields its edges through
`GridFace.edges` / `GridDot.edges`, and every fact in the firing's `closure` names
its own two edges. A firing's write-set is its `ops`. `earlyLoop` and `closesLoop`
read the whole line configuration and are excluded and counted separately.

**Adjacency is graph distance over edges**, two edges adjacent when they share a
dot — no coordinates, so it holds on every tiling including the aperiodic ones.
`jump-from-previous` is the hop count from a step's writes to the previous step's
writes; `jump-from-last-5` is to the union of the previous five.

## What the plans look like today

| board | steps | teleports (≥4 hops) | jump-from-previous | noteLag |
|---|---|---|---|---|
| squares-10x10-hard/a | 181 | 24 (13.3%) | p50 1, p90 5, max 16 | p50 8, p90 138, max 143 |
| squares-10x10-hard/b | 177 | 28 (15.8%) | p50 1, p90 5, max 17 | p50 17, p90 79, max 93 |
| squares-10x10-hard/c | 191 | 32 (16.8%) | p50 1, p90 6, max 14 | p50 20, p90 84, max 99 |
| squares-7x7-tricky/a | 93 | 14 (15.1%) | p50 1, p90 4, max 9 | p50 1, p90 25, max 30 |
| squares-7x7-tricky/b | 87 | 10 (11.5%) | p50 1, p90 4, max 11 | p50 3, p90 50, max 74 |
| squares-7x7-normal/a | 89 | 10 (11.2%) | p50 1, p90 4, max 6 | p50 0, max 0 |
| **total** | **818** | **14.4%** | mean 2.1, p50 1, p90 4, max 17 | mean 28.1, p50 15, p90 87, max 143 |

`jump-from-last-5` across the corpus: mean 1.5, p50 1, p90 3, max 16.

## 1.2 — a note is placed long before anything cites it. Confirmed.

A note waits a **median of 15 firings** between the position the solver found the
fact at and the first firing whose `closure` contains it; p90 is 87 and the worst
case on the owner's configuration is **143**. This is the reported defect exactly: a
corner note offered 143 steps before its consumer has nothing on screen connecting
it to the deduction it serves, so it reads as an unmotivated triviality.

**This is the surer and larger win, and it is separable.** Regrouping a note to its
consumer (D5, task 3.3) needs no comparator, no candidate enumeration and no metric
— `firstUse` is a direct computation over the plan that already exists. It should
ship ahead of the ordering work rather than behind it.

## 1.4 — steps do jump, at a rate worth fixing, but avoidability is unmeasured.

**14.4% of steps land 4 or more hops from the previous step**, and the tail reaches
14–17 hops, which on a 10×10 board is a traverse. The typical step is adjacent
(p50 1 hop, p75 2), so this is a **tail defect**: about one hint in seven on a
181-step plan, which is frequent enough for a player to notice and is what the owner
hit. Measuring against the last five steps rather than one still leaves a max of
12–16, so some steps genuinely leave the neighborhood rather than alternating
between two adjacent fronts.

**What this does not establish:** whether those jumps were avoidable. That question
— was a nearer firing available and passed over? — needs the candidate enumeration
of task 1.1, which does not exist yet. Until then 14.4% is a symptom, not a verdict,
and **task 1.1 remains the stopping condition for the ordering half of this change.**

`earlyLoop`/`closesLoop` are 32 of 818 steps (3.9%). Steps whose writes no later
step reads are 4.0%, most of them at the end of a plan where the loop closes, so
that figure carries no defect signal on its own.

## The instrument that had to be thrown away

The first cut asked "does this firing's writes touch any already-determined edge?"
and answered **92.5% yes**, which would have read as "the plans are already
coherent." The predicate is vacuous: `before[e] !== LINE_UNKNOWN` counts `LINE_NO`
marks as determined, and after a few dozen firings almost every edge on the board
has a settled one beside it. It measured the density of marks, not the continuity of
the plan.

This is `AGENTS.md` § "Method" — *a guard must measure the thing it claims to guard,
not a neighbor of it* — and the failure mode was the usual one: the number looked
plausible and pointed at "no defect here", which is the direction that stops anyone
looking. The replacement measures the gap between consecutive steps, which is what
the player perceives and what was actually reported.

## Which note sentences survive being deferred

Every string `placeCorner` and `placePair` can produce, read out of `hint-text.ts`
(2026-09-16). A sentence is **monotone** when its premise stays true as the board
fills, and so may be shown beside a consumer many steps later; **expiring** when the
board can stop satisfying it. The classification is per *sentence*, and it does not
follow the fact kind — which was the assumption a partial read suggested.

| sentence | premise it asserts | verdict |
|---|---|---|
| `cornerAtDot` (atMostOne) | the dot already has a line | monotone |
| `cornerAtDot` (atLeastOne) | the line's only continuation is this corner — its others are ruled out | monotone |
| `cornerFromClue` "…are ruled out" | the clue's other edges are ruled out | monotone |
| `cornerFromClue` "…can give it N at most" | an **upper** bound on the clue's other edges | monotone — the true max only falls, so the stated bound stays valid |
| `cornerFromClue` "…already give it N" | a **count of drawn lines**, which only grows | **expiring** |
| `cornerFromClue` "This 1 takes one line" | the static clue alone | monotone — this is the owner's reported sentence |
| `cornerAcross`, `cornerOppositeExit`, `cornerFromPair` | other marked corners/pairs | monotone — recorded facts persist |
| `pairAtClue` | **only these two** edges open, and it needs N more | **expiring** (both clauses) |
| `pairAtDot` | **only these two** edges open, and the dot has N | **expiring** (both clauses) |
| `pairAcrossClue`, `pairAcrossDot` | the clue/dot has **four open edges** | **expiring** |
| `pairAtCorner`, `pairChain` | marked corners and pairs only | monotone |

So corner notes are mostly deferrable and pair notes mostly are not, but **both
families have exceptions in both directions**, and task 3.3 must branch on the
sentence rather than on `fact.kind`. The upper-bound case is the one to be careful
with in review: it looks like a live count and is not one.

## 3.3 / 3.6 — the fix, measured

Same corpus and seeds, before and after. The question is the player's: when a note
appears, does the deduction it arrives with actually use it? The "before" rate is
computable from plan data alone, since the old grouping keyed on `tickOf` and so put
a note with its consumer exactly when `tickOf === firstUse`.

| board | notes | before | after |
|---|---|---|---|
| squares-10x10-hard/a | 71 | 24.6% | 78.9% |
| squares-10x10-hard/b | 83 | 28.2% | 80.7% |
| squares-10x10-hard/c | 122 | 13.7% | 74.6% |
| squares-7x7-tricky/a | 26 | 48.1% | 100% |
| squares-7x7-tricky/b | 21 | 33.3% | 100% |
| squares-7x7-normal/a | 1 | 100% | 100% |
| **total** | **324** | **24.1%** | **80.9%** |

**The residual is the expiring half, by design.** A note whose sentence names which
edges are still open stays where the solver found it, because moving it would let it
lie — so the pair-heavy Hard boards sit at 75–81% while the Tricky boards, whose notes
are mostly corners, reach 100%. Closing the rest is task 3.4, and it is bounded by
truth rather than by effort.

**What the leg count does and does not show.** Every board reported legs exactly equal
to its note count (324/324 across the corpus). That is an *identity*, not evidence:
each group is notes-then-firing, so flagging every leg after the first always yields
the note count. It confirms the flag is live and that no note is left as a journey of
its own — nothing more. The rate above is the load-bearing number.

## Still open

- **1.1** — candidates available per plan position. Needs the enumeration hook;
  gates the ordering half.
- **1.3** — generation cost baseline, once anything touches the solve path.
