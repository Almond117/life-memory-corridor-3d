import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../app.js", import.meta.url), "utf8");

assert.match(source, /0xd4b5e8/);
assert.match(source, /0xa4d9c2/);
assert.match(source, /0xa6d2e3/);
assert.match(source, /0xefb8c3/);
assert.match(source, /0xf1d89b/);
assert.match(source, /0xf6b9cf/);
assert.match(source, /0xffb9d2/);

console.log("slightly higher saturation macaron palette is configured");
