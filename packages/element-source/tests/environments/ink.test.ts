import { getFiberFromHostInstance, isInstrumentationActive, _renderers } from "bippy";
import { describe, it, expect, afterEach } from "vitest";
import React, { useRef, useEffect } from "react";
import { Box, Text } from "ink";
import type { DOMElement } from "ink";
import { render } from "ink-testing-library";
import { getTagName } from "../../src/utils/get-tag-name.js";
import { isElement } from "../../src/utils/is-element.js";

let cleanup: (() => void) | null = null;

afterEach(() => {
  cleanup?.();
  cleanup = null;
});

interface CapturedRefs {
  box: DOMElement | null;
  nested: DOMElement | null;
}

const renderInkApp = (): { captured: CapturedRefs; instance: ReturnType<typeof render> } => {
  const captured: CapturedRefs = { box: null, nested: null };

  const Header = ({ title }: { title: string }) => {
    const ref = useRef<DOMElement>(null);
    useEffect(() => {
      captured.nested = ref.current;
    }, []);
    return React.createElement(Box, { ref }, React.createElement(Text, null, title));
  };

  const InkApp = () => {
    const ref = useRef<DOMElement>(null);
    useEffect(() => {
      captured.box = ref.current;
    }, []);
    return React.createElement(
      Box,
      { ref, flexDirection: "column" },
      React.createElement(Header, { title: "Hello from Ink" }),
    );
  };

  const instance = render(React.createElement(InkApp));
  cleanup = instance.unmount;

  return { captured, instance };
};

describe("Ink TUI environment (real Ink rendering in Node.js)", () => {
  it("Ink render captures DOMElement host instances via ref", () => {
    const { captured } = renderInkApp();
    expect(captured.box).not.toBeNull();
    expect(captured.nested).not.toBeNull();
    expect(captured.box!.nodeName).toBe("ink-box");
  });

  it("Ink DOMElement is not a browser Element", () => {
    const { captured } = renderInkApp();
    expect(isElement(captured.box!)).toBe(false);
  });

  it("Ink DOMElement has expected structure", () => {
    const { captured } = renderInkApp();
    const node = captured.box!;

    expect(node.nodeName).toBe("ink-box");
    expect(node.childNodes).toBeDefined();
    expect(Array.isArray(node.childNodes)).toBe(true);
    expect(node.parentNode).toBeDefined();
    expect(node.parentNode!.nodeName).toBe("ink-root");
  });

  it("getTagName returns nodeName for Ink DOMElement", () => {
    const { captured } = renderInkApp();
    expect(getTagName(captured.box!)).toBe("ink-box");
    expect(getTagName(captured.nested!)).toBe("ink-box");
  });

  it("Ink text output renders correctly", () => {
    const { instance } = renderInkApp();
    const output = instance.lastFrame();
    expect(output).toContain("Hello from Ink");
  });

  it("Ink DOMElements lack __reactFiber$ keys (no DevTools injection by default)", () => {
    const { captured } = renderInkApp();
    const keys = Object.getOwnPropertyNames(captured.box!);
    const fiberKeys = keys.filter((key) => key.startsWith("__reactFiber"));
    expect(fiberKeys).toHaveLength(0);
  });

  it("getFiberFromHostInstance returns null without DevTools injection", () => {
    const { captured } = renderInkApp();
    const fiber = getFiberFromHostInstance(captured.box);
    expect(fiber).toBeNull();
  });

  it("isInstrumentationActive is false when Ink has not injected into DevTools", () => {
    renderInkApp();
    expect(_renderers.size).toBe(0);
    expect(isInstrumentationActive()).toBe(false);
  });
});
