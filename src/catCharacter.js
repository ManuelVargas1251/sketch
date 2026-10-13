// src/catCharacter.js
import * as THREE from 'three';

export function createCatCharacter() {
  const GIF_URL = './src/assets/gif/b.gif';

  // Configure material for high-quality transparent PNG rendering
  const catMaterial = new THREE.SpriteMaterial({
    transparent: true,
    alphaTest: 0.1, // Prevents edge clipping artifacts
    visible: false // Hidden until the first frame is ready
  });

  const catSprite = new THREE.Sprite(catMaterial);
  
  // Set aspect ratio based on natural cat dimensions
  catSprite.scale.set(3, 3, 1);
  catSprite.position.set(0, 0, 0);

  const frames = [];
  const frameEnds = [];
  let totalDuration = 0;
  let currentFrame = -1;
  let ctx = null;
  let canvasTexture = null;

  function showTexture(texture) {
    texture.colorSpace = THREE.SRGBColorSpace;
    catMaterial.map = texture;
    catMaterial.visible = true;
    catMaterial.needsUpdate = true;
  }

  async function loadGifFrames() {
    if (!('ImageDecoder' in window)) {
      showTexture(new THREE.TextureLoader().load(GIF_URL));
      return;
    }

    const data = await (await fetch(GIF_URL)).arrayBuffer();
    const decoder = new ImageDecoder({ data, type: 'image/gif' });
    await decoder.tracks.ready;
    const frameCount = decoder.tracks.selectedTrack.frameCount;

    for (let i = 0; i < frameCount; i++) {
      const { image } = await decoder.decode({ frameIndex: i });
      frames.push(await createImageBitmap(image));
      // VideoFrame.duration is in microseconds; some GIFs report 0, so floor at 20ms
      totalDuration += Math.max(image.duration / 1000, 20);
      frameEnds.push(totalDuration);
      image.close();
    }
    decoder.close();

    const canvas = document.createElement('canvas');
    canvas.width = frames[0].width;
    canvas.height = frames[0].height;
    ctx = canvas.getContext('2d');
    canvasTexture = new THREE.CanvasTexture(canvas);
    showTexture(canvasTexture);
  }

  loadGifFrames().catch((err) => console.error('GIF load failed', err));

  function advanceGif(time) {
    if (!canvasTexture || frames.length < 2) return;

    const t = (time * 1000) % totalDuration;
    const index = frameEnds.findIndex((end) => t < end);
    if (index === currentFrame) return;

    currentFrame = index;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(frames[index], 0, 0);
    canvasTexture.needsUpdate = true;
  }

  function update(vocalVolume, time) {
    advanceGif(time);

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