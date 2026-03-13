import { SampleCard } from "./sample-card";
import { InspectorOverlay } from "./inspector-overlay";

export const App = () => (
  <div
    style={{ "font-family": "system-ui", padding: "24px", "max-width": "480px", margin: "0 auto" }}
  >
    <h1 style={{ "font-size": "20px", "margin-bottom": "4px" }}>Element Source - Vite + Solid</h1>
    <div style={{ display: "flex", "flex-direction": "column", gap: "12px" }}>
      <SampleCard title="Counter" />
      <SampleCard title="Timer" />
      <SampleCard title="Toggle" />
    </div>
    <InspectorOverlay />
  </div>
);
