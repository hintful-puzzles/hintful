# Tasks

Read `docs/games/mechanics.md` § "interpretMove and UI_UPDATE",
`docs/games/input.md`, `ts-engine` and `engine-input`, and the archived
`drop-a-move-that-changes-nothing/design.md`, § "The mirror", first.

## 1. Look

- [ ] 1.1 Run `src/engine/input-answers.test.ts` and reproduce each row of the
  proposal's table from the inputs `inputAnswers` names.
- [ ] 1.2 In the running app, for each of the seven: what the unclaimed key
  or press does that a claimed one would not (a shortcut taken, a drag lost,
  an overlay left up).

## 2. Settle the design

- [ ] 2.1 Measure what claiming every input that changed the `Ui` would
  change: which presses and keys of which games flip from declined to
  claimed, and what the view then does with them.
- [ ] 2.2 Decide between the midend's answer, a shared arm for the press that
  hides the cursor, and the seven fixed where they answer. Write it into
  `design.md` with the reason.

## 3. Build

- [ ] 3.1 What 2.2 decided, with tests through the midend.
- [ ] 3.2 `ANSWERS_NOTHING_AND_CHANGES_THE_FRAME` is empty.
- [ ] 3.3 In the running app: each row of the proposal's table.

## 4. The rule

- [ ] 4.1 `ts-engine` and `engine-input`, as 2.2 leaves them.
- [ ] 4.2 `docs/games/mechanics.md` § "interpretMove and UI_UPDATE".

## 5. Close

- [ ] 5.1 Remove `skip_specs`, validate, the gate, commit, push, archive.
