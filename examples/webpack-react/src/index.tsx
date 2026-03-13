import { instrument } from "bippy";
import { createRoot } from "react-dom/client";
import { App } from "./app";

instrument({
  name: "webpack-react-example",
  onCommitFiberRoot: () => {},
});

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
}
