// ConvexPolyhedrons and Compound Shapes - https://sbcode.net/threejs/compounds-versus-convex-polyhedrons/

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
import * as CANNON from 'cannon'
import CannonDebugRenderer from './utils/cannonDebugRenderer.js'
import CannonUtils from 'utils/cannonUtils'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'

const scene: THREE.Scene = new THREE.Scene()
const axesHelper = new THREE.AxesHelper(5)
scene.add(axesHelper)

var light1 = new THREE.SpotLight();
light1.position.set(2.5, 5, 5)
light1.angle = Math.PI / 4
light1.penumbra = 0.5
light1.castShadow = true;
light1.shadow.mapSize.width = 1024;
light1.shadow.mapSize.height = 1024;
light1.shadow.camera.near = 0.5;
light1.shadow.camera.far = 20
scene.add(light1);

var light2 = new THREE.SpotLight();
light2.position.set(-2.5, 5, 5)
light2.angle = Math.PI / 4
light2.penumbra = 0.5
light2.castShadow = true;
light2.shadow.mapSize.width = 1024;
light2.shadow.mapSize.height = 1024;
light2.shadow.camera.near = 0.5;
light2.shadow.camera.far = 20
scene.add(light2);

const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.screenSpacePanning = true

const world = new CANNON.World()
world.gravity.set(0, -9.82, 0)
// world.broadphase = new CANNON.NaiveBroadphase()
// world.solver.iterations = 10
// world.allowSleep = true

const normalMaterial: THREE.MeshNormalMaterial = new THREE.MeshNormalMaterial()
const phongMaterial: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial()

let monkeyMeshes: THREE.Object3D[] = new Array()
let monkeyBodies: CANNON.Body[] = new Array()
let monkeyLoaded: Boolean = false

const objLoader: OBJLoader = new OBJLoader();

// Character - https://sbcode.net/extra_html/models/monkey.obj
//objLoader.load('models/monkey.obj', (object) => {
objLoader.load('models/monkeyPhysics.obj', (object) => {
  //scene.add(object)

  const monkeyMesh = object.children[0];
  (monkeyMesh as THREE.Mesh).material = normalMaterial;
  (<THREE.MeshNormalMaterial>(<THREE.Mesh>monkeyMesh).material).flatShading = true

  // let monkeyMesh: THREE.Object3D
  // let monkeyCollisionMesh: THREE.Object3D
  // object.traverse(function (child) {
  //   console.log(child.name)
  //   if (child.name === "Suzanne") {
  //     monkeyMesh = child;
  //     (monkeyMesh as THREE.Mesh).material = normalMaterial
  //   } else if (child.name.startsWith("physics")) {
  //     monkeyCollisionMesh = child;
  //   }
  // })

  for (let i = 0; i < 200; i++) {
    const monkeyMeshClone = monkeyMesh.clone()
    monkeyMeshClone.position.x = Math.floor(Math.random() * 10) - 5
    monkeyMeshClone.position.z = Math.floor(Math.random() * 10) - 5
    monkeyMeshClone.position.y = 5 + i
    scene.add(monkeyMeshClone)
    monkeyMeshes.push(monkeyMeshClone)

    // const monkeyShape = CannonUtils.CreateTrimesh((monkeyMesh as THREE.Mesh).geometry)
    // const monkeyShape = CannonUtils.CreateConvexPolyhedron(new THREE.IcosahedronGeometry(1))
    // const monkeyShape = CannonUtils.CreateConvexPolyhedron((monkeyMesh as THREE.Mesh).geometry)
    // const monkeyShape = CannonUtils.CreateConvexPolyhedron((monkeyCollisionMesh as THREE.Mesh).geometry)
    const monkeyBody = new CANNON.Body({ mass: 1 });
    // monkeyBody.addShape(monkeyShape)
    monkeyBody.addShape(new CANNON.Sphere(.8), new CANNON.Vec3(0, .2, 0)) // Head,
    monkeyBody.addShape(new CANNON.Sphere(.05), new CANNON.Vec3(0, -.97, 0.46)) // Chin,
    monkeyBody.addShape(new CANNON.Sphere(.05), new CANNON.Vec3(-1.36, .29, -0.5)) // Left ear
    monkeyBody.addShape(new CANNON.Sphere(.05), new CANNON.Vec3(1.36, .29, -0.5)) // Right ear
    // monkeyBody.addShape(new CANNON.Sphere(.05), new CANNON.Vec3(0, .56, -0.85)) // Head top
    // monkeyBody.addShape(new CANNON.Sphere(.05), new CANNON.Vec3(0, .98, -0.07)) // Forehead top
    monkeyBody.addShape(new CANNON.Sphere(.05), new CANNON.Vec3(-.32, .75, 0.73)) // Left eyebrow top
    monkeyBody.position.x = monkeyMeshClone.position.x
    monkeyBody.position.y = monkeyMeshClone.position.y
    monkeyBody.position.z = monkeyMeshClone.position.z
    world.addBody(monkeyBody)
    monkeyBodies.push(monkeyBody)
  }

  monkeyLoaded = true
}, (xhr) => {
  console.log((xhr.loaded / xhr.total * 100) + '% loaded');
}, (error) => {
  console.log('An error happened');
});

const planeGeometry: THREE.PlaneGeometry = new THREE.PlaneGeometry(25, 25)
const planeMesh: THREE.Mesh = new THREE.Mesh(planeGeometry, phongMaterial)
planeMesh.rotateX(-Math.PI / 2)
planeMesh.receiveShadow = true;
scene.add(planeMesh)
const planeShape = new CANNON.Plane()
const planeBody = new CANNON.Body({ mass: 0 })
planeBody.addShape(planeShape)
planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
world.addBody(planeBody)

camera.position.y = 4
camera.position.z = 4
controls.target.y = 2

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  render()
}

const stats = Stats()
document.body.appendChild(stats.dom)

const gui = new GUI()
const physicsFolder = gui.addFolder("Physics")
physicsFolder.add(world.gravity, "x", -10.0, 10.0, 0.1)
physicsFolder.add(world.gravity, "y", -10.0, 10.0, 0.1)
physicsFolder.add(world.gravity, "z", -10.0, 10.0, 0.1)
physicsFolder.open()

const clock: THREE.Clock = new THREE.Clock()

const cannonDebugRenderer = new CannonDebugRenderer(scene, world)

var animate = function () {
  requestAnimationFrame(animate)

  controls.update()

  let delta = clock.getDelta()
  if (delta > .1) delta = .1
  world.step(delta)
  cannonDebugRenderer.update()

  // Copy coordinates from Cannon.js to Three.js
  if (monkeyLoaded) {
    monkeyMeshes.forEach((m, i) => {
      m.position.set(monkeyBodies[i].position.x, monkeyBodies[i].position.y, monkeyBodies[i].position.z);
      m.quaternion.set(monkeyBodies[i].quaternion.x, monkeyBodies[i].quaternion.y, monkeyBodies[i].quaternion.z, monkeyBodies[i].quaternion.w);
    })
  }

  render()

  stats.update()
};

function render() {
  renderer.render(scene, camera)
}
animate();
