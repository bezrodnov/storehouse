// @flow
import * as THREE from 'three';
import ThreeEnvironment from './threeEnvironment';

const Storehouse = {
  crates: [],
};

const loadStorehouse = () => {
  Storehouse.crates = new Array(36).fill(0).map((el, index) => ({
    x: (index % 6) - 3,
    y: 0,
    z: Math.floor(index / 6) - 12,
  }));

  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  Storehouse.crates.forEach(crate => {
    const geometry = new THREE.BoxBufferGeometry(boxWidth, boxHeight, boxDepth);

    const texture = new THREE.TextureLoader().load('assets/crate.jpg');
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.x = crate.x;
    cube.position.y = crate.y;
    cube.position.z = crate.z;

    ThreeEnvironment.scene.add(cube);
  });
};

const animate = () => {
  requestAnimationFrame(animate);

  const delta = ThreeEnvironment.clock.getDelta() * 0.5;

  // camera.position.x += delta;

  ThreeEnvironment.render();
};

loadStorehouse();
animate();
