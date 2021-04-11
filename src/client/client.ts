import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import Stats from 'three/examples/jsm/libs/stats.module'

const scene: THREE.Scene = new THREE.Scene()

const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000)
camera.position.set(4, 4, 4)

const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)

let mixer: THREE.AnimationMixer
let modelReady = false;

const gltfLoader: GLTFLoader = new GLTFLoader();

const dropzone = document.getElementById("dropzone") as HTMLDivElement

dropzone.ondragover = dropzone.ondragenter = function (evt) {
  evt.preventDefault()
};
dropzone.ondrop = function (evt: DragEvent) {
  evt.stopPropagation()
  evt.preventDefault()

  // Clear the scene
  for (let i = scene.children.length - 1; i >= 0; i--) {
    scene.remove(scene.children[i]);
  }

  // Clear the checkboxes
  const myNode = document.getElementById("animationsPanel") as HTMLDivElement;
  while (myNode.firstChild) {
    myNode.removeChild(myNode.lastChild as any);
  }

  const axesHelper = new THREE.AxesHelper(5)
  scene.add(axesHelper)

  const light1 = new THREE.DirectionalLight(new THREE.Color(0xffcccc));
  light1.position.set(-1, 1, 1)
  scene.add(light1);

  const light2 = new THREE.DirectionalLight(new THREE.Color(0xccffcc));
  light2.position.set(1, 1, 1)
  scene.add(light2);

  const light3 = new THREE.DirectionalLight(new THREE.Color(0xccccff));
  light3.position.set(0, -1, 0)
  scene.add(light3);

  const files = (evt.dataTransfer as DataTransfer).files
  const reader = new FileReader();
  reader.onload = function () {
    gltfLoader.parse(reader.result as string, "/",
      (gltf: GLTF) => {
        console.log(gltf.scene)
        mixer = new THREE.AnimationMixer(gltf.scene);
        console.log(gltf.animations)

        if (gltf.animations.length > 0) {
          const animationsPanel: HTMLDivElement = document.getElementById("animationsPanel") as HTMLDivElement
          const ul: HTMLUListElement = document.createElement("UL") as HTMLUListElement
          const ulElem = animationsPanel.appendChild(ul)

          gltf.animations.forEach((a: THREE.AnimationClip, i) => {
            const li: HTMLLIElement = document.createElement("UL") as HTMLLIElement
            const liElem = ulElem.appendChild(li)

            const checkBox = document.createElement("INPUT") as HTMLInputElement
            checkBox.id = "checkbox_" + i
            checkBox.type = "checkbox"
            checkBox.addEventListener("change", (e: Event) => {
              if ((e.target as HTMLInputElement).checked) {
                mixer.clipAction((gltf as any).animations[i]).play()
              } else {
                mixer.clipAction((gltf as any).animations[i]).stop()
              }
            })
            liElem.appendChild(checkBox)

            const label = document.createElement("LABEL") as HTMLLabelElement
            label.htmlFor = "checkbox_" + i
            label.innerHTML = a.name;
            liElem.appendChild(label)
          })
        } else {
          const animationsPanel: HTMLDivElement = document.getElementById("animationsPanel") as HTMLDivElement
          animationsPanel.innerHTML = "No animations found in model"
        }

        scene.add(gltf.scene)

        const bbox = new THREE.Box3().setFromObject(gltf.scene);
        controls.target.x = ((bbox.min.x + bbox.max.x) / 2)
        controls.target.y = ((bbox.min.y + bbox.max.y) / 2)
        controls.target.z = ((bbox.min.z + bbox.max.z) / 2)

        modelReady = true
      },
      (error) => {
        console.log(error);
      }
    )
  }
  reader.readAsArrayBuffer(files[0]);
};

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  render()
}

const stats = Stats()
document.body.appendChild(stats.dom)

const clock: THREE.Clock = new THREE.Clock()

var animate = function () {
  requestAnimationFrame(animate)

  controls.update()

  if (modelReady) mixer.update(clock.getDelta());

  render()

  stats.update()
};

function render() {
  renderer.render(scene, camera)
}
animate();
