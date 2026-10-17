import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../app.js", import.meta.url), "utf8");
const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const styles = await readFile(new URL("../styles.css", import.meta.url), "utf8");

assert.match(source, /glbUrl:\s*`\.\/assets\/models\/memories\/\$\{id\}\.glb`/);
assert.match(source, /photoMeshes/);
assert.match(source, /openMemory3D/);
assert.match(source, /event\.clientX/);
assert.match(source, /event\.clientY/);
assert.match(source, /memory3d/);
assert.match(html, /id="memory-3d-viewer"/);
assert.match(styles, /\.memory-3d-viewer\.visible/);

console.log("photo GLB viewer wiring is present");
