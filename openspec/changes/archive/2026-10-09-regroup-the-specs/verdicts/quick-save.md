# Verdicts: quick-save

## reword `quick-save`: The presence of a quick-save is observable

"Observable reactively" is how it is built (`savedGames.hasQuickSave` reads a
live-query signal, and `src/puzzle/command-list.ts` sets the `quick-load`
command's `disabled` from it). The rule a reader needs is the one its scenario
held: the Quick-load control is disabled with no slot and enables as soon as
one is made. Retitled and restated as that rule about the control; the
scenario is unchanged. No source or guide cites the old title.

### Requirement: Quick-load is unavailable until the puzzle has a quick-save

The Quick-load control SHALL be disabled while the current puzzle has no
quick-save, and SHALL become enabled as soon as one is made, without the page
being reloaded.

#### Scenario: Quick-load disabled with no slot

- **WHEN** no quick-save exists for the current puzzle
- **THEN** the quick-load control is disabled, and it becomes enabled as
  soon as a quick-save is made

## keep `quick-save`: Check & save is drawn like the commands beside it

A refusal that still binds, about what a player sees. Check & save is the one
Bar command that both checks and writes, which is the reason a bordered or
filled button gets proposed for it, and the Bar does draw some controls
framed on purpose (an open Menu outlined, a mode in force filled,
`src/puzzle/components/bar.ts`), so the shape is available to reach for. It stays here and not in `app-shell`:
it is about this one control, and `app-shell` "A slot draws its icon above its
caption" already names Check & save as the neighbor Hint is drawn like.

## note the spec's "Quick-load" is "Back to last save" on screen

`quick-save` calls the control Quick-load throughout; the command is
`quick-load` and its label in `src/puzzle/command-list.ts` is "Back to last
save", which is what `app-shell` calls it ("A loaded save keeps the board it
replaces", "The Bar and the Menu are one ordered list, cut once"). The toast
of "A successful Quick-load confirms with a toast" reads "Quick-save restored"
(`src/puzzle/quick-save-actions.ts`). Nothing is wrong in behavior; a reader
searching the spec for the words on the button will not find them here. No
entry named those requirements, so they are left as they are.
