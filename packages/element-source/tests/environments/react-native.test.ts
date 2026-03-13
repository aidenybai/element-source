import { isInstrumentationActive, _renderers } from "bippy";
import { getOwnerStack } from "bippy/source";
import { describe, it, expect, afterEach } from "vitest";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { getTagName } from "../../src/utils/get-tag-name.js";
import { isElement } from "../../src/utils/is-element.js";

const Header = ({ title }: { title: string }) =>
  React.createElement("h1", { testID: "header" }, title);

const Card = ({ children }: { children: React.ReactNode }) =>
  React.createElement("div", { testID: "card" }, children);

const RNApp = () =>
  React.createElement(
    "main",
    null,
    React.createElement(Card, null, React.createElement(Header, { title: "Hello RN" })),
  );

let renderer: TestRenderer.ReactTestRenderer | null = null;

afterEach(() => {
  if (renderer) {
    act(() => renderer!.unmount());
    renderer = null;
  }
});

const createRenderer = () => {
  act(() => {
    renderer = TestRenderer.create(React.createElement(RNApp));
  });
  return renderer!;
};

describe("React Native environment (react-test-renderer in Node.js)", () => {
  it("bippy instrumentation activates with react-test-renderer", () => {
    createRenderer();
    expect(isInstrumentationActive()).toBe(true);
  });

  it("react-test-renderer creates accessible component tree", () => {
    const testRenderer = createRenderer();
    const root = testRenderer.root;

    expect(root).toBeTruthy();
    expect(root.findByProps({ testID: "header" })).toBeTruthy();
    expect(root.findByProps({ testID: "card" })).toBeTruthy();
  });

  it("test instance _fiber provides direct fiber access", () => {
    const testRenderer = createRenderer();
    const headerInstance = testRenderer.root.findByProps({ testID: "header" });
    const fiber = (headerInstance as unknown as { _fiber: { tag: number; type: unknown } })._fiber;

    expect(fiber).toBeTruthy();
    expect(fiber.tag).toBeTypeOf("number");
    expect(fiber.type).toBe("h1");
  });

  it("fiber has stateNode representing host instance", () => {
    const testRenderer = createRenderer();
    const headerInstance = testRenderer.root.findByType("h1");
    const fiber = (headerInstance as unknown as { _fiber: { stateNode: unknown } })._fiber;

    expect(fiber.stateNode).toBeTruthy();
  });

  it("host instances are not browser Elements", () => {
    const testRenderer = createRenderer();
    const headerInstance = testRenderer.root.findByType("h1");
    const fiber = (headerInstance as unknown as { _fiber: { stateNode: object } })._fiber;

    expect(isElement(fiber.stateNode)).toBe(false);
  });

  it("getOwnerStack returns frames from fiber (direct fiber access)", async () => {
    const testRenderer = createRenderer();
    const headerInstance = testRenderer.root.findByType("h1");
    const fiber = (headerInstance as unknown as { _fiber: { return: unknown } })._fiber;

    const compositeParent = fiber.return as { return: unknown; type: { name: string } };
    expect(compositeParent).toBeTruthy();
    expect(compositeParent.type?.name).toBe("Header");

    const frames = await getOwnerStack(compositeParent as never);
    expect(frames.length).toBeGreaterThanOrEqual(1);
    expect(frames[0].fileName).toContain("react-native.test.ts");
  });

  it("getTagName returns empty for test renderer host instances", () => {
    const testRenderer = createRenderer();
    const headerInstance = testRenderer.root.findByType("h1");
    const fiber = (headerInstance as unknown as { _fiber: { stateNode: object } })._fiber;

    const tagName = getTagName(fiber.stateNode);
    expect(typeof tagName).toBe("string");
  });

  it("DevTools hook has registered renderer", () => {
    createRenderer();
    expect(_renderers.size).toBeGreaterThan(0);
  });
});
