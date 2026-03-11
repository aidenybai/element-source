import type { ElementSourceInfo, FrameworkResolver } from "../types.js";
import { SVELTE_COLUMN_OFFSET } from "../constants.js";
import { isRecord } from "../utils/is-record.js";
import { readString } from "../utils/read-string.js";
import { readNumber } from "../utils/read-number.js";

const SVELTE_META_PROPERTY = "__svelte_meta";

const getNearestSvelteMeta = (element: Element): Record<string, unknown> | null => {
  let current: Element | null = element;
  while (current) {
    const meta = Reflect.get(current, SVELTE_META_PROPERTY);
    if (isRecord(meta)) return meta;
    current = current.parentElement;
  }
  return null;
};

const readSvelteLocation = (
  meta: Record<string, unknown>,
): { filePath: string; lineNumber: number; columnNumber: number } | null => {
  const location = meta.loc;
  if (!isRecord(location)) return null;

  const filePath = readString(location.file);
  const lineNumber = readNumber(location.line);
  const rawColumn = readNumber(location.column);
  if (!filePath || lineNumber === null || rawColumn === null) return null;

  return {
    filePath,
    lineNumber,
    columnNumber: rawColumn + SVELTE_COLUMN_OFFSET,
  };
};

const readComponentNameFromParent = (meta: Record<string, unknown>): string | null => {
  let current = meta.parent;
  while (isRecord(current)) {
    const tag = readString(current.componentTag);
    if (tag) return tag;
    current = current.parent;
  }
  return null;
};

const readParentStackFrames = (meta: Record<string, unknown>): ElementSourceInfo[] => {
  const frames: ElementSourceInfo[] = [];
  let current = meta.parent;

  while (isRecord(current)) {
    const filePath = readString(current.file);
    const lineNumber = readNumber(current.line);
    const rawColumn = readNumber(current.column);
    const componentName = readString(current.componentTag);

    if (filePath && lineNumber !== null && rawColumn !== null) {
      frames.push({
        filePath,
        lineNumber,
        columnNumber: rawColumn + SVELTE_COLUMN_OFFSET,
        componentName,
      });
    }

    current = current.parent;
  }

  return frames;
};

const resolveStack = (element: Element): ElementSourceInfo[] => {
  const meta = getNearestSvelteMeta(element);
  if (!meta) return [];

  const location = readSvelteLocation(meta);
  if (!location) return [];

  const frames: ElementSourceInfo[] = [
    {
      filePath: location.filePath,
      lineNumber: location.lineNumber,
      columnNumber: location.columnNumber,
      componentName: readComponentNameFromParent(meta),
    },
  ];

  const seen = new Set([`${location.filePath}:${location.lineNumber}:${location.columnNumber}`]);

  for (const parentFrame of readParentStackFrames(meta)) {
    const identity = `${parentFrame.filePath}:${parentFrame.lineNumber ?? ""}:${parentFrame.columnNumber ?? ""}`;
    if (seen.has(identity)) continue;
    seen.add(identity);
    frames.push(parentFrame);
  }

  return frames;
};

export const svelteResolver: FrameworkResolver = {
  name: "svelte",
  resolveStack,
};
