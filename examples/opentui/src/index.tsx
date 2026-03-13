import { instrument } from "bippy";
import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { App } from "./app";

instrument({
  name: "opentui-element-source",
  onCommitFiberRoot: () => {},
});

const renderer = await createCliRenderer({ exitOnCtrlC: true });
createRoot(renderer).render(<App />);
