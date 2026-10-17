# Photo GLB Viewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make each gallery photo open a corresponding interactive GLB preview and publish the finished demo as a public GitHub repository.

**Architecture:** Keep the corridor scene in the existing Three.js module. Add a photo-to-memory mapping and a second lightweight Three.js viewer that is created only when a frame is clicked; the viewer loads `assets/models/memories/<memoryId>.glb` with OrbitControls and falls back to a clear missing-model state. Document and publish the static asset contract in README.

**Tech Stack:** Three.js 0.160.0, GLTFLoader, PointerLockControls, vanilla HTML/CSS/ES modules, PowerShell, GitHub remote.

## Global Constraints

- Do not add runtime dependencies.
- Keep photos and models local static assets.
- Preserve current corridor controls and E-key memory details.
- Do not upload photos to an external API.

---

### Task 1: Add a test for photo-to-GLB mapping

**Files:**
- Create: `tests/photo-glb-viewer.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../app.js", import.meta.url), "utf8");
assert.match(source, /memory-01\.glb/);
assert.match(source, /photoMeshes/);
assert.match(source, /openMemory3D/);
console.log("photo GLB viewer wiring is present");
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node tests/photo-glb-viewer.test.mjs`

Expected: FAIL because the photo-to-GLB mapping and viewer entry point do not yet exist.

### Task 2: Wire clickable photos to an interactive viewer

**Files:**
- Modify: `app.js:state, buildEmptyGalleryFrames, wireEvents`
- Modify: `index.html:before studio-shell`
- Modify: `styles.css:viewer overlay styles`

- [ ] **Step 1: Add the mapping and photo mesh registry**

Store `memoryId`, `title`, `year`, `photoUrl`, and `glbUrl` for the four photos. Add `photoMeshes: []` to state and push each loaded photo plane into it.

- [ ] **Step 2: Add the viewer overlay markup and styles**

Add a hidden `memory-3d-viewer` section containing a canvas, title, status text, close button, and controls hint. The overlay must cover the page only while a model is being previewed.

- [ ] **Step 3: Add the viewer lifecycle**

Implement `openMemory3D(memory)`, `closeMemory3D()`, `loadMemoryGLB(memory)`, and `animateMemoryViewer()`. Use `GLTFLoader` and `OrbitControls`; show a missing-model state when the GLB request returns an error.

- [ ] **Step 4: Route clicks to the viewer**

Extend the locked-canvas mousedown raycast to check `state.photoMeshes` before the existing memory card raycast. A photo hit calls `openMemory3D()`; the E key keeps using `openNearestMemory()`.

- [ ] **Step 5: Run the test and syntax check**

Run: `node tests/photo-glb-viewer.test.mjs` and `node --check app.js`.

Expected: PASS with no syntax errors.

### Task 3: Document the public repository and validate the demo

**Files:**
- Create: `README.md`
- Modify: `index.html` cache-buster

- [ ] **Step 1: Write README**

Document the project goal, local startup command, keyboard controls, photo/GLB naming convention, current missing-model behavior, and public repository URL placeholder to be filled after creation.

- [ ] **Step 2: Verify browser behavior**

Open the local page, enter the corridor, click a visible photo, verify the viewer overlay and missing-model state, close it, and verify corridor movement still works.

- [ ] **Step 3: Initialize and publish Git**

Initialize the repository, add all project files including assets and docs, commit with `feat: add photo to glb memory viewer`, create the public repository `Almond117/life-memory-corridor-3d`, add it as `origin`, and push the default branch.
