# 人生长廊网页原型实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建一个可在浏览器中直接打开的第一视角“人生相册长廊”3D 网页原型。

**Architecture:** 使用 Three.js 在浏览器内程序化生成木质长廊、照片墙、时间线、灯光与终点拱门；使用 DOM 覆盖层承载进入提示、操作说明和记忆详情。Hyper3D 生成的 GLB 资产预留为后续可替换资源，不把 API Key 放入前端。

**Tech Stack:** 原生 HTML/CSS/JavaScript、Three.js 0.160 ESM CDN、PointerLockControls、WebGL。

## Global Constraints

- 第一视角移动，不生成玩家人物。
- 使用暖木色、奶油色和金色灯光，视觉参考用户提供的长廊图片。
- 照片内容使用可替换的示例画面，真实照片通过后续数据文件替换。
- API Key 只允许留在服务器环境变量中，网页不读取或暴露 API Key。
- 模型资源预留 GLB 加载入口。

---

### Task 1: 建立网页骨架与视觉层

**Files:**
- Create: `index.html`
- Create: `styles.css`

**Interfaces:**
- `index.html` 提供 `#app`, `#scene`, `#intro`, `#hud`, `#memory-panel` 等挂载点。
- `styles.css` 提供暖色长廊 UI、按钮、提示卡片和响应式布局。

- [x] **Step 1: 创建语义化页面骨架**
- [x] **Step 2: 写入首屏进入提示、控制说明和记忆详情面板**
- [x] **Step 3: 添加暖色视觉系统和小屏布局**

### Task 2: 实现 Three.js 长廊场景与第一视角移动

**Files:**
- Create: `app.js`

**Interfaces:**
- `createScene()` 初始化 Three.js 场景、相机和渲染器。
- `buildCorridor()` 创建地面、墙面、木板、灯光、拱门和终点标识。
- `createMemoryCard(memory, side, z)` 创建可点击的照片墙卡片。
- `animate()` 更新移动、碰撞、相机和渲染循环。

- [x] **Step 1: 初始化场景、雾效、相机和阴影**
- [x] **Step 2: 构建长廊几何体、木质地面和暖色灯光**
- [x] **Step 3: 创建带示例纹理的照片框、年份标签和时间线**
- [x] **Step 4: 接入 PointerLockControls 和 WASD 移动**
- [x] **Step 5: 加入墙体边界、首尾边界和记忆卡片点击交互**
- [x] **Step 6: 预留 `loadGLBAsset(url, position, scale)` 以接入 Hyper3D 生成模型**

### Task 3: 本地启动与验证

**Files:**
- Create: `serve.ps1`

**Interfaces:**
- `serve.ps1` 启动静态服务器并提示访问地址。

- [x] **Step 1: 启动本地静态服务器**
- [x] **Step 2: 在浏览器中检查进入按钮、第一视角移动、照片面板和终点内容**
- [x] **Step 3: 检查页面资源成功返回，并记录运行方式**

