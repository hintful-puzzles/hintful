/**
 * The preferences a born fill game offers, each from what its `play`
 * declares: a wash, a cover, highlights, the note-taking cell's, pictures
 * against glyphs, typing along a list, the counts' style and the raised
 * look.
 */

import type { GamePref } from "../contract/game.ts";
import {
  autoPencilPref,
  candidateReadingPref,
  pencilKeepHighlightPref,
  stickyPencilPref,
} from "../hint/pencil-prefs.ts";
import { COUNT_STYLES, countStyleOf } from "./counts.ts";
import type { FillPlay, FillUi } from "./play.ts";

/** A boolean preference on the Ui, by its field. */
const flag = (
  { kw, name }: { readonly kw: string; readonly name: string },
  field: "washedMarks" | "hiddenShown",
): GamePref<FillUi> => ({
  kw,
  name,
  type: "boolean",
  get: (ui) => ui[field],
  set: (ui, v) => {
    ui[field] = v;
  },
});

// A board that keeps notes has these fields on its Ui (`typedUi`).
const noted = <U>(pref: GamePref<U>): GamePref<FillUi> =>
  pref as unknown as GamePref<FillUi>;

/** The preferences of a board played as `play` says, whose module has the
 * `units` and the techniques run as a value is placed (`placing`) given. */
export function fillPrefs(
  module: { readonly units: readonly unknown[]; readonly placing: readonly unknown[] },
  play: FillPlay,
): GamePref<FillUi>[] {
  const notes = play.notes === true;
  return [
    ...(play.wash?.pref === undefined ? [] : [flag(play.wash.pref, "washedMarks")]),
    ...(play.covers === undefined ? [] : [flag(play.covers.pref, "hiddenShown")]),
    ...(play.highlights ?? []).map(
      ({ pref, on }, k): GamePref<FillUi> => ({
        ...pref,
        type: "boolean",
        get: (ui) => ui.highlights?.[k] ?? on,
        set: (ui, v) => {
          ui.highlights ??= (play.highlights ?? []).map((h) => h.on);
          ui.highlights[k] = v;
        },
      }),
    ),
    // A board of features takes notes by its slots, and types nothing a
    // placement or a mode could act on (`features.ts`).
    ...(!notes || play.numbers?.features !== undefined
      ? []
      : [
          // The candidate walk refuses any regions but rows and columns. A
          // board where a placed value rules out none other (no unit, and no
          // technique run as it is placed: Undead's) has nothing to remove.
          ...(module.units.length === 0 && module.placing.length === 0
            ? []
            : [
                noted(
                  autoPencilPref(
                    "When you place a number, remove it from pencil marks in its row and column",
                  ),
                ),
              ]),
          noted(stickyPencilPref()),
          noted(pencilKeepHighlightPref()),
          // Full notes leave no square unnoted for the hint to read.
          ...(play.fullNotes === true ? [] : [noted(candidateReadingPref())]),
        ]),
    ...(play.numbers?.pictures?.pref === undefined
      ? []
      : [
          {
            ...play.numbers.pictures.pref,
            type: "choices",
            choices: [
              "Pictures",
              play.numbers.letters === undefined ? "Numbers" : "Letters",
            ],
            get: (ui: FillUi) => (ui.pictures === false ? 1 : 0),
            set: (ui: FillUi, v: number) => {
              ui.pictures = v === 0;
            },
          } satisfies GamePref<FillUi>,
        ]),
    ...(play.along === undefined
      ? []
      : (
          [
            [play.along.wash, "runWash"],
            [play.along.advance, "advance"],
          ] as const
        ).map(
          ([pref, field]): GamePref<FillUi> => ({
            ...pref,
            type: "boolean",
            get: (ui) => ui[field] !== false,
            set: (ui, v) => {
              ui[field] = v;
            },
          }),
        )),
    ...(play.countStyle === undefined
      ? []
      : [
          {
            ...play.countStyle,
            type: "choices",
            choices: [...COUNT_STYLES],
            get: (ui: FillUi) => countStyleOf(play, ui),
            set: (ui: FillUi, v: number) => {
              ui.countStyle = v;
            },
          } satisfies GamePref<FillUi>,
        ]),
    ...(play.numbers?.raised !== true
      ? []
      : [
          {
            kw: "appearance",
            name: "Puzzle appearance",
            type: "choices",
            choices: ["2D", "3D"],
            get: (ui: FillUi) => (ui.raised === false ? 0 : 1),
            set: (ui: FillUi, v: number) => {
              ui.raised = v === 1;
            },
          } satisfies GamePref<FillUi>,
        ]),
  ];
}
