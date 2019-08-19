// @flow

import * as THREE from 'three';
import { body, getElementById } from './domUtils.js';
import { GUI } from 'dat.gui';

import FirstPersonControls from './three/FirstPersonControls';
import OrbitControls from './three/OrbitControls';
import PointerLockControls from './three/PointerLockControls';

const getAspect = (): number => window.innerWidth / window.innerHeight;

class ThreeEnvironment {
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  clock: THREE.Clock;
  renderer: THREE.WebGLRenderer;
  light: THREE.SpotLight;

  lightHelper: THREE.SpotLightHelper;
  shadowCameraHelper: THREE.shadowCameraHelper;

  controls: PointerLockControls;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(75, getAspect(), 0.1, 2000);
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();

    this.setupRenderer();
    this.setupLight();
    this.setupPointerLockControlsControls();
    this.setupGUI();
    
    this.setupResizeHandler();
  }

  setupLight(): void {
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

  setupPointerLockControlsControls(): void {
    this.controls = new PointerLockControls(this.camera);

    const blocker:HTMLElement = getElementById('blocker');
		const instructions:HTMLElement = getElementById('instructions');
    
    instructions.addEventListener('click', () => {
      this.controls.lock();
    }, false);
    
    this.controls.addEventListener('lock', () => {
      instructions.style.display = 'none';
      blocker.style.display = 'none';
    });

    this.controls.addEventListener('unlock', () => {
      blocker.style.display = 'block';
      instructions.style.display = '';
    });

    this.scene.add(this.controls.getObject());

    let moveForward:boolean = false;
    let moveBackward:boolean = false;
    let moveLeft:boolean = false;
    let moveRight:boolean = false;

    const velocity:THREE.Vector3 = new THREE.Vector3();
    const direction:THREE.Vector3 = new THREE.Vector3();

    this.controls.update = () => {
      if (this.controls.isLocked === true ) {
        const delta: number = this.clock.getDelta() * 500;
        velocity.x -= velocity.x * 20.0 * delta;
        velocity.z -= velocity.z * 20.0 * delta;
        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveLeft) - Number(moveRight);
        direction.normalize(); // this ensures consistent movements in all directions
        
        if (moveForward || moveBackward) {
          velocity.z -= direction.z * 400.0 * delta;
        }
        
        if (moveLeft || moveRight) {
          velocity.x -= direction.x * 400.0 * delta;
        }

        this.controls.getObject().translateX(velocity.x * delta);
        this.controls.getObject().translateZ(velocity.z * delta);
      }
    };

    document.addEventListener('keydown', (event:KeyboardEvent) => {
      switch (event.key) {
        case "ArrowUp":
        case "w":
          moveForward = true;
          break;
        case "ArrowLeft":
        case "a":
          moveLeft = true;
          break;
        case "ArrowDown":
        case "s":
          moveBackward = true;
          break;
        case "ArrowRight":
        case "d":
          moveRight = true;
          break;
      }
    }, false);

    document.addEventListener('keyup', (event:KeyboardEvent) => {
      switch (event.key) {
        case "ArrowUp":
        case "w":
          moveForward = false;
          break;
        case "ArrowLeft":
        case "a":
          moveLeft = false;
          break;
        case "ArrowDown":
        case "s":
          moveBackward = false;
          break;
        case "ArrowRight":
        case "d":
          moveRight = false;
          break;
      }
    }, false);
  }

  setupFirstPersonControls() {
    this.controls = new FirstPersonControls(this.camera);
    this.controls.movementSpeed = 1000;
    this.controls.lookSpeed = 30;
    this.controls.lookVertical = true;
  }

  setupOrbitControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.camera.position.set(0, 5, -20);
    this.controls.update();
  }

  setupRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.gammaOutput = true;
    this.renderer.gammaFactor = 2.2;
    body.appendChild(this.renderer.domElement);
  }

  setupGUI(): void {
    const spotLight:THREE.SpotLight = this.light;
    const render:function = this.render;

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
  }

  render(): void {
    this.lightHelper.update();
    this.shadowCameraHelper.update();
    this.controls.update(this.clock.getDelta());
    this.renderer.render(this.scene, this.camera);
  }

  setupResizeHandler() {
    window.addEventListener('resize', () => {
      this.camera.aspect = getAspect();
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.controls.handleResize();
    }, false);
  }
}

export default new ThreeEnvironment();
