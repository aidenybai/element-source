import { SampleCard } from "../components/sample-card";
import { InspectorOverlay } from "../components/inspector-overlay";

export const Home = () => (
  <>
    <h1 style={{ fontSize: 20, marginBottom: 4 }}>Home</h1>
    <p style={{ color: "#666", marginBottom: 24 }}>Click any element to inspect its source</p>
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <SampleCard title="Counter" />
      <SampleCard title="Timer" />
      <SampleCard title="Toggle" />
    </div>
    <InspectorOverlay />
  </>
);
