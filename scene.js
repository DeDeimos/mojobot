import * as THREE from "three";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";

let container, stats, clock, gui, mixer, actions, activeAction, previousAction;
let camera, renderer, face;
export let model, scene;
const worldWidth = 11,
  worldDepth = 11;
const worldHalfWidth = worldWidth / 2;
const worldHalfDepth = worldDepth / 2;

const api = { state: "Walking" };
let jsonData = {
  coordinates: [],
  direction: "север",
  location: "почва",
  nearLocations: [],
};

export function updateData(newData) {
  jsonData = newData;
  console.log(jsonData);
}

export function init() {
  container = document.createElement("div");
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  );
  const [x, y, z] = jsonData.coordinates.map((x) => x * 100);
  camera.position.set(x, y + 820, z);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe0e0e0);
  // scene.fog = new THREE.Fog( 0xe0e0e0, 10, 1000 );

  clock = new THREE.Clock();

  // lights

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 3);
  dirLight.position.set(0, 20, 10);
  scene.add(dirLight);

  // sides
  addSide();

  const grid = new THREE.GridHelper(200, 40, 0xf03c00, 0xf03c00);
  grid.material.opacity = 0.2;
  grid.material.transparent = true;
  grid.position.set(...jsonData.coordinates.map((x) => x * 100));
  scene.add(grid);

  // model

  const loader = new GLTFLoader();
  loader.load(
    "http://185.204.2.233:3030/RobotExpressive.glb",
    function (gltf) {
      model = gltf.scene;
      model.scale.set(32, 32, 32);
      model.position.set(...jsonData.coordinates.map((x) => x * 100));
      if (jsonData.direction == "север") {
        model.rotation.set(0, 0, 0); // Не нужно поворачивать, так как это стандартная ориентация
      } else if (jsonData.direction == "юг") {
        model.rotation.set(0, Math.PI, 0); // Повернуть на 180 градусов вокруг оси Y
      } else if (jsonData.direction == "запад") {
        model.rotation.set(0, -Math.PI / 2, 0); // Повернуть на -90 градусов вокруг оси Y
      } else if (jsonData.direction == "восток") {
        model.rotation.set(0, Math.PI / 2, 0); // Повернуть на 90 градусов вокруг оси Y
      }
      scene.add(model);
      createGUI(model, gltf.animations);
    },
    undefined,
    function (e) {
      console.error(e);
    }
  );

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableZoom = true;
  controls.target.set(...jsonData.coordinates.map((x) => x * 100));
  controls.update();

  window.addEventListener("resize", onWindowResize);

  // stats
  stats = new Stats();
  container.appendChild(stats.dom);
}

export function createGUI(model, animations) {
  const states = [
    "Idle",
    "Walking",
    "Running",
    "Dance",
    "Death",
    "Sitting",
    "Standing",
  ];
  const emotes = ["Jump", "Yes", "No", "Wave", "Punch", "ThumbsUp"];

  gui = new GUI();

  mixer = new THREE.AnimationMixer(model);

  actions = {};

  for (let i = 0; i < animations.length; i++) {
    const clip = animations[i];

    const action = mixer.clipAction(clip);
    actions[clip.name] = action;

    if (emotes.indexOf(clip.name) >= 0 || states.indexOf(clip.name) >= 4) {
      action.clampWhenFinished = true;
      action.loop = THREE.LoopOnce;
    }
  }

  // states

  const statesFolder = gui.addFolder("States");

  const clipCtrl = statesFolder.add(api, "state").options(states);

  clipCtrl.onChange(function () {
    fadeToAction(api.state, 0.5);
  });

  statesFolder.open();

  // emotes

  const emoteFolder = gui.addFolder("Emotes");

  function createEmoteCallback(name) {
    api[name] = function () {
      fadeToAction(name, 0.2);

      mixer.addEventListener("finished", restoreState);
    };

    emoteFolder.add(api, name);
  }

  function restoreState() {
    mixer.removeEventListener("finished", restoreState);

    fadeToAction(api.state, 0.2);
  }

  for (let i = 0; i < emotes.length; i++) {
    createEmoteCallback(emotes[i]);
  }

  emoteFolder.open();

  // expressions

  face = model.getObjectByName("Head_4");

  const expressions = Object.keys(face.morphTargetDictionary);
  const expressionFolder = gui.addFolder("Expressions");

  for (let i = 0; i < expressions.length; i++) {
    expressionFolder
      .add(face.morphTargetInfluences, i, 0, 1, 0.01)
      .name(expressions[i]);
  }
  //   // Находим индекс выражения "Smile" в массиве expressions
  //   const smileIndex = expressions.indexOf("Angry");
  //   console.log(smileIndex)
  //   console.log(face.morphTargetInfluences)
  //   // Устанавливаем значение для выражения "Smile"
  //   face.morphTargetInfluences[smileIndex] = 1; // 1 означает полную улыбку
  activeAction = actions["Walking"];
  activeAction.play();

  expressionFolder.open();
}

export function fadeToAction(name, duration) {
  previousAction = activeAction;
  activeAction = actions[name];

  if (previousAction !== activeAction) {
    previousAction.fadeOut(duration);
  }

  activeAction
    .reset()
    .setEffectiveTimeScale(1)
    .setEffectiveWeight(1)
    .fadeIn(duration)
    .play();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

export function animate() {
  const dt = clock.getDelta();

  if (mixer) mixer.update(dt);

  requestAnimationFrame(animate);

  renderer.render(scene, camera);

  stats.update();
}

export function addSide() {
  const blockMeshes = [];
  const matrix = new THREE.Matrix4();

  const pxGeometry = new THREE.PlaneGeometry(100, 100);
  pxGeometry.attributes.uv.array[1] = 0.5;
  pxGeometry.attributes.uv.array[3] = 0.5;
  pxGeometry.rotateY(Math.PI / 2);
  pxGeometry.translate(50, 0, 0);

  const nxGeometry = new THREE.PlaneGeometry(100, 100);
  nxGeometry.attributes.uv.array[1] = 0.5;
  nxGeometry.attributes.uv.array[3] = 0.5;
  nxGeometry.rotateY(-Math.PI / 2);
  nxGeometry.translate(-50, 0, 0);

  const pyGeometry = new THREE.PlaneGeometry(100, 100);
  pyGeometry.attributes.uv.array[5] = 0.5;
  pyGeometry.attributes.uv.array[7] = 0.5;
  pyGeometry.rotateX(-Math.PI / 2);
  pyGeometry.translate(0, 50, 0);

  const nyGeometry = new THREE.PlaneGeometry(100, 100);
  nyGeometry.attributes.uv.array[5] = 0.5;
  nyGeometry.attributes.uv.array[7] = 0.5;
  nyGeometry.rotateX(Math.PI / 2);
  nyGeometry.translate(0, -50, 0);

  const pzGeometry = new THREE.PlaneGeometry(100, 100);
  pzGeometry.attributes.uv.array[1] = 0.5;
  pzGeometry.attributes.uv.array[3] = 0.5;
  pzGeometry.translate(0, 0, 50);

  const nzGeometry = new THREE.PlaneGeometry(100, 100);
  nzGeometry.attributes.uv.array[1] = 0.5;
  nzGeometry.attributes.uv.array[3] = 0.5;
  nzGeometry.rotateY(Math.PI);
  nzGeometry.translate(0, 0, -50);

  const geometries = [];
  const group = new THREE.Group();
  const blocks = jsonData.nearLocations;

  jsonData.nearLocations.forEach((nearLocation) => {
    const [x, h, z] = nearLocation.coordinates;
    const location = nearLocation.location;
    matrix.makeTranslation(x * 100, h * 100 + 50, z * 100);

    let material;
    let texture;
    if (location === "почва") {
      texture = new THREE.TextureLoader().load(
        "http://185.204.2.233:3030/atlas.png"
      );
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.magFilter = THREE.NearestFilter;
      material = new THREE.MeshLambertMaterial({
        map: texture,
        side: THREE.DoubleSide,
      });
    } else if (location === "кислотная поверхность") {
      texture = new THREE.TextureLoader().load(
        "http://185.204.2.233:3030/poison.png"
      );
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.magFilter = THREE.NearestFilter;
      material = new THREE.MeshLambertMaterial({
        map: texture,
        side: THREE.DoubleSide,
      });
    } else if (location === "песок") {
      texture = new THREE.TextureLoader().load(
        "http://185.204.2.233:3030/mud.png"
      );
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.magFilter = THREE.NearestFilter;
      material = new THREE.MeshLambertMaterial({
        map: texture,
        side: THREE.DoubleSide,
      });
    }

    const blockGeometry = BufferGeometryUtils.mergeGeometries([
      pyGeometry.clone().applyMatrix4(matrix),
      nyGeometry.clone().applyMatrix4(matrix),
      pxGeometry.clone().applyMatrix4(matrix),
      nxGeometry.clone().applyMatrix4(matrix),
      pzGeometry.clone().applyMatrix4(matrix),
      nzGeometry.clone().applyMatrix4(matrix),
    ]);
    const blockMesh = new THREE.Mesh(blockGeometry, material);
    blockMeshes.push(blockMesh);
    scene.add(blockMesh);
  });
}