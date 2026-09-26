/**
 * Observe what a real `Midend` reports: the notifications it emits, whether it
 * wants the animation clock, and how often it asks for a repaint.
 *
 * `renderScenario` answers "what does this frame look like"; this answers
 * "what did the midend tell the app". The two sit beside each other rather
 * than one under the other because a test wants one question or the other,
 * and `renderScenario` needs no callbacks at all.
 *
 * Dev/test-only; never imported by production code.
 */

import type { Game } from "../game.ts";
import { Midend } from "../midend.ts";
import type { ChangeNotification } from "../types.ts";

/** The notification whose `type` is `T`. */
export type Notification<T extends ChangeNotification["type"]> = Extract<
  ChangeNotification,
  { type: T }
>;

export interface ObservedMidend<Params, State, Move, Ui, DrawState> {
  midend: Midend<Params, State, Move, Ui, DrawState>;
  /** Every notification, oldest first. A test may clear it (`notes.length = 0`)
   * to look only at what follows. */
  notes: ChangeNotification[];
  /** The most recent notification of `type`, or null if none was sent. */
  last<T extends ChangeNotification["type"]>(type: T): Notification<T> | null;
  /** Whether the midend last asked for the animation clock to run. */
  timerActive(): boolean;
  /** How many times the midend has asked for a repaint. */
  redraws(): number;
}

/** Attach the observer to a midend the test already holds, replacing any
 * callbacks it had. */
export function observeMidend<Params, State, Move, Ui, DrawState>(
  midend: Midend<Params, State, Move, Ui, DrawState>,
): ObservedMidend<Params, State, Move, Ui, DrawState> {
  const notes: ChangeNotification[] = [];
  let timerActive = false;
  let redraws = 0;
  midend.setCallbacks(
    (n) => notes.push(n),
    (active) => {
      timerActive = active;
    },
    () => {
      redraws++;
    },
  );
  return {
    midend,
    notes,
    last<T extends ChangeNotification["type"]>(type: T): Notification<T> | null {
      for (let i = notes.length - 1; i >= 0; i--) {
        const n = notes[i];
        if (isType(n, type)) return n;
      }
      return null;
    },
    timerActive: () => timerActive,
    redraws: () => redraws,
  };
}

/** A fresh midend over `game`, observed from construction. No game is dealt:
 * the test chooses `newGame()` or `newGameFromId(...)`. */
export function driveMidend<Params, State, Move, Ui, DrawState, Mistake>(
  game: Game<Params, State, Move, Ui, DrawState, Mistake>,
): ObservedMidend<Params, State, Move, Ui, DrawState> {
  return observeMidend(new Midend(game));
}

function isType<T extends ChangeNotification["type"]>(
  n: ChangeNotification,
  type: T,
): n is Notification<T> {
  return n.type === type;
}
