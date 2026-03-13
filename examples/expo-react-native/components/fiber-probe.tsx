import { useRef } from "react";
import { findNodeHandle, Pressable, StyleSheet, Text, View } from "react-native";

interface FiberProbeProps {
  onProbe: (viewRef: unknown) => void;
}

export const FiberProbe = ({ onProbe }: FiberProbeProps) => {
  const targetRef = useRef<View>(null);

  const handleProbe = () => {
    if (!targetRef.current) return;

    const nodeHandle = findNodeHandle(targetRef.current);
    onProbe(targetRef.current);

    // HACK: also log raw internals to console for manual inspection
    console.log("[FiberProbe] ref:", targetRef.current);
    console.log("[FiberProbe] nodeHandle:", nodeHandle);
    console.log("[FiberProbe] keys:", Object.getOwnPropertyNames(targetRef.current));

    const keys = Object.getOwnPropertyNames(targetRef.current);
    for (const key of keys) {
      if (key.startsWith("__react") || key.startsWith("_")) {
        console.log(`[FiberProbe] ${key}:`, (targetRef.current as Record<string, unknown>)[key]);
      }
    }
  };

  return (
    <View style={styles.probeContainer}>
      <View ref={targetRef} style={styles.probeTarget}>
        <Text style={styles.probeTargetText}>Probe Target Element</Text>
        <Text style={styles.probeTargetHint}>This View&apos;s fiber will be inspected</Text>
      </View>

      <Pressable style={styles.probeButton} onPress={handleProbe}>
        <Text style={styles.probeButtonText}>Probe Fiber Tree</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  probeContainer: {
    marginTop: 12,
    gap: 8,
  },
  probeTarget: {
    borderWidth: 2,
    borderColor: "#61dafb",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  probeTargetText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  probeTargetHint: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  probeButton: {
    backgroundColor: "#1a1a2e",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  probeButtonText: {
    color: "#61dafb",
    fontSize: 15,
    fontWeight: "600",
  },
});
