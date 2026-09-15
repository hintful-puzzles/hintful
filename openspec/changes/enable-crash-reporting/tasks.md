# Tasks — enable-crash-reporting

## 1. The decisions (owner, 2026-09-15)

- [x] 1.1 Crash reporting **on**, to Sentry.io, EU data region.
- [x] 1.2 Client hints **declined**: the `Accept-CH` / `Permissions-Policy`
      block is removed from `vite.config.ts`.
- [x] 1.3 **Consent per report**: nothing is sent unless the player presses
      *Send report*; declining sends nothing at all.
- [x] 1.4 Game data: the saved-game attachment is **dropped**; the game ID,
      params, seed and move count are **kept** and disclosed in the notes.
- [x] 1.5 Session tracking **off** (and client reports with it).

## 2. The code

- [x] 2.1 `src/utils/report-consent.ts`: a transport gate that holds every
      envelope until released, bounded, feedback passing through.
- [x] 2.2 `src/utils/sentry.ts`: transport through the gate,
      `sendClientReports: false`, `BrowserSession` filtered out,
      `sendDefaultPii: false` kept.
- [x] 2.3 `src/dialogs/crash-dialog.ts`: *Send report* / *Don't send*; the note
      is sent only on Send; closing or reloading discards; the event ID is shown
      after sending.
- [x] 2.4 `src/puzzle/puzzle.ts`: no `save.txt` attachment.
- [x] 2.5 Privacy notes, `README.md` bug-report advice, `AGENTS.md`'s
      environment note.
- [x] 2.6 `src/utils/report-consent.test.ts` drives the real `initSentry` and
      asserts nothing reaches the transport before consent (seen failing with
      the gate bypassed); `project-identity.test.ts` binds the notes to the gate
      and to the absence of any attachment.
- [x] 2.7 Run the dialog in the browser with a DSN set: both paths render.

## 3. Owner: set up Sentry and CI

- [ ] 3.1 Create the Sentry organization in the **EU** region and a *Browser
      JavaScript* project.
- [ ] 3.2 Project settings: **Allowed Domains** `hintful.click` and
      `hintful-puzzles.pages.dev`; **Prevent Storing of IP Addresses** on; a
      **rate limit** on the client key.
- [ ] 3.3 Add the DSN as the `VITE_SENTRY_DSN` repository secret (the gate job
      already reads it).

## 4. Verify on the deployed origin

- [ ] 4.1 `curl -I https://hintful.click/`: `connect-src` names the Sentry
      origin; no `Accept-CH`.
- [ ] 4.2 Throw a deliberate error; press *Don't send*; confirm no request to
      Sentry leaves the page and nothing arrives.
- [ ] 4.3 Throw again with a note; press *Send report*; confirm the event and
      the note **arrive in Sentry**.
- [ ] 4.4 Read that payload against `src/assets/privacy.html`; amend the notes or
      turn the excess off in this change if it carries more.

## 5. Close

- [ ] 5.1 `openspec validate enable-crash-reporting --strict`, then archive.
