import * as THREE from "three";
import { createCamera, flyInCamera } from "./camera.js";
import { createRendererStack } from "./renderer.js";
import { createConstellationParticles } from "../effects/particles.js";

const palette = {
  text: { primary: 0x00f0ff, secondary: 0x00ff88 },
  image: { primary: 0xff00a0, secondary: 0x00f0ff },
  audio: { primary: 0xff0044, secondary: 0xff00a0 },
  video: { primary: 0x7c3aed, secondary: 0x00f0ff }
};

function makeOrb() {
  const group = new THREE.Group();
  const geometry = new THREE.SphereGeometry(1.45, 96, 96);
  const material = new THREE.MeshStandardMaterial({
    color: 0x00f0ff,
    emissive: 0x003b42,
    roughness: 0.22,
    metalness: 0.28,
    transparent: true,
    opacity: 0.88
  });
  const sphere = new THREE.Mesh(geometry, material);
  group.add(sphere);

  const wire = new THREE.Mesh(
    new THREE.SphereGeometry(1.52, 36, 36),
    new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.16 })
  );
  group.add(wire);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.95, 0.018, 12, 180),
    new THREE.MeshBasicMaterial({ color: 0xff00a0, transparent: true, opacity: 0.72 })
  );
  ring.rotation.x = Math.PI / 2.4;
  group.add(ring);

  const prism = new THREE.Mesh(
    new THREE.BoxGeometry(1.65, 1.65, 1.65, 4, 4, 4),
    new THREE.MeshStandardMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0 })
  );
  group.add(prism);

  return { group, sphere, wire, ring, prism };
}

function makeFloatingField() {
  const group = new THREE.Group();
  const icoGeometry = new THREE.IcosahedronGeometry(0.18, 1);
  const knotGeometry = new THREE.TorusKnotGeometry(0.15, 0.045, 80, 8);
  const icoMaterial = new THREE.MeshStandardMaterial({ color: 0x00f0ff, roughness: 0.3, metalness: 0.4 });
  const knotMaterial = new THREE.MeshStandardMaterial({ color: 0xff00a0, roughness: 0.26, metalness: 0.46 });
  const ico = new THREE.InstancedMesh(icoGeometry, icoMaterial, 48);
  const knot = new THREE.InstancedMesh(knotGeometry, knotMaterial, 28);
  const matrix = new THREE.Matrix4();
  const dummy = new THREE.Object3D();

  for (let i = 0; i < ico.count; i += 1) {
    dummy.position.set((Math.random() - 0.5) * 18, (Math.random() - 0.5) * 9, (Math.random() - 0.5) * 14);
    dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    dummy.scale.setScalar(0.7 + Math.random() * 1.7);
    dummy.updateMatrix();
    ico.setMatrixAt(i, dummy.matrix);
  }
  for (let i = 0; i < knot.count; i += 1) {
    dummy.position.set((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 12);
    dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    dummy.scale.setScalar(0.8 + Math.random() * 1.4);
    dummy.updateMatrix();
    knot.setMatrixAt(i, matrix.copy(dummy.matrix));
  }
  group.add(ico, knot);
  return { group, ico, knot };
}

function createWaveformRing() {
  const points = [];
  for (let i = 0; i <= 256; i += 1) {
    const a = (i / 256) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(a) * 2.35, Math.sin(a) * 2.35, 0));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0xff0044, transparent: true, opacity: 0.78 });
  return new THREE.Line(geometry, material);
}

export function initAetherScene({ canvas, store, reducedMotion, fpsTarget }) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x07070c, 0.026);

  const camera = createCamera();
  flyInCamera(camera, reducedMotion);

  const stack = createRendererStack({ canvas, scene, camera });
  const root = new THREE.Group();
  scene.add(root);

  const ambient = new THREE.AmbientLight(0xffffff, 0.42);
  const cyan = new THREE.PointLight(0x00f0ff, 38, 26);
  cyan.position.set(4, 3, 4);
  const magenta = new THREE.PointLight(0xff00a0, 25, 22);
  magenta.position.set(-5, -2, 5);
  scene.add(ambient, cyan, magenta);

  const particles = createConstellationParticles({
    count: window.innerWidth < 760 || reducedMotion ? 3000 : 15000
  });
  root.add(particles.group);

  const orb = makeOrb();
  orb.group.position.set(0, 0.25, 0);
  root.add(orb.group);

  const waveform = createWaveformRing();
  waveform.visible = false;
  root.add(waveform);

  const floating = makeFloatingField();
  root.add(floating.group);

  const pointer = new THREE.Vector2();
  let audioLevel = 0;
  let mode = store.get().mode || "text";
  let performanceMode = false;
  let paused = false;
  let frames = 0;
  let lastFps = performance.now();
  const clock = new THREE.Clock();

  window.addEventListener("pointermove", (event) => {
    pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
    pointer.y = -(event.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  const observer = new IntersectionObserver(([entry]) => {
    paused = !entry.isIntersecting;
  });
  observer.observe(canvas);

  function setMode(nextMode) {
    mode = nextMode;
    const colors = palette[mode] || palette.text;
    orb.sphere.material.color.setHex(colors.primary);
    orb.sphere.material.emissive.setHex(colors.primary);
    orb.wire.material.color.setHex(colors.primary);
    orb.ring.material.color.setHex(colors.secondary);
    waveform.material.color.setHex(colors.primary);
    waveform.visible = mode === "audio";
    orb.prism.material.opacity = mode === "image" ? 0.28 : 0;
    if (window.gsap) {
      window.gsap.to(orb.group.scale, { x: 1.08, y: 1.08, z: 1.08, duration: 0.18, yoyo: true, repeat: 1 });
    }
  }

  function burst() {
    particles.burst(pointer);
  }

  function animate() {
    requestAnimationFrame(animate);
    if (paused) return;
    const delta = clock.getDelta();
    const elapsed = clock.elapsedTime;
    root.rotation.y += (pointer.x * 0.05 - root.rotation.y) * 0.025;
    root.rotation.x += (pointer.y * 0.035 - root.rotation.x) * 0.025;

    particles.update(elapsed, pointer, performanceMode);
    floating.group.rotation.y += delta * 0.05;
    floating.group.rotation.x = Math.sin(elapsed * 0.2) * 0.05;
    orb.group.rotation.y += delta * (mode === "image" ? 0.75 : 0.32);
    orb.group.rotation.x = Math.sin(elapsed * 0.55) * 0.08;
    orb.sphere.scale.setScalar(1 + Math.sin(elapsed * 2.3) * 0.025 + audioLevel * 0.2);
    orb.ring.rotation.z -= delta * (0.28 + audioLevel);
    orb.prism.rotation.y -= delta * 0.9;

    if (mode === "audio") {
      const positions = waveform.geometry.attributes.position;
      for (let i = 0; i < positions.count; i += 1) {
        const a = (i / (positions.count - 1)) * Math.PI * 2;
        const radius = 2.35 + Math.sin(a * 16 + elapsed * 5) * (0.08 + audioLevel * 0.3);
        positions.setXYZ(i, Math.cos(a) * radius, Math.sin(a) * radius, 0);
      }
      positions.needsUpdate = true;
    }

    if (reducedMotion) {
      stack.renderer.render(scene, camera);
    } else {
      stack.composer.render();
    }

    frames += 1;
    if (performance.now() - lastFps > 1000) {
      fpsTarget.textContent = String(frames);
      frames = 0;
      lastFps = performance.now();
    }
  }

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    stack.resize();
  });

  setMode(mode);
  animate();

  return {
    setMode,
    burst,
    setAudioLevel(level) {
      audioLevel = Math.min(1, Math.max(0, level));
    },
    setPerformanceMode(enabled) {
      performanceMode = enabled;
      stack.setPerformanceMode(enabled);
    }
  };
}
