# reach-the-custom-dialog-from-the-rail — tasks

## 1. Confirm

- [ ] 1.1 In the app at desktop width, choose Custom type… from the rail's Type
      chips and confirm the error dialog; at phone width confirm the dialog opens.
- [ ] 1.2 Confirm the dialog's title is the game id.

## 2. Implement

- [ ] 2.1 Find the container across shadow roots, or pass it in; a tier-3 test
      with the menu inside a shadow root.
- [ ] 2.2 Title the dialog with the game's display name.
- [ ] 2.3 Spec delta for whichever requirement states the Custom dialog (grep
      the live specs for "Custom type" first).

## 3. Verify

- [ ] 3.1 Run the app at both widths: the dialog opens, is titled by name, and
      refuses an invalid width with the game's message.
