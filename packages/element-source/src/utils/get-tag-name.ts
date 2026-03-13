export const getTagName = (node: object): string => {
  if ("tagName" in node && typeof node.tagName === "string") return node.tagName.toLowerCase();
  if ("nodeName" in node && typeof node.nodeName === "string") return node.nodeName.toLowerCase();
  return "";
};
