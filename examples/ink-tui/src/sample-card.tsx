import React, { useState } from "react";
import { Box, Text, useInput } from "ink";

interface SampleCardProps {
  title: string;
  isFocused: boolean;
}

export const SampleCard = ({ title, isFocused }: SampleCardProps) => {
  const [count, setCount] = useState(0);

  useInput(
    (input, key) => {
      if (key.return) setCount((prev) => prev + 1);
    },
    { isActive: isFocused },
  );

  return React.createElement(
    Box,
    { borderStyle: "single", borderColor: "cyan", paddingX: 1, paddingY: 1, marginBottom: 1 },
    React.createElement(
      Box,
      { flexDirection: "column" },
      React.createElement(Text, { bold: true }, `${title}${isFocused ? " (focused)" : ""}`),
      React.createElement(Text, null, `Count: ${count}`),
      React.createElement(Text, { dimColor: true }, "Enter to increment"),
    ),
  );
};
