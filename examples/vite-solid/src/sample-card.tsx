import { createSignal } from "solid-js";

interface SampleCardProps {
  title: string;
}

export const SampleCard = (props: SampleCardProps) => {
  const [count, setCount] = createSignal(0);
  return (
    <div
      data-testid="sample-card"
      style={{
        border: "1px solid #e0e0e0",
        "border-radius": "12px",
        padding: "16px",
        background: "#fafafa",
      }}
    >
      <h3 style={{ "font-size": "16px", "margin-bottom": "8px" }}>{props.title}</h3>
      <p style={{ color: "#444", "margin-bottom": "12px", "font-size": "14px" }}>
        Count: {count()}
      </p>
      <button
        onclick={() => setCount((previous) => previous + 1)}
        style={{
          padding: "8px 16px",
          border: "none",
          "border-radius": "8px",
          background: "#4a90d9",
          color: "white",
          "font-size": "14px",
          cursor: "pointer",
        }}
      >
        Increment
      </button>
    </div>
  );
};
