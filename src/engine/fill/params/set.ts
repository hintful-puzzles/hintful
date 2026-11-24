/** A setting that is some of its members, each a kind of clue the deal
 * deals (upstream mathrax.c's clue types). */

import type { ParamConfigItem } from "../../contract/game.ts";
import type { FillDeal, FillParams } from "../game-id.ts";
import {
  dealValue,
  type SettingBase,
  type SettingKind,
  setDealValue,
} from "./setting.ts";

/** A member: the clue kind it deals, its letter, its Custom check box, and
 * what a board's name calls it. */
export interface SetMember
  extends Readonly<
    Record<"letter" | "kind" | "kw" | "name" | "doc" | "word", string>
  > {}

/** Some of `members`, held as a bitmask in their order, every one on by
 * default. A full ID alone writes it, as the letters of those on in their
 * order, and only where one is off: nothing is every member. */
export interface SetSetting extends SettingBase {
  readonly kind: "set";
  readonly members: readonly SetMember[];
}

const every = (s: SetSetting): number => (1 << s.members.length) - 1;

/** Whether member `i` of `s` is on for board `p`. */
const isOn = (s: SetSetting, p: FillParams, i: number): boolean =>
  (dealValue(p, s.id, every(s)) & (1 << i)) !== 0;

/** The clue kinds board `p` deals of the deal's set, in its members' order;
 * `null` where the deal has none, and so deals every kind. */
export function kindsOn(deal: FillDeal, p: FillParams): readonly string[] | null {
  const s = deal.settings.find((x): x is SetSetting => x.kind === "set");
  return s === undefined
    ? null
    : s.members.filter((_, i) => isOn(s, p, i)).map((m) => m.kind);
}

/** Why board `p` cannot have set `s` as it is: no member on, in a full ID,
 * which alone writes it. */
export const setRefusal = (
  s: SetSetting,
  p: FillParams,
  full: boolean,
): string | null =>
  full && dealValue(p, s.id, every(s)) === 0
    ? "At least one clue type must be enabled."
    : null;

export const set: SettingKind<SetSetting> = {
  // The first carries a board name's words for them all: which are on or
  // which are off, whichever list is shorter, and nothing where every one is
  // on.
  items(s) {
    const words = (p: FillParams): string | null => {
      const said = (yes: boolean) =>
        s.members.filter((_, i) => isOn(s, p, i) === yes).map((m) => m.word);
      const [shown, hidden] = [said(true), said(false)];
      if (hidden.length === 0) return null;
      return shown.length <= hidden.length
        ? `only ${shown.join("/")}`
        : `no ${hidden.join("/")}`;
    };
    return s.members.map(
      (m, i): ParamConfigItem<FillParams> => ({
        kw: m.kw,
        name: m.name,
        type: "boolean",
        doc: m.doc,
        ...(i === 0 ? { label: { slot: "tail" as const, words } } : {}),
        get: (p) => isOn(s, p, i),
        set: (p, v) => {
          const now = dealValue(p, s.id, every(s));
          setDealValue(p, s.id, v ? now | (1 << i) : now & ~(1 << i));
        },
      }),
    );
  },
  segments(s) {
    return {
      here: [
        {
          encode: (p, full) => {
            if (!full || dealValue(p, s.id, every(s)) === every(s)) return "";
            return s.members
              .filter((_, i) => isOn(s, p, i))
              .map((m) => m.letter)
              .join("");
          },
          decode: (str, i, p) => {
            let on = 0;
            s.members.forEach((m, k) => {
              if (str[i] === m.letter) {
                on |= 1 << k;
                i++;
              }
            });
            setDealValue(p, s.id, on === 0 ? every(s) : on);
            return i;
          },
        },
      ],
    };
  },
  start(s, p) {
    setDealValue(p, s.id, every(s));
  },
};
