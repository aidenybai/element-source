import { instrument } from "bippy";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { App } from "./app";

instrument({
  name: "react-router-example",
  onCommitFiberRoot: () => {},
});

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );
}
