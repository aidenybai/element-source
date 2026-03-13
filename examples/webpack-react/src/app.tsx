import { SampleCard } from "./sample-card";
import { InspectorOverlay } from "./inspector-overlay";

export const App = () => (
  <div style={{ fontFamily: "system-ui", padding: 24, maxWidth: 480, margin: "0 auto" }}>
    <h1 style={{ fontSize: 20, marginBottom: 4 }}>Element Source - Webpack + React</h1>
    <p style={{ color: "#666", marginBottom: 24 }}>Click any element to inspect its source</p>
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <SampleCard title="Counter" />
      <SampleCard title="Timer" />
      <SampleCard title="Toggle" />
    </div>
    <InspectorOverlay />
  </div>
);
