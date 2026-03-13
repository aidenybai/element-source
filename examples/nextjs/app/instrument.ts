"use client";

import { instrument } from "bippy";

instrument({
  name: "nextjs-element-source",
  onCommitFiberRoot: () => {},
});

export const Instrument = () => null;
