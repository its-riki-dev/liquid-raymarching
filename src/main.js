import * as THREE from 'three'
import GUI from 'lil-gui'
import vertexShader from './shaders/vertex.glsl?raw'
import fragmentShader from './shaders/fragment.glsl?raw'

// Renderer
const canvas = document.getElementById('canvas')
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true
})
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.5

// Camera & Scene
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
camera.position.z = 1
const scene = new THREE.Scene()

// Uniforms
const uniforms = {
  iResolution: { value: new THREE.Vector3() },
  iTime: { value: 0 },
  blend: { value: 0.3 },
  lightIntensity: { value: 1.0 },
  specularStrength: { value: 64.0 },
  lightColor: { value: new THREE.Color('#ffffff') }
}

// Shader Material
const geometry = new THREE.PlaneGeometry(2, 2)
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  transparent: true,
  depthWrite: false,
  blending: THREE.NormalBlending,
  uniforms
})
scene.add(new THREE.Mesh(geometry, material))

// Resize
function onResize() {
  const width = window.innerWidth
  const height = window.innerHeight
  const pixelRatio = Math.min(window.devicePixelRatio, 2)

  renderer.setPixelRatio(pixelRatio)
  renderer.setSize(width, height, false)
  material.uniforms.iResolution.value.set(width * pixelRatio, height * pixelRatio, 1)
}
window.addEventListener('resize', onResize)
onResize()

// GUI Controls
const gui = new GUI()
gui.add(uniforms.blend, 'value', 0.0, 1.0).name('Blend')
gui.add(uniforms.lightIntensity, 'value', 0.0, 3.0).name('Light Intensity')
gui.add(uniforms.specularStrength, 'value', 1.0, 128.0).name('Specular Strength')
const colorParams = { lightColor: '#ffffff' }
gui.addColor(colorParams, 'lightColor').name('Light Color').onChange(value => {
  uniforms.lightColor.value.set(value)
})

// Animate
const clock = new THREE.Clock()
let hasLoaded = false

function animate() {
  material.uniforms.iTime.value = clock.getElapsedTime()
  renderer.render(scene, camera)

  if (!hasLoaded) {
    hasLoaded = true
    const loader = document.getElementById('loader')
    loader.classList.add('hidden')
  }

  requestAnimationFrame(animate)
}
animate()