export const isElement = (node: object): node is Element =>
  typeof Element !== "undefined" && node instanceof Element;
