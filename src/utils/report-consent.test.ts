// @vitest-environment happy-dom
/*
 * "Nothing is sent unless you choose to send it" — the privacy notes' promise,
 * checked against the real `initSentry` with every integration it installs,
 * rather than against the gate on its own. A gate that works while the app's
 * init routes around it would pass a unit test of the gate.
 *
 * The inner transport is a recorder: whatever reaches it is what would have
 * left the device.
 */
import * as Sentry from "@sentry/browser";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { reportConsent } from "./report-consent.ts";
import { initSentry } from "./sentry.ts";

type TransportFactory = NonNullable<Parameters<typeof initSentry>[0]>;

/** The item types of each envelope that reached the network. */
const sent: string[][] = [];

const recordingTransport: TransportFactory = () => ({
  send: async (envelope) => {
    const types: string[] = [];
    for (const [header] of envelope[1]) {
      types.push(header.type);
    }
    sent.push(types);
    return { statusCode: 200 };
  },
  flush: async () => true,
});

beforeAll(() => {
  vi.stubEnv("VITE_SENTRY_DSN", "https://public@o0.ingest.de.sentry.io/1");
  initSentry(recordingTransport);
});

afterEach(() => {
  reportConsent.discard();
  sent.length = 0;
});

afterAll(async () => {
  // `isolate: false` shares this module graph with other files in the worker.
  await Sentry.close();
  vi.unstubAllEnvs();
});

describe("a crash report leaves the device only with consent", () => {
  it("initialized a real client, without session tracking", () => {
    const client = Sentry.getClient();
    expect(client).toBeDefined();
    // Known positive first, so an absent lookup means something.
    expect(client?.getIntegrationByName("GlobalHandlers")).toBeDefined();
    expect(client?.getIntegrationByName("BrowserSession")).toBeUndefined();
  });

  it("holds a captured error instead of sending it", async () => {
    Sentry.captureException(new Error("boom"));
    await Sentry.flush(2000);
    // Vacuity guard: the event reached the transport rather than being filtered.
    expect(reportConsent.heldCount).toBe(1);
    expect(sent).toEqual([]);
  });

  it("sends exactly what was held once the player agrees", async () => {
    Sentry.captureException(new Error("boom"));
    await Sentry.flush(2000);
    await reportConsent.release();
    expect(sent).toEqual([["event"]]);
    expect(reportConsent.heldCount).toBe(0);
  });

  it("sends nothing ever for a report the player declined", async () => {
    Sentry.captureException(new Error("boom"));
    await Sentry.flush(2000);
    reportConsent.discard();
    await reportConsent.release();
    expect(sent).toEqual([]);
  });

  it("sends the player's note, which only the Send button creates", async () => {
    await Sentry.sendFeedback({ message: "I pressed undo" });
    expect(sent).toEqual([["feedback"]]);
  });
});
