import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import Stats from 'three/examples/jsm/libs/stats.module'

const scene: THREE.Scene = new THREE.Scene()
const axesHelper = new THREE.AxesHelper(5)
scene.add(axesHelper)

var light = new THREE.PointLight();
light.position.set(2.5, 7.5, 15)
scene.add(light);

const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 3

const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)

const material: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true })

const objLoader: OBJLoader = new OBJLoader();
objLoader.load(
  'models/monkey.obj',
  (object) => {
    //(<THREE.Mesh>object.children[0]).material = material
    object.traverse(function (child) {
      if ((<THREE.Mesh>child).isMesh) {
        (<THREE.Mesh>child).material = material
      }
    })
    scene.add(object);
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded')
  },
  (error) => {
    console.log(error);
  }
)

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

  controls.update()

  render()

  stats.update()
};

function render() {
  renderer.render(scene, camera)
}
animate();
