/**
 * Sokoban's search (`strengthen-the-sokoban-solver`): that what it prunes is
 * only ever lost, and that it reaches the boards it was strengthened for.
 */

import { describe, expect, it } from "vitest";
import { randomNew, randomUpto } from "../../engine/random/index.ts";
import { dealtLevel, sokobanLevel } from "./generator.ts";
import { sokobanGame } from "./index.ts";
import {
  type Position,
  type Push,
  SokobanBoard,
  search,
  searchFrom,
} from "./solver.ts";
import {
  BARREL,
  BARRELTARGET,
  encodeBoard,
  type SokobanState,
  SPACE,
  TARGET,
  WALL,
} from "./state.ts";

/** A board from a drawing: `#` wall, `$` barrel, `.` target, `*` a barrel on
 * one, `@` the player. */
function drawn(...rows: string[]): SokobanState {
  const w = rows[0].length;
  const codes: Record<string, number> = {
    "#": WALL,
    " ": SPACE,
    "@": SPACE,
    $: BARREL,
    ".": TARGET,
    "*": BARRELTARGET,
  };
  const art = rows.join("");
  const at = art.indexOf("@");
  return {
    w,
    h: rows.length,
    grid: Uint8Array.from(art, (ch) => codes[ch]),
    px: at % w,
    py: Math.floor(at / w),
  };
}

/** Whether some line of pushes finishes from `p`, trying every push there
 * is: no position is pruned but one already seen. */
function finishes(board: SokobanBoard, p: Position): boolean {
  const seen = new Set<string>([board.key(p)]);
  const todo = [p];
  for (let cur = todo.pop(); cur; cur = todo.pop()) {
    if (board.solved(cur)) return true;
    for (const push of board.pushes(cur)) {
      const next = board.apply(cur, push);
      const key = board.key(next);
      if (seen.has(key)) continue;
      seen.add(key);
      todo.push(next);
    }
  }
  return false;
}

const pushesOf = (board: SokobanBoard, s: SokobanState, corral: boolean) => {
  const p = board.positionOf(s);
  return (corral ? board.searchPushes(p, true) : board.pushes(p)).map(
    ({ barrel, dir }: Push) => `${barrel % s.w},${Math.floor(barrel / s.w)}>${dir}`,
  );
};

describe("the pushes worth searching", () => {
  it("are only those into a corral that has to be opened", () => {
    // Each barrel shuts a corridor with an empty target in it, and can only
    // go in. Either corridor will do, and the first is taken.
    const s = drawn("#########", "#@  $  .#", "# #######", "# $    .#", "#########");
    const board = new SokobanBoard(s);
    expect(pushesOf(board, s, false)).toEqual(["4,1>2", "2,3>2"]);
    expect(pushesOf(board, s, true)).toEqual(["4,1>2"]);
  });

  it("are every push where the corral can be left shut", () => {
    // The barrel in the doorway is on its target and nothing behind it is
    // wanted, so a line need never open it.
    const s = drawn(
      "########",
      "#  *  ##",
      "#  #####",
      "#      #",
      "# @$ . #",
      "#      #",
      "########",
    );
    const board = new SokobanBoard(s);
    expect(pushesOf(board, s, true)).toEqual(pushesOf(board, s, false));
    expect(pushesOf(board, s, true)).toContain("3,1>2");
    expect(pushesOf(board, s, true).length).toBe(5);
  });

  it("are every push where a fence barrel can be pushed some way but in", () => {
    // The barrel beside the pocket can also be pushed along the wall.
    const s = drawn("#######", "#  @  #", "#  $  #", "# #.# #", "#######");
    const board = new SokobanBoard(s);
    expect(pushesOf(board, s, true)).toEqual(pushesOf(board, s, false));
    expect(pushesOf(board, s, true).length).toBeGreaterThan(1);
  });
});

describe("the search's verdicts", () => {
  it("agree with trying every push, on boards small enough to try them", () => {
    const tally = { finishes: 0, lost: 0, corralled: 0, positions: 0 };
    for (let seed = 0; seed < 40; seed++) {
      const rng = randomNew(`small${seed}`);
      const s = sokobanLevel({ w: 6, h: 7 }, rng);
      const board = new SokobanBoard(s);
      let p = board.positionOf(s);
      // A walk of pushes picked blind, so that most of it is lost.
      for (let step = 0; step < 12; step++) {
        const truth = finishes(board, p);
        const found = searchFrom(board, p, 1_000_000, { left: Infinity });
        expect(found.kind, `small${seed} after ${step} pushes`).toBe(
          truth ? "found" : "lost",
        );
        if (found.kind === "found") {
          // The line is the board's to play, and finishes it.
          let end = p;
          for (const push of found.pushes) {
            expect(board.pushes(end)).toContainEqual(push);
            end = board.apply(end, push);
          }
          expect(board.solved(end)).toBe(true);
        }
        tally.positions++;
        tally[truth ? "finishes" : "lost"]++;
        const pushes = board.pushes(p);
        if (board.exact && board.searchPushes(p, true).length < pushes.length)
          tally.corralled++;
        if (pushes.length === 0) break;
        p = board.apply(p, pushes[randomUpto(rng, pushes.length)]);
      }
    }
    // What the agreement was taken over: both verdicts, and positions whose
    // pushes the corral rule cut down.
    expect(tally.finishes).toBeGreaterThan(50);
    expect(tally.lost).toBeGreaterThan(50);
    expect(tally.corralled).toBeGreaterThan(20);
  });
});

describe("a deal", () => {
  const p = { w: 16, h: 20 };

  it("passes over a level the search cannot finish in the deal's budget", () => {
    // The premise is asserted, so a generator that stops making this level
    // fails here and not in silence.
    const first = sokobanLevel(p, randomNew("b1"));
    expect(search(first, 20_000).kind).toBe("out-of-reach");
    const dealt = dealtLevel(p, randomNew("b1"));
    expect(encodeBoard(dealt)).not.toBe(encodeBoard(first));
    expect(search(dealt, 20_000).kind).toBe("found");
  });

  it("ends at its eighth level, dealt as it is, where the search finishes none", () => {
    // No budget at all: every level is passed over.
    const rng = randomNew("no-budget");
    let eighth = sokobanLevel(p, rng);
    for (let i = 1; i < 8; i++) eighth = sokobanLevel(p, rng);
    const dealt = dealtLevel(p, randomNew("no-budget"), 0);
    expect(encodeBoard(dealt)).toBe(encodeBoard(eighth));
  });
});

describe("the search's reach", () => {
  // Openings of generated 16×20 levels that the search could not finish
  // within 300,000 positions before it ranked pushes by how far they are from
  // a barrel or target still out of place (2026-10-04). Positions are
  // counted, never timed, so this is the same on every machine.
  const OPENINGS = [
    "16x20:w20s4tst2w8bs2bsfb2stw3t2btsts5bwtw2bswbtbsbs4tsw2s2tbs2btsbfsbsw3ts3bts4tb2w2tbs4ts2ts2fuw2bs3wt2fbst2b2w2stbs3bs2bts3w3sbtsbs4b2tsw3s2bt2bstbt2stw2s2tw3sfs4bsw2bsbt2wts2fbstbw2tbsbsfsbs4t2w2ts4bts4bwtw2btbsbsbsbts2tbw2stb2sbstbs3bsw2ts2ts3t2sbts2w17",
    "16x20:w20s2wtw2tftbsw3sb2s3wt2bs3w3s2ts2bsb2s2fsw2sts2ts6fubw2sbtbts2ws2bsbtw2t2bs3fstststw3bs3bs2bstbsbtw2s2ws5btws2tw2tsbts3btwtfsbw3s2b2s2fs4bsw2tbst2s4bs2fsw2tbswbswswtswbsw3tfs4btsbt3w4bs2wb2sbs3bw4s2ts2ts3tbsw2ts7fs3t2w2bsbfbtbwtbsbtbw2s2wtw2tw3tbs2w17",
    "16x20:w18s3tstsbtw2s2w2sfs2bsbs5btw2tbs3bs2wsbts2w2s3t2stfs6w2sbtbfs2bfsbswsw2stwbubstwtst2bw2sws2fsbswbsbfsw2sws2tst2s2t2btw2sts2bs2wbsbws2w2s2ws4ws5bw2sbtbsbtbsws3tw2s2btstws2bfsfw3sbts2wtbtsfts2w2s2tws3ts2tsb2w3b2tswb2stb2t2w2tbsbs9w4ts3bsws5w3tbs2tbtwtbs2btw17",
  ];
  for (const [i, id] of OPENINGS.entries()) {
    it(`finishes opening ${i + 1} within 30,000`, () => {
      const [params, desc] = id.split(":");
      const s = sokobanGame.newState(sokobanGame.decodeParams(params), desc);
      expect(search(s, 30_000).kind).toBe("found");
    });
  }
});
