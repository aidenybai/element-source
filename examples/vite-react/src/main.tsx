import { instrument } from "bippy";
import { createRoot } from "react-dom/client";
import { App } from "./app.jsx";

instrument({
  name: "vite-react-example",
  onCommitFiberRoot: () => {},
});

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
}
