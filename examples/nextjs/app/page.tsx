import { InspectorOverlay } from "./components/inspector-overlay";
import { SampleCard } from "./components/sample-card";

export default function Page() {
  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: 24,
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>Element Source - Next.js</h1>
      <p style={{ color: "#666", marginBottom: 24, fontSize: 14 }}>
        Click any element to inspect its source
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <SampleCard title="Counter" />
        <SampleCard title="Timer" />
        <SampleCard title="Toggle" />
      </div>

      <InspectorOverlay />
    </div>
  );
}
