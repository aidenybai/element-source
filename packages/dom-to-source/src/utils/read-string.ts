export const readString = (value: unknown): string | null =>
  typeof value === "string" ? value : null;
