# Tasks

## 0. Before it starts (proposal § "Before it starts"), settled 2026-11-17

- [x] 0.1 The shape: `supply-techniques-by-kind-of-rule` (archived
  2026-11-17) answered it, tasks 2.2 and 2.9 there: the two changes are one,
  a game moves onto the kinds where its techniques fit them and its words
  are the kind's or a clause of its own; consistency is the measure, not
  lines.
- [x] 0.2 `add-norinori` § 2.2: every place the engine made Norinori say
  what it should not have was mended or filed there, and the filed changes
  are archived.
- [x] 0.3 Solo's baseline dump (exited 1 at `7a1223d3f`): at `4dd180d09`
  it runs, and is long: 718,763 lines in the 15 minutes `timeout 900`
  allowed at `DUMP_DEALS=8`, which killed it (exit 124). Take Solo's at
  fewer deals, under a time limit that fits.

## 1. Method, each game

A baseline word dump of every game below was taken at `4dd180d09`
(`research/hint-walk-dump`, `DUMP_DEALS=8`) into the session's scratchpad;
a later session takes its own at its HEAD. A game moves in one commit:
`hint-text.ts` goes, its sentences are `says` on its techniques (a kind's
where it places one) or `steps` spoken through the module's `voice`; the dump
is taken after and its diff read; every changed sentence is listed under the
game here; the game is read in the running app.

## 2. The games (re-derive with `ls src/games/*/hint-text.ts`)

Planning games (a `steps` block, Slide's form):

- [x] Flood (2026-11-17): dump byte-identical. The engine gained `|ring|` in
  a step's `when`, and a wording of a move alone said `bare` (the fill that
  joins no square, pinned by a test: no dumped walk meets it).
- [x] Fifteen (2026-11-17): dump byte-identical. The engine gained `aim`, a
  step's clause said first ("Working on tile 3:"), with the move serving it.
- [x] Sixteen (2026-11-17): dump byte-identical. A wording may read one
  ring sort's size (`|ringOnward|`); the engine's `HINT_SETTING_UP`, which
  only Sixteen said, went into its description.
- [x] Flip (2026-11-17): dump byte-identical. Stripes mark one region, so
  their count form is fixed: "the striped one" and "the striped ones" are
  two wordings by `|stripesCell|`.
- [x] Netslide (2026-11-17): dump byte-identical. The engine gained a term
  declared as a list of words (the tile's shape, the heading).
- [x] Numgame (2026-11-17): dump byte-identical. The engine gained a ring
  of several sorts (two numbers and a sign), and a judged relation passed
  by the planner (`relation`, the rival judging's).
- [x] Cube (2026-11-17): dump byte-identical. Come-round's "Instead:" is
  the step's `answers` clause, added with Same Game; until then it had
  said "so" there.
- [x] Twiddle (2026-11-17): every sentence is the same. Each part of a
  run is a step; the lift and landing tails are description `phrases`.
  Where a sentence runs past 120 characters, `hint.ts` says it again
  without the returning tiles, as before: a `fit` cannot hold references.
  **One mark key changed form, not place:** the ring's block is keyed by
  the cell of its top-left square ("3", was "0,1"), so that one voice
  serves blocks and tiles. Render maps it back, and a ring-stripped diff of
  the dump is empty. **Fixed in passing, seen in the app:** a free turn's
  outline went on whichever tile that one turn brought to the stage's cell
  (the 4, beside "Working on tile 1"); it now traces the whole stage's
  turns and outlines the tile the words name. Carry steps' outlines move;
  no sentence changes.
- [x] Read in the running app (2026-11-17, Chrome): Twiddle, Pegs, Same
  Game, Inertia, Sixteen, Flip and Cube, one explained hint each; words
  and marks agree.
- [x] Inertia (2026-11-17): dump byte-identical. The slide's compass point
  is a word-list term, "One safe way" is `answers`, and a forced slide
  passes the rival judging's relation. A step with an aim and no judged
  relation serves the aim; with neither, its look forces the move.
- [x] Samegame (2026-11-17): dump byte-identical. "One way to avoid it" is
  the new `answers` clause; the judged relations come from `judgeRivals`.
- [ ] Untangle. Needs, read 2026-11-17: a sequence relation that carries
  the clauses' `effect` (today `statedOnce` turns an effect into an effect
  relation and drops a judged sequence), and count wordings for "its only
  crossing / both of its crossings / all {n} of its crossings" and "the
  outlined one / the outlined {n}". The ring holds a point (VERTEX) and a
  spot (SPOT, a RationalPoint): a ring by sort `[point, spot]`, and one
  voice over their union, as Pegs does.
- [x] Pegs (2026-11-17): dump byte-identical. One voice serves pegs,
  holes and whole jumps (`MarkKind`'s key is a method, so a kind of
  indices is a kind of the union). A ring of sort `move` is the move
  itself, the engine's MOVE kind ("go back for it"), and the lint lets its
  words be a clause. A sequence's later leg no longer capitalizes the look
  after its "Next,".
- [ ] Sokoban. Needs, read 2026-11-17: the same sequence-with-effect
  (`runLast`), and a `when` that compares a word term with one of its words
  (`why = corner`; `stepWhen` in `describe/compile.ts` compares numbers
  only) for the trap's three fates, or three trap steps. "it" or the
  outlined barrel is an `{if own: …}`; `stuckBarrel` (a refusal's words)
  stays in hint.ts. One voice over `Push | number`.

Logic games:

- [ ] Pattern
- [x] Filling (2026-11-17): every sentence is the same, and its marks; the
  rungs are the description's kinds (growth → `mustGrow`, blocked →
  `onlyWay`, lonely and bitmap → `onlyNumber.lonely` and `.bitmap`), and
  the dump is byte-identical with those renamed. The area kinds that place
  carry their sentence, a look alone; the engine says a wording with a look
  and no move as `evident`, as it says a move alone `bare`. Its own walk
  stays (a strike is no step where a player keeps no notes) and speaks
  `STATED`. Read in the app: the exact fit, region striped, square ringed.
- [ ] Signpost
- [ ] Seismic
- [ ] Rome
- [ ] Rect
- [ ] Galaxies
- [ ] Guess
- [ ] Blackbox
- [ ] Bridges
- [ ] ABCD
- [ ] Map
- [ ] Subsets
- [ ] Solo (after 0.3)
- [ ] Tents
- [ ] Crossing
- [ ] Mines
- [ ] Slant
- [ ] Net
- [ ] Ascent

## 3. Revisited in the app as their words are touched

- [ ] Towers, Undead, Salad, Mathrax, Keen, Group (moved before the
  debrief, never read in the running app)

## 4. Engine

- [ ] A trial kind, once a second game's Checks suppose as Path's, Spokes'
  or Boats' do (proposal § "What Changes").
