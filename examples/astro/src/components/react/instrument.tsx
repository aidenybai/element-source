import { useEffect } from "react";
import { instrument } from "bippy";

const Instrument = () => {
  useEffect(() => {
    instrument({
      name: "astro-element-source",
      onCommitFiberRoot: () => {},
    });
  }, []);
  return null;
};

export default Instrument;
