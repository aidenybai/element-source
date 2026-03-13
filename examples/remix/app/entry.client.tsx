import { instrument } from "bippy";
import { RemixBrowser } from "@remix-run/react";
import { startTransition } from "react";
import { hydrateRoot } from "react-dom/client";

instrument({
  name: "remix-example",
  onCommitFiberRoot: () => {},
});

startTransition(() => {
  hydrateRoot(document, <RemixBrowser />);
});
