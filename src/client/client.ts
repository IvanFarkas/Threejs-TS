// ConvexObjectBreaker - https://sbcode.net/threejs/convexobjectbreaker/

import * as THREE from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import * as CANNON from 'cannon'
import CannonUtils from 'utils/cannonUtils'
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry';
import { ConvexObjectBreaker } from 'three/examples/jsm/misc/ConvexObjectBreaker';
import { Reflector } from 'three/examples/jsm/objects/Reflector'

const scene: THREE.Scene = new THREE.Scene();

// https://sbcode.net/extra_html/img/px.png
const envTexture = new THREE.CubeTextureLoader().load(["img/px.png", "img/nx.png", "img/py.png", "img/ny.png", "img/pz.png", "img/nz.png"])
envTexture.mapping = THREE.CubeReflectionMapping
scene.environment = envTexture

var walls = [
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load('img/px.png'),
    side: THREE.BackSide
  }),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load('img/nx.png'),
    side: THREE.BackSide
  }),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load('img/py.png'),
    side: THREE.BackSide
  }),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load('img/ny.png'),
    side: THREE.BackSide
  }),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load('img/pz.png'),
    side: THREE.BackSide
  }),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load('img/nz.png'),
    side: THREE.BackSide
  })
];
const room = new THREE.Mesh(new THREE.BoxGeometry(200, 200, 200, 1, 1, 1), walls);
scene.add(room);

var light1 = new THREE.DirectionalLight();
light1.position.set(20, 20, 20)
light1.intensity = 2
scene.add(light1);

var light2 = new THREE.DirectionalLight();
light2.position.set(-20, 20, 20)
light1.intensity = 1
scene.add(light2);

const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const menuPanel = document.getElementById('menuPanel') as HTMLDivElement;
const startButton = document.getElementById('startButton') as HTMLButtonElement;
startButton.addEventListener('click', function () {
  controls.lock();
}, false);

const controls = new PointerLockControls(camera, renderer.domElement)
controls.addEventListener('lock', () => menuPanel.style.display = 'none');
controls.addEventListener('unlock', () => menuPanel.style.display = 'block');

camera.position.y = 1
camera.position.z = 2

document.addEventListener('keydown', (event: KeyboardEvent) => {
  switch (event.key) {
    case "w":
      controls.moveForward(.25)
      break;
    case "a":
      controls.moveRight(-.25)
      break;
    case "s":
      controls.moveForward(-.25)
      break;
    case "d":
      controls.moveRight(.25)
      break;
  }
}, false);

const world = new CANNON.World()
world.gravity.set(0, -9.82, 0)

const material: THREE.MeshPhysicalMaterial = new THREE.MeshPhysicalMaterial({
  clearcoat: 1.0,
  clearcoatRoughness: 0,
  clearcoatMap: null,
  clearcoatRoughnessMap: null,
  metalness: 0.5,
  roughness: 0.0,
  color: 'white',
  transmission: 0.4,
  opacity: 1,
  transparent: true,
  side: THREE.DoubleSide,
})

const meshes: { [id: string]: THREE.Mesh } = {}
const bodies: { [id: string]: CANNON.Body } = {}
let meshId = 0;

const groundMirror = new Reflector(new THREE.PlaneBufferGeometry(500, 500), {
  color: new THREE.Color(0x222222),
  clipBias: 0.003,
  textureWidth: window.innerWidth * window.devicePixelRatio,
  textureHeight: window.innerHeight * window.devicePixelRatio
});
groundMirror.position.y = -.05
groundMirror.rotateX(- Math.PI / 2);
scene.add(groundMirror);

const planeShape = new CANNON.Plane()
const planeBody = new CANNON.Body({ mass: 0 })
planeBody.addShape(planeShape)
planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
world.addBody(planeBody)

const convexObjectBreaker = new ConvexObjectBreaker();

for (let i = 0; i < 20; i++) {
  const size = { x: (Math.random() * 4) + 2, y: (Math.random() * 10) + 5, z: (Math.random() * 4) + 2 }
  const geo: THREE.BoxBufferGeometry = new THREE.BoxBufferGeometry(size.x, size.y, size.z)
  const cube = new THREE.Mesh(geo, material)

  cube.position.x = (Math.random() * 50) - 25
  cube.position.y = (size.y / 2) + .1
  cube.position.z = (Math.random() * 50) - 25

  scene.add(cube)
  meshes[meshId] = cube
  convexObjectBreaker.prepareBreakableObject(meshes[meshId], 1, new THREE.Vector3(), new THREE.Vector3(), true)

  const cubeShape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
  const cubeBody = new CANNON.Body({ mass: 1 });
  (cubeBody as any).userData = { splitCount: 0, id: meshId }
  cubeBody.addShape(cubeShape);
  cubeBody.position.x = cube.position.x
  cubeBody.position.y = cube.position.y
  cubeBody.position.z = cube.position.z

  world.addBody(cubeBody);
  bodies[meshId] = cubeBody

  meshId++
}

const bullets: { [id: string]: THREE.Mesh } = {}
const bulletBodies: { [id: string]: CANNON.Body } = {}
let bulletId = 0

const bulletMaterial = new THREE.MeshPhysicalMaterial({
  map: new THREE.TextureLoader().load("img/marble.png"),
  clearcoat: 1.0,
  clearcoatRoughness: 0,
  clearcoatMap: null,
  clearcoatRoughnessMap: null,
  metalness: 0.4,
  roughness: 0.3,
  color: 'white',
})
document.addEventListener('click', onClick, false);
function onClick(e: Event) {
  if (controls.isLocked) {
    const bullet = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), bulletMaterial)
    bullet.position.copy(camera.position)
    scene.add(bullet)
    bullets[bulletId] = bullet

    const bulletShape = new CANNON.Sphere(1);
    const bulletBody = new CANNON.Body({ mass: 1 });
    bulletBody.addShape(bulletShape);
    bulletBody.position.x = camera.position.x;
    bulletBody.position.y = camera.position.y;
    bulletBody.position.z = camera.position.z;

    world.addBody(bulletBody);
    bulletBodies[bulletId] = bulletBody

    bulletBody.addEventListener("collide", (e: CANNON.ICollisionEvent) => {
      if ((e.body as any).userData) {
        if ((e.body as any).userData.splitCount < 2) {
          splitObject((e.body as any).userData, e.contact)
        }
      }
    })
    const v = new THREE.Vector3(0, 0, -1);
    v.applyQuaternion(camera.quaternion);
    v.multiplyScalar(50)
    bulletBody.velocity.set(v.x, v.y, v.z)
    bulletBody.angularVelocity.set((Math.random() * 10) + 1, (Math.random() * 10) + 1, (Math.random() * 10) + 1)

    bulletId++

    //remove old bullets
    while (Object.keys(bullets).length > 5) {
      scene.remove(bullets[bulletId - 6])
      delete bullets[bulletId - 6]
      world.remove(bulletBodies[bulletId - 6])
      delete bulletBodies[bulletId - 6]
    }
  }
};

function splitObject(userData: any, contact: CANNON.ContactEquation) {
  const contactId = userData.id
  if (meshes[contactId]) {
    const poi = bodies[contactId].pointToLocalFrame((contact.bj.position as CANNON.Vec3).vadd(contact.rj))
    const n = new THREE.Vector3(contact.ni.x, contact.ni.y, contact.ni.z).negate()
    const shards = convexObjectBreaker.subdivideByImpact(meshes[contactId], new THREE.Vector3(poi.x, poi.y, poi.z), n, 1, 0);

    scene.remove(meshes[contactId])
    delete meshes[contactId]
    world.remove(bodies[contactId])
    delete bodies[contactId]

    shards.forEach((d: THREE.Object3D) => {
      const nextId = meshId++

      scene.add(d)
      meshes[nextId] = d as THREE.Mesh

      (d as THREE.Mesh).geometry.scale(.99, .99, .99)
      const shape = gemoetryToShape((d as THREE.Mesh).geometry)

      const body = new CANNON.Body({ mass: 1 });
      body.addShape(shape);
      (body as any).userData = { splitCount: userData.splitCount + 1, id: nextId }
      body.position.x = d.position.x
      body.position.y = d.position.y
      body.position.z = d.position.z
      body.quaternion.x = d.quaternion.x
      body.quaternion.y = d.quaternion.y
      body.quaternion.z = d.quaternion.z
      body.quaternion.w = d.quaternion.w
      world.addBody(body)
      bodies[nextId] = body
    })
  }
}

function gemoetryToShape(geometry: THREE.BufferGeometry) {
  const position = geometry.attributes.position.array;
  const points = [];
  for (let i = 0; i < position.length; i += 3) {
    points.push(new THREE.Vector3(position[i], position[i + 1], position[i + 2]));
  }
  const convexHull = new ConvexGeometry(points);
  const shape = CannonUtils.CreateTrimesh(convexHull);
  return shape;
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  render()
}, false)

const stats = Stats()
document.body.appendChild(stats.dom)

const clock: THREE.Clock = new THREE.Clock()

var animate = () => {
  requestAnimationFrame(animate)

  let delta = clock.getDelta()
  if (delta > .1) delta = .1;
  world.step(delta)

  Object.keys(meshes).forEach((m) => {
    meshes[m].position.set(bodies[m].position.x, bodies[m].position.y, bodies[m].position.z);
    meshes[m].quaternion.set(bodies[m].quaternion.x, bodies[m].quaternion.y, bodies[m].quaternion.z, bodies[m].quaternion.w);
  })

  Object.keys(bullets).forEach((b) => {
    bullets[b].position.set(bulletBodies[b].position.x, bulletBodies[b].position.y, bulletBodies[b].position.z);
    bullets[b].quaternion.set(bulletBodies[b].quaternion.x, bulletBodies[b].quaternion.y, bulletBodies[b].quaternion.z, bulletBodies[b].quaternion.w);
  })

  render()

  stats.update()
};

function render() {
  renderer.render(scene, camera)
}

animate();
