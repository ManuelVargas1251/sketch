// src/catCharacter.js
import * as THREE from 'three';

export function createCatCharacter() {
  const SHEET_URL = './src/assets/sprite/b.png';
  const COLS = 5;
  const ROWS = 9;
  const FRAMES = COLS * ROWS;
  const FPS = 12;

  const sheetTexture = new THREE.TextureLoader().load(SHEET_URL);
  sheetTexture.colorSpace = THREE.SRGBColorSpace;
  sheetTexture.repeat.set(1 / COLS, 1 / ROWS);
  sheetTexture.offset.set(0, 1 - 1 / ROWS);
  // Nearest filtering keeps pixel edges crisp and stops neighbouring cells bleeding in
  sheetTexture.magFilter = THREE.NearestFilter;
  sheetTexture.minFilter = THREE.NearestFilter;
  sheetTexture.generateMipmaps = false;

  // Configure material for high-quality transparent PNG rendering
  const catMaterial = new THREE.SpriteMaterial({
    map: sheetTexture,
    transparent: true,
    alphaTest: 0.1 // Prevents edge clipping artifacts
  });

  const catSprite = new THREE.Sprite(catMaterial);
  
  // Set aspect ratio based on natural cat dimensions
  catSprite.scale.set(3, 3, 1);
  catSprite.position.set(0, 0, 0);

  let currentFrame = 0;

  function advanceSheet(time) {
    const frame = Math.floor(time * FPS) % FRAMES;
    if (frame === currentFrame) return;

    currentFrame = frame;
    const col = frame % COLS;
    const row = Math.floor(frame / COLS);
    sheetTexture.offset.set(col / COLS, 1 - (row + 1) / ROWS);
  }

  function update(vocalVolume, time) {
    advanceSheet(time);

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