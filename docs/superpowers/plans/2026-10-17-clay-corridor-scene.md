# Q版人生长廊场景升级 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有 Three.js 人生长廊的几何尺寸、照片墙位置、时间轴范围和漫游边界不变的前提下，加入可跟随的软陶 Q 版小人，并重做材质、灯光和色彩层级。

**Architecture:** 保留现有 `app.js` 的场景生成方式和现有记忆卡片数据，不替换当前走廊。新增一组职责清晰的材质、灯光、角色和第三人称相机函数，通过现有的 `state`、`memories` 和 `PointerLockControls` 连接。CSS 只补充新的 UI 状态和色彩 token，先不接真实 API 或外部模型。

**Tech Stack:** Three.js 0.160、PointerLockControls、原生 JavaScript、CSS、当前静态本地服务器。

## Global Constraints

- 保留当前走廊的宽度、长度、墙面、地面、顶部横梁、照片卡片、地面时间线和终点拱门。
- 保留当前照片节点的年份、标题、位置关系、点击详情和 E 键阅读逻辑。
- 保留当前第一版记忆工坊，不把场景升级和工坊流程混在同一轮重构中。
- 软陶小人先使用程序化低面数几何体，不下载外部模型。
- 颜色增加珊瑚红、雾蓝、鼠尾草绿、薰衣草紫和芥末黄作为小面积强调色，木材和暖光仍是基础色。
- 任何材质或灯光变化都不能让照片文字、时间轴年份和交互面板失去可读性。
- 真实 Rodin、生图、Blender API 本轮不接入。

---

### Task 1: 固定当前场景基线和视觉 token

**Files:**
- Modify: `D:/hks/app.js: state、palette、init`
- Modify: `D:/hks/styles.css: :root`
- Test: 浏览器加载 `http://localhost:4173/`，确认场景仍可渲染、照片卡片和时间轴位置不变。

**Interfaces:**
- Produces: `sceneTheme` token object and stable `state.avatar`/camera fields for later tasks.
- Consumes: existing `palette`, `state.cameraStartZ`, `state.corridorEndZ`, `memories`.

- [ ] **Step 1: Record the current geometry contract**
  - Keep `floor` at width 16, corridor center z -9, left/right wall x ±8.05, ceiling y 8.6, and memory card z formula `39 - index * 15.2`.
  - Add a short inline comment near `palette` explaining these values are scene anchors and must not move during this pass.

- [ ] **Step 2: Add palette tokens**
  - Add `clayRed`, `mistBlue`, `sage`, `lavender`, `mustard`, `paper`, `woodWarm`, `woodDark`, `floorWarm`, `lightWarm` to the existing palette object.
  - Use the same token names in CSS custom properties for UI status accents.

- [ ] **Step 3: Verify the baseline**
  - Run `node --check app.js`.
  - Reload the local page and verify the existing corridor, card click, E key panel, and studio entry remain available.

---

### Task 2: Upgrade corridor materials without changing geometry

**Files:**
- Modify: `D:/hks/app.js: buildCorridor, buildDecor, createMemoryCard, createPhotoTexture`
- Test: Browser screenshot at corridor start and near the 2015/2020 section.

**Interfaces:**
- Produces: `createSceneMaterials()`, `createAccentMaterial(color, roughness)`, `applyMaterialFinish(object)`.
- Consumes: `sceneTheme`, existing corridor meshes and memory data.

- [ ] **Step 1: Add material helpers**
  - Create warm matte wall, satin wood, softly rough floor, clay accent and paper card materials.
  - Keep metalness close to 0 for wood, plaster, paper and clay; use low roughness only for brass/light fixtures.
  - Set `colorSpace` on any generated canvas texture to `THREE.SRGBColorSpace`.

- [ ] **Step 2: Preserve existing anchors**
  - Keep floor, wall, ceiling and beam geometry unchanged.
  - Replace only their material instances with the new helpers.
  - Add colored accent bands or small framed side panels at the existing card nodes instead of creating a new corridor layout.

- [ ] **Step 3: Add memory-specific color**
  - Extend `memories` with an optional `accent` value.
  - Use that accent on the plaque border, small shelf object, plant pot or paper label near each memory. Keep the photo itself controlled by its own palette.

- [ ] **Step 4: Verify material readability**
  - Confirm the floor timeline, card titles and walls remain readable in the browser.
  - Confirm no large saturated block covers the corridor or makes the scene look like a different building.

---

### Task 3: Add layered lighting for depth and color separation

**Files:**
- Modify: `D:/hks/app.js: addLights`
- Test: Browser screenshot at corridor start, mid-corridor, and endpoint.

**Interfaces:**
- Produces: `lightingRig` object with ambient, key, practical and accent lights.
- Consumes: existing point-light loop and corridor anchor positions.

- [ ] **Step 1: Keep current base illumination**
  - Retain a warm hemisphere light and a soft directional key so the corridor remains visible.
  - Reduce the directional intensity if needed rather than increasing all lights.

- [ ] **Step 2: Add practical lights**
  - Keep the existing point lights as ceiling fixtures.
  - Add small emissive bulbs and wall sconces near the existing card rows, with short ranges and low intensity to avoid a flat orange wash.

- [ ] **Step 3: Add restrained color accents**
  - Add low-intensity blue/teal fill on selected right-wall sections, lavender or coral fill near selected memory nodes, and a soft gold pool around the floor timeline.
  - Keep colored lights below the warm key contribution so the wooden corridor remains the dominant material.

- [ ] **Step 4: Verify lighting performance**
  - Check that shadows, fog and tone mapping still render without black frames or excessive bloom.
  - Verify the endpoint arch remains visible and the current camera range is unchanged.

---

### Task 4: Build the procedural soft-clay avatar

**Files:**
- Modify: `D:/hks/app.js: state, init, animate, updateMovement`
- Test: Browser interaction with WASD, mouse look and a visible third-person avatar.

**Interfaces:**
- Produces: `createClayAvatar()`, `updateAvatar(delta)`, `avatarRoot`.
- Consumes: existing scene, `state.keys`, camera movement bounds.

- [ ] **Step 1: Create low-poly avatar geometry**
  - Build a single `THREE.Group` with rounded low-segment primitives: head, hair cap, torso, backpack, arms, legs and shoes.
  - Use matte clay materials with slightly different colors for hair, skin, shirt, pants and backpack.
  - Keep the avatar small enough to fit the current 8.8-unit corridor height and existing card scale.

- [ ] **Step 2: Place avatar on existing start anchor**
  - Put avatar at the current camera start x/z, with feet on the floor y=0.
  - Keep the current corridor origin and movement clamp values.

- [ ] **Step 3: Add simple animation**
  - Add idle breathing/weight shift and a two-phase walk cycle based on movement speed.
  - Stop leg swing when no movement key is pressed.
  - Do not add external animation files in this pass.

- [ ] **Step 4: Verify avatar visibility**
  - Confirm the avatar remains visible in the browser and does not overlap the first memory card.
  - Confirm the existing first-person canvas still renders when the avatar feature is disabled by a local state flag.

---

### Task 5: Switch to third-person follow camera while preserving controls

**Files:**
- Modify: `D:/hks/app.js: init, wireEvents, updateMovement, animate, onResize`
- Modify: `D:/hks/styles.css: crosshair / HUD hints`
- Test: Browser manual route from start to a memory card and back to the studio.

**Interfaces:**
- Produces: `state.thirdPerson`, `updateThirdPersonCamera(delta)`, `setCameraMode(mode)`.
- Consumes: `state.avatarRoot`, current WASD keys, PointerLockControls.

- [ ] **Step 1: Add camera mode state**
  - Default to `thirdPerson` for the approved design.
  - Keep a local debug toggle so the existing first-person camera can be restored without removing the avatar.

- [ ] **Step 2: Follow avatar position and yaw**
  - Place the camera behind and above the avatar with a smooth lerp.
  - Map mouse movement to avatar yaw and a limited camera pitch.
  - Keep camera position clamped to the same corridor bounds and avoid moving through walls.

- [ ] **Step 3: Preserve interactions**
  - Keep E key nearest-memory behavior.
  - Keep card mouse raycast behavior by casting from the camera center.
  - Keep Escape unlock behavior and the fixed studio button behavior.

- [ ] **Step 4: Update controls copy**
  - Change the HUD hint to say `W A S D 移动 · 鼠标环顾 · E 查看记忆`.
  - Keep the existing keyboard shortcut styling and current warm/coral color accents.

---

### Task 6: Integrate and verify the scene

**Files:**
- Modify: `D:/hks/README.md` with scene notes
- Test: `D:/hks/app.js`, browser at `http://localhost:4173/`

**Interfaces:**
- Produces: a reviewable scene upgrade with unchanged studio entry and memory workflow.

- [ ] **Step 1: Run static checks**
  - Run `node --check app.js`.
  - Search for all uses of `cameraStartZ`, `corridorEndZ`, `state.cardMeshes`, and `showMemory` to ensure the existing interaction contracts are still connected.

- [ ] **Step 2: Run browser checks**
  - Load the page.
  - Enter the corridor.
  - Move forward and sideways with WASD.
  - Verify avatar, colored materials, ceiling lights, wall accents, floor years and photo cards.
  - Press E near a card and verify the memory panel opens.
  - Press Escape and verify the studio button still opens the studio.
  - Return to the corridor and verify the scene stays rendered.

- [ ] **Step 3: Document limitations**
  - Note that the avatar is procedural for the first pass and will later be replaceable by a generated GLB.
  - Note that real Rodin, image generation and Blender composition remain separate integrations.

