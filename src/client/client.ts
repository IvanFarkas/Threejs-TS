import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import Stats from 'three/examples/jsm/libs/stats.module'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'

const scene: THREE.Scene = new THREE.Scene()
const axesHelper = new THREE.AxesHelper(5)
scene.add(axesHelper)

var light1 = new THREE.PointLight()
light1.position.set(2.5, 2.5, 2.5)
light1.castShadow = true
scene.add(light1)

var light2 = new THREE.PointLight()
light2.position.set(-2.5, 2.5, 2.5)
light2.castShadow = true
scene.add(light2)

const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 100)
camera.position.set(0.8, 1.4, 1.0)

const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
document.body.appendChild(renderer.domElement)

const orbitControls = new OrbitControls(camera, renderer.domElement)
orbitControls.screenSpacePanning = true
orbitControls.target.set(0, 1, 0)

const transformControls = new TransformControls(camera, renderer.domElement)
scene.add(transformControls);
transformControls.addEventListener("mouseDown", (event) => {
  orbitControls.enabled = false
});
transformControls.addEventListener("mouseUp", (event) => {
  orbitControls.enabled = true
});

window.addEventListener('keydown', (event: KeyboardEvent) => {
  switch (event.key) {
    case "g":
      transformControls.setMode("translate")
      break
    case "r":
      transformControls.setMode("rotate")
      break
    case "s":
      transformControls.setMode("scale")
      break
  }
})

const planeGeometry = new THREE.PlaneGeometry(25, 25)
const texture = new THREE.TextureLoader().load("img/grid.png")
const plane = new THREE.Mesh(planeGeometry, new THREE.MeshPhongMaterial({ map: texture }))
plane.rotateX(-Math.PI / 2)
plane.receiveShadow = true
scene.add(plane)

let mixer: THREE.AnimationMixer
let modelReady = false
const gltfLoader = new GLTFLoader()

// Character - Eve by J.Gonzales - https://www.mixamo.com/#/?query=eve&type=Character - Convert to glb in Blander
// Animations - Punching - https://www.mixamo.com/#/?query=punching&type=Motion%2CMotionPack - Convert to glb in Blander
gltfLoader.load('models/eve@punching.glb', (gltf) => {
  gltf.scene.traverse(function (child) {
    if ((<THREE.Mesh>child).isMesh) {
      child.castShadow = true
      child.frustumCulled = false;
      (child as THREE.Mesh).geometry.computeVertexNormals()
    }
  });

  mixer = new THREE.AnimationMixer(gltf.scene);
  mixer.clipAction((gltf as any).animations[0]).play()

  transformControls.attach(gltf.scene);

  scene.add(gltf.scene)

  modelReady = true
}, (xhr) => {
  console.log((xhr.loaded / xhr.total * 100) + '% loaded')
}, (error) => {
  console.log(error);
})

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  render()
}, false)

const stats = Stats()
document.body.appendChild(stats.dom)

const clock: THREE.Clock = new THREE.Clock()

var animate = function () {
  requestAnimationFrame(animate)

  orbitControls.update()

  if (modelReady) {
    mixer.update(clock.getDelta());
  }

  render()

  stats.update()
};

function render() {
  renderer.render(scene, camera)
}
animate();
