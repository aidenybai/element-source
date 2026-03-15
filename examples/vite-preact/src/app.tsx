import { InspectorOverlay } from "./inspector-overlay";
import { SampleCard } from "./sample-card";

export const App = () => (
  <div style={{ fontFamily: "system-ui", padding: 24, maxWidth: 480, margin: "0 auto" }}>
    <h1 style={{ fontSize: 20, marginBottom: 4 }}>Element Source - Vite + Preact</h1>
    <p style={{ color: "#666", marginBottom: 24 }}>Click any element to inspect its source</p>
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <SampleCard title="Signals" accentColor="#ff6b6b" />
      <SampleCard title="Hooks" accentColor="#4dabf7" />
      <SampleCard title="Island" accentColor="#51cf66" />
    </div>
    <InspectorOverlay />
  </div>
);
