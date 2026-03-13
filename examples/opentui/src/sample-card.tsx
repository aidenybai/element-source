import { useState } from "react";
import { useKeyboard } from "@opentui/react";

interface SampleCardProps {
  title: string;
}

export const SampleCard = ({ title }: SampleCardProps) => {
  const [count, setCount] = useState(0);

  useKeyboard((key) => {
    if (key.name === "return") setCount((previous) => previous + 1);
  });

  return (
    <box style={{ border: true, padding: 1, flexDirection: "column" }}>
      <text fg="#4a90d9">{title}</text>
      <text>Count: {count}</text>
    </box>
  );
};
