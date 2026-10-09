## ADDED Requirements

### Requirement: Quick-load is unavailable until the puzzle has a quick-save

The Quick-load control SHALL be disabled while the current puzzle has no
quick-save, and SHALL become enabled as soon as one is made, without the page
being reloaded.

#### Scenario: Quick-load disabled with no slot

- **WHEN** no quick-save exists for the current puzzle
- **THEN** the quick-load control is disabled, and it becomes enabled as
  soon as a quick-save is made

## REMOVED Requirements

### Requirement: The presence of a quick-save is observable

**Reason**: Reworded in `quick-save` as "Quick-load is unavailable until the
puzzle has a quick-save". "Observable reactively" is how it is built
(`savedGames.hasQuickSave` reads a live-query signal, and
`src/puzzle/command-list.ts` sets the `quick-load` command's `disabled` from
it). The rule a reader needs is the one its scenario held: the Quick-load
control is disabled with no slot and enables as soon as one is made. Retitled
and restated as that rule about the control; the scenario is unchanged. No
source or guide cites the old title.
