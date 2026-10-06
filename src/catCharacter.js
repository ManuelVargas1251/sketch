// src/catCharacter.js
import * as THREE from 'three';

export function createCatCharacter() {
  const textureLoader = new THREE.TextureLoader();
  const catTexture = textureLoader.load('./src/assets/cat.png');

  // Configure material for high-quality transparent PNG rendering
  const catMaterial = new THREE.SpriteMaterial({
    map: catTexture,
    transparent: true,
    alphaTest: 0.1 // Prevents edge clipping artifacts
  });

  const catSprite = new THREE.Sprite(catMaterial);
  
  // Set aspect ratio based on natural cat dimensions
  catSprite.scale.set(3, 3, 1);
  catSprite.position.set(0, 0, 0);

  function update(vocalVolume, time) {
    // 1. Gentle idle breathing
    catSprite.position.y = Math.sin(time * 2) * 0.5;

    // 2. Scale slightly when audio volume spikes
    const audioScale = 4 + vocalVolume * 0.5;
    catSprite.scale.set(audioScale, audioScale, 1);

    // 3. Subtle tilt when speaking
    catSprite.material.rotation = Math.sin(time * 6) * (vocalVolume * 0.1);
  }

  return { catSprite, update };
}