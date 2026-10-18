import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const canvas = document.querySelector("#scene");
const intro = document.querySelector("#intro");
const enterButton = document.querySelector("#enter-button");
const hud = document.querySelector("#hud");
const crosshair = document.querySelector("#crosshair");
const memoryPanel = document.querySelector("#memory-panel");
const closeMemory = document.querySelector("#close-memory");
const memory3DViewer = document.querySelector("#memory-3d-viewer");
const memory3DCanvas = document.querySelector("#memory-3d-canvas");
const closeMemory3DButton = document.querySelector("#close-memory-3d");
const memory3DTitle = document.querySelector("#memory-3d-title");
const memory3DMeta = document.querySelector("#memory-3d-meta");
const memory3DStatus = document.querySelector("#memory-3d-status");
const memory3DEmpty = document.querySelector("#memory-3d-empty");
const memory3DPhoto = document.querySelector("#memory-3d-photo");
const toast = document.querySelector("#toast");
const currentYear = document.querySelector("#current-year");
const progressBar = document.querySelector("#progress-bar");
const panelYear = document.querySelector("#panel-year");
const panelTitle = document.querySelector("#panel-title");
const panelCopy = document.querySelector("#panel-copy");
const panelLocation = document.querySelector("#panel-location");
const openStudioButton = document.querySelector("#open-studio");
const studioShell = document.querySelector("#studio-shell");
const backToCorridorButton = document.querySelector("#back-to-corridor");
const stageStepper = document.querySelector("#stage-stepper");
const studioTimeline = document.querySelector("#studio-timeline");
const nodeCount = document.querySelector("#node-count");
const addMemoryButton = document.querySelector("#add-memory-button");
const previewTabs = document.querySelector("#preview-tabs");
const previewVisual = document.querySelector("#preview-visual");
const previewEyebrow = document.querySelector("#preview-eyebrow");
const previewTitle = document.querySelector("#preview-title");
const previewStatus = document.querySelector("#preview-status");
const previewLabel = document.querySelector("#preview-label");
const previewCaption = document.querySelector("#preview-caption");
const previewSize = document.querySelector("#preview-size");
const inspectorKicker = document.querySelector("#inspector-kicker");
const inspectorTitle = document.querySelector("#inspector-title");
const inspectorDescription = document.querySelector("#inspector-description");
const uploadZone = document.querySelector("#upload-zone");
const photoInput = document.querySelector("#photo-input");
const choosePhoto = document.querySelector("#choose-photo");
const promptBlock = document.querySelector("#prompt-block");
const studioPrompt = document.querySelector("#studio-prompt");
const styleBlock = document.querySelector("#style-block");
const styleChips = document.querySelector("#style-chips");
const runStageButton = document.querySelector("#run-stage-button");
const confirmStageButton = document.querySelector("#confirm-stage-button");
const retryStageButton = document.querySelector("#retry-stage-button");
const blenderBlock = document.querySelector("#blender-block");
const composeButton = document.querySelector("#compose-button");
const studioStatusText = document.querySelector("#studio-status-text");
const studioMetaYear = document.querySelector("#studio-meta-year");
const studioMetaTitle = document.querySelector("#studio-meta-title");
const unsavedIndicator = document.querySelector("#unsaved-indicator");
const publishButton = document.querySelector("#publish-button");
const newNodeModal = document.querySelector("#new-node-modal");
const closeNewNode = document.querySelector("#close-new-node");
const cancelNewNode = document.querySelector("#cancel-new-node");
const createNewNode = document.querySelector("#create-new-node");
const newNodeYear = document.querySelector("#new-node-year");
const newNodeTitle = document.querySelector("#new-node-title");

const memories = [
  { year: "1995", title: "小小的我，大大的梦想", copy: "每一段路的起点，都藏着一个还不知道未来会多精彩的自己。", location: "HOME · THE BEGINNING", icon: "✦", palette: ["#e8a362", "#8c4c3b"], accent: 0xe97768 },
  { year: "2003", title: "上学啦！新的世界", copy: "第一次背上书包，世界从家门口延伸到更远的地方。", location: "SCHOOL · FIRST STEPS", icon: "✎", palette: ["#81b6c7", "#36637b"], accent: 0x6faec7 },
  { year: "2009", title: "最好的我们", copy: "操场、晚自习和一群并肩长大的朋友，组成青春最亮的一页。", location: "FRIENDS · GOLDEN YEARS", icon: "✺", palette: ["#edbf78", "#c5674b"], accent: 0xf0c35b },
  { year: "2013", title: "Hello, World!", copy: "把帽子抛向天空的那一刻，新的章节开始有了名字。", location: "GRADUATION · OPEN HORIZONS", icon: "◌", palette: ["#98c9dd", "#45627b"], accent: 0x9b8bd4 },
  { year: "2016", title: "去看更大的世界", copy: "远方不是地图上的一个点，而是走出去以后遇见的每一个瞬间。", location: "TRAVEL · WIDE OPEN", icon: "⌁", palette: ["#d4a06e", "#5d7c72"], accent: 0x63a9a2 },
  { year: "2019", title: "认真生活，慢慢发光", copy: "有些成长没有掌声，却在平凡的日子里一点一点改变了你。", location: "WORK · BECOMING", icon: "◎", palette: ["#d8b878", "#785341"], accent: 0xd97969 },
  { year: "2024", title: "做更好的自己", copy: "走过的每一步都算数。今天的你，已经是曾经想成为的那个人。", location: "NOW · STILL GROWING", icon: "♡", palette: ["#d98b73", "#6e4250"], accent: 0x8dbb6c }
];

const galleryMemories = memories.slice(0, 4).map((memory, index) => {
  const id = `memory-${String(index + 1).padStart(2, "0")}`;
  return {
    ...memory,
    id,
    photoUrl: `./assets/memories/${id}.jpg`,
    glbUrl: `./assets/models/memories/${id}.glb`
  };
});
const memory3DQueryId = new URLSearchParams(window.location.search).get("memory3d");

const state = {
  scene: null,
  camera: null,
  renderer: null,
  controls: null,
  clock: new THREE.Clock(),
  keys: new Set(),
  cards: [],
  cardMeshes: [],
  photoMeshes: [],
  cameraStartZ: 48.5,
  corridorEndZ: -61,
  toastTimer: null,
  started: false,
  avatarRoot: null,
  avatarParts: null,
  corridorRoot: null,
  importedCorridorRoot: null,
  importedFloorRoot: null,
  importedLightRoots: [],
  lampPlaceholders: [],
  importedPlantRoots: [],
  plantPlaceholders: [],
  proceduralEndGate: null,
  endBackdrop: null,
  importedCorridorLoaded: false,
  // The corridor is first-person; keep the scene free of a player mesh.
  thirdPerson: false,
  playerPosition: new THREE.Vector3(),
  playerYaw: 0,
  cameraOffset: new THREE.Vector3(0, 2.55, 0)
};

const memoryViewer = {
  active: false,
  scene: null,
  camera: null,
  renderer: null,
  controls: null,
  loader: new GLTFLoader(),
  modelRoot: null,
  frameId: 0,
  clock: new THREE.Clock(),
  memory: null
};

const studioStages = [
  { key: "upload", short: "上传", title: "先放入一张照片", kicker: "STEP 01 · UPLOAD", description: "选择一个时间节点，上传照片，再逐步确认主体、背景和 3D 结果。", prompt: "请保留照片的真实构图和光线，准备进入主体与背景分离。", caption: "上传后会在这里检查原图和每个阶段的中间结果。", tabKeys: ["original"] },
  { key: "split", short: "分离", title: "检查主体与背景", kicker: "STEP 02 · SPLIT", description: "确认主体轮廓和背景补全是否自然，确认后才会进入卡通化。", prompt: "请提取照片中的主要主体，保留完整轮廓、姿态和关键细节；同时生成移除主体后的自然背景。", caption: "主体和背景分开保留，方便分别生成 3D 资产。", tabKeys: ["original", "subject", "background"] },
  { key: "cartoon", short: "卡通化", title: "选择记忆的画风", kicker: "STEP 03 · STYLIZE", description: "调整风格 Prompt，使用前后对比确认这段记忆的视觉气质。", prompt: "温暖手绘风格，保留人物和场景的主要特征，画面有柔和的金色光线。", caption: "卡通化只改变视觉表达，不会覆盖原始照片。", tabKeys: ["original", "cartoon"] },
  { key: "model", short: "3D 化", title: "检查主体和背景模型", kicker: "STEP 04 · 3D", description: "分别检查主体与背景 3D 结果，必要时选择 2.5D 保真模式。", prompt: "生成适合网页实时浏览的轻量 3D 资产，保留主体的形状、材质和主要色彩。", caption: "主体和背景分别生成，后面可以在 Blender 中重新组合。", tabKeys: ["subject3d", "background3d", "combined"] },
  { key: "compose", short: "组合", title: "放进人生长廊", kicker: "STEP 05 · COMPOSE", description: "调整展示位置、缩放和旋转，把这一段记忆放回对应的年份节点。", prompt: "使用长廊的暖色灯光和统一的展示比例，保留照片墙的叙事感。", caption: "确认后，这个节点会出现在第一视角长廊的对应位置。", tabKeys: ["combined", "subject3d", "background3d"] }
];

const previewOptions = [
  { key: "original", label: "原图", className: "original", labelText: "ORIGINAL PHOTO" },
  { key: "subject", label: "主体", className: "kind-subject", labelText: "SUBJECT CUTOUT" },
  { key: "background", label: "背景", className: "kind-background", labelText: "BACKGROUND PLATE" },
  { key: "cartoon", label: "卡通", className: "kind-cartoon", labelText: "STYLIZED MEMORY" },
  { key: "subject3d", label: "主体 3D", className: "kind-subject3d", labelText: "SUBJECT GLB" },
  { key: "background3d", label: "背景 3D", className: "kind-background3d", labelText: "BACKGROUND GLB" },
  { key: "combined", label: "组合", className: "kind-combined", labelText: "COMBINED SCENE" }
];

const studioStyles = ["温暖手绘", "日系动画", "低多边形", "电影概念"];
const studioStatusLabels = { draft: "草稿", split_review: "分离待检查", cartoon_review: "卡通待检查", model_review: "3D 待检查", placed: "已加入长廊", processing: "处理中" };
const studioStatusClasses = { draft: "draft", split_review: "review", cartoon_review: "review", model_review: "review", placed: "done", processing: "processing" };
const CORRIDOR_GLB_URL = "./assets/models/agentic_0005_retextured.glb";
const CEILING_LIGHT_GLB_URL = "./assets/models/ceiling-lamp-agentic-0003.glb";
const PLANT_GLB_URL = "./assets/models/potted-plant-agentic-0002.glb";
const studioDefaultNodes = memories.slice(0, 3).map((memory, index) => ({
  ...memory,
  id: `memory-${memory.year}`,
  previewUrl: "",
  stage: index === 0 ? "model" : index === 1 ? "split" : "upload",
  status: index === 0 ? "model_review" : index === 1 ? "split_review" : "draft",
  completed: { upload: true, split: index < 2, cartoon: index === 0, model: false, compose: false },
  confirmed: { upload: true, split: index === 0, cartoon: index === 0, model: false, compose: false },
  processing: "",
  versions: { split: 1, cartoon: 1, model: 1, compose: 1 },
  style: "温暖手绘",
  prompt: ""
}));

const studio = {
  stage: "upload",
  preview: "original",
  selectedId: studioDefaultNodes[0].id,
  nodes: loadStudioNodes(),
  saveTimer: null,
  taskTimer: null,
  unsaved: false
};
studio.stage = studio.nodes.find((node) => node.id === studio.selectedId)?.stage || "upload";

const palette = {
  // Scene anchors: keep these dimensions aligned with the current corridor.
  wall: 0xd7b889,
  wallDark: 0x9c6f48,
  wood: 0x6b3e25,
  woodLight: 0xa87342,
  floor: 0x7a482b,
  gold: 0xf0c979,
  green: 0x4d6746,
  clayRed: 0xe97768,
  mistBlue: 0x6faec7,
  sage: 0x8dbb6c,
  lavender: 0x9b8bd4,
  mustard: 0xf0c35b,
  paper: 0xf5ead7,
  lightWarm: 0xffc87d
};

init();

function init() {
  state.scene = new THREE.Scene();
  state.scene.background = new THREE.Color(0x34241c);
  state.scene.fog = new THREE.FogExp2(0x34241c, 0.0075);

  state.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 220);

  state.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  state.renderer.setSize(window.innerWidth, window.innerHeight);
  state.renderer.shadowMap.enabled = true;
  state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  state.renderer.outputColorSpace = THREE.SRGBColorSpace;
  state.renderer.toneMapping = THREE.ACESFilmicToneMapping;
  state.renderer.toneMappingExposure = 1.72;

  state.controls = new PointerLockControls(state.camera, document.body);
  state.playerPosition.set(0, 0, state.cameraStartZ);
  state.camera.position.copy(state.playerPosition).add(state.cameraOffset);
  state.camera.rotation.order = "YXZ";

  addLights();
  buildCorridor();
  buildDecor();
  // The filled photo-card style is intentionally hidden for this pass.
  // Keep the scene focused on the textured empty gallery frames; photos can
  // be mounted into those frames later through the memory workshop.
  buildEmptyGalleryFrames();
  addEndGate();
  wireEvents();
  initStudio();
  loadCorridorGLB(CORRIDOR_GLB_URL);
  loadCeilingLightsGLB(CEILING_LIGHT_GLB_URL);
  loadPlantsGLB(PLANT_GLB_URL);
  if (memory3DQueryId) {
    const previewMemory = galleryMemories.find((memory) => memory.id === memory3DQueryId);
    if (previewMemory) setTimeout(() => openMemory3D(previewMemory), 900);
  }
  animate();
}

function addLights() {
  const hemi = new THREE.HemisphereLight(0xfff6e7, 0x3b2e29, 1.45);
  state.scene.add(hemi);

  const key = new THREE.DirectionalLight(0xffe9c9, 2.15);
  key.position.set(-2, 10, 18);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -18;
  key.shadow.camera.right = 18;
  key.shadow.camera.top = 18;
  key.shadow.camera.bottom = -18;
  state.scene.add(key);

  for (let index = 0, z = 37; z > -63; z -= 11, index += 1) {
    const light = new THREE.PointLight(0xffd79d, 2.35, 20, 1.25);
    light.position.set(0, 6.7, z);
    light.castShadow = z % 22 === 4;
    state.scene.add(light);

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 10, 8),
      new THREE.MeshBasicMaterial({ color: 0xffe9b3 })
    );
    bulb.position.copy(light.position);
    state.scene.add(bulb);
    state.lampPlaceholders.push(bulb);

    const accentColors = [palette.clayRed, palette.mistBlue, palette.lavender, palette.sage];
    const accent = new THREE.PointLight(accentColors[index % accentColors.length], 0.3, 13, 1.9);
    accent.position.set(index % 2 ? 5.4 : -5.4, 3.4, z - 3.4);
    state.scene.add(accent);
  }

  const timelineGlow = new THREE.PointLight(0xffd07f, 0.55, 14, 2.0);
  timelineGlow.position.set(0, 0.8, 4);
  state.scene.add(timelineGlow);

  const endGlow = new THREE.PointLight(0xc1d7e7, 1.05, 24, 1.65);
  endGlow.position.set(0, 3.6, -60);
  state.scene.add(endGlow);
}

function buildCorridor() {
  state.corridorRoot = new THREE.Group();
  state.corridorRoot.name = "procedural-corridor-fallback";
  state.scene.add(state.corridorRoot);

  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(16, 0.32, 116),
    new THREE.MeshStandardMaterial({ color: 0x83502f, roughness: 0.78, metalness: 0.02 })
  );
  floor.position.set(0, -0.18, -9);
  floor.receiveShadow = true;
  state.corridorRoot.add(floor);

  for (let z = 48; z > -67; z -= 1.25) {
    const plank = new THREE.Mesh(
      new THREE.BoxGeometry(15.75, 0.035, 0.045),
      new THREE.MeshStandardMaterial({ color: z % 2 ? 0xa86b3b : 0x75462d, roughness: 0.72 })
    );
    plank.position.set(0, 0.005, z);
    plank.receiveShadow = true;
    state.corridorRoot.add(plank);
  }

  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xddc19d, roughness: 0.86, metalness: 0.01 });
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.42, 8.8, 116), wallMaterial);
  const rightWall = leftWall.clone();
  leftWall.position.set(-8.05, 4.2, -9);
  rightWall.position.set(8.05, 4.2, -9);
  leftWall.receiveShadow = rightWall.receiveShadow = true;
  state.corridorRoot.add(leftWall, rightWall);

  const ceiling = new THREE.Mesh(
    new THREE.BoxGeometry(16.3, 0.2, 116),
    new THREE.MeshStandardMaterial({ color: 0x3b281f, roughness: 0.86 })
  );
  ceiling.position.set(0, 8.6, -9);
  state.corridorRoot.add(ceiling);

  for (let z = 45; z > -66; z -= 5.5) {
    const beam = new THREE.Mesh(
      new THREE.BoxGeometry(16.25, 0.23, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x633b2b, roughness: 0.84 })
    );
    beam.position.set(0, 8.28, z);
    beam.castShadow = true;
    state.corridorRoot.add(beam);

    const leftTrim = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 8.3, 0.2),
      new THREE.MeshStandardMaterial({ color: 0xa56e48, roughness: 0.8 })
    );
    const rightTrim = leftTrim.clone();
    leftTrim.position.set(-7.78, 4.1, z);
    rightTrim.position.set(7.78, 4.1, z);
    state.corridorRoot.add(leftTrim, rightTrim);
  }

  const stripMaterial = new THREE.MeshStandardMaterial({
    color: 0xffa261,
    emissive: 0xff7d3f,
    emissiveIntensity: 1.1,
    roughness: 0.38
  });
  for (let z = 42; z > -62; z -= 5.5) {
    for (const x of [-7.72, 7.72]) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.06, 2.7), stripMaterial);
      strip.position.set(x, 3.05, z);
      state.corridorRoot.add(strip);
    }
  }

  const timeline = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.035, 109),
    new THREE.MeshBasicMaterial({ color: palette.gold, transparent: true, opacity: 0.8 })
  );
  timeline.material.depthTest = false;
  timeline.renderOrder = 19;
  // Lift the timeline above the imported floor to avoid depth-buffer shimmer.
  timeline.scale.set(1.35, 1, 1);
  timeline.position.set(0, 0.1, -8);
  state.scene.add(timeline);

  memories.forEach((memory, index) => {
    const z = 39 - index * 15.2;
    const accentPanel = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 2.9, 0.06),
      new THREE.MeshStandardMaterial({ color: memory.accent, roughness: 0.72, metalness: 0.02 })
    );
    accentPanel.position.set(index % 2 ? 7.83 : -7.83, 4.35, z - 3.8);
    accentPanel.rotation.y = index % 2 ? -Math.PI / 2 : Math.PI / 2;
    accentPanel.castShadow = true;
    state.scene.add(accentPanel);
    const node = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 14, 10),
      new THREE.MeshStandardMaterial({ color: memory.accent, emissive: memory.accent, emissiveIntensity: 0.16, roughness: 0.55 })
    );
    node.material.depthTest = false;
    node.renderOrder = 19;
    node.scale.set(1.35, 1.35, 1.35);
    node.position.set(0, 0.18, z);
    state.scene.add(node);
    const label = createTextSprite(memory.year, { fontSize: 42, color: "#f6d69a", width: 240, height: 80 });
    label.material.depthTest = false;
    label.material.depthWrite = false;
    label.renderOrder = 20;
    label.position.set(0.9, 0.3, z - 0.12);
    label.scale.set(1.85, 0.68, 1);
    state.scene.add(label);
  });
}

function buildDecor() {
  for (let z = 40; z > -61; z -= 15.2) {
    addShelf(-7.66, 2.4, z - 6.3, -Math.PI / 2);
    addShelf(7.66, 2.1, z - 9.5, Math.PI / 2);
  }

  // Floor plants stay close to the walls and alternate sides so the central
  // timeline and walking path remain open. Scales give the corridor a gentle
  // rhythm: small, medium, then one slightly taller focal plant.
  const plantPlacements = [
    [-6.0, 0.08, 24.0, 0.78],
    [6.0, 0.08, 8.0, 0.68],
    [-6.0, 0.08, -1.0, 0.88],
    [6.0, 0.08, -18.0, 0.72],
    [-6.0, 0.08, -35.0, 0.80],
    [6.0, 0.08, -60.0, 0.66]
  ];
  state.plantPlaceholders = plantPlacements.map(([x, y, z, scale]) => addPlant(x, y, z, scale));
}

function buildEmptyGalleryFrames() {
  const woodTexture = new THREE.TextureLoader().load("./assets/textures/mediterranean-atlas/honey-walnut.png");
  woodTexture.colorSpace = THREE.SRGBColorSpace;
  woodTexture.wrapS = THREE.RepeatWrapping;
  woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.repeat.set(1.3, 1.0);
  woodTexture.anisotropy = state.renderer.capabilities.getMaxAnisotropy();
  woodTexture.minFilter = THREE.LinearMipmapLinearFilter;
  woodTexture.magFilter = THREE.LinearFilter;

  const wood = new THREE.MeshStandardMaterial({ map: woodTexture, color: 0xffffff, roughness: 0.5, metalness: 0.02 });
  const backing = new THREE.MeshStandardMaterial({ color: 0xe5d5bd, roughness: 0.94, metalness: 0.0 });
  const innerShadow = new THREE.MeshStandardMaterial({ color: 0x5d3323, roughness: 0.7, metalness: 0.0 });

  const addFrame = (side, z, y, scale = 1, photoAsset = null) => {
    const group = new THREE.Group();
    const width = 2.7 * scale;
    const height = 2.9 * scale;
    const depth = 0.18;
    const rail = 0.18 * scale;

    const panel = new THREE.Mesh(new THREE.BoxGeometry(width - rail * 2.2, height - rail * 2.2, 0.06), backing);
    panel.position.z = 0.02;
    group.add(panel);

    const shadowPanel = new THREE.Mesh(new THREE.BoxGeometry(width - rail * 2.55, height - rail * 2.55, 0.07), innerShadow);
    shadowPanel.position.z = 0.055;
    group.add(shadowPanel);

    const innerPanel = new THREE.Mesh(new THREE.BoxGeometry(width - rail * 3.05, height - rail * 3.05, 0.08), backing);
    innerPanel.position.z = 0.095;
    group.add(innerPanel);

    if (photoAsset) {
      const photoWidth = width - rail * 3.05;
      const photoHeight = height - rail * 3.05;
      const photo = new THREE.Mesh(
        new THREE.PlaneGeometry(photoWidth, photoHeight),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, metalness: 0.0, side: THREE.DoubleSide })
      );
      photo.position.z = 0.14;
      photo.castShadow = false;
      photo.receiveShadow = true;
      photo.userData.memoryAsset = photoAsset;
      state.photoMeshes.push(photo);
      group.add(photo);

      new THREE.TextureLoader().load(photoAsset.photoUrl, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = state.renderer.capabilities.getMaxAnisotropy();

        // Cover the frame opening without stretching faces; crop only the longer edge.
        const imageAspect = texture.image.width / texture.image.height;
        const frameAspect = photoWidth / photoHeight;
        if (imageAspect > frameAspect) {
          const visibleWidth = frameAspect / imageAspect;
          texture.repeat.set(visibleWidth, 1);
          texture.offset.set((1 - visibleWidth) / 2, 0);
        } else {
          const visibleHeight = imageAspect / frameAspect;
          texture.repeat.set(1, visibleHeight);
          texture.offset.set(0, (1 - visibleHeight) / 2);
        }

        photo.material.map = texture;
        photo.material.needsUpdate = true;
      });
    }

    const top = new THREE.Mesh(new THREE.BoxGeometry(width, rail, depth), wood);
    const bottom = top.clone();
    const left = new THREE.Mesh(new THREE.BoxGeometry(rail, height, depth), wood);
    const right = left.clone();
    top.position.y = height / 2 - rail / 2;
    bottom.position.y = -height / 2 + rail / 2;
    left.position.x = -width / 2 + rail / 2;
    right.position.x = width / 2 - rail / 2;
    group.add(top, bottom, left, right);

    for (const x of [-width / 2 + rail * 0.9, width / 2 - rail * 0.9]) {
      const pin = new THREE.Mesh(
        new THREE.SphereGeometry(0.045 * scale, 8, 6),
        new THREE.MeshStandardMaterial({ color: 0xd7a55a, roughness: 0.35, metalness: 0.65 })
      );
      pin.position.set(x, height / 2 - rail * 0.9, 0.14);
      group.add(pin);
    }

    // Keep the enlarged frame safely in front of the imported wall shell.
    group.position.set(side === "left" ? -7.05 : 7.05, y, z);
    group.rotation.y = side === "left" ? Math.PI / 2 : -Math.PI / 2;
    group.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
    state.scene.add(group);
  };

  const positions = [
    // One frame pair per bay, centered between the imported pilasters.
    [36.5, 4.9, 1.0], [13.9, 4.85, 0.92], [-9.1, 4.95, 0.98],
    [-32.2, 4.85, 0.92], [-54.8, 4.95, 0.98]
  ];
  const frameSize = 1.3;
  const photoByFrame = [
    [galleryMemories[0], galleryMemories[1]],
    [galleryMemories[2], galleryMemories[3]],
    [null, null],
    [null, null],
    [null, null]
  ];
  positions.forEach(([z, y, scale], index) => {
    addFrame("left", z, y, scale * frameSize, photoByFrame[index][0]);
    addFrame("right", z, y + 0.05, scale * 0.92 * frameSize, photoByFrame[index][1]);
  });
}

function buildClayAvatar() {
  const avatar = new THREE.Group();
  avatar.name = "clay-avatar";

  const skin = new THREE.MeshStandardMaterial({ color: 0xf0b18f, roughness: 0.96, metalness: 0.01 });
  const hair = new THREE.MeshStandardMaterial({ color: 0x4b2e2a, roughness: 0.92, metalness: 0.01 });
  const shirt = new THREE.MeshStandardMaterial({ color: palette.clayRed, roughness: 0.94, metalness: 0.01 });
  const pants = new THREE.MeshStandardMaterial({ color: 0x597b9a, roughness: 0.92, metalness: 0.01 });
  const shoe = new THREE.MeshStandardMaterial({ color: 0xf2d6b0, roughness: 0.88, metalness: 0.02 });
  const backpack = new THREE.MeshStandardMaterial({ color: palette.sage, roughness: 0.92, metalness: 0.01 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x2b2021, roughness: 0.72, metalness: 0.02 });

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.55, 6, 12), shirt);
  torso.position.y = 1.12;
  torso.scale.set(0.92, 1, 0.72);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.46, 18, 14), skin);
  head.position.set(0, 1.92, -0.02);
  head.scale.set(0.96, 1.02, 0.9);

  const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.47, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.62), hair);
  hairCap.position.set(0, 2.06, 0.02);
  hairCap.scale.set(1.02, 0.72, 0.98);

  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), dark);
  const eyeR = eyeL.clone();
  eyeL.position.set(-0.14, 1.9, -0.405);
  eyeR.position.set(0.14, 1.9, -0.405);

  const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.34, 5, 8), shirt);
  const armR = armL.clone();
  armL.position.set(-0.38, 1.16, -0.01);
  armR.position.set(0.38, 1.16, -0.01);
  armL.rotation.z = -0.13;
  armR.rotation.z = 0.13;

  const legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.32, 5, 8), pants);
  const legR = legL.clone();
  legL.position.set(-0.16, 0.56, -0.01);
  legR.position.set(0.16, 0.56, -0.01);

  const shoeL = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), shoe);
  const shoeR = shoeL.clone();
  shoeL.position.set(-0.17, 0.19, -0.16);
  shoeR.position.set(0.17, 0.19, -0.16);
  shoeL.scale.set(0.95, 0.52, 1.25);
  shoeR.scale.copy(shoeL.scale);

  const bag = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.62, 0.22), backpack);
  bag.position.set(0, 1.18, 0.31);
  bag.rotation.x = -0.06;
  const bagTop = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8), backpack);
  bagTop.position.set(0, 1.52, 0.31);
  bagTop.scale.set(1.2, 0.55, 0.6);

  const badge = new THREE.Mesh(new THREE.CircleGeometry(0.095, 16), new THREE.MeshBasicMaterial({ color: palette.mustard }));
  badge.position.set(0, 1.2, 0.43);
  badge.rotation.x = -Math.PI / 2;

  avatar.add(torso, head, hairCap, eyeL, eyeR, armL, armR, legL, legR, shoeL, shoeR, bag, bagTop, badge);
  avatar.position.copy(state.playerPosition);
  avatar.traverse((object) => {
    if (!object.isMesh) return;
    object.castShadow = true;
    object.receiveShadow = true;
  });
  state.avatarParts = { torso, head, armL, armR, legL, legR, shoeL, shoeR };
  state.avatarRoot = avatar;
  state.scene.add(avatar);
}

function updateAvatar(delta) {
  if (!state.avatarRoot || !state.controls) return;
  const player = state.playerPosition;
  const moving = state.started && state.controls.isLocked && ["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].some((code) => state.keys.has(code));
  state.avatarRoot.position.copy(player);
  state.avatarRoot.rotation.y = state.playerYaw;

  const phase = state.clock.elapsedTime * (moving ? 8.5 : 2.1);
  const amount = moving ? 0.46 : 0.045;
  state.avatarRoot.position.y = Math.sin(phase * 0.5) * (moving ? 0.025 : 0.012);
  state.avatarParts.legL.rotation.x = Math.sin(phase) * amount;
  state.avatarParts.legR.rotation.x = Math.sin(phase + Math.PI) * amount;
  state.avatarParts.armL.rotation.x = Math.sin(phase + Math.PI) * amount * 0.55;
  state.avatarParts.armR.rotation.x = Math.sin(phase) * amount * 0.55;
  state.avatarParts.head.rotation.z = Math.sin(phase * 0.5) * 0.018;
}

function addPlant(x, y, z, scale) {
  const group = new THREE.Group();
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.55, 0.72, 14),
    new THREE.MeshStandardMaterial({ color: 0x9d6040, roughness: 0.86 })
  );
  pot.position.y = 0.36;
  pot.castShadow = true;
  group.add(pot);
  for (let i = 0; i < 7; i += 1) {
    const leaf = new THREE.Mesh(
      new THREE.SphereGeometry(0.34 + Math.random() * 0.16, 8, 6),
      new THREE.MeshStandardMaterial({ color: i % 2 ? 0x466947 : 0x587a4f, roughness: 0.88 })
    );
    const angle = (i / 7) * Math.PI * 2;
    leaf.position.set(Math.cos(angle) * 0.3, 0.98 + (i % 3) * 0.25, Math.sin(angle) * 0.3);
    leaf.scale.set(0.7, 1.25, 0.45);
    leaf.rotation.z = Math.cos(angle) * 0.4;
    leaf.castShadow = true;
    group.add(leaf);
  }
  group.position.set(x, y, z);
  group.scale.setScalar(scale);
  state.scene.add(group);
  return group;
}

function addShelf(x, y, z, rotationY) {
  const shelf = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color: palette.woodLight, roughness: 0.82 });
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.12, 2.55), material);
  board.position.y = 0;
  shelf.add(board);
  shelf.position.set(x, y, z);
  shelf.rotation.y = rotationY;
  shelf.castShadow = true;
  state.scene.add(shelf);
}

function addBench(z, x) {
  const material = new THREE.MeshStandardMaterial({ color: 0x7c492c, roughness: 0.84 });
  const group = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.24, 0.8), material);
  seat.position.y = 1.08;
  group.add(seat);
  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.1, 0.62), material);
    leg.position.set(side * 1.05, 0.53, 0);
    group.add(leg);
  }
  group.position.set(x, 0, z);
  group.rotation.y = x > 0 ? -Math.PI / 2 : Math.PI / 2;
  group.traverse((obj) => { if (obj.isMesh) obj.castShadow = true; });
  state.scene.add(group);
}

function addGlobe(x, y, z) {
  const group = new THREE.Group();
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.58, 24, 16),
    new THREE.MeshStandardMaterial({ color: 0x4d7181, roughness: 0.58, metalness: 0.05 })
  );
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.72, 0.035, 7, 32),
    new THREE.MeshStandardMaterial({ color: 0xc49355, roughness: 0.66 })
  );
  ring.rotation.x = Math.PI / 3.1;
  sphere.castShadow = true;
  group.add(sphere, ring);
  group.position.set(x, y, z);
  state.scene.add(group);
}

function buildMemoryCards() {
  memories.forEach((memory, index) => {
    const z = 39 - index * 15.2;
    const left = createMemoryCard(memory, "left", z);
    const right = createMemoryCard(memories[(index + 1) % memories.length], "right", z - 7.1);
    state.cards.push(left, right);
    state.cardMeshes.push(left.userData.hitTarget, right.userData.hitTarget);
  });
}

function createMemoryCard(memory, side, z) {
  const group = new THREE.Group();
  const facing = side === "left" ? Math.PI / 2 : -Math.PI / 2;
  // Keep the frame fully in front of the imported wall shell instead of
  // letting its wooden side rails intersect the wall thickness.
  const x = side === "left" ? -7.05 : 7.05;
  const wood = new THREE.MeshStandardMaterial({ color: 0x724327, roughness: 0.82 });
  const paper = new THREE.MeshStandardMaterial({ map: createPhotoTexture(memory), roughness: 0.96, side: THREE.DoubleSide });
  const photo = new THREE.Mesh(new THREE.PlaneGeometry(2.72, 3.38), paper);
  photo.position.z = 0.09;
  photo.userData.memory = memory;
  photo.userData.interactive = true;
  group.userData.hitTarget = photo;
  group.add(photo);

  const top = new THREE.Mesh(new THREE.BoxGeometry(2.98, 0.15, 0.16), wood);
  const bottom = top.clone();
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.15, 3.54, 0.16), wood);
  const right = left.clone();
  top.position.y = 1.78; bottom.position.y = -1.78;
  left.position.x = -1.42; right.position.x = 1.42;
  group.add(top, bottom, left, right);

  const plaque = new THREE.Mesh(
    new THREE.PlaneGeometry(2.64, 0.5),
    new THREE.MeshBasicMaterial({ map: createTextTexture(memory.year, memory.title), transparent: true, side: THREE.DoubleSide })
  );
  plaque.position.set(0, -2.1, 0.11);
  group.add(plaque);

  const accentTag = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.18, 0.06),
    new THREE.MeshStandardMaterial({ color: memory.accent, emissive: memory.accent, emissiveIntensity: 0.12, roughness: 0.7 })
  );
  accentTag.position.set(1.04, -1.98, 0.15);
  group.add(accentTag);

  group.position.set(x, 4.55, z);
  group.rotation.y = facing;
  group.scale.setScalar(side === "left" ? 0.98 : 0.92);
  group.traverse((obj) => { if (obj.isMesh) obj.castShadow = true; });
  state.scene.add(group);
  return group;
}

function createPhotoTexture(memory) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 640;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, memory.palette[0]);
  gradient.addColorStop(1, memory.palette[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(255,241,209,.2)";
  ctx.beginPath();
  ctx.arc(385, 130, 75, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(34,27,21,.28)";
  ctx.beginPath();
  ctx.moveTo(0, 405); ctx.lineTo(138, 272); ctx.lineTo(245, 380); ctx.lineTo(362, 224); ctx.lineTo(512, 392); ctx.lineTo(512, 640); ctx.lineTo(0, 640); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.15)";
  ctx.fillRect(40, 45, 432, 2);
  ctx.font = "84px serif";
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,247,225,.86)";
  ctx.fillText(memory.icon, 256, 300);
  ctx.font = "500 20px 'DM Mono', monospace";
  ctx.letterSpacing = "3px";
  ctx.fillStyle = "rgba(255,247,225,.75)";
  ctx.fillText(memory.year, 256, 560);
  ctx.font = "16px serif";
  ctx.fillStyle = "rgba(255,247,225,.65)";
  ctx.fillText("a moment worth keeping", 256, 594);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createTextTexture(year, title) {
  const canvas = document.createElement("canvas");
  canvas.width = 640; canvas.height = 120;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#3b2416";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(239,197,126,.55)";
  ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
  ctx.fillStyle = "#f0c979";
  ctx.font = "500 30px 'DM Mono', monospace";
  ctx.textAlign = "left";
  ctx.fillText(year, 22, 44);
  ctx.fillStyle = "#f5ead7";
  ctx.font = "500 20px 'Noto Serif SC', serif";
  ctx.fillText(title, 22, 84);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createTextSprite(text, options = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = options.width || 480;
  canvas.height = options.height || 120;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = options.color || "#f5ead7";
  ctx.font = `${options.fontSize || 38}px 'DM Mono', monospace`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 8, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
  return sprite;
}

function addEndGate() {
  const gateRoot = new THREE.Group();
  gateRoot.name = "procedural-end-gate-fallback";
  state.proceduralEndGate = gateRoot;
  state.scene.add(gateRoot);

  const portal = new THREE.Mesh(
    new THREE.BoxGeometry(7.25, 6.75, 0.08),
    new THREE.MeshBasicMaterial({ color: 0x7294a7, transparent: true, opacity: 0.26 })
  );
  portal.position.set(0, 4.0, -65.92);
  gateRoot.add(portal);

  const gateMaterial = new THREE.MeshStandardMaterial({ color: 0xd7a45e, emissive: 0x5b3417, emissiveIntensity: 0.35, roughness: 0.5 });
  const arch = new THREE.Mesh(new THREE.TorusGeometry(4.4, 0.18, 10, 42, Math.PI), gateMaterial);
  arch.position.set(0, 4.2, -65.8);
  arch.rotation.z = 0;
  gateRoot.add(arch);
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.36, 4.3, 0.36), gateMaterial);
  const right = left.clone();
  left.position.set(-4.4, 2.15, -65.8); right.position.set(4.4, 2.15, -65.8);
  gateRoot.add(left, right);

  const title = createTextSprite("NEXT CHAPTER", { fontSize: 42, color: "#ffe1a8", width: 560, height: 110 });
  title.position.set(-2.25, 5.8, -65.55);
  title.scale.set(4.3, 0.84, 1);
  gateRoot.add(title);
  const sub = createTextSprite("下一段，仍然精彩", { fontSize: 24, color: "#f5ead7", width: 420, height: 90 });
  sub.position.set(-1.55, 4.98, -65.55);
  sub.scale.set(2.9, 0.62, 1);
  gateRoot.add(sub);
}

function pickPhotoFromPointer(event) {
  if ((!state.controls.isLocked && !state.started) || event.button !== 0 || memoryViewer.active) return false;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );
  raycaster.setFromCamera(pointer, state.camera);
  const photoHit = raycaster.intersectObjects(state.photoMeshes, false)[0];
  if (!photoHit || photoHit.distance >= 18) return false;
  openMemory3D(photoHit.object.userData.memoryAsset);
  return true;
}

function wireEvents() {
  enterButton.addEventListener("click", () => {
    startExperience();
    state.controls.lock();
  });
  state.controls.addEventListener("lock", () => {
    startExperience();
  });
  state.controls.addEventListener("unlock", () => {
    if (memoryViewer.active) return;
    intro.classList.remove("hidden");
    hud.classList.remove("visible");
    crosshair.classList.remove("visible");
  });
  closeMemory.addEventListener("click", hideMemory);
  closeMemory3DButton?.addEventListener("click", closeMemory3D);
  window.addEventListener("keydown", (event) => {
    state.keys.add(event.code);
    if (event.code === "KeyE" && state.started) openNearestMemory();
    if (event.code === "Escape") {
      if (memoryViewer.active) closeMemory3D();
      else hideMemory();
    }
  });
  window.addEventListener("keyup", (event) => state.keys.delete(event.code));
  window.addEventListener("mousedown", (event) => {
    if (pickPhotoFromPointer(event)) return;
    if ((!state.controls.isLocked && !state.started) || event.button !== 0) return;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), state.camera);
    const hit = raycaster.intersectObjects(state.cardMeshes, false)[0];
    if (hit && hit.distance < 10) showMemory(hit.object.userData.memory);
  });
  window.addEventListener("click", (event) => pickPhotoFromPointer(event));
  window.addEventListener("resize", onResize);
}

function startExperience() {
  const firstStart = !state.started;
  state.started = true;
  intro.classList.add("hidden");
  hud.classList.add("visible");
  crosshair.classList.add("visible");
  if (firstStart) showToast("W A S D 漫游 · E 阅读最近的记忆");
}

function openNearestMemory() {
  let nearest = null;
  let distance = Infinity;
  const currentZ = state.playerPosition.z;
  for (const card of state.cards) {
    const currentDistance = Math.abs(card.position.z - currentZ);
    if (currentDistance < distance) { nearest = card.userData.hitTarget.userData.memory; distance = currentDistance; }
  }
  if (nearest && distance < 10) showMemory(nearest);
  else showToast("再向前走几步，就能看清下一段记忆");
}

function showMemory(memory) {
  panelYear.textContent = memory.year;
  panelTitle.textContent = memory.title;
  panelCopy.textContent = memory.copy;
  panelLocation.textContent = memory.location;
  memoryPanel.classList.add("visible");
  memoryPanel.setAttribute("aria-hidden", "false");
}

function hideMemory() {
  memoryPanel.classList.remove("visible");
  memoryPanel.setAttribute("aria-hidden", "true");
}

function ensureMemoryViewer() {
  if (memoryViewer.renderer || !memory3DCanvas) return;
  memoryViewer.scene = new THREE.Scene();
  memoryViewer.scene.background = new THREE.Color(0x211711);
  memoryViewer.scene.fog = new THREE.Fog(0x211711, 8, 26);
  memoryViewer.camera = new THREE.PerspectiveCamera(45, 1, 0.05, 100);
  memoryViewer.camera.position.set(0, 1.7, 4.2);
  memoryViewer.renderer = new THREE.WebGLRenderer({ canvas: memory3DCanvas, antialias: true, alpha: false });
  memoryViewer.renderer.outputColorSpace = THREE.SRGBColorSpace;
  memoryViewer.renderer.toneMapping = THREE.ACESFilmicToneMapping;
  memoryViewer.renderer.toneMappingExposure = 1.35;
  memoryViewer.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  memoryViewer.controls = new OrbitControls(memoryViewer.camera, memory3DCanvas);
  memoryViewer.controls.enableDamping = true;
  memoryViewer.controls.enablePan = true;
  memoryViewer.controls.minDistance = 1.1;
  memoryViewer.controls.maxDistance = 12;
  memoryViewer.controls.target.set(0, 1, 0);

  memoryViewer.scene.add(new THREE.HemisphereLight(0xffeedb, 0x2a1c18, 1.7));
  const key = new THREE.DirectionalLight(0xffd6b1, 2.4);
  key.position.set(3, 7, 4);
  memoryViewer.scene.add(key);
  const fill = new THREE.PointLight(0xffb6cf, 1.4, 12, 1.4);
  fill.position.set(-3, 3, 2);
  memoryViewer.scene.add(fill);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(5, 64),
    new THREE.MeshStandardMaterial({ color: 0x4b3026, roughness: 0.88, metalness: 0.02 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.02;
  floor.receiveShadow = true;
  memoryViewer.scene.add(floor);
  resizeMemoryViewer();
}

function resizeMemoryViewer() {
  if (!memoryViewer.renderer || !memoryViewer.camera || !memory3DCanvas) return;
  const width = Math.max(1, memory3DCanvas.clientWidth || window.innerWidth);
  const height = Math.max(1, memory3DCanvas.clientHeight || window.innerHeight);
  memoryViewer.renderer.setSize(width, height, false);
  memoryViewer.camera.aspect = width / height;
  memoryViewer.camera.updateProjectionMatrix();
}

function disposeMemoryModel() {
  if (!memoryViewer.modelRoot || !memoryViewer.scene) return;
  memoryViewer.scene.remove(memoryViewer.modelRoot);
  memoryViewer.modelRoot.traverse((object) => {
    if (!object.isMesh) return;
    object.geometry?.dispose?.();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => {
      if (!material) return;
      ["map", "normalMap", "roughnessMap", "metalnessMap", "aoMap", "emissiveMap"].forEach((key) => material[key]?.dispose?.());
      material.dispose?.();
    });
  });
  memoryViewer.modelRoot = null;
}

function openMemory3D(memory) {
  if (!memory || !memory3DViewer) return;
  ensureMemoryViewer();
  memoryViewer.active = true;
  memoryViewer.memory = memory;
  memoryViewer.clock.start();
  state.keys.clear();
  hideMemory();
  if (state.controls.isLocked) {
    try {
      state.controls.unlock();
    } catch (error) {
      console.warn("Unable to unlock corridor controls before opening memory preview", error);
    }
  }
  intro.classList.add("hidden");
  hud.classList.remove("visible");
  crosshair.classList.remove("visible");
  memory3DViewer.classList.add("visible");
  memory3DViewer.setAttribute("aria-hidden", "false");
  memory3DTitle.textContent = memory.title;
  memory3DMeta.textContent = `${memory.year} · ${memory.location}`;
  memory3DPhoto.src = memory.photoUrl;
  memory3DStatus.textContent = "正在查找对应 GLB…";
  memory3DEmpty.classList.remove("visible");
  disposeMemoryModel();
  resizeMemoryViewer();
  loadMemoryGLB(memory);
  if (!memoryViewer.frameId) animateMemoryViewer();
}

function loadMemoryGLB(memory) {
  memoryViewer.loader.load(memory.glbUrl, (gltf) => {
    if (!memoryViewer.active || memoryViewer.memory?.id !== memory.id) return;
    const model = gltf.scene;
    model.traverse((object) => {
      if (!object.isMesh) return;
      object.castShadow = true;
      object.receiveShadow = true;
    });
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    model.position.sub(center);
    model.position.y += Math.max(0.15, size.y * 0.5);
    memoryViewer.scene.add(model);
    memoryViewer.modelRoot = model;
    const maxDimension = Math.max(size.x, size.y, size.z, 1);
    memoryViewer.camera.position.set(maxDimension * 0.85, maxDimension * 0.62, maxDimension * 1.65);
    memoryViewer.controls.target.set(0, Math.max(0.4, size.y * 0.42), 0);
    memoryViewer.controls.minDistance = Math.max(0.8, maxDimension * 0.55);
    memoryViewer.controls.maxDistance = Math.max(5, maxDimension * 5);
    memoryViewer.controls.update();
    memory3DStatus.textContent = "GLB 已加载 · 可拖动环顾，滚轮缩放";
  }, undefined, () => {
    if (!memoryViewer.active || memoryViewer.memory?.id !== memory.id) return;
    memory3DStatus.textContent = "模型待加入 · 已保留照片预览";
    memory3DEmpty.classList.add("visible");
  });
}

function closeMemory3D() {
  if (!memoryViewer.active) return;
  memoryViewer.active = false;
  memoryViewer.memory = null;
  memoryViewer.frameId = 0;
  disposeMemoryModel();
  memory3DViewer.classList.remove("visible");
  memory3DViewer.setAttribute("aria-hidden", "true");
  memory3DEmpty.classList.remove("visible");
  hud.classList.add("visible");
  crosshair.classList.add("visible");
}

function animateMemoryViewer() {
  if (!memoryViewer.active) return;
  memoryViewer.frameId = requestAnimationFrame(animateMemoryViewer);
  memoryViewer.controls?.update();
  memoryViewer.renderer?.render(memoryViewer.scene, memoryViewer.camera);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => toast.classList.remove("visible"), 3600);
}

function updateMovement(delta) {
  if (!state.started) return;
  const player = state.playerPosition;
  const yaw = state.camera.rotation.y;
  state.playerYaw = yaw;
  const speed = state.keys.has("ShiftLeft") || state.keys.has("ShiftRight") ? 8.2 : 4.5;
  const forward = new THREE.Vector3(Math.sin(yaw), 0, -Math.cos(yaw));
  const right = new THREE.Vector3(Math.cos(yaw), 0, Math.sin(yaw));
  if (state.keys.has("KeyW") || state.keys.has("ArrowUp")) player.addScaledVector(forward, speed * delta);
  if (state.keys.has("KeyS") || state.keys.has("ArrowDown")) player.addScaledVector(forward, -speed * delta);
  if (state.keys.has("KeyA") || state.keys.has("ArrowLeft")) player.addScaledVector(right, -speed * delta);
  if (state.keys.has("KeyD") || state.keys.has("ArrowRight")) player.addScaledVector(right, speed * delta);
  player.x = THREE.MathUtils.clamp(player.x, -6.35, 6.35);
  player.z = THREE.MathUtils.clamp(player.z, state.corridorEndZ, state.cameraStartZ);
  player.y = 0;
  if (state.thirdPerson) {
    const offset = state.cameraOffset.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    const desired = player.clone().add(offset);
    state.camera.position.lerp(desired, Math.min(1, delta * 8));
  } else {
    // Keep the camera at eye height while PointerLockControls updates only
    // its yaw/pitch from mouse movement.
    state.camera.position.copy(player).add(state.cameraOffset);
  }
}

function updateHud() {
  const currentZ = state.playerPosition.z;
  const traveled = state.cameraStartZ - currentZ;
  const total = state.cameraStartZ - state.corridorEndZ;
  progressBar.style.width = `${THREE.MathUtils.clamp((traveled / total) * 100, 0, 100)}%`;
  let nearest = memories[0];
  let distance = Infinity;
  for (let index = 0; index < memories.length; index += 1) {
    const z = 39 - index * 15.2;
    const currentDistance = Math.abs(z - currentZ);
    if (currentDistance < distance) { distance = currentDistance; nearest = memories[index]; }
  }
  currentYear.textContent = nearest.year;
}

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(state.clock.getDelta(), 0.05);
  updateMovement(delta);
  updateAvatar(delta);
  updateHud();
  state.renderer.render(state.scene, state.camera);
}

function onResize() {
  state.camera.aspect = window.innerWidth / window.innerHeight;
  state.camera.updateProjectionMatrix();
  state.renderer.setSize(window.innerWidth, window.innerHeight);
  state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  resizeMemoryViewer();
}

// 后续接入 Hyper3D 生成的 GLB 时，服务器只需把文件放到静态资源目录，前端调用此函数即可。
export function loadGLBAsset(url, position = { x: 0, y: 0, z: 0 }, scale = 1) {
  const loader = new GLTFLoader();
  return new Promise((resolve, reject) => {
    loader.load(url, (gltf) => {
      const asset = gltf.scene;
      asset.position.set(position.x, position.y, position.z);
      asset.scale.setScalar(scale);
      asset.traverse((object) => { if (object.isMesh) { object.castShadow = true; object.receiveShadow = true; } });
      state.scene.add(asset);
      resolve(asset);
    }, undefined, reject);
  });
}

// Replace the placeholder bulbs with the supplied pendant GLB while keeping
// the existing rhythm of one fixture every 11 scene units on the corridor
// centerline. The source lamp's origin is at its canopy base, so y is offset
// to keep the visual center at the former bulb height (6.7).
function loadCeilingLightsGLB(url) {
  const loader = new GLTFLoader();
  loader.load(url, (gltf) => {
    const template = gltf.scene;
    let index = 0;
    for (let z = 37; z > -63; z -= 11, index += 1) {
      const lamp = template.clone(true);
      lamp.name = `imported-ceiling-light-${index + 1}`;
      lamp.position.set(0, 6.43, z);
      // Keep the shade's lower edge at the same height while making the
      // supplied fixture three times larger for a stronger ceiling presence.
      lamp.scale.setScalar(3);
      lamp.traverse((object) => {
        if (!object.isMesh) return;
        object.castShadow = true;
        object.receiveShadow = true;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) {
          if (!material) continue;
          material.envMapIntensity = 0.85;
          for (const key of ["map", "normalMap", "roughnessMap", "metalnessMap", "aoMap", "emissiveMap"]) {
            const texture = material[key];
            if (!texture) continue;
            texture.anisotropy = state.renderer.capabilities.getMaxAnisotropy();
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.needsUpdate = true;
          }
        }
      });
      state.scene.add(lamp);
      state.importedLightRoots.push(lamp);
    }
    for (const placeholder of state.lampPlaceholders) placeholder.visible = false;
    showToast("已载入新的顶部灯具模型");
  }, undefined, (error) => {
    console.warn("Unable to load supplied ceiling light GLB; using placeholder bulbs", error);
  });
}

// Replace the quick procedural greenery with the supplied potted plant. The
// source asset is about 2 scene units tall with a 0.75-unit pot, so it is kept
// at native scale and placed in the same wall-side positions as the fallback.
function loadPlantsGLB(url) {
  const loader = new GLTFLoader();
  loader.load(url, (gltf) => {
    const template = gltf.scene;
    const placements = [
      [-6.0, 24.0], [6.0, 8.0], [-6.0, -1.0],
      [6.0, -18.0], [-6.0, -35.0], [6.0, -60.0]
    ];
    placements.forEach(([x, z], index) => {
      const plant = template.clone(true);
      plant.name = `imported-potted-plant-${index + 1}`;
      plant.position.set(x, 0.08, z);
      plant.scale.setScalar(0.9);
      plant.rotation.y = index % 2 ? Math.PI : 0;
      plant.traverse((object) => {
        if (!object.isMesh) return;
        object.castShadow = true;
        object.receiveShadow = true;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) {
          if (!material) continue;
          material.envMapIntensity = 0.7;
          material.roughness = Math.max(material.roughness ?? 0.8, 0.6);
          material.needsUpdate = true;
        }
      });
      state.scene.add(plant);
      state.importedPlantRoots.push(plant);
    });
    for (const placeholder of state.plantPlaceholders) placeholder.visible = false;
    showToast("已载入新的盆栽模型");
  }, undefined, (error) => {
    console.warn("Unable to load supplied potted plant GLB; using procedural plants", error);
  });
}

// Load the supplied Mediterranean arcade as the scene shell. The exported
// GLB is already Y-up with X/Y/Z = width/height/depth, so only non-uniform
// scaling is needed to fit the existing corridor anchors.
// If the file is missing or cannot be decoded, the procedural corridor group
// remains visible and all timeline/card interactions continue to work.
function loadCorridorGLB(url) {
  const loader = new GLTFLoader();
  loader.load(url, (gltf) => {
    const asset = gltf.scene;
    asset.name = "imported-mediterranean-corridor";
    // The exported GLB is already Y-up: X=width, Y=height, Z=depth.
    // Stretch those axes to the existing 16 × 8.8 × 116 corridor envelope.
    asset.scale.set(3.78, 1.74, 9.1);
    asset.position.set(0, -0.12, 48.0);
    // Brighter macaron palette inspired by the supplied lavender/mint chair:
    // lavender, mint, sky blue, coral pink and butter yellow.
    const macaronWallsLeft = [0xd4b5e8, 0xa4d9c2, 0xa6d2e3, 0xefb8c3, 0xf1d89b];
    const macaronWallsRight = [...macaronWallsLeft];
    const ceilingPinks = [0xf6b9cf, 0xf8b8cc, 0xffb9d2, 0xf6b5c5, 0xffc3d3];
    asset.traverse((object) => {
      if (!object.isMesh) return;
      // The source package contains an unintentional default cube. It would
      // appear as a dark block at the entrance after the axis conversion.
      if (/^cube(?:_export)?$/i.test(object.name)) {
        object.visible = false;
        return;
      }
      if (/floor plank|continuous floor foundation/i.test(object.name)) {
        // The source contains a partial plank grid over a coplanar foundation.
        // Hide both and use one continuous floor below, so no depth layer can
        // pop in as the camera moves between rows.
        object.visible = false;
        return;
      }
      if (/sunset vista placeholder/i.test(object.name)) {
        // The Blender placeholder is a flat beige card. Replace it with the
        // smaller gradient vista below so the GLB arch remains readable.
        object.visible = false;
        return;
      }
      const wallLabel = `${object.parent?.name || ""} ${object.name}`;
      const wallMatch = wallLabel.match(/(Wall|Lower plaster) (-?1) bay (\d+)/i);
      const materialLabel = Array.isArray(object.material)
        ? object.material.map((material) => material?.name || "").join(" ")
        : object.material?.name || "";
      const ceilingMatch = /barrel vaulted ceiling/i.test(wallLabel)
        || (!wallMatch && /warm plaster/i.test(materialLabel));
      if (object.geometry?.computeBoundingBox) object.geometry.computeBoundingBox();
      if (wallMatch) {
        const centerZ = object.geometry?.boundingBox
          ? (object.geometry.boundingBox.min.z + object.geometry.boundingBox.max.z) / 2
          : -Number(wallMatch[3]) * 2.5 - 1.25;
        const bay = Math.min(4, Math.max(0, Math.floor((-centerZ + 0.0001) / 2.5)));
        const color = macaronWallsLeft[bay];
        const wallMaterial = Array.isArray(object.material)
          ? object.material.map((material) => material?.clone?.() || material)
          : object.material?.clone?.() || object.material;
        const materials = Array.isArray(wallMaterial) ? wallMaterial : [wallMaterial];
        for (const material of materials) {
          if (!material) continue;
          material.color.setHex(color);
          // The source plaster maps are red-tinted. Remove only that color
          // layer so the macaron block colors remain clean and readable.
          material.map = null;
          material.normalMap = null;
          material.roughnessMap = null;
          material.roughness = 0.88;
          material.emissive.setHex(color);
          material.emissiveIntensity = 0.10;
          material.needsUpdate = true;
        }
        object.material = wallMaterial;
      }
      if (ceilingMatch) {         
        const ceilingColor = 0xdac8ea;
        const topMaterial = Array.isArray(object.material)
          ? object.material.map((material) => material?.clone?.() || material)
          : object.material?.clone?.() || object.material;
        const materials = Array.isArray(topMaterial) ? topMaterial : [topMaterial];
        if (ceilingMatch && object.geometry?.getAttribute("position")) {
          const geometry = object.geometry.clone();
          const positions = geometry.getAttribute("position");
          const vertexColors = new Float32Array(positions.count * 3);
          for (let index = 0; index < positions.count; index += 1) {
            const bay = Math.min(4, Math.max(0, Math.floor((-positions.getZ(index) + 0.0001) / 2.5)));
            const vertexColor = new THREE.Color(ceilingPinks[bay]);
            vertexColors[index * 3] = vertexColor.r;
            vertexColors[index * 3 + 1] = vertexColor.g;
            vertexColors[index * 3 + 2] = vertexColor.b;
          }
          geometry.setAttribute("color", new THREE.Float32BufferAttribute(vertexColors, 3));
          object.geometry = geometry;
          for (const material of materials) {
            if (!material) continue;
            material.color.set(0xffffff);
            material.vertexColors = true;
            material.map = null;
            material.roughness = 0.9;
            material.metalness = 0.02;
            material.emissive.set(0xffffff);
            material.emissiveIntensity = 0.055;
            material.needsUpdate = true;
          }
        } else {
          const fallbackCeilingColor = 0xf8b8cc;
          for (const material of materials) {
            if (!material) continue;
            material.color.setHex(fallbackCeilingColor);
            material.map = null;
            material.roughness = 0.62;
            material.metalness = 0.02;
            material.needsUpdate = true;
          }
        }
        object.material = topMaterial;
      }
      const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
      const plasterColors = [
        [/muted blue plaster/i, 0xa4d9c2],
        [/rose plaster/i, 0xefb8c3],
        [/golden plaster/i, 0xf1d89b],
        [/coral plaster/i, 0xefb8c3],
        [/warm plaster/i, 0xd4b5e8]
      ];
      if (!wallMatch && /wall|plaster/i.test(wallLabel)) {
        const recoloredMaterials = objectMaterials.map((material) => {
          if (!material) return material;
          const match = plasterColors.find(([pattern]) => pattern.test(material.name || ""));
          if (!match) return material;
          const recolored = material.clone();
          recolored.color.setHex(match[1]);
          recolored.map = null;
          recolored.normalMap = null;
          recolored.roughnessMap = null;
          recolored.roughness = 0.88;
          recolored.emissive.setHex(match[1]);
          recolored.emissiveIntensity = 0.10;
          recolored.needsUpdate = true;
          return recolored;
        });
        if (recoloredMaterials.some((material, index) => material !== objectMaterials[index])) {
          object.material = Array.isArray(object.material) ? recoloredMaterials : recoloredMaterials[0];
        }
      }
      if (objectMaterials.some((material) => /honey stone border/i.test(material?.name || ""))) {
        object.visible = false;
        return;
      }
      object.castShadow = true;
      object.receiveShadow = true;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        if (!material) continue;
        material.envMapIntensity = 0.7;
        for (const key of ["map", "normalMap", "roughnessMap", "metalnessMap", "aoMap", "emissiveMap"]) {
          const texture = material[key];
          if (!texture) continue;
          texture.anisotropy = state.renderer.capabilities.getMaxAnisotropy();
          texture.minFilter = THREE.LinearMipmapLinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.needsUpdate = true;
        }
      }
    });
    const floorTexture = new THREE.TextureLoader().load("./assets/textures/mediterranean-atlas/terracotta-floor-soft.png");
    floorTexture.colorSpace = THREE.SRGBColorSpace;
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    // The source swatch contains fine plank lines; repeating it too densely
    // makes those lines alias and shimmer when the camera advances.
    floorTexture.repeat.set(1.4, 8);
    floorTexture.minFilter = THREE.LinearMipmapLinearFilter;
    floorTexture.magFilter = THREE.LinearFilter;
    floorTexture.anisotropy = state.renderer.capabilities.getMaxAnisotropy();
    const floorMaterial = new THREE.MeshStandardMaterial({ map: floorTexture, color: 0xffffff, roughness: 0.68, metalness: 0.02 });
    const floorOverlay = new THREE.Mesh(new THREE.BoxGeometry(16, 0.08, 116), floorMaterial);
    floorOverlay.name = "continuous-web-floor-overlay";
    floorOverlay.position.set(0, -0.06, -9);
    floorOverlay.receiveShadow = true;
    state.scene.add(floorOverlay);
    state.importedFloorRoot = floorOverlay;
    const backdropMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const backdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(10.2, 5.74),
      backdropMaterial
    );
    backdrop.name = "web-end-sunset-backdrop";
    backdrop.position.set(0, 3.8, -67.6);
    backdrop.renderOrder = 2;
    state.endBackdrop = backdrop;
    state.scene.add(backdrop);
    const backdropImageLoader = new THREE.ImageLoader();
    backdropImageLoader.load("./assets/textures/welcome-life-lake.png", (image) => {
      const contrastCanvas = document.createElement("canvas");
      contrastCanvas.width = image.width;
      contrastCanvas.height = image.height;
      const contrastContext = contrastCanvas.getContext("2d");
      contrastContext.drawImage(image, 0, 0);
      const pixels = contrastContext.getImageData(0, 0, image.width, image.height);
      const contrast = 1.32;
      for (let index = 0; index < pixels.data.length; index += 4) {
        pixels.data[index] = Math.max(0, Math.min(255, (pixels.data[index] - 128) * contrast + 128));
        pixels.data[index + 1] = Math.max(0, Math.min(255, (pixels.data[index + 1] - 128) * contrast + 128));
        pixels.data[index + 2] = Math.max(0, Math.min(255, (pixels.data[index + 2] - 128) * contrast + 128));
      }
      contrastContext.putImageData(pixels, 0, 0);
      const enhancedTexture = new THREE.CanvasTexture(contrastCanvas);
      enhancedTexture.colorSpace = THREE.SRGBColorSpace;
      enhancedTexture.minFilter = THREE.LinearMipmapLinearFilter;
      enhancedTexture.magFilter = THREE.LinearFilter;
      backdropMaterial.map = enhancedTexture;
      backdropMaterial.needsUpdate = true;
    }, undefined, (error) => {
      console.warn("Unable to load welcome-life-moments backdrop", error);
    });
    if (state.proceduralEndGate) state.proceduralEndGate.visible = false;
    state.scene.add(asset);
    state.importedCorridorRoot = asset;
    state.importedCorridorLoaded = true;
    if (state.corridorRoot) state.corridorRoot.visible = false;
    showToast("已载入新的地中海拱廊模型");
  }, undefined, (error) => {
    state.importedCorridorLoaded = false;
    console.warn("Unable to load imported corridor GLB; using procedural fallback", error);
  });
}

function loadStudioNodes() {
  try {
    const saved = JSON.parse(localStorage.getItem("life-memory-studio-nodes") || "null");
    if (Array.isArray(saved) && saved.length > 0) {
      return saved.map((node) => ({ ...node, previewUrl: "", processing: "" }));
    }
  } catch (error) {
    console.warn("Unable to restore local studio state", error);
  }
  return studioDefaultNodes.map((node) => ({
    ...node,
    completed: { ...node.completed },
    confirmed: { ...node.confirmed },
    versions: { ...node.versions },
    previewUrl: "",
    processing: ""
  }));
}

function currentStudioNode() {
  return studio.nodes.find((node) => node.id === studio.selectedId) || studio.nodes[0];
}

function currentStudioStage() {
  return studioStages.find((stage) => stage.key === studio.stage) || studioStages[0];
}

function initStudio() {
  if (!studioShell) return;
  openStudioButton?.addEventListener("click", enterStudio);
  backToCorridorButton?.addEventListener("click", exitStudio);
  stageStepper?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-stage]");
    if (!button) return;
    studio.stage = button.dataset.stage;
    const stage = currentStudioStage();
    studio.preview = stage.tabKeys[0];
    renderStudio();
  });
  studioTimeline?.addEventListener("click", (event) => {
    const nodeElement = event.target.closest("[data-node-id]");
    if (!nodeElement) return;
    studio.selectedId = nodeElement.dataset.nodeId;
    const node = currentStudioNode();
    studio.stage = node.stage || "upload";
    studio.preview = currentStudioStage().tabKeys[0];
    renderStudio();
  });
  previewTabs?.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-preview]");
    if (!tab) return;
    studio.preview = tab.dataset.preview;
    renderPreview();
  });
  choosePhoto?.addEventListener("click", () => photoInput?.click());
  uploadZone?.addEventListener("click", (event) => { if (event.target === uploadZone) photoInput?.click(); });
  uploadZone?.addEventListener("dragover", (event) => { event.preventDefault(); uploadZone.classList.add("dragging"); });
  uploadZone?.addEventListener("dragleave", () => uploadZone.classList.remove("dragging"));
  uploadZone?.addEventListener("drop", (event) => {
    event.preventDefault();
    uploadZone.classList.remove("dragging");
    const file = event.dataTransfer?.files?.[0];
    if (file) handleStudioPhoto(file);
  });
  photoInput?.addEventListener("change", (event) => handleStudioPhoto(event.target.files?.[0]));
  studioPrompt?.addEventListener("input", () => {
    const node = currentStudioNode();
    if (!node) return;
    node.prompt = studioPrompt.value;
    markStudioDirty();
  });
  styleChips?.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-style]");
    if (!chip) return;
    const node = currentStudioNode();
    node.style = chip.dataset.style;
    markStudioDirty();
    renderInspector();
  });
  runStageButton?.addEventListener("click", () => runStudioStage());
  confirmStageButton?.addEventListener("click", confirmStudioStage);
  retryStageButton?.addEventListener("click", () => retryStudioStage());
  composeButton?.addEventListener("click", () => {
    studio.stage = "compose";
    studio.preview = "combined";
    runStudioStage();
  });
  publishButton?.addEventListener("click", () => {
    const node = currentStudioNode();
    if (!node.completed.compose) {
      showStudioNotice("请先完成 Blender 组合，再保存到时间轴");
      return;
    }
    node.status = "placed";
    node.stage = "compose";
    markStudioDirty();
    saveStudioState();
    renderStudio();
    showStudioNotice("已保存到人生时间轴");
  });
  addMemoryButton?.addEventListener("click", openNewNodeModal);
  closeNewNode?.addEventListener("click", closeNewNodeModal);
  cancelNewNode?.addEventListener("click", closeNewNodeModal);
  createNewNode?.addEventListener("click", createStudioNode);
  newNodeModal?.addEventListener("click", (event) => { if (event.target === newNodeModal) closeNewNodeModal(); });
  renderStudio();
}

function enterStudio() {
  if (state.controls?.isLocked) state.controls.unlock();
  document.body.classList.add("studio-open");
  studioShell.classList.add("visible");
  studioShell.setAttribute("aria-hidden", "false");
  intro.classList.add("hidden");
  hud.classList.remove("visible");
  crosshair.classList.remove("visible");
  renderStudio();
}

function exitStudio() {
  document.body.classList.remove("studio-open");
  studioShell.classList.remove("visible");
  studioShell.setAttribute("aria-hidden", "true");
  if (state.started) {
    intro.classList.add("hidden");
    hud.classList.add("visible");
  } else {
    intro.classList.remove("hidden");
  }
}

function renderStudio() {
  const node = currentStudioNode();
  if (!node) return;
  if (!node.prompt) node.prompt = currentStudioStage().prompt;
  renderStageStepper();
  renderTimeline();
  renderPreview();
  renderInspector();
  studioMetaYear.textContent = node.year;
  studioMetaTitle.textContent = node.title;
  unsavedIndicator.textContent = studio.unsaved ? "未保存" : "已保存";
  unsavedIndicator.classList.toggle("unsaved", studio.unsaved);
  nodeCount.textContent = String(studio.nodes.length);
}

function renderStageStepper() {
  const node = currentStudioNode();
  stageStepper.innerHTML = studioStages.map((stage, index) => {
    const active = stage.key === studio.stage ? "is-active" : "";
    const complete = node.completed[stage.key] ? "is-complete" : "";
    return `<button class="stage-step ${active} ${complete}" type="button" data-stage="${stage.key}"><span class="stage-number">${index + 1}</span><span>${stage.short}</span></button>`;
  }).join("");
}

function renderTimeline() {
  const sorted = [...studio.nodes].sort((a, b) => Number(a.year) - Number(b.year));
  studioTimeline.innerHTML = "";
  sorted.forEach((node) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = `timeline-node ${node.id === studio.selectedId ? "selected" : ""}`;
    item.dataset.nodeId = node.id;
    const dot = document.createElement("span");
    dot.className = `node-dot ${studioStatusClasses[node.status] || "draft"}`;
    const content = document.createElement("span");
    const year = document.createElement("span");
    year.className = "node-year";
    year.textContent = node.year;
    const title = document.createElement("span");
    title.className = "node-title";
    title.textContent = node.title;
    const status = document.createElement("span");
    status.className = "node-status";
    status.textContent = node.processing ? "处理中" : (studioStatusLabels[node.status] || "草稿");
    content.append(year, title, status);
    item.append(dot, content);
    studioTimeline.appendChild(item);
  });
}

function renderPreview() {
  const node = currentStudioNode();
  const stage = currentStudioStage();
  const allowed = stage.tabKeys;
  if (!allowed.includes(studio.preview)) studio.preview = allowed[0];
  previewTabs.innerHTML = allowed.map((key) => {
    const option = previewOptions.find((item) => item.key === key);
    return `<button type="button" class="preview-tab ${studio.preview === key ? "active" : ""}" data-preview="${key}" role="tab">${option.label}</button>`;
  }).join("");
  const option = previewOptions.find((item) => item.key === studio.preview) || previewOptions[0];
  previewVisual.className = `preview-visual ${option.className}`;
  previewVisual.style.backgroundImage = "";
  if (studio.preview === "original" && node.previewUrl) {
    previewVisual.classList.add("has-photo");
    previewVisual.style.backgroundImage = `url(${node.previewUrl})`;
  }
  previewEyebrow.textContent = `${node.year} · ${option.labelText}`;
  previewTitle.textContent = node.title;
  previewLabel.textContent = option.labelText;
  previewCaption.textContent = stage.caption;
  previewSize.textContent = node.originalName ? node.originalName : "1920 × 1280";
  previewStatus.textContent = node.processing ? "处理中" : (studioStatusLabels[node.status] || "草稿");
  previewStatus.className = `preview-status ${studioStatusClasses[node.status] || "review"}`;
}

function renderInspector() {
  const node = currentStudioNode();
  const stage = currentStudioStage();
  inspectorKicker.textContent = stage.kicker;
  inspectorTitle.textContent = stage.title;
  inspectorDescription.textContent = stage.description;
  uploadZone.style.display = stage.key === "upload" ? "flex" : "none";
  promptBlock.style.display = stage.key === "upload" ? "none" : "block";
  styleBlock.style.display = stage.key === "cartoon" ? "block" : "none";
  blenderBlock.style.display = ["model", "compose"].includes(stage.key) ? "flex" : "none";
  studioPrompt.value = node.prompt || stage.prompt;
  styleChips.innerHTML = studioStyles.map((style) => `<button type="button" class="style-chip ${node.style === style ? "active" : ""}" data-style="${style}">${style}</button>`).join("");
  const processing = Boolean(node.processing);
  const canRun = stage.key === "upload" ? Boolean(node.previewUrl) : !processing;
  runStageButton.disabled = !canRun;
  runStageButton.textContent = processing ? "处理中…" : stageActionLabel(stage.key, node);
  confirmStageButton.disabled = processing || !node.completed[stage.key];
  retryStageButton.disabled = processing || stage.key === "upload" || !node.completed[stage.key];
  composeButton.disabled = processing || !node.completed.model;
}

function stageActionLabel(stageKey, node) {
  if (stageKey === "upload") return node.previewUrl ? "继续到主体分离" : "先选择照片";
  if (stageKey === "split") return node.completed.split ? "再次模拟分离" : "模拟分离结果";
  if (stageKey === "cartoon") return node.completed.cartoon ? "再次模拟卡通化" : "模拟卡通化";
  if (stageKey === "model") return node.completed.model ? "再次模拟 3D" : "模拟生成 3D";
  return node.completed.compose ? "再次模拟组合" : "模拟 Blender 组合";
}

function handleStudioPhoto(file) {
  if (!file || !file.type.startsWith("image/")) {
    showStudioNotice("请选择 PNG、JPG 或 WEBP 图片");
    return;
  }
  const node = currentStudioNode();
  if (node.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(node.previewUrl);
  node.previewUrl = URL.createObjectURL(file);
  node.originalName = file.name;
  node.status = "draft";
  node.stage = "upload";
  node.completed = { upload: true, split: false, cartoon: false, model: false, compose: false };
  node.confirmed = { upload: true, split: false, cartoon: false, model: false, compose: false };
  studio.stage = "upload";
  studio.preview = "original";
  markStudioDirty();
  renderStudio();
  showStudioNotice("照片已放入当前节点，可以开始主体/背景分离");
}

function runStudioStage() {
  const node = currentStudioNode();
  const stage = currentStudioStage();
  if (stage.key === "upload") {
    if (!node.previewUrl) { showStudioNotice("请先选择一张照片"); return; }
    node.completed.upload = true;
    node.confirmed.upload = true;
    studio.stage = "split";
    studio.preview = "original";
    node.status = "split_review";
    markStudioDirty();
    renderStudio();
    showStudioNotice("已进入主体 / 背景分离检查");
    return;
  }
  if (node.processing) return;
  node.processing = stage.key;
  node.status = "processing";
  studioStatusText.textContent = `本地模拟队列 · 正在处理${stage.title}`;
  renderStudio();
  clearTimeout(studio.taskTimer);
  studio.taskTimer = setTimeout(() => {
    node.processing = "";
    node.completed[stage.key] = true;
    node.confirmed[stage.key] = false;
    node.versions[stage.key] = (node.versions[stage.key] || 0) + 1;
    node.status = stage.key === "split" ? "split_review" : stage.key === "cartoon" ? "cartoon_review" : stage.key === "model" ? "model_review" : "placed";
    node.stage = stage.key;
    markStudioDirty();
    renderStudio();
    showStudioNotice(`${stage.title}的模拟结果已生成，请检查后确认`);
  }, 900);
}

function confirmStudioStage() {
  const node = currentStudioNode();
  const stage = currentStudioStage();
  if (node.processing) return;
  if (!node.completed[stage.key]) {
    showStudioNotice("请先完成当前阶段的处理");
    return;
  }
  node.confirmed[stage.key] = true;
  const currentIndex = studioStages.findIndex((item) => item.key === stage.key);
  const next = studioStages[currentIndex + 1];
  if (next) {
    studio.stage = next.key;
    studio.preview = next.tabKeys[0];
    node.stage = next.key;
    node.status = next.key === "split" ? "split_review" : next.key === "cartoon" ? "cartoon_review" : next.key === "model" ? "model_review" : "placed";
  } else {
    node.status = "placed";
  }
  markStudioDirty();
  renderStudio();
  showStudioNotice(next ? `已确认${stage.short}结果，进入下一步` : "已确认并加入长廊");
}

function retryStudioStage() {
  const node = currentStudioNode();
  const stage = currentStudioStage();
  if (stage.key === "upload") return;
  node.confirmed[stage.key] = false;
  runStudioStage();
}

function openNewNodeModal() {
  newNodeModal.classList.add("visible");
  newNodeModal.setAttribute("aria-hidden", "false");
  newNodeYear.value = "";
  newNodeTitle.value = "";
  newNodeYear.focus();
}

function closeNewNodeModal() {
  newNodeModal.classList.remove("visible");
  newNodeModal.setAttribute("aria-hidden", "true");
}

function createStudioNode() {
  const year = newNodeYear.value.trim();
  const title = newNodeTitle.value.trim() || "这一年的故事";
  if (!year) { showStudioNotice("请先填写年份"); return; }
  const id = `memory-${year}-${Date.now()}`;
  studio.nodes.push({
    id, year, title, copy: "这一段记忆还没有写下文字。", location: "NEW MEMORY · TO BE WRITTEN", icon: "✦", palette: ["#d8a56f", "#5c3d31"], previewUrl: "", stage: "upload", status: "draft", completed: { upload: false, split: false, cartoon: false, model: false, compose: false }, confirmed: { upload: false, split: false, cartoon: false, model: false, compose: false }, processing: "", versions: { split: 0, cartoon: 0, model: 0, compose: 0 }, style: "温暖手绘", prompt: "" 
  });
  studio.selectedId = id;
  studio.stage = "upload";
  studio.preview = "original";
  markStudioDirty();
  closeNewNodeModal();
  renderStudio();
  showStudioNotice("新的时间节点已创建");
}

function markStudioDirty() {
  studio.unsaved = true;
  unsavedIndicator.textContent = "未保存";
  unsavedIndicator.classList.add("unsaved");
  clearTimeout(studio.saveTimer);
  studio.saveTimer = setTimeout(saveStudioState, 400);
}

function saveStudioState() {
  try {
    const serializable = studio.nodes.map((node) => ({ ...node, previewUrl: "" }));
    localStorage.setItem("life-memory-studio-nodes", JSON.stringify(serializable));
    studio.unsaved = false;
    if (unsavedIndicator) { unsavedIndicator.textContent = "已保存"; unsavedIndicator.classList.remove("unsaved"); }
  } catch (error) {
    console.warn("Unable to save local studio state", error);
  }
}

function showStudioNotice(message) {
  if (!studioStatusText) return;
  studioStatusText.textContent = message;
  clearTimeout(studioStatusText._noticeTimer);
  studioStatusText._noticeTimer = setTimeout(() => {
    studioStatusText.textContent = "本地模拟模式 · 不会上传照片";
  }, 3200);
}
