import React, { useState } from "react";
import { Box, Text, useInput, useApp } from "ink";
import { SampleCard } from "./sample-card.js";
import { Inspector } from "./inspector.js";

export const App = () => {
  const { exit } = useApp();
  const [focusedIndex, setFocusedIndex] = useState(0);
  const cardCount = 2;

  useInput((input, key) => {
    if (input === "q") exit();
    if (key.upArrow) setFocusedIndex((prev) => (prev > 0 ? prev - 1 : cardCount - 1));
    if (key.downArrow) setFocusedIndex((prev) => (prev < cardCount - 1 ? prev + 1 : 0));
  });

  return React.createElement(
    Box,
    { flexDirection: "column", padding: 1 },
    React.createElement(Text, { bold: true }, "Element Source - Ink TUI"),
    React.createElement(
      Box,
      { flexDirection: "column", marginTop: 1 },
      React.createElement(SampleCard, {
        key: "counter",
        title: "Counter",
        isFocused: focusedIndex === 0,
      }),
      React.createElement(SampleCard, {
        key: "timer",
        title: "Timer",
        isFocused: focusedIndex === 1,
      }),
    ),
    React.createElement(Inspector, null),
  );
};
