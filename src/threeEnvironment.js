// @flow

import * as THREE from 'three';
import { body } from './domUtils.js';

const getAspect = (): number => window.innerWidth / window.innerHeight;

class ThreeEnvironment {
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  clock: THREE.Clock;
  renderer: THREE.WebGLRenderer;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(75, getAspect(), 0.1, 1000);
    this.camera.position.y = 5;
    this.camera.position.z = 2;

    this.scene = new THREE.Scene();

    this.clock = new THREE.Clock();

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.gammaOutput = true;
    this.renderer.gammaFactor = 2.2;
    body.appendChild(this.renderer.domElement);

    // const keyboard: {
    //   down: ?boolean,
    //   up: ?boolean,
    //   left: ?boolean,
    //   right: ?boolean,
    //   zoomIn: ?boolean,
    //   zoomOut: ?boolean,
    // } = {};
    // this.keyboard = keyboard;

    window.addEventListener('resize', this.onResize.bind(this), false);
    window.addEventListener('keydown', this.onKeyDown.bind(this), false);
    window.addEventListener('wheel', this.onWheel.bind(this), false);
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  onKeyDown(e: SyntheticKeyboardEvent<HTMLElement>): void {
    switch (e.key) {
      case 'ArrowDown':
      case 's':
        this.camera.position.z += 0.2;
        break;

      case 'ArrowUp':
      case 'w':
        this.camera.position.z -= 0.2;
        break;

      case 'ArrowLeft':
      case 'a':
        this.camera.position.x -= 0.2;
        if (this.camera.position.x < -10) {
          this.camera.position.x = -10;
        }
        break;

      case 'ArrowRight':
      case 'd':
        this.camera.position.x += 0.2;
        if (this.camera.position.x > 10) {
          this.camera.position.x = 10;
        }
        break;

      case 'q':
        this.camera.rotation.y -= 0.02;
        break;
      case 'e':
        this.camera.rotation.y += 0.02;
        break;
    }
  }

  onWheel(e: SyntheticWheelEvent<HTMLElement>): void {
    this.camera.position.z += Math.sign(e.deltaY) * 0.2;
  }

  onResize() {
    this.camera.aspect = getAspect();
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

export default new ThreeEnvironment();
