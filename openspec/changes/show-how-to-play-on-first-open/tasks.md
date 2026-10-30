# Tasks

The session that takes this up revises these as it designs.

## 1. Consult and design

- [ ] 1.1 Brief a UX / technical-writer subagent with the facts in `proposal.md` and the pages, not a conclusion; get its recommendation on the first-open experience and its checklist for a page that stands alone
- [ ] 1.2 Decide what is shown, what records the first open, and when it fires (a shared link, a restored board); bring the owner the questions in `proposal.md` only where the consultant found no clear winner
- [ ] 1.3 Write the spec deltas (`app-shell`, `help-pages`) and remove `skip_specs`

## 2. First open

- [ ] 2.1 Implement the first-open panel and its record, with the lowest-tier test that would catch it firing twice or never
- [ ] 2.2 Update `help/features.md` (or the page the design names) to say what a player sees on a first open

## 3. The help review

- [ ] 3.1 Apply the checklist to every page in `help/games/`; list what each fails
- [ ] 3.2 Fix every finding, a sentence several pages share as a generated placeholder (`docs/help-pages.md` § "A game's page"); add a check where the checklist has a checkable item
- [ ] 3.3 Record the checklist in `docs/help-pages.md`
- [ ] 3.4 In passing: a comment in `vite.config.ts` counts the help pages as "All 57", and `help/games/` holds more; replace the count with what it means

## 4. Verify

- [ ] 4.1 Run the app in Chrome (`playwright-cli`) on a phone-sized and a desktop-sized window: first open, dismissal by touch, keyboard and mouse, a second open, offline; read the changed pages in the app
- [ ] 4.2 Hand to the owner for acceptance, then archive
