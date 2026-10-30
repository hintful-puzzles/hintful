# Tasks

## 1. Consult and design

- [x] 1.1 Brief a UX / technical-writer subagent with the facts in `proposal.md` and the pages, not a conclusion; get its recommendation on the first-open experience and its checklist for a page that stands alone
- [x] 1.2 Decide what is shown, what records the first open, and when it fires (`design.md`); the consultant found a clear winner on both owner questions, so none was asked
- [x] 1.3 Write the spec deltas (`app-shell`, `help-pages`) and remove `skip_specs`

## 2. First open

- [x] 2.1 `PuzzleSettings.introduced`, and a settings read of "met" (`introduced` or `lastGameId`), with a test that it fires once and never for a game played before
- [x] 2.2 The first-open card: rules read from the served page, Play / Full rules and controls, light dismiss, bottom on a narrow window
- [x] 2.3 The puzzle screen reads "met" before the board loads, and shows the card and records it after
- [x] 2.4 Update `help/features.md` to say what a player sees on a first open

## 3. The help review

- [x] 3.1 The `{{touch}}` line: written by the renderer, expanded from `ignoresSecondaryButton` and `requestKeys`; drop the long-press parenthetical from `controlsMarkdown`
- [x] 3.2 The checks: rules word budget, no link in the rules, no other game named in rules or Controls, no first person outside `origins`, a command's bold label spelled as the app does; each seen to fail
- [x] 3.3 Fix every page the checks and the consultant's findings name: split over-budget rules, drop the Solo references, reword Group's and Mines' asides, name **Fill marks** rather than 'M', label casing, one name per thing (Keen's cages), Black Box's beam rules restored from upstream's manual, Mathrax's clue list made readable
- [x] 3.4 Record the checklist in `docs/help-pages.md`

## 4. Verify

- [x] 4.1 Run the app in Chrome (`playwright-cli`) on a phone-sized and a desktop-sized window: first open, dismissal by touch, keyboard and mouse, a second open, offline; read the changed pages in the app
- [ ] 4.2 Hand to the owner for acceptance, then archive
