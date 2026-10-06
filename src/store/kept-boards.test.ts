// The kept-board store against fake-indexeddb. The setup import comes first,
// so the global `indexedDB` is in place when the store opens its database.
import "../test-setup/indexeddb.ts";
import { beforeEach, describe, expect, it } from "vitest";
import type { DealtBoard } from "../engine/types.ts";
import { KeptBoards } from "./kept-boards.ts";

const board = (params: string, desc: string): DealtBoard => ({
  params,
  desc,
  aux: `aux of ${desc}`,
});

describe("kept boards", () => {
  const store = new KeptBoards("build-1");
  beforeEach(() => store.clear());

  it("hands a kept board over once", async () => {
    await store.keep("group", board("6dh", "first"));
    expect(await store.has("group", "6dh")).toBe(true);
    expect(await store.take("group", "6dh")).toEqual(board("6dh", "first"));
    expect(await store.has("group", "6dh")).toBe(false);
    expect(await store.take("group", "6dh")).toBeNull();
  });

  it("keeps a board for each type of each puzzle", async () => {
    await store.keep("group", board("6dh", "a"));
    await store.keep("group", board("8dx", "b"));
    await store.keep("keen", board("6dh", "c"));
    expect((await store.take("group", "8dx"))?.desc).toBe("b");
    expect((await store.take("keen", "6dh"))?.desc).toBe("c");
    expect((await store.take("group", "6dh"))?.desc).toBe("a");
  });

  it("keeps the later of two boards for one type", async () => {
    await store.keep("group", board("6dh", "older"));
    await store.keep("group", board("6dh", "newer"));
    expect((await store.take("group", "6dh"))?.desc).toBe("newer");
  });

  it("reads another build's board as absent, and takes it out of the way", async () => {
    await store.keep("group", board("6dh", "old solver's"));
    const next = new KeptBoards("build-2");
    expect(await next.has("group", "6dh")).toBe(false);
    expect(await next.take("group", "6dh")).toBeNull();
    // The refused row is gone for the build that wrote it too.
    expect(await store.has("group", "6dh")).toBe(false);
  });

  it("clears every other build's boards when it keeps one", async () => {
    await store.keep("group", board("6dh", "stale"));
    await store.keep("keen", board("5", "stale too"));
    const next = new KeptBoards("build-2");
    await next.keep("group", board("8dx", "fresh"));
    expect(await store.has("group", "6dh")).toBe(false);
    expect(await store.has("keen", "5")).toBe(false);
    expect(await next.has("group", "8dx")).toBe(true);
  });
});
