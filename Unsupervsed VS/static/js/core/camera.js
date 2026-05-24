import * as THREE from "three";

export function createCamera() {
  const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 160);
  camera.position.set(0, 0.8, 18);
  return camera;
}

export function flyInCamera(camera, reducedMotion = false) {
  if (reducedMotion || !window.gsap) {
    camera.position.set(0, 0.4, 8.5);
    return;
  }
  window.gsap.to(camera.position, {
    z: 8.5,
    y: 0.4,
    duration: 2,
    ease: "power3.out"
  });
}
