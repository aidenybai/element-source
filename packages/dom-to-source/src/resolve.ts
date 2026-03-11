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
import { getTagName } from "./utils/get-tag-name.js";

const DEFAULT_RESOLVERS: FrameworkResolver[] = [svelteResolver, vueResolver, solidResolver];

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

  const resolveStack = async (element: Element): Promise<ElementSourceInfo[]> => {
    const reactStack = await reactResolver.resolveStack(element);
    const frameworkStack = await resolveFrameworkStack(element, frameworkResolvers);

    if (reactStack.length > 0) return [...reactStack, ...frameworkStack];
    return frameworkStack;
  };

  const resolveSource = async (element: Element): Promise<ElementSourceInfo | null> => {
    const stack = await resolveStack(element);
    return stack[0] ?? null;
  };

  const resolveComponentName = async (element: Element): Promise<string | null> => {
    const reactName = await reactResolver.resolveComponentName?.(element);
    if (reactName) return reactName;

    const frameworkStack = await resolveFrameworkStack(element, frameworkResolvers);
    const frameworkName = frameworkStack.find((frame) => frame.componentName)?.componentName;
    return frameworkName ?? null;
  };

  const resolveElementInfo = async (element: Element): Promise<ElementInfo> => {
    const stack = await resolveStack(element);
    const source = stack[0] ?? null;
    const componentName =
      stack.find((frame) => frame.componentName)?.componentName ??
      (await reactResolver.resolveComponentName?.(element)) ??
      null;

    return {
      tagName: getTagName(element),
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
