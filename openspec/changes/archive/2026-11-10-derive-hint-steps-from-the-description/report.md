# Report: what a hint costs a described game, and what follows

Measured 2026-11-10 at `4dfee668`, over the 47 games whose descriptions state
techniques, by five read-only surveys, one a family of games. Each read a
game's non-test, non-compiled sources and split every line that serves the
hint by what it does. **Line counts are estimates, good to about 15% a
bucket, and the labels in § "Techniques by the rules they read" are
judgments.** Re-check a figure before designing against it.

## Sections

| Section | What it holds |
| --- | --- |
| The buckets | what each column of the table counts |
| What the hint code is | the totals, and the correction to the proposal's table |
| The table | every game, by bucket |
| What a sentence needs beyond slots | the shapes that recur |
| What the plan machinery is | bucket E, sorted into what the engine could own |
| Techniques by the rules they read | the proposal's task 1.3 |
| The words differ where they need not | the owner's point, measured crudely |
| The owner's rulings | 2026-11-10 |
| The plan | the changes filed, in order |
| Found in passing | defects the surveys met |
| Not done | what this change leaves to the changes it filed |

## The buckets

- **A, reasons**: the reason union and the callbacks that turn a technique's
  binding into a reason (`compiledRung` and its kin).
- **B, sentences**: the templates in `hint-text.ts`.
- **C, marks**: code that decides which element is marked and with which
  role, where it sits outside the sentence.
- **D, step assembly**: the reason-to-sentence dispatch, grouping firings
  into steps, `hint`, `hintKeepTrack`, `hintGesture`, the `*_RUNGS` list,
  building the walk. The same shape in every game.
- **E, the game's own plan machinery**: everything beyond one firing making
  one step with a sentence and marks.
- **F, other**.

## What the hint code is

| Bucket | Lines | Share |
| --- | --- | --- |
| A, reasons | ~5,700 | 17% |
| B, sentences | ~8,500 | 25% |
| C, marks | ~2,500 | 7% |
| D, step assembly | ~9,000 | 26% |
| E, own plan machinery | ~7,800 | 23% |
| F, other | ~700 | 2% |
| All | ~34,200 | |

- **The proposal's table under-measured.** It counted `hint*.ts`. A game's
  reasons are in `solver.ts` and its narration is often in `index.ts`:
  Singles' hint is about 640 lines against the 244 the table gave, Unequal's
  about 190 against 38.
- **Step assembly is the largest bucket**, and the surveys found no game
  whose copy differs in kind.
- **Much of A re-implements the description.** A reason callback cannot call
  a `define`, so Boats restates `num`, `rec`, `boat` and `runs` in
  TypeScript (about 300 lines), Bridges keeps a class `Reads` for `has`,
  `allows`, `need` and `most` (about 120), Sticks restates `stick`, `reach`
  and `meets` under a supposition (about 60), and Tracks reads its own
  `Board` for what the marks already hold.
- **The proposal's test is met.** It asked that the per-technique part be
  most of the code in most games, or that the plan machinery generalize.
  A to D are three quarters of the lines, and E sorts into two capabilities
  the engine could own (§ "What the plan machinery is").

## The table

Lines by bucket, and the techniques a game states itself by the rules they
read (one rule alone, two rules meeting, the game's own pattern).

| Game | A | B | C | D | E | F | one / two / own |
| --- | --- | --- | --- | --- | --- | --- | --- |
| abcd | 57 | 169 | 15 | 195 | 65 | 9 | 3 / 1 / 0 |
| adjacent | 47 | 19 | 6 | 105 | 3 | 10 | 2 / 0 / 0 |
| ascent | 145 | 430 | 25 | 125 | 1075 | 112 | 9 / 0 / 1 |
| blackbox | 60 | 116 | 13 | 135 | 165 | 35 | 1 / 0 / 0 |
| boats | 445 | 355 | 55 | 235 | 215 | 0 | 9 / 8 / 3 |
| bricks | 71 | 90 | 31 | 151 | 5 | 0 | 5 / 0 / 0 |
| bridges | 340 | 184 | 95 | 333 | 36 | 0 | 4 / 3 / 0 |
| clusters | 84 | 149 | 32 | 136 | 25 | 0 | 1 / 2 / 0 |
| crossing | 190 | 182 | 128 | 167 | 333 | 133 | 5 / 0 / 0 |
| dominosa | 115 | 113 | 50 | 95 | 45 | 0 | 3 / 7 / 0 |
| filling | 89 | 73 | 30 | 150 | 15 | 0 | 6 / 0 / 0 |
| galaxies | 215 | 145 | 215 | 270 | 105 | 0 | 6 / 2 / 0 |
| group | 121 | 90 | 0 | 226 | 23 | 10 | 1 / 0 / 2 |
| guess | 85 | 105 | 45 | 210 | 225 | 0 | 7 / 0 / 0 |
| keen | 62 | 49 | 7 | 107 | 3 | 11 | 0 / 3 / 0 |
| lightup | 115 | 143 | 73 | 193 | 14 | 0 | 2 / 2 / 0 |
| loopy | 260 | 490 | 30 | 450 | 890 | 30 | 23 / 3 / 1 |
| magnets | 105 | 500 | 85 | 290 | 590 | 0 | 5 / 5 / 0 |
| map | 80 | 190 | 20 | 225 | 260 | 0 | 4 / 0 / 0 |
| mathrax | 47 | 62 | 6 | 110 | 12 | 10 | 3 / 0 / 0 |
| mines | 170 | 338 | 20 | 200 | 160 | 45 | 4 / 1 / 0 |
| mosaic | 54 | 128 | 34 | 168 | 5 | 0 | 2 / 0 / 0 |
| net | 110 | 357 | 110 | 215 | 430 | 0 | 2 / 6 / 0 |
| palisade | 130 | 215 | 28 | 140 | 20 | 50 | 4 / 2 / 1 |
| path | 85 | 194 | 20 | 162 | 246 | 0 | 1 / 3 / 0 |
| pattern | 35 | 80 | 42 | 190 | 100 | 0 | 1 / 0 / 0 |
| pearl | 110 | 250 | 50 | 340 | 200 | 0 | 8 / 1 / 0 |
| range | 44 | 115 | 139 | 128 | 10 | 0 | 4 / 0 / 0 |
| rect | 125 | 190 | 70 | 175 | 115 | 0 | 1 / 6 / 0 |
| rome | 150 | 168 | 13 | 255 | 20 | 39 | 6 / 1 / 0 |
| salad | 92 | 225 | 68 | 286 | 370 | 10 | 0 / 1 / 0 |
| seismic | 37 | 117 | 8 | 180 | 50 | 39 | 3 / 1 / 0 |
| separate | 75 | 108 | 34 | 120 | 11 | 33 | 3 / 0 / 0 |
| signpost | 90 | 80 | 43 | 95 | 14 | 0 | 0 / 2 / 0 |
| singles | 95 | 244 | 99 | 198 | 0 | 0 | 4 / 2 / 2 |
| slant | 150 | 355 | 150 | 150 | 745 | 0 | 9 / 1 / 0 |
| solo | 267 | 195 | 31 | 232 | 4 | 74 | 6 / 3 / 0 |
| spokes | 120 | 145 | 25 | 163 | 86 | 0 | 2 / 3 / 0 |
| starbattle | 182 | 217 | 29 | 262 | 20 | 0 | 5 / 8 / 0 |
| sticks | 137 | 188 | 34 | 173 | 10 | 0 | 5 / 0 / 0 |
| subsets | 114 | 166 | 71 | 88 | 517 | 9 | 9 / 0 / 0 |
| tents | 90 | 235 | 150 | 310 | 240 | 0 | 6 / 3 / 0 |
| towers | 69 | 107 | 28 | 142 | 50 | 11 | 0 / 2 / 1 |
| tracks | 277 | 215 | 110 | 311 | 40 | 0 | 6 / 3 / 2 |
| undead | 59 | 129 | 52 | 204 | 220 | 0 | 2 / 1 / 0 |
| unequal | 50 | 17 | 6 | 104 | 3 | 10 | 1 / 0 / 0 |
| unruly | 90 | 71 | 72 | 123 | 10 | 0 | 3 / 2 / 0 |

## What a sentence needs beyond slots

Only Unruly's and Undead's sentences are one fixed template each. What the
rest need recurs, and each is a service the engine could give once:

- **A sentence is chosen by the fact, not the technique.** Unequal's `sign`,
  Towers' `bounds`, Solo's region techniques, Singles' `corner`, Light Up's
  `square` and Palisade's techniques pick their words by which element or
  value the fact concludes. The unit a player reads is an arm of the
  conclusion.
- **Several techniques share one sentence**: Star Battle's thirteen share
  six, its line and region twins word for word; Net's lock and note
  techniques share four.
- **A slot is a term, not a bound name**: a least candidate, a count, a
  filtered set of neighbors, a set read under the technique's own `with`.
- **Number follows the live marks**: one or many, re-rendered as a step
  shrinks when the player makes part of it.
- **Small counts have their own words** (none, its one, both, all n), and so
  do degenerate clues (0, the whole line).
- **An element is named by what it shows**: a square by its number, two like
  clues apart by position ("the upper 1"), a unit as row, column or region.
- **A journey's later legs speak a shorter form.**
- **A clause list is joined**, and a sentence past the length limit drops to
  a shorter form (Boats, Map, Magnets, Path, Ascent).
- **Evidence is a bound set less the targets**, in nearly every game.

## What the plan machinery is

Fifteen games hold about 6,500 of bucket E's 7,800 lines: Ascent, Loopy,
Slant, Magnets, Subsets, Net, Salad, Crossing, Map, Path, Tents, Guess,
Undead, Boats and Pearl. It sorts four ways.

- **A witness.** The firing says a rule would break, and the game works out
  again which rule and where: which arm of an `or` held, which member of an
  `exists`. Path's `clashOf`, Spokes' `breakOf`, Bridges' `tooMany`, Boats'
  `classifyBreach`, Tracks' `finishEarly`, Signpost's `why`, Rect's
  `fitReason`, Pearl's `noStraight`. Harder: why each filling of an `exists
  fill` fails (Net's `explain.ts`, Pattern's packings, Tents' `lineCount`).
- **Provenance.** A firing that only makes a mark is not a step. It is kept
  as a fact with the facts it rests on, and placed later as a note before
  the step that cites it: Loopy's `record.ts` and `planSteps`, Slant's
  trace, Crossing's `aimedNotes`, Map's premise dots, Tents' links, Subsets'
  rule-outs. Its mirror is a candidate the player cannot write, whose
  striking the game re-derives from the visible board to have words for it:
  Magnets' `reading.ts`, Ascent's readings, Filling's `bitmap`, Salad's
  markers. Undead and Map each re-implement the candidate plan the engine
  owns for grid games.
- **A step that is not a deduction**: Guess's probe, Black Box's laser and
  layout search, Mines' first click, Ascent's whole run. These stay the
  game's.
- **A move that is not the facts**: Rect's rectangle drag, Boats' fills,
  Bridges' two drags, Mines' flag then open. These belong to the control.

## Techniques by the rules they read

Of 297 techniques the games state themselves, about 196 follow from one
rule alone, 88 are two rules meeting, and 13 are a pattern of the game's
own. The labels on one-rule techniques that recur most are a count met, a
count starved, a single place or candidate left, and a value ruling out a
neighbor. Many of the two-rule techniques are a supposition whose sentence
is "this would break rule R at W".

**Not measured**: how many kinds of rule the 196 fall into by their
statements. The surveys labeled each technique by reading it; nothing
compared the formulas. `supply-techniques-by-kind-of-rule` measures this
before it builds anything.

## The words differ where they need not

Of the 61 `hint-text.ts` files, 42 say "square" and 36 say "cell", 5 of them
both. A value ruled out of an edge is "is out", "ruled out", "must be
blocked", "must be empty" or "must be crossed out" by game. This is a text
search over the files, comments included, so it shows the split and not its
size. `standardize-hint-vocabulary` takes the census properly.

## The owner's rulings

2026-11-10, on this report:

- **Today's sentences are not to be preserved.** "Much of it is clunky and
  could actually be improved by further standardization." Different games
  using different words where the same would fit is detrimental; a game
  keeps wording of its own only where it needs it.
- **A hint may give up a little clarity for consistency**: it is never made
  significantly less clear, and consistency is itself a lower load on the
  player. `docs/doctrine.md` § "Convention over configuration" says so now.
- **Where the sentences live is the session's call**, for the player's
  understanding and for many new games that need very similar hints. Taken:
  in the description, built by the engine (`state-hint-sentences-in-the-description`).
- **A large refactor is welcome where its benefit is clear**, weighed at a
  hundred more games with the catalog's games as their exemplars.
- **`check-the-last-move` waits** for the explained verdict.
- **Internationalization is not a priority and may come later.** Words kept
  as data, and built by the engine from whole clauses, are what would let
  it. No change here builds it.

## The plan

Each is a change of its own, filed with this report, taken in this order.

| Order | Change | What it gives |
| --- | --- | --- |
| 1 | `build-hint-steps-in-the-engine` | terms and arms compiled; the engine builds the step from one adapter a game. No words change |
| 2 | `standardize-hint-vocabulary` | one lexicon; the first change a player reads |
| 3 | `explain-a-firing-by-its-witness-and-parents` | witnesses and provenance, which absorb most of bucket E |
| 4 | `state-hint-sentences-in-the-description` | a technique's words in its description, built by the engine |
| 5 | `supply-techniques-by-kind-of-rule` | a game states few of its techniques |
| 6 | `check-the-last-move` | the verdict, with its explanation |

The first comes first because every other stands on it, and because it
changes no words, so each step can be compared with today's word for word
while the machinery moves. The lexicon is second so that value a player
reads lands early, and because the third's clauses for a struck candidate's
parents are written in its words.

## Found in passing

Not fixed here: the owner asked that this session build nothing.
`build-hint-steps-in-the-engine` takes the first two.

- Mines' `hint.ts` count arm handles members that are regions, which
  `solver.ts` never produces (it emits `{ group }` only).
- Loopy's `lineReason` throws on `closed`. The plan appears to stop at
  solved before reaching it; this was read, not run.
- Palisade and Separate each hold the same translation of edge facts into
  the border grid's terms, and five games copy one `perFiring` memoizer.

## Not done

- **Task 1.2**, writing three games' steps both ways. It needs the words
  decided first, so it is the first task of
  `state-hint-sentences-in-the-description`.
- **The share of each kind of rule**, above.
- **The cost of the second verdict's search**, which is
  `check-the-last-move`'s own first task.
