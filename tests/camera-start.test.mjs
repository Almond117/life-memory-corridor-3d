import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../app.js", import.meta.url), "utf8");

assert.match(source, /cameraStartZ:\s*48\.5/);

console.log("camera starts far enough back to reveal the first photo pair");
