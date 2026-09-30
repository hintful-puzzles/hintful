/**
 * What a hint step asks the player to do, as the pointer does it.
 *
 * A hint teaches the player to make its move themselves, so every step must be
 * one a pointer can make on its own: a finger and a mouse are one input here
 * (two buttons, clicks and drags, no key held), and the on-screen keys are part
 * of it. The midend never applies a hint step's move. It asks the game for the
 * step's gesture ({@link Game.hintGesture}) and plays it through the game's own
 * `interpretMove`, exactly as the frontend delivers a tap or a drag, and the
 * game's `hintKeepTrack` judges what that made. A step no gesture makes cannot
 * be played, so it cannot pass a walk of the hint.
 *
 * Keys the keyboard alone would press are not gestures: a gesture may press
 * only a key the game's keypad offers, or the app's mark-all control.
 */

import type { Point } from "./types.ts";

/** A pointer button, by the verb slot it applies. */
export type GestureButton = "primary" | "secondary";

/** One thing done with the pointer. */
export type PointerAction =
  /** Press and release at one point: a tap, or a long press for `secondary`. */
  | { readonly kind: "click"; readonly button: GestureButton; readonly at: Point }
  /** Press at `from`, move through `through` in order, release at `to`. */
  | {
      readonly kind: "drag";
      readonly button: GestureButton;
      readonly from: Point;
      readonly through?: readonly Point[];
      readonly to: Point;
    }
  /** Press an on-screen key: a keypad key, the Marks key, or mark-all. */
  | { readonly kind: "key"; readonly code: number };

/** A tap (or, with `secondary`, a long press) at `at`. */
export function click(at: Point, button: GestureButton = "primary"): PointerAction {
  return { kind: "click", button, at };
}

/** A drag from `from` to `to`, by way of `through`. */
export function drag(
  from: Point,
  to: Point,
  options: { button?: GestureButton; through?: readonly Point[] } = {},
): PointerAction {
  return {
    kind: "drag",
    button: options.button ?? "primary",
    from,
    through: options.through,
    to,
  };
}

/** An on-screen key. */
export function key(code: number): PointerAction {
  return { kind: "key", code };
}

/** The mark-all control's code: the app's toolbar sends `M`. */
export const MARK_ALL_CODE = "M".charCodeAt(0);

/** What the mark-all control would make on this board now, asked of the game's
 * own `interpretMove` on a copy of the `Ui` so the question changes nothing. */
export function markAllNow<S, U, D, R>(
  interpretMove: (s: S, ui: U, ds: D, p: Point, button: number) => R,
  state: S,
  ui: U,
  ds: D,
): R {
  return interpretMove(state, structuredClone(ui), ds, { x: 0, y: 0 }, MARK_ALL_CODE);
}
