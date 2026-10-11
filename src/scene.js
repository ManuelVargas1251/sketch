// src/scene.js
import * as THREE from 'three';

export const scene = new THREE.Scene();

// 1. Remove/comment out solid background so the index.html CSS gradient shows through!
// (If you want a solid Three.js color instead of CSS, use: scene.background = new THREE.Color('#e8f3fa');)

export const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

// 2. Enable { alpha: true } so the WebGL canvas is transparent
export const renderer = new THREE.WebGLRenderer({ 
  antialias: true, 
  alpha: true 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Append canvas to container
const container = document.getElementById('canvas-container') || document.body;
container.appendChild(renderer.domElement);

// 3. Ambient Dust Particles (Pastel Misty Rose / Warm Gold instead of neon green)
const particleCount = 60;
const particleGeo = new THREE.BufferGeometry();
const posArray = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount * 3; i += 3) {
  posArray[i]     = (Math.random() - 0.5) * 10;
  posArray[i + 1] = (Math.random() - 0.5) * 10;
  posArray[i + 2] = (Math.random() - 0.5) * 5;
}

particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particleMat = new THREE.PointsMaterial({
  size: 0.08,
  color: 0xfff0f5, // Soft Lavender/Misty Rose (Replaces 0x00ff99 green)
  transparent: true,
  opacity: 0.65
});

export const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// Handle window resizing dynamically
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});