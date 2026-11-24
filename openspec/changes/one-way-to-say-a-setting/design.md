## The census (2026-11-24, at d84b7f653)

The queries, so a later session re-measures rather than trusts the counts:

- Keys of `play:` and `deal:` and segment kinds of `id:`, each with the born
  games using it: load every `src/games/*/*.description.yaml` with `yaml`,
  keep those with `play:` or `id:`, and count `Object.keys(j.play)`,
  `Object.keys(j.deal)`, and each `id:` entry's first key.
- The settings the params give: the fields of `FillParams`
  (`engine/fill/game-id.ts`) beyond `w`, `h` and `diff`, and the list of
  segments `fillParams` hands `paramsCodec`.

What they found, against the proposal's figures:

- 21 born games. **A setting is spelled nine ways, not eight**: the
  proposal's eight and `deal.hideFlag` (Boats' `S`). Users: `play.modifiers`
  (Solo, Unruly), `play.sizes` (Seismic, Star Battle), `deal.options`
  (Light Up, Solo, Sticks), `play.blocks` (Solo), `play.tally`,
  `deal.hideFlag` (Boats), `deal.onlyFlag` (Keen), `deal.kindLetters`
  (Mathrax), `deal.thorough` (Mosaic). Each is a module of
  `engine/fill/params/` with its own field on `FillParams` (`variations`,
  `sizes`, `options`, `tally`, `hides`, `only`, `kinds`, `thorough`) and its
  own place in `fillParams`' three hand-ordered lists (dialog, codec,
  refusals).
- 12 segment kinds, 6 with one user (as the proposal says): `runs` (Tents),
  `lists` (Pattern), `cells` (Singles), `glyphs` (Boats), `parts` (Keen),
  `codes` (Mathrax). After 3.2, 10: `glyphs` and `codes` are the stream.
- `play:` keys with one user: `shape`, `tally` (Boats), `labels`
  (Kakurasu), `sweepWith`, `wash` (Light Up), `hides`, `wrap` (Singles),
  `blocks` (Solo), `links`, `glance`, `askBefore` (Tents). `deal:` keys with
  one user: 29, most of them the name of a clue kind or partition the deal
  reads (`bar`, `n`, `seg`, `dot`, …), which are not keys of the language.
  The language's own one-user `deal:` keys: `hideBy`, `withhold`,
  `hideFlag`, `unpair`, `oneKind`, `onlyFlag`, `firstKind`,
  `kindLetters`, `thorough`, `never`, `latin`, `oneIn`, `hideFrom`.
- **"Two codecs" is false.** `engine/fill/game-id.ts` builds its params on
  `params-codec.ts` (`paramsCodec`, `num`, `flag`, `choice`, …); the kinds
  it cannot state there (Solo's symmetry codes, Boats' fleet, Mathrax's
  kind letters, Solo's blocks) are `ParamsSegment`s written beside it in
  `params/`, the codec's own extension point. What is stale is
  `params-codec.ts`' header, which still says Solo's symmetry and Boats'
  fleet cannot be expressed. The desc's segment kinds (`segments/`) encode
  a different string, the clues, not the params.

## Decisions

### One `settings:` key

A description's top-level `settings:` holds every setting its params give,
by name, in one order: the params' and the Custom dialog's. Each has a
`kind` and, but for a `set`, its Custom field (`kw`, `name`, `doc`), and
`words` for a board's name where it is not the usual.

**What it gates**, `gives:`, is one of three:

- `variation`: a flag that turns on the variation of its name (Solo's X
  and Killer, Unruly's unique), with the variation's `rule`, `note`,
  `most` and `bounds`. Written in a brief ID.
- `size`: a choice of rulesets whose index from the size's `min` is the
  size of its name (Star Battle's stars, Seismic's mode); each choice has
  its `rule` and `least`. Written in a brief ID.
- nothing: only the deal reads it, by its name. Written only in a full ID,
  as upstream's generator-only params are. A deal key that reads one names
  it: `deal.symmetric: symmetry`, `first.share: walls`.

So brief or full is derived from what a setting gates, and no setting says
it.

**Kinds**, each a module of `engine/fill/params/`:

| kind | value | written as | users |
| --- | --- | --- | --- |
| `flag` | on or off | its `letter` where on | X, Killer, unique, Boats' `S`, Keen's `m`, Mosaic's `h` |
| `number` | `min`–`max`, a `default` | `letter` and the number | Light Up's walls, Sticks' blocks |
| `choice` | one of `choices`, a `default` | `letter` and the index (from the size's `min` for a size), or each choice's `code` | symmetries, stars, mode |
| `set` | some of its `members`, each a clue kind the deal deals | the letters of those on | Mathrax's six kinds |
| `tally` | a count of pieces of each length; the setting's name is the board clue | `letter` and the longest length; the counts after a comma | Boats' fleet |
| `blocks` | blocks across and down, the grid their product | in place of the grid | Solo |

**A quirk upstream's bytes need is a property of a kind**, never a kind:

- A flag's `written: off`: written where off, as its letter and `0`, absent
  read as on (Mosaic's `h0`); and `onBelow: n`, on by default on a board
  narrower than `n` (Mosaic's `offFrom`).
- A choice's codes: a choice with no `letter` writes each choice's `code`,
  `""` written as nothing; absent, the choice whose code is `""`, else the
  default (Solo's `m4`, Seismic's `T`).
- A set writes nothing where every member is on, and nothing reads as every
  member on (Mathrax's).
- A tally's counts are written last, after every other setting and the
  tier.

**Where it is written**: `after: tier` puts it after the tier; else it
follows the size. The params' grammar is then: the grid (or a `blocks`
setting), the retired letters after the size, the settings after the size
in their order, the retired tier letters, `d` and the tier, the retired
letters after it, the settings after the tier in their order, and a tally's
counts. The Custom dialog is the same order with the tier where `d` is,
each setting's fields together.

**The deal reads a deal setting by its name**:

- `deal.oneKind.alone: { when: <setting>, kinds: [...] }` replaces
  `deal.onlyFlag` (folded into its neighbor): with the flag on, the deal
  deals those kinds alone.
- `deal.hideFlag: { kind, when: <setting> }` keeps its place until the hide
  keys become one (§ "The hide keys"); it no longer holds a Custom field.
- `deal.thorough: <setting>` names a flag; the setting carries `onBelow`.
- A `set`'s members are the kinds the deal deals; `deal.firstKind` reads
  them.

`FillParams` holds the deal's settings as one record, `settings`, by name
(a flag 0 or 1, a set the bitmask of its members, in order); `variations`,
`sizes` and `tally` stay, as the rules and the board read them.

**Who sees a difference**: the Custom dialog follows the params' order, so
Solo's X and Killer and Unruly's unique move above the difficulty, Solo's
symmetry below X and Killer, and Mosaic's "Aggressive generation" above the
difficulty, where its `h0` stands in the params. No ID changes: every
setting is written where it is now, which the `ids` and `writesBack` cases
hold.

### One codec

The params already have one codec; the fill params are its user, and a kind
it cannot state is a `ParamsSegment` of `params/`, as the codec intends.
Task 3.1 is then: `params-codec.ts`' header says so, and stops listing
Solo's symmetry and Boats' fleet as inexpressible.

The desc's segment kinds fold by what they encode (task 3.2, done
2026-11-24). `digits`, `glyphs` and `codes` were one encoding: a stream of
elements, a run letter `a`–`z` skipping 1 to 26 and a clue its own kind's
number or another kind's code. They are one kind, the stream
(`engine/fill/segments/stream.ts`), an `id:` entry holding `digits` (its
own kind), `codes` (the others), or both; `digits`' `letters`, `after` and
`also` are codes in the one grammar of `code-said.ts` (`wall 0`,
`block 0, joins`, a number code `7: hole 0`). What differed is a property:
Boats' dropped last run is `lastRun: false`, and Mathrax's mark written on
every board is `always: true`, as Seismic's was; behind a mark a stream is
written where any of its kinds has a clue, so the refusal of a second kind
there is gone. `parts` takes the same codes (`codes: { a: sum }`).

**`runs` stays its own kind**, against the census's first reading: Tents'
letter is a gap *and* the clue after it (`_` none, `a`–`y` 1 to 25), `z`
is 25 with no clue, and the last letter ends the cells with a clue past
them. Folding it would take a property for each of those, which is a kind
under another name. Its bytes are upstream's, and a second kind of the same
shape (a one-valued marker as the gaps between) could adopt it.

The fold held every ID: the `ids` cases, and a differential dealing four
seeds on every preset of the six games and four fixtures whose `id:`
changed, under HEAD and the change, the game IDs compared byte for byte.

### The one-user keys

Decided per key at task 4.1, each renamed for its concept with a second
fixture, folded, or kept with the game that could adopt it. Already
decided: `deal.onlyFlag` folds into `deal.oneKind` (above).

### The hide keys

`hide`, `hideFirst`, `hideFrom`, `hideWhole`, `hideBy`, `hideFlag` and
`withhold` become one `hide` at task 4.1.
