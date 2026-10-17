import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../app.js", import.meta.url), "utf8");

assert.match(source, /\[-6\.0, 0\.08, 24\.0, 0\.78\]/);
assert.match(source, /plant\.position\.set\(x, 0\.08, z\)/);

console.log("plants are lifted slightly above the floor to avoid pot clipping");
