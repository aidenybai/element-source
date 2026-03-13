import { SampleCard } from "./sample-card";

export const App = () => (
  <box style={{ flexDirection: "column", gap: 1, padding: 1, border: true, borderStyle: "rounded" }}>
    <text fg="#FFFF00">Element Source - OpenTUI</text>
    <text fg="#888">Press Ctrl+C to exit</text>
    <SampleCard title="Counter" />
    <SampleCard title="Timer" />
    <SampleCard title="Toggle" />
  </box>
);
