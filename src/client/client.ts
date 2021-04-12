import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'

const scene: THREE.Scene = new THREE.Scene()

const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 2

const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const raycaster = new THREE.Raycaster();
const sceneMeshes = new Array()
let dir = new THREE.Vector3();
let intersects = new Array()

const controls = new OrbitControls(camera, renderer.domElement)
controls.addEventListener('change', () => {
  xLine.position.copy(controls.target)
  yLine.position.copy(controls.target)
  zLine.position.copy(controls.target)

  dir.subVectors(camera.position, controls.target).normalize();

  raycaster.set(controls.target, dir.subVectors(camera.position, controls.target).normalize())
  intersects = raycaster.intersectObjects(sceneMeshes, false);
  if (intersects.length > 0) {
    if (intersects[0].distance < controls.target.distanceTo(camera.position)) {
      camera.position.copy(intersects[0].point)
    }
  }
})

const floor = new THREE.Mesh(new THREE.PlaneBufferGeometry(10, 10), new THREE.MeshNormalMaterial({ side: THREE.DoubleSide }))
floor.rotateX(-Math.PI / 2)
floor.position.y = -1
scene.add(floor)
sceneMeshes.push(floor)

const wall1 = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), new THREE.MeshNormalMaterial({ side: THREE.DoubleSide }))
wall1.position.x = 4
wall1.rotateY(-Math.PI / 2)
scene.add(wall1)
sceneMeshes.push(wall1)

const wall2 = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), new THREE.MeshNormalMaterial({ side: THREE.DoubleSide }))
wall2.position.z = -3
scene.add(wall2)
sceneMeshes.push(wall2)

const cube: THREE.Mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(), new THREE.MeshNormalMaterial())
cube.position.set(-3, 0, 0)
scene.add(cube)
sceneMeshes.push(cube)

const ceiling = new THREE.Mesh(new THREE.PlaneBufferGeometry(10, 10), new THREE.MeshNormalMaterial({ side: THREE.DoubleSide }))
ceiling.rotateX(Math.PI / 2)
ceiling.position.y = 3
scene.add(ceiling)
sceneMeshes.push(ceiling)

// Crosshair
const lineMaterial = new THREE.LineBasicMaterial({
  color: 0x0000ff
});
var points = new Array();
points[0] = new THREE.Vector3(-.1, 0, 0);
points[1] = new THREE.Vector3(.1, 0, 0);
let lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
const xLine = new THREE.Line(lineGeometry, lineMaterial);
scene.add(xLine);
points[0] = new THREE.Vector3(0, -.1, 0);
points[1] = new THREE.Vector3(0, .1, 0);
lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
const yLine = new THREE.Line(lineGeometry, lineMaterial);
scene.add(yLine);
points[0] = new THREE.Vector3(0, 0, -.1);
points[1] = new THREE.Vector3(0, 0, .1);
lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
const zLine = new THREE.Line(lineGeometry, lineMaterial);
scene.add(zLine);

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  render()
}

const stats = Stats()
document.body.appendChild(stats.dom)

var animate = function () {
  requestAnimationFrame(animate)

  render()

  stats.update()
};

function render() {
  renderer.render(scene, camera)
}
animate();
