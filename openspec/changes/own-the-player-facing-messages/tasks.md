## 0. Measure

- [x] 0.1 Census by shape across every game and the engine (`design.md` § "Task
      0"). The falsifier does not fire for Solve, descriptions or status, and
      fires for `validateParams`, which narrows to the one area-limit copy.

## 1. Solve

- [x] 1.1 `solve-failure.ts`: the kinds, and `SolveFailure` as the union of
      their literal types; `SolveResult`'s error is `SolveFailure`.
- [x] 1.2 The midend refuses Solve on a solved board with `ALREADY_SOLVED`
      before asking the game (`midend.test.ts`).
- [x] 1.3 Every game's `solve` and its helpers' results (`solveToGrid`,
      `findUndeadSolution`, `solveRoute`) return kinds; each site read for
      whether its solver proved "no solution" or gave up.
- [x] 1.4 Keen's and Pearl's bad aux throws.
- [x] 1.5 Inertia's and Netslide's hints refuse with the Solve kind for the same
      fact; `hint-refusal.test.ts` approves both, reads conditional branches and
      templates, and counts the refusal sites it reached.

## 2. Descriptions

- [x] 2.1 `desc-error.ts`: `DescError`, the kinds, `descBadCharacter`,
      `puzzleDescError`; `validateDesc` returns `DescError | null`.
- [x] 2.2 `validateWireDesc`, the grid tilings' validators and every game's
      description path return kinds.
- [x] 2.3 `desc-error.test.ts`: a `puzzleDescError` sentence belongs to one
      game, is not a kind, and speaks in the kinds' voice.
- [x] 2.4 `desc-error-games.test.ts`: every game refuses malformed descriptions
      without throwing.

## 3. Status

- [x] 3.1 `completion-status.ts`: `completionStatus` and its four states.
- [x] 3.2 Every status bar that said a completion word uses it.
- [x] 3.3 `completion-status.test.ts`: no string a game writes says the words.
- [x] 3.4 The app's own Auto-Hint refusal says `ALREADY_SOLVED`.

## 4. Params

- [x] 4.1 `AREA_TOO_LARGE` in `params.ts`, used by every game that typed it out.

## 5. Record

- [x] 5.1 Spec deltas: `ts-engine` (the three concerns, and the Solve banner's
      scenario), `samegame`, `mosaic`.
- [x] 5.2 `docs/games/engine-catalog.md` names the three modules;
      `docs/games/mechanics.md` says where a game's messages come from.
- [x] 5.3 Scaffold `add-pegs-hint` with the design pass the proposal asked for,
      and take Pegs out of `hintless-games-in-reserve`.
- [x] 5.4 Run the app: malformed Inertia IDs in the Enter Game ID dialog (too
      short, a bad character, two starting squares, too long), Solve on a
      fresh Mines board, and Mosaic's status after Show solution. The dialog
      wrapped the reason as "(Error: ….)", which doubled the full stop on
      the new sentences; it now shows the sentence, adding a full stop only
      to a params refusal that lacks one. Its label read "Enter a Inertia
      game ID"; it now names the puzzle after the noun.
