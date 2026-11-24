import fs from "node:fs";

export const getSecret = (name, fallback = "") => {
  const fileName = `${name}_FILE`;
  const filePath = process.env[fileName];

  if (filePath) {
    return fs.readFileSync(filePath, "utf8").trim();
  }

  return process.env[name] || fallback;
};
