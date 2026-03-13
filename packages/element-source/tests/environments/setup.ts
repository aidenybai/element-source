import { instrument } from "bippy";

instrument({
  name: "node-environment-test",
  onCommitFiberRoot: () => {},
});
