// Vector3 Lerp - https://sbcode.net/threejs/vector3-lerp/

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'

const scene: THREE.Scene = new THREE.Scene()

const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(1, 2, 5)

const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
const floor = new THREE.Mesh(new THREE.PlaneBufferGeometry(20, 20, 10, 10), new THREE.MeshBasicMaterial({ color: 0xaec6cf, wireframe: true }))
floor.rotateX(-Math.PI / 2)
scene.add(floor)

const geometry: THREE.BoxGeometry = new THREE.BoxGeometry()

//the cube used for .lerp
const cube1: THREE.Mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true }))
cube1.position.y = .5
scene.add(cube1)

//the cube used for .lerpVectors
const cube2: THREE.Mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }))
cube2.position.y = .5
scene.add(cube2)

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  render()
}, false)

const raycaster = new THREE.Raycaster()

let v1 = new THREE.Vector3(0, 0.5, 0)
let v2 = new THREE.Vector3(0, 0.5, 0)

renderer.domElement.addEventListener('dblclick', onDoubleClick, false);
function onDoubleClick(event: MouseEvent) {
  const mouse = {
    x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
    y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1
  }
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObject(floor, false);

  if (intersects.length > 0) {

    v1 = intersects[0].point
    v1.y += .5 //raise it so it appears to sit on grid
    //console.log(v1)
  }
}

const stats = Stats()
document.body.appendChild(stats.dom)

const data = {
  lerpAlpha: 0.1,
  lerpVectorsAlpha: 1.0
}

const gui = new GUI()
const lerpFolder = gui.addFolder(".lerp")
lerpFolder.add(data, "lerpAlpha", 0, 1.0, 0.01)
lerpFolder.open()
const lerpVectorsFolder = gui.addFolder(".lerpVectors")
lerpVectorsFolder.add(data, "lerpVectorsAlpha", 0, 1.0, 0.01)
lerpVectorsFolder.open()

const animate = function () {
  requestAnimationFrame(animate)

  controls.update()

  cube1.position.lerp(v1, data.lerpAlpha);

  cube2.position.lerpVectors(v1, v2, data.lerpVectorsAlpha);

  controls.target.copy(cube1.position)

  render()

  stats.update()
};

function render() {
  renderer.render(scene, camera)
}
animate();
