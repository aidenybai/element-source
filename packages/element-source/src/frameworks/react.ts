import {
  getFiberFromHostInstance,
  isInstrumentationActive,
  getDisplayName,
  isCompositeFiber,
  traverseFiber,
  type Fiber,
} from "bippy";
import {
  isSourceFile,
  normalizeFileName,
  getOwnerStack,
  formatOwnerStack,
  hasDebugStack,
  parseStack,
  type StackFrame,
} from "bippy/source";
import type { ElementSourceInfo, FrameworkResolver } from "../types.js";
import { MIN_COMPONENT_NAME_LENGTH_CHARS, SYMBOLICATION_TIMEOUT_MS } from "../constants.js";

interface NextJsRequestFrame {
  file: string;
  methodName: string;
  line1: number | null;
  column1: number | null;
  arguments: string[];
}

interface NextJsFrameResult {
  status: string;
  value?: {
    originalStackFrame: {
      file: string | null;
      line1: number | null;
      column1: number | null;
      ignored: boolean;
    } | null;
  };
}

const NON_COMPONENT_PREFIXES = [
  "_",
  "$",
  "motion.",
  "styled.",
  "chakra.",
  "ark.",
  "Primitive.",
  "Slot.",
];

const NEXT_INTERNAL_NAMES = new Set([
  "InnerLayoutRouter",
  "RedirectErrorBoundary",
  "RedirectBoundary",
  "HTTPAccessFallbackErrorBoundary",
  "HTTPAccessFallbackBoundary",
  "LoadingBoundary",
  "ErrorBoundary",
  "InnerScrollAndFocusHandler",
  "ScrollAndFocusHandler",
  "RenderFromTemplateContext",
  "OuterLayoutRouter",
  "body",
  "html",
  "DevRootHTTPAccessFallbackBoundary",
  "AppDevOverlayErrorBoundary",
  "AppDevOverlay",
  "HotReload",
  "Router",
  "ErrorBoundaryHandler",
  "AppRouter",
  "ServerRoot",
  "SegmentStateProvider",
  "RootErrorBoundary",
  "LoadableComponent",
  "MotionDOMComponent",
]);

const REACT_INTERNAL_NAMES = new Set([
  "Suspense",
  "Fragment",
  "StrictMode",
  "Profiler",
  "SuspenseList",
]);

let cachedIsNextProject: boolean | undefined;

export const checkIsNextProject = (): boolean => {
  cachedIsNextProject ??=
    typeof document !== "undefined" &&
    Boolean(document.getElementById("__NEXT_DATA__") || document.querySelector("nextjs-portal"));
  return cachedIsNextProject;
};

const isInternalComponentName = (name: string): boolean => {
  if (NEXT_INTERNAL_NAMES.has(name)) return true;
  if (REACT_INTERNAL_NAMES.has(name)) return true;
  return NON_COMPONENT_PREFIXES.some((prefix) => name.startsWith(prefix));
};

export const isSourceComponentName = (name: string): boolean => {
  if (name.length <= MIN_COMPONENT_NAME_LENGTH_CHARS) return false;
  if (isInternalComponentName(name)) return false;
  if (name[0] !== name[0].toUpperCase()) return false;
  if (name.includes("Provider") || name.includes("Context")) return false;
  return true;
};

const isUsefulComponentName = (name: string): boolean => {
  if (!name) return false;
  if (isInternalComponentName(name)) return false;
  if (name === "SlotClone" || name === "Slot") return false;
  return true;
};

const SERVER_COMPONENT_URL_PREFIXES = ["about://React/", "rsc://React/"];

const isServerComponentUrl = (url: string): boolean =>
  SERVER_COMPONENT_URL_PREFIXES.some((prefix) => url.startsWith(prefix));

const devirtualizeServerUrl = (url: string): string => {
  for (const prefix of SERVER_COMPONENT_URL_PREFIXES) {
    if (!url.startsWith(prefix)) continue;
    const envEnd = url.indexOf("/", prefix.length);
    const queryStart = url.lastIndexOf("?");
    if (envEnd > -1 && queryStart > -1) {
      return decodeURI(url.slice(envEnd + 1, queryStart));
    }
  }
  return url;
};

const symbolicateServerFrames = async (frames: StackFrame[]): Promise<StackFrame[]> => {
  const serverIndices: number[] = [];
  const requestFrames: NextJsRequestFrame[] = [];

  for (let index = 0; index < frames.length; index++) {
    const frame = frames[index];
    if (!frame.isServer || !frame.fileName) continue;
    serverIndices.push(index);
    requestFrames.push({
      file: devirtualizeServerUrl(frame.fileName),
      methodName: frame.functionName ?? "<unknown>",
      line1: frame.lineNumber ?? null,
      column1: frame.columnNumber ?? null,
      arguments: [],
    });
  }

  if (requestFrames.length === 0) return frames;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SYMBOLICATION_TIMEOUT_MS);

  try {
    const response = await fetch("/__nextjs_original-stack-frames", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        frames: requestFrames,
        isServer: true,
        isEdgeServer: false,
        isAppDirectory: true,
      }),
      signal: controller.signal,
    });

    if (!response.ok) return frames;

    const results: NextJsFrameResult[] = await response.json();
    const resolved = [...frames];

    for (let index = 0; index < serverIndices.length; index++) {
      const result = results[index];
      if (result?.status !== "fulfilled") continue;
      const original = result.value?.originalStackFrame;
      if (!original?.file || original.ignored) continue;

      const frameIndex = serverIndices[index];
      resolved[frameIndex] = {
        ...frames[frameIndex],
        fileName: original.file,
        lineNumber: original.line1 ?? undefined,
        columnNumber: original.column1 ?? undefined,
        isSymbolicated: true,
      };
    }

    return resolved;
  } catch {
    return frames;
  } finally {
    clearTimeout(timeout);
  }
};

const extractServerFramesFromDebugStack = (rootFiber: Fiber): Map<string, StackFrame> => {
  const serverFramesByName = new Map<string, StackFrame>();

  traverseFiber(
    rootFiber,
    (currentFiber) => {
      if (!hasDebugStack(currentFiber)) return false;

      const ownerStack = formatOwnerStack(currentFiber._debugStack.stack);
      if (!ownerStack) return false;

      for (const frame of parseStack(ownerStack)) {
        if (!frame.functionName || !frame.fileName) continue;
        if (!isServerComponentUrl(frame.fileName)) continue;
        if (serverFramesByName.has(frame.functionName)) continue;
        serverFramesByName.set(frame.functionName, { ...frame, isServer: true });
      }
      return false;
    },
    true,
  );

  return serverFramesByName;
};

const enrichServerFrameLocations = (rootFiber: Fiber, frames: StackFrame[]): StackFrame[] => {
  const hasUnresolved = frames.some(
    (frame) => frame.isServer && !frame.fileName && frame.functionName,
  );
  if (!hasUnresolved) return frames;

  const serverFramesByName = extractServerFramesFromDebugStack(rootFiber);
  if (serverFramesByName.size === 0) return frames;

  return frames.map((frame) => {
    if (!frame.isServer || frame.fileName || !frame.functionName) return frame;
    const resolved = serverFramesByName.get(frame.functionName);
    if (!resolved) return frame;
    return {
      ...frame,
      fileName: resolved.fileName,
      lineNumber: resolved.lineNumber,
      columnNumber: resolved.columnNumber,
    };
  });
};

const findNearestFiberElement = (element: Element): Element => {
  if (!isInstrumentationActive()) return element;
  let current: Element | null = element;
  while (current) {
    if (getFiberFromHostInstance(current)) return current;
    current = current.parentElement;
  }
  return element;
};

const stackCache = new WeakMap<Element, Promise<StackFrame[] | null>>();

const fetchStackForElement = async (element: Element): Promise<StackFrame[] | null> => {
  try {
    const fiber = getFiberFromHostInstance(element);
    if (!fiber) return null;

    const frames = await getOwnerStack(fiber);

    if (checkIsNextProject()) {
      const enriched = enrichServerFrameLocations(fiber, frames);
      return symbolicateServerFrames(enriched);
    }

    return frames;
  } catch {
    return null;
  }
};

export const getReactStack = (element: Element): Promise<StackFrame[] | null> => {
  if (!isInstrumentationActive()) return Promise.resolve([]);

  const resolved = findNearestFiberElement(element);
  const cached = stackCache.get(resolved);
  if (cached) return cached;

  const promise = fetchStackForElement(resolved);
  stackCache.set(resolved, promise);
  return promise;
};

const resolveSourceFromStack = (stack: StackFrame[] | null): ElementSourceInfo | null => {
  if (!stack || stack.length === 0) return null;

  for (const frame of stack) {
    if (frame.fileName && isSourceFile(frame.fileName)) {
      return {
        filePath: normalizeFileName(frame.fileName),
        lineNumber: frame.lineNumber ?? null,
        columnNumber: null,
        componentName:
          frame.functionName && isSourceComponentName(frame.functionName)
            ? frame.functionName
            : null,
      };
    }
  }

  return null;
};

const resolveStack = async (element: Element): Promise<ElementSourceInfo[]> => {
  const stack = await getReactStack(element);
  const source = resolveSourceFromStack(stack);
  return source ? [source] : [];
};

const resolveComponentName = async (element: Element): Promise<string | null> => {
  if (!isInstrumentationActive()) return null;

  const stack = await getReactStack(element);
  if (stack) {
    for (const frame of stack) {
      if (frame.functionName && isSourceComponentName(frame.functionName)) {
        return frame.functionName;
      }
    }
  }

  const resolved = findNearestFiberElement(element);
  const fiber = getFiberFromHostInstance(resolved);
  if (!fiber) return null;

  let current = fiber.return;
  while (current) {
    if (isCompositeFiber(current)) {
      const name = getDisplayName(current.type);
      if (name && isUsefulComponentName(name)) return name;
    }
    current = current.return;
  }

  return null;
};

export const reactResolver: FrameworkResolver = {
  name: "react",
  resolveStack,
  resolveComponentName,
};
