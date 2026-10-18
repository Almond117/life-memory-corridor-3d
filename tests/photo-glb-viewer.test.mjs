import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const source = await readFile(new URL("../app.js", import.meta.url), "utf8");
const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const styles = await readFile(new URL("../styles.css", import.meta.url), "utf8");

assert.match(source, /glbUrl:\s*`\.\/assets\/models\/memories\/\$\{id\}\.glb`/);
assert.match(source, /photoMeshes/);
assert.match(source, /openMemory3D/);
assert.match(source, /event\.clientX/);
assert.match(source, /event\.clientY/);
assert.match(source, /memory3d/);
assert.match(source, /window\.addEventListener\("click"/);
assert.match(source, /photoHit\.distance\s*>=\s*18/);
assert.match(source, /if \(state\.controls\.isLocked\)/);
assert.match(html, /id="memory-3d-viewer"/);
assert.match(styles, /\.memory-3d-viewer\.visible/);
await access(new URL("../assets/models/memories/memory-01.glb", import.meta.url));
await access(new URL("../assets/models/memories/memory-02.glb", import.meta.url));
await access(new URL("../assets/models/memories/memory-03.glb", import.meta.url));
await access(new URL("../assets/models/memories/memory-04.glb", import.meta.url));

console.log("photo GLB viewer wiring is present");
