# reach-the-custom-dialog-from-the-rail — tasks

## 1. Confirm

- [x] 1.1 In the app at desktop width, choose Custom type… from the rail's Type
      chips and confirm the error dialog; at phone width confirm the dialog opens.
      (Chromium, 2026-09-13, Abcd at 1400×900 and 390×844: both as described.)
- [x] 1.2 Confirm the dialog's title is the game id. ("abcd".)

## 2. Implement

- [x] 2.1 Find the container across shadow roots, or pass it in; a tier-3 test
      with the menu inside a shadow root. (`closest` from `utils/dom.ts`;
      `type-menu.test.ts` went red on the shadow-root case with
      `this.closest`, and on the title case with the id as title.)
- [x] 2.2 Title the dialog with the game's display name. The engine cannot
      know the name, so `ConfigDescription` loses its `title` and the dialog
      reads `puzzle.displayName`: "Custom ABCD". The never-created
      `puzzle-preferences-dialog` went with the abstract base it shared.
- [x] 2.3 Spec delta for whichever requirement states the Custom dialog (grep
      the live specs for "Custom type" first). No live requirement states the
      title or the rail's menu, so the delta is an ADDED app-shell requirement.

## 3. Verify

- [x] 3.1 Run the app at both widths: the dialog opens, is titled by name, and
      refuses an invalid width with the game's message. (Chromium, Abcd, 1400×900
      from the rail and 390×844 from the top bar: "Custom ABCD"; Width 0 shows
      "Width must be at least 2".)
