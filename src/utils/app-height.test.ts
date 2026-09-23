// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from "vitest";
import { trackAppHeight } from "./app-height.ts";

describe("trackAppHeight", () => {
  let stop: (() => void) | null = null;
  afterEach(() => stop?.());

  it("sets --app-height to the window's height, and follows a resize", () => {
    const root = document.createElement("div");
    window.innerHeight = 700;
    stop = trackAppHeight(root);
    expect(root.style.getPropertyValue("--app-height")).toBe("700px");

    window.innerHeight = 640;
    window.dispatchEvent(new Event("resize"));
    expect(root.style.getPropertyValue("--app-height")).toBe("640px");
  });
});
