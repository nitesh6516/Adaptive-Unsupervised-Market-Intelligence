export function initAudioReactive(stream, onLevel) {
  const context = new AudioContext();
  const analyser = context.createAnalyser();
  analyser.fftSize = 1024;
  const source = context.createMediaStreamSource(stream);
  const data = new Uint8Array(analyser.frequencyBinCount);
  let raf = 0;
  source.connect(analyser);

  function tick() {
    analyser.getByteFrequencyData(data);
    const sum = data.reduce((total, value) => total + value, 0);
    const level = sum / data.length / 255;
    onLevel(level);
    raf = requestAnimationFrame(tick);
  }
  tick();

  return {
    stop() {
      cancelAnimationFrame(raf);
      source.disconnect();
      context.close();
    }
  };
}
