import type { ElementSourceInfo } from "../types.js";

const formatSourceLocation = (sourceInfo: ElementSourceInfo): string => {
  const parts = [sourceInfo.filePath];
  if (sourceInfo.lineNumber !== null) {
    parts.push(String(sourceInfo.lineNumber));
  }
  if (sourceInfo.columnNumber !== null) {
    parts.push(String(sourceInfo.columnNumber));
  }
  return parts.join(":");
};

export const formatStackFrame = (frame: ElementSourceInfo): string => {
  const location = formatSourceLocation(frame);
  if (frame.componentName) {
    return `\n  in ${frame.componentName} (at ${location})`;
  }
  return `\n  in ${location}`;
};
