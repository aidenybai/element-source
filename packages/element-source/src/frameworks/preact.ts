import type { ElementSourceInfo, FrameworkResolver } from "../types.js";
import { isRecord } from "../utils/is-record.js";
import { readString } from "../utils/read-string.js";
import { readNumber } from "../utils/read-number.js";

const PREACT_VNODE_PROPERTY = "__preactVNode";

const getPreactVNode = (element: Element): Record<string, unknown> | null => {
  const vnode = Reflect.get(element, PREACT_VNODE_PROPERTY);
  return isRecord(vnode) ? vnode : null;
};

const getNearestPreactVNode = (element: Element): Record<string, unknown> | null => {
  let current: Element | null = element;
  while (current) {
    const vnode = getPreactVNode(current);
    if (vnode) return vnode;
    current = current.parentElement;
  }
  return null;
};

const getVNodeParent = (vnode: Record<string, unknown>): Record<string, unknown> | null => {
  const parent = vnode._parent ?? vnode.__;
  return isRecord(parent) ? parent : null;
};

const readSource = (
  vnode: Record<string, unknown>,
): { fileName: string; lineNumber: number } | null => {
  const props = isRecord(vnode.props) ? vnode.props : null;
  const source = vnode.__source ?? (props ? props.__source : undefined);
  if (!isRecord(source)) return null;

  const fileName = readString(source.fileName);
  const lineNumber = readNumber(source.lineNumber);
  if (!fileName || lineNumber === null) return null;

  return { fileName, lineNumber };
};

const getComponentName = (vnode: Record<string, unknown>): string | null => {
  const vnodeType = vnode.type;
  if (typeof vnodeType !== "function") return null;
  const functionType = vnodeType as { displayName?: string; name?: string };
  return readString(functionType.displayName) ?? readString(functionType.name);
};

const findNearestComponentName = (vnode: Record<string, unknown>): string | null => {
  let current = getVNodeParent(vnode);
  while (current) {
    const name = getComponentName(current);
    if (name) return name;
    current = getVNodeParent(current);
  }
  return null;
};

const resolveStack = (element: Element): ElementSourceInfo[] => {
  const hostVNode = getNearestPreactVNode(element);
  if (!hostVNode) return [];

  const frames: ElementSourceInfo[] = [];
  const seen = new Set<string>();

  const hostSource = readSource(hostVNode);
  if (hostSource) {
    const identity = `${hostSource.fileName}:${hostSource.lineNumber}`;
    seen.add(identity);
    frames.push({
      filePath: hostSource.fileName,
      lineNumber: hostSource.lineNumber,
      columnNumber: null,
      componentName: findNearestComponentName(hostVNode),
    });
  }

  let current = getVNodeParent(hostVNode);
  while (current) {
    if (typeof current.type === "function") {
      const source = readSource(current);
      const name = getComponentName(current);
      if (source) {
        const identity = `${source.fileName}:${source.lineNumber}`;
        if (!seen.has(identity)) {
          seen.add(identity);
          frames.push({
            filePath: source.fileName,
            lineNumber: source.lineNumber,
            columnNumber: null,
            componentName: name,
          });
        }
      }
    }
    current = getVNodeParent(current);
  }

  return frames;
};

export const preactResolver: FrameworkResolver = {
  name: "preact",
  resolveStack,
};
