/**
 * What a click on a board of buttons does to a square (`play.click`): a
 * toggle of the button's value with empty, or a cycle round empty and the
 * values the button goes round, from the value the square holds.
 */

/** The values each button goes round after empty (`FillPlay.click`). */
export interface ClickCycles {
  readonly primary: readonly number[];
  readonly secondary: readonly number[];
}

export type Button = "primary" | "secondary";

/** What a click reads of `play`. */
interface ClickPlay {
  readonly click?: "toggle" | "cycle" | ClickCycles;
  readonly values: Readonly<Record<number, { readonly does: string }>>;
  readonly primary: number;
  readonly secondary: number;
}

/** A board's click: each button's next value from a square's, the words its
 * verb says, and the button whose click passes through a value. */
export interface Click {
  next(button: Button, v: number): number;
  does(button: Button): string;
  buttonOf(value: number): Button;
}

export function clickOf(play: ClickPlay): Click {
  const { primary, secondary } = play;
  const own = (button: Button) => (button === "primary" ? primary : secondary);
  const toggleWords = (value: number) =>
    `${play.values[value].does}, or empty it if it is already filled`;
  const cycles: ClickCycles | null =
    typeof play.click === "object"
      ? play.click
      : play.click === "cycle"
        ? { primary: [primary, secondary], secondary: [secondary, primary] }
        : null;
  if (cycles === null)
    return {
      next: (button, v) => (v === 0 ? own(button) : 0),
      does: (button) => toggleWords(own(button)),
      buttonOf: (value) => (value === secondary ? "secondary" : "primary"),
    };
  return {
    // Empty goes to the first, each value to the next and the last to
    // empty; a value the list does not name stays.
    next(button, v) {
      const list = cycles[button];
      if (v === 0) return list[0];
      const i = list.indexOf(v);
      return i < 0 ? v : (list[i + 1] ?? 0);
    },
    does(button) {
      const list = cycles[button];
      if (typeof play.click !== "object") return play.values[own(button)].does;
      if (list.length === 1) return toggleWords(list[0]);
      return [
        play.values[list[0]].does,
        ...list.slice(1).map((v) => `again, ${play.values[v].does}`),
        "and again, empty it",
      ].join("; ");
    },
    buttonOf: (value) => (cycles.primary.includes(value) ? "primary" : "secondary"),
  };
}
