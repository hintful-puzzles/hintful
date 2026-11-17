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
- [ ] Sixteen
- [ ] Flip
- [x] Netslide (2026-11-17): dump byte-identical. The engine gained a term
  declared as a list of words (the tile's shape, the heading).
- [x] Numgame (2026-11-17): dump byte-identical. The engine gained a ring
  of several sorts (two numbers and a sign), and a judged relation passed
  by the planner (`relation`, the rival judging's).
- [x] Cube (2026-11-17). **Changed, one sentence:** come-round, "Working on
  the outlined square: the roll onto it would land a painted face on it, so
  roll onto the ringed square." (was "…on it. Instead: roll onto the ringed
  square."): the stated form has no "Instead" relation, and "so" says the
  same reason. Every other line of the dump is the same.
- [ ] Twiddle
- [ ] Inertia
- [ ] Samegame
- [ ] Untangle
- [ ] Pegs
- [ ] Sokoban

Logic games:

- [ ] Pattern
- [ ] Filling
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
