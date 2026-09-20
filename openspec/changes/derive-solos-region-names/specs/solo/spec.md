# solo — delta for derive-solos-region-names

## MODIFIED Requirements

### Requirement: Solo interprets digit, pencil, and mark-all input

`interpretMove` SHALL support: a left-click / cursor-select that highlights a cell
for a real entry; a right-click / select2 that highlights an empty cell for a
pencil mark (and, in sticky pencil mode, toggles a persistent pencil mode); a
digit key `1..cr` that enters that digit (or toggles that pencil mark) in the
highlighted non-given cell; backspace / space that clears it; keyboard cursor
movement; and the `M`/`m` key that fills every empty cell with all candidate
pencil marks. A right-click on a given/filled cell SHALL toggle pencil mode but not
select that cell. Entering a digit equal to a cell's current contents (no pencil
marks) SHALL be a no-op that hides the mouse highlight. With auto-pencil enabled, a
real placement SHALL additionally strike that digit from the pencil marks of every
other cell sharing one of its no-repeat regions — its row, column and sub-block,
each main diagonal it lies on under X, and its cage under Killer. `executeMove`
SHALL return a new state and never mutate its input; a placement that completes the
grid with no errors SHALL mark the state completed.

#### Scenario: Placing and penciling digits

- **WHEN** a non-given cell is highlighted and a digit key is pressed
- **THEN** `interpretMove` yields a `set` move that places (or, in pencil mode,
  toggles the pencil mark of) that digit
- **AND** `executeMove` applies it to a new state without mutating the old one

#### Scenario: Mark-all fills pencil candidates

- **WHEN** the `M` key is pressed
- **THEN** `interpretMove` yields a `pencilAll` move
- **AND** `executeMove` fills every empty cell with all candidate pencil marks

### Requirement: Solo exposes pencil-mark preferences

The game SHALL expose, via the `prefs` hook, a sticky-pencil-mode preference (default on; right-click toggles a persistent pencil mode), an auto-pencil preference (**default off**; when on, placing a digit strikes it from the pencil marks of every region the digit may not repeat in — its row, column and sub-block, plus each main diagonal it lies on under X and its cage under Killer), and a keep-mouse-highlight-after-pencil preference (default off, matching upstream `PREF_PENCIL_KEEP_HIGHLIGHT`). Preference values SHALL live on the `Ui` and be set as defaults by `newUi`. With auto-pencil off (the default), note cleanup is manual — the player removes obvious candidates via the mark-all control or a hint.

The auto-pencil label SHALL name the **relation** rather than list the regions, because which regions a Solo board has depends on its mode and `prefs` cannot see the params: any list is true of some Solo boards and false of others. The label listing "its row, column and block" was wrong on every X board and every Killer board.

#### Scenario: Pencil preferences are exposed with their defaults

- **WHEN** the game's preferences are read
- **THEN** they include a sticky-pencil-mode boolean defaulting to on
- **AND** an auto-pencil boolean defaulting to off
- **AND** a keep-highlight boolean defaulting to off

#### Scenario: The auto-pencil label holds on every mode

- **WHEN** the preferences dialog is opened on a plain, an X and a Killer board
- **THEN** the auto-pencil label reads the same and is true of all three, naming no region the board has not got and omitting none it has
