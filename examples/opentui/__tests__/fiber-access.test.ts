import { describe, it, expect } from "bun:test";
import { instrument } from "bippy";
import { resolveElementInfo, getTagName } from "element-source";

instrument({
  name: "opentui-test",
  onCommitFiberRoot: () => {},
});

describe("OpenTUI fiber access", () => {
  it("bippy instrumentation activates in Bun", () => {
    expect(typeof globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__).toBe("object");
  });

  it("bippy hook is installed on globalThis", () => {
    const hook = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    expect(hook).toBeDefined();
    expect(typeof hook.inject).toBe("function");
  });

  it("resolveElementInfo accepts object input", async () => {
    const mockNode = { nodeName: "opentui-box" };
    const info = await resolveElementInfo(mockNode);

    expect(info.tagName).toBe("opentui-box");
    expect(info.source).toBeNull();
    expect(info.stack).toHaveLength(0);
  });

  it("getTagName handles OpenTUI-like nodes", () => {
    expect(getTagName({ nodeName: "opentui-box" })).toBe("opentui-box");
    expect(getTagName({ nodeName: "opentui-text" })).toBe("opentui-text");
    expect(getTagName({})).toBe("");
  });

  it("resolveElementInfo works for Solid-based OpenTUI nodes", async () => {
    const solidNode = { nodeName: "opentui-box" };
    const info = await resolveElementInfo(solidNode);

    expect(info.tagName).toBe("opentui-box");
    expect(typeof info.componentName).toBe("object");
    expect(info.stack).toHaveLength(0);
  });
});
