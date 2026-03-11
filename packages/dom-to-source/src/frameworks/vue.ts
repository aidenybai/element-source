import type { ElementSourceInfo, FrameworkResolver } from "../types.js";
import { parseSourceLocation } from "../utils/parse-location.js";
import { isRecord } from "../utils/is-record.js";
import { readString } from "../utils/read-string.js";

const INSPECTOR_ATTRIBUTE = "data-v-inspector";
const INSPECTOR_SELECTOR = `[${INSPECTOR_ATTRIBUTE}]`;
const PARENT_COMPONENT_PROPERTY = "__vueParentComponent";

const getVueComponentType = (
  component: Record<string, unknown> | null,
): Record<string, unknown> | null => {
  if (!component) return null;
  const componentType = component.type;
  return isRecord(componentType) ? componentType : null;
};

const getVueParentComponent = (element: Element): Record<string, unknown> | null => {
  const component = Reflect.get(element, PARENT_COMPONENT_PROPERTY);
  return isRecord(component) ? component : null;
};

const getNearestVueComponent = (element: Element): Record<string, unknown> | null => {
  let current: Element | null = element;
  while (current) {
    const component = getVueParentComponent(current);
    if (component) return component;
    current = current.parentElement;
  }
  return null;
};

const getComponentName = (componentType: Record<string, unknown> | null): string | null => {
  if (!componentType) return null;
  return readString(componentType.__name) ?? readString(componentType.name);
};

const getComponentFilePath = (componentType: Record<string, unknown> | null): string | null => {
  if (!componentType) return null;
  return readString(componentType.__file);
};

const getParentComponentFrom = (
  component: Record<string, unknown> | null,
): Record<string, unknown> | null => {
  if (!component) return null;
  const parent = Reflect.get(component, "parent");
  return isRecord(parent) ? parent : null;
};

const getComponentChain = (element: Element): Record<string, unknown>[] => {
  const chain: Record<string, unknown>[] = [];
  let current = getNearestVueComponent(element);

  while (current) {
    chain.push(current);
    current = getParentComponentFrom(current);
  }

  return chain;
};

const getRuntimeStackFrames = (element: Element): ElementSourceInfo[] =>
  getComponentChain(element)
    .map((component): ElementSourceInfo | null => {
      const componentType = getVueComponentType(component);
      const filePath = getComponentFilePath(componentType);
      if (!filePath) return null;
      return {
        filePath,
        lineNumber: null,
        columnNumber: null,
        componentName: getComponentName(componentType),
      };
    })
    .filter((frame): frame is ElementSourceInfo => Boolean(frame));

const resolveFromInspectorAttribute = (element: Element): ElementSourceInfo | null => {
  const sourceElement = element.closest(INSPECTOR_SELECTOR);
  if (!sourceElement) return null;

  const location = sourceElement.getAttribute(INSPECTOR_ATTRIBUTE);
  if (!location) return null;

  const parsed = parseSourceLocation(location);
  if (!parsed) return null;

  const nearestComponent = getNearestVueComponent(element);
  const componentType = getVueComponentType(nearestComponent);

  return {
    filePath: parsed.filePath,
    lineNumber: parsed.lineNumber,
    columnNumber: parsed.columnNumber,
    componentName: getComponentName(componentType),
  };
};

const resolveStack = (element: Element): ElementSourceInfo[] => {
  const frames: ElementSourceInfo[] = [];
  const seen = new Set<string>();

  const inspectorInfo = resolveFromInspectorAttribute(element);
  if (inspectorInfo) {
    const identity = `${inspectorInfo.filePath}|${inspectorInfo.componentName ?? ""}`;
    frames.push(inspectorInfo);
    seen.add(identity);
  }

  for (const runtimeFrame of getRuntimeStackFrames(element)) {
    const identity = `${runtimeFrame.filePath}|${runtimeFrame.componentName ?? ""}`;
    if (seen.has(identity)) continue;
    seen.add(identity);
    frames.push(runtimeFrame);
  }

  return frames;
};

export const vueResolver: FrameworkResolver = {
  name: "vue",
  resolveStack,
};
