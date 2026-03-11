import type { ElementSourceInfo, FrameworkResolver } from "../types.js";
import { parseSourceLocation } from "../utils/parse-location.js";
import {
  SOURCE_CONTEXT_HALF_WINDOW_CHARS,
  SOLID_HANDLER_SOURCE_LENGTH_MIN_CHARS,
  SOURCE_LINE_START_COLUMN,
} from "../constants.js";

interface HandlerSourceMatch {
  moduleUrl: string;
  moduleContent: string;
  handlerSourceIndex: number;
}

interface LocationMatch {
  sourceInfo: ElementSourceInfo;
  distance: number;
}

const HANDLER_PREFIX = "$$";
const SOURCE_LOCATION_PATTERN = /location:\s*["']([^"']+:\d+:\d+)["']/g;
const SOURCE_MODULE_PATH_PREFIX = "/src/";
const CSS_FILE_EXTENSION = ".css";
const IMAGE_IMPORT_SUFFIX = "?import";
const MODULE_SOURCE_CACHE = new Map<string, Promise<string | null>>();
const HANDLER_STACK_CACHE = new Map<string, Promise<ElementSourceInfo[]>>();

const shouldIncludeModule = (resourceUrl: string): boolean => {
  if (resourceUrl.includes(IMAGE_IMPORT_SUFFIX)) return false;
  const pathname = new URL(resourceUrl, window.location.href).pathname;
  if (pathname.endsWith(CSS_FILE_EXTENSION)) return false;
  return pathname.includes(SOURCE_MODULE_PATH_PREFIX);
};

const readModuleUrlsFromPerformance = (): string[] => {
  if (typeof window === "undefined") return [];
  const entries = performance.getEntriesByType("resource");
  const urls = new Set<string>();

  for (const entry of entries) {
    if (!entry.name || !shouldIncludeModule(entry.name)) continue;
    urls.add(entry.name);
  }

  return Array.from(urls);
};

const fetchModuleSource = (moduleUrl: string): Promise<string | null> => {
  const cached = MODULE_SOURCE_CACHE.get(moduleUrl);
  if (cached) return cached;

  const promise = fetch(moduleUrl)
    .then((response) => (response.ok ? response.text() : null))
    .catch(() => null);

  MODULE_SOURCE_CACHE.set(moduleUrl, promise);
  return promise;
};

const findHandlerSourceMatch = async (
  handlerSource: string,
): Promise<HandlerSourceMatch | null> => {
  for (const moduleUrl of readModuleUrlsFromPerformance()) {
    const content = await fetchModuleSource(moduleUrl);
    if (!content) continue;
    const index = content.indexOf(handlerSource);
    if (index === -1) continue;
    return {
      moduleUrl,
      moduleContent: content,
      handlerSourceIndex: index,
    };
  }

  return null;
};

const parseNearbyLocations = (moduleContent: string, handlerIndex: number): ElementSourceInfo[] => {
  const windowStart = Math.max(0, handlerIndex - SOURCE_CONTEXT_HALF_WINDOW_CHARS);
  const windowEnd = Math.min(moduleContent.length, handlerIndex + SOURCE_CONTEXT_HALF_WINDOW_CHARS);
  const windowText = moduleContent.slice(windowStart, windowEnd);
  const matches: LocationMatch[] = [];

  for (const match of windowText.matchAll(SOURCE_LOCATION_PATTERN)) {
    const rawLocation = match[1];
    if (!rawLocation) continue;
    const parsed = parseSourceLocation(rawLocation);
    if (!parsed || match.index === undefined) continue;

    const absoluteIndex = windowStart + match.index;
    matches.push({
      sourceInfo: {
        filePath: parsed.filePath,
        lineNumber: parsed.lineNumber,
        columnNumber: parsed.columnNumber,
        componentName: null,
      },
      distance: Math.abs(absoluteIndex - handlerIndex),
    });
  }

  matches.sort((left, right) => {
    const leftLine = left.sourceInfo.lineNumber ?? 0;
    const rightLine = right.sourceInfo.lineNumber ?? 0;
    if (rightLine !== leftLine) return rightLine - leftLine;
    return left.distance - right.distance;
  });

  const seen = new Set<string>();
  const unique: ElementSourceInfo[] = [];

  for (const match of matches) {
    const identity = `${match.sourceInfo.filePath}:${match.sourceInfo.lineNumber}:${match.sourceInfo.columnNumber}`;
    if (seen.has(identity)) continue;
    seen.add(identity);
    unique.push(match.sourceInfo);
  }

  return unique;
};

const toProjectRelativePath = (moduleUrl: string): string | null => {
  try {
    const pathname = decodeURIComponent(new URL(moduleUrl, window.location.href).pathname);
    if (!pathname.includes(SOURCE_MODULE_PATH_PREFIX)) return null;
    return pathname.startsWith("/") ? pathname.slice(1) : pathname;
  } catch {
    return null;
  }
};

const getGeneratedLocation = (
  moduleContent: string,
  handlerIndex: number,
): { lineNumber: number; columnNumber: number } => {
  const prefix = moduleContent.slice(0, handlerIndex);
  const lines = prefix.split("\n");
  const lastLine = lines[lines.length - 1] ?? "";
  return {
    lineNumber: lines.length,
    columnNumber: lastLine.length + SOURCE_LINE_START_COLUMN,
  };
};

const findHandlerCandidate = (element: Element): { source: string } | null => {
  let current: Element | null = element;

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

const resolveFromHandler = (handlerSource: string): Promise<ElementSourceInfo[]> => {
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
        componentName: null,
      },
    ];
  })();

  HANDLER_STACK_CACHE.set(handlerSource, promise);
  return promise;
};

const resolveStack = (element: Element): Promise<ElementSourceInfo[]> => {
  const candidate = findHandlerCandidate(element);
  if (!candidate) return Promise.resolve([]);
  return resolveFromHandler(candidate.source);
};

export const solidResolver: FrameworkResolver = {
  name: "solid",
  resolveStack,
};
