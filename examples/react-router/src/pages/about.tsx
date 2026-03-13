import { SampleCard } from "../components/sample-card";
import { InspectorOverlay } from "../components/inspector-overlay";

export const About = () => (
  <>
    <h1 style={{ fontSize: 20, marginBottom: 4 }}>About</h1>
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <SampleCard title="Counter" />
      <SampleCard title="Timer" />
      <SampleCard title="Toggle" />
    </div>
    <InspectorOverlay />
  </>
);
