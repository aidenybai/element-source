# dom-to-source

Resolve any DOM element back to its source file, line, column, and component name. Works with React, Next.js (including RSC), Svelte, Vue, and Solid.

## Usage

```ts
import {
  resolveElementInfo,
  resolveSource,
  resolveStack,
  resolveComponentName,
} from "dom-to-source";

const info = await resolveElementInfo(element);
// {
//   tagName: "button",
//   componentName: "App",
//   source: { filePath: "src/App.tsx", lineNumber: 42, columnNumber: 10, componentName: "App" },
//   stack: [...]
// }

const source = await resolveSource(element);
// { filePath: "src/App.tsx", lineNumber: 42, columnNumber: 10, componentName: "App" }

const stack = await resolveStack(element);
// [{ filePath: "src/App.tsx", ... }, { filePath: "src/Layout.tsx", ... }]

const name = await resolveComponentName(element);
// "App"
```

## Custom Resolvers

```ts
import { createSourceResolver, svelteResolver, vueResolver } from "dom-to-source";

const { resolveSource, resolveElementInfo } = createSourceResolver({
  resolvers: [svelteResolver, vueResolver],
});
```

## API

### `resolveElementInfo(element: Element): Promise<ElementInfo>`

Returns complete element metadata: tag name, component name, source location, and full stack.

### `resolveSource(element: Element): Promise<ElementSourceInfo | null>`

Returns the primary source location for an element.

### `resolveStack(element: Element): Promise<ElementSourceInfo[]>`

Returns the full stack of source frames (React + framework combined).

### `resolveComponentName(element: Element): Promise<string | null>`

Returns the nearest user-defined component name.

### `createSourceResolver(options?: ResolverOptions)`

Creates a resolver with custom framework resolvers. Returns `{ resolveSource, resolveStack, resolveComponentName, resolveElementInfo }`.

### `formatStackFrame(frame: ElementSourceInfo): string`

Formats a single source frame as a stack-trace-style string.

### `formatStack(stack: ElementSourceInfo[], maxLines?: number): string`

Formats an array of source frames.

## License

MIT
