import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../app.js", import.meta.url), "utf8");

assert.match(source, /\[6\.0, 0\.08, -60\.0, 0\.66\]/);
assert.match(source, /\[6\.0, -60\.0\]/);
assert.match(source, /plant\.position\.set\(x, 0\.08, z\)/);
assert.match(source, /plant\.scale\.setScalar\(0\.9\)/);
assert.doesNotMatch(source, /\[-6\.4, 0,/);
assert.doesNotMatch(source, /\[6\.4, 0,/);
assert.doesNotMatch(source, /\[6\.4, -/);
assert.doesNotMatch(source, /\[6\.4, 0, -53\.0, 0\.66\]/);
assert.doesNotMatch(source, /\[6\.4, -53\.0\]/);

console.log("far-right plant keeps a safe gap from the last frame pair");
