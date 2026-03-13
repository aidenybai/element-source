import { jsx, jsxs } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { RemixServer, Meta, Links, Outlet, Scripts } from "@remix-run/react";
import * as isbotModule from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { useState, useEffect } from "react";
import { isInstrumentationActive, getFiberFromHostInstance, isCompositeFiber, getDisplayName, traverseFiber } from "bippy";
import { isSourceFile, normalizeFileName, getOwnerStack, hasDebugStack, formatOwnerStack, parseStack } from "bippy/source";
const ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, remixContext, loadContext) {
  let prohibitOutOfOrderStreaming = isBotRequest(request.headers.get("user-agent")) || remixContext.isSpaMode;
  return prohibitOutOfOrderStreaming ? handleBotRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  ) : handleBrowserRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  );
}
function isBotRequest(userAgent) {
  if (!userAgent) {
    return false;
  }
  if ("isbot" in isbotModule && typeof isbotModule.isbot === "function") {
    return isbotModule.isbot(userAgent);
  }
  if ("default" in isbotModule && typeof isbotModule.default === "function") {
    return isbotModule.default(userAgent);
  }
  return false;
}
function handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
const Root = () => /* @__PURE__ */ jsxs("html", { lang: "en", children: [
  /* @__PURE__ */ jsxs("head", { children: [
    /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
    /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
    /* @__PURE__ */ jsx(Meta, {}),
    /* @__PURE__ */ jsx(Links, {})
  ] }),
  /* @__PURE__ */ jsxs("body", { style: { margin: 0, padding: 0, boxSizing: "border-box" }, children: [
    /* @__PURE__ */ jsx(Outlet, {}),
    /* @__PURE__ */ jsx(Scripts, {})
  ] })
] });
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Root
}, Symbol.toStringTag, { value: "Module" }));
const SampleCard = ({ title }) => {
  const [count, setCount] = useState(0);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      "data-testid": "sample-card",
      style: {
        border: "1px solid #e0e0e0",
        borderRadius: 12,
        padding: 16,
        background: "#fafafa"
      },
      children: [
        /* @__PURE__ */ jsx("h3", { style: { fontSize: 16, marginBottom: 8 }, children: title }),
        /* @__PURE__ */ jsxs("p", { style: { color: "#444", marginBottom: 12, fontSize: 14 }, children: [
          "Count: ",
          count
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setCount((previous) => previous + 1),
            style: {
              padding: "8px 16px",
              border: "none",
              borderRadius: 8,
              background: "#4a90d9",
              color: "white",
              fontSize: 14,
              cursor: "pointer"
            },
            children: "Increment"
          }
        )
      ]
    }
  );
};
var SYMBOLICATION_TIMEOUT_MS = 5e3;
var MAX_SOURCE_CONTEXT_WINDOW_CHARS = 4e3;
var SOURCE_CONTEXT_HALF_WINDOW_CHARS = MAX_SOURCE_CONTEXT_WINDOW_CHARS / 2;
var SOLID_HANDLER_SOURCE_LENGTH_MIN_CHARS = 3;
var SVELTE_COLUMN_OFFSET = 1;
var SOURCE_LINE_START_COLUMN = 1;
var MIN_COMPONENT_NAME_LENGTH_CHARS = 1;
var isElement = (node) => typeof Element !== "undefined" && node instanceof Element;
var NON_COMPONENT_PREFIXES = [
  "_",
  "$",
  "motion.",
  "styled.",
  "chakra.",
  "ark.",
  "Primitive.",
  "Slot."
];
var NEXT_INTERNAL_NAMES = /* @__PURE__ */ new Set([
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
  "MotionDOMComponent"
]);
var REACT_INTERNAL_NAMES = /* @__PURE__ */ new Set([
  "Suspense",
  "Fragment",
  "StrictMode",
  "Profiler",
  "SuspenseList"
]);
var cachedIsNextProject;
var checkIsNextProject = (revalidate) => {
  cachedIsNextProject ?? (cachedIsNextProject = typeof document !== "undefined" && Boolean(document.getElementById("__NEXT_DATA__") || document.querySelector("nextjs-portal")));
  return cachedIsNextProject;
};
var isInternalComponentName = (name) => {
  if (NEXT_INTERNAL_NAMES.has(name)) return true;
  if (REACT_INTERNAL_NAMES.has(name)) return true;
  return NON_COMPONENT_PREFIXES.some((prefix) => name.startsWith(prefix));
};
var isSourceComponentName = (name) => {
  if (name.length <= MIN_COMPONENT_NAME_LENGTH_CHARS) return false;
  if (isInternalComponentName(name)) return false;
  if (name[0] !== name[0].toUpperCase()) return false;
  if (name.includes("Provider") || name.includes("Context")) return false;
  return true;
};
var isUsefulComponentName = (name) => {
  if (!name) return false;
  if (isInternalComponentName(name)) return false;
  if (name === "SlotClone" || name === "Slot") return false;
  return true;
};
var SERVER_COMPONENT_URL_PREFIXES = ["about://React/", "rsc://React/"];
var isServerComponentUrl = (url) => SERVER_COMPONENT_URL_PREFIXES.some((prefix) => url.startsWith(prefix));
var devirtualizeServerUrl = (url) => {
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
var symbolicateServerFrames = async (frames) => {
  var _a;
  const serverIndices = [];
  const requestFrames = [];
  for (let index = 0; index < frames.length; index++) {
    const frame = frames[index];
    if (!frame.isServer || !frame.fileName) continue;
    serverIndices.push(index);
    requestFrames.push({
      file: devirtualizeServerUrl(frame.fileName),
      methodName: frame.functionName ?? "<unknown>",
      line1: frame.lineNumber ?? null,
      column1: frame.columnNumber ?? null,
      arguments: []
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
        isAppDirectory: true
      }),
      signal: controller.signal
    });
    if (!response.ok) return frames;
    const results = await response.json();
    const resolved = [...frames];
    for (let index = 0; index < serverIndices.length; index++) {
      const result = results[index];
      if ((result == null ? void 0 : result.status) !== "fulfilled") continue;
      const original = (_a = result.value) == null ? void 0 : _a.originalStackFrame;
      if (!(original == null ? void 0 : original.file) || original.ignored) continue;
      const frameIndex = serverIndices[index];
      resolved[frameIndex] = {
        ...frames[frameIndex],
        fileName: original.file,
        lineNumber: original.line1 ?? void 0,
        columnNumber: original.column1 ?? void 0,
        isSymbolicated: true
      };
    }
    return resolved;
  } catch {
    return frames;
  } finally {
    clearTimeout(timeout);
  }
};
var extractServerFramesFromDebugStack = (rootFiber) => {
  const serverFramesByName = /* @__PURE__ */ new Map();
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
    true
  );
  return serverFramesByName;
};
var enrichServerFrameLocations = (rootFiber, frames) => {
  const hasUnresolved = frames.some(
    (frame) => frame.isServer && !frame.fileName && frame.functionName
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
      columnNumber: resolved.columnNumber
    };
  });
};
var findNearestFiberNode = (node) => {
  if (!isInstrumentationActive()) return node;
  if (getFiberFromHostInstance(node)) return node;
  if (isElement(node)) {
    let current = node.parentElement;
    while (current) {
      if (getFiberFromHostInstance(current)) return current;
      current = current.parentElement;
    }
  }
  return node;
};
var stackCache = /* @__PURE__ */ new WeakMap();
var fetchStackForNode = async (node) => {
  try {
    const fiber = getFiberFromHostInstance(node);
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
var getReactStack = (node) => {
  if (!isInstrumentationActive()) return Promise.resolve([]);
  const resolved = findNearestFiberNode(node);
  const cached = stackCache.get(resolved);
  if (cached) return cached;
  const promise = fetchStackForNode(resolved);
  stackCache.set(resolved, promise);
  return promise;
};
var resolveSourceFromStack = (stack) => {
  if (!stack || stack.length === 0) return null;
  for (const frame of stack) {
    if (frame.fileName && isSourceFile(frame.fileName)) {
      return {
        filePath: normalizeFileName(frame.fileName),
        lineNumber: frame.lineNumber ?? null,
        columnNumber: null,
        componentName: frame.functionName && isSourceComponentName(frame.functionName) ? frame.functionName : null
      };
    }
  }
  return null;
};
var resolveStack = async (node) => {
  const stack = await getReactStack(node);
  const source = resolveSourceFromStack(stack);
  return source ? [source] : [];
};
var resolveComponentName = async (node) => {
  if (!isInstrumentationActive()) return null;
  const stack = await getReactStack(node);
  if (stack) {
    for (const frame of stack) {
      if (frame.functionName && isSourceComponentName(frame.functionName)) {
        return frame.functionName;
      }
    }
  }
  const resolved = findNearestFiberNode(node);
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
var reactResolver = {
  name: "react",
  resolveStack,
  resolveComponentName
};
var isRecord = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
var readString = (value) => typeof value === "string" ? value : null;
var readNumber = (value) => typeof value === "number" && Number.isFinite(value) ? value : null;
var SVELTE_META_PROPERTY = "__svelte_meta";
var getNearestSvelteMeta = (element) => {
  let current = element;
  while (current) {
    const meta = Reflect.get(current, SVELTE_META_PROPERTY);
    if (isRecord(meta)) return meta;
    current = current.parentElement;
  }
  return null;
};
var readSvelteLocation = (meta) => {
  const location = meta.loc;
  if (!isRecord(location)) return null;
  const filePath = readString(location.file);
  const lineNumber = readNumber(location.line);
  const rawColumn = readNumber(location.column);
  if (!filePath || lineNumber === null || rawColumn === null) return null;
  return {
    filePath,
    lineNumber,
    columnNumber: rawColumn + SVELTE_COLUMN_OFFSET
  };
};
var readComponentNameFromParent = (meta) => {
  let current = meta.parent;
  while (isRecord(current)) {
    const tag = readString(current.componentTag);
    if (tag) return tag;
    current = current.parent;
  }
  return null;
};
var readParentStackFrames = (meta) => {
  const frames = [];
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
        componentName
      });
    }
    current = current.parent;
  }
  return frames;
};
var resolveStack2 = (element) => {
  const meta = getNearestSvelteMeta(element);
  if (!meta) return [];
  const location = readSvelteLocation(meta);
  if (!location) return [];
  const frames = [
    {
      filePath: location.filePath,
      lineNumber: location.lineNumber,
      columnNumber: location.columnNumber,
      componentName: readComponentNameFromParent(meta)
    }
  ];
  const seen = /* @__PURE__ */ new Set([`${location.filePath}:${location.lineNumber}:${location.columnNumber}`]);
  for (const parentFrame of readParentStackFrames(meta)) {
    const identity = `${parentFrame.filePath}:${parentFrame.lineNumber ?? ""}:${parentFrame.columnNumber ?? ""}`;
    if (seen.has(identity)) continue;
    seen.add(identity);
    frames.push(parentFrame);
  }
  return frames;
};
var svelteResolver = {
  name: "svelte",
  resolveStack: resolveStack2
};
var SOURCE_DELIMITER = ":";
var parsePositiveInteger = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) return null;
  return parsed;
};
var parseSourceLocation = (location) => {
  const lastDelimiterIndex = location.lastIndexOf(SOURCE_DELIMITER);
  if (lastDelimiterIndex === -1) return null;
  const secondLastDelimiterIndex = location.lastIndexOf(SOURCE_DELIMITER, lastDelimiterIndex - 1);
  if (secondLastDelimiterIndex === -1) return null;
  const filePath = location.slice(0, secondLastDelimiterIndex);
  if (!filePath) return null;
  const lineValue = location.slice(secondLastDelimiterIndex + 1, lastDelimiterIndex);
  const columnValue = location.slice(lastDelimiterIndex + 1);
  const lineNumber = parsePositiveInteger(lineValue);
  const columnNumber = parsePositiveInteger(columnValue);
  if (lineNumber === null || columnNumber === null) return null;
  return { filePath, lineNumber, columnNumber };
};
var INSPECTOR_ATTRIBUTE = "data-v-inspector";
var INSPECTOR_SELECTOR = `[${INSPECTOR_ATTRIBUTE}]`;
var PARENT_COMPONENT_PROPERTY = "__vueParentComponent";
var getVueComponentType = (component) => {
  if (!component) return null;
  const componentType = component.type;
  return isRecord(componentType) ? componentType : null;
};
var getVueParentComponent = (element) => {
  const component = Reflect.get(element, PARENT_COMPONENT_PROPERTY);
  return isRecord(component) ? component : null;
};
var getNearestVueComponent = (element) => {
  let current = element;
  while (current) {
    const component = getVueParentComponent(current);
    if (component) return component;
    current = current.parentElement;
  }
  return null;
};
var getComponentName = (componentType) => {
  if (!componentType) return null;
  return readString(componentType.__name) ?? readString(componentType.name);
};
var getComponentFilePath = (componentType) => {
  if (!componentType) return null;
  return readString(componentType.__file);
};
var getParentComponentFrom = (component) => {
  if (!component) return null;
  const parent = Reflect.get(component, "parent");
  return isRecord(parent) ? parent : null;
};
var getComponentChain = (element) => {
  const chain = [];
  let current = getNearestVueComponent(element);
  while (current) {
    chain.push(current);
    current = getParentComponentFrom(current);
  }
  return chain;
};
var getRuntimeStackFrames = (element) => getComponentChain(element).map((component) => {
  const componentType = getVueComponentType(component);
  const filePath = getComponentFilePath(componentType);
  if (!filePath) return null;
  return {
    filePath,
    lineNumber: null,
    columnNumber: null,
    componentName: getComponentName(componentType)
  };
}).filter((frame) => Boolean(frame));
var resolveFromInspectorAttribute = (element) => {
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
    componentName: getComponentName(componentType)
  };
};
var resolveStack3 = (element) => {
  const frames = [];
  const seen = /* @__PURE__ */ new Set();
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
var vueResolver = {
  name: "vue",
  resolveStack: resolveStack3
};
var HANDLER_PREFIX = "$$";
var SOURCE_LOCATION_PATTERN = /location:\s*["']([^"']+:\d+:\d+)["']/g;
var SOURCE_MODULE_PATH_PREFIX = "/src/";
var CSS_FILE_EXTENSION = ".css";
var IMAGE_IMPORT_SUFFIX = "?import";
var RUNTIME_MODULES_KEY = "__SOLID_RUNTIME_MODULES__";
var MODULE_SOURCE_CACHE = /* @__PURE__ */ new Map();
var HANDLER_STACK_CACHE = /* @__PURE__ */ new Map();
var shouldIncludeModule = (resourceUrl) => {
  if (resourceUrl.includes(IMAGE_IMPORT_SUFFIX)) return false;
  const pathname = new URL(resourceUrl, window.location.href).pathname;
  if (pathname.endsWith(CSS_FILE_EXTENSION)) return false;
  return pathname.includes(SOURCE_MODULE_PATH_PREFIX);
};
var readModuleUrlsFromPerformance = () => {
  if (typeof window === "undefined") return [];
  const entries = performance.getEntriesByType("resource");
  const urls = /* @__PURE__ */ new Set();
  for (const entry2 of entries) {
    if (!entry2.name || !shouldIncludeModule(entry2.name)) continue;
    urls.add(entry2.name);
  }
  return Array.from(urls);
};
var fetchModuleSource = (moduleUrl) => {
  const cached = MODULE_SOURCE_CACHE.get(moduleUrl);
  if (cached) return cached;
  const promise = fetch(moduleUrl).then((response) => response.ok ? response.text() : null).catch(() => null);
  MODULE_SOURCE_CACHE.set(moduleUrl, promise);
  return promise;
};
var readRuntimeModules = () => {
  if (typeof window === "undefined") return [];
  const modules = Reflect.get(window, RUNTIME_MODULES_KEY);
  if (!Array.isArray(modules)) return [];
  return modules;
};
var findHandlerSourceMatch = async (handlerSource) => {
  for (const runtimeModule of readRuntimeModules()) {
    const index = runtimeModule.content.indexOf(handlerSource);
    if (index === -1) continue;
    return {
      moduleUrl: runtimeModule.url,
      moduleContent: runtimeModule.content,
      handlerSourceIndex: index
    };
  }
  for (const moduleUrl of readModuleUrlsFromPerformance()) {
    const content = await fetchModuleSource(moduleUrl);
    if (!content) continue;
    const index = content.indexOf(handlerSource);
    if (index === -1) continue;
    return {
      moduleUrl,
      moduleContent: content,
      handlerSourceIndex: index
    };
  }
  return null;
};
var parseNearbyLocations = (moduleContent, handlerIndex) => {
  const windowStart = Math.max(0, handlerIndex - SOURCE_CONTEXT_HALF_WINDOW_CHARS);
  const windowEnd = Math.min(moduleContent.length, handlerIndex + SOURCE_CONTEXT_HALF_WINDOW_CHARS);
  const windowText = moduleContent.slice(windowStart, windowEnd);
  const matches = [];
  for (const match of windowText.matchAll(SOURCE_LOCATION_PATTERN)) {
    const rawLocation = match[1];
    if (!rawLocation) continue;
    const parsed = parseSourceLocation(rawLocation);
    if (!parsed || match.index === void 0) continue;
    const absoluteIndex = windowStart + match.index;
    matches.push({
      sourceInfo: {
        filePath: parsed.filePath,
        lineNumber: parsed.lineNumber,
        columnNumber: parsed.columnNumber,
        componentName: null
      },
      distance: Math.abs(absoluteIndex - handlerIndex)
    });
  }
  matches.sort((left, right) => {
    const leftLine = left.sourceInfo.lineNumber ?? 0;
    const rightLine = right.sourceInfo.lineNumber ?? 0;
    if (rightLine !== leftLine) return rightLine - leftLine;
    return left.distance - right.distance;
  });
  const seen = /* @__PURE__ */ new Set();
  const unique = [];
  for (const match of matches) {
    const identity = `${match.sourceInfo.filePath}:${match.sourceInfo.lineNumber}:${match.sourceInfo.columnNumber}`;
    if (seen.has(identity)) continue;
    seen.add(identity);
    unique.push(match.sourceInfo);
  }
  return unique;
};
var toProjectRelativePath = (moduleUrl) => {
  try {
    const pathname = decodeURIComponent(new URL(moduleUrl, window.location.href).pathname);
    if (!pathname.includes(SOURCE_MODULE_PATH_PREFIX)) return null;
    return pathname.startsWith("/") ? pathname.slice(1) : pathname;
  } catch {
    return null;
  }
};
var getGeneratedLocation = (moduleContent, handlerIndex) => {
  const prefix = moduleContent.slice(0, handlerIndex);
  const lines = prefix.split("\n");
  const lastLine = lines[lines.length - 1] ?? "";
  return {
    lineNumber: lines.length,
    columnNumber: lastLine.length + SOURCE_LINE_START_COLUMN
  };
};
var findHandlerCandidate = (element) => {
  let current = element;
  while (current) {
    for (const property of Object.getOwnPropertyNames(current)) {
      if (!property.startsWith(HANDLER_PREFIX)) continue;
      const value = Reflect.get(current, property);
      if (typeof value !== "function") continue;
      const source = String(value).trim();
      if (source.length < SOLID_HANDLER_SOURCE_LENGTH_MIN_CHARS) continue;
      return { source };
    }
    current = current.parentElement;
  }
  return null;
};
var resolveFromHandler = (handlerSource) => {
  const cached = HANDLER_STACK_CACHE.get(handlerSource);
  if (cached) return cached;
  const promise = (async () => {
    const match = await findHandlerSourceMatch(handlerSource);
    if (!match) return [];
    const locationFrames = parseNearbyLocations(match.moduleContent, match.handlerSourceIndex);
    if (locationFrames.length > 0) return locationFrames;
    const modulePath = toProjectRelativePath(match.moduleUrl);
    if (!modulePath) return [];
    const generated = getGeneratedLocation(match.moduleContent, match.handlerSourceIndex);
    return [
      {
        filePath: modulePath,
        lineNumber: generated.lineNumber,
        columnNumber: generated.columnNumber,
        componentName: null
      }
    ];
  })();
  HANDLER_STACK_CACHE.set(handlerSource, promise);
  return promise;
};
var resolveStack4 = (element) => {
  const candidate = findHandlerCandidate(element);
  if (!candidate) return Promise.resolve([]);
  return resolveFromHandler(candidate.source);
};
var solidResolver = {
  name: "solid",
  resolveStack: resolveStack4
};
var getTagName = (node) => {
  if ("tagName" in node && typeof node.tagName === "string") return node.tagName.toLowerCase();
  if ("nodeName" in node && typeof node.nodeName === "string") return node.nodeName.toLowerCase();
  return "";
};
var DEFAULT_RESOLVERS = [svelteResolver, vueResolver, solidResolver];
var resolveFrameworkStack = async (element, resolvers) => {
  for (const resolver of resolvers) {
    const frames = await resolver.resolveStack(element);
    const validFrames = frames.filter((frame) => frame.filePath.length > 0);
    if (validFrames.length > 0) return validFrames;
  }
  return [];
};
var createSourceResolver = (options = {}) => {
  const frameworkResolvers = options.resolvers ?? DEFAULT_RESOLVERS;
  const resolveStack6 = async (node) => {
    const reactStack = await reactResolver.resolveStack(node);
    if (isElement(node)) {
      const frameworkStack = await resolveFrameworkStack(node, frameworkResolvers);
      if (reactStack.length > 0) return [...reactStack, ...frameworkStack];
      return frameworkStack;
    }
    return reactStack;
  };
  const resolveSource2 = async (node) => {
    const stack = await resolveStack6(node);
    return stack[0] ?? null;
  };
  const resolveComponentName3 = async (node) => {
    var _a, _b;
    const reactName = await ((_a = reactResolver.resolveComponentName) == null ? void 0 : _a.call(reactResolver, node));
    if (reactName) return reactName;
    if (isElement(node)) {
      const frameworkStack = await resolveFrameworkStack(node, frameworkResolvers);
      const frameworkName = (_b = frameworkStack.find((frame) => frame.componentName)) == null ? void 0 : _b.componentName;
      return frameworkName ?? null;
    }
    return null;
  };
  const resolveElementInfo2 = async (node) => {
    var _a, _b;
    const stack = await resolveStack6(node);
    const source = stack[0] ?? null;
    const componentName = ((_a = stack.find((frame) => frame.componentName)) == null ? void 0 : _a.componentName) ?? await ((_b = reactResolver.resolveComponentName) == null ? void 0 : _b.call(reactResolver, node)) ?? null;
    return {
      tagName: getTagName(node),
      componentName,
      source,
      stack
    };
  };
  return { resolveSource: resolveSource2, resolveStack: resolveStack6, resolveComponentName: resolveComponentName3, resolveElementInfo: resolveElementInfo2 };
};
var defaultResolver = createSourceResolver();
var resolveElementInfo = defaultResolver.resolveElementInfo;
const InspectorOverlay = () => {
  const [inspecting, setInspecting] = useState(false);
  const [result, setResult] = useState(null);
  const handleClick = async (event) => {
    if (!inspecting) return;
    event.preventDefault();
    event.stopPropagation();
    const target = event.target;
    if (!(target instanceof Element)) return;
    const info = await resolveElementInfo(target);
    setResult(info);
  };
  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setInspecting(false);
      setResult(null);
    }
  };
  useEffect(() => {
    if (inspecting) {
      document.addEventListener("click", handleClick);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [inspecting]);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      "data-testid": "inspector-overlay",
      style: { marginTop: 24, borderTop: "1px solid #e0e0e0", paddingTop: 16 },
      children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            "data-testid": "inspector-toggle",
            onClick: () => setInspecting((previous) => !previous),
            style: {
              width: "100%",
              padding: 12,
              border: "2px solid #4a90d9",
              borderRadius: 10,
              background: inspecting ? "#4a90d9" : "white",
              color: inspecting ? "white" : "#4a90d9",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer"
            },
            children: inspecting ? "Stop Inspecting" : "Start Inspector"
          }
        ),
        result && /* @__PURE__ */ jsxs(
          "div",
          {
            "data-testid": "result-panel",
            style: {
              marginTop: 16,
              padding: 16,
              background: "#1a1a2e",
              borderRadius: 10,
              color: "#e0e0e0",
              fontSize: 13
            },
            children: [
              /* @__PURE__ */ jsx("h4", { style: { marginBottom: 12, color: "#8bc6ec", fontSize: 14 }, children: "Inspection Result" }),
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, marginBottom: 6 }, children: [
                /* @__PURE__ */ jsx("span", { style: { color: "#888", minWidth: 80 }, children: "Tag:" }),
                /* @__PURE__ */ jsx("code", { style: { color: "#a8e6cf", fontFamily: "monospace", fontSize: 12 }, children: result.tagName })
              ] }),
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, marginBottom: 6 }, children: [
                /* @__PURE__ */ jsx("span", { style: { color: "#888", minWidth: 80 }, children: "Component:" }),
                /* @__PURE__ */ jsx(
                  "code",
                  {
                    "data-testid": "component-name",
                    style: { color: "#a8e6cf", fontFamily: "monospace", fontSize: 12 },
                    children: result.componentName ?? "N/A"
                  }
                )
              ] }),
              result.source && /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, marginBottom: 6 }, children: [
                /* @__PURE__ */ jsx("span", { style: { color: "#888", minWidth: 80 }, children: "File:" }),
                /* @__PURE__ */ jsx(
                  "code",
                  {
                    "data-testid": "filepath",
                    style: {
                      color: "#a8e6cf",
                      fontFamily: "monospace",
                      fontSize: 12,
                      wordBreak: "break-all"
                    },
                    children: result.source.filePath
                  }
                )
              ] }),
              result.source && /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, marginBottom: 6 }, children: [
                /* @__PURE__ */ jsx("span", { style: { color: "#888", minWidth: 80 }, children: "Line:" }),
                /* @__PURE__ */ jsxs("code", { style: { color: "#a8e6cf", fontFamily: "monospace", fontSize: 12 }, children: [
                  result.source.lineNumber,
                  ":",
                  result.source.columnNumber
                ] })
              ] })
            ]
          }
        )
      ]
    }
  );
};
const Index = () => /* @__PURE__ */ jsxs("div", { style: { fontFamily: "system-ui", padding: 24, maxWidth: 480, margin: "0 auto" }, children: [
  /* @__PURE__ */ jsx("h1", { style: { fontSize: 20, marginBottom: 4 }, children: "Element Source - Remix" }),
  /* @__PURE__ */ jsx("p", { style: { color: "#666", marginBottom: 24 }, children: "Click any element to inspect its source" }),
  /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: [
    /* @__PURE__ */ jsx(SampleCard, { title: "Counter" }),
    /* @__PURE__ */ jsx(SampleCard, { title: "Timer" }),
    /* @__PURE__ */ jsx(SampleCard, { title: "Toggle" })
  ] }),
  /* @__PURE__ */ jsx(InspectorOverlay, {})
] });
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-Di7GZmtQ.js", "imports": ["/assets/index-Ci9XzYlJ.js", "/assets/core-BBWgt50g.js", "/assets/components-BYiSABuR.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-Cezy2UbV.js", "imports": ["/assets/index-Ci9XzYlJ.js", "/assets/core-BBWgt50g.js", "/assets/components-BYiSABuR.js"], "css": [] }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_index-BypCrS8i.js", "imports": ["/assets/index-Ci9XzYlJ.js", "/assets/core-BBWgt50g.js"], "css": [] } }, "url": "/assets/manifest-a492a346.js", "version": "a492a346" };
const mode = "production";
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "v3_fetcherPersist": false, "v3_relativeSplatPath": false, "v3_throwAbortReason": false, "v3_routeConfig": false, "v3_singleFetch": false, "v3_lazyRouteDiscovery": false, "unstable_optimizeDeps": false };
const isSpaMode = false;
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  mode,
  publicPath,
  routes
};
