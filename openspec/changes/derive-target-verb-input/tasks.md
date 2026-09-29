## 1. Task 0 and the falsifiers

- [x] 1.1 Probe every game: the boards Enter / Space reach at every cursor
      position against those a left / right / middle click reaches (design.md
      § "Task 0"). 23 agree exactly; the falsifier (< ~20) does not fire.
- [x] 1.2 Classify commit-on-press versus commit-on-release, and drags that reach
      new boards, across the 17 members (design.md § "The second falsifier").
      3 of 17 touch the release; the model does not own resolve-on-release.

## 2. The model

- [x] 2.1 `engine/target-verb.ts`: geometry, verbs, `interpretTargetVerbs`,
      `squareGrid`, `controlsMarkdown`; `Game.targetVerbs`.
- [x] 2.2 Unit tests of the model's rules (`target-verb.test.ts`, "the model").

## 3. The pilot

- [x] 3.1 Light Up, Singles, Range, Unruly declare `targetVerbs` and hand their
      buttons to the model; their own arms (Singles' outside click, Range's
      Shift-arrows, Unruly's digits) stay above the hand-off.
- [x] 3.2 Their help pages write `{{controls}}`; `vite-plugins/controls.ts`
      generates it; `help-coverage.test.ts` holds placeholder and declaration
      together.

## 4. The guard

- [x] 4.1 `boardsReached` in `testing/input-probe.ts` — Task 0's instrument kept.
- [x] 4.2 `target-verb.test.ts`: for every declaring game, keys reach exactly the
      boards of their buttons. Proven red on two plants (Light Up's Space, Unruly's
      Delete); ~1 s for the four games.

## 5. Docs, spec, follow-up

- [x] 5.1 `docs/games/input.md` § "Targets and verbs" and its checklist line;
      `docs/games/engine-catalog.md` entry.
- [x] 5.2 `ts-engine` delta: click-game input is declared as targets and verbs.
- [x] 5.3 Ran the app: the four Controls sections render; Unruly's click, arrows,
      Enter, Space and Delete play through the model.
- [x] 5.4 Re-checked Net's membership (not expressible yet: Space is its middle
      verb) and scaffolded `sweep-target-verb-input`, which carries Net's hint.
