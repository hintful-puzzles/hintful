import * as Sentry from "@sentry/browser";
import { reportConsent } from "./report-consent.ts";

// This is a shorter version of the ignoreErrors list in crash-dialog.
// (Sentry ignores many errors by default. Also there are some where
// we don't want to show the crash-dialog but we *do* want Sentry capture.)
const ignoreErrors: (string | RegExp)[] = [
  "Network error: Response body loading was aborted",
  // Chrome iOS "Translate" bug (in anonymous script):
  /^RangeError: Maximum call stack size exceeded.*at \?.*undefined:/,
  /^RangeError: Maximum call stack size exceeded.*at findTopmostVisibleElement/,
  // Older Chrome bugs (e.g., Huawei Browser 16.0.9 on Android 10)
  "ResizeObserver loop limit exceeded",
  "Failed to execute 'hidePopover' on 'HTMLElement': Invalid on popover elements that aren't already showing.",
];

/**
 * Default integrations that send what the privacy notes do not describe:
 * session tracking reports every page load, and the culture context sends the
 * player's timezone and locale.
 */
const OMITTED_INTEGRATIONS = new Set(["BrowserSession", "CultureContext"]);

/** `makeTransport` is a parameter so a test can see what would leave the device. */
export function initSentry(
  makeTransport = Sentry.makeBrowserOfflineTransport(Sentry.makeFetchTransport),
) {
  if (import.meta.env.VITE_SENTRY_DSN) {
    const integrations = import.meta.env.VITE_SENTRY_FILTER_APPLICATION_ID
      ? [
          Sentry.thirdPartyErrorFilterIntegration({
            filterKeys: [import.meta.env.VITE_SENTRY_FILTER_APPLICATION_ID],
            // don't use "drop-if" here -- see beforeSend below.
            behaviour: "apply-tag-if-contains-third-party-frames",
          }),
        ]
      : [];

    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      sendDefaultPii: false,
      release: import.meta.env.VITE_GIT_SHA,
      // Nothing leaves the device until the player chooses to send a report;
      // the crash dialog asks. See `report-consent.ts`.
      transport: reportConsent.gate(makeTransport),
      // Not a crash report, and the privacy notes promise that nothing is sent
      // when nothing goes wrong: client reports count events the SDK dropped.
      sendClientReports: false,
      integrations: (defaults) => [
        ...defaults.filter(
          (integration) => !OMITTED_INTEGRATIONS.has(integration.name),
        ),
        ...integrations,
      ],
      ignoreErrors,
      beforeBreadcrumb(breadcrumb, hint) {
        // The SDK records each captured error as a breadcrumb on the next
        // report, and the player may have declined to send that error.
        if (breadcrumb.category === "sentry.event") {
          return null;
        }
        try {
          // Skip breadcrumbs for fetch("data:...") URIs (like all of our icon images)
          if (
            breadcrumb.type === "http" &&
            typeof breadcrumb.data?.["url"] === "string" &&
            breadcrumb.data["url"].startsWith("data:")
          ) {
            return null;
          }
          // Replace ui.click message "body > top-component" with shadow path
          if (breadcrumb.category === "ui.click" && hint?.["event"] instanceof Event) {
            breadcrumb.message = describeEventComposedPath(hint["event"]);
          }
        } catch {}
        return breadcrumb;
      },
      beforeSend(event, hint) {
        // If thirdPartyErrorFilterIntegration identified third_party_code,
        // mark the original error instance for crash-dialog to ignore.
        if (event.tags?.["third_party_code"]) {
          if (hint?.originalException instanceof Error) {
            // @ts-expect-error: TS2339: Adding custom property to Error object
            hint.originalException.__third_party_code__ = true;
          }
          // For drop-if-contains-third-party-frames, return null here.
        }
        return event;
      },
    });

    // Add some additional context (synchronously) to all events.
    Sentry.addEventProcessor((event, _hint) => {
      try {
        const root = document.documentElement;
        const rootStyle = getComputedStyle(root);
        const viewport = window.visualViewport;
        event.contexts = {
          ...event.contexts,
          Display: {
            "Window Size": `${window.innerWidth}x${window.innerHeight}`,
            "Document Size": `${root.clientWidth}x${root.clientHeight}`,
            "Visual Viewport": viewport
              ? `${viewport.width}x${viewport.height}`
              : "n/a",
            DPR: window.devicePixelRatio,
            "Dark Mode": window.matchMedia("(prefers-color-scheme: dark)").matches,
            "Touch Points": navigator.maxTouchPoints,
            "Root Font Size": rootStyle.fontSize,
            Direction: rootStyle.direction,
          },
        };
      } catch {}
      return event;
    });
  }
}

/**
 * Return a CSS-selector-ish description of the element,
 * including tag name, #id, .class.names, and [attr="value"]
 * for a handful of descriptive attributes.
 */
function describeElement(el: Element, skipClasses = false) {
  const parts = [el.tagName.toLowerCase()];
  if (el.id) {
    parts.push(`#${el.id}`);
  }
  if (!skipClasses) {
    parts.push(...Array.from(el.classList).map((cls) => `.${cls}`));
  }
  for (const attr of ["data-command", "href", "label"]) {
    const value = el.getAttribute(attr);
    if (value) {
      parts.push(`[${attr}="${value}"]`);
    }
  }
  return parts.join("");
}

// describeEventComposedPath won't dive into these elements
const primitiveElements = new Set(
  [
    "button",
    "wa-button",
    "wa-checkbox",
    "wa-dropdown-item",
    "wa-option",
    "wa-radio",
    "wa-slider",
  ].map((tagName) => tagName.toUpperCase()),
);

/**
 * Return a '<' separated list of CSS-selector-ish descriptions of the elements
 * in event's composed path, starting with the innermost primitive element.
 */
function describeEventComposedPath(event: Event) {
  const composedPathElements = event
    .composedPath()
    .filter((el) => el instanceof Element)
    .reverse();
  const descriptions: string[] = [];
  for (const el of composedPathElements) {
    if (el.tagName === "SLOT") {
      continue;
    }
    // Skip class names for wa-button, which gets a *lot* of them in a wa-button-group.
    const description = describeElement(el, el.tagName === "WA-BUTTON");
    if (primitiveElements.has(el.tagName)) {
      // There is little value in digging into wa-button and similar
      // shadow DOMs. Just extract the text label (or icon button label).
      const label =
        el.textContent.trim().replace(/\s+/g, " ") ||
        el.querySelector("wa-icon[label]")?.getAttribute("label");
      if (label) {
        descriptions.push(`${description}{${label.slice(0, 20)}}`);
        break;
      }
    }
    descriptions.push(description);
  }
  return descriptions.reverse().join(" < ");
}
