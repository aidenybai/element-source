const STACK_LINE_PREFIX = "in ";

const extractStackLines = (context: string): string[] =>
  context
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith(STACK_LINE_PREFIX))
    .map((line) => `\n  ${line}`);

export const mergeStackContext = (primary: string, secondary: string, maxLines: number): string => {
  if (maxLines < 1) return "";

  const merged: string[] = [];
  const seen = new Set<string>();

  for (const context of [primary, secondary]) {
    for (const line of extractStackLines(context)) {
      if (seen.has(line)) continue;
      seen.add(line);
      merged.push(line);
    }
  }

  return merged.slice(0, maxLines).join("");
};
