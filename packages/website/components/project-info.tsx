const FEATURES = [
  "Works with React 19, Next.js, Svelte 5, Vue 3, and Solid",
  "Runs in Browser, React Native, Ink TUI, OpenTUI, and Capacitor",
  "Compatible with any bundler \u2013 Vite, Webpack, Next.js, Astro, and more",
];

export const ProjectInfo = () => {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-base font-medium tracking-tight">element-source</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Resolve any rendered element back to its{" "}
        <span className="font-medium text-foreground">source file, line, column, and component name</span>
      </p>
      <p className="text-sm leading-relaxed text-muted-foreground">
        works across frameworks, bundlers, and runtimes. Pass any host instance &mdash; DOM node, React fiber, Ink element &mdash; and get back the exact source location.
      </p>
      <ul className="list-disc space-y-0.5 pl-4 text-sm leading-relaxed text-muted-foreground">
        {FEATURES.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
    </div>
  );
};
