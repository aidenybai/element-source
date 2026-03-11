export {
  resolveSource,
  resolveStack,
  resolveComponentName,
  resolveElementInfo,
  createSourceResolver,
} from "./resolve.js";

export {
  reactResolver,
  getReactStack,
  checkIsNextProject,
  isSourceComponentName,
} from "./frameworks/react.js";
export { svelteResolver } from "./frameworks/svelte.js";
export { vueResolver } from "./frameworks/vue.js";
export { solidResolver } from "./frameworks/solid.js";

export { formatStackFrame } from "./utils/format-stack-frame.js";
export { formatStack } from "./utils/format-stack.js";
export { mergeStackContext } from "./utils/merge-stack-context.js";
export { parseSourceLocation } from "./utils/parse-location.js";
export { getTagName } from "./utils/get-tag-name.js";

export type {
  ElementInfo,
  ElementSourceInfo,
  FrameworkResolver,
  ResolverOptions,
  ParsedSourceLocation,
} from "./types.js";

export type { StackFrame } from "bippy/source";
