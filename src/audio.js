// src/audio.js
let audioCtx = null;
let analyser = null;
let dataArray = null;

export function initAudio(audioElement) {
  if (audioCtx) return;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContextClass();

  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.4;

  const source = audioCtx.createMediaElementSource(audioElement);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  dataArray = new Uint8Array(analyser.frequencyBinCount);

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

export function getVocalVolume() {
  if (!analyser || !dataArray) return 0;
  analyser.getByteFrequencyData(dataArray);

  let vocalSum = 0;
  const startBin = 2;
  const endBin = 20;

  for (let i = startBin; i < endBin; i++) {
    vocalSum += dataArray[i];
  }

  return (vocalSum / (endBin - startBin)) / 255;
}