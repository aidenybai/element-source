export interface ElementSourceInfo {
  filePath: string;
  lineNumber: number | null;
  columnNumber: number | null;
  componentName: string | null;
}

export interface FrameworkResolver {
  name: string;
  resolveStack: (element: Element) => ElementSourceInfo[] | Promise<ElementSourceInfo[]>;
  resolveComponentName?: (element: Element) => string | null | Promise<string | null>;
}

export interface ResolverOptions {
  resolvers?: FrameworkResolver[];
}

export interface ElementInfo {
  tagName: string;
  componentName: string | null;
  source: ElementSourceInfo | null;
  stack: ElementSourceInfo[];
}

export interface ParsedSourceLocation {
  filePath: string;
  lineNumber: number;
  columnNumber: number;
}
