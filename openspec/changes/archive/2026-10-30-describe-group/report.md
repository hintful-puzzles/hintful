# Report: describing Group

Written 2026-10-30. The guide is `docs/descriptions.md`.

## The result

1. **Group runs its ladder compiled from `group.description.yaml`**, and the
   hand-written `solverNormal` and `solverHard` are gone. The description
   states Group's rules (a Latin square whose product is associative) and
   three techniques: `associativity` and `identity` at Normal, and
   `notIdentity` at Tricky. The hand-written `solverNormal` was the first two
   in one function, with associativity tried first.
2. **A player sees the same boards, grades and hints**: the two ran side by
   side and agreed in every call (§ "The comparison").
3. **Each technique is sound** against the description's rules, each plant
   unsound (§ "Soundness").
4. **The compiler hoists**, which changes no deal or hint on any Latin game.
   With it, the hardest Unequal presets are 1.1 to 1.5 times the
   hand-written engine's time (they were up to 1.9), Group 8x8 Tricky 1.08
   (it was 1.55), and Group 12x12 Normal less than half (§ "Speed").

**What the syntax gained**: `cell(x, y)`, the cell at a column and row, which
Group's `mul(a, b)` (row `a`, column `b` holds `a·b`) is defined by. The
interpreter under `research/describe/` already read it.

## The comparison

Group's solver ran both ladders on copies of every `solveGroup` call while a
switch was on, and compared what each returned, the grid, the final cube,
and every hint record with its reason. The walk dealt three boards of every
preset, and of 8x8 with the identity hidden at Tricky, Hard and Unreasonable,
which the menu does not offer and where `notIdentity` fires. On each board it
followed up to 200 hint steps. The harness is in commit `fe73c3f0`
(`research/describe/compare-group.test.ts`), removed with the hand-written
code.

| Boards | Hint steps | Solver calls compared | Differences |
| --- | --- | --- | --- |
| 33 | 1,834 | 102,638 | 0 |

The compared records covered every kind Group makes: associativity 331,990,
identity fill 19,768, identity elimination 28,584, besides the library's.
The walk's own steps included 529 associativity, 24 identity fill and 48
identity elimination steps.

**It was seen to fail**: `identity` restated to fill `e·j` before `j·e`
deals the same boards and differed in 689 of 29,213 calls' records on one
seed a preset.

**What the statements keep from the hand-written code.** `associativity`
places only where the cell can still hold the product and goes on
otherwise, as upstream's shipped build does. A failed `identity` fill is a
contradiction, as it was. `notIdentity` names the least witness, checking
`j·a` before `a·j`, which is how the hint's reason was built.

## Soundness

`research/technique-check/results-describe.txt`, at orders 3 and 4:

| Technique | Sound | Its plant |
| --- | --- | --- |
| associativity | yes | places `a·(b·c)` with `b·c` instead of `(a·b)·c`: unsound |
| identity | yes | takes the first placed product as the witness: unsound |
| notIdentity | yes | rules `a` out by any placed `j·a`: unsound |

**The rule is what makes them sound.** With the associativity rule replaced
by `true`, all three came out unsound: on a plain Latin square, `a·b = a`
says nothing about `b` elsewhere. Each check takes under a second.

## Hoisting

Each binder and each definition's parameter opens a slot in the compiled
code. A term that binds no name, reads no candidate and makes no fact is
computed in the slot of the last name it reads, when that takes it out of a
loop. A read (`value`, `known`, a clue, a set's size) goes to its slot even
without leaving a loop, so the uses after it share one computation. `value` and
`known` move only in a technique whose conclusion places nothing, because a
solve makes each fact as it concludes it (guide § "What a technique
compiles to").

**It changes nothing a player sees.** With the pass off, the compiler writes
HEAD's modules byte for byte. Every Latin game's deals and hint walks
(Unequal, Towers, Keen, Group, Mathrax and Salad: 234 boards, 15,730 hint
steps, each step's rung, move and words) were written out with the pass off
and on, and the two files are identical
(`research/describe/trace-latin.test.ts`).

**The trace sees a broken pass.** With the slots' sharing keyed by a
term's sort instead of its code, the first Unequal deal threw. Letting
`value` and `known` move in a technique that places, the defect the rule
guards, changed no line, because no technique today reads one across a
placement: Group's reads sit in the slot of the loop they are used in. The
rule stays, for the statement that will.

## Speed

Generator time per deal, six seeds a preset, the second of two passes kept,
on one machine in one session. The hand-written engine was measured in a
scratch worktree at `2aedf9b4^`, the last commit that had it. It agrees with
`compile-the-latin-ladder`'s report to within 1.3 ms on each of the seven
presets both measured.

| Preset | Hand-written | Compiled, before | Compiled now |
| --- | --- | --- | --- |
| Unequal 7x7 Tricky | 10.8 ms | 24.0 ms | 15.8 ms |
| Unequal 7x7 Hard | 32.1 ms | 65 ms | 47.0 ms |
| Unequal 7x7 Unreasonable | 38.2 ms | 70 ms | 52.7 ms |
| Adjacent 5x5 Hard | 43.7 ms | 61 ms | 46.3 ms |
| Adjacent 7x7 Hard | 49.1 ms | 86 ms | 56.0 ms |
| Adjacent 7x7 Unreasonable | 12.1 ms | 23 ms | 14.7 ms |
| Group 8x8 Tricky | 127.4 ms | 197 ms | 138.2 ms |
| Group 12x12 Normal | 12.6 ms | 16.7 ms | 5.5 ms |

"Before" is this session's run of the compiled Latin library before the
pass, with Group still on its hand-written deductions. Group's compiled
ladder alone, before the pass, was 161 ms on 8x8 Tricky.

Group's own techniques gained as much from being compiled as from the pass.
On 8x8 Tricky the hand-written `solverNormal` and `solverHard` on the compiled
library took 197 ms, and the compiled ones 161 ms. On 12x12 Normal they took
16.7 ms against 5.6. A rung profile of 8x8 Tricky put `latin.set` at 66 ms of
164, associativity at 26 and both identity techniques under 3 each.

**What is left** is the set and fish searches' subset enumeration, which
every Latin game shares. Each subset is built bit by bit from the set's
members, and its cells read again.

## The app

Run in Chrome on 8x8 Tricky and 8x8 Normal with the identity hidden, hinted
step by step:

- **Associativity**: "The grid shows d·c = e, c·d = h and (d·c)·d = f. In any
  group, (d·c)·d = d·(c·d), so d·(c·d) must also be f." The ring is on row d,
  column h, and the three products are outlined.
- **The identity's row and column**: "The product b·e = b shows e is the
  identity, so row e and column e are just the element labels: this cell
  must be a." The witness is outlined, and the ring is on `a·e`.
- **Ruling out the identity**: "The product b·a = h, not b as it would be if
  a were the identity, so a's identity marks must go." The struck marks are
  exactly `a·j = j` along row a and `j·a = j` down column a.
