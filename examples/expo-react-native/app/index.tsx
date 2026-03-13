import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { FiberProbe } from "../components/fiber-probe";
import { SampleCard } from "../components/sample-card";

const FIBER_KEY_PREFIX = "__reactFiber$";
const INTERNAL_INSTANCE_KEY = "__internalInstanceHandle";
const PROPS_KEY_PREFIX = "__reactProps$";

interface FiberReport {
  hasFiber: boolean;
  hasInternalInstance: boolean;
  hasDebugSource: boolean;
  hasDebugOwner: boolean;
  debugSource: Record<string, unknown> | null;
  fiberTag: number | null;
  fiberType: string | null;
  ownerName: string | null;
  allKeys: string[];
}

const probeFiber = (viewRef: unknown): FiberReport => {
  const report: FiberReport = {
    hasFiber: false,
    hasInternalInstance: false,
    hasDebugSource: false,
    hasDebugOwner: false,
    debugSource: null,
    fiberTag: null,
    fiberType: null,
    ownerName: null,
    allKeys: [],
  };

  if (!viewRef || typeof viewRef !== "object") return report;

  const keys = Object.getOwnPropertyNames(viewRef);
  report.allKeys = keys;

  const fiberKey = keys.find((key) => key.startsWith(FIBER_KEY_PREFIX));
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

      if (fiber._debugSource) {
        report.hasDebugSource = true;
        report.debugSource = fiber._debugSource as Record<string, unknown>;
      }

      if (fiber._debugOwner) {
        report.hasDebugOwner = true;
        const owner = fiber._debugOwner as Record<string, unknown>;
        report.ownerName =
          typeof owner.type === "function"
            ? ((owner.type as { name?: string }).name ?? null)
            : null;
      }
    }
  }

  if (keys.includes(INTERNAL_INSTANCE_KEY)) {
    report.hasInternalInstance = true;
  }

  return report;
};

const HomeScreen = () => {
  const [fiberReport, setFiberReport] = useState<FiberReport | null>(null);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>React Native Fiber Probe</Text>
      <Text style={styles.subtitle}>Testing element-source feasibility on React Native</Text>

      <SampleCard title="Counter" />
      <SampleCard title="Timer" />

      <FiberProbe
        onProbe={(viewRef) => {
          const report = probeFiber(viewRef);
          setFiberReport(report);
        }}
      />

      {fiberReport && (
        <View style={styles.resultPanel}>
          <Text style={styles.resultTitle}>Fiber Probe Results</Text>

          <ResultRow label="Has __reactFiber$" value={fiberReport.hasFiber} />
          <ResultRow label="Has __internalInstanceHandle" value={fiberReport.hasInternalInstance} />
          <ResultRow label="Has _debugSource" value={fiberReport.hasDebugSource} />
          <ResultRow label="Has _debugOwner" value={fiberReport.hasDebugOwner} />

          {fiberReport.fiberType && <ResultRow label="Fiber type" value={fiberReport.fiberType} />}
          {fiberReport.fiberTag !== null && (
            <ResultRow label="Fiber tag" value={fiberReport.fiberTag} />
          )}
          {fiberReport.ownerName && <ResultRow label="Owner name" value={fiberReport.ownerName} />}
          {fiberReport.debugSource && (
            <ResultRow
              label="_debugSource"
              value={JSON.stringify(fiberReport.debugSource, null, 2)}
            />
          )}

          <Text style={styles.keysLabel}>All instance keys:</Text>
          <Text style={styles.keysValue}>{fiberReport.allKeys.join(", ") || "(none)"}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const ResultRow = ({ label, value }: { label: string; value: boolean | string | number }) => (
  <View style={styles.resultRow}>
    <Text style={styles.resultLabel}>{label}:</Text>
    <Text
      style={[
        styles.resultValue,
        typeof value === "boolean" && {
          color: value ? "#a8e6cf" : "#ff8a80",
        },
      ]}
    >
      {typeof value === "boolean" ? (value ? "YES" : "NO") : String(value)}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
  },
  resultPanel: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#1a1a2e",
    borderRadius: 10,
  },
  resultTitle: {
    color: "#61dafb",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  resultRow: {
    flexDirection: "row",
    marginBottom: 6,
    alignItems: "flex-start",
  },
  resultLabel: {
    color: "#888",
    fontSize: 13,
    width: 200,
  },
  resultValue: {
    color: "#e0e0e0",
    fontSize: 13,
    fontFamily: "monospace",
    flex: 1,
  },
  keysLabel: {
    color: "#888",
    fontSize: 12,
    marginTop: 12,
  },
  keysValue: {
    color: "#ffeaa7",
    fontSize: 11,
    fontFamily: "monospace",
    marginTop: 4,
  },
});

export default HomeScreen;
