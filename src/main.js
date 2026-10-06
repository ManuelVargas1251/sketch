// src/main.js
import * as THREE from 'three';
import { scene, camera, particles, renderer } from './scene.js';
import { createCatCharacter } from './catCharacter.js';
import { initAudio, getVocalVolume } from './audio.js';

// 1. Add Cat Character
const { catSprite, update: updateCat } = createCatCharacter();
scene.add(catSprite);

let mouse = { x: 0, y: 0 };

window.addEventListener('pointermove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// 2. Audio Playback Event Listener
const audioElement = document.getElementById('audio-player');
if (audioElement) {
  audioElement.addEventListener('play', () => {
    initAudio(audioElement);
  });
}

// 3. Main Render Loop
const clock = new THREE.Clock();

function animateParticles() {
  const positions = particles.geometry.attributes.position.array;

  for (let i = 1; i < positions.length; i += 3) {
    positions[i] += 0.005;

    if (positions[i] > 5) {
      positions[i] = -5;
    }
  }

  particles.geometry.attributes.position.needsUpdate = true;
  particles.rotation.y += 0.001;
}

function animate() {
  requestAnimationFrame(animate);

  animateParticles();

  const time = clock.getElapsedTime();
  const vocalVolume = getVocalVolume();

  // Update cat animation state
  updateCat(vocalVolume, time);

  const targetRotation = mouse.x * 0.2;
  const targetX = -mouse.x * 0.6;

  catSprite.material.rotation = THREE.MathUtils.lerp(
    catSprite.material.rotation,
    targetRotation,
    0.05
  );
  catSprite.position.x = THREE.MathUtils.lerp(
    catSprite.position.x,
    targetX,
    0.05
  );

  renderer.render(scene, camera);
}

animate();