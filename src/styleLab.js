// src/styleLab.js
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { DotScreenPass } from 'three/addons/postprocessing/DotScreenPass.js';
import { HalftonePass } from 'three/addons/postprocessing/HalftonePass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RGBShiftShader } from 'three/addons/shaders/RGBShiftShader.js';
import { createCatCharacter } from './catCharacter.js';

const settings = { subject: 'torus', background: '#2a2438' };

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(settings.background);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x303050, 2));
const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
keyLight.position.set(3, 4, 5);
scene.add(keyLight);

const torus = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1, 0.35, 160, 24),
  new THREE.MeshStandardMaterial({ color: 0xff8a3d, roughness: 0.4, metalness: 0.1 })
);
scene.add(torus);

const { catSprite, update: updateCat } = createCatCharacter();
scene.add(catSprite);

const SUBJECTS = { 'Torus knot': 'torus', 'Cat sprite': 'cat', Both: 'both' };

function fitCamera() {
  const halfWidthNeeded = settings.subject === 'both' ? 5.5 : 2.5;
  const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  camera.position.z = Math.max(6, halfWidthNeeded / (tanHalfFov * camera.aspect));
}

function applySubject() {
  const { subject } = settings;
  torus.visible = subject !== 'cat';
  catSprite.visible = subject !== 'torus';
  torus.position.x = subject === 'both' ? -2 : 0;
  catSprite.position.x = subject === 'both' ? 2 : 0;
  fitCamera();
}

// Post-processing
const composer = new EffectComposer(renderer);
const dotScreen = new DotScreenPass();
const halftone = new HalftonePass(1, 1, {});
const rgbShift = new ShaderPass(RGBShiftShader);
const film = new FilmPass(0.5, false);

composer.addPass(new RenderPass(scene, camera));
const effects = [dotScreen, halftone, rgbShift, film];
effects.forEach((pass) => {
  pass.enabled = false;
  composer.addPass(pass);
});
composer.addPass(new OutputPass());

// HalftoneShader forces alpha to 1, so the lab keeps an opaque scene background
halftone.enabled = true;

// Controls
const gui = new GUI({ title: 'Style Lab' });

const sceneFolder = gui.addFolder('Scene');
sceneFolder.add(settings, 'subject', SUBJECTS).name('Subject').onChange(applySubject);
sceneFolder.addColor(settings, 'background').name('Background').onChange((value) => scene.background.set(value));

const dotFolder = gui.addFolder('Dot screen');
dotFolder.add(dotScreen, 'enabled').name('Enabled');
dotFolder.add(dotScreen.uniforms.scale, 'value', 0.1, 4, 0.01).name('Scale');
dotFolder.add(dotScreen.uniforms.angle, 'value', 0, Math.PI, 0.01).name('Angle');

const halftoneFolder = gui.addFolder('Halftone');
halftoneFolder.add(halftone, 'enabled').name('Enabled');
halftoneFolder.add(halftone.uniforms.shape, 'value', { Dot: 1, Ellipse: 2, Line: 3, Square: 4 }).name('Shape');
halftoneFolder.add(halftone.uniforms.radius, 'value', 1, 25, 0.5).name('Radius');
halftoneFolder.add(halftone.uniforms.rotateR, 'value', 0, Math.PI, 0.01).name('Rotate R');
halftoneFolder.add(halftone.uniforms.rotateG, 'value', 0, Math.PI, 0.01).name('Rotate G');
halftoneFolder.add(halftone.uniforms.rotateB, 'value', 0, Math.PI, 0.01).name('Rotate B');
halftoneFolder.add(halftone.uniforms.scatter, 'value', 0, 1, 0.01).name('Scatter');
halftoneFolder.add(halftone.uniforms.blending, 'value', 0, 1, 0.01).name('Blending');
halftoneFolder
  .add(halftone.uniforms.blendingMode, 'value', { Linear: 1, Multiply: 2, Add: 3, Lighter: 4, Darker: 5 })
  .name('Blend mode');
halftoneFolder.add(halftone.uniforms.greyscale, 'value').name('Greyscale');

const rgbFolder = gui.addFolder('RGB shift');
rgbFolder.add(rgbShift, 'enabled').name('Enabled');
rgbFolder.add(rgbShift.uniforms.amount, 'value', 0, 0.05, 0.0005).name('Amount');
rgbFolder.add(rgbShift.uniforms.angle, 'value', 0, Math.PI * 2, 0.01).name('Angle');

const filmFolder = gui.addFolder('Film grain');
filmFolder.add(film, 'enabled').name('Enabled');
filmFolder.add(film.uniforms.intensity, 'value', 0, 1, 0.01).name('Intensity');
filmFolder.add(film.uniforms.grayscale, 'value').name('Greyscale');

gui.add(
  {
    disableAll() {
      effects.forEach((pass) => (pass.enabled = false));
      gui.controllersRecursive().forEach((controller) => controller.updateDisplay());
    }
  },
  'disableAll'
).name('Disable all effects');
gui.add({ reset: () => gui.reset() }, 'reset').name('Reset to defaults');

// The open panel would cover most of a phone screen
if (window.innerWidth < 600) gui.close();

// Loop and resize
function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  fitCamera();
}
window.addEventListener('resize', onResize);

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  torus.rotation.x += delta * 0.4;
  torus.rotation.y += delta * 0.6;
  updateCat(0, clock.elapsedTime);

  composer.render(delta);
}

applySubject();
animate();
