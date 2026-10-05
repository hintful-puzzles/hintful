/**
 * The premise audit (`firing-replay.ts`): the instrument on a toy solver, then
 * every candidate walk's recorded firings, checked to follow from the premise
 * their steps name (`guard-recorded-firing-premises`).
 */
import { describe, expect, it } from "vitest";
import {
  auditRecordedPremises,
  type CellBoard,
  checkPremise,
  FiringReplay,
  type PremiseAudit,
} from "./firing-replay.ts";
import { randomNew } from "./random/index.ts";
import { enrolledIn, membersNotMentioning } from "./testing/enrollment.ts";
import { type AnyGame, HINT_GAMES } from "./testing/hint-games.ts";
import { dealtBoards } from "./testing/presets.ts";

// --- the instrument ----------------------------------------------------------

/**
 * A row of cells and two techniques. `u` strikes 2 from cell 0 on its own
 * authority, as a clue would; `t` finds the first cell left with one candidate
 * and strikes that value from the cell to its right, so it reads the cell it
 * strikes beside.
 */
function toy(start: number[][]) {
  const w = start.length;
  const bits = (ns: number[]) => ns.reduce((m, n) => m | (1 << n), 0);
  const live: CellBoard = {
    values: new Int32Array(w),
    cands: Int32Array.from(start.map(bits)),
  };
  const techniques: Record<string, (b: CellBoard) => number> = {
    u: (b) => {
      if (!(b.cands[0] & (1 << 2))) return 0;
      b.cands[0] &= ~(1 << 2);
      return 1;
    },
    t: (b) => {
      for (let i = 0; i + 1 < w; i++) {
        const c = b.cands[i];
        if (c & (c - 1) || !(b.cands[i + 1] & c)) continue;
        b.cands[i + 1] &= ~c;
        return 1;
      }
      return 0;
    },
  };
  const copy = (b: CellBoard): CellBoard => ({
    values: b.values.slice(),
    cands: b.cands.slice(),
  });
  const replay = new FiringReplay<string>({
    w,
    h: 1,
    capture: () => copy(live),
    name: (id) => id,
    run: (board, id) => {
      const b = copy(board);
      return () => ({ ret: techniques[id](b), after: copy(b) });
    },
  });
  let group = 0;
  /** Run `id` once on the live board as a recording run would, and say which
   * group it opened. */
  const fire = (id: string): number => {
    replay.before(id);
    replay.open(++group);
    techniques[id](live);
    return group;
  };
  return { replay, fire };
}

const at = (...xs: number[]) => xs.map((x) => ({ x, y: 0 }));
const strike = (x: number, n: number) => ({ kind: "elim" as const, x, y: 0, n });
const audited = (f: () => void): PremiseAudit => auditRecordedPremises(f);

describe("the premise audit's instrument", () => {
  it("passes a firing whose premise names the cell its technique read", () => {
    const { replay, fire } = toy([
      [1, 2],
      [1, 2],
    ]);
    fire("u");
    const g = fire("t");
    const a = audited(() =>
      checkPremise(replay, {
        label: "toy",
        group: g,
        reason: null,
        premise: at(0, 1),
        targets: [strike(1, 1)],
      }),
    );
    expect(a.findings).toEqual([]);
    expect(a.checks).toBe(1);
  });

  it("finds a firing whose premise leaves out a cell another technique set", () => {
    const { replay, fire } = toy([
      [1, 2],
      [1, 2],
    ]);
    fire("u");
    const g = fire("t");
    const a = audited(() =>
      checkPremise(replay, {
        label: "toy",
        group: g,
        reason: null,
        premise: at(1),
        targets: [strike(1, 1)],
      }),
    );
    expect(a.findings).toHaveLength(1);
    expect(a.findings[0]).toMatchObject({ technique: "t", reset: [0], instead: [] });
  });

  it("makes again what the technique re-derives first, and does not count it tested", () => {
    // `t` settles cell 1 from cell 0, then cell 2 from cell 1. Returned to the
    // start, cell 1 is what `t` finds first, so the audit makes that strike and
    // asks again, and cell 1 goes untested: the blind spot the audit counts.
    const { replay, fire } = toy([[1], [1, 2], [1, 2], [1, 2]]);
    fire("t");
    const g = fire("t");
    const a = audited(() =>
      checkPremise(replay, {
        label: "toy",
        group: g,
        reason: null,
        premise: at(2),
        targets: [strike(2, 2)],
      }),
    );
    expect(a.findings).toEqual([]);
    expect(a).toMatchObject({ tested: 0, kept: 1 });
  });

  it("reports a replay that cannot make the recorded firing again", () => {
    const { replay, fire } = toy([
      [1, 2],
      [1, 2],
    ]);
    fire("u");
    const g = fire("t");
    const a = audited(() =>
      checkPremise(replay, {
        label: "toy",
        group: g,
        reason: null,
        premise: at(0, 1),
        targets: [strike(1, 2)],
      }),
    );
    expect(a.unreproduced).toHaveLength(1);
    expect(a.findings).toEqual([]);
  });

  it("checks nothing outside an audit", () => {
    const { replay, fire } = toy([
      [1, 2],
      [1, 2],
    ]);
    fire("u");
    const g = fire("t");
    expect(() =>
      checkPremise(replay, {
        label: "toy",
        group: g,
        reason: null,
        premise: at(1),
        targets: [strike(1, 1)],
      }),
    ).not.toThrow();
  });
});

// --- every candidate walk ------------------------------------------------------

/** The games whose hint is the candidate walk, derived as `hint-frontier.test.ts`
 * derives them. */
const WALK_GAMES: readonly string[] = (() => {
  const ids = HINT_GAMES.map(([id]) => id);
  const without = new Set(membersNotMentioning(ids, "CandidatePlan("));
  return ids.filter((id) => !without.has(id));
})();

/** Both readings for a game whose `Ui` offers the choice, as the frontier guard
 * walks them; otherwise the game's own. */
const OFFERING = enrolledIn((g) => typeof g.ui["candidateReading"] === "string").ids;
const readingsOf = (id: string): readonly (string | null)[] =>
  OFFERING.includes(id) ? ["implicit", "populate"] : [null];

const keyOf = (f: { reason: unknown; technique: string }): string =>
  `${(f.reason as { kind: string }).kind} @ ${f.technique}`;

/**
 * Firings the audit flags although the premise their steps name is the whole
 * of what the conclusion rests on: the technique reads more to decide *whether*
 * to fire, so returning those cells stops it. A replay cannot tell such a gate
 * from a read. Keyed `<id>: <reason kind> @ <technique>`, each pinned to a board
 * that shows it below, and each fix of a `reads` it could hide held by a test
 * of its own (`rome-hint.test.ts`).
 */
const GATED: Record<string, string> = {
  "mathrax: clue @ latin-level-0":
    "Easy strikes a cell's candidates only once every clue at its corners leaves it one digit; the strike rests on the one clue and its partner the step names",
  "mathrax: clue @ latin-level-1": "Normal keeps Easy's gate",
  "rome: reach @ expand":
    "the rung fires only while exactly one mark on the whole board points into any goal's group; the strike rests on this group and its border",
};

/**
 * Firings a game's replay cannot make again from the recorded state, keyed
 * `<id>: <technique>`, and why: a fault of the instrument, so nothing it then
 * says is about the premise. Empty, and still asserting that every replay
 * reproduces its recording.
 */
const UNREPRODUCED: Record<string, string> = {};

/**
 * Games some of whose recordings offer no replay, and why: those firings go
 * unaudited, which the audit reports rather than skips.
 */
const UNREPLAYED: Record<string, string> = {};

/** The boards that show each ledger entry, as the input its technique reads. */
const PINNED: { key: string; id: string; board: string }[] = [
  {
    key: "mathrax: clue @ latin-level-0",
    id: "mathrax",
    board: "5dn:g3q,dS1S2A7aS0dOb",
  },
  {
    key: "mathrax: clue @ latin-level-1",
    id: "mathrax",
    board: "5dt:n3j,cA7bS1S0aA6aS1d",
  },
  {
    key: "rome: reach @ expand",
    id: "rome",
    board:
      "8x8dn:ba4a7a1a5a4b1a9bab4ea1b1aa4d11bd6,bRaRaLcLfLRDRaRaRdRXURaURaLUaUaLURULUaXULRfRaLb",
  },
];

/**
 * Boards a game's sweep adds to its presets' own, each the input for a rung
 * those boards leave the audit unable to test, and each shown to turn the
 * sweep red when that rung's premise is cut short.
 */
const EXTRA_BOARDS: Record<string, readonly string[]> = {
  // `lineFull` without its line: the presets' boards reach no such placement
  // while a tower of its line is still unplaced.
  towers: ["5dh:///3//2//3////2/////2/5/3/"],
};

/** Walk games whose plan records nothing, so nothing is offered by premise. */
const RECORDS_NOTHING: Record<string, string> = {
  abcd: "its rungs are its own and read the board",
  seismic: "its rungs are its own and read the board",
};

/**
 * Games whose replay tests no cell at all, and why: every cell outside a
 * premise was set by the same rung, which re-derives it before reaching the
 * firing ({@link PremiseAudit.kept}).
 */
const UNTESTED: Record<string, string> = {};

/** Each preset's board, generated once for both readings: generation, not the
 * audit, is most of what this sweep costs (Solo's 2×3 Hard alone). */
const descs = new Map<string, string>();
function descOf(
  id: string,
  game: AnyGame,
  p: { title: string; params: unknown },
): string {
  const key = `${id}|${p.title}`;
  let desc = descs.get(key);
  if (desc === undefined) {
    desc = game.newDesc(p.params, randomNew(`premise-${p.title}`)).desc;
    descs.set(key, desc);
  }
  return desc;
}

/** A `<params>:<desc>` board, decoded. */
const boardOf =
  (game: AnyGame) =>
  (board: string): { params: unknown; desc: string } => {
    const colon = board.indexOf(":");
    return {
      params: game.decodeParams(board.slice(0, colon)),
      desc: board.slice(colon + 1),
    };
  };

function gameOf(id: string): AnyGame {
  const game = HINT_GAMES.find(([g]) => g === id)?.[1];
  if (!game) throw new Error(`${id} is not a hint game`);
  return game;
}

describe("a recorded firing follows from the premise its steps name", () => {
  it("finds the games whose hint is the candidate walk", () => {
    expect(WALK_GAMES).toContain("towers");
    expect(WALK_GAMES.length).toBeGreaterThan(5);
    for (const key of [...Object.keys(GATED), ...Object.keys(UNREPRODUCED)])
      expect(WALK_GAMES, key).toContain(key.split(":")[0]);
    for (const id of [
      ...Object.keys(UNTESTED),
      ...Object.keys(UNREPLAYED),
      ...Object.keys(RECORDS_NOTHING),
    ])
      expect(WALK_GAMES).toContain(id);
  });

  it("pins every gate to a board", () => {
    expect(PINNED.map((p) => p.key).sort()).toEqual(Object.keys(GATED).sort());
  });

  for (const { key, id, board } of PINNED) {
    it(`${id}: the board pinned for "${key}" still shows it`, () => {
      const game = gameOf(id);
      const { params, desc } = boardOf(game)(board);
      const state = game.newState(params, desc);
      const a = auditRecordedPremises(() => {
        game.hint?.(state, undefined, undefined);
      });
      const keys = new Set([
        ...a.findings.map((f) => `${id}: ${keyOf(f)}`),
        ...a.unreproduced.map((u) => `${id}: ${u.technique}`),
      ]);
      expect([...keys]).toContain(key);
    });
  }

  for (const id of WALK_GAMES) {
    for (const reading of readingsOf(id)) {
      const label = reading ? `${id}/${reading}` : id;
      it(`${id}: every firing ${label}'s plans offer follows from its premise`, () => {
        const game = gameOf(id);
        const audits: PremiseAudit[] = [];
        const boards = [
          ...dealtBoards(game, { every: true }).map((p) => ({
            params: p.params,
            desc: descOf(id, game, p),
          })),
          ...(EXTRA_BOARDS[id] ?? []).map(boardOf(game)),
        ];
        for (const { params, desc } of boards) {
          const state = game.newState(params, desc);
          const ui = reading
            ? { ...(game.newUi(state) as object), candidateReading: reading }
            : undefined;
          audits.push(auditRecordedPremises(() => game.hint?.(state, undefined, ui)));
          // A plan recording nothing on its first board records nothing at all.
          if (audits[0].recordings === 0) break;
        }
        const sum = (f: (a: PremiseAudit) => number) =>
          audits.reduce((n, a) => n + f(a), 0);
        // Exactly the ledgered games, so an entry goes when its game records.
        expect(sum((a) => a.recordings) === 0, RECORDS_NOTHING[id] ?? "records").toBe(
          id in RECORDS_NOTHING,
        );
        // Exactly the ledgered games, so an entry goes when its game replays.
        expect(
          audits.some((a) => a.unreplayed.size > 0),
          UNREPLAYED[id] ?? "a recording no replay audits",
        ).toBe(id in UNREPLAYED);
        for (const f of audits.flatMap((a) => a.findings)) {
          const key = `${id}: ${keyOf(f)}`;
          expect(GATED, `${key}: ${JSON.stringify(f)}`).toHaveProperty([key]);
        }
        for (const u of audits.flatMap((a) => a.unreproduced))
          expect(UNREPRODUCED, `${id}: ${u.technique}`).toHaveProperty([
            `${id}: ${u.technique}`,
          ]);
        if (id in RECORDS_NOTHING) return;
        const tested = sum((a) => a.tested);
        if (id in UNTESTED) expect(tested, UNTESTED[id]).toBe(0);
        else expect(tested, "cells the audit actually returned").toBeGreaterThan(0);
      });
    }
  }
});
