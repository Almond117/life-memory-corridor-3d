import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../app.js", import.meta.url), "utf8");

assert.match(source, /const ceilingPinks\s*=\s*\[/);
assert.match(source, /ceilingPinks\[bay\]/);
assert.match(source, /fallbackCeilingColor\s*=\s*0xf/);

console.log("bright pink ceiling palette is configured");
