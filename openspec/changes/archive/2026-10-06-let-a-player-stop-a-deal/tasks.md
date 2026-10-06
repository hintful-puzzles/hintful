## 1. Find out

- [x] 1.1 What a reload does while a deal is under way: whether the type is
      saved before its first board, and so whether the page returns to the
      same wait. It does not: see the proposal's "What was found".
- [x] 1.2 Whether the board in play can be given back untouched when a deal
      is stopped, params label and type menu included. It can.

## 2. Build

- [x] 2.1 A waited-for deal runs in a deal worker, and is the deal-ahead's
      own where one is under way for the type.
- [x] 2.2 The way out of "Looking for a board…": touch, keyboard and mouse.
- [x] 2.3 A stopped type is not dealt ahead again until asked for.

## 3. Close

- [x] 3.1 Ask of Sokoban's `MAX_DEAL_AREA` and Seismic's size bound whether a
      refusal for wait alone is still wanted, and say so at each. Both stay,
      neither for wait alone; each says why at its constant.
- [x] 3.2 Run the app: Pearl 15x15 in place of the two boards the proposal
      names (see "What was found"), on a phone-sized screen too.
- [x] 3.3 The spec delta, and docs/games/solver-and-generator.md § "Bound a
      generator by its tail, not its median" on what a size bound is now for.
