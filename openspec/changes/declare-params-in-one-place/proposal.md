# declare-params-in-one-place

**Status: scaffolded, not started.** Phase 2 of `envision-the-game-contract`.
Read that change's `design.md` first.

## Why

A game's params are described three times:

- its hand-written preset titles;
- its `describeParams`;
- a per-game formatter in `src/puzzle/augmentation.ts` (51 of them, keyed on
  `paramConfig` kws).

Nothing holds the three together. Fed each leaf preset's params, the formatters
reproduce 363 of 428 titles. Twiddle's rendered "NaNxNaN" until
`fix-twiddle-custom-header`.

The Parameters help section is a fourth copy, checked only for mentioning each
field name. Measured on 2026-09-29:

- **Difficulty item.** 29 games write out the identical difficulty item.
- **Help text.** The difficulty field is described in at least six phrasings,
  nine tiered games' help does not link `features#difficulty`, and 36 pages
  state numeric bounds in prose that nothing checks.
- **Bounds messages.** The bounds themselves live only in `validateParams`, as
  at least 18 wordings of "board too small".
- **Codecs.** 19 of 57 games use the declared codec (`paramsCodec`); 38 still
  hand-write it.

## What changes

1. **`ParamConfigItem` gains a `doc` and, for numeric fields, `bounds`.** The
   bounds are consumed by `validateParams`, whose standard messages come from
   them, and by the help.
2. **The engine supplies the difficulty item** from a game's tier list, so no
   game writes `kw: "difficulty"` again.
3. **One describer turns a params object into a label.** Preset titles, the
   custom header and the menu all use it, and `describeParams` and the
   `augmentation.ts` formatters are deleted. The dimension spelling is
   standardized, where today presets write `NxN`, `N×N` and `N x N`.
4. **The Parameters help section is generated** from `paramConfig`: its fields,
   their docs, their bounds and the difficulty link.
5. **Codecs.** Move the hand-written codecs to `paramsCodec` wherever the frozen
   encodings in `params-stability.test.ts` allow.

## Tasks, in order

- **Task 0.** Run every leaf preset through a draft describer. **Falsifier:**
  fewer than about 40 games' titles reproduce without a per-game override. Then
  the describer is the wrong shape, and the change keeps the titles hand-written
  and derives only the header and the help.
- The generated help replaces hand-written prose for the parameter list only.
  The per-field meaning of a mode (Unequal's Adjacent) stays prose, in the
  field's `doc`.

## Hints to pull in (2026-09-29)

The owner's approach is framework first, with hintless games pulled in one at
a time as a check on the framework's ergonomics. **This change has no hint that
checks it**: a hint reads params only through its tier, and the tier list is
already one declaration. So pull none in *for* this change.

The hintless games stay in reserve (`hintless-games-in-reserve`).
