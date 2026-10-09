# Tasks

- [x] 1 A test: notes mode on, the frame on a slot that carries a mark and
      whose working-row peg is placed; `d` clears the mark and the peg stays.
      Seen to fail first. The same for `D`, and outside notes mode `d` still
      rubs out the peg.
- [x] 2 `interpretMove` sends the alias where it sends the erase key in notes
      mode. Read where else the two keys part (the key labels, the on-screen
      panel) and bring them together or say why not. The two are now one
      predicate, `rubOut`, read by both arms. The panel's Clear sends the
      erase key itself, and the letter has no label and needs none.
- [x] 3 The `guess` delta restates "Guess rubs out a color without ever
      lengthening the row"; `help/games/guess.md` follows if it names the
      key. The requirement is removed and added under a new name, since its
      scenario "The letter key edits the working row from notes mode" is now
      false and a `MODIFIED` block may not drop a scenario. The help page did
      not name the letter; it now does, and says what Backspace does in Marks
      mode.
- [x] 4 Seen in the app with the keyboard, in notes mode and out of it. `d`
      did both. Shift+D did nothing in either mode, before this change as
      after it: a capital arrives with `MOD_SHFT` set and Guess compares
      against the bare letter. That is the shared layer's, fixed in
      `offer-a-declined-shifted-key-bare`, after which Shift+D was seen doing
      both too.
- [x] 5 Committed, pushed and archived.
