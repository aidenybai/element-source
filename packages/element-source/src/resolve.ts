import type {
  ElementInfo,
  ElementSourceInfo,
  FrameworkResolver,
  ResolverOptions,
} from "./types.js";
import { reactResolver } from "./frameworks/react.js";
import { svelteResolver } from "./frameworks/svelte.js";
import { vueResolver } from "./frameworks/vue.js";
import { solidResolver } from "./frameworks/solid.js";
import { preactResolver } from "./frameworks/preact.js";
import { getTagName } from "./utils/get-tag-name.js";
import { isElement } from "./utils/is-element.js";

const DEFAULT_RESOLVERS: FrameworkResolver[] = [
  svelteResolver,
  vueResolver,
  solidResolver,
  preactResolver,
];

const resolveFrameworkStack = async (
  element: Element,
  resolvers: FrameworkResolver[],
): Promise<ElementSourceInfo[]> => {
  for (const resolver of resolvers) {
    const frames = await resolver.resolveStack(element);
    const validFrames = frames.filter((frame) => frame.filePath.length > 0);
    if (validFrames.length > 0) return validFrames;
  }
  return [];
};

export const createSourceResolver = (options: ResolverOptions = {}) => {
  const frameworkResolvers = options.resolvers ?? DEFAULT_RESOLVERS;

  const resolveStack = async (node: object): Promise<ElementSourceInfo[]> => {
    const reactStack = await reactResolver.resolveStack(node);

    if (isElement(node)) {
      const frameworkStack = await resolveFrameworkStack(node, frameworkResolvers);
      if (reactStack.length > 0) return [...reactStack, ...frameworkStack];
      return frameworkStack;
    }

    return reactStack;
  };

  const resolveSource = async (node: object): Promise<ElementSourceInfo | null> => {
    const stack = await resolveStack(node);
    return stack[0] ?? null;
  };

  const resolveComponentName = async (node: object): Promise<string | null> => {
    const reactName = await reactResolver.resolveComponentName?.(node);
    if (reactName) return reactName;

    if (isElement(node)) {
      const frameworkStack = await resolveFrameworkStack(node, frameworkResolvers);
      const frameworkName = frameworkStack.find((frame) => frame.componentName)?.componentName;
      return frameworkName ?? null;
    }

    return null;
  };

  const resolveElementInfo = async (node: object): Promise<ElementInfo> => {
    const stack = await resolveStack(node);
    const source = stack[0] ?? null;
    const componentName =
      stack.find((frame) => frame.componentName)?.componentName ??
      (await reactResolver.resolveComponentName?.(node)) ??
      null;

    return {
      tagName: getTagName(node),
      componentName,
      source,
      stack,
    };
  };

  return { resolveSource, resolveStack, resolveComponentName, resolveElementInfo };
};

const defaultResolver = createSourceResolver();

export const resolveSource = defaultResolver.resolveSource;
export const resolveStack = defaultResolver.resolveStack;
export const resolveComponentName = defaultResolver.resolveComponentName;
export const resolveElementInfo = defaultResolver.resolveElementInfo;
