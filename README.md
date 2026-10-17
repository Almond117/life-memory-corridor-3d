# 人生长廊 · Life Memory Corridor

一个可以在浏览器里漫游的 3D 人生相册长廊原型。墙面相框展示照片，点击照片可以进入对应的 GLB 记忆预览；时间轴、灯光和照片都作为本地静态资源运行。

## 在线仓库

公开仓库：<https://github.com/Almond117/life-memory-corridor-3d>

## 本地启动

需要 Python 3。Windows PowerShell 中运行：

```powershell
cd D:\hks
.\serve.ps1
```

然后打开 <http://localhost:4173>。也可以直接运行：

```powershell
python -m http.server 4173 --directory .
```

## 漫游与照片交互

- 点击“进入长廊”开始漫游。
- `W / A / S / D` 或方向键移动，鼠标环顾。
- `E` 查看最近的记忆详情。
- 对准墙上的照片点击，会打开对应的 3D 记忆预览层。
- 3D 预览支持拖动环顾、滚轮缩放，按 `Esc` 或“返回长廊”关闭。
- 也可以直接打开 `http://localhost:4173/?memory3d=memory-01` 预览指定记忆。

## 照片与 GLB 命名规则

四张照片已经放在 `assets/memories/`：

```text
assets/memories/memory-01.jpg
assets/memories/memory-02.jpg
assets/memories/memory-03.jpg
assets/memories/memory-04.jpg
```

对应的 3D 模型放在：

```text
assets/models/memories/memory-01.glb
assets/models/memories/memory-02.glb
assets/models/memories/memory-03.glb
assets/models/memories/memory-04.glb
```

模型文件名和照片编号相同即可自动匹配。当前专属 GLB 尚未加入时，点击照片仍会打开预览层，并显示照片和“模型待加入”提示，不会影响长廊漫游。

## 现有资源

- `assets/models/agentic_0005_retextured.glb`：长廊主体
- `assets/models/ceiling-lamp-agentic-0003.glb`：顶部灯具
- `assets/models/potted-plant-agentic-0002.glb`：盆栽
- `assets/memories/`：人生照片
- `assets/models/memories/`：照片对应的 3D 模型目录

当前版本不调用外部 API，不上传照片，也不包含登录系统。后续接入 Hyper3D 或其他服务时，请把 API Key 放在服务器环境变量中，不要写进前端代码。
