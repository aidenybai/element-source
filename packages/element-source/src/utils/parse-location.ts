import type { ParsedSourceLocation } from "../types.js";

const SOURCE_DELIMITER = ":";

const parsePositiveInteger = (value: string): number | null => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) return null;
  return parsed;
};

export const parseSourceLocation = (location: string): ParsedSourceLocation | null => {
  const lastDelimiterIndex = location.lastIndexOf(SOURCE_DELIMITER);
  if (lastDelimiterIndex === -1) return null;

  const secondLastDelimiterIndex = location.lastIndexOf(SOURCE_DELIMITER, lastDelimiterIndex - 1);
  if (secondLastDelimiterIndex === -1) return null;

  const filePath = location.slice(0, secondLastDelimiterIndex);
  if (!filePath) return null;

  const lineValue = location.slice(secondLastDelimiterIndex + 1, lastDelimiterIndex);
  const columnValue = location.slice(lastDelimiterIndex + 1);

  const lineNumber = parsePositiveInteger(lineValue);
  const columnNumber = parsePositiveInteger(columnValue);
  if (lineNumber === null || columnNumber === null) return null;

  return { filePath, lineNumber, columnNumber };
};
