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

  {
    const geometry = new THREE.PlaneBufferGeometry(2000, 2000);
    const material = new THREE.MeshPhongMaterial({ color: 0x808080, dithering: true });
    const floor = new THREE.Mesh(geometry, material);
    floor.receiveShadow = true;
    floor.rotation.x = -Math.PI * 0.5;
    floor.position.set(0, -0.5, 0);
    ThreeEnvironment.scene.add(floor);
  }

  {
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    Storehouse.crates.forEach(crate => {
      const geometry = new THREE.BoxBufferGeometry(boxWidth, boxHeight, boxDepth);

      const texture = new THREE.TextureLoader().load('assets/crate.jpg');
      const material = new THREE.MeshPhongMaterial({ map: texture });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(crate.x, crate.y, crate.z);
      cube.castShadow = true;

      ThreeEnvironment.scene.add(cube);
    });
  }
};

const animate = () => {
  requestAnimationFrame(animate);

  ThreeEnvironment.controls.update();

  const delta = ThreeEnvironment.clock.getDelta() * 0.5;

  // camera.position.x += delta;

  ThreeEnvironment.render();
};

loadStorehouse();
animate();
