import { instrument } from "bippy";
import { createFileRoute } from "@tanstack/react-router";
import { InspectorOverlay } from "../components/inspector-overlay";
import { SampleCard } from "../components/sample-card";

instrument({
  name: "tanstack-start-element-source",
  onCommitFiberRoot: () => {},
});

const Home = () => (
  <main style={{ padding: 24, maxWidth: 600, margin: "0 auto" }}>
    <h1 style={{ fontSize: 24, marginBottom: 4 }}>Element Source - TanStack Start</h1>
    <p style={{ color: "#666", marginBottom: 24, fontSize: 14 }}>
      Click any element to inspect its source
    </p>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <SampleCard title="Counter" />
      <SampleCard title="Timer" />
      <SampleCard title="Toggle" />
    </div>
    <InspectorOverlay />
  </main>
);

export const Route = createFileRoute("/")({
  component: Home,
});
