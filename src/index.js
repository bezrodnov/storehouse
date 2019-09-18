// @flow
import * as THREE from 'three';
import ThreeEnvironment from './threeEnvironment';

const Storehouse = {
  crates: [],
};

const DISTANCE_BETWEEN_LINES = 2;
const DISTANCE_BETWEEN_AISLES = 4;

const loadStorehouse = (
  aisles: Array<string>,
  linesPerAisle: number,
  rowsPerShelve: number,
  columnsPerShelve: number
): void => {
  {
    Storehouse.crates = [];

    let z = 0;
    aisles.forEach((aisle: string) => {
      for (let lineIndex = 0; lineIndex < linesPerAisle; lineIndex++) {
        for (let shelveRowIndex = 0; shelveRowIndex < rowsPerShelve; shelveRowIndex++) {
          for (let shelveColumnIndex = 0; shelveColumnIndex < columnsPerShelve; shelveColumnIndex++) {
            Storehouse.crates.push({
              x: shelveRowIndex + lineIndex * (rowsPerShelve + DISTANCE_BETWEEN_LINES),
              y: shelveColumnIndex,
              z,
            });
          }
        }

        // add spot lights
        const lightX = rowsPerShelve / 2 + lineIndex * (rowsPerShelve + DISTANCE_BETWEEN_LINES);
        const lightY = 2 * columnsPerShelve;
        const lightZ = z + DISTANCE_BETWEEN_AISLES / 2;
        ThreeEnvironment.addLight(lightX, lightY, lightZ, lightX, 0, lightZ);
      }

      z += DISTANCE_BETWEEN_AISLES;

      for (let lineIndex = 0; lineIndex < linesPerAisle; lineIndex++) {
        for (let shelveRowIndex = 0; shelveRowIndex < rowsPerShelve; shelveRowIndex++) {
          for (let shelveColumnIndex = 0; shelveColumnIndex < columnsPerShelve; shelveColumnIndex++) {
            Storehouse.crates.push({
              x: shelveRowIndex + lineIndex * (rowsPerShelve + DISTANCE_BETWEEN_LINES),
              y: shelveColumnIndex,
              z,
            });
          }
        }
      }

      z++;
    });

    const cameraX = (linesPerAisle / 2) * (DISTANCE_BETWEEN_LINES + rowsPerShelve);
    const cameraY = columnsPerShelve * 1.5 + aisles.length * 3;
    const cameraZ = (aisles.length * (2 + DISTANCE_BETWEEN_AISLES)) / 2;
    ThreeEnvironment.camera.position.set(cameraX, cameraY, cameraZ);
    ThreeEnvironment.controls.target.set(cameraX, 0, cameraZ);
    //ThreeEnvironment.camera.lookAt(cameraX, 0, cameraZ);
  }

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

loadStorehouse(['A1', 'A2', 'A3', 'B1', 'B2', 'B3'], 3, 10, 4);
