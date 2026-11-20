/**
 * What the keyboard delivers to a game: a key's `KeyboardEvent.key`, mapped to
 * the button code `interpretMove` receives. A key not here that is a single
 * character arrives as its char code; any other key arrives as nothing.
 *
 * The engine's, though the view reads it, because it is half of the contract
 * between them: a game may test only a code something sends, and this is what
 * the keyboard sends (`emittable-keys.test.ts`).
 */
import { PuzzleButton } from "./contract/types.ts";

export const puzzleKeyMap: Readonly<Record<string, PuzzleButton | number>> = {
  ArrowDown: PuzzleButton.CURSOR_DOWN,
  ArrowUp: PuzzleButton.CURSOR_UP,
  ArrowLeft: PuzzleButton.CURSOR_LEFT,
  ArrowRight: PuzzleButton.CURSOR_RIGHT,
  Accept: PuzzleButton.CURSOR_SELECT,
  CrSel: PuzzleButton.CURSOR_SELECT,
  Enter: PuzzleButton.CURSOR_SELECT,
  Select: PuzzleButton.CURSOR_SELECT,
  " ": PuzzleButton.CURSOR_SELECT2,
  // Upstream's two "put it back / rub it out" keys. A game that wants either
  // must test **both** codes below: this map sends 127 for Backspace, where
  // upstream's own ports send `'\b'` (8), so a transcribed `button == '\b'`
  // is a key that can never fire.
  Escape: 27,
  Backspace: 127,
  Clear: 127,
  Delete: 127,
  Undo: PuzzleButton.UI_UNDO,
  Redo: PuzzleButton.UI_REDO,
  // Tab: Only Untangle uses it; intercepting would create a tab-order trap
};
