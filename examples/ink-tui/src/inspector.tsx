import React, { useRef, useState } from "react";
import { Box, Text, useInput } from "ink";
import type { DOMElement } from "ink";
import { getTagName } from "element-source";

export const Inspector = () => {
  const ref = useRef<DOMElement>(null);
  const [nodeName, setNodeName] = useState<string | null>(null);

  useInput((input) => {
    if (input === "i") {
      const node = ref.current;
      setNodeName(node ? getTagName(node) : null);
    }
  });

  return React.createElement(
    Box,
    { flexDirection: "column", marginTop: 1, borderStyle: "single", padding: 1, ref },
    React.createElement(Text, null, "Press 'i' to inspect, 'q' to quit"),
    nodeName
      ? React.createElement(
          Box,
          { flexDirection: "column", marginTop: 1 },
          React.createElement(Text, null, `nodeName: ${nodeName}`),
          React.createElement(
            Text,
            { dimColor: true },
            "Full source resolution requires DevTools integration (not available in Ink)",
          ),
        )
      : null,
  );
};
