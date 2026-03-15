import type { ElementSourceInfo, FrameworkResolver } from "../types.js";
import { isRecord } from "../utils/is-record.js";
import { readNumber } from "../utils/read-number.js";
import { readString } from "../utils/read-string.js";

interface PreactVNode extends Record<string, unknown> {
  type?: unknown;
  props?: Record<string, unknown>;
  __k?: Array<PreactVNode | null> | null;
  __?: PreactVNode | null;
  __o?: PreactVNode | null;
  __e?: Node | null;
  __source?: Record<string, unknown>;
}

const COMPONENT_NAME_FRAGMENT = "Fragment";
const ROOT_VNODE_PROPERTY = "__k";
const VNODE_CHILDREN_PROPERTY = "__k";
const VNODE_CONSTRUCTOR_PROPERTY = "constructor";
const VNODE_DOM_PROPERTY = "__e";
const VNODE_OWNER_PROPERTY = "__o";
const VNODE_PARENT_PROPERTY = "__";
const VNODE_PROPS_PROPERTY = "props";
const VNODE_SOURCE_PROPERTY = "__source";
const VNODE_TYPE_PROPERTY = "type";
const SOURCE_COLUMN_NUMBER_PROPERTY = "columnNumber";
const SOURCE_FILE_NAME_PROPERTY = "fileName";
const SOURCE_LINE_NUMBER_PROPERTY = "lineNumber";

const isPreactVNode = (value: unknown): value is PreactVNode => {
  if (!isRecord(value)) return false;
  if (Reflect.get(value, VNODE_CONSTRUCTOR_PROPERTY) !== undefined) return false;
  return (
    Reflect.has(value, VNODE_TYPE_PROPERTY) &&
    Reflect.has(value, VNODE_DOM_PROPERTY) &&
    Reflect.has(value, VNODE_CHILDREN_PROPERTY)
  );
};

const readVNode = (value: unknown): PreactVNode | null => (isPreactVNode(value) ? value : null);

const getVNodeChildren = (vnode: PreactVNode): PreactVNode[] => {
  const children = Reflect.get(vnode, VNODE_CHILDREN_PROPERTY);
  if (!Array.isArray(children)) return [];
  return children.filter((child): child is PreactVNode => isPreactVNode(child));
};

const getVNodeParent = (vnode: PreactVNode): PreactVNode | null =>
  readVNode(Reflect.get(vnode, VNODE_PARENT_PROPERTY));

const getVNodeOwner = (vnode: PreactVNode): PreactVNode | null =>
  readVNode(Reflect.get(vnode, VNODE_OWNER_PROPERTY));

const getVNodeDom = (vnode: PreactVNode): Node | null => {
  if (typeof Node === "undefined") return null;
  const dom = Reflect.get(vnode, VNODE_DOM_PROPERTY);
  return dom instanceof Node ? dom : null;
};

const getComponentName = (vnode: PreactVNode): string | null => {
  const type = Reflect.get(vnode, VNODE_TYPE_PROPERTY);
  if (typeof type !== "function") return null;

  const displayName =
    readString(Reflect.get(type, "displayName")) ?? readString(Reflect.get(type, "name"));
  if (!displayName || displayName === COMPONENT_NAME_FRAGMENT) return null;
  return displayName;
};

const getNearestComponentName = (vnode: PreactVNode): string | null => {
  let current: PreactVNode | null = vnode;

  while (current) {
    const componentName = getComponentName(current);
    if (componentName) return componentName;
    current = getVNodeOwner(current) ?? getVNodeParent(current);
  }

  return null;
};

const getSourceRecord = (vnode: PreactVNode): Record<string, unknown> | null => {
  const source = Reflect.get(vnode, VNODE_SOURCE_PROPERTY);
  if (isRecord(source)) return source;

  const props = Reflect.get(vnode, VNODE_PROPS_PROPERTY);
  if (!isRecord(props)) return null;

  const propsSource = Reflect.get(props, VNODE_SOURCE_PROPERTY);
  return isRecord(propsSource) ? propsSource : null;
};

const createSourceInfo = (
  vnode: PreactVNode,
  componentName: string | null,
): ElementSourceInfo | null => {
  const source = getSourceRecord(vnode);
  if (!source) return null;

  const filePath = readString(Reflect.get(source, SOURCE_FILE_NAME_PROPERTY));
  const lineNumber = readNumber(Reflect.get(source, SOURCE_LINE_NUMBER_PROPERTY));
  const columnNumber = readNumber(Reflect.get(source, SOURCE_COLUMN_NUMBER_PROPERTY));
  if (!filePath || lineNumber === null) return null;

  return {
    filePath,
    lineNumber,
    columnNumber,
    componentName,
  };
};

const getRootVNode = (element: Element): PreactVNode | null => {
  let current: Element | null = element;

  while (current) {
    const rootVNode = readVNode(Reflect.get(current, ROOT_VNODE_PROPERTY));
    if (rootVNode) return rootVNode;
    current = current.parentElement;
  }

  return null;
};

const hostVNodeContainsElement = (vnode: PreactVNode, element: Element): boolean => {
  const type = Reflect.get(vnode, VNODE_TYPE_PROPERTY);
  if (typeof type !== "string") return true;

  const dom = getVNodeDom(vnode);
  if (!dom) return false;
  if (dom === element) return true;
  return dom instanceof Element ? dom.contains(element) : false;
};

const findVNodeForElement = (vnode: PreactVNode, element: Element): PreactVNode | null => {
  if (!hostVNodeContainsElement(vnode, element)) return null;

  for (const child of getVNodeChildren(vnode)) {
    const match = findVNodeForElement(child, element);
    if (match) return match;
  }

  const type = Reflect.get(vnode, VNODE_TYPE_PROPERTY);
  if (typeof type !== "string") return null;

  return getVNodeDom(vnode) === element ? vnode : null;
};

const resolveVNode = (element: Element): PreactVNode | null => {
  const rootVNode = getRootVNode(element);
  if (!rootVNode) return null;
  return findVNodeForElement(rootVNode, element);
};

const getAncestorComponents = (vnode: PreactVNode): PreactVNode[] => {
  const components: PreactVNode[] = [];

  let currentOwner = getVNodeOwner(vnode);
  if (currentOwner) {
    while (currentOwner) {
      if (getComponentName(currentOwner)) components.push(currentOwner);
      currentOwner = getVNodeOwner(currentOwner);
    }
    return components;
  }

  let currentParent = getVNodeParent(vnode);
  while (currentParent) {
    if (getComponentName(currentParent)) components.push(currentParent);
    currentParent = getVNodeParent(currentParent);
  }

  return components;
};

const pushUniqueFrame = (
  frames: ElementSourceInfo[],
  seen: Set<string>,
  frame: ElementSourceInfo,
): void => {
  const identity = `${frame.filePath}:${frame.lineNumber}:${frame.columnNumber ?? ""}:${frame.componentName ?? ""}`;
  if (seen.has(identity)) return;
  seen.add(identity);
  frames.push(frame);
};

const resolveStack = (element: Element): ElementSourceInfo[] => {
  const vnode = resolveVNode(element);
  if (!vnode) return [];

  const componentName = getNearestComponentName(vnode);
  const frames: ElementSourceInfo[] = [];
  const seen = new Set<string>();

  const primaryFrame = createSourceInfo(vnode, componentName);
  if (primaryFrame) pushUniqueFrame(frames, seen, primaryFrame);

  let skippedPrimaryOwner = false;

  for (const ancestor of getAncestorComponents(vnode)) {
    const ancestorName = getComponentName(ancestor);
    if (!ancestorName) continue;

    if (!skippedPrimaryOwner && primaryFrame && componentName && ancestorName === componentName) {
      skippedPrimaryOwner = true;
      continue;
    }

    skippedPrimaryOwner = true;

    const frame = createSourceInfo(ancestor, ancestorName);
    if (!frame) continue;
    pushUniqueFrame(frames, seen, frame);
  }

  return frames;
};

const resolveComponentName = (element: Element): string | null => {
  const vnode = resolveVNode(element);
  if (!vnode) return null;
  return getNearestComponentName(vnode);
};

export const preactResolver: FrameworkResolver = {
  name: "preact",
  resolveStack,
  resolveComponentName,
};
