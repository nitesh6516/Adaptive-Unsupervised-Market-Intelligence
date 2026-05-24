import * as THREE from "three";

export function createConstellationParticles({ count = 15000 } = {}) {
  const group = new THREE.Group();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const colorA = new THREE.Color(0x00f0ff);
  const colorB = new THREE.Color(0xff00a0);

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    const radius = 4 + Math.random() * 18;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.58;
    positions[i3 + 2] = radius * Math.cos(phi);
    velocities[i3] = (Math.random() - 0.5) * 0.003;
    velocities[i3 + 1] = (Math.random() - 0.5) * 0.003;
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.003;
    const color = colorA.clone().lerp(colorB, Math.random());
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.028,
    vertexColors: true,
    transparent: true,
    opacity: 0.82,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const points = new THREE.Points(geometry, material);
  group.add(points);

  const linePositions = new Float32Array(300 * 6);
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
  const lines = new THREE.LineSegments(
    lineGeometry,
    new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.08 })
  );
  group.add(lines);

  let burstPower = 0;

  return {
    group,
    burst() {
      burstPower = 1;
    },
    update(elapsed, pointer, performanceMode = false) {
      const position = geometry.attributes.position;
      const stride = performanceMode ? 4 : 1;
      for (let i = 0; i < count; i += stride) {
        const i3 = i * 3;
        positions[i3] += velocities[i3] + pointer.x * 0.0009 + burstPower * (positions[i3] > 0 ? 0.015 : -0.015);
        positions[i3 + 1] += velocities[i3 + 1] + pointer.y * 0.0009;
        positions[i3 + 2] += Math.sin(elapsed + i * 0.013) * 0.0008;
        if (Math.abs(positions[i3]) > 22) positions[i3] *= -0.82;
        if (Math.abs(positions[i3 + 1]) > 10) positions[i3 + 1] *= -0.82;
      }
      burstPower *= 0.92;
      position.needsUpdate = true;

      const particlePositions = geometry.attributes.position.array;
      for (let i = 0; i < 300; i += 1) {
        const src = ((i * 37) % count) * 3;
        const dst = i * 6;
        linePositions[dst] = particlePositions[src];
        linePositions[dst + 1] = particlePositions[src + 1];
        linePositions[dst + 2] = particlePositions[src + 2];
        const next = (((i * 37) + 3) % count) * 3;
        linePositions[dst + 3] = particlePositions[next];
        linePositions[dst + 4] = particlePositions[next + 1];
        linePositions[dst + 5] = particlePositions[next + 2];
      }
      lineGeometry.attributes.position.needsUpdate = true;
      group.rotation.y = elapsed * 0.015;
    }
  };
}
