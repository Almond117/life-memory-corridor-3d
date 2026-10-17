import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../app.js", import.meta.url), "utf8");

assert.match(source, /photoUrl:\s*`\.\/assets\/memories\/\$\{id\}\.jpg`/);
assert.match(source, /photoUrl/);
assert.match(source, /photoByFrame/);

console.log("memory photo frame wiring is present");
