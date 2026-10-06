// src/scene.js
import * as THREE from 'three';

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1c0c12); // Dark background

export const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Append canvas to container
const container = document.getElementById('canvas-container') || document.body;
container.appendChild(renderer.domElement);

const particleCount = 60;
const particleGeo = new THREE.BufferGeometry();
const posArray = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount * 3; i += 3) {
  posArray[i] = (Math.random() - 0.5) * 10;
  posArray[i + 1] = (Math.random() - 0.5) * 10;
  posArray[i + 2] = (Math.random() - 0.5) * 5;
}

particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particleMat = new THREE.PointsMaterial({
  size: 0.06,
  color: 0x00ff99,
  transparent: true,
  opacity: 0.4
});

export const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// Handle window resizing dynamically
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});