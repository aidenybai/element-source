import type { ElementSourceInfo } from "../types.js";
import { DEFAULT_MAX_STACK_LINES } from "../constants.js";
import { formatStackFrame } from "./format-stack-frame.js";

export const formatStack = (
  stack: ElementSourceInfo[],
  maxLines = DEFAULT_MAX_STACK_LINES,
): string => {
  if (maxLines < 1 || stack.length < 1) return "";
  return stack.slice(0, maxLines).map(formatStackFrame).join("");
};
