# declare-params-in-one-place — design

Phase 2 of `envision-the-game-contract` (archived; its `design.md` is the
vision). Figures here were taken on 2026-09-29 at `3ce4b983`.

## Task 0: the describer's shape, measured

Every leaf preset of the 56 registered games (428 of them) was dumped with its
`paramConfig` values and classified against one describer:

```
  [lead: ] size [kind…] [tier] [, tail]…
  Seismic: 7x7        Easy       , free ends
```

Each `paramConfig` item may declare which **slot** its words fill, and the
words themselves as a function of the params, returning `null` to leave the
field out (a default the player need not be told). The width item from
`dimensionParamConfig` fills `size` with `WxH`; the difficulty item fills
`tier` with the tier's name. Nothing else about composition is per game.

| outcome | games |
|---|---|
| every title reproduced byte-for-byte | 37 |
| reproduced once punctuation, order or the dimension spelling is standardized | 15 |
| keeps named presets | 4 (Flood, Guess, Netslide, Subsets) |

The falsifier ("fewer than about 40 games reproduce without a per-game
override") does not fire: 52 games need no override at all, and the 37 exact
ones clear the threshold on their own. The describer stands, and the titles are
derived.

**The fifteen that change are the standardization the proposal asked for**:

- the dimension spelling becomes `NxN` everywhere — `N×N` in Fifteen, Sixteen,
  Pegs and Twiddle, `N x N` in Palisade, Range and Separate. `x` rather than
  `×` because it is what 363 titles already wrote and what the game ID the
  player shares spells;
- the tier sits right after the size, as in 40 games already: Boats' "6x6,
  size 3 Easy" becomes "6x6 Easy, size 3", Map's "15x20, 30 regions, Easy"
  becomes "15x20 Easy, 30 regions", Dominosa's "Order 3, Easy" becomes
  "Order 3 Easy", Loopy's "7x7 Squares - Easy" becomes "7x7 Squares Easy";
- ABCD's clue setting, which its titles already call Easy and Hard, reads as a
  kind: "4x4 Easy, 4 letters";
- Salad names its tier like every other tiered game ("Letters: 4x4 A~C Easy"),
  Solo's Killer preset names its tier ("3x3 Killer Easy") and its X presets put
  the mode before the tier ("3x3 X Normal"), Pegs puts its board type after the
  size ("5x7 Cross"), Mosaic loses its "Size: " prefix, and Twiddle loses the
  word "normal" it only ever wrote when nothing else was said.

**The four named ones** have names upstream chose that no field produces:
Guess's "Standard" and "Super", Flood's "Easy/Medium/Hard" (extra-move
allowances, not tiers), Netslide's "easy/medium/hard" (combinations of
wrapping and barriers) and Subsets's fixed board, whose Custom dialog offers
only the tier. A named preset is first-class — `{ title, params }` — and a guard
refuses a name that merely repeats the derived label, so a name is only ever
written when it says something the fields cannot.

## Decisions

### D1. One describer, in the engine, fed by the items

`describeParams(game, p)` (`engine/param-label.ts`) composes the label from the
items' `label` declarations. It is the only producer of a params label: the
preset menu (`presetMenu(game)` resolves every untitled leaf through it), the
custom header (the midend's `describeParams(paramsString)`, which the app shell
calls) and the tests. `Game.describeParams`, the worker adapter's
`decodeCustomParams` and every `describeConfig` in `src/puzzle/augmentation.ts`
are deleted: three copies become one, and the per-game words live on the field
they describe.

A field's words are the game's own business (Bridges says "no loops", Keen says
"multiplication only"); where they go is not. That is the test from AGENTS.md
§ "Convention over configuration": two games could not legitimately want the
tier in different places, but could want different words.

`Game.presets()` keeps returning a `PresetMenu`, with a leaf's `title` now
optional; anything that reads titles reads them through `presetMenu(game)`.

### D2. The engine supplies the difficulty item — and the contract's accessors

`difficultyItem(tiers, field)` builds the one item every tiered game wrote out
by hand: `kw: "difficulty"`, "Difficulty", the tier names as choices, the
`tier` label slot and the standard help text (with room for a game's own
sentence after it). `field` is the params key holding the tier index, or a
`{ get, set }` pair for the games that store a string or an enum.

That item was one half of a pair: every tiered game also wrote `tierOf` and
`withTier` on its `DifficultyContract`, and `difficulty-contract.test.ts` held
the two halves equal. With the item built by the engine, the pair is derived
from it instead — `tierOf(game, p)` and `withTier(game, p, tier)` in
`difficulty.ts` — and the contract keeps only what is the game's: its capped
solver and its declared exceptions. The coupling assertion goes with the copy it
was policing.

### D3. Bounds are declared on the field, and the engine checks them first

A numeric text field may declare `bounds: { min?, max? }`. `paramsError(game,
p, full)` (`engine/params.ts`) checks every item — bounds, and a choice index
inside its list — then the game's own `validateParams`, which becomes optional
and keeps only what bounds cannot state: a bound that depends on another field
(Unequal's Adjacent needs a size of 5 at Tricky), a product, a generation-only
limit. The midend and every test that asked "are these params valid?" call
`paramsError`.

The messages are the engine's: "Width must be at least 3", "Size must be at
most 31". Unequal's said "Order must be between 3 and 31" beside a dialog field
labeled **Size** — the kind of disagreement a message written in a second place
produces.

**A retired choice still loads.** Bricks' `dt` names upstream's Tricky tier,
which no longer generates and is not offered, but old IDs and saves carry it.
A choices item declares `retired: n`: that many indices past its list are
accepted when loading and refused when generating. Refusing them outright
would have been a break in player data, which needs the owner's approval.

A bound that applied only when generating stays in the game's `validateParams`
under `full`, because moving it would refuse a shared `:desc` id that loads
today.

**In the specs, "`validateParams` SHALL reject X" now means the engine's check**
(`paramsError`): declared bounds, then the game's own rule. One ts-engine
requirement says so rather than forty per-game deltas each restating it.

### D4. The Parameters help section is generated

A page writes `{{parameters}}` under its `## <Name> parameters` heading and the
help build (`vite-plugins/parameters.ts`, beside `hint-marks.ts`) replaces it
with the intro sentence and a `<dl>` built from `paramConfig`: each field's
label, its `doc`, and a sentence built from its `bounds`. Width and Height are
one entry, because the height item declares its doc is shared with the width
(`doc: { with: "width" }`). Prose around the placeholder stays hand-written —
Clusters' note on small grids, Subsets' fixed board.

`doc` is required on every item. It carries the per-field meaning of a mode
(Unequal's Adjacent, Solo's Jigsaw), which stays prose — the vision's "what
stays per game". `help-coverage.test.ts`'s "names every field" check moves
from the page to the items: every choices field's doc names each of its word
choices. Field labels are in the generated list by construction.

### D5. Codecs

The hand-written codecs move to `paramsCodec` wherever `params-stability.test.ts`'s
frozen encodings allow; that test is the whole acceptance criterion, since a
codec that changes one byte of one encoding changes which game a shared ID
names. What the grammar cannot express (floats, a leading solid letter, Solo's
multi-character symmetry) stays hand-written, as `params-codec.ts` already
records.

## What this does not do

- It does not touch the tier *list*: `tierNames` stays how a game names its
  tiers.
- It does not generate the rules prose or a mode's meaning.
- It does not change any encoding.
