# element-source

Get the source file location of any DOM element. Works with React, Preact, Vue, Svelte, and Solid.

> I originally built this to power [React Grab](https://www.react-grab.com/blog/intro), a way to select elements in the browser and give the source as context to coding agents. Agents are incredibly good and [token efficient](https://www.react-grab.com/blog/intro) at using file sources. Now anyone can use what makes React Grab possible.

## Installation

```bash
npm install element-source
```

If you're using Preact, import `preact/debug` in development so owner stacks and source locations are available.

## Quick Start

Pass any DOM element to `resolveElementInfo` to get its source file location, component name, and full component stack.

```ts
import { resolveElementInfo } from "element-source";

const info = await resolveElementInfo(element);
// {
//   tagName: "button",
//   componentName: "App",
//   source: { filePath: "src/App.tsx", lineNumber: 42, columnNumber: 10, componentName: "App" },
//   stack: [...]
// }
```

## API

### `resolveElementInfo(node: object): Promise<ElementInfo>`

Returns complete metadata: tag name, component name, source location, and full stack.

```ts
const info = await resolveElementInfo(document.querySelector("#root button"));
// {
//   tagName: "button",
//   componentName: "Counter",
//   source: { filePath: "src/Counter.tsx", lineNumber: 12, columnNumber: 5, componentName: "Counter" },
//   stack: [
//     { filePath: "src/Counter.tsx", lineNumber: 12, columnNumber: 5, componentName: "Counter" },
//     { filePath: "src/App.tsx", lineNumber: 8, columnNumber: 3, componentName: "App" },
//   ]
// }
```

### `resolveSource(node: object): Promise<ElementSourceInfo | null>`

Returns the primary source location.

```ts
const source = await resolveSource(element);
// { filePath: "src/Counter.tsx", lineNumber: 12, columnNumber: 5, componentName: "Counter" }
```

### `resolveStack(node: object): Promise<ElementSourceInfo[]>`

Returns the full stack of source frames (React + framework combined).

```ts
const stack = await resolveStack(element);
// [
//   { filePath: "src/Counter.tsx", lineNumber: 12, columnNumber: 5, componentName: "Counter" },
//   { filePath: "src/App.tsx", lineNumber: 8, columnNumber: 3, componentName: "App" },
// ]
```

### `resolveComponentName(node: object): Promise<string | null>`

Returns the nearest user-defined component name.

```ts
const name = await resolveComponentName(element);
// "Counter"
```

### `createSourceResolver(options?: ResolverOptions)`

Creates a resolver with custom framework resolvers.

```ts
import { createSourceResolver, svelteResolver, vueResolver } from "element-source";

const { resolveSource, resolveStack, resolveComponentName, resolveElementInfo } =
  createSourceResolver({
    resolvers: [svelteResolver, vueResolver],
  });

const info = await resolveElementInfo(element);
```

### `formatStackFrame(frame: ElementSourceInfo): string`

Formats a single source frame as a stack-trace-style string.

```ts
const frame = { filePath: "src/App.tsx", lineNumber: 42, columnNumber: 10, componentName: "App" };
formatStackFrame(frame);
// "\n  in App (at src/App.tsx:42:10)"
```

### `formatStack(stack: ElementSourceInfo[], maxLines?: number): string`

Formats an array of source frames.

```ts
const stack = [
  { filePath: "src/Counter.tsx", lineNumber: 12, columnNumber: 5, componentName: "Counter" },
  { filePath: "src/App.tsx", lineNumber: 8, columnNumber: 3, componentName: "App" },
];
formatStack(stack);
// "\n  in Counter (at src/Counter.tsx:12:5)\n  in App (at src/App.tsx:8:3)"

formatStack(stack, 1);
// "\n  in Counter (at src/Counter.tsx:12:5)"
```

### `getTagName(node: object): string`

Returns the tag name from any host instance. Handles DOM `Element.tagName`, Ink `nodeName`, and falls back to `""`.

```ts
getTagName(document.createElement("div")); // "div"
getTagName({ nodeName: "ink-text" }); // "ink-text"
getTagName({}); // ""
```
