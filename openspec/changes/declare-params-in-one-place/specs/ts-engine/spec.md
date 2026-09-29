## ADDED Requirements

### Requirement: A params field declares what it means, its range and its words

Every `paramConfig` item SHALL carry a `doc` saying what the field means, as the
help's Parameters section states it; an item documented together with the one
before it (Height with Width) SHALL say so with `{ with: kw }` naming that item.
A numeric text field SHALL declare its unconditional range as `bounds`, and a
field MAY declare a `label` saying which slot of a params label its words fill.

These are the facts the Custom dialog, the preset titles, the type header, the
bounds check and the help were each keeping a copy of, and the item is the one
place all of them are consumed from. A choices field's `doc` SHALL name each of
its word choices, because a mode the dialog offers and the help never explains
is the gap Unequal's Adjacent sat in.

A tiered game SHALL declare its difficulty field with the engine's
`difficultyItem(tiers, field)` rather than writing the item, and the tier
accessors `tierOf(game, p)` and `withTier(game, p, tier)` SHALL be derived from
that item.

#### Scenario: A field without a doc

- **WHEN** a registered game declares an item with an empty `doc`, or a
  `{ with }` doc not naming the item before it
- **THEN** `params-declared.test.ts` fails, naming the game and the field

#### Scenario: A mode the help never names

- **WHEN** a choices field offers a word its doc does not mention
- **THEN** `params-declared.test.ts` fails, listing the missing words

#### Scenario: A tiered game writes its own difficulty item

- **WHEN** a game's difficulty field is not labeled as the tier slot the engine's
  item fills
- **THEN** `params-declared.test.ts` fails, so the field is built by
  `difficultyItem` and the accessors read the one declaration

### Requirement: One describer labels every params set

A set of params SHALL be named for a player by one engine function,
`describeParams(game, p)`, composing the items' label words in the order
`[lead: ]size[ kind…][ tier][, tail…]`. The preset menu's titles, the type
header of a board matching no preset, and every test reading a title SHALL go
through it — a preset leaf is its params, and its title is their label.

A leaf MAY keep a declared title only for a name upstream gave it that no field
says (Guess's "Standard"). Such a name SHALL differ from the leaf's label, and no
two presets of a game SHALL share a label.

The slot order is the collection's convention and the words are each game's:
two games could want different words for a field, but not the tier in a
different place.

#### Scenario: A tier renders as its declared name

- **WHEN** a label is composed for params at any tier of any tiered game
- **THEN** the text contains that tier's declared name

#### Scenario: Two presets read the same

- **WHEN** two leaves of a game's preset menu get one label, or a named leaf's
  title is its label
- **THEN** `params-declared.test.ts` fails, naming the game and the title

#### Scenario: The menu and the header name one board one way

- **WHEN** a player opens a preset, and later reaches the same params through
  the Custom dialog
- **THEN** the type header reads the same both times, because both are the one
  label

### Requirement: Params validity is the engine's check

Whether params can be played SHALL be decided by the engine's `paramsError(game,
p, full)`: each item's `bounds`, each choice inside its list, then the game's own
`validateParams`, which is optional and holds only what the items cannot state —
a limit depending on another field, or one that applies only when generating.
The midend, and every test asking whether params are valid, SHALL call it.

A bound's refusal SHALL name the field by the label its Custom dialog shows.
Where a requirement elsewhere in the specs says a game's `validateParams` SHALL
reject some params, that requirement is met by this check.

A generation-only limit SHALL NOT move into `bounds`, because a bound applies
whatever the `full` flag says and would refuse a description-carrying game ID
that loads today.

#### Scenario: A value outside its range

- **WHEN** the Custom dialog submits a width below its declared minimum
- **THEN** the engine refuses it with "Width must be at least N", and the game's
  own `validateParams` is not asked

#### Scenario: A choice outside its list

- **WHEN** a decoded game ID carries a difficulty index past the tier list
- **THEN** the engine refuses it, naming the field and its choices

## MODIFIED Requirements

### Requirement: The engine exposes each game's custom-params configuration UI

The engine SHALL let a game describe its **custom-params** configuration form so
the app's "Custom type…" dialog can edit the game's parameters, mirroring the
per-game preferences surface. The `Game` interface SHALL define an optional
declarative `paramConfig`: an ordered list of field descriptors, each with a
stable keyword, a display name, a type (`string` for a text field — e.g. a numeric
width/height — `choices` for a select, or `boolean` for a checkbox), and
`get`/`set` accessors over the game's `Params`. A shared width/height helper SHALL
supply the common dimension fields so a plain w/h game declares them in one line.

The `Midend` SHALL build the app's `ConfigDescription` and initial `ConfigValues`
from `paramConfig` and the current params, and SHALL apply a submitted form by
mapping the values back onto a copy of the params, validating them with
`paramsError`, and — on success — adopting the new params (so the app generates
a new game) or — on failure — returning the validation error string without
applying. The worker-side adapter SHALL forward these to the midend rather than
return an empty configuration. A game that declares no `paramConfig` keeps an
empty custom dialog (correct for a preset-only game).

#### Scenario: A width/height game's custom dialog is populated and applied

- **WHEN** the "Custom type…" dialog is opened for a TS game that declares
  `paramConfig` (e.g. width/height)
- **THEN** the form shows a field per descriptor initialized from the current
  params
- **AND** submitting valid values validates them with the game's `validateParams`
  and generates a new game at those params

#### Scenario: An invalid custom value is rejected with the game's message

- **WHEN** the submitted values fail the game's `validateParams`
- **THEN** the engine returns the validation error string and does not change the
  current params

#### Scenario: A game without paramConfig keeps an empty dialog

- **WHEN** a TS game declares no `paramConfig`
- **THEN** its custom dialog is empty and no fields are shown (unchanged behavior)

### Requirement: A tiered game declares its difficulty contract

A game with difficulty tiers SHALL declare an optional `difficulty` contract on
its `Game`: `solveAtCap(params, desc, cap)` running the game's solver with its
deduction ladder capped at `cap`, and the declared exceptions to the tier guards.
A game without tiers omits it, exactly as a game without a solver omits `solve`.

The contract SHALL NOT carry the tier list or the tier accessors. **The tier
names are read off the game's difficulty item** — `difficultyTiers(game)` — which
is the list a player picks from, and which decides both *whether* a game is
tiered and *what its tiers are*; `tierOf` and `withTier` read and move a tier
through the same item. A `tiers` array on the contract was a second
hand-maintained copy of that list held equal to it by an assertion, and the
accessors were a second pair held equal to the item's `get`/`set` the same way;
with both derived from the item, there is nothing for either to disagree with.

`solveAtCap` SHALL return a **discriminated verdict** (`"solved"` /
`"unsolved"` / `"impossible"`), not the raw integer its solver uses. The
collection's solvers report `-1 / 0 / 1` with meanings that are **not uniform** —
one game's `0` is "ambiguous", another's is "stuck", another returns a status
enum — so the per-game translation belongs in the adapter. Propagating the raw
integers would import 26 conventions into every cross-game consumer.

`solveAtCap` SHALL stay per-game and SHALL NOT be derived. Measured across all
29 contracts, its only shared step is `newState(params, desc)`, which `Game`
already provides and each adapter spends one line on; the cap is passed straight
through to the game's own solver, and the verdict mapping is the per-game
knowledge the discriminated verdict exists to hold. There is no capping logic to
share — the shared part was `latinVerdict`, and it is already extracted.

The contract SHALL describe what the game already does and SHALL NOT change any
board it generates: adopting it is a no-op, and a differential fixture that moves
means an adapter misreports its game's solver.

The tier list SHALL NOT be derived from the game's `DIFF_*` constants. A `DIFF_*`
constant is not reliably a tier: Solo declares eight and offers six (two are
solver verdicts), Galaxies' names list has five entries and two tiers, Singles
has a `DIFF_MAX` *and* a `DIFF_ANY`, and Salad has a `DIFF_HOLESONLY` at −1.

A tier that the game's solver understands but that the generator refuses at every
size SHALL still be offered in the form, because a saved game or a
description-carrying game ID may request it and `solveAtCap` must be able to
answer. Its refusal SHALL come from `validateParams` with a human-readable
reason, never from silent failure.

A tier that deliberately does **not** promise a uniquely-solvable board SHALL
declare itself, so that the cross-game guard asserts what that tier actually
promises rather than the opposite. Dominosa is the case, and it was found by the
guards rather than anticipated: the last entry in its difficulty menu is
"Ambiguous", and its generator branches on it to skip the uniqueness search
entirely — so a tier is not always a rung of the deduction ladder, it can instead
be a relaxation of what the puzzle promises.

Because generation is already uniform through `Game.newDesc(params, rng)`, the
contract SHALL NOT add a separate "generate at tier" entry point —
`newDesc(withTier(game, p, t), rng)` is that, and a second spelling of an
existing capability is how a contract sprawls.

#### Scenario: A newly tiered game is enrolled by declaring the contract

- **WHEN** a game with difficulty tiers declares `difficulty`
- **THEN** every cross-game difficulty guard covers it without further enrollment
- **AND** its tier list is read from the difficulty choices its custom-params
  form offers, so there is no second list for a game that gains a tier to leave
  stale
- **AND** a game that offers such a choice without declaring the contract fails
  the guard, so enrollment is conscription rather than invitation
- **AND** a game that declares the contract while offering no such choice fails
  the guard, because it would have no tiers at all and every per-game assertion
  would loop zero times over it while reporting health

#### Scenario: A tier is declared but generates at no size

- **WHEN** a tier exists in the solver's ladder but the generator refuses it
  everywhere
- **THEN** the tier stays offered in the form, so a saved game or game ID can
  still name it
- **AND** `validateParams` refuses it with a human-readable reason, which the
  guard requires — a tier that fails to generate and says nothing about why is a
  silent downgrade wearing a menu entry

#### Scenario: An adapter misreports its solver

- **WHEN** an adapter maps a solver's return value to the wrong verdict
- **THEN** the "every declared tier is reachable" guard fails, because a board
  the game's own generator just produced at that tier is reported unsolved
- **AND** the adapter is corrected rather than the guard relaxed

## REMOVED Requirements

### Requirement: A game maps its params to type-summary config values via a Game hook

**Reason**: `Game.describeParams`, the worker adapter's `decodeCustomParams` and
the per-game formatters in `src/puzzle/augmentation.ts` were three copies of how
a params set reads, held together by nothing. They are deleted; the label is
composed by the engine from the `paramConfig` items.

**Migration**: "One describer labels every params set" and "A params field
declares what it means, its range and its words".

### Requirement: A game's config field is spelled the same everywhere it is named

**Reason**: The join it protected — a `describeParams` key looked up against a
`paramConfig` item's `kw` — no longer exists. A field's words now come from its
own item, so there is no second spelling to match.

**Migration**: None needed; the difficulty item's `kw` is the engine's
(`difficultyItem`).
