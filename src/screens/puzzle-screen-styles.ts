/** The puzzle screen's styles (`puzzle-screen.ts`). */

import { css } from "lit";
import { cssWATweaks } from "../utils/css.ts";

export const puzzleScreenStyles = [
  cssWATweaks,
  css`
    :host {
      display: block;
      box-sizing: border-box;
      /* Dynamic viewport units Baseline 2023 */
      width: 100vw;
      height: 100vh;
      width: 100dvw;
      /* The window's measured height; see utils/app-height.ts. */
      height: var(--app-height, 100dvh);
    }
    
    /*
     * One grid, whose template the layout settings choose and renderPanels
     * writes on the element. Each region below names its area and nothing
     * else: where a panel docks is never decided here.
     *
     * The board's row and column are the ones that flex, so the canvas fills
     * what the panels leave. No region but the Menu scrolls.
     */
    main {
      height: 100%;
      box-sizing: border-box;
      display: grid;
      overflow: hidden;
      background-color: var(--wa-color-brand-fill-quiet);
      color: var(--wa-color-text-normal);
    }

    .top-bar {
      grid-area: top;
    }
    .board-area {
      grid-area: board;
    }
    .words {
      grid-area: words;
    }
    puzzle-game-controls {
      grid-area: controls;
    }
    puzzle-bar {
      grid-area: bar;
    }
    .menu-dock {
      grid-area: menu;
    }
    reference-panel {
      grid-area: reference;
    }

    /* A panel beside the board is ruled off on the edge that faces it. */
    main.controls-right {
      .menu-dock,
      puzzle-bar[along="side"] {
        border-inline-end: 1px solid var(--app-color-hairline);
      }
      puzzle-game-controls[along="side"],
      reference-panel {
        border-inline-start: 1px solid var(--app-color-hairline);
      }
    }
    main.controls-left {
      .menu-dock,
      puzzle-bar[along="side"] {
        border-inline-start: 1px solid var(--app-color-hairline);
      }
      puzzle-game-controls[along="side"],
      reference-panel {
        border-inline-end: 1px solid var(--app-color-hairline);
      }
    }
    :host([shape="tall"]) reference-panel {
      border-inline: none;
      border-block-start: 1px solid var(--app-color-hairline);
    }

    /* Dev-only icon-capture mode (?screenshot). */
    main.capture-mode {
      display: flex;
      flex-direction: column;
    }
    .capture-bar {
      display: flex;
      align-items: center;
      gap: var(--wa-space-s);
      padding: var(--wa-space-xs) var(--wa-space-s);
      background-color: var(--app-theme-color);

      .capture-title {
        margin-inline-end: auto;
        font-weight: var(--wa-font-weight-semibold);
      }
    }

    .board-area {
      min-width: 0;
      min-height: 0;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      padding: var(--app-spacing);
      /* Short of the full spacing under the board, so the hint under it
       * reads as the board's neighbor. */
      padding-block-end: 0.75rem;
    }

    .menu-dock {
      min-height: 0;
      overflow-y: auto;
      background-color: var(--app-color-rail);
    }

    /* The board stands at the foot of its area, on the hint under it, and
     * whatever height it does not use is left above it. */
    puzzle-view-interactive {
      flex: 1 1 auto;
      min-height: 5rem; /* allows flexing */
      min-width: 5rem;
      align-items: flex-end;

      --spacing: var(--app-spacing);
      --background-color: var(--wa-color-surface-default);
      --border-radius: var(--app-radius-container);
    }

    /* In a tall window, width is what sizes most boards, and the board's own
     * border already holds its clues and labels: a margin outside the card
     * plus padding inside it spent 48px of a 412px screen on nothing. The
     * card keeps a thin edge so its rounded corners still read. A short
     * window is as tight the other way. */
    :host(:not([shape="wide"])) .board-area {
      padding: var(--wa-space-xs);
      padding-block-end: 0.5rem;
    }
    :host(:not([shape="wide"])) puzzle-view-interactive {
      --spacing: var(--wa-space-xs);
    }

    .top-bar {
      box-sizing: border-box;
      min-width: 0;
      display: flex;
      align-items: center;
      gap: var(--wa-space-s);
      padding-inline: var(--wa-space-m);
      padding-block: var(--wa-space-2xs);
      background-color: var(--app-color-rail);
      border-block-end: 1px solid var(--app-color-hairline);
    }

    .top-back {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;
      min-width: var(--app-tap-min);
      min-height: var(--app-tap-min);
      font-size: var(--app-font-size-support);
      color: var(--app-color-text-quiet);
      text-decoration: none;

      @media (hover: hover) {
        &:hover {
          color: var(--app-color-link);
        }
      }
    }

    /* The link's words where the row has the width for them; its aria-label
     * says them everywhere. */
    :host(:not([shape="wide"])) .top-back-label {
      display: none;
    }
    :host([shape="short"]) .top-back {
      min-height: 2.25rem;
    }

    /* **The chips give way, not the name.** A clipped chip still opens the
     * type menu and names the whole type to a screen reader; a clipped name
     * leaves the bar anonymous. The cap binds only for a long name on the
     * narrowest phones, where it ellipsizes rather than pushing the timer off
     * the row. */
    .top-name {
      flex: 0 0 auto;
      display: flex;
      margin: 0;
      line-height: inherit;
      max-width: 45%;
      min-width: 0;
      font-size: var(--app-font-size-item);
      font-weight: var(--wa-font-weight-bold);
    }

    /* The name is the way to another puzzle: it opens the quick-switch, as
     * the Menu's Switch puzzle row does. A button inside the heading, so the
     * page keeps its h1. */
    .top-name-button {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      min-width: 0;
      min-height: var(--app-tap-min);
      padding: 0;
      border: 0;
      background: none;
      color: inherit;
      font: inherit;
      cursor: pointer;

      @media (hover: hover) {
        &:hover {
          color: var(--app-color-link);
        }
      }
    }
    :host([shape="short"]) .top-name-button {
      min-height: 2.25rem;
    }
    .top-name-text {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .top-name-button wa-icon {
      flex: 0 0 auto;
      font-size: 0.85em;
      color: var(--app-color-text-quiet);
    }

    /* overflow: hidden as well as min-width: 0, because a no-wrap chip in a box
     * allowed to shrink otherwise spills out of it, under the timer. */
    .top-chips {
      flex: 0 1 auto;
      min-width: 0;
      overflow: hidden;
    }
    .top-chips::part(trigger) {
      flex-wrap: nowrap;
    }
    .top-chips::part(chip) {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* An M:SS at the end of the row reads as a time without its icon, and
     * the icon's width is better spent on the chips. */
    .top-bar puzzle-timer::part(base) {
      flex: 0 0 auto;
      margin-inline-start: auto;
    }
    .top-bar puzzle-timer::part(icon) {
      display: none;
    }

    /* The status line and the hint sit under the board and above a bottom
     * Bar, where a thumb resting on the controls cannot cover them: the
     * whole point of an explained hint is that it can be read. A column no
     * wider than a line of prose reads well at, centered under the board. */
    .words {
      box-sizing: border-box;
      min-width: 0;
      width: 100%;
      max-width: 44rem;
      justify-self: center;
      padding-inline: var(--app-spacing);
    }
    :host(:not([shape="wide"])) .words {
      padding-inline: var(--wa-space-xs);
    }

    .status {
      margin-block-end: var(--wa-space-xs);
    }
    .status,
    .hint {
      font-size: var(--app-font-size-support);
      line-height: var(--wa-line-height-normal);
    }

    .status {
      text-align: center;
      color: var(--app-color-text-secondary);
      font-variant-numeric: tabular-nums;
    }

    /* The room the longest hint takes at this width, kept in a game with a
     * hint so that showing one leaves the board where it was: an unseen
     * hint of the longest words a hint may say is stacked under the real
     * one. A longer hint grows past it rather than be cut off. The hint
     * sits at its foot, on the Bar, and is as tall as its words: the room
     * a short hint leaves is above it. */
    .hint-room {
      display: grid;
      padding-block-start: var(--wa-space-xs);
      > * {
        grid-area: 1 / 1;
        align-self: end;
      }
    }
    .hint-sizer {
      visibility: hidden;
      animation: none;
    }

    /* The hint is a piece of the chrome under it, drawn out of it: it stands
     * on that panel's top edge with no rule between them, and rises out of
     * it when it appears. Its last pixel lies over the Bar's hairline, and
     * it is positioned so that it paints above the Bar. */
    .hint {
      position: relative;
      z-index: 1;
      margin-block-end: -1px;
      padding: 0.3125rem 0.625rem;
      border: 1px solid var(--app-color-hint-border);
      border-block-end: none;
      border-start-start-radius: var(--app-radius-hint);
      border-start-end-radius: var(--app-radius-hint);
      background-color: var(--app-color-hint-surface);
      color: var(--app-color-hint-ink);
      animation: hint-emerge 180ms ease-out;
    }
    /* A check that refused the save, or found the board wrong: it must not
     * read as a hint's quiet aside (owner, 2026-11-18: "red and obvious"). */
    .hint.refusal {
      border-color: var(--wa-color-danger-border-loud);
      border-inline-start: 4px solid var(--wa-color-danger-fill-loud);
      background-color: var(--wa-color-danger-fill-quiet);
      color: var(--wa-color-danger-on-quiet);
      font-weight: var(--wa-font-weight-semibold);
    }
    /* Moved down and cut at the same height, so the part showing is always
     * the part above the panel it rises from. */
    @keyframes hint-emerge {
      from {
        transform: translateY(100%);
        clip-path: inset(0 0 100% 0);
      }
      to {
        transform: none;
        clip-path: inset(0);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .hint {
        animation: none;
      }
    }

    .deal {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      margin-block-end: var(--wa-space-xs);
      padding-inline-start: 0.625rem;
      border: 1px solid var(--app-color-hairline);
      border-radius: var(--app-radius-hint);
      color: var(--app-color-text-secondary);
      font-size: var(--app-font-size-support);

      .deal-wait {
        font-variant-numeric: tabular-nums;
      }

      button {
        min-width: var(--app-tap-min);
        min-height: var(--app-tap-min);
        padding-inline: 1rem;
        border: none;
        border-inline-start: 1px solid var(--app-color-hairline);
        background: none;
        color: var(--app-color-text);
        font: inherit;
        cursor: pointer;
      }
    }

    /* A reference is a pill in the run of words: tinted to say it can be
     * pressed, and filled in the hint's ink while its marks flash. Its padding is
     * inline, so the line it sits in keeps its height, and a pill that wraps
     * is rounded on each line. Only its target is enlarged for a finger. */
    /* No break between a pill and what is glued to it; the pill's own words
     * still wrap, since a break inside it is the pill's to allow. */
    .hint-ref-run {
      white-space: nowrap;
    }
    .hint-ref {
      all: unset;
      white-space: normal;
      position: relative;
      cursor: pointer;
      padding: 0.0625em 0.4em;
      border-radius: 999px;
      background-color: color-mix(in srgb, var(--app-color-hint-ink) 9%, transparent);
      box-shadow: inset 0 0 0 1px
        color-mix(in srgb, var(--app-color-hint-ink) 22%, transparent);
      box-decoration-break: clone;
      -webkit-box-decoration-break: clone;

      &::after {
        content: "";
        position: absolute;
        inset: -0.5rem 0;
      }
      &:hover {
        background-color: color-mix(in srgb, var(--app-color-hint-ink) 16%, transparent);
      }
      &.colored {
        background-color: color-mix(in srgb, var(--ref-color) 18%, transparent);
        box-shadow: inset 0 0 0 1.5px var(--ref-color);
      }
      &.colored:hover {
        background-color: color-mix(in srgb, var(--ref-color) 30%, transparent);
      }
      /* Hovered too: a pill flashes because it was just pressed, so the
       * pointer is still on it, and a hover's tint under the flash's dark
       * text would leave it unreadable. */
      &.flashing,
      &.flashing:hover {
        background-color: var(--app-color-hint-ink);
        box-shadow: none;
        color: var(--app-color-hint-surface);
      }
      &:focus-visible {
        outline: 2px solid var(--wa-color-focus);
        outline-offset: 1px;
      }
    }

    .hint-leader {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2;
      overflow: visible;
      line {
        stroke: var(--ref-color);
        stroke-width: 2;
        stroke-linecap: round;
      }
      circle {
        fill: var(--ref-color);
      }
    }

    .hint-journey {
      display: block;
      font-family: var(--app-font-mono);
      font-size: var(--app-font-size-micro);
      letter-spacing: 0.04em;
      text-transform: uppercase;
      opacity: 0.75;
    }

    /* The Menu over the board, where it does not dock. The dialog is sized
     * to its content, so a click on its backdrop is a click outside the
     * Menu (utils/dialog.ts). */
    .menu-over {
      /* The room the Bar takes at its edge of the window, which
       * keepClearOfBar measures. The Menu stops there. */
      inset: 0 var(--bar-clear-right, 0px) var(--bar-clear-bottom, 0px)
        var(--bar-clear-left, 0px);
      max-width: none;
      max-height: none;
      margin: 0;
      padding: 0;
      border: none;
      background-color: var(--app-color-rail);
      color: var(--app-color-text);
      overflow-y: auto;

      /* The backdrop covers the Bar and is clear over it: a tap on the Bar
       * must land on the backdrop to count as a tap outside the Menu, and a
       * backdrop that stopped short would let it through to an inert page. */
      &::backdrop {
        background: linear-gradient(
            var(--wa-color-overlay-modal),
            var(--wa-color-overlay-modal)
          )
          var(--bar-clear-left, 0px) 0 / calc(
              100% - var(--bar-clear-left, 0px) - var(--bar-clear-right, 0px)
            )
            calc(100% - var(--bar-clear-bottom, 0px)) no-repeat;
      }
    }

    /* A sheet from the bottom in a tall window. */
    .menu-over.sheet {
      width: auto;
      max-height: 80dvh;
      margin-block-start: auto;
      border-start-start-radius: var(--app-radius-container);
      border-start-end-radius: var(--app-radius-container);
    }

    /* A drawer on the Menu's side in a landscape one. */
    .menu-over.drawer-left,
    .menu-over.drawer-right {
      width: min(18rem, 85vw);
      height: auto;
    }
    .menu-over.drawer-left {
      margin-inline-end: auto;
    }
    .menu-over.drawer-right {
      margin-inline-start: auto;
    }

    puzzle-end-notification {
      &::part(dialog) {
        /* Position at bottom, aligned with puzzle controls */
        margin-block-end: var(--app-padding);
      }

      :has(share-dialog[open]) & {
        /* Hide the end notification and its extra backdrop
         * while share-dialog is open above it */
        --opacity: 0;
      }

      & wa-button::part(label) {
        /* Align icons at left of buttons, center labels */
        flex: 1 1 auto;
        text-align: center;
      }
    }

    wa-skeleton {
      --color: var(--wa-color-brand-fill-quiet);
      --sheen-color: var(--wa-color-brand-fill-normal);
      &::part(indicator) {
        border-radius: 0;
      }
    }

  `,
];
