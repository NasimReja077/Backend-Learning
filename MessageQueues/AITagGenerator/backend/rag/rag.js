export const buildContext = (text) => {
  if (!text) return "";

  const sentences = text.split(".");
  return sentences.slice(0, 10).join(".");
};