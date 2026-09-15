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
/** Each event item that reached the network, serialized. */
const sentEvents: string[] = [];

const recordingTransport: TransportFactory = () => ({
  send: async (envelope) => {
    const types: string[] = [];
    for (const [header, payload] of envelope[1]) {
      types.push(header.type);
      if (header.type === "event") {
        sentEvents.push(JSON.stringify(payload));
      }
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
  sentEvents.length = 0;
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

  it("carries no trace of a declined report inside one the player sends", async () => {
    // Found on the deployed site: the SDK's own breadcrumb for the declined
    // error rode along in the next report.
    Sentry.captureException(new Error("Declined-4f1c"));
    await Sentry.flush(2000);
    reportConsent.discard();
    Sentry.captureException(new Error("Sent-4f1c"));
    await Sentry.flush(2000);
    await reportConsent.release();
    expect(sentEvents).toHaveLength(1);
    expect(sentEvents[0]).toContain("Sent-4f1c");
    expect(sentEvents[0]).not.toContain("Declined-4f1c");
  });

  it("sends the screen it happened on, but not the player's timezone or locale", async () => {
    Sentry.captureException(new Error("boom"));
    await Sentry.flush(2000);
    await reportConsent.release();
    expect(sentEvents).toHaveLength(1);
    // Known positive: a context the notes do describe.
    expect(sentEvents[0]).toContain('"Display"');
    expect(sentEvents[0]).not.toContain('"culture"');
    expect(sentEvents[0]).not.toMatch(/timezone|locale/);
  });

  it("sends the player's note, which only the Send button creates", async () => {
    await Sentry.sendFeedback({ message: "I pressed undo" });
    expect(sent).toEqual([["feedback"]]);
  });
});
