import { useState } from "preact/hooks";

interface SampleCardProps {
  title: string;
  accentColor: string;
}

export const SampleCard = ({ title, accentColor }: SampleCardProps) => {
  const [count, setCount] = useState(0);

  return (
    <div
      data-testid="sample-card"
      style={{
        border: `1px solid ${accentColor}33`,
        borderRadius: 12,
        padding: 16,
        background: "#fafafa",
        boxShadow: `0 10px 24px ${accentColor}14`,
      }}
    >
      <h3 style={{ fontSize: 16, marginBottom: 8 }}>{title}</h3>
      <p style={{ color: "#444", marginBottom: 12, fontSize: 14 }}>Count: {count}</p>
      <button
        onClick={() => setCount((previousCount) => previousCount + 1)}
        style={{
          padding: "8px 16px",
          border: "none",
          borderRadius: 8,
          background: accentColor,
          color: "white",
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        Increment
      </button>
    </div>
  );
};
