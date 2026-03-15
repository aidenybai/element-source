import "preact/debug";
import { h, render } from "preact";
import * as PreactCompat from "preact/compat";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { preactResolver } from "../../src/frameworks/preact.js";
import { createSourceResolver } from "../../src/resolve.js";

interface HeaderProps {
  title: string;
}

interface CardProps {
  title: string;
}

interface CompatButtonProps {
  label: string;
}

interface CompatAppProps {
  label: string;
}

interface SourceLocation {
  fileName: string;
  lineNumber: number;
  columnNumber?: number;
}

const PREACT_TEST_FILE_PATH = "tests/frameworks/preact.test.ts";
const ROOT_SOURCE_LINE = 10;
const APP_SOURCE_LINE = 20;
const APP_CARD_SOURCE_LINE = 30;
const CARD_SOURCE_LINE = 40;
const CARD_HEADER_SOURCE_LINE = 50;
const HEADER_SOURCE_LINE = 60;
const COMPAT_ROOT_SOURCE_LINE = 70;
const COMPAT_APP_SOURCE_LINE = 80;
const COMPAT_APP_BUTTON_SOURCE_LINE = 90;
const COMPAT_BUTTON_SOURCE_LINE = 100;

const createSource = (lineNumber: number, columnNumber?: number): SourceLocation => ({
  fileName: PREACT_TEST_FILE_PATH,
  lineNumber,
  columnNumber,
});

const Header = ({ title }: HeaderProps) =>
  h("h1", { "data-testid": "preact-header", __source: createSource(HEADER_SOURCE_LINE) }, title);

const Card = ({ title }: CardProps) =>
  h(
    "section",
    { "data-testid": "preact-card", __source: createSource(CARD_SOURCE_LINE) },
    h(Header, { __source: createSource(CARD_HEADER_SOURCE_LINE), title }),
  );

const App = () =>
  h(
    "main",
    { id: "preact-app", __source: createSource(APP_SOURCE_LINE) },
    h(Card, { __source: createSource(APP_CARD_SOURCE_LINE), title: "Hello" }),
  );

const CompatButton = ({ label }: CompatButtonProps) =>
  PreactCompat.createElement(
    "button",
    { "data-testid": "compat-button", __source: createSource(COMPAT_BUTTON_SOURCE_LINE) },
    label,
  );

const CompatApp = ({ label }: CompatAppProps) =>
  PreactCompat.createElement(
    "div",
    { id: "compat-app", __source: createSource(COMPAT_APP_SOURCE_LINE) },
    PreactCompat.createElement(CompatButton, {
      __source: createSource(COMPAT_APP_BUTTON_SOURCE_LINE),
      label,
    }),
  );

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  render(null, container);
  container.remove();
});

describe("preactResolver", () => {
  it("resolveStack returns source frames for a core Preact render", async () => {
    render(h(App, { __source: createSource(ROOT_SOURCE_LINE) }), container);

    const header = container.querySelector("[data-testid='preact-header']")!;
    const stack = await preactResolver.resolveStack(header);

    expect(stack.length).toBeGreaterThanOrEqual(3);
    expect(stack[0]).toMatchObject({
      filePath: PREACT_TEST_FILE_PATH,
      lineNumber: HEADER_SOURCE_LINE,
      componentName: "Header",
    });
    expect(stack[1]).toMatchObject({
      filePath: PREACT_TEST_FILE_PATH,
      lineNumber: APP_CARD_SOURCE_LINE,
      componentName: "Card",
    });
    expect(stack[2]).toMatchObject({
      filePath: PREACT_TEST_FILE_PATH,
      lineNumber: ROOT_SOURCE_LINE,
      componentName: "App",
    });
  });

  it("resolveComponentName returns the nearest Preact component name", async () => {
    render(h(App, { __source: createSource(ROOT_SOURCE_LINE) }), container);

    const header = container.querySelector("[data-testid='preact-header']")!;
    const name = await preactResolver.resolveComponentName?.(header);

    expect(name).toBe("Header");
  });

  it("resolveElementInfo returns full metadata for a wrapper component", async () => {
    const { resolveElementInfo } = createSourceResolver();
    render(h(App, { __source: createSource(ROOT_SOURCE_LINE) }), container);

    const card = container.querySelector("[data-testid='preact-card']")!;
    const info = await resolveElementInfo(card);

    expect(info.tagName).toBe("section");
    expect(info.componentName).toBe("Card");
    expect(info.source).toMatchObject({
      filePath: PREACT_TEST_FILE_PATH,
      lineNumber: CARD_SOURCE_LINE,
      componentName: "Card",
    });
  });

  it("resolveElementInfo works with preact/compat", async () => {
    const { resolveElementInfo } = createSourceResolver();
    PreactCompat.render(
      PreactCompat.createElement(CompatApp, {
        __source: createSource(COMPAT_ROOT_SOURCE_LINE),
        label: "Tap",
      }),
      container,
    );

    const button = container.querySelector("[data-testid='compat-button']")!;
    const info = await resolveElementInfo(button);

    expect(info.tagName).toBe("button");
    expect(info.componentName).toBe("CompatButton");
    expect(info.source).toMatchObject({
      filePath: PREACT_TEST_FILE_PATH,
      lineNumber: COMPAT_BUTTON_SOURCE_LINE,
      componentName: "CompatButton",
    });
    expect(info.stack.some((frame) => frame.componentName === "CompatApp")).toBe(true);
  });
});
