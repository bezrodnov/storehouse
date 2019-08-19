// @flow

import * as THREE from 'three';
import { body } from './domUtils.js';
import { GUI } from 'dat.gui';
import OrbitControls from './three/OrbitControls';

const getAspect = (): number => window.innerWidth / window.innerHeight;

class ThreeEnvironment {
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  clock: THREE.Clock;
  renderer: THREE.WebGLRenderer;
  light: THREE.SpotLight;

  lightHelper: THREE.SpotLightHelper;
  shadowCameraHelper: THREE.shadowCameraHelper;

  controls: OrbitControls;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(75, getAspect(), 0.1, 2000);

    this.scene = new THREE.Scene();

    this.clock = new THREE.Clock();

    {
      this.light = new THREE.SpotLight(0xeded88, 1);
      this.light.position.set(0, 10, -10);
      this.light.penumbra = 0.4;
      this.light.decay = 1.5;
      this.light.distance = 20;

      this.light.castShadow = true;
      this.light.shadow.mapSize.width = 1024;
      this.light.shadow.mapSize.height = 1024;
      this.light.shadow.camera.near = 10;
      this.light.shadow.camera.far = 200;

      this.light.target.position.set(0, -20, 0);

      this.scene.add(this.light);
      this.scene.add(this.light.target);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.05);
      this.scene.add(ambientLight);

      this.lightHelper = new THREE.SpotLightHelper(this.light);
      this.scene.add(this.lightHelper);

      this.shadowCameraHelper = new THREE.CameraHelper(this.light.shadow.camera);
      this.scene.add(this.shadowCameraHelper);
    }

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.gammaOutput = true;
    this.renderer.gammaFactor = 2.2;
    body.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.camera.position.set(0, 5, -20);
    this.controls.update();

    window.addEventListener('resize', this.onResize.bind(this), false);
    buildGui({
      render: this.render.bind(this),
      spotLight: this.light,
    });
  }

  render(): void {
    this.lightHelper.update();
    this.shadowCameraHelper.update();
    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    this.camera.aspect = getAspect();
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

const buildGui = ({ render, spotLight }) => {
  const gui = new GUI();
  const params = {
    'light color': spotLight.color.getHex(),
    intensity: spotLight.intensity,
    distance: spotLight.distance,
    angle: spotLight.angle,
    penumbra: spotLight.penumbra,
    decay: spotLight.decay,
  };
  gui.addColor(params, 'light color').onChange(val => {
    spotLight.color.setHex(val);
    render();
  });
  gui.add(params, 'intensity', 0, 2).onChange(val => {
    spotLight.intensity = val;
    render();
  });
  gui.add(params, 'distance', 10, 100).onChange(val => {
    spotLight.distance = val;
    render();
  });
  gui.add(params, 'angle', 0, Math.PI / 3).onChange(val => {
    spotLight.angle = val;
    render();
  });
  gui.add(params, 'penumbra', 0, 1).onChange(val => {
    spotLight.penumbra = val;
    render();
  });
  gui.add(params, 'decay', 1, 2).onChange(val => {
    spotLight.decay = val;
    render();
  });
  gui.open();
};

export default new ThreeEnvironment();
