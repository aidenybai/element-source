# element-source

Resolve any rendered element back to its source file, line, column, and component name. Works across frameworks, bundlers, and runtimes.

## Support

### Frameworks

| Framework | Status |
|---|---|
| React 19 | ✅ |
| Next.js (App Router + RSC) | ✅ |
| Svelte 5 | ✅ |
| Vue 3 | ✅ |
| Solid | ✅ |

### Runtimes

| Runtime | React | Svelte | Vue | Solid |
|---|---|---|---|---|
| Browser (DOM) | ✅ | ✅ | ✅ | ✅ |
| React Native | ✅ | — | — | — |
| Ink TUI (Node.js) | ✅ | — | — | — |
| Capacitor (WebView) | ✅ | ✅ | ✅ | ✅ |

### Bundlers

Resolvers work at runtime. Any bundler that produces a working app is supported.

Tested: Vite, Webpack, Next.js, Astro, Remix, React Router, TanStack Start

## Usage

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

The API accepts any host instance (`object`), not just DOM `Element`. This enables React Native, Ink TUI, and other non-browser renderers that use React's fiber tree.

```ts
import { resolveSource, resolveStack, resolveComponentName } from "element-source";

const source = await resolveSource(node);
const stack = await resolveStack(node);
const name = await resolveComponentName(node);
```

### Custom resolvers

```ts
import { createSourceResolver, svelteResolver, vueResolver } from "element-source";

const { resolveSource, resolveElementInfo } = createSourceResolver({
  resolvers: [svelteResolver, vueResolver],
});
```

## API

### `resolveElementInfo(node: object): Promise<ElementInfo>`

Returns complete metadata: tag name, component name, source location, and full stack.

### `resolveSource(node: object): Promise<ElementSourceInfo | null>`

Returns the primary source location.

### `resolveStack(node: object): Promise<ElementSourceInfo[]>`

Returns the full stack of source frames (React + framework combined).

### `resolveComponentName(node: object): Promise<string | null>`

Returns the nearest user-defined component name.

### `createSourceResolver(options?: ResolverOptions)`

Creates a resolver with custom framework resolvers.

### `formatStackFrame(frame: ElementSourceInfo): string`

Formats a single source frame as a stack-trace-style string.

### `formatStack(stack: ElementSourceInfo[], maxLines?: number): string`

Formats an array of source frames.

### `getTagName(node: object): string`

Returns the tag name from any host instance. Handles DOM `Element.tagName`, Ink `nodeName`, and falls back to `""`.

## Examples

```
examples/
  vite-react/          Vite + React
  vite-vue/            Vite + Vue 3
  vite-svelte/         Vite + Svelte 5
  vite-solid/          Vite + Solid
  nextjs/              Next.js App Router
  webpack-react/       Webpack + React
  astro/               Astro + React islands
  remix/               Remix v2
  react-router/        React Router + Vite
  tanstack-start/      TanStack Start
  ink-tui/             Ink TUI CLI
  capacitor-vue/       Capacitor + Vue (mobile)
  capacitor-svelte/    Capacitor + Svelte (mobile)
  expo-react-native/   Expo (React Native)
```

Each example has an inspector overlay — click any element to see its resolved source location.

## Testing

```bash
pnpm lint          # oxlint + tsc
pnpm test          # browser tests (Playwright + Chromium)
pnpm test:node     # node tests (Ink, React Native) + E2E tests
```

## License

MIT
