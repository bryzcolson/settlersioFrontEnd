import {
  AmbientLight,
  Clock,
  LoadingManager,
  Mesh,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PointLight,
  Scene,
  WebGLRenderer,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import './style.css'
import { RWorld } from './three/RefactoredWorld'
import { TileType } from './three/Tile'

const CANVAS_ID = 'scene'

let canvas: HTMLElement
let renderer: WebGLRenderer
let scene: Scene
let loadingManager: LoadingManager
let ambientLight: AmbientLight
let pointLight: PointLight
let world: Mesh
let camera: PerspectiveCamera
let cameraControls: OrbitControls
let stats: Stats

init()
animate()

function init() {
  // ===== 🖼️ CANVAS, RENDERER, & SCENE =====
  canvas = document.querySelector(`canvas#${CANVAS_ID}`)!
  renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = PCFSoftShadowMap
  scene = new Scene()

  // ===== 👨🏻‍💼 LOADING MANAGER =====
  loadingManager = new LoadingManager()
  loadingManager.onStart = () => {
    console.log('loading started')
  }
  loadingManager.onProgress = (url, loaded, total) => {
    console.log('loading in progress:')
    console.log(`${url} -> ${loaded} / ${total}`)
  }
  loadingManager.onLoad = () => {
    console.log('loaded!')
  }
  loadingManager.onError = () => {
    console.log('❌ error while loading')
  }

  // ===== 💡 LIGHTS =====
  ambientLight = new AmbientLight('white', 0.4)
  pointLight = new PointLight('#ffdca8', 1.2, 100)
  pointLight.position.set(5, 15, 12)
  pointLight.castShadow = true
  pointLight.shadow.radius = 4
  pointLight.shadow.camera.near = 0.5
  pointLight.shadow.camera.far = 4000
  pointLight.shadow.mapSize.width = 2048
  pointLight.shadow.mapSize.height = 2048
  scene.add(ambientLight)
  scene.add(pointLight)

  // ===== 📦 OBJECTS =====
  let tileGridWidth = 6;
  let tileGridHeight = 6;
  let tileTypes:TileType[][] = [];
  for (let i = 0; i < tileGridWidth; i++) {
    tileTypes.push([]);
    for (let j = 0; j < tileGridHeight; j++) {
      let typeNum = Math.floor(Math.random()*4);
      let tileType = null;
      //typeNum = 1;
      if (typeNum == 0 || typeNum == 4) {
          tileType = TileType.STONE;
      } else if (typeNum == 1) {
          tileType = TileType.SHEEP;
      } else if (typeNum == 2) {
          tileType = TileType.WHEAT;
      } else {
        tileType = TileType.STONE;
      }
      tileTypes[i].push(tileType);
    }
  }
  world = new RWorld(3,6,5,tileTypes).getTerrain();
  scene.add(world);

  // ===== 🎥 CAMERA =====
  camera = new PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100)
  camera.position.set(0, 25, 25)

  // ===== 🕹️ CONTROLS =====
  cameraControls = new OrbitControls(camera, canvas)
  cameraControls.target = world.position.clone()
  cameraControls.enableDamping = true
  cameraControls.autoRotate = false
  cameraControls.update()

  // ===== 📈 STATS & CLOCK =====
  {
    new Clock()
    stats = Stats()
    document.body.appendChild(stats.dom)
  }
}


function animate() {
  requestAnimationFrame(animate)

  stats.update()

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  cameraControls.update();

  renderer.render(scene, camera);
}

function resizeRendererToDisplaySize(renderer: THREE.WebGLRenderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

