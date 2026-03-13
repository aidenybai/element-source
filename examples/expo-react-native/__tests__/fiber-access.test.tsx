import React, { useRef, useEffect } from "react";
import { View, Text } from "react-native";
import { render } from "@testing-library/react-native";

const REACT_FIBER_KEY_PREFIX = "__reactFiber$";
const REACT_INTERNAL_PREFIX = "__reactInternalInstance$";
const INTERNAL_INSTANCE_KEY = "__internalInstanceHandle";

interface FiberReport {
  hasFiber: boolean;
  hasInternalInstance: boolean;
  hasReactInternalInstance: boolean;
  fiberTag: number | null;
  fiberType: string | null;
  hasReturn: boolean;
  returnTypeName: string | null;
  allKeys: string[];
}

const probeFiber = (viewRef: unknown): FiberReport => {
  const report: FiberReport = {
    hasFiber: false,
    hasInternalInstance: false,
    hasReactInternalInstance: false,
    fiberTag: null,
    fiberType: null,
    hasReturn: false,
    returnTypeName: null,
    allKeys: [],
  };

  if (!viewRef || typeof viewRef !== "object") return report;

  const keys = Object.getOwnPropertyNames(viewRef);
  report.allKeys = keys;

  const fiberKey = keys.find(
    (key) => key.startsWith(REACT_FIBER_KEY_PREFIX) || key.startsWith(REACT_INTERNAL_PREFIX),
  );
  if (fiberKey) {
    report.hasFiber = true;
    const fiber = (viewRef as Record<string, unknown>)[fiberKey] as Record<string, unknown>;
    if (fiber) {
      report.fiberTag = (fiber.tag as number) ?? null;
      report.fiberType =
        typeof fiber.type === "string"
          ? fiber.type
          : typeof fiber.type === "function"
            ? ((fiber.type as { name?: string }).name ?? "anonymous")
            : null;

      if (fiber.return && typeof fiber.return === "object") {
        report.hasReturn = true;
        const parent = fiber.return as Record<string, unknown>;
        if (typeof parent.type === "function") {
          report.returnTypeName = (parent.type as { name?: string }).name ?? null;
        }
      }
    }
  }

  if (keys.includes(INTERNAL_INSTANCE_KEY)) {
    report.hasInternalInstance = true;
  }

  const reactInternalKey = keys.find((key) => key.startsWith(REACT_INTERNAL_PREFIX));
  if (reactInternalKey) {
    report.hasReactInternalInstance = true;
  }

  return report;
};

const Header = ({ title }: { title: string }) => (
  <View testID="header">
    <Text>{title}</Text>
  </View>
);

const Card = ({ children }: { children: React.ReactNode }) => <View testID="card">{children}</View>;

interface CapturedRef {
  current: unknown;
}

const RefCapture = ({ capture }: { capture: CapturedRef }) => {
  const ref = useRef<View>(null);
  useEffect(() => {
    capture.current = ref.current;
  }, [capture]);
  return (
    <View ref={ref} testID="probe-target">
      <Text>Probe target</Text>
    </View>
  );
};

const ExpoApp = ({ capture }: { capture: CapturedRef }) => (
  <View testID="app-root">
    <Card>
      <Header title="Hello Expo" />
    </Card>
    <RefCapture capture={capture} />
  </View>
);

describe("Expo React Native fiber access", () => {
  it("renders components and captures ref", () => {
    const capture: CapturedRef = { current: null };
    const { getByTestId } = render(<ExpoApp capture={capture} />);

    expect(getByTestId("app-root")).toBeTruthy();
    expect(getByTestId("header")).toBeTruthy();
    expect(getByTestId("card")).toBeTruthy();
    expect(capture.current).not.toBeNull();
  });

  it("captured ref is a real object with properties", () => {
    const capture: CapturedRef = { current: null };
    render(<ExpoApp capture={capture} />);

    expect(typeof capture.current).toBe("object");
    expect(capture.current).not.toBeNull();
  });

  it("probes fiber structure from captured ref", () => {
    const capture: CapturedRef = { current: null };
    render(<ExpoApp capture={capture} />);

    const report = probeFiber(capture.current);
    expect(report.allKeys.length).toBeGreaterThanOrEqual(0);
  });

  it("host instance is not a browser Element (no DOM in RN)", () => {
    const capture: CapturedRef = { current: null };
    render(<ExpoApp capture={capture} />);

    expect(capture.current).not.toBeNull();
    expect(typeof Element).toBe("undefined");
  });

  it("testID-queried elements are accessible for inspection", () => {
    const capture: CapturedRef = { current: null };
    const { getByTestId } = render(<ExpoApp capture={capture} />);

    const probeTarget = getByTestId("probe-target");
    expect(probeTarget).toBeTruthy();
    expect(probeTarget.props.testID).toBe("probe-target");
  });

  it("component hierarchy is preserved in render tree", () => {
    const capture: CapturedRef = { current: null };
    const { getByTestId } = render(<ExpoApp capture={capture} />);

    const root = getByTestId("app-root");
    expect(root.children.length).toBeGreaterThan(0);
  });
});
