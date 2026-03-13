import { useState } from "react";

interface SampleCardProps {
  title: string;
}

export const SampleCard = ({ title }: SampleCardProps) => {
  const [count, setCount] = useState(0);
  return (
    <div
      data-testid="sample-card"
      style={{
        border: "1px solid #e0e0e0",
        borderRadius: 12,
        padding: 16,
        background: "#fafafa",
      }}
    >
      <h3 style={{ fontSize: 16, marginBottom: 8 }}>{title}</h3>
      <p style={{ color: "#444", marginBottom: 12, fontSize: 14 }}>Count: {count}</p>
      <button
        onClick={() => setCount((prev) => prev + 1)}
        style={{
          padding: "8px 16px",
          border: "none",
          borderRadius: 8,
          background: "#4a90d9",
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
