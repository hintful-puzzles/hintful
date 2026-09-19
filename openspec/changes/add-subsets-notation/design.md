# add-subsets-notation — design

Every fact a Subsets hint step rests on must be something the player can see or
mark (`AGENTS.md` § "Hint quality bar", rule 6). The recorder reasons over
`cube[cell][set-value]` and the player marks letters, so a collapse or a last-place
placement could rest on set-values ruled out of a cell by nothing on the board. This
change gives players a mark for that fact, a rule-out, and has the hint place it.

## D1. Every rule that reads the cube (task 1.0)

The audit named `collapse` and `singlePosition`. Reading the recorder for every
read of `cube`:

| Rule | What it reads | Its reason, as the board shows it |
|---|---|---|
| `syncCube` | the cell's letters | the cell's own marks |
| `recCubeSingleCount` | placement counts | "placed elsewhere", which the tally shows |
| `recDisjoint`, decided neighbor | the neighbor's set | the no-horseshoe rule against a decided neighbor, which `whyCantPlace` already reads |
| `recDisjoint`, undecided cell | the edges | "no empty or full set beside a neighbor it may not contain", which nothing read |
| `recApplyArrowsAdvanced` | **the neighbor's cube column** | nothing: the neighbor's candidates were themselves narrowed earlier |
| `nextCollapseFiring`, `nextSinglePosition` | the cell's / the set's cube entries | nothing, where an entry above is gone |

So only one rule derives facts the board cannot show, the advanced-arrow rule, and
it is also the only one whose premise is another cube entry. The other four are the
shallow reading the reference aid makes, plus one rule the aid did not draw.

## D2. The board reading grows by the one rule it lacked

The empty set lies inside every set and the full set holds every set, so the empty
set can only go where every neighbor's horseshoe points into the cell, and the full
set only where every one points out. That is read off the edges with no chain, as
the decided-neighbor rules are, so `whyCantPlace` now reads it (`extreme`) along
with the player's rule-outs (`ruledOut`). It also covers the arrow half the Easy
cube never had (a subset end cannot be the full set).

The recorder then **syncs its cube to the board's reading** (`syncToBoard`, one rule
standing in for the four above) and records a reason only for the advanced-arrow
eliminations (`RuleOutWhy`: the neighbor across the horseshoe, and which end). A
cube entry is gone either because the board says so, and needs no step, or because
of a recorded horseshoe, and needs a mark. `canHold` is the one predicate the aid,
the hidden single and the "already shown?" test all read.

## D3. What the measurement found (task 1.1)

Opening plans, 40 boards per tier, all completed:

| Tier | firings | collapses needing a rule-out | hidden singles needing one | rule-outs per board p50 / p90 / max | per firing max | head / tail |
|---|---|---|---|---|---|---|
| Easy | 931 | 79 of 315 | 3 of 246 | 4 / 10 / 18 | 8 | 0 / 178 |
| Normal (`DIFF_TRICKY`) | 1,059 | 134 of 381 | 21 of 285 | 8 / 18 / 28 | 11 | 127 / 230 |

The audit counted 76 + 4 on Easy and 136 + 38 on Normal, on its own seeds and with
only the no-horseshoe half of the empty/full rule added back, so the figures are
close rather than comparable; the gap was not traced further.

- **Chains are short.** A rule-out's premise needs a rule-out at the neighbor at
  depth 2 at most on Easy and 4 on Normal; the median is 1.
- **Every fact has one shape**: set X is out of cell C. Its premise is always "none
  of the sets the neighbor can still hold is a strictly smaller set inside X" (the
  superset end) or "a strictly bigger set holding X" (the subset end). So the
  notation is one mark and the narration one sentence with two wordings.
- **The neighbor's candidates are the premise, and there are few**: p50 4, p90 8,
  max 11. They are boxed in the tally rather than listed in words.
- **Rule-outs cluster**: about 45% share their cell, neighbor and end with another
  in the same firing. They stay one step each, as a firing's letters are
  (`docs/games/hints.md` § "Narrate by what survives (Subsets)", one slot per step).

## D4. The mark lives in the reference aid (task 2.1)

A cell's 2×2 letter block has no room for sixteen sets, and the aid's cell→sets view
already lists what a cell can hold, so that list became editable:

- **Mouse and touch.** Focus a cell (its inspect badge, or the keyboard cursor),
  then press a set in the tally to rule it out of that cell, or press it again to
  take it back. The focus stays, so several can be struck in a row. With no cell in
  focus, or a decided one (nothing is left to rule out), a press spotlights the set
  as before. No mode: the tally's meaning follows what is in focus, which the board
  already shows by framing the cell.
- **Keyboard.** Down from the grid's bottom slot row moves the cursor into the tally
  band (`ui.tallyCursor`), keeping the cell in focus; the arrows move between
  entries, Enter or Space presses one, Backspace takes a rule-out back, and Up from
  the top row returns to the grid. The grid cursor hides while the band has it.
- **Drawing.** A rule-out is a line through the set's label, in the player's ink,
  drawn for the cell in focus or the cell a hint step is about. A wrong one is drawn
  in the error color, and its cell gets the mistake frame.

Rejected: a notes mode toggled by the Marks key (Slant's shape). Subsets' cell taps
edit letters and its tally taps had one meaning; making the second meaning depend on
the focus the board already frames costs no extra key and no hidden state.

## D5. State, moves, saves

- `SubsetsState.ruledOut: Uint16Array`, bit `v` per cell (sixteen sets at the one
  legal size). Not named `pencil`: these are *excluded* values, and the note guard's
  convention is for candidate lists.
- Move `{ kind: "rule", pos, value, on }`, absolute, so replaying one is harmless,
  which keep-track relies on. The move union only grows and a save replays its log,
  so every existing save loads unchanged.

## D6. Mistakes (task 2.2)

`findMistakes` solves the givens and flags a rule-out of the solution's set
(`{ kind: "ruled" }`). The hint refuses on any mistake, so wherever it runs every
rule-out is true and the recorder may read them as facts (§ "Deduce from the notes
when the mistake check vouches for them"). The solve path never reads `ruledOut`, so
a wrong rule-out cannot bend the solution it is judged against, and the generator's
path and the differential are unchanged.

## D7. The hint (task 3.1)

- A collapse's **culprits** are the gone sets its letters need gone (lacking a
  marked letter or holding a cleared one). A last-place firing's are the set in
  every other cell. `markRuleOuts` places each culprit the board does not rule out,
  each after the rule-outs its own premise needs at the neighbor, recursively, and
  marks it on the working board as it goes. Nothing else the cube eliminated is
  placed.
- **Placement is simply "just before the firing that cites it"**, with no expiry
  check, because every premise here is monotone: the board's reading only grows as
  it fills, so a rule-out true when found, and a neighbor's candidates short enough
  then, stay so. Slant and Loopy needed a sentence-expiry classification; here the
  closure is computed on the board the firing is shown on and nothing expires.
- A last-place firing, once its rule-outs are marked, *is* a hidden single on the
  board, so it is narrated as one (the `singlePosition` reason is gone).
- Each firing's rule-outs and letters form one journey.
- The rule-out sentence names the pattern, not the sets: *"No highlighted set is a
  smaller set inside {A,B,C}, so the horseshoe to the highlighted cell rules
  {A,B,C} out here."* 116 characters at the longest. The neighbor is framed, its
  candidates boxed in the evidence color, and the set being ruled out boxed in the
  hint color; the cell is framed whole, since no slot is decided.
- **Every step is now read against the plan's board at that step.** `hint()` had
  built every firing's highlights and "why not" clause from the board the hint was
  asked on, so a later step's spotlight and exclusion could describe a board several
  firings stale. It walks a working copy now.

`subsets-notes.test.ts` walks every step of whole plans on both tiers against the
board it is shown on: each rule-out is true, not already shown, across the horseshoe
it names, its boxed sets are the neighbor's candidates and none fits, and each is
used by the firing beside it or by a later rule-out's premise. Three planted defects
(skipping the premise recursion, placing an unneeded rule-out, swapping the two
wordings) each turned it red.

**The fallback, if the notation proves unmanageable in play**, is the tier: Normal's
hint would refuse where a firing needs a rule-out. Nothing measured points there.
