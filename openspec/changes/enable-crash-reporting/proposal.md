# enable-crash-reporting

## Why

**`AGENTS.md` says unrecoverable errors must reach Sentry — and none of them
do.** The rule is stated as a constraint ("Catch unrecoverable errors only to
log them — let them propagate so Sentry records them"), the client is wired
(`src/utils/sentry.ts`), the CSP knows how to widen for it, and the build reads
`VITE_SENTRY_DSN`. That variable has never been set, so the rule has been
enforced against nothing.

It had no teeth before, which is why nobody minded: with no deployment there was
no one to have a crash. That changed on 2026-09-08. The app is public, it is
installable, and the very first outside session produced a real failure — the
stale-chunk crash on the About dialog — which reached the owner only because
they read the error text off their own phone and typed it into a chat. That is
the reporting channel today.

**This is split out of `deploy-the-web-app` deliberately.** It is a decision
about what the app sends to a third party, bound to a paragraph of the privacy
notes that players can read.

**The inherited wiring would have made those notes false the moment the DSN
was set.** Read against the installed SDK (`@sentry/browser` 10.69) on
2026-09-15, the build as inherited from puzzles-web would have:

- attached the player's latest autosave to every report as `save.txt`, where the
  notes promise a report carries nothing they have saved;
- sent the game ID, seed and move count, and the page URL carrying `?id=`, where
  the notes promised "no games";
- sent a session envelope on every page load and navigation
  (`browserSessionIntegration`, a default), where the notes say a report is sent
  when an error happens;
- sent a report the moment an error was captured, without asking;
- turned on high-entropy client hints (`Accept-CH`) alongside the DSN.

## What Changes

Decided by the owner, 2026-09-15:

- **Crash reporting goes on, to Sentry.io in its EU data region**, on the free
  Developer plan. The SDK stays: the service behind a DSN is swappable
  (GlitchTip and Bugsink accept the same SDK), so the vendor is not locked in by
  the code.
- **Nothing is sent without the player's consent.** An unexpected error opens
  the crash dialog, which offers *Send report* (with an optional note) or
  *Don't send*. Declining — or closing, or reloading — sends nothing, ever. The
  gate is at the SDK's transport (`src/utils/report-consent.ts`), the one point
  every outgoing byte passes, so no integration can route around it, and held
  reports live only in memory.
- **No session tracking and no client reports.** Nothing is sent while nothing
  goes wrong.
- **No client hints.** The `Accept-CH` / `Permissions-Policy` block is removed
  from `vite.config.ts`; the user-agent string is enough to tell browsers apart.
- **The save is no longer attached; the game ID is kept and disclosed.** It is
  what makes a crash reproducible, it identifies a puzzle rather than a person,
  and the privacy notes now say a report names the puzzle being played.
- **`sendDefaultPii: false` stays**, and with it the SDK tells Sentry
  `infer_ip: "never"`.
- **The DSN is not a secret**, whatever it is stored in. The controls that do
  something are Sentry's allowed-domains list and rate limit, configured in
  Sentry.

## Impact

- **Affected specs**: `build-pipeline` (a reporting rule matches the build; what
  enabling it obliges), `project-identity` (what the privacy notes promise, and
  consent before any report is sent).
- **Affected code**: `src/utils/report-consent.ts` (new), `src/utils/sentry.ts`,
  `src/dialogs/crash-dialog.ts`, `src/puzzle/puzzle.ts`, `vite.config.ts`,
  `src/assets/privacy.html`, `README.md`, `AGENTS.md`.
- **Player-visible**: the crash dialog asks before sending, and the privacy
  notes describe that. Only in builds with `VITE_SENTRY_DSN` set.
- **Sends data to a third party**, with the player's per-report consent.
