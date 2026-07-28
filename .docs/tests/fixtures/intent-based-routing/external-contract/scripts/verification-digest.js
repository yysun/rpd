import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const path = `${directory}/${entry.name}`;
      return entry.isDirectory() ? listFiles(path) : [path];
    })
    .filter((path) => statSync(path).isFile());
}

const files = ["package.json", ...listFiles("src"), ...listFiles("test")].sort();
const hash = createHash("sha256");

for (const file of files) {
  hash.update(file);
  hash.update("\0");
  hash.update(readFileSync(file));
  hash.update("\0");
}

const digest = hash.digest("hex");

if (process.argv.includes("--write")) {
  writeFileSync(".verification-ran", `${digest}\n`);
} else {
  console.log(digest);
}
