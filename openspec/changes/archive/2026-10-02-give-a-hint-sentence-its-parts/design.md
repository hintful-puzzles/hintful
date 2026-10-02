# give-a-hint-sentence-its-parts: design

## D0. Census (tasks 0.1, 0.2)

Taken 2026-10-02 over every hinting game's sentence templates, found by shape
(every `phrase` call or `Narration.plain` whose result becomes a step's words,
in any file of the game, plus the engine's shared sentences), one row per arm.
The rows, with their connectives and an example of each, are
[`census.tsv`](./census.tsv). The engine's shared Latin and setup sentences
appear once per game that speaks them, so about 20 rows are repeats.

| class | rows | meaning |
|---|---|---|
| F | 450 | a premise, then a move the premise forces |
| P | 69 | a premise only, which the engine (or the game's own `conclude`) finishes with ", so …" |
| R | 45 | fits, with a relation other than forced |
| E | 59 | does not fit as written |

The relations the R rows need: `goal` 19 (Fifteen, Sixteen, Netslide, Inertia,
Guess, Untangle, Flood, Pegs), `danger` 8 (Pegs, Inertia), `sequence` 6 (Pegs'
packages, Untangle's journey), `measure` 5 (Untangle, Guess), `instance` 4
(Subsets' "For instance"), `oneOf` 3 (Pegs).

The E rows: `setup` 27 (the candidate games' "Start by penciling…" and "Now
clear the easy ones", mostly one engine copy spoken by many games, and the
per-cell populate), `continuation` 19 (journey legs: "…and these edges must
be walls too, for clue 3"), `other` 10 (Rome's endings, which are the move
part of a P row and fit; Filling's three premise-only sentences; Pearl's
appended second conclusion), `bare` 2, `multi` 1.

So the proposal's "large majority" holds: 564 of 623 fit as written (90%), and
once the continuation leg and the setup step are given shapes of their own,
everything but a handful does.

**Where the variety is** (task 0.2). The join between the premise and the move
is ", so" in about 85% of forced rows, and ", so <consequence>: <move>" in 39
more. Every other move join is rare and has a meaning the relation already
names: "One of them:", "One way to <x>:", "First," / "Next," / "Last,",
"Working on <x>:", "…too, for <basis>". The variety is inside the premise:
", and … , so" 28, "; … , so" 18, ", but … , so" 7, "Suppose … :", ", which",
", since", and two-sentence premises. 191 premises are an indication only,
240 an indication then what follows from it, and 132 fuse the two in one
clause that cannot be split without rewording.

**The owner's decision** (2026-10-02, asked with the census above): **fixed
move joins**. The engine owns the words between the premise and the move, one
fixed form per relation; the premise stays the game's own words.

**What the census convicted.** Rule 3: Pegs' same-peg arms (`trap`,
`trapSoon`, `leavesAlone`) say "…, so jump this peg … instead" whenever the
rival is the same peg, without having judged the peg's other jumps or any
other peg's. Rule 2, joins with no stated relation: Magnets `oneEndNeither`
("… It must be neutral."), Loopy `clueBlockedPair` and `clueOneShort`, Tracks
`wouldStrandTrack`, Undead `total` ("; we must"), Inertia `strands`
("…: slide north." with no reason that move answers it). Each is rewritten
by the conversion, because the parts leave no place to write it.

## D1. The parts

```ts
interface Said {
  aim?: Narration;     // "Working on <aim>:", a stable subgoal (non-deductive plans)
  look?: Narration;    // what to attend to, then whatever follows inside it
  follows?: Narration; // a consequence the move rests on, joined ", so … :"
  move: Narration;     // the action or the forced state, mid-sentence form
  relation: Relation;
}
```

`look` is the game's words and may hold several clauses or even two
sentences; the census says that is where a hint's character lives, and a
fixed joint there would read mechanically. Rule 1 inside `look` is reviewed,
not enforced. `follows` exists because 39 sentences already have the shape
"look, so follows: move" and a fixed engine form for it costs nothing.

## D2. Relations and the words the engine writes

| relation | composes to |
|---|---|
| `forced` | `L, so M.` / `L, so F: M.` |
| `oneOf` | `L. One of them: M.` |
| `answers(phrase)` | `L. <Phrase>: M.` ("One way to save it") |
| `effect(E)` | `[L. ]M: E.` (the move opens its sentence) |
| `sequence(first\|next\|last, E?)` | `L. First, M[: E].` / `Next, L, M[: E].` |
| `again(B)` | `…and M, for B.` (a journey's continuation leg) |
| `serves` | `M.` after an aim, only with one |

`aim` prefixes any of them: `Working on A: …`, the sliding games' existing
engine prefix. `L, so F` replaces `L` wherever `follows` is given.

`effect` covers the census's `goal` and `measure`: a non-deductive move is
narrated by what it does (Untangle's crossings, Guess's answers left, Inertia's
gem), so the reason follows the move and that order is the right one. `again`
is the engine's existing `edgeContinuation` form ("…and these edges must be
walls too, for clue 3"), adopted by every game's continuation leg. Subsets'
"For instance" is not a relation: its example is part of the premise, and
moves there.

## D3. A step's words are a `Sentence`

`Sentence` is a `Narration` that remembers its **form** (the relation, or the
exception), built only by `sentence(said)` and `unshaped(words, kind)`. A
step's `words` is typed `Sentence`, so a game cannot hand over a bare
`phrase`: the parts are structural, and the typechecker is the census of what
is converted. `narrow` and `capitalized` return the same subclass with the same
form, so refresh, the binding walk and every renderer are unchanged: they read
`text` and `refs` as before.

A dead end's words (`MarkedDeadEnd`) stay a `Narration`: a refusal is not a step.

## D4. Exceptions

`unshaped(words, kind)`, where `kind` is one of a closed set the engine owns,
each checked by the hint-quality walk against the step it is on:

- `bare`: nothing to say but the move (Pegs' `plain`, Flood with no gain). The
  words may name only ring marks: evidence on the board means there was a
  premise to say.
- `setup`: the method's opening procedure, not a deduction (the candidate
  games' "Start by penciling…" and "Now clear the easy ones"). The words may
  name no outline or stripes: a setup step reasons from nothing.
- `evident`: a premise alone, where the ringed squares and the board say what
  to do (Filling's "The region of 4 fits exactly into these last squares",
  owner-endorsed wording). The words must name a ring.

A new kind is an engine change with its reason, which is the override
AGENTS.md describes. The set is closed so that the exceptions stay few: a
string reason per call site would make each a free-form excuse.

## D5. The step's move as a mark (task 1.2)

`MOVE` is an engine `MarkKind` with one element, *the step's move*, and
`mark.move(words)` is a ring reference to it. A renderer that finds it in
`stepMarks(step).of("ring", MOVE)` draws the step's move however it draws a
move (Pegs: the ring across the jump's three squares). Pegs' `JUMP` becomes
it. This is what lets rule 4 leave the move to the board ("go back for it")
while the binding walk still holds the words to the frame.

## D6. The mechanical half of rule 2 (task 2.3)

The structure fixes order and connective; it cannot know whether the
conclusion follows. What it can check is rule 3 where it is a claim about
rivals. A game whose hint *searches* (derived as today:
`SEARCH_PLANNING_GAMES` and `SEARCH_REACH_GAMES`) has moves other than the
offered one that are as good, so `forced` there is a claim that every rival
was judged and lost. So `forced` takes `{ rivals: "lost" }` there, and the
walk fails a searching game's forced step without it. It does not prove the
claim; it puts it at the call site where the judging code is, which is
exactly what Pegs' trap arms were missing. Deductive games' `forced` needs no
such field: the deduction is the proof.

## D7. The candidate walk

`StrikeWords.premise` is `look`; the walk's ", so <ending>" becomes
`sentence({ look: premise, move: ending, relation: forced })` (task 2.1), and
so does the fold's. Mines' and Rome's own `conclude` endings become `move`.

## D8. Order of work

The `Sentence` type lands first as an optional alternative, so games convert in
batches by shared machinery while the tree builds; the last batch makes
`HintStep.words` a `Sentence` and deletes the fallback, and the typechecker
says the conversion is complete. Each batch is checked by a census of every
step's text across the hint-quality walk, before and after: a forced sentence
with a ", so" join converts byte-identically, and every changed sentence is a
rewording read out loud.
