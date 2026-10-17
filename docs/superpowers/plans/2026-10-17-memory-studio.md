# 人生长廊记忆工坊实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有 3D 人生长廊中加入不依赖外部 API 的记忆工坊 UI 模拟流程。

**Architecture:** 保留现有 Three.js 漫游场景，新增一个与 canvas 平级的全屏 DOM 工坊层。工坊使用本地 `MemoryNode` 状态、`localStorage` 和 Object URL 展示上传与阶段结果；真实 API 后续仅替换 mock 任务函数。

**Tech Stack:** 原生 HTML/CSS/JavaScript、现有 Three.js、浏览器 File API、localStorage。

## Global Constraints

- 本轮不请求任何 GPT、生图、Rodin 或 Blender 服务。
- 不把 API Key 放入网页。
- 不破坏现有第一视角长廊和 GLB 加载入口。
- 所有阶段结果都必须在 UI 中可检查，确认后才进入下一步。

---

### Task 1: 增加工坊 DOM 和视觉样式

**Files:** `index.html`, `styles.css`

- [x] 添加模式切换、阶段条、左侧时间轴、中央预览、右侧检查面板、底部状态栏和新增节点弹窗。
- [x] 使用现有暖木色视觉系统，区分编辑面板与漫游背景。
- [x] 为上传区、预览标签、状态点、按钮、确认和错误状态添加响应式样式。

### Task 2: 接入本地模拟工坊状态

**Files:** `app.js`

- [x] 添加 `studioState`、节点数据和阶段数据。
- [x] 实现工坊/漫游模式切换与节点选择。
- [x] 实现文件上传、Object URL 预览、节点新增和 localStorage 保存。
- [x] 实现分离、卡通化、3D 化、Blender 组合的模拟任务和检查确认。
- [x] 实现阶段标签、Prompt、风格按钮、重试和下一步按钮。

### Task 3: 验证交互与文档

**Files:** `README.md`

- [x] 更新启动方式和工坊操作说明。
- [x] 运行 JavaScript 语法检查和静态资源检查。
- [x] 在浏览器中验证模式切换、时间轴节点、阶段模拟和检查面板。
